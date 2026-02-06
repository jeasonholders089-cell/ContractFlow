"""
合同撰写相关的数据模型
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base
from backend.models.review import generate_id


class ContractTemplate(Base):
    """合同模板表"""
    __tablename__ = "contract_templates"

    id = Column(String(36), primary_key=True, default=generate_id)
    name = Column(String(255), nullable=False)
    category = Column(String(50))  # labor, procurement, service, lease, general
    description = Column(Text)
    template_content = Column(Text, nullable=False)  # 模板内容（带占位符）
    variables = Column(JSON, default=list)  # 变量定义 [{name, type, label, required, default}]
    clauses = Column(JSON, default=list)  # 条款库引用
    is_system = Column(Boolean, default=False)  # 是否系统模板
    is_active = Column(Boolean, default=True)  # 是否启用
    usage_count = Column(Integer, default=0)  # 使用次数
    created_by = Column(String(36))  # 创建者ID（用于区分系统模板和用户模板）

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ContractDraft(Base):
    """合同草稿表"""
    __tablename__ = "contract_drafts"

    id = Column(String(36), primary_key=True, default=generate_id)
    user_id = Column(String(36), nullable=False, default="default_user")
    template_id = Column(String(36))  # 关联模板ID（可选）
    title = Column(String(255), nullable=False)
    user_requirement = Column(Text)  # 用户的自然语言需求描述
    contract_type = Column(String(50))  # AI识别的合同类型
    elements = Column(JSON, default=dict)  # 提取的合同要素（AI自动提取）
    generated_content = Column(Text)  # AI生成的内容
    final_content = Column(Text)  # 用户编辑后的内容
    file_path = Column(String(500))  # 生成的Word文档路径
    status = Column(String(20), default="draft")  # draft, generating, generated, editing, finalized, converted_to_review
    generation_metadata = Column(JSON, default=dict)  # 生成元数据（AI模型、参数等）
    version = Column(Integer, default=1)  # 版本号

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    finalized_at = Column(DateTime)  # 定稿时间


class ContractClause(Base):
    """合同条款库"""
    __tablename__ = "contract_clauses"

    id = Column(String(36), primary_key=True, default=generate_id)
    title = Column(String(255), nullable=False)
    category = Column(String(50))  # payment, liability, confidentiality, termination, etc.
    contract_type = Column(String(50))  # 适用的合同类型
    content = Column(Text, nullable=False)  # 条款内容
    variables = Column(JSON, default=list)  # 条款中的变量
    is_required = Column(Boolean, default=False)  # 是否必需
    risk_level = Column(String(20))  # high, medium, low
    compliance_notes = Column(Text)  # 合规说明
    usage_count = Column(Integer, default=0)  # 使用次数

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
