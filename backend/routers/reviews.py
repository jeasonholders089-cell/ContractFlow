"""
审查相关路由
"""
import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import os

logger = logging.getLogger(__name__)

from backend.database import get_db
from backend.models.review import Contract, ReviewRecord
from backend.schemas.review import (
    ContractCreate, ContractResponse, ReviewResponse,
    ReviewCreate, UploadResponse
)
from backend.services.review_service import AIReviewer
from backend.utils.file_utils import FileManager
from backend.utils.document_parser import DocumentParser
from backend.utils.location_matcher import LocationMatcher
from backend.utils.comment_generator import CommentGenerator
from backend.config import get_settings

router = APIRouter(prefix="/api/reviews", tags=["审查"])
settings = get_settings()
file_manager = FileManager()


@router.post("/upload", response_model=UploadResponse)
async def upload_contract(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    上传合同文件进行审查

    Args:
        file: .docx 文件
        title: 合同标题（可选）
        db: 数据库会话

    Returns:
        上传响应
    """
    # 验证文件
    if not file.filename:
        raise HTTPException(status_code=400, detail="文件名不能为空")

    file_size = 0
    content = await file.read()
    file_size = len(content)

    # 验证文件格式和大小
    valid, error_msg = file_manager.validate_file(
        file.filename,
        file_size,
        settings.max_file_size,
        settings.allowed_extensions
    )

    if not valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # 保存文件
    file_path = await file_manager.save_upload_file(content, file.filename)

    # 解析文档内容
    parser = DocumentParser()
    parsed_doc = parser.parse_document(str(file_path))

    # 创建数据库记录
    contract = Contract(
        title=title or os.path.splitext(file.filename)[0],
        original_filename=file.filename,
        file_path=str(file_path),
        content_text=parsed_doc["full_text"],
        source="upload",
        status="pending"
    )

    db.add(contract)
    await db.commit()
    await db.refresh(contract)

    return UploadResponse(
        success=True,
        message="文件上传成功",
        contract_id=contract.id
    )


@router.post("/{contract_id}/start", response_model=ReviewResponse)
async def start_review(
    contract_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    开始审核合同

    Args:
        contract_id: 合同ID
        background_tasks: 后台任务
        db: 数据库会话

    Returns:
        审查响应
    """
    # 查询合同
    from sqlalchemy import select
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(status_code=404, detail="合同不存在")

    # 创建审查记录
    review = ReviewRecord(
        contract_id=contract_id,
        user_id=contract.user_id,
        status="processing"
    )

    db.add(review)
    await db.commit()
    await db.refresh(review)

    # 异步执行审核
    background_tasks.add_task(
        _process_review,
        contract.file_path,
        review.id,
        contract_id,
        db
    )

    return ReviewResponse(
        id=review.id,
        contract_id=contract_id,
        status="processing",
        created_at=review.created_at
    )


async def _process_review(
    file_path: str,
    review_id: str,
    contract_id: str,
    db: AsyncSession
):
    """
    处理审查任务（后台执行）

    Args:
        file_path: 文件路径
        review_id: 审查记录ID
        contract_id: 合同ID
        db: 数据库会话
    """
    from sqlalchemy import select, update
    from datetime import datetime

    try:
        logger.info(f"[Review {review_id}] 开始处理审查任务")

        # 创建 AI 审核器
        reviewer = AIReviewer()

        # 执行审核
        logger.info(f"[Review {review_id}] 调用AI审核服务")
        review_result = reviewer.review_contract(file_path)
        logger.info(f"[Review {review_id}] AI审核结果: success={review_result.get('success')}, "
                   f"issues={len(review_result.get('issues', []))}")

        if not review_result.get("success"):
            # 审核失败
            error_msg = review_result.get("error", "未知错误")
            logger.error(f"[Review {review_id}] 审核失败: {error_msg}")
            await db.execute(
                update(ReviewRecord)
                .where(ReviewRecord.id == review_id)
                .values(status="failed", error_message=error_msg)
            )
            await db.commit()
            return

        # 定位问题位置
        issues = review_result.get("issues", [])
        issues_with_location = reviewer.locate_issues(file_path, issues)

        # 生成带批注的文档
        comment_gen = CommentGenerator(file_path)
        added_count = comment_gen.add_issues_as_comments(issues_with_location)

        # 保存带批注的文档（直接保存到目标路径）
        reviewed_file_name = f"reviewed_{os.path.basename(file_path)}"
        reviewed_file_path = file_manager.get_storage_path(contract_id, reviewed_file_name)
        comment_gen.save(str(reviewed_file_path))

        # 生成审查报告
        report_text = comment_gen.create_review_report(
            issues,
            review_result.get("summary", "")
        )

        # 保存报告
        report_path = await file_manager.save_reviewed_file(
            contract_id,
            "review_report.txt",
            report_text.encode("utf-8")
        )

        # 更新审查记录
        await db.execute(
            update(ReviewRecord)
            .where(ReviewRecord.id == review_id)
            .values(
                status="completed",
                issues=issues,
                summary=review_result.get("summary", ""),
                high_risk_count=review_result.get("high_risk_count", 0),
                medium_risk_count=review_result.get("medium_risk_count", 0),
                low_risk_count=review_result.get("low_risk_count", 0),
                reviewed_file_path=str(reviewed_file_path),
                report_path=str(report_path),
                completed_at=datetime.utcnow()
            )
        )

        # 更新合同状态
        await db.execute(
            update(Contract)
            .where(Contract.id == contract_id)
            .values(status="completed")
        )

        await db.commit()

    except Exception as e:
        # 发生错误
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        logger.error(f"[Review {review_id}] 处理异常: {error_msg}")
        await db.execute(
            update(ReviewRecord)
            .where(ReviewRecord.id == review_id)
            .values(status="failed", error_message=str(e))
        )
        await db.commit()


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    获取审查结果

    Args:
        review_id: 审查ID
        db: 数据库会话

    Returns:
        审查响应
    """
    from sqlalchemy import select

    result = await db.execute(
        select(ReviewRecord).where(ReviewRecord.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="审查记录不存在")

    return ReviewResponse(
        id=review.id,
        contract_id=review.contract_id,
        status=review.status,
        result=None if review.status != "completed" else {
            "issues": review.issues,
            "summary": review.summary,
            "total_issues": len(review.issues),
            "high_risk_count": review.high_risk_count,
            "medium_risk_count": review.medium_risk_count,
            "low_risk_count": review.low_risk_count
        },
        error_message=review.error_message if review.status == "failed" else None,
        created_at=review.created_at,
        completed_at=review.completed_at
    )


@router.get("/{review_id}/download")
async def download_reviewed_file(
    review_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    下载带批注的文档

    Args:
        review_id: 审查ID
        db: 数据库会话

    Returns:
        文件响应
    """
    from fastapi.responses import FileResponse
    from sqlalchemy import select

    result = await db.execute(
        select(ReviewRecord).where(ReviewRecord.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="审查记录不存在")

    if review.status != "completed":
        raise HTTPException(status_code=400, detail="审查尚未完成")

    if not review.reviewed_file_path:
        raise HTTPException(status_code=404, detail="文件不存在")

    return FileResponse(
        review.reviewed_file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"reviewed_{os.path.basename(review.reviewed_file_path)}"
    )


@router.get("/{review_id}/report")
async def download_review_report(
    review_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    下载审查报告

    Args:
        review_id: 审查ID
        db: 数据库会话

    Returns:
        报告文件响应
    """
    from fastapi.responses import FileResponse
    from sqlalchemy import select

    result = await db.execute(
        select(ReviewRecord).where(ReviewRecord.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="审查记录不存在")

    if review.status != "completed":
        raise HTTPException(status_code=400, detail="审查尚未完成")

    if not review.report_path:
        raise HTTPException(status_code=404, detail="报告不存在")

    return FileResponse(
        review.report_path,
        media_type="text/plain",
        filename="review_report.txt"
    )


@router.get("/contracts", response_model=list[ContractResponse])
async def get_user_contracts(
    db: AsyncSession = Depends(get_db)
):
    """
    获取用户的所有合同

    Args:
        db: 数据库会话

    Returns:
        合同列表
    """
    from sqlalchemy import select

    result = await db.execute(
        select(Contract)
        .order_by(Contract.created_at.desc())
    )
    contracts = result.scalars().all()

    return [
        ContractResponse(
            id=c.id,
            title=c.title,
            original_filename=c.original_filename,
            status=c.status,
            source=c.source,
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in contracts
    ]


@router.get("/contracts/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    获取合同详情

    Args:
        contract_id: 合同ID
        db: 数据库会话

    Returns:
        合同详情
    """
    from sqlalchemy import select

    result = await db.execute(
        select(Contract).where(Contract.id == contract_id)
    )
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(status_code=404, detail="合同不存在")

    return ContractResponse(
        id=contract.id,
        title=contract.title,
        original_filename=contract.original_filename,
        status=contract.status,
        source=contract.source,
        created_at=contract.created_at,
        updated_at=contract.updated_at
    )
