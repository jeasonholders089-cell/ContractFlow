正在调用Kimi K2.5模型生成UI设计...
================================================================================
请耐心等待，生成完整的UI代码可能需要1-3分钟...

开始接收响应...

我将为 ContractFlow 设计一套完整、现代化的 UI 界面。以下是 6 个核心页面的完整 React + TypeScript + Tailwind CSS 实现：

## 1. 登录/注册页面 (Login.tsx)

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
    { icon: FileText, text: '支持Word/PDF格式' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* 左侧品牌区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ContractFlow</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            AI驱动的<br/>
            <span className="text-blue-200">智能合同审查</span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-md leading-relaxed">
            为中小企业、法律从业者和个人提供专业级合同风险识别服务，让法律风险无处遁形。
          </p>

          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <feature.icon className="w-5 h-5 text-blue-200" />
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © 2024 ContractFlow. All rights reserved.
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">ContractFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? '欢迎回来' : '创建账户'}
            </h2>
            <p className="text-slate-600">
              {isLogin ? '登录您的账户以继续审查合同' : '注册并开始您的免费试用'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    姓名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="请输入您的姓名"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    公司名称（选填）
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="请输入公司名称"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                电子邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-600">记住我</span>
                </label>
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  忘记密码？
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? '登录' : '创建账户'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500 mb-4">
              注册即表示您同意我们的服务条款和隐私政策
            </p>
            <div className="flex items-center justify-center gap-4">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-slate-600">企业级数据安全保障</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 2. 主页/仪表板 (Dashboard.tsx)

```tsx
import React from 'react';
import { 
  FileText, 
  Upload, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Search,
  Bell,
  User
} from 'lucide-react';

interface DashboardProps {
  userName?: string;
  onNavigate?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  userName = '张律师',
  onNavigate 
}) => {
  const stats = [
    { 
      label: '本月审查合同', 
      value: '24', 
      trend: '+12%', 
      icon: FileText, 
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: '识别风险条款', 
      value: '156', 
      trend: '+8%', 
      icon: AlertTriangle, 
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    { 
      label: '平均审查时间', 
      value: '2.3分', 
      trend: '-15%', 
      icon: Clock, 
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      label: '合同通过率', 
      value: '92%', 
      trend: '+5%', 
      icon: CheckCircle2, 
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const recentContracts = [
    { id: 1, name: '技术服务合同_V3.docx', date: '2024-01-15', status: 'completed', risks: 3, type: '服务合同' },
    { id: 2, name: '房屋租赁协议.pdf', date: '2024-01-14', status: 'completed', risks: 1, type: '租赁合同' },
    { id: 3, name: '保密协议_NDA.docx', date: '2024-01-13', status: 'reviewing', risks: 0, type: '保密协议' },
    { id: 4, name: '采购合同_2024Q1.docx', date: '2024-01-12', status: 'completed', risks: 5, type: '采购合同' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      reviewing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      failed: 'bg-red-100 text-red-700 border-red-200'
    };
    const labels = {
      completed: '已完成',
      reviewing: '审查中',
      failed: '失败'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">ContractFlow</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">高级会员</p>
                </div>
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">欢迎回来，{userName}</h1>
            <p className="text-slate-600 mt-1">今天已经审查了 3 份合同，发现了 12 处潜在风险</p>
          </div>
          <button 
            onClick={() => onNavigate?.('upload')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            新建审查
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.lightColor} p-3 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最近审查 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">最近审查</h2>
              <button 
                onClick={() => onNavigate?.('history')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {recentContracts.map((contract) => (
                <div key={contract.id} className="p-6 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onNavigate?.('result')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{contract.name}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{contract.type} · {contract.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {contract.status === 'completed' && contract.risks > 0 && (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          {contract.risks} 处风险
                        </div>
                      )}
                      {contract.status === 'completed' && contract.risks === 0 && (
                        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          无风险
                        </div>
                      )}
                      {getStatusBadge(contract.status)}
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快速操作 */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20">
              <h3 className="text-lg font-bold mb-2">升级专业版</h3>
              <p className="text-blue-100 text-sm mb-4">解锁无限合同审查、团队协作和高级分析报告功能</p>
              <button className="w-full bg-white text-blue-600 font-semibold py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                查看方案
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">快速操作</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => onNavigate?.('upload')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-900">上传合同</p>
                    <p className="text-sm text-slate-500">支持 Word、PDF 格式</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
                
                <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Search className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-900">模板库</p>
                    <p className="text-sm text-slate-500">浏览 100+ 标准模板</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## 3. 合同上传页面 (Upload.tsx)

```tsx
import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  File
} from 'lucide-react';

interface UploadProps {
  onBack?: () => void;
  onSubmit?: (files: File[], contractType: string) => void;
}

export const Upload: React.FC<UploadProps> = ({ onBack, onSubmit }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [contractType, setContractType] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contractTypes = [
    { id: 'service', name: '技术服务合同', icon: '💻' },
    { id: 'lease', name: '房屋租赁合同', icon: '🏠' },
    { id: 'employment', name: '劳动合同', icon: '👔' },
    { id: 'nda', name: '保密协议', icon: '🔒' },
    { id: 'sales', name: '买卖合同', icon: '📦' },
    { id: 'custom', name: '其他类型', icon: '📄' }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
              file.type === 'application/msword' ||
              file.type === 'application/pdf'
    );
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length > 0 && contractType) {
      onSubmit?.(files, contractType);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">上传合同</h1>
              <p className="text-sm text-slate-500">步骤 1/3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 文件上传区域 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">上传文件</h2>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }
              ${files.length > 0 ? 'bg-slate-50' : 'bg-white'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".doc,.docx,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-blue-500'}`} />
            </div>
            
            <p className="text-lg font-medium text-slate-900 mb-2">
              {isDragging ? '松开以上传文件' : '拖拽文件到此处，或点击上传'}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              支持 Word (.doc, .docx) 和 PDF 格式，单个文件最大 20MB
            </p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4" />
              <span>文件将被加密传输和存储</span>
            </div>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 合同类型选择 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">选择合同类型</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {contractTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setContractType(type.id)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${contractType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50'
                  }
                `}
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <span className="font-medium text-sm">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 备注信息 */}
        <div className="mb-8">
          <h2 className="text-lg font
错误: The read operation timed out
