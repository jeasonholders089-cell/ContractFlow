"""
审查相关的数据模型
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from backend.database import Base


def generate_id():
    """生成唯一 ID"""
    return str(uuid.uuid4())


class Contract(Base):
    """合同表"""
    __tablename__ = "contracts"

    id = Column(String(36), primary_key=True, default=generate_id)
    user_id = Column(String(36), nullable=False, default="default_user")
    title = Column(String(255), nullable=False)
    original_filename = Column(String(255))
    file_path = Column(String(500))
    content_text = Column(Text)  # 提取的文本内容
    status = Column(String(20), default="pending")  # pending, reviewing, completed
    source = Column(String(20))  # upload, from_contract

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联审查记录
    review_records = relationship("ReviewRecord", back_populates="contract", cascade="all, delete-orphan")


class ReviewRecord(Base):
    """审查记录表"""
    __tablename__ = "review_records"

    id = Column(String(36), primary_key=True, default=generate_id)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    user_id = Column(String(36), nullable=False, default="default_user")

    # 审查结果
    issues = Column(JSON, nullable=False, default=list)
    summary = Column(String(500))
    high_risk_count = Column(Integer, default=0)
    medium_risk_count = Column(Integer, default=0)
    low_risk_count = Column(Integer, default=0)

    # 文件路径
    reviewed_file_path = Column(String(500))  # 带批注的文件
    report_path = Column(String(500))  # 审查报告

    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text)  # 错误信息

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # 关联合同
    contract = relationship("Contract", back_populates="review_records")
