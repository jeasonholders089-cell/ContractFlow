# AI 合同审查系统

基于 AI 的智能合同审查平台，支持上传 Word 合同文档，自动识别法律风险并生成批注。

## 功能特性

- 📄 **文件上传**：支持 .docx 格式合同上传
- 🤖 **AI 审查**：基于通义千问的智能合同审查
- ✍️ **合同撰写**：AI 辅助生成专业合同文档（新功能）
- 📝 **批注生成**：自动在文档中添加风险批注
- 📊 **审查报告**：生成详细的审查报告
- 💾 **云端存储**：合同和审查记录持久化存储

## 技术栈

### 后端
- Python 3.11+
- FastAPI - Web 框架
- SQLAlchemy - ORM
- python-docx - Word 文档处理
- OpenAI SDK - 通义千问 API

### 前端
- React 18.x
- TypeScript
- Ant Design

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd AI合同审查
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入配置：

```bash
cp backend/.env.example backend/.env
```

编辑 `.env` 文件，填入你的通义千问 API Key：

```
DASHSCOPE_API_KEY=your_api_key_here
```

### 3. 安装依赖

```bash
# 安装后端依赖
cd backend
pip install -r requirements.txt
```

### 5. 初始化合同撰写数据（可选）

如果需要使用合同撰写功能，运行以下命令初始化模板和条款数据：

```bash
cd backend
python scripts/init_contract_writing_data.py
```

这将创建：
- 5个初始合同模板（通用、劳动、采购、服务、租赁）
- 15个标准条款（付款、违约、保密、争议等）

### 6. 启动后端服务

```bash
cd backend
python main.py
```

服务将在 http://127.0.0.1:8000 启动。

API 文档：http://127.0.0.1:8000/docs

## 项目结构

```
AI合同审查/
├── backend/                 # 后端项目
│   ├── main.py            # FastAPI 主入口
│   ├── config.py          # 配置文件
│   ├── database.py        # 数据库连接
│   ├── models/            # 数据模型
│   ├── schemas/           # Pydantic 模型
│   ├── services/          # 业务逻辑
│   ├── utils/             # 工具模块
│   ├── routers/           # API 路由
│   └── requirements.txt   # 依赖
├── frontend/              # 前端项目（待开发）
├── uploads/               # 上传文件目录
├── storage/               # 合同存储目录
└── README.md
```

## API 端点

### 合同审查相关

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/reviews/upload` | POST | 上传合同文件 |
| `/api/reviews/{contract_id}/start` | POST | 开始审查 |
| `/api/reviews/{review_id}` | GET | 获取审查结果 |
| `/api/reviews/{review_id}/download` | GET | 下载带批注文档 |
| `/api/reviews/{review_id}/report` | GET | 下载审查报告 |
| `/api/reviews/contracts` | GET | 获取合同列表 |
| `/api/reviews/contracts/{contract_id}` | GET | 获取合同详情 |

### 合同撰写相关（新功能）

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/writing/templates` | GET | 获取模板列表 |
| `/api/writing/templates/{id}` | GET | 获取模板详情 |
| `/api/writing/drafts` | POST | 创建合同草稿 |
| `/api/writing/drafts` | GET | 获取草稿列表 |
| `/api/writing/drafts/{id}` | GET | 获取草稿详情 |
| `/api/writing/drafts/{id}/generate` | POST | AI 生成合同内容 |
| `/api/writing/drafts/{id}/refine` | POST | 优化合同内容 |
| `/api/writing/drafts/{id}/suggest-clauses` | POST | 推荐条款 |
| `/api/writing/drafts/{id}/download` | GET | 下载 Word 文档 |
| `/api/writing/drafts/{id}/finalize` | POST | 定稿 |
| `/api/writing/drafts/{id}/to-review` | POST | 转入审查流程 |
| `/api/writing/clauses` | GET | 获取条款库 |

## 使用说明

### 合同审查功能

#### 1. 上传合同

```bash
curl -X POST "http://127.0.0.1:8000/api/reviews/upload" \
  -F "file=@contract.docx" \
  -F "title=测试合同"
```

#### 2. 开始审查

```bash
curl -X POST "http://127.0.0.1:8000/api/reviews/{contract_id}/start"
```

#### 3. 查看审查结果

```bash
curl "http://127.0.0.1:8000/api/reviews/{review_id}"
```

#### 4. 下载带批注文档

```bash
curl "http://127.0.0.1:8000/api/reviews/{review_id}/download" -o reviewed.docx
```

### 合同撰写功能（新功能）

#### 1. 创建合同草稿

```bash
curl -X POST "http://127.0.0.1:8000/api/writing/drafts" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "技术服务合同",
    "user_requirement": "我需要一份技术服务合同，甲方是北京科技公司，乙方是上海服务公司，服务期限1年，费用100万元"
  }'
```

#### 2. AI 生成合同内容

```bash
curl -X POST "http://127.0.0.1:8000/api/writing/drafts/{draft_id}/generate"
```

#### 3. 优化合同内容

```bash
curl -X POST "http://127.0.0.1:8000/api/writing/drafts/{draft_id}/refine" \
  -H "Content-Type: application/json" \
  -d '{
    "user_feedback": "请修改付款方式为分期付款"
  }'
```

#### 4. 下载 Word 文档

```bash
curl "http://127.0.0.1:8000/api/writing/drafts/{draft_id}/download" -o contract.docx
```

#### 5. 转入审查流程

```bash
curl -X POST "http://127.0.0.1:8000/api/writing/drafts/{draft_id}/to-review"
```

## 开发计划

- [x] 后端 API 框架
- [x] 文件上传功能
- [x] AI 审查服务
- [x] 批注生成功能
- [x] 数据库持久化
- [x] **合同撰写功能**（新完成）
  - [x] AI 需求分析
  - [x] 智能合同生成
  - [x] 合同优化
  - [x] 条款推荐
  - [x] Word 文档生成
  - [x] 转入审查流程
- [x] **模板库功能**（新完成）
  - [x] 5个初始模板
  - [x] 15个标准条款
  - [x] 模板管理 API
- [ ] 前端界面
- [ ] 个人中心功能

## 注意事项

1. **API Key**：需要申请通义千问 API Key
2. **文件格式**：目前仅支持 .docx 格式
3. **文件大小**：最大支持 10MB
4. **免责声明**：本工具由 AI 提供审核建议，仅供参考，不构成法律意见

## 许可证

MIT License
