"""
合同撰写服务
"""
import json
from typing import Dict, List, Any, Optional
from openai import OpenAI
from backend.config import get_settings
from backend.utils.contract_prompts import (
    build_requirement_analysis_prompt,
    build_contract_generation_prompt,
    build_contract_refinement_prompt,
    build_clause_suggestion_prompt,
    build_retry_prompt
)


class ContractGenerator:
    """合同生成器"""

    def __init__(self):
        settings = get_settings()
        self.client = OpenAI(
            api_key=settings.dashscope_api_key,
            base_url=settings.dashscope_base_url
        )
        self.model = settings.dashscope_model
        self.max_retries = settings.max_retries

    async def analyze_requirement(self, user_requirement: str) -> Dict[str, Any]:
        """
        分析用户需求，提取关键信息

        Args:
            user_requirement: 用户的自然语言需求描述

        Returns:
            需求分析结果字典
        """
        prompt = build_requirement_analysis_prompt(user_requirement)
        ai_result = self._call_ai_with_retry(prompt)

        if "error" in ai_result:
            return {
                "success": False,
                "error": ai_result.get("error"),
                "contract_type": "未知",
                "contract_title": "",
                "key_elements": {},
                "special_requirements": [],
                "suggested_clauses": []
            }

        # 返回分析结果
        return {
            "success": True,
            "contract_type": ai_result.get("contract_type", "自定义"),
            "contract_title": ai_result.get("contract_title", ""),
            "key_elements": ai_result.get("key_elements", {}),
            "special_requirements": ai_result.get("special_requirements", []),
            "suggested_clauses": ai_result.get("suggested_clauses", [])
        }

    async def generate_from_requirement(
        self,
        user_requirement: str,
        contract_type: str,
        elements: Dict[str, Any],
        template_context: str = ""
    ) -> Dict[str, Any]:
        """
        基于用户需求生成合同

        Args:
            user_requirement: 用户需求描述
            contract_type: 合同类型
            elements: 关键要素
            template_context: 模板上下文（可选）

        Returns:
            生成结果字典
        """
        # 将 elements 转换为字符串格式
        elements_str = json.dumps(elements, ensure_ascii=False, indent=2)

        prompt = build_contract_generation_prompt(
            user_requirement=user_requirement,
            contract_type=contract_type,
            elements=elements_str,
            template_context=template_context
        )

        # 对于合同生成，不使用 JSON 格式，直接返回文本
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一位资深的合同起草专家，精通中国合同法和各类商业合同。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
            )

            content = response.choices[0].message.content

            return {
                "success": True,
                "content": content
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"合同生成失败: {str(e)}",
                "content": ""
            }

    async def refine_contract(
        self,
        current_content: str,
        user_feedback: str
    ) -> Dict[str, Any]:
        """
        根据用户反馈优化合同

        Args:
            current_content: 当前合同内容
            user_feedback: 用户反馈

        Returns:
            优化结果字典
        """
        prompt = build_contract_refinement_prompt(current_content, user_feedback)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一位合同修改专家。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
            )

            content = response.choices[0].message.content

            return {
                "success": True,
                "content": content
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"合同优化失败: {str(e)}",
                "content": current_content  # 失败时返回原内容
            }

    async def suggest_clauses(
        self,
        contract_type: str,
        current_content: str,
        elements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        推荐条款

        Args:
            contract_type: 合同类型
            current_content: 当前合同内容
            elements: 合同要素

        Returns:
            推荐结果字典
        """
        elements_str = json.dumps(elements, ensure_ascii=False, indent=2)

        prompt = build_clause_suggestion_prompt(
            contract_type=contract_type,
            current_content=current_content,
            elements=elements_str
        )

        ai_result = self._call_ai_with_retry(prompt)

        if "error" in ai_result:
            return {
                "success": False,
                "error": ai_result.get("error"),
                "missing_required_clauses": [],
                "risk_warnings": [],
                "optimization_suggestions": []
            }

        return {
            "success": True,
            "missing_required_clauses": ai_result.get("missing_required_clauses", []),
            "risk_warnings": ai_result.get("risk_warnings", []),
            "optimization_suggestions": ai_result.get("optimization_suggestions", [])
        }

    def _call_ai_with_retry(self, prompt: str, retry_count: int = 0) -> Dict[str, Any]:
        """
        调用 AI 并带重试机制

        Args:
            prompt: 提示词
            retry_count: 当前重试次数

        Returns:
            AI 响应的 JSON 字典
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一位专业的合同法律顾问和合同起草专家。"},
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
                "error": f"AI 响应解析失败: {str(e)}"
            }

        except Exception as e:
            # 其他错误
            return {
                "error": f"AI 调用失败: {str(e)}"
            }
