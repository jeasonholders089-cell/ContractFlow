"""
Pydantic 数据模型
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


class SeverityLevel(str, Enum):
    """风险等级"""
    HIGH = "高"
    MEDIUM = "中"
    LOW = "低"


class IssueInfo(BaseModel):
    """问题信息"""
    category: str = Field(..., description="问题类别")
    severity: SeverityLevel = Field(..., description="风险等级")
    location_hint: str = Field(..., description="位置提示")
    original_text: str = Field(..., description="原始文本片段")
    problem: str = Field(..., description="问题描述")
    suggestion: str = Field(..., description="修改建议")


class ReviewResult(BaseModel):
    """审核结果"""
    issues: List[IssueInfo] = Field(default_factory=list, description="问题列表")
    summary: str = Field(..., description="审核摘要")
    total_issues: int = Field(default=0, description="问题总数")
    high_risk_count: int = Field(default=0, description="高风险数量")
    medium_risk_count: int = Field(default=0, description="中风险数量")
    low_risk_count: int = Field(default=0, description="低风险数量")


class ContractCreate(BaseModel):
    """创建合同请求"""
    title: str = Field(..., description="合同标题")
    original_filename: str = Field(..., description="原始文件名")


class ContractResponse(BaseModel):
    """合同响应"""
    id: str
    title: str
    original_filename: Optional[str] = None
    status: str
    source: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    """创建审查请求"""
    contract_id: Optional[str] = None  # 从现有合同审查


class ReviewResponse(BaseModel):
    """审查响应"""
    id: str
    contract_id: str
    status: str
    result: Optional[ReviewResult] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    """上传响应"""
    success: bool
    message: str
    contract_id: Optional[str] = None
