# ContractFlow - AI 合同审查系统

智能合同全生命周期管理平台，集成 AI 技术提供合同审查、风险分析等功能。

## 功能特性

- ✅ **智能合同审查** - AI 驱动的合同风险分析
- ✅ **实时进度跟踪** - 审查状态实时更新
- ✅ **风险等级分类** - 高/中/低风险智能识别
- ✅ **详细问题报告** - 包含位置、问题描述和修改建议
- ✅ **文档下载** - 支持下载带批注的合同和文本报告
- 🎨 **现代化 UI** - 基于 shadcn/ui 的专业界面设计

## 技术栈

- **前端**: React 19 + TypeScript + Vite 7
- **路由**: Wouter (轻量级路由)
- **UI 组件**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS v4
- **HTTP 客户端**: Axios
- **状态管理**: React Hooks
- **后端**: FastAPI + Python (需单独部署)

## 本地开发

### 前置要求

- Node.js 18+
- npm 或 yarn
- 后端服务运行在 http://localhost:8000

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## Vercel 部署

### 1. 准备工作

确保以下文件已正确配置：

- ✅ `vercel.json` - 构建配置
- ✅ `.env.example` - 环境变量示例
- ✅ `.gitignore` - 包含 `.env` 文件

### 2. 部署后端

**重要**: 前端需要连接到已部署的后端 API。推荐使用以下平台部署后端：

- [Railway](https://railway.app/) - 推荐，简单易用
- [Render](https://render.com/) - 免费套餐可用
- [Fly.io](https://fly.io/) - 全球边缘部署
- AWS/阿里云/腾讯云 - 企业级部署

部署后端后，记录 API URL（例如：`https://your-api.railway.app`）

### 3. 部署前端到 Vercel

#### 方式一：通过 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `contract-suite-website`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 添加环境变量：
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-api-url.com`
6. 点击 "Deploy"

#### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd contract-suite-website
vercel

# 添加环境变量
vercel env add VITE_API_BASE_URL
# 输入: https://your-backend-api-url.com

# 生产部署
vercel --prod
```

### 4. 配置后端 CORS

部署后，需要更新后端 CORS 配置以允许 Vercel 域名：

编辑 `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",  # 添加你的 Vercel 域名
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. 验证部署

1. 访问你的 Vercel URL
2. 点击"合同审查"或"立即开始免费试用"
3. 上传一个 .docx 合同文件
4. 验证审查流程是否正常工作

## 项目结构

```
contract-suite-website/
├── src/
│   ├── components/
│   │   ├── contract/          # 合同审查相关组件
│   │   │   ├── ContractUpload.tsx
│   │   │   ├── ReviewProgress.tsx
│   │   │   ├── RiskAnalysis.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   └── DownloadActions.tsx
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.tsx           # 首页
│   │   └── ContractReview.tsx # 合同审查页面
│   ├── services/
│   │   ├── api.ts             # Axios 配置
│   │   └── contractService.ts # API 方法
│   ├── hooks/
│   │   └── useContractReview.ts # 审查逻辑 Hook
│   ├── types/
│   │   └── contract.ts        # TypeScript 类型定义
│   ├── lib/
│   │   ├── utils.ts
│   │   └── constants.ts
│   └── App.tsx
├── .env.example               # 环境变量示例
├── .gitignore
├── vercel.json                # Vercel 配置
└── package.json
```

## 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8000` (开发) <br> `https://api.example.com` (生产) |

## 常见问题

### Q: 上传文件后显示网络错误？

A: 检查以下几点：
1. 后端服务是否正常运行
2. `.env` 中的 `VITE_API_BASE_URL` 是否正确
3. 后端 CORS 配置是否包含前端域名

### Q: Vercel 部署后 API 请求失败？

A: 确保：
1. 后端已部署并可访问
2. Vercel 环境变量 `VITE_API_BASE_URL` 已正确设置
3. 后端 CORS 允许 Vercel 域名

### Q: 构建时出现类型错误？

A: 运行以下命令清理并重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 开发指南

### 添加新的 API 端点

1. 在 `src/types/contract.ts` 添加类型定义
2. 在 `src/services/contractService.ts` 添加 API 方法
3. 在组件中使用新的 API 方法

### 添加新页面

1. 在 `src/pages/` 创建新页面组件
2. 在 `src/App.tsx` 添加路由
3. 在 `src/lib/constants.ts` 添加导航链接（如需要）

## License

MIT

## 支持

如有问题，请提交 Issue 或联系开发团队。
