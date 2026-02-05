# ContractFlow UI设计 - Kimi K2.5生成

> 本文档包含由Kimi K2.5 AI模型生成的完整前端UI设计
> 生成日期: 2024-01-28
> 技术栈: React + TypeScript + Tailwind CSS + lucide-react

## 概述

ContractFlow是一款基于AI的智能合同审查系统。本UI设计包含6个核心页面，采用现代化的设计风格，注重用户体验和视觉美感。

### 设计特点

- **专业现代**: 蓝色系主色调，传达专业和信任感
- **响应式设计**: 完美适配桌面端和移动端
- **交互友好**: 流畅的动画效果和清晰的视觉反馈
- **组件化**: 可复用的React组件，易于维护和扩展

### 技术栈

- **React 18+**: 现代化的UI框架
- **TypeScript**: 类型安全的开发体验
- **Tailwind CSS**: 实用优先的CSS框架
- **lucide-react**: 精美的图标库

## 页面列表

1. [登录/注册页面](#1-登录注册页面-logintsx) - Login.tsx
2. [主页/仪表板](#2-主页仪表板-dashboardtsx) - Dashboard.tsx
3. [合同上传页面](#3-合同上传页面-uploadtsx) - Upload.tsx
4. 审查进行中页面 - Reviewing.tsx (待完成)
5. 审查结果页面 - Result.tsx (待完成)
6. 历史记录页面 - History.tsx (待完成)

---

## 1. 登录/注册页面 (Login.tsx)

### 功能特点

- 登录/注册模式切换
- 表单验证
- 密码显示/隐藏
- 响应式布局
- 品牌展示区域

### 组件代码

```tsx
import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Shield,
  FileText,
  Zap
} from 'lucide-react';

interface LoginProps {
  onLogin?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onLogin?.();
  };

  const features = [
    { icon: Zap, text: '3分钟完成合同审查' },
    { icon: Shield, text: 'AI识别95%+法律风险' },
