"""
合同撰写相关的 Pydantic 数据模型
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ============ 模板相关 Schemas ============

class TemplateVariable(BaseModel):
    """模板变量定义"""
    name: str = Field(..., description="变量名")
    type: str = Field(..., description="变量类型（text/number/date等）")
    label: str = Field(..., description="显示标签")
    required: bool = Field(default=False, description="是否必填")
    default: Optional[str] = Field(None, description="默认值")


class ContractTemplateCreate(BaseModel):
    """创建合同模板请求"""
    name: str = Field(..., description="模板名称")
    category: Optional[str] = Field(None, description="模板类别")
    description: Optional[str] = Field(None, description="模板描述")
    template_content: str = Field(..., description="模板内容")
    variables: List[Dict[str, Any]] = Field(default_factory=list, description="变量定义")
    clauses: List[str] = Field(default_factory=list, description="条款库引用")


class ContractTemplateUpdate(BaseModel):
    """更新合同模板请求"""
    name: Optional[str] = Field(None, description="模板名称")
    category: Optional[str] = Field(None, description="模板类别")
    description: Optional[str] = Field(None, description="模板描述")
    template_content: Optional[str] = Field(None, description="模板内容")
    variables: Optional[List[Dict[str, Any]]] = Field(None, description="变量定义")
    clauses: Optional[List[str]] = Field(None, description="条款库引用")
    is_active: Optional[bool] = Field(None, description="是否启用")


class ContractTemplateResponse(BaseModel):
    """合同模板响应"""
    id: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    template_content: str
    variables: List[Dict[str, Any]]
    clauses: List[str]
    is_system: bool
    is_active: bool
    usage_count: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ 草稿相关 Schemas ============

class ContractDraftCreate(BaseModel):
    """创建合同草稿请求"""
    title: str = Field(..., description="合同标题")
    user_requirement: Optional[str] = Field(None, description="用户需求描述")
    template_id: Optional[str] = Field(None, description="使用的模板ID")


class ContractDraftUpdate(BaseModel):
    """更新合同草稿请求"""
    title: Optional[str] = Field(None, description="合同标题")
    final_content: Optional[str] = Field(None, description="用户编辑后的内容")


class ContractDraftResponse(BaseModel):
    """合同草稿响应"""
    id: str
    user_id: str
    template_id: Optional[str] = None
    title: str
    user_requirement: Optional[str] = None
    contract_type: Optional[str] = None
    elements: Dict[str, Any]
    generated_content: Optional[str] = None
    final_content: Optional[str] = None
    file_path: Optional[str] = None
    status: str
    generation_metadata: Dict[str, Any]
    version: int
    created_at: datetime
    updated_at: datetime
    finalized_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ 生成相关 Schemas ============

class GenerateRequest(BaseModel):
    """生成合同请求"""
    user_requirement: str = Field(..., description="用户需求描述")
    template_id: Optional[str] = Field(None, description="使用的模板ID")


class RegenerateRequest(BaseModel):
    """重新生成合同请求"""
    user_requirement: Optional[str] = Field(None, description="更新的需求描述")


class RefineRequest(BaseModel):
    """优化合同请求"""
    user_feedback: str = Field(..., description="用户反馈")


class GenerateResponse(BaseModel):
    """生成合同响应"""
    success: bool
    message: str
    draft_id: str
    contract_type: Optional[str] = None
    content: Optional[str] = None


# ============ 条款推荐 Schemas ============

class ClauseRecommendation(BaseModel):
    """条款推荐"""
    title: str = Field(..., description="条款标题")
    category: str = Field(..., description="条款类别")
    importance: str = Field(..., description="重要性（必需/重要/建议）")
    reason: str = Field(..., description="推荐理由")
    content: str = Field(..., description="建议的条款内容")
    legal_basis: Optional[str] = Field(None, description="法律依据")


class RiskWarning(BaseModel):
    """风险警告"""
    issue: str = Field(..., description="潜在风险")
    severity: str = Field(..., description="严重程度（高/中/低）")
    suggestion: str = Field(..., description="建议")


class SuggestClausesResponse(BaseModel):
    """推荐��款响应"""
    missing_required_clauses: List[ClauseRecommendation] = Field(default_factory=list)
    risk_warnings: List[RiskWarning] = Field(default_factory=list)
    optimization_suggestions: List[str] = Field(default_factory=list)


# ============ 条款库相关 Schemas ============

class ContractClauseCreate(BaseModel):
    """创建条款请求"""
    title: str = Field(..., description="条款标题")
    category: str = Field(..., description="条款类别")
    contract_type: Optional[str] = Field(None, description="适用的合同类型")
    content: str = Field(..., description="条款内容")
    variables: List[Dict[str, Any]] = Field(default_factory=list, description="条款变量")
    is_required: bool = Field(default=False, description="是否必需")
    risk_level: Optional[str] = Field(None, description="风险等级")
    compliance_notes: Optional[str] = Field(None, description="合规说明")


class ContractClauseUpdate(BaseModel):
    """更新条款请求"""
    title: Optional[str] = Field(None, description="条款标题")
    category: Optional[str] = Field(None, description="条款类别")
    contract_type: Optional[str] = Field(None, description="适用的合同类型")
    content: Optional[str] = Field(None, description="条款内容")
    variables: Optional[List[Dict[str, Any]]] = Field(None, description="条款变量")
    is_required: Optional[bool] = Field(None, description="是否必需")
    risk_level: Optional[str] = Field(None, description="风险等级")
    compliance_notes: Optional[str] = Field(None, description="合规说明")


class ContractClauseResponse(BaseModel):
    """条款响应"""
    id: str
    title: str
    category: str
    contract_type: Optional[str] = None
    content: str
    variables: List[Dict[str, Any]]
    is_required: bool
    risk_level: Optional[str] = None
    compliance_notes: Optional[str] = None
    usage_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ 需求分析结果 Schema ============

class RequirementAnalysisResult(BaseModel):
    """需求分析结果"""
    contract_type: str = Field(..., description="合同类型")
    contract_title: str = Field(..., description="建议的合同标题")
    key_elements: Dict[str, Any] = Field(..., description="关键要素")
    special_requirements: List[str] = Field(default_factory=list, description="特殊要求")
    suggested_clauses: List[str] = Field(default_factory=list, description="建议包含的条款类型")
