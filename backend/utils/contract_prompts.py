"""
合同撰写相关的 Prompt 模板
"""

# 需求分析 Prompt
REQUIREMENT_ANALYSIS_PROMPT = """你是一位专业的合同法律顾问。请分析用户的合同需求，提取关键信息。

用户需求：
{user_requirement}

请分析并输出以下信息（JSON格式）：
{{
  "contract_type": "合同类型（如：劳动合同、采购合同、服务合同、租赁合同、自定义等）",
  "contract_title": "建议的合同标题",
  "key_elements": {{
    "party_a": "甲方信息（如有）",
    "party_b": "乙方信息（如有）",
    "subject": "合同标的",
    "amount": "金额（如有）",
    "duration": "期限（如有）",
    "other_elements": {{"其他关键要素"}}
  }},
  "special_requirements": ["用户的特殊要求"],
  "suggested_clauses": ["建议包含的条款类型"]
}}
"""

# 合同生成 Prompt
CONTRACT_GENERATION_PROMPT = """你是一位资深的合同起草专家，精通中国合同法和各类商业合同。请根据以下信息生成一份专业、完整、合法的合同文档。

用户需求：
{user_requirement}

合同类型：{contract_type}

关键要素：
{elements}

{template_context}

要求：
1. 使用专业、规范的法律语言
2. 结构清晰，条款完整，逻辑严密
3. 包含所有必要的法律条款：
   - 合同双方信息
   - 合同标的和范围
   - 权利义务
   - 价款和支付方式
   - 履行期限和地点
   - 违约责任
   - 争议解决方式
   - 其他必要条款
4. 符合《中华人民共和国民法典》及相关法律法规
5. 格式规范，便于阅读和签署
6. 根据用户的特殊要求进行定制

请生成完整的合同内容，包括：
- 合同标题
- 合同编号（如需要）
- 甲乙双方完整信息
- 鉴于条款（如适用）
- 正文（分条款，每条可包含多款）
- 附则
- 签署栏

输出格式：纯文本，使用标准合同格式，条款编号清晰。
"""

# 合同优化 Prompt
CONTRACT_REFINEMENT_PROMPT = """你是一位合同修改专家。请根据用户的反馈，对合同的特定部分进行优化。

当前合同内容：
{current_content}

用户反馈：
{user_feedback}

要求：
1. 理解用户的修改意图
2. 只修改用户提到的部分
3. 保持其他部分不变
4. 确保修改后的内容与整体合同协调一致
5. 保持专业的法律语言
6. 如果用户的要求可能导致法律风险，给出警告建议

请输出修改后的完整合同内容。
"""

# 条款推荐 Prompt
CLAUSE_SUGGESTION_PROMPT = """你是一位合同法律顾问。请为以下合同推荐必要的或有益的条款。

合同类型：{contract_type}

当前合同内容：
{current_content}

合同要素：
{elements}

请分析当前合同，推荐以下内容（JSON格式）：
{{
  "missing_required_clauses": [
    {{
      "title": "条款标题",
      "category": "条款类别",
      "importance": "必需/重要/建议",
      "reason": "为什么需要这个条款",
      "content": "建议的条款内容",
      "legal_basis": "法律依据（如有）"
    }}
  ],
  "risk_warnings": [
    {{
      "issue": "潜在风险",
      "severity": "高/中/低",
      "suggestion": "建议"
    }}
  ],
  "optimization_suggestions": [
    "整体优化建议"
  ]
}}
"""

# 重试强化提示
RETRY_ENFORCEMENT = """

重要提醒：请严格按照 JSON 格式输出，不要包含任何其他文字说明或标记。JSON 必须完全符合上述格式要求。"""


# ============ Prompt 构建函数 ============

def build_requirement_analysis_prompt(user_requirement: str) -> str:
    """构建需求分析 Prompt"""
    return REQUIREMENT_ANALYSIS_PROMPT.format(user_requirement=user_requirement)


def build_contract_generation_prompt(
    user_requirement: str,
    contract_type: str,
    elements: str,
    template_context: str = ""
) -> str:
    """构建合同生成 Prompt"""
    return CONTRACT_GENERATION_PROMPT.format(
        user_requirement=user_requirement,
        contract_type=contract_type,
        elements=elements,
        template_context=template_context
    )


def build_contract_refinement_prompt(current_content: str, user_feedback: str) -> str:
    """构建合同优化 Prompt"""
    return CONTRACT_REFINEMENT_PROMPT.format(
        current_content=current_content,
        user_feedback=user_feedback
    )


def build_clause_suggestion_prompt(
    contract_type: str,
    current_content: str,
    elements: str
) -> str:
    """构建条款推荐 Prompt"""
    return CLAUSE_SUGGESTION_PROMPT.format(
        contract_type=contract_type,
        current_content=current_content,
        elements=elements
    )


def build_retry_prompt(original_prompt: str) -> str:
    """构建重试 Prompt（强化格式要求）"""
    return original_prompt + RETRY_ENFORCEMENT

