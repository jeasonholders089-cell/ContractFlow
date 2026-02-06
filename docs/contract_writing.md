# 合同撰写功能文档

## 功能概述

合同撰写功能是 ContractFlow AI 的核心功能之一，通过 AI 辅助用户快速生成专业的合同文档。

## 核心特性

### 1. 自然语言需求输入
- 用户用自然语言描述合同需求
- AI 自动理解并提取关键信息
- 不限于预设的合同类型

### 2. 智能合同生成
- AI 根据需求自动生成专业合同初稿
- 符合中国法律法规要求
- 包含完整的合同结构和必要条款

### 3. 实时编辑与优化
- 支持对生成的合同进行编辑
- AI 根据反馈优化特定部分
- 保持其他部分不变

### 4. 智能条款推荐
- 分析当前合同内容
- 推荐缺失的重要条款
- 提供风险警告和合规建议

### 5. Word 文档生成
- 自动生成格式化的 Word 文档
- 专业的文档样式和排版
- 支持下载和打印

### 6. 无缝集成审查流程
- 生成的合同可直接转入审查
- 完整的"撰写 → 审查 → 定稿"工作流

## 使用流程

```
1. 创建草稿
   ↓
2. 输入需求描述
   ↓
3. AI 分析需求
   ↓
4. AI 生成合同内容
   ↓
5. 用户查看和编辑
   ↓
6. （可选）AI 优化
   ↓
7. （可选）获取条款推荐
   ↓
8. 下载 Word 文档
   ↓
9. 定稿
   ↓
10. 转入审查流程
```

## API 使用示例

### 完整工作流示例

```bash
# 1. 创建草稿
DRAFT_RESPONSE=$(curl -X POST "http://127.0.0.1:8000/api/writing/drafts" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "技术服务合同",
    "user_requirement": "我需要一份技术服务合同，甲方是北京科技有限公司，乙方是上海服务有限公司，服务内容是软件开发，服务期限1年，费用100万元，分三期付款"
  }')

DRAFT_ID=$(echo $DRAFT_RESPONSE | jq -r '.id')

# 2. AI 生成合同内容
curl -X POST "http://127.0.0.1:8000/api/writing/drafts/$DRAFT_ID/generate"

# 3. 等待生成完成，查看草稿
curl "http://127.0.0.1:8000/api/writing/drafts/$DRAFT_ID"

# 4. （可选）优化合同
curl -X POST "http://127.0.0.1:8000/api/writing/drafts/$DRAFT_ID/refine" \
  -H "Content-Type: application/json" \
  -d '{
    "user_feedback": "请在付款方式中明确每期的付款比例和时间节点"
  }'

# 5. （可选）获取条款推荐
curl -X POST "http://127.0.0.1:8000/api/writing/drafts/$DRAFT_ID/suggest-clauses"

# 6. 下载 Word 文档
curl "http://127.0.0.1:8000/api/writing/drafts/$DRAFT_ID/download" -o contract.docx

# 7. 定稿
curl -X POST "http://127.0.0.1:8000/api/writing/drafts/$DRAFT_ID/finalize"

# 8. 转入审查流程
REVIEW_RESPONSE=$(curl -X POST "http://127.0.0.1:8000/api/writing/drafts/$DRAFT_ID/to-review")
CONTRACT_ID=$(echo $REVIEW_RESPONSE | jq -r '.contract_id')

# 9. 开始审查
curl -X POST "http://127.0.0.1:8000/api/reviews/$CONTRACT_ID/start"
```

## 数据模型

### ContractDraft（合同草稿）

