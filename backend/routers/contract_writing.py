"""
合同撰写相关路由
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional
from datetime import datetime
import os

logger = logging.getLogger(__name__)

from backend.database import get_db
from backend.models.contract_writing import ContractDraft, ContractTemplate, ContractClause
from backend.models.review import Contract, generate_id
from backend.schemas.contract_writing import (
    ContractDraftCreate,
    ContractDraftUpdate,
    ContractDraftResponse,
    ContractTemplateResponse,
    ContractClauseResponse,
    GenerateRequest,
    GenerateResponse,
    RegenerateRequest,
    RefineRequest,
    SuggestClausesResponse
)
from backend.services.contract_writing_service import ContractGenerator
from backend.utils.document_builder import create_contract_document
from backend.config import get_settings
import shutil

router = APIRouter(prefix="/api/writing", tags=["合同撰写"])
settings = get_settings()


# ============ 模板管理 API ============

@router.get("/templates", response_model=List[ContractTemplateResponse])
async def list_templates(
    category: Optional[str] = None,
    is_active: bool = True,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    获取模板列表

    Args:
        category: 模板类别筛选
        is_active: 是否只显示启用的模板
        skip: 跳过数量
        limit: 限制数量
        db: 数据库会话

    Returns:
        模板列表
    """
    # 构建查询
    query = select(ContractTemplate)

    if is_active:
        query = query.where(ContractTemplate.is_active == True)

    if category:
        query = query.where(ContractTemplate.category == category)

    query = query.order_by(ContractTemplate.usage_count.desc(), ContractTemplate.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    templates = result.scalars().all()

    return templates


@router.get("/templates/{template_id}", response_model=ContractTemplateResponse)
async def get_template(
    template_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    获取模板详情

    Args:
        template_id: 模板ID
        db: 数据库会话

    Returns:
        模板详情
    """
    result = await db.execute(
        select(ContractTemplate).where(ContractTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")

    return template


@router.get("/templates/{template_id}/preview")
async def preview_template(
    template_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    预览模板

    Args:
        template_id: 模板ID
        db: 数据库会话

    Returns:
        模板预览内容
    """
    result = await db.execute(
        select(ContractTemplate).where(ContractTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")

    # 返回模板内容和变量定义
    return {
        "template_id": template.id,
        "name": template.name,
        "category": template.category,
        "description": template.description,
        "content": template.template_content,
        "variables": template.variables,
        "preview_note": "请填写变量值以生成完整合同"
    }


# ============ 草稿管理 API ============

@router.post("/drafts", response_model=ContractDraftResponse)
async def create_draft(
    draft_data: ContractDraftCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    创建合同草稿

    Args:
        draft_data: 草稿创建数据
        db: 数据库会话

    Returns:
        草稿响应
    """
    # 创建草稿记录
    draft = ContractDraft(
        user_id="default_user",  # TODO: 从认证系统获取
        template_id=draft_data.template_id,
        title=draft_data.title,
        user_requirement=draft_data.user_requirement,
        status="draft"
    )

    db.add(draft)
    await db.commit()
    await db.refresh(draft)

    return draft


@router.get("/drafts", response_model=List[ContractDraftResponse])
async def list_drafts(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    获取草稿列表

    Args:
        skip: 跳过数量
        limit: 限制数量
        db: 数据库会话

    Returns:
        草稿列表
    """
    # 查询草稿列表（按创建时间倒序）
    result = await db.execute(
        select(ContractDraft)
        .where(ContractDraft.user_id == "default_user")  # TODO: 从认证系统获取
        .order_by(ContractDraft.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    drafts = result.scalars().all()

    return drafts


@router.get("/drafts/{draft_id}", response_model=ContractDraftResponse)
async def get_draft(
    draft_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    获取草稿详情

    Args:
        draft_id: 草稿ID
        db: 数据库会话

    Returns:
        草稿详情
    """
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    return draft


@router.put("/drafts/{draft_id}/content", response_model=ContractDraftResponse)
async def update_draft_content(
    draft_id: str,
    draft_update: ContractDraftUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    更新草稿内容

    Args:
        draft_id: 草稿ID
        draft_update: 更新数据
        db: 数据库会话

    Returns:
        更新后的草稿
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 更新字段
    if draft_update.title is not None:
        draft.title = draft_update.title
    if draft_update.final_content is not None:
        draft.final_content = draft_update.final_content
        draft.status = "editing"

    draft.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(draft)

    return draft


@router.delete("/drafts/{draft_id}")
async def delete_draft(
    draft_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    删除草稿

    Args:
        draft_id: 草稿ID
        db: 数据库会话

    Returns:
        删除结果
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 删除草稿
    await db.delete(draft)
    await db.commit()

    return {"success": True, "message": "草稿已删除"}


# ============ 合同生成 API (核心) ============

@router.post("/drafts/{draft_id}/generate", response_model=GenerateResponse)
async def generate_contract(
    draft_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    生成合同内容

    Args:
        draft_id: 草稿ID
        background_tasks: 后台任务
        db: 数据库会话

    Returns:
        生成响应
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 检查是否有需求描述
    if not draft.user_requirement:
        raise HTTPException(status_code=400, detail="请先提供合同需求描述")

    # 更新状态为生成中
    draft.status = "generating"
    await db.commit()

    # 异步执行生成任务
    background_tasks.add_task(
        _process_generation,
        draft_id,
        draft.user_requirement,
        draft.template_id,
        db
    )

    return GenerateResponse(
        success=True,
        message="合同生成任务已启动",
        draft_id=draft_id
    )


async def _process_generation(
    draft_id: str,
    user_requirement: str,
    template_id: Optional[str],
    db: AsyncSession
):
    """
    处理合同生成任务（后台执行）

    Args:
        draft_id: 草稿ID
        user_requirement: 用户需求
        template_id: 模板ID
        db: 数据库会话
    """
    try:
        generator = ContractGenerator()

        # 1. 分析需求
        analysis_result = await generator.analyze_requirement(user_requirement)

        if not analysis_result.get("success"):
            # 分析失败
            await db.execute(
                update(ContractDraft)
                .where(ContractDraft.id == draft_id)
                .values(
                    status="failed",
                    generation_metadata={"error": analysis_result.get("error")}
                )
            )
            await db.commit()
            return

        # 2. 生成合同
        generation_result = await generator.generate_from_requirement(
            user_requirement=user_requirement,
            contract_type=analysis_result["contract_type"],
            elements=analysis_result["key_elements"],
            template_context=""  # TODO: 如果有模板ID，加载模板内容
        )

        if not generation_result.get("success"):
            # 生成失败
            await db.execute(
                update(ContractDraft)
                .where(ContractDraft.id == draft_id)
                .values(
                    status="failed",
                    generation_metadata={"error": generation_result.get("error")}
                )
            )
            await db.commit()
            return

        # 3. 更新草稿
        await db.execute(
            update(ContractDraft)
            .where(ContractDraft.id == draft_id)
            .values(
                contract_type=analysis_result["contract_type"],
                elements=analysis_result["key_elements"],
                generated_content=generation_result["content"],
                final_content=generation_result["content"],
                status="generated",
                generation_metadata={
                    "model": settings.dashscope_model,
                    "contract_type": analysis_result["contract_type"],
                    "generated_at": datetime.utcnow().isoformat()
                }
            )
        )
        await db.commit()

    except Exception as e:
        logger.error(f"合同生成失败: {str(e)}")
        await db.execute(
            update(ContractDraft)
            .where(ContractDraft.id == draft_id)
            .values(
                status="failed",
                generation_metadata={"error": str(e)}
            )
        )
        await db.commit()


@router.post("/drafts/{draft_id}/regenerate", response_model=GenerateResponse)
async def regenerate_contract(
    draft_id: str,
    regenerate_data: RegenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    重新生成合同内容

    Args:
        draft_id: 草稿ID
        regenerate_data: 重新生成请求数据
        background_tasks: 后台任务
        db: 数据库会话

    Returns:
        生成响应
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 更新需求描述（如果提供了新的）
    if regenerate_data.user_requirement:
        draft.user_requirement = regenerate_data.user_requirement

    # 更新状态为生成中
    draft.status = "generating"
    draft.version += 1  # 增加版本号
    await db.commit()

    # 异步执行生成任务
    background_tasks.add_task(
        _process_generation,
        draft_id,
        draft.user_requirement,
        draft.template_id,
        db
    )

    return GenerateResponse(
        success=True,
        message="合同重新生成任务已启动",
        draft_id=draft_id
    )


@router.post("/drafts/{draft_id}/refine", response_model=GenerateResponse)
async def refine_contract(
    draft_id: str,
    refine_data: RefineRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    优化合同内容

    Args:
        draft_id: 草稿ID
        refine_data: 优化请求数据
        background_tasks: 后台任务
        db: 数据库会话

    Returns:
        生成响应
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 检查是否有当前内容
    current_content = draft.final_content or draft.generated_content
    if not current_content:
        raise HTTPException(status_code=400, detail="没有可优化的内容")

    # 更新状态为生成中
    draft.status = "refining"
    await db.commit()

    # 异步执行优化任务
    background_tasks.add_task(
        _process_refinement,
        draft_id,
        current_content,
        refine_data.user_feedback,
        db
    )

    return GenerateResponse(
        success=True,
        message="合同优化任务已启动",
        draft_id=draft_id
    )


async def _process_refinement(
    draft_id: str,
    current_content: str,
    user_feedback: str,
    db: AsyncSession
):
    """
    处理合同优化任务（后台执行）

    Args:
        draft_id: 草稿ID
        current_content: 当前内容
        user_feedback: 用户反馈
        db: 数据库会话
    """
    try:
        generator = ContractGenerator()

        # 调用优化服务
        refined_content = await generator.refine_contract(
            current_content=current_content,
            user_feedback=user_feedback
        )

        if not refined_content:
            # 优化失败
            await db.execute(
                update(ContractDraft)
                .where(ContractDraft.id == draft_id)
                .values(
                    status="failed",
                    generation_metadata={"error": "优化失败"}
                )
            )
            await db.commit()
            return

        # 更新草稿
        await db.execute(
            update(ContractDraft)
            .where(ContractDraft.id == draft_id)
            .values(
                final_content=refined_content,
                status="generated",
                updated_at=datetime.utcnow()
            )
        )
        await db.commit()

    except Exception as e:
        logger.error(f"合同优化失败: {str(e)}")
        await db.execute(
            update(ContractDraft)
            .where(ContractDraft.id == draft_id)
            .values(
                status="failed",
                generation_metadata={"error": str(e)}
            )
        )
        await db.commit()


@router.post("/drafts/{draft_id}/suggest-clauses", response_model=SuggestClausesResponse)
async def suggest_clauses(
    draft_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    推荐条款

    Args:
        draft_id: 草稿ID
        db: 数据库会话

    Returns:
        条款推荐响应
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 检查是否有当前内容
    current_content = draft.final_content or draft.generated_content
    if not current_content:
        raise HTTPException(status_code=400, detail="没有可分析的内容")

    try:
        generator = ContractGenerator()

        # 调用条款推荐服务
        suggestions = await generator.suggest_clauses(
            contract_type=draft.contract_type or "通用合同",
            current_content=current_content,
            elements=draft.elements or {}
        )

        return suggestions

    except Exception as e:
        logger.error(f"条款推荐失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"条款推荐失败: {str(e)}")


@router.get("/drafts/{draft_id}/download")
async def download_contract(
    draft_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    下载合同文档

    Args:
        draft_id: 草稿ID
        db: 数据库会话

    Returns:
        Word文档文件
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 检查是否有文件路径
    if not draft.file_path or not os.path.exists(draft.file_path):
        # 如果没有文件，生成 Word 文档
        content = draft.final_content or draft.generated_content
        if not content:
            raise HTTPException(status_code=400, detail="没有可下载的内容")

        try:
            # 使用 DocumentBuilder 生成 Word 文档
            output_dir = os.path.join('storage', 'drafts', draft_id)
            if not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)

            output_path = os.path.join(output_dir, f"{draft.title}.docx")

            # 生成文档
            file_path = create_contract_document(
                content=content,
                title=draft.title,
                metadata={
                    'author': 'ContractFlow AI',
                    'title': draft.title,
                    'subject': f'{draft.contract_type or "合同"}文档'
                },
                output_path=output_path
            )

            # 更新草稿的文件路径
            draft.file_path = file_path
            await db.commit()

        except Exception as e:
            logger.error(f"文档生成失败: {str(e)}")
            raise HTTPException(status_code=500, detail=f"文档生成失败: {str(e)}")

    # 返回文件
    return FileResponse(
        path=draft.file_path,
        filename=f"{draft.title}.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


# ============ 定稿与审查 API ============

@router.post("/drafts/{draft_id}/finalize")
async def finalize_draft(
    draft_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    定稿草稿

    Args:
        draft_id: 草稿ID
        db: 数据库会话

    Returns:
        定稿结果
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 检查是否有内容
    if not draft.final_content and not draft.generated_content:
        raise HTTPException(status_code=400, detail="没有可定稿的内容")

    # 更新状态为已定稿
    draft.status = "finalized"
    draft.finalized_at = datetime.utcnow()
    await db.commit()
    await db.refresh(draft)

    return {
        "success": True,
        "message": "草稿已定稿",
        "draft_id": draft_id,
        "finalized_at": draft.finalized_at
    }


@router.post("/drafts/{draft_id}/to-review")
async def convert_to_review(
    draft_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    将草稿转入审查流程

    Args:
        draft_id: 草稿ID
        db: 数据库会话

    Returns:
        转换结果
    """
    # 查询草稿
    result = await db.execute(
        select(ContractDraft).where(ContractDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()

    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    # 权限验证
    if draft.user_id != "default_user":  # TODO: 从认证系统获取
        raise HTTPException(status_code=403, detail="无权访问此草稿")

    # 检查是否有内容
    content = draft.final_content or draft.generated_content
    if not content:
        raise HTTPException(status_code=400, detail="没有可转入审查的内容")

    try:
        # 创建 Contract 记录
        contract = Contract(
            id=generate_id(),
            user_id=draft.user_id,
            title=draft.title,
            file_path="",  # 稍后设置
            content_text=content,
            status="pending",
            source="from_draft",  # 标记来源
            created_at=datetime.utcnow()
        )
        db.add(contract)

        # 生成并复制文件到审查目录
        # 1. 确保草稿有 Word 文档
        if not draft.file_path or not os.path.exists(draft.file_path):
            # 生成草稿的 Word 文档
            draft_dir = os.path.join('storage', 'drafts', draft_id)
            if not os.path.exists(draft_dir):
                os.makedirs(draft_dir, exist_ok=True)

            draft_file_path = os.path.join(draft_dir, f"{draft.title}.docx")

            create_contract_document(
                content=content,
                title=draft.title,
                metadata={
                    'author': 'ContractFlow AI',
                    'title': draft.title,
                    'subject': f'{draft.contract_type or "合同"}文档'
                },
                output_path=draft_file_path
            )

            draft.file_path = draft_file_path
        else:
            draft_file_path = draft.file_path

        # 2. 复制文件到审查目录
        review_dir = os.path.join('storage', contract.id)
        if not os.path.exists(review_dir):
            os.makedirs(review_dir, exist_ok=True)

        review_file_path = os.path.join(review_dir, f"original_{contract.id}.docx")
        shutil.copy(draft_file_path, review_file_path)

        # 3. 更新 Contract 的文件路径
        contract.file_path = review_file_path

        # 更新草稿状态
        draft.status = "converted_to_review"
        draft.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(contract)

        return {
            "success": True,
            "message": "已转入审查流程",
            "draft_id": draft_id,
            "contract_id": contract.id
        }

    except Exception as e:
        logger.error(f"转入审查失败: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"转入审查失败: {str(e)}")


# ============ 条款库 API ============

@router.get("/clauses", response_model=List[ContractClauseResponse])
async def list_clauses(
    category: Optional[str] = None,
    contract_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    获取条款列表

    Args:
        category: 条款类别筛选
        contract_type: 合同类型筛选
        skip: 跳过数量
        limit: 限制数量
        db: 数据库会话

    Returns:
        条款列表
    """
    # 构建查询
    query = select(ContractClause)

    if category:
        query = query.where(ContractClause.category == category)

    if contract_type:
        query = query.where(ContractClause.contract_type == contract_type)

    query = query.order_by(ContractClause.usage_count.desc(), ContractClause.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    clauses = result.scalars().all()

    return clauses


@router.get("/clauses/{clause_id}", response_model=ContractClauseResponse)
async def get_clause(
    clause_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    获取条款详情

    Args:
        clause_id: 条款ID
        db: 数据库会话

    Returns:
        条款详情
    """
    result = await db.execute(
        select(ContractClause).where(ContractClause.id == clause_id)
    )
    clause = result.scalar_one_or_none()

    if not clause:
        raise HTTPException(status_code=404, detail="条款不存在")

    return clause




