"""
位置匹配模块
"""
from difflib import SequenceMatcher
from typing import Optional, List, Dict, Any


class LocationMatcher:
    """位置匹配器"""

    def __init__(self, parsed_doc: Dict[str, Any]):
        self.parsed_doc = parsed_doc
        self.paragraphs = parsed_doc["paragraphs"]
        self.structure = parsed_doc.get("structure", {})

    def locate_issue(self, issue: Dict) -> Optional[Dict]:
        """
        定位问题在文档中的位置

        Returns:
            {
                "type": "paragraph",
                "index": int,
                "text": str,
                "confidence": float
            }
        """
        original_text = issue.get("original_text", "").strip()
        location_hint = issue.get("location_hint", "")

        if not original_text:
            return None

        # 1. 精确匹配
        result = self._exact_match(original_text, location_hint)
        if result:
            return result

        # 2. 模糊匹配
        result = self._fuzzy_match(original_text, location_hint)
        if result:
            return result

        # 3. 未定位成功
        return None

    def _exact_match(self, text: str, location_hint: str) -> Optional[Dict]:
        """精确匹配"""
        # 先在指定范围内搜索
        search_range = self._get_search_range(location_hint)

        for para_info in search_range:
            if text in para_info["text"]:
                return {
                    "type": "paragraph",
                    "index": para_info["index"],
                    "text": para_info["text"],
                    "confidence": 1.0
                }

        # 全文搜索
        for para_info in self.paragraphs:
            if text in para_info["text"]:
                return {
                    "type": "paragraph",
                    "index": para_info["index"],
                    "text": para_info["text"],
                    "confidence": 1.0
                }

        return None

    def _fuzzy_match(self, text: str, location_hint: str) -> Optional[Dict]:
        """模糊匹配"""
        threshold = 0.7
        best_match = None
        best_similarity = 0

        # 在指定范围内搜索
        search_range = self._get_search_range(location_hint)

        for para_info in search_range:
            similarity = self._calculate_similarity(text, para_info["text"])
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = para_info

        if best_match and best_similarity >= threshold:
            return {
                "type": "paragraph",
                "index": best_match["index"],
                "text": best_match["text"],
                "confidence": best_similarity
            }

        return None

    def _get_search_range(self, location_hint: str) -> List[Dict]:
        """根据位置提示获取搜索范围"""
        if not location_hint:
            return self.paragraphs

        # 解析位置提示，如 "第3条" 或 "第3条第2款"
        import re

        # 匹配 "第X条"
        match = re.search(r'第([一二三四五六七八九十百\d]+)条', location_hint)
        if match:
            section_num = self._chinese_number_to_int(match.group(1))
            return self._get_section_paragraphs(section_num)

        # 无法解析，返回全部
        return self.paragraphs

    def _get_section_paragraphs(self, section_num: int) -> List[Dict]:
        """获取指定章节的段落"""
        sections = self.structure.get("sections", [])

        for i, section in enumerate(sections):
            if section["number"] == section_num:
                start = section["start_index"]
                # 获取到下一章节开始之前的所有段落
                if i + 1 < len(sections):
                    end = sections[i + 1]["start_index"]
                else:
                    end = len(self.paragraphs)
                return self.paragraphs[start:end]

        # 未找到章节，返回全部
        return self.paragraphs

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """计算文本相似度"""
        return SequenceMatcher(None, text1, text2).ratio()

    def _chinese_number_to_int(self, num_str: str) -> int:
        """转换中文数字"""
        chinese_nums = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
            '百': 100
        }

        # 阿拉伯数字直接转换
        if num_str.isdigit():
            return int(num_str)

        # 简单中文数字转换
        if num_str in chinese_nums:
            return chinese_nums[num_str]

        # 复杂中文数字（如"十二"）
        if len(num_str) == 2 and num_str[0] == '十':
            return 10 + chinese_nums.get(num_str[1], 0)

        return 1
