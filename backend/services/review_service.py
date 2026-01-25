"""
AI 审核服务
"""
import json
from typing import Dict, List, Any
from openai import OpenAI
from backend.config import get_settings
from backend.utils.prompts import (
    build_contract_review_prompt,
    build_section_review_prompt,
    build_retry_prompt
)
from backend.utils.document_parser import DocumentParser
from backend.utils.location_matcher import LocationMatcher
from backend.schemas.review import ReviewResult, IssueInfo


class AIReviewer:
    """AI 审核器"""

    def __init__(self):
        settings = get_settings()
        self.client = OpenAI(
            api_key=settings.dashscope_api_key,
            base_url=settings.dashscope_base_url
        )
        self.model = settings.dashscope_model
        self.max_retries = settings.max_retries
        self.max_tokens = settings.max_tokens_per_section

        # 初始化文档解析器
        self.parser = DocumentParser()

    def review_contract(self, file_path: str) -> Dict[str, Any]:
        """
        审核合同（主入口）

        Args:
            file_path: 合同文件路径

        Returns:
            审核结果字典
        """
        # 1. 解析文档
        parsed_doc = self.parser.parse_document(file_path)

        # 2. 判断是否需要分段
        if self.parser.should_split(parsed_doc, self.max_tokens):
            # 分段审核
            sections = self.parser.split_by_sections(parsed_doc, self.max_tokens)
            return self._review_sections(sections)
        else:
            # 一次性审核
            return self._review_single(parsed_doc["full_text"])

    def _review_single(self, contract_text: str) -> Dict[str, Any]:
        """单次审核"""
        prompt = build_contract_review_prompt(contract_text)
        ai_result = self._call_ai_with_retry(prompt)

        if "error" in ai_result:
            return {
                "success": False,
                "error": ai_result.get("error"),
                "issues": [],
                "summary": "审核失败"
            }

        # 转换为标准格式
        return self._parse_ai_result(ai_result)

    def _review_sections(self, sections: List[Dict]) -> Dict[str, Any]:
        """分段审核"""
        all_issues = []

        for section in sections:
            prompt = build_section_review_prompt(
                section["text"],
                section["section_number"],
                len(sections)
            )
            ai_result = self._call_ai_with_retry(prompt)

            if "error" not in ai_result:
                issues = ai_result.get("issues", [])
                all_issues.extend(issues)

        # 合并结果
        return self._merge_issues(all_issues)

    def _call_ai_with_retry(self, prompt: str, retry_count: int = 0) -> Dict[str, Any]:
        """调用 AI 并带重试机制"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一位专业的合同审核专家。"},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )

            content = response.choices[0].message.content
            return json.loads(content)

        except json.JSONDecodeError as e:
            # JSON 解析失败，重试
            if retry_count < self.max_retries:
                enhanced_prompt = build_retry_prompt(prompt)
                return self._call_ai_with_retry(enhanced_prompt, retry_count + 1)

            # 重试用尽，返回错误信息
            return {
                "issues": [],
                "summary": "AI 响应解析失败",
                "error": str(e)
            }

        except Exception as e:
            # 其他错误
            return {
                "issues": [],
                "summary": f"AI 调用失败: {str(e)}",
                "error": str(e)
            }

    def _parse_ai_result(self, ai_result: Dict) -> Dict:
        """解析 AI 结果"""
        issues_data = ai_result.get("issues", [])

        issues = []
        high_count = 0
        medium_count = 0
        low_count = 0

        for issue_data in issues_data:
            try:
                issue = IssueInfo(**issue_data)
                issues.append(issue)

                if issue.severity == "高":
                    high_count += 1
                elif issue.severity == "中":
                    medium_count += 1
                else:
                    low_count += 1
            except Exception:
                # 跳过无效的问题数据
                continue

        return {
            "success": True,
            "issues": [issue.model_dump() for issue in issues],
            "summary": ai_result.get("summary", ""),
            "total_issues": len(issues),
            "high_risk_count": high_count,
            "medium_risk_count": medium_count,
            "low_risk_count": low_count
        }

    def _merge_issues(self, all_issues: List[Dict]) -> Dict:
        """合并多个段落的审核结果"""
        issues = []
        high_count = 0
        medium_count = 0
        low_count = 0

        for issue_data in all_issues:
            try:
                issue = IssueInfo(**issue_data)
                issues.append(issue)

                if issue.severity == "高":
                    high_count += 1
                elif issue.severity == "中":
                    medium_count += 1
                else:
                    low_count += 1
            except Exception:
                continue

        summary = (
            f"共发现 {len(issues)} 个风险点，"
            f"其中高风险 {high_count} 个，"
            f"中风险 {medium_count} 个，"
            f"低风险 {low_count} 个"
        )

        return {
            "success": True,
            "issues": [issue.model_dump() for issue in issues],
            "summary": summary,
            "total_issues": len(issues),
            "high_risk_count": high_count,
            "medium_risk_count": medium_count,
            "low_risk_count": low_count
        }

    def locate_issues(self, file_path: str, issues: List[Dict]) -> List[Dict]:
        """
        为问题定位位置

        Args:
            file_path: 文件路径
            issues: 问题列表

        Returns:
            带位置信息的问题列表
        """
        # 解析文档
        parsed_doc = self.parser.parse_document(file_path)

        # 创建位置匹配器
        matcher = LocationMatcher(parsed_doc)

        # 为每个问题定位
        issues_with_location = []
        for issue in issues:
            location = matcher.locate_issue(issue)
            issues_with_location.append({
                "issue": issue,
                "location": location,
                "located": location is not None
            })

        return issues_with_location
