"""
Prompt 模板
"""

# 合同审核主 Prompt
CONTRACT_REVIEW_PROMPT = """你是一位专业的合同审核专家。请仔细审核以下合同内容，识别可能存在的法律风险。

审核要点：
1. 违约金是否过高或约定不明确
2. 免责条款是否显失公平
3. 争议解决方式是否缺失或不合理
4. 保密条款是否完善
5. 知识产权条款是否明确
6. 合同解除条件是否清晰
7. 支付条款是否明确
8. 其他可能的法律风险

输出格式要求（严格按照 JSON 格式）：
{{
  "issues": [
    {{
      "category": "违约金",
      "severity": "高",
      "location_hint": "第3条第2款",
      "original_text": "违约金比例为30%",
      "problem": "违约金过高，可能被法院认定为过分高于实际损失",
      "suggestion": "建议调整为20%以内，或明确约定损失计算方式"
    }}
  ],
  "summary": "共发现 X 个风险点，其中高风险 Y 个，中风险 Z 个"
}}

合同内容：
{contract_text}
"""

# 分段审核 Prompt
SECTION_REVIEW_PROMPT = """你是一位专业的合同审核专家。这是合同的 {section_num}/{total_sections} 部分，请审核以下内容。

输出格式要求（严格按照 JSON 格式）：
{{
  "issues": [
    {{
      "category": "问题类别",
      "severity": "高/中/低",
      "location_hint": "位置提示（如：第X条第Y款）",
      "original_text": "原文片段",
      "problem": "问题描述",
      "suggestion": "修改建议"
    }}
  ],
  "summary": "本部分发现 X 个风险点"
}}

合同内容：
{contract_text}
"""

# 重试时的强化提示
RETRY_ENFORCEMENT = """

重要提醒：请严格按照 JSON 格式输出，不要包含任何其他文字说明或标记。JSON 必须完全符合上述格式要求。"""


def build_contract_review_prompt(contract_text: str) -> str:
    """构建合同审核 Prompt"""
    return CONTRACT_REVIEW_PROMPT.format(contract_text=contract_text)


def build_section_review_prompt(contract_text: str, section_num: int, total: int) -> str:
    """构建分段审核 Prompt"""
    return SECTION_REVIEW_PROMPT.format(
        contract_text=contract_text,
        section_num=section_num,
        total=total
    )


def build_retry_prompt(original_prompt: str) -> str:
    """构建重试 Prompt（强化格式要求）"""
    return original_prompt + RETRY_ENFORCEMENT
