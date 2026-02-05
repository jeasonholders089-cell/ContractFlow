import os
from openai import OpenAI

# 从环境变量读取API Key
api_key = "sk-ALaR9QAGn9doUFWohvXZ3YIlRNLJ95Prwo7hnmffZCMLYIRC"

client = OpenAI(
    api_key=api_key,
    base_url="https://api.moonshot.cn/v1",
)

# 构建详细的UI设计提示词
prompt = """
请为"ContractFlow - AI合同审查系统"设计完整的前端UI页面。

产品背景：
- 产品名称：ContractFlow - AI合同审查系统
- 产品类型：B2B/B2C SaaS服务平台
- 核心功能：AI智能合同审查、风险识别、问题定位、自动批注生成

目标用户：
- 中小企业（无专职法务人员）
- 法律从业者（律师、法务人员）
- 创业公司
- 个人用户（自由职业者、个体户）

核心需求：
1. 用户上传Word格式合同文档
2. AI自动审查并识别风险
3. 生成带批注的审查报告
4. 全流程 < 3分钟
5. 界面简单易用，学习成本 < 5分钟

请设计以下页面，使用现代化的React + TypeScript + Tailwind CSS技术栈：

1. **登录/注册页面** (Login.tsx)
   - 简洁的登录表单
   - 支持邮箱/手机号登录
   - 第三方登录选项（微信、企业微信）
   - 注册入口

2. **主页/仪表板** (Dashboard.tsx)
   - 欢迎信息和快速操作区
   - 最近审查的合同列表
   - 统计数据展示（已审查合同数、发现风险数等）
   - 快速上传入口

3. **合同上传页面** (Upload.tsx)
   - 拖拽上传区域
   - 支持Word文档（.doc, .docx）
   - 上传进度显示
   - 文件预览

4. **审查进行中页面** (Reviewing.tsx)
   - 审查进度动画
   - 实时状态更新
   - 预计剩余时间

5. **审查结果页面** (Result.tsx)
   - 风险等级总览（高/中/低风险）
   - 问题列表（可展开查看详情）
   - 原文对照显示
   - 下载审查报告按钮
   - 导出带批注的Word文档

6. **历史记录页面** (History.tsx)
   - 合同列表（表格形式）
   - 筛选和搜索功能
   - 查看详情入口

请为每个页面生成完整的React组件代码，包括：
- 完整的TypeScript类型定义
- Tailwind CSS样式
- 响应式设计
- 美观的UI设计（使用渐变色、阴影、圆角等现代设计元素）
- 良好的用户体验（加载状态、错误处理、空状态）

设计风格要求：
- 专业、现代、简洁
- 主色调：蓝色系（代表专业、信任）
- 辅助色：绿色（成功）、红色（风险）、黄色（警告）
- 大量留白，清晰的视觉层次
- 图标使用lucide-react库

请逐个生成每个页面的完整代码。
"""

print("正在调用Kimi K2.5模型生成UI设计...")
print("=" * 80)

completion = client.chat.completions.create(
    model="kimi-k2.5",
    messages=[
        {"role": "system", "content": "你是一位资深的前端UI/UX设计师和React开发专家，擅长使用React、TypeScript和Tailwind CSS创建美观、现代化的Web应用界面。"},
        {"role": "user", "content": prompt},
    ],
)

response_content = completion.choices[0].message.content
print(response_content)
print("=" * 80)
print("\n生成完成！")

# 保存生成的内容到文件
with open("ui_design_output.md", "w", encoding="utf-8") as f:
    f.write("# ContractFlow UI设计 - Kimi K2.5生成\n\n")
    f.write(response_content)

print("\n生成的UI设计已保存到: ui_design_output.md")