```python
{
  "id": "草稿ID",
  "user_id": "用户ID",
  "template_id": "模板ID（可选）",
  "title": "合同标题",
  "user_requirement": "用户需求描述",
  "contract_type": "合同类型",
  "elements": {
    "party_a": "甲方信息",
    "party_b": "乙方信息",
    "amount": "金额",
    "duration": "期限",
    ...
  },
  "generated_content": "AI生成的内容",
  "final_content": "用户编辑后的内容",
  "file_path": "Word文档路径",
  "status": "状态",
  "version": "版本号",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

### ContractTemplate（合同模板）

```python
{
  "id": "模板ID",
  "name": "模板名称",
  "category": "类别",
  "description": "描述",
  "template_content": "模板内容",
  "variables": [
    {
      "name": "变量名",
      "type": "类型",
      "label": "标签",
      "required": true/false
    }
  ],
  "is_system": "是否系统模板",
  "is_active": "是否启用",
  "usage_count": "使用次数"
}
```

### ContractClause（合同条款）

```python
{
  "id": "条款ID",
  "title": "条款标题",
  "category": "类别",
  "contract_type": "适用合同类型",
  "content": "条款内容",
  "is_required": "是否必需",
  "risk_level": "风险等级",
  "compliance_notes": "合规说明",
  "usage_count": "使用次数"
}
```

## 初始数据

### 预设模板（5个）

1. **通用合同模板** - 适用于各类通用合同
2. **劳动合同模板** - 适用于劳动关系
3. **采购合同模板** - 适用于货物采购
4. **服务合同模板** - 适用于服务外包
5. **租赁合同模板** - 适用于房屋租赁

### 标准条款（15个）

- 付款方式条款
- 违约责任条款
- 保密条款
- 争议解决条款
- 合同变更条款
- 合同终止条款
- 知识产权条款
- 质量保证条款
- 交付验收条款
- 工作时间条款
- 社会保险条款
- 试用期条款
- 房屋用途条款
- 房屋维修条款
- 转租条款

## AI Prompt 设计

### 需求分析 Prompt

分析用户需求，提取：
- 合同类型
- 合同标题
- 关键要素（甲乙方、金额、期限等）
- 特殊要求
- 建议条款

### 合同生成 Prompt

基于需求生成完整合同，包括：
- 合同标题
- 甲乙双方信息
- 鉴于条款
- 正文条款
- 附则
- 签署栏

### 合同优化 Prompt

根据用户反馈优化特定部分：
- 理解修改意图
- 只修改指定部分
- 保持其他部分不变
- 确保整体协调

### 条款推荐 Prompt

推荐缺失的重要条款：
- 分析当前内容
- 识别缺失条款
- 提供推荐内容
- 给出风险警告

## 文档生成

### Word 文档格式

- **标题**：黑体、18pt、居中、加粗
- **条款标题**：黑体、14pt、加粗
- **正文**：宋体、12pt、1.5倍行距、首行缩进
- **甲乙方信息**：宋体、12pt
- **签署栏**：标准格式，包含盖章和日期

### 智能格式化

- 自动识别条款编号（第一条、第1条、1.、一、等）
- 自动识别甲乙方信息
- 保持段落结构
- 添加签署栏

## 测试

运行基本测试：

```bash
python backend/tests/test_contract_writing_basic.py
```

测试覆盖：
- 文档生成器
- 条款标题识别
- 甲乙方信息识别
- Prompt 构建

## 注意事项

1. **法律免责**：AI 生成的合同仅供参考，不构成法律意见
2. **人工审核**：建议由专业法律人士审核后使用
3. **数据安全**：合同内容存储在本地数据库
4. **API 限制**：依赖通义千问 API，需要有效的 API Key

## 未来优化方向

1. **智能推荐**：基于历史数据推荐合同类型和条款
2. **协同编辑**：支持多人协作编辑合同
3. **版本对比**：可视化对比不同版本
4. **批量生成**：支持批量生成相似合同
5. **智能填充**：基于历史数据自动填充常用信息
6. **合同分析**：分析生成的合同，提供优化建议

## 技术架构

```
用户请求
    ↓
FastAPI 路由层 (contract_writing.py)
    ↓
服务层 (contract_writing_service.py)
    ↓
AI 服务 (通义千问 API)
    ↓
文档生成器 (document_builder.py)
    ↓
数据库层 (SQLAlchemy)
    ↓
文件存储 (storage/drafts/)
```

## 相关文件

- `backend/routers/contract_writing.py` - API 路由
- `backend/services/contract_writing_service.py` - 业务逻辑
- `backend/models/contract_writing.py` - 数据模型
- `backend/schemas/contract_writing.py` - Pydantic 模型
- `backend/utils/document_builder.py` - 文档生成器
- `backend/utils/contract_prompts.py` - AI Prompt
- `backend/scripts/init_contract_writing_data.py` - 数据初始化
- `backend/tests/test_contract_writing_basic.py` - 基本测试
