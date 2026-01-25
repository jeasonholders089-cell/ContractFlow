# AI 合同审查系统

基于 AI 的智能合同审查平台，支持上传 Word 合同文档，自动识别法律风险并生成批注。

## 功能特性

- 📄 **文件上传**：支持 .docx 格式合同上传
- 🤖 **AI 审查**：基于通义千问的智能合同审查
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

### 4. 初始化数据库

数据库会在首次运行时自动创建。

### 5. 启动后端服务

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

### 审查相关

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/reviews/upload` | POST | 上传合同文件 |
| `/api/reviews/{contract_id}/start` | POST | 开始审查 |
| `/api/reviews/{review_id}` | GET | 获取审查结果 |
| `/api/reviews/{review_id}/download` | GET | 下载带批注文档 |
| `/api/reviews/{review_id}/report` | GET | 下载审查报告 |
| `/api/reviews/contracts` | GET | 获取合同列表 |
| `/api/reviews/contracts/{contract_id}` | GET | 获取合同详情 |

## 使用说明

### 1. 上传合同

```bash
curl -X POST "http://127.0.0.1:8000/api/reviews/upload" \
  -F "file=@contract.docx" \
  -F "title=测试合同"
```

### 2. 开始审查

```bash
curl -X POST "http://127.0.0.1:8000/api/reviews/{contract_id}/start"
```

### 3. 查看审查结果

```bash
curl "http://127.0.0.1:8000/api/reviews/{review_id}"
```

### 4. 下载带批注文档

```bash
curl "http://127.0.0.1:8000/api/reviews/{review_id}/download" -o reviewed.docx
```

## 开发计划

- [x] 后端 API 框架
- [x] 文件上传功能
- [x] AI 审查服务
- [x] 批注生成功能
- [x] 数据库持久化
- [ ] 前端界面
- [ ] 合同撰写功能
- [ ] 模板库功能
- [ ] 个人中心功能

## 注意事项

1. **API Key**：需要申请通义千问 API Key
2. **文件格式**：目前仅支持 .docx 格式
3. **文件大小**：最大支持 10MB
4. **免责声明**：本工具由 AI 提供审核建议，仅供参考，不构成法律意见

## 许可证

MIT License
