// 页面路由和应用状态管理
class App {
    constructor() {
        this.currentPage = 'contract-write';
        this.API_BASE = 'http://127.0.0.1:8000/api/reviews';
        // 审查状态
        this.currentFile = null;
        this.currentContractId = null;
        this.currentReviewId = null;
        this.pollInterval = null;
        // 合同编写状态
        this.currentDraftId = null;
        this.isGenerating = false;
        // 预览区数据存储
        this.previewData = {
            originalContract: null,
            contractFileName: null,
            reviewReport: null,
            reviewedContract: null
        };
        // 预览区当前视图：'contract' 或 'report'
        this.previewView = 'contract';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPage('contract-write');
    }

    bindEvents() {
        // 导航点击事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.loadPage(page);
                }
            });
        });
    }

    loadPage(pageName) {
        this.currentPage = pageName;

        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNav = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // 加载页面内容
        const pageContent = document.getElementById('page-content');
        const pageHTML = this.getPageContent(pageName);
        pageContent.innerHTML = pageHTML;

        // 初始化页面特定的事件
        this.initPageEvents(pageName);
    }

    getPageContent(pageName) {
        const pages = {
            'contract-write': this.getContractWritePage(),
            'contract-manage': this.getContractManagePage(),
            'contract-review': this.getContractReviewPage(),
            'contract-template': this.getContractTemplatePage(),
            'contract-stats': this.getContractStatsPage(),
            'partner-merchants': this.getPartnerMerchantsPage(),
            'profile': this.getProfilePage()
        };
        return pages[pageName] || this.getNotFoundPage();
    }

    // ==================== 页面内容生成函数 ====================

    getContractWritePage() {
        return `
            <div class="flex flex-col h-full">
                <!-- Header -->
                <header class="bg-white px-6 py-4">
                    <div>
                        <h1 class="text-lg font-semibold text-gray-800">合同编写</h1>
                        <p class="text-sm text-gray-500">使用 AI 智能生成合同内容</p>
                    </div>
                </header>

                <!-- Main Content -->
                <div class="flex-1 p-6 overflow-auto">
                    <div class="max-w-4xl mx-auto">
                        <!-- Template Selection -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">选择合同模板</label>
                            <select id="templateSelect" class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow">
                                <option>请选择合同模板...</option>
                                <option>劳动合同</option>
                                <option>销售合同</option>
                                <option>服务协议</option>
                                <option>保密协议</option>
                                <option>租赁合同</option>
                                <option>自定义合同</option>
                            </select>
                        </div>

                        <!-- Custom Contract Type (shown only when "自定义合同" is selected) -->
                        <div id="customTypeContainer" class="mb-6" style="display: none;">
                            <label class="block text-sm font-medium text-gray-700 mb-2">自定义合同类型</label>
                            <input type="text" id="customContractType" placeholder="例如：技术转让合同、股权转让协议等..." class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow">
                        </div>

                        <!-- Contract Title -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">合同标题</label>
                            <input type="text" id="contractTitle" placeholder="请输入合同标题..." class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow">
                        </div>

                        <!-- Contract Content Editor -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">合同内容</label>
                            <textarea
                                id="contractContent"
                                class="w-full h-80 p-4 bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 placeholder-gray-400"
                                placeholder="请输入合同内容...

例如：
甲方：____________________
乙方：____________________

根据《中华人民共和国合同法》及相关法律法规，甲乙双方本着平等互利的原则，经友好协商，就__________事宜达成如下协议：

第一条 ...

（您也可以点击下方按钮，使用 AI 智能生成合同内容）"
                            ></textarea>
                        </div>

                        <div class="flex justify-center gap-4">
                            <button id="startWriteBtn" class="px-8 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200 shadow-sm">
                                开始编写
                            </button>
                            <button id="regenerateBtn" class="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                                重新生成
                            </button>
                            <button id="downloadBtn" class="px-8 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed" disabled>
                                下载合同
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getContractManagePage() {
        // 生成模拟合同数据
        const contracts = [
            { id: 1, title: '劳动合同 - 张三', type: '劳动合同', date: '2024-01-15', status: 'active' },
            { id: 2, title: '销售合同 - 科技公司', type: '销售合同', date: '2024-01-14', status: 'pending' },
            { id: 3, title: '服务协议 - 咨询服务', type: '服务协议', date: '2024-01-13', status: 'active' },
            { id: 4, title: '保密协议 - 合作方', type: '保密协议', date: '2024-01-12', status: 'expired' },
            { id: 5, title: '租赁合同 - 办公室', type: '租赁合同', date: '2024-01-11', status: 'active' },
            { id: 6, title: '劳动合同 - 李四', type: '劳动合同', date: '2024-01-10', status: 'pending' },
            { id: 7, title: '采购合同 - 设备', type: '采购合同', date: '2024-01-09', status: 'active' },
            { id: 8, title: '合作协议 - 渠道', type: '合作协议', date: '2024-01-08', status: 'active' },
        ];

        const statusColors = {
            'active': 'bg-green-100 text-green-700',
            'pending': 'bg-yellow-100 text-yellow-700',
            'expired': 'bg-red-100 text-red-700'
        };

        const statusText = {
            'active': '生效中',
            'pending': '待审核',
            'expired': '已过期'
        };

        return `
            <div class="flex flex-col h-full">
                <!-- Header -->
                <header class="bg-white px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-lg font-semibold text-gray-800">合同管理</h1>
                            <p class="text-sm text-gray-500">管理和查看所有合同文件</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <input type="text" placeholder="搜索合同..." class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-64">
                                <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <button class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors duration-200">
                                新建合同
                            </button>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div class="flex items-center gap-6 mt-4">
                        <button class="tab-btn px-1 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600" data-tab="all">全部</button>
                        <button class="tab-btn px-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 transition-colors" data-tab="active">生效中</button>
                        <button class="tab-btn px-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 transition-colors" data-tab="pending">待审核</button>
                        <button class="tab-btn px-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 transition-colors" data-tab="expired">已过期</button>
                    </div>
                </header>

                <!-- Main Content -->
                <div class="flex-1 p-6 overflow-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        ${contracts.map(contract => `
                            <div class="contract-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                                <div class="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <div class="p-4">
                                    <div class="flex items-start justify-between mb-2">
                                        <h3 class="font-medium text-gray-800 text-sm line-clamp-2">${contract.title}</h3>
                                        <span class="px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[contract.status]} flex-shrink-0 ml-2">${statusText[contract.status]}</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mb-3">${contract.type} · ${contract.date}</p>
                                    <div class="flex items-center justify-between">
                                        <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">查看详情</button>
                                        <button class="p-1 hover:bg-gray-100 rounded transition-colors">
                                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Pagination -->
                    <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                        <p class="text-sm text-gray-500">显示 1-8 条，共 24 条</p>
                        <div class="flex items-center gap-2">
                            <button class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>上一页</button>
                            <button class="px-3 py-1.5 text-sm text-white bg-primary-500 rounded-lg">1</button>
                            <button class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                            <button class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                            <button class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">下一页</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getContractReviewPage() {
        return `
            <div class="flex flex-col h-full">
                <!-- Header -->
                <header class="bg-white px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-lg font-semibold text-gray-800">合同审查</h1>
                            <p class="text-sm text-gray-500">AI 智能审查合同条款</p>
                        </div>
                    </div>
                </header>

                <!-- Main Content -->
                <div class="flex-1 p-6 overflow-auto">
                    <div class="max-w-4xl mx-auto">
                        <!-- Upload Section -->
                        <div class="mb-6">
                            <div id="uploadArea" class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer">
                                <div class="flex flex-col items-center">
                                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                    </div>
                                    <h3 class="text-base font-medium text-gray-700 mb-1">上传合同文件</h3>
                                    <p class="text-sm text-gray-500 mb-4">点击或拖拽文件到此处上传</p>
                                    <p class="text-xs text-gray-400">支持 DOCX、PDF、TXT 格式，最大 10MB</p>
                                    <input type="file" id="fileInput" class="hidden" accept=".docx,.pdf,.txt">
                                </div>
                            </div>
                            <div id="fileInfo" class="hidden mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-800" id="fileName">文件名.docx</p>
                                            <p class="text-xs text-gray-500" id="fileSize">1.2 MB</p>
                                        </div>
                                    </div>
                                    <button id="removeFile" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Contract Input -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">或直接输入合同内容</label>
                            <textarea
                                id="reviewContent"
                                class="w-full h-48 p-4 bg-white border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm text-gray-700 placeholder-gray-400"
                                placeholder="请在此处粘贴需要审查的合同内容..."
                            ></textarea>
                        </div>

                        <!-- Review Options -->
                        <div class="mb-6">
                            <h3 class="text-sm font-medium text-gray-700 mb-3">审查选项</h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <label class="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="checkbox" checked class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500">
                                    <span class="text-sm text-gray-700">法律合规</span>
                                </label>
                                <label class="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="checkbox" checked class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500">
                                    <span class="text-sm text-gray-700">风险识别</span>
                                </label>
                                <label class="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="checkbox" class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500">
                                    <span class="text-sm text-gray-700">条款完整性</span>
                                </label>
                                <label class="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="checkbox" class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500">
                                    <span class="text-sm text-gray-700">语言表达</span>
                                </label>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-center gap-4">
                            <button id="startReviewBtn" class="px-8 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200 shadow-sm">
                                开始审查
                            </button>
                            <button id="viewReviewBtn" class="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                                重新审查
                            </button>
                        </div>

                        <!-- Review Results (Hidden by default) -->
                        <div id="reviewResults" class="hidden mt-8">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">审查结果</h3>
                            <div class="space-y-4">
                                <div class="bg-white rounded-lg border border-gray-200 p-5">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 class="font-medium text-gray-800">高风险条款</h4>
                                            <p class="text-sm text-gray-600 mt-1">发现 2 处可能存在法律风险的条款</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white rounded-lg border border-gray-200 p-5">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 class="font-medium text-gray-800">建议修改</h4>
                                            <p class="text-sm text-gray-600 mt-1">发现 5 处可以优化的条款表述</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white rounded-lg border border-gray-200 p-5">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 class="font-medium text-gray-800">整体评估</h4>
                                            <p class="text-sm text-gray-600 mt-1">合同整体结构完整，建议修改后可正常使用</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getContractTemplatePage() {
        const templates = [
            { name: '劳动合同', category: '人力资源', icon: '👤', uses: 1250 },
            { name: '销售合同', category: '商务合作', icon: '🤝', uses: 980 },
            { name: '服务协议', category: '商务合作', icon: '📋', uses: 856 },
            { name: '保密协议', category: '法律保护', icon: '🔒', uses: 743 },
            { name: '租赁合同', category: '不动产', icon: '🏠', uses: 621 },
            { name: '采购合同', category: '供应链', icon: '📦', uses: 589 },
            { name: '合作协议', category: '商务合作', icon: '🤝', uses: 534 },
            { name: '劳动合同（无固定期限）', category: '人力资源', icon: '👤', uses: 478 },
            { name: '离职协议', category: '人力资源', icon: '📝', uses: 412 },
            { name: '借款合同', category: '金融', icon: '💰', uses: 389 },
            { name: '技术合作协议', category: '技术研发', icon: '⚙️', uses: 356 },
            { name: '许可协议', category: '知识产权', icon: '©️', uses: 298 },
        ];

        return `
            <div class="flex flex-col h-full">
                <header class="bg-white px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-lg font-semibold text-gray-800">合同模板</h1>
                            <p class="text-sm text-gray-500">使用预设模板快速创建合同</p>
                        </div>
                    </div>
                </header>

                <div class="flex-1 p-6 overflow-auto">
                    <div class="mb-6">
                        <div class="relative">
                            <input type="text" placeholder="搜索模板..." class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${templates.map(template => `
                            <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-medium text-gray-800 group-hover:text-primary-600 transition-colors">${template.name}</h3>
                                    <p class="text-sm text-gray-500 mt-1">${template.category}</p>
                                    <p class="text-xs text-gray-400 mt-2">已使用 ${template.uses} 次</p>
                                </div>
                                <button class="w-full mt-4 px-4 py-2 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                                    使用模板
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getContractStatsPage() {
        return `
            <div class="flex flex-col h-full">
                <header class="bg-white px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div>
                            <h1 class="text-lg font-semibold text-gray-800">合同统计</h1>
                            <p class="text-sm text-gray-500">查看合同数据和统计信息</p>
                        </div>
                    </div>
                </header>

                <div class="flex-1 p-6 overflow-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-500">总合同数</p>
                                    <p class="text-2xl font-semibold text-gray-800 mt-1">1,247</p>
                                    <p class="text-xs text-green-600 mt-1">↑ 12% 较上月</p>
                                </div>
                                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-500">生效中</p>
                                    <p class="text-2xl font-semibold text-gray-800 mt-1">892</p>
                                    <p class="text-xs text-green-600 mt-1">↑ 8% 较上月</p>
                                </div>
                                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-500">待审核</p>
                                    <p class="text-2xl font-semibold text-gray-800 mt-1">156</p>
                                    <p class="text-xs text-yellow-600 mt-1">需关注</p>
                                </div>
                                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-500">即将到期</p>
                                    <p class="text-2xl font-semibold text-gray-800 mt-1">43</p>
                                    <p class="text-xs text-red-600 mt-1">30天内</p>
                                </div>
                                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 class="font-semibold text-gray-800 mb-4">合同类型分布</h3>
                            <div class="space-y-3">
                                <div class="flex items-center">
                                    <span class="text-sm text-gray-600 w-24">劳动合同</span>
                                    <div class="flex-1 bg-gray-100 rounded-full h-2">
                                        <div class="bg-primary-500 h-2 rounded-full" style="width: 45%"></div>
                                    </div>
                                    <span class="text-sm text-gray-600 ml-3">45%</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-sm text-gray-600 w-24">销售合同</span>
                                    <div class="flex-1 bg-gray-100 rounded-full h-2">
                                        <div class="bg-primary-500 h-2 rounded-full" style="width: 28%"></div>
                                    </div>
                                    <span class="text-sm text-gray-600 ml-3">28%</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-sm text-gray-600 w-24">服务协议</span>
                                    <div class="flex-1 bg-gray-100 rounded-full h-2">
                                        <div class="bg-primary-500 h-2 rounded-full" style="width: 18%"></div>
                                    </div>
                                    <span class="text-sm text-gray-600 ml-3">18%</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-sm text-gray-600 w-24">其他</span>
                                    <div class="flex-1 bg-gray-100 rounded-full h-2">
                                        <div class="bg-primary-500 h-2 rounded-full" style="width: 9%"></div>
                                    </div>
                                    <span class="text-sm text-gray-600 ml-3">9%</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 class="font-semibold text-gray-800 mb-4">近30天趋势</h3>
                            <div class="flex items-end justify-between h-40">
                                ${[35, 52, 48, 65, 58, 72, 68, 45, 52, 48, 65, 58, 72, 68, 45, 52, 48, 65, 58, 72, 68, 45, 52, 48, 65, 58, 72, 68, 45, 52].map((h) => `
                                    <div class="flex-1 mx-0.5">
                                        <div class="bg-primary-500 rounded-t hover:bg-primary-600 transition-colors cursor-pointer" style="height: ${h}%"></div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between mt-2 text-xs text-gray-400">
                                <span>1日</span>
                                <span>10日</span>
                                <span>20日</span>
                                <span>30日</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getPartnerMerchantsPage() {
        const partners = [
            { name: '科技公司', type: '技术合作', status: 'active', contracts: 12 },
            { name: '咨询服务', type: '咨询服务', status: 'active', contracts: 8 },
            { name: '物流集团', type: '物流服务', status: 'pending', contracts: 5 },
            { name: '传媒公司', type: '营销推广', status: 'active', contracts: 15 },
            { name: '建设集团', type: '工程建设', status: 'active', contracts: 3 },
            { name: '投资机构', type: '投资合作', status: 'pending', contracts: 2 },
        ];

        const statusColors = {
            'active': 'bg-green-100 text-green-700',
            'pending': 'bg-yellow-100 text-yellow-700'
        };

        const statusText = {
            'active': '合作中',
            'pending': '待确认'
        };

        return `
            <div class="flex flex-col h-full">
                <header class="bg-white px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-lg font-semibold text-gray-800">合作商家</h1>
                            <p class="text-sm text-gray-500">管理合作伙伴和商家信息</p>
                        </div>
                        <button class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors">
                            添加合作方
                        </button>
                    </div>
                </header>

                <div class="flex-1 p-6 overflow-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${partners.map(partner => `
                            <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                    </div>
                                    <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[partner.status]}">${statusText[partner.status]}</span>
                                </div>
                                <h3 class="font-medium text-gray-800 mb-1">${partner.name}</h3>
                                <p class="text-sm text-gray-500 mb-3">${partner.type}</p>
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-gray-500">${partner.contracts} 份合同</span>
                                    <button class="text-primary-600 hover:text-primary-700 font-medium">查看详情</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getProfilePage() {
        return `
            <div class="flex flex-col h-full">
                <header class="bg-white px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div>
                            <h1 class="text-lg font-semibold text-gray-800">个人中心</h1>
                            <p class="text-sm text-gray-500">管理账户信息和偏好设置</p>
                        </div>
                    </div>
                </header>

                <div class="flex-1 p-6 overflow-auto">
                    <div class="max-w-3xl mx-auto">
                        <!-- Profile Card -->
                        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                            <div class="flex items-center gap-6">
                                <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="text-xl font-semibold text-gray-800">用户名</h2>
                                    <p class="text-gray-500">user@example.com</p>
                                    <button class="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">修改头像</button>
                                </div>
                            </div>
                        </div>

                        <!-- Settings Sections -->
                        <div class="space-y-4">
                            <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-800">个人信息</p>
                                            <p class="text-sm text-gray-500">修改姓名、邮箱、手机号</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-800">安全设置</p>
                                            <p class="text-sm text-gray-500">修改密码、设置两步验证</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-800">通知设置</p>
                                            <p class="text-sm text-gray-500">管理通知偏好</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-800">偏好设置</p>
                                            <p class="text-sm text-gray-500">语言、主题、显示设置</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Danger Zone -->
                            <div class="bg-white rounded-xl border border-red-200 p-4">
                                <button class="w-full p-3 text-left flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                    <span class="font-medium">退出登录</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getNotFoundPage() {
        return `
            <div class="flex items-center justify-center h-full">
                <div class="text-center">
                    <h2 class="text-2xl font-semibold text-gray-800 mb-2">页面未找到</h2>
                    <p class="text-gray-500">抱歉，您访问的页面不存在</p>
                </div>
            </div>
        `;
    }

    // ==================== 页面事件初始化 ====================

    initPageEvents(pageName) {
        switch(pageName) {
            case 'contract-write':
                this.initContractWriteEvents();
                break;
            case 'contract-review':
                this.initContractReviewEvents();
                break;
            case 'contract-manage':
                this.initContractManageEvents();
                break;
        }
    }

    initContractWriteEvents() {
        const contractContent = document.getElementById('contractContent');
        const contractTitle = document.getElementById('contractTitle');
        const templateSelect = document.getElementById('templateSelect');
        const customTypeContainer = document.getElementById('customTypeContainer');
        const customContractType = document.getElementById('customContractType');
        // 使用原有的预览区元素
        const previewContent = document.getElementById('preview-content');

        // 监听模板选择变化，显示/隐藏自定义合同类型输入框
        if (templateSelect && customTypeContainer) {
            templateSelect.addEventListener('change', () => {
                if (templateSelect.value === '自定义合同') {
                    customTypeContainer.style.display = 'block';
                } else {
                    customTypeContainer.style.display = 'none';
                }
            });
        }

        // 实时同步预览功能
        const updatePreview = () => {
            if (!previewContent) return;

            const title = contractTitle?.value || '合同标题';
            const content = contractContent?.value || '';

            if (!content.trim()) {
                previewContent.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p class="text-sm">在左侧编辑合同内容</p>
                        <p class="text-xs mt-1">预览将实时显示</p>
                    </div>
                `;
                return;
            }

            // 格式化合同内容用于预览
            const formattedContent = content
                .replace(/\n/g, '<br>')
                .replace(/第[一二三四五六七八九十百]+条/g, '<br><strong>$&</strong>')
                .replace(/甲方[：:][^？？\n]*/g, '<strong>$&</strong><br>')
                .replace(/乙方[：:][^？？\n]*/g, '<strong>$&</strong><br>');

            previewContent.innerHTML = `
                <div class="contract-preview">
                    <h1 class="text-2xl font-bold text-center mb-8 text-gray-800">${title}</h1>
                    <div class="text-gray-700 leading-relaxed space-y-4">
                        ${formattedContent}
                    </div>
                </div>
            `;
        };

        // 监听输入变化实时更新预览
        if (contractContent) {
            contractContent.addEventListener('input', updatePreview);
        }
        if (contractTitle) {
            contractTitle.addEventListener('input', updatePreview);
        }

        // 开始编写按钮
        const startWriteBtn = document.getElementById('startWriteBtn');
        if (startWriteBtn) {
            startWriteBtn.addEventListener('click', async () => {
                const template = templateSelect?.value;
                const title = contractTitle?.value || '合同';

                if (template === '请选择合同模板...') {
                    alert('请先选择合同模板');
                    return;
                }

                // 检查是否为自定义合同且未填写类型
                if (template === '自定义合同') {
                    const customType = customContractType?.value?.trim();
                    if (!customType) {
                        alert('请输入自定义合同类型');
                        return;
                    }
                }

                // 使用 AI 生成合同内容
                await this.generateContractWithAI(template, title, customContractType?.value);
            });
        }

        // 重新生成按钮
        const regenerateBtn = document.getElementById('regenerateBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                if (contractContent) {
                    contractContent.value = '';
                    if (contractTitle) contractTitle.value = '';
                    if (customContractType) customContractType.value = '';
                    updatePreview();
                    // 重置状态
                    this.currentDraftId = null;
                    const downloadBtn = document.getElementById('downloadBtn');
                    if (downloadBtn) downloadBtn.disabled = true;
                }
            });
        }

        // 下载合同按钮
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadContract();
            });
        }
                    updatePreview();
                }
            });
        }
    }

    // 显示加载状态
    showLoading(message) {
        // 创建加载遮罩层
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="bg-white rounded-lg p-8 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                <p class="text-gray-700 font-medium">${message}</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    // 隐藏加载状态
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // 使用 AI 生成合同内容
    async generateContractWithAI(template, title, customType) {
        // 防止重复生成
        if (this.isGenerating) {
            alert('正在生成中，请稍候...');
            return;
        }

        this.isGenerating = true;
        this.showLoading('正在生成合同...');

        try {
            // 确定合同类型
            let contractType = template;
            let userRequirement = `生成一份${template}`;

            if (template === '自定义合同') {
                contractType = customType;
                userRequirement = `生成一份${customType}`;
            }

            // Step 1: 创建草稿
            const createResponse = await fetch('http://127.0.0.1:8000/api/writing/drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    user_requirement: userRequirement
                })
            });

            if (!createResponse.ok) {
                throw new Error('创建草稿失败');
            }

            const draft = await createResponse.json();
            this.currentDraftId = draft.id;

            // Step 2: 触发 AI 生成
            const generateResponse = await fetch(`http://127.0.0.1:8000/api/writing/drafts/${draft.id}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract_type: contractType,
                    elements: {}
                })
            });

            if (!generateResponse.ok) {
                throw new Error('触发生成失败');
            }

            // Step 3: 轮询等待生成完成
            const generatedDraft = await this.pollForGeneration(draft.id);

            // Step 4: 显示生成的内容
            const content = generatedDraft.final_content || generatedDraft.generated_content;
            const contractContent = document.getElementById('contractContent');
            if (contractContent) {
                contractContent.value = content;
                // 触发预览更新
                contractContent.dispatchEvent(new Event('input'));
            }

            // 启用下载按钮
            const downloadBtn = document.getElementById('downloadBtn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }

            this.hideLoading();
            this.isGenerating = false;

        } catch (error) {
            this.hideLoading();
            this.isGenerating = false;
            console.error('合同生成失败:', error);
            alert('合同生成失败：' + error.message);
        }
    }

    // 轮询等待生成完成
    async pollForGeneration(draftId, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            const response = await fetch(`http://127.0.0.1:8000/api/writing/drafts/${draftId}`);

            if (!response.ok) {
                throw new Error('查询草稿状态失败');
            }

            const draft = await response.json();

            if (draft.status === 'generated') {
                return draft;
            } else if (draft.status === 'failed') {
                throw new Error('合同生成失败');
            }

            // 等待 2 秒后再次查询
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        throw new Error('合同生成超时，请稍后重试');
    }

    // 下载合同
    downloadContract() {
        if (!this.currentDraftId) {
            alert('请先生成合同');
            return;
        }

        // 直接跳转到下载链接
        window.location.href = `http://127.0.0.1:8000/api/writing/drafts/${this.currentDraftId}/download`;
    }

    // 生成示例合同内容
    generateSampleContract(template, title) {
        const contracts = {
            '劳动合同': `${title}

甲方：____________________
法定代表人：____________________
地址：____________________
联系电话：____________________

乙方：____________________
身份证号码：____________________
住址：____________________
联系电话：____________________

根据《中华人民共和国劳动合同法》及相关法律法规，甲乙双方本着平等自愿、协商一致的原则，签订本劳动合同。

第一条 合同期限
本合同为固定期限劳动合同，期限为___年，自____年__月__日起至____年__月__日止。

第二条 工作内容
乙方同意根据甲方工作需要，担任__________岗位（工种）工作。

第三条 工作时间和休息休假
1. 甲方实行标准工时制，每日工作8小时，每周工作40小时。
2. 乙方享有国家规定的法定节假日及年休假。

第四条 劳动报酬
1. 乙方的月工资为__________元。
2. 甲方应于每月__日支付乙方工资。

第五条 社会保险
甲方应按国家和地方规定为乙方缴纳社会保险费。

本合同一式两份，甲乙双方各执一份。

甲方（盖章）：____________________
乙方（签字）：____________________

日期：____年__月__日`,

            '销售合同': `${title}

甲方（卖方）：____________________
法定代表人：____________________
地址：____________________
联系电话：____________________

乙方（买方）：____________________
法定代表人：____________________
地址：____________________
联系电话：____________________

根据《中华人民共和国合同法》及相关法律法规，甲乙双方经友好协商，就买卖事宜达成如下协议：

第一条 产品名称、规格、数量及价格
1. 产品名称：____________________
2. 规格型号：____________________
3. 数量：____________________
4. 单价：____________________元
5. 总价：____________________元

第二条 质量标准
产品应符合国家相关质量标准及双方约定的技术要求。

第三条 交货时间及方式
1. 交货时间：____年__月__日前
2. 交货地点：____________________
3. 运输方式及费用：____________________

第四条 付款方式
乙方应于合同签订后__日内支付合同总额的__%作为预付款，余款于收到货物并验收合格后__日内付清。

第五条 违约责任
1. 甲方逾期交货的，应按日向乙方支付合同总额__%的违约金。
2. 乙方逾期付款的，应按日向甲方支付合同总额__%的违约金。

本合同一式两份，甲乙双方各执一份。

甲方（盖章）：____________________
乙方（盖章）：____________________

日期：____年__月__日`,

            '服务协议': `${title}

甲方（委托方）：____________________
法定代表人：____________________
地址：____________________
联系电话：____________________

乙方（服务方）：____________________
法定代表人：____________________
地址：____________________
联系电话：____________________

根据《中华人民共和国合同法》及相关法律法规，甲乙双方本着平等互利的原则，就服务事宜达成如下协议：

第一条 服务内容
乙方向甲方提供____________________服务。

第二条 服务期限
服务期限自____年__月__日起至____年__月__日止。

第三条 服务费用及支付方式
1. 服务费用总额为人民币__________元。
2. 支付方式：____________________
3. 支付时间：____________________

第四条 双方权利义务
1. 甲方权利义务：
   - 按约定支付服务费用
   - 提供必要的协助和配合
   - 对服务质量进行监督

2. 乙方权利义务：
   - 按约定提供优质服务
   - 保证服务质量符合约定标准
   - 对甲方信息予以保密

第五条 违约责任
任何一方违反本协议约定，应承担违约责任，赔偿对方因此造成的损失。

本协议一式两份，甲乙双方各执一份。

甲方（盖章）：____________________
乙方（盖章）：____________________

日期：____年__月__日`,

            '保密协议': `${title}

甲方：____________________
地址：____________________

乙方：____________________
身份证号码：____________________
住址：____________________

为保护甲方的商业秘密，维护甲方的合法权益，甲乙双方根据《中华人民共和国反不正当竞争法》及相关法律法规，本着平等自愿、公平诚信的原则，达成如下保密协议：

第一条 保密信息的范围
本协议所称保密信息包括但不限于：
1. 技术信息：设计方案、制造方法、工艺流程、技术数据等；
2. 经营信息：客户名单、营销计划、财务数据、招投标信息等；
3. 其他甲方书面声明需要保密的信息。

第二条 保密义务
1. 乙方承诺对甲方的保密信息严格保密；
2. 未经甲方书面同意，乙方不得向任何第三方披露保密信息；
3. 乙方不得利用保密信息从事与甲方业务相竞争的活动。

第三条 保密期限
保密期限自本协议生效之日起，至保密信息为公众所知悉之日止。

第四条 违约责任
乙方违反本协议约定的保密义务，应赔偿甲方因此遭受的全部损失。

本协议一式两份，甲乙双方各执一份。

甲方（盖章）：____________________
乙方（签字）：____________________

日期：____年__月__日`,

            '租赁合同': `${title}

出租方（甲方）：____________________
联系电话：____________________
身份证号码：____________________

承租方（乙方）：____________________
联系电话：____________________
身份证号码：____________________

根据《中华人民共和国合同法》及相关法律法规，甲乙双方本着平等自愿的原则，就房屋租赁事宜达成如下协议：

第一条 房屋基本情况
1. 房屋座落：____________________
2. 房屋面积：____________________平方米
3. 房屋用途：____________________

第二条 租赁期限
租赁期限自____年__月__日起至____年__月__日止，共计__个月。

第三条 租金及支付方式
1. 月租金为人民币__________元；
2. 租金支付方式：□月付 □季付 □半年付 □年付
3. 乙方应于每期开始前__日内支付当期租金。

第四条 押金
乙方应于本合同签订之日向甲方支付押金人民币__________元。租赁期满后，如乙方无违约行为，甲方应全额退还押金。

第五条 其他费用
租赁期间产生的水、电、气、物业费等费用由□甲方/□乙方承担。

第六条 违约责任
任何一方违反本合同约定，应向对方支付月租金__%的违约金。

本合同一式两份，甲乙双方各执一份。

甲方（签字）：____________________
乙方（签字）：____________________

日期：____年__月__日`
        };

        return contracts[template] || `${title}\n\n请选择有效的合同模板生成内容。`;
    }

    initContractReviewEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const removeFile = document.getElementById('removeFile');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileSelect(file, fileName, fileSize, fileInfo);
                }
            });

            // 拖拽上传
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-primary-500', 'bg-primary-50');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileSelect(file, fileName, fileSize, fileInfo);
                }
            });
        }

        if (removeFile) {
            removeFile.addEventListener('click', (e) => {
                e.stopPropagation();
                this.resetFileUpload(fileInfo, fileInput);
            });
        }

        // 开始审查按钮
        const startReviewBtn = document.getElementById('startReviewBtn');
        if (startReviewBtn) {
            startReviewBtn.addEventListener('click', () => this.startReview(startReviewBtn));
        }

        // 查看审查结果按钮
        const viewReviewBtn = document.getElementById('viewReviewBtn');
        if (viewReviewBtn) {
            viewReviewBtn.addEventListener('click', () => {
                // 如果有正在进行的审查，轮询结果
                if (this.currentReviewId) {
                    this.pollReviewResult();
                    return;
                }

                // 如果没有审查记录，提示用户
                if (!this.currentFile && !this.currentContractId) {
                    this.showToast('请先选择文件并开始审查', 'info');
                    return;
                }

                // 显示结果区域（如果有已保存的结果）
                const reviewResults = document.getElementById('reviewResults');
                if (reviewResults) {
                    reviewResults.classList.remove('hidden');
                    // 检查是否有内容
                    const resultsContent = reviewResults.querySelector('.space-y-4');
                    if (resultsContent && resultsContent.children.length === 0) {
                        resultsContent.innerHTML = `
                            <div class="bg-white rounded-lg border border-gray-200 p-5 text-center">
                                <p class="text-gray-500">暂无审查结果，请点击"开始审查"按钮开始AI审核</p>
                            </div>
                        `;
                    }
                }
            });
        }
    }

    // 处理文件选择
    handleFileSelect(file, fileNameEl, fileSizeEl, fileInfoEl) {
        // 验证文件格式
        if (!file.name.endsWith('.docx')) {
            this.showToast('仅支持 .docx 格式', 'error');
            return;
        }

        // 验证文件大小
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('文件过大，最大支持 10MB', 'error');
            return;
        }

        this.currentFile = file;

        // 更新 UI
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        fileInfoEl.classList.remove('hidden');

        // 更新预览区
        this.updateContractPreview(file);
    }

    // 重置文件上传
    resetFileUpload(fileInfoEl, fileInput) {
        this.currentFile = null;
        this.currentContractId = null;
        this.currentReviewId = null;

        if (fileInfoEl) fileInfoEl.classList.add('hidden');
        if (fileInput) fileInput.value = '';

        // 重置预览区
        this.resetPreview();

        // 停止轮询
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    // 更新合同预览
    async updateContractPreview(file) {
        const previewContent = document.getElementById('preview-content');
        if (!previewContent) return;

        // 显示加载状态
        previewContent.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center">
                <div class="animate-spin w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                <p class="text-sm text-gray-600">正在解析合同内容...</p>
            </div>
        `;

        try {
            const reader = new FileReader();

            reader.onload = (e) => {
                const arrayBuffer = e.target.result;

                // 使用 mammoth 解析 .docx 文件
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    .then((result) => {
                        const text = result.value;
                        this.displayContractContent(text, file.name);
                    })
                    .catch((error) => {
                        console.error('解析文件失败:', error);
                        previewContent.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-full text-center">
                                <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                </div>
                                <p class="text-sm text-red-600">解析文件失败</p>
                                <p class="text-xs text-gray-400 mt-1">请检查文件格式是否正确</p>
                            </div>
                        `;
                    });
            };

            reader.onerror = () => {
                previewContent.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center">
                        <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <p class="text-sm text-red-600">读取文件失败</p>
                    </div>
                `;
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('预览文件失败:', error);
        }
    }

    // 显示合同内容
    displayContractContent(text, fileName) {
        const previewContent = document.getElementById('preview-content');
        if (!previewContent) return;

        // 保存原始合同数据
        this.previewData.originalContract = text;
        this.previewData.contractFileName = fileName;
        this.previewView = 'contract';

        // 格式化文本内容
        const formattedText = this.formatContractText(text);

        previewContent.innerHTML = `
            <div class="contract-preview">
                ${this.renderPreviewHeader()}
                <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words max-h-[calc(100vh-200px)] overflow-y-auto">
                    ${formattedText}
                </div>
            </div>
        `;
    }

    // 渲染预览区头部（带切换按钮和下载按钮）
    renderPreviewHeader() {
        const hasReport = !!this.previewData.reviewReport;
        const hasOriginalContract = !!this.previewData.originalContract;

        // 如果没有报告，显示简单标题
        if (!hasReport) {
            return `
                <div class="mb-4 pb-4 border-b border-gray-200">
                    <h3 class="text-sm font-semibold text-gray-800 mb-1">合同预览</h3>
                    <p class="text-xs text-gray-500">${this.previewData.contractFileName || '未命名文件'}</p>
                </div>
            `;
        }

        // 如果有审查结果，显示切换按钮和下载按钮
        return `
            <div class="mb-4 pb-4 border-b border-gray-200">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-gray-800">审查结果</h3>
                    ${hasReport ? `
                    <div class="flex gap-2">
                        <button onclick="app.downloadReport()" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all bg-gray-100 text-gray-700 hover:bg-gray-200" title="下载审查报告">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            报告
                        </button>
                        <button onclick="app.downloadAnnotatedFile()" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow" title="下载审查后合同">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            合同
                        </button>
                    </div>
                    ` : ''}
                </div>
                <div class="flex gap-2 flex-wrap">
                    <button onclick="app.switchPreviewView('contract')" class="preview-tab-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        this.previewView === 'contract'
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }" ${!hasOriginalContract ? 'disabled' : ''}>
                        📄 原始合同
                    </button>
                    ${hasReport ? `
                    <button onclick="app.switchPreviewView('report')" class="preview-tab-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        this.previewView === 'report'
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }">
                        📊 审查报告
                    </button>
                    ` : ''}
                    ${hasReport ? `
                    <button onclick="app.switchPreviewView('reviewed')" class="preview-tab-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        this.previewView === 'reviewed'
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }">
                        ✏️ 审查后合同
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 切换预览视图
    switchPreviewView(view) {
        console.log('切换预览视图:', view);
        console.log('当前预览数据:', {
            hasOriginal: !!this.previewData.originalContract,
            hasReport: !!this.previewData.reviewReport,
            hasReviewed: !!this.previewData.reviewedContract
        });

        this.previewView = view;
        const previewContent = document.getElementById('preview-content');
        if (!previewContent) {
            console.error('未找到 preview-content 元素');
            return;
        }

        let content = '';
        switch(view) {
            case 'contract':
                if (this.previewData.originalContract) {
                    const formattedText = this.formatContractText(this.previewData.originalContract);
                    content = `
                        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words max-h-[calc(100vh-200px)] overflow-y-auto">
                            ${formattedText}
                        </div>
                    `;
                } else {
                    content = '<p class="text-sm text-gray-500">暂无原始合同</p>';
                }
                break;
            case 'report':
                if (this.previewData.reviewReport) {
                    content = this.renderReviewReportHTML(this.previewData.reviewReport);
                } else {
                    content = '<p class="text-sm text-gray-500">暂无审查报告</p>';
                }
                break;
            case 'reviewed':
                if (this.previewData.originalContract && this.previewData.reviewReport) {
                    content = this.renderAnnotatedContract(this.previewData.originalContract, this.previewData.reviewReport);
                } else if (this.previewData.reviewReport) {
                    // 如果有审查报告但没有原始合同，尝试从其他来源获取
                    content = `
                        <div class="flex flex-col items-center justify-center h-full text-center">
                            <div class="animate-spin w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                            <p class="text-sm text-gray-600">正在加载原始合同...</p>
                        </div>
                    `;
                    // 异步获取原始合同
                    this.loadOriginalContractAndRender();
                } else {
                    content = '<p class="text-sm text-gray-500">暂无审查后的合同</p>';
                }
                break;
        }

        const headerHtml = this.renderPreviewHeader();
        console.log('生成的头部HTML:', headerHtml.substring(0, 200) + '...');

        previewContent.innerHTML = `
            <div class="contract-preview">
                ${headerHtml}
                ${content}
            </div>
        `;
    }

    // 渲染审查报告HTML
    renderReviewReportHTML(report) {
        if (!report) return '<p class="text-sm text-gray-500">暂无审查报告</p>';

        const issues = report.issues || [];
        const highIssues = issues.filter(i => i.severity === '高');
        const mediumIssues = issues.filter(i => i.severity === '中');
        const lowIssues = issues.filter(i => i.severity === '低');

        let html = `
            <div class="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <!-- 风险统计 -->
                <div class="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-100">
                    <h4 class="text-sm font-semibold text-gray-800 mb-2">风险统计</h4>
                    <div class="flex gap-4 text-xs">
                        <span class="text-red-600 font-medium">🔴 高风险: ${report.high_risk_count || highIssues.length}</span>
                        <span class="text-yellow-600 font-medium">🟡 中风险: ${report.medium_risk_count || mediumIssues.length}</span>
                        <span class="text-green-600 font-medium">🟢 低风险: ${report.low_risk_count || lowIssues.length}</span>
                    </div>
                </div>
        `;

        if (issues.length === 0) {
            html += `
                <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm font-medium text-green-700">未发现明显风险点</p>
                    </div>
                </div>
            `;
        } else {
            if (highIssues.length > 0) {
                html += `
                    <div class="bg-red-50 rounded-lg p-3 border border-red-200">
                        <h5 class="text-xs font-semibold text-red-700 mb-2">🔴 高风险 (${highIssues.length})</h5>
                        ${highIssues.map(issue => `
                            <div class="border-l-2 border-red-400 bg-white rounded-r p-2 mb-2 last:mb-0">
                                <div class="text-xs font-medium text-gray-800">${issue.category || '未分类'}</div>
                                <div class="text-xs text-gray-500 mt-1">📍 ${issue.location_hint || '未知位置'}</div>
                                <div class="text-xs text-gray-700 mt-1">
                                    <p><strong>问题：</strong>${issue.problem}</p>
                                    <p><strong>建议：</strong>${issue.suggestion}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (mediumIssues.length > 0) {
                html += `
                    <div class="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <h5 class="text-xs font-semibold text-yellow-700 mb-2">🟡 建议修改 (${mediumIssues.length})</h5>
                        ${mediumIssues.map(issue => `
                            <div class="border-l-2 border-yellow-400 bg-white rounded-r p-2 mb-2 last:mb-0">
                                <div class="text-xs font-medium text-gray-800">${issue.category || '未分类'}</div>
                                <div class="text-xs text-gray-500 mt-1">📍 ${issue.location_hint || '未知位置'}</div>
                                <div class="text-xs text-gray-700 mt-1">
                                    <p><strong>问题：</strong>${issue.problem}</p>
                                    <p><strong>建议：</strong>${issue.suggestion}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (lowIssues.length > 0) {
                html += `
                    <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h5 class="text-xs font-semibold text-blue-700 mb-2">🟢 优化建议 (${lowIssues.length})</h5>
                        ${lowIssues.map(issue => `
                            <div class="border-l-2 border-blue-400 bg-white rounded-r p-2 mb-2 last:mb-0">
                                <div class="text-xs font-medium text-gray-800">${issue.category || '未分类'}</div>
                                <div class="text-xs text-gray-500 mt-1">📍 ${issue.location_hint || '未知位置'}</div>
                                <div class="text-xs text-gray-700 mt-1">
                                    <p><strong>问题：</strong>${issue.problem}</p>
                                    <p><strong>建议：</strong>${issue.suggestion}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        html += '</div>';
        return html;
    }

    // 渲染带批注的合同（左右分栏布局）
    renderAnnotatedContract(contractText, reviewReport) {
        console.log('renderAnnotatedContract 被调用');
        console.log('contractText 长度:', contractText ? contractText.length : 0);
        console.log('reviewReport:', reviewReport);

        if (!contractText || !reviewReport) return '<p class="text-sm text-gray-500">暂无内容</p>';

        const issues = reviewReport.issues || [];
        console.log('issues 数量:', issues.length);

        if (issues.length === 0) {
            return `
                <div class="text-sm text-gray-700 p-4 text-center">
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-medium text-green-700">未发现问题</span>
                    </div>
                    <p class="text-xs text-gray-500">合同内容经过AI审查，未发现明显风险点</p>
                </div>
            `;
        }

        // 生成唯一标识符
        const containerId = 'annotated-contract-' + Date.now();

        // 为每个问题创建标记ID
        const issuesWithIds = issues.map((issue, index) => ({
            ...issue,
            id: `issue-${index}`
        }));

        // 渲染双栏布局（无定位匹配）
        let html = `
            <div id="${containerId}" class="annotated-contract-container relative max-h-[calc(100vh-200px)] overflow-y-auto">
                <!-- 表头 -->
                <div class="flex sticky top-0 bg-white z-20 border-b border-gray-200 shadow-sm">
                    <div class="flex-1 px-4 py-3 text-sm font-medium text-gray-600 border-r border-gray-200">📄 合同原文</div>
                    <div class="w-96 flex-shrink-0 px-4 py-3 text-sm font-medium text-gray-600">📝 批注建议 (${issuesWithIds.length})</div>
                </div>

                <!-- 双栏内容区域 -->
                <div class="flex">
                    <!-- 左侧：合同原文 -->
                    <div class="flex-1 border-r border-gray-200 bg-white">
                        <div class="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                            ${this.escapeHtml(contractText)}
                        </div>
                    </div>

                    <!-- 右侧：批注建议列表 -->
                    <div class="w-96 flex-shrink-0 bg-gray-50 p-4 space-y-3">
        `;

        // 渲染所有批注
        issuesWithIds.forEach((issue) => {
            const severityClass = issue.severity === '高' ? 'border-red-300 bg-red-50' :
                                  issue.severity === '中' ? 'border-yellow-300 bg-yellow-50' :
                                  'border-blue-300 bg-blue-50';
            const severityBadge = issue.severity === '高' ? 'bg-red-500 text-white' :
                                  issue.severity === '中' ? 'bg-yellow-500 text-white' :
                                  'bg-blue-500 text-white';
            const severityText = issue.severity || '中';

            html += `
                <div class="annotation-card rounded-lg border ${severityClass} p-3 shadow-sm hover:shadow-md transition-all">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-medium px-2 py-0.5 rounded ${severityBadge}">${severityText}风险</span>
                        <span class="text-xs text-gray-600">${issue.category || '未分类'}</span>
                    </div>
                    <div class="text-xs text-gray-700 mb-2">
                        <span class="font-semibold">📍 位置：</span><span class="text-gray-600">${issue.location_hint || '未指定'}</span>
                    </div>
                    <div class="text-xs text-gray-700 mb-2">
                        <span class="font-semibold">⚠️ 问题：</span>${issue.problem}
                    </div>
                    <div class="text-xs text-gray-700">
                        <span class="font-semibold">💡 建议：</span><span class="text-blue-700">${issue.suggestion}</span>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // 构建条款与行号的映射表
    buildClauseLineMap(lines) {
        const clauseMap = new Map();

        // 条款编号的正则模式（支持多种格式）
        const clausePatterns = [
            /^第([一二三四五六七八九十百千0-9]+)条/,  // 第一条、第1条
            /^([一二三四五六七八九十百千]+)[、.]/,     // 一、
            /^(\d+)[、.]/,                             // 1、、1.
            /^第([一二三四五六七八九十百千0-9]+)款/,  // 第一款、第1款
            /^([一二三四五六七八九十百千]+)是/,        // 一是
        ];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            for (const pattern of clausePatterns) {
                const match = trimmedLine.match(pattern);
                if (match) {
                    let clauseNum = match[1];

                    // 将中文数字转换为阿拉伯数字
                    const arabicNum = this.chineseNumberToArabic(clauseNum);
                    if (arabicNum > 0) {
                        clauseMap.set(arabicNum, lineNum);
                        // 同时存储原始格式的映射
                        clauseMap.set(`第${arabicNum}条`, lineNum);
                        clauseMap.set(`第${clauseNum}条`, lineNum);
                    }
                    break;
                }
            }
        });

        return clauseMap;
    }

    // 中文数字转阿拉伯数字
    chineseNumberToArabic(chineseNum) {
        // 如果已经是阿拉伯数字，直接返回
        if (/^\d+$/.test(chineseNum)) {
            return parseInt(chineseNum, 10);
        }

        const chineseToArabicMap = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
            '百': 100, '千': 1000
        };

        // 简单转换（支持1-10）
        if (chineseToArabicMap[chineseNum]) {
            return chineseToArabicMap[chineseNum];
        }

        // 处理十一到十九
        if (chineseNum.startsWith('十') && chineseNum.length > 1) {
            return 10 + this.chineseNumberToArabic(chineseNum.slice(1));
        }

        // 处理二十以上
        if (chineseNum.includes('十')) {
            const parts = chineseNum.split('十');
            let result = 0;
            if (parts[0]) {
                result += this.chineseNumberToArabic(parts[0]) * 10;
            } else {
                result += 10;
            }
            if (parts[1]) {
                result += this.chineseNumberToArabic(parts[1]);
            }
            return result;
        }

        return 0;
    }

    // 从位置提示中提取行号（已弃用，保留用于兼容）
    extractLineNumber(locationHint) {
        if (!locationHint) return null;

        // 尝试匹配 "第X行"、"line X" 等模式
        const patterns = [
            /第(\d+)行/,
            /line\s*(\d+)/i,
            /(\d+)行/
        ];

        for (const pattern of patterns) {
            const match = locationHint.match(pattern);
            if (match) {
                return parseInt(match[1], 10);
            }
        }

        return null;
    }

    // 根据批注内容智能匹配合同行号
    // 纯内容智能匹配：根据批注内容匹配合同行（不依赖行号）
    findMatchingLineNumberByContent(issue, lines) {
        // 1. 从 location_hint 中提取关键词（去除"第X条"等）
        let searchKeyword = '';
        if (issue.location_hint) {
            // 移除条款编号标记，保留内容关键词
            searchKeyword = issue.location_hint
                .replace(/第\d+条/g, '')
                .replace(/第[一二三四五六七八九十百千]+条/g, '')
                .replace(/第\d+款/g, '')
                .replace(/第\d+行/g, '')
                .replace(/line\s*\d+/gi, '')
                .replace(/合同中/g, '')
                .replace(/关于/g, '')
                .replace(/相关/g, '')
                .trim();
        }

        // 2. 从 problem 中提取关键词
        let problemKeyword = '';
        if (issue.problem) {
            // 提取引号中的内容
            const quotedMatch = issue.problem.match(/["「『]([^"」』]+)["」』]/);
            if (quotedMatch) {
                problemKeyword = quotedMatch[1];
            } else {
                // 去除常见描述词，提取核心词
                problemKeyword = issue.problem
                    .replace(/缺少|没有|未|缺失|应该|建议|存在|过于|偏高|偏低|不明确|不当|风险/g, '')
                    .replace(/条款|规定|内容|约定|问题|事项/g, '')
                    .replace(/该|此|本/g, '')
                    .trim();
            }
        }

        // 3. 从 suggestion 中也可能提取关键词（作为备选）
        let suggestionKeyword = '';
        if (issue.suggestion) {
            // 提取建议中的核心条款内容
            suggestionKeyword = issue.suggestion
                .replace(/建议|修改|增加|补充|删除|调整为|改为/g, '')
                .replace(/该|此|本/g, '')
                .trim();
        }

        // 收集所有关键词，按优先级排序
        const keywords = [];
        if (searchKeyword && searchKeyword.length > 1) keywords.push({ keyword: searchKeyword, priority: 1 });
        if (problemKeyword && problemKeyword.length > 1) keywords.push({ keyword: problemKeyword, priority: 2 });
        if (suggestionKeyword && suggestionKeyword.length > 1) keywords.push({ keyword: suggestionKeyword, priority: 3 });

        // 4. 在合同行中搜索匹配
        let bestMatch = null;
        let bestScore = 0;

        for (const { keyword, priority } of keywords) {
            if (keyword.length < 2) continue;

            for (let i = 0; i < lines.length; i++) {
                const lineNum = i + 1;
                const line = lines[i].trim();
                const score = this.calculateMatchScore(keyword, line, priority);

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = lineNum;
                }

                // 如果已经找到完全匹配，直接返回
                if (score >= 100) {
                    return lineNum;
                }
            }
        }

        // 返回最佳匹配（降低分数阈值，提高匹配成功率）
        return bestScore >= 15 ? bestMatch : null;
    }

    // 原有的复杂匹配方法（已弃用，保留用于兼容）
    findMatchingLineNumber(issue, lines, clauseLineMap) {
        console.log('开始匹配批注:', issue.location_hint, issue.problem);

        // 第一步：尝试从 location_hint 中提取条款编号
        if (issue.location_hint && clauseLineMap) {
            // 匹配 "第X条" 格式
            const clauseMatch = issue.location_hint.match(/第([一二三四五六七八九十百千0-9]+)条/);
            if (clauseMatch) {
                const clauseNum = clauseMatch[1];
                const arabicNum = this.chineseNumberToArabic(clauseNum);

                // 查找条款映射表
                let targetLine = clauseLineMap.get(arabicNum);
                if (!targetLine) {
                    targetLine = clauseLineMap.get(`第${arabicNum}条`);
                }
                if (!targetLine) {
                    targetLine = clauseLineMap.get(`第${clauseNum}条`);
                }

                if (targetLine) {
                    console.log(`通过条款编号匹配: 第${clauseNum}条 -> 行${targetLine}`);
                    return targetLine;
                }
            }

            // 匹配 "第X行" 格式（直接行号）
            const lineMatch = issue.location_hint.match(/第([0-9]+)行/);
            if (lineMatch) {
                const lineNum = parseInt(lineMatch[1], 10);
                if (lineNum > 0 && lineNum <= lines.length) {
                    console.log(`通过行号匹配: 行${lineNum}`);
                    return lineNum;
                }
            }
        }

        // 第二步：如果条款匹配失败，使用内容智能匹配
        console.log('条款匹配失败，使用内容匹配');

        // 1. 从 location_hint 中提取关键词（去除"第X条"等）
        let searchKeyword = '';
        if (issue.location_hint) {
            // 移除行号标记，保留内容关键词
            searchKeyword = issue.location_hint
                .replace(/第\d+条/g, '')
                .replace(/第[一二三四五六七八九十百千]+条/g, '')
                .replace(/第\d+款/g, '')
                .replace(/第\d+行/g, '')
                .replace(/line\s*\d+/gi, '')
                .replace(/合同中/g, '')
                .replace(/关于/g, '')
                .replace(/相关/g, '')
                .trim();
        }

        // 2. 从 problem 中提取关键词
        let problemKeyword = '';
        if (issue.problem) {
            // 提取引号中的内容
            const quotedMatch = issue.problem.match(/["「『]([^"」』]+)["」』]/);
            if (quotedMatch) {
                problemKeyword = quotedMatch[1];
            } else {
                // 去除常见描述词，提取核心词
                problemKeyword = issue.problem
                    .replace(/缺少|没有|未|缺失|应该|建议|存在|过于|偏高|偏低|不明确|不当|风险/g, '')
                    .replace(/条款|规定|内容|约定|问题|事项/g, '')
                    .replace(/该|此|本/g, '')
                    .trim();
            }
        }

        // 3. 从 suggestion 中也可能提取关键词（作为备选）
        let suggestionKeyword = '';
        if (issue.suggestion) {
            // 提取建议中的核心条款内容
            suggestionKeyword = issue.suggestion
                .replace(/建议|修改|增加|补充|删除|调整为|改为/g, '')
                .replace(/该|此|本/g, '')
                .trim();
        }

        // 收集所有关键词，按优先级排序
        const keywords = [];
        if (searchKeyword && searchKeyword.length > 1) keywords.push({ keyword: searchKeyword, priority: 1 });
        if (problemKeyword && problemKeyword.length > 1) keywords.push({ keyword: problemKeyword, priority: 2 });
        if (suggestionKeyword && suggestionKeyword.length > 1) keywords.push({ keyword: suggestionKeyword, priority: 3 });

        // 4. 在合同行中搜索匹配
        let bestMatch = null;
        let bestScore = 0;

        for (const { keyword, priority } of keywords) {
            if (keyword.length < 2) continue;

            for (let i = 0; i < lines.length; i++) {
                const lineNum = i + 1;

                const line = lines[i].trim();
                const score = this.calculateMatchScore(keyword, line, priority);

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = lineNum;
                }

                // 如果已经找到完全匹配，直接返回
                if (score >= 100) {
                    console.log(`内容匹配成功: "${keyword}" -> 行${lineNum}`);
                    return lineNum;
                }
            }
        }

        if (bestMatch && bestScore >= 15) {
            console.log(`内容匹配完成: 行${bestMatch}, 分数=${bestScore}`);
            return bestMatch;
        }

        console.log('匹配失败');
        return null;
    }

    // 计算关键词与合同行的匹配分数
    calculateMatchScore(keyword, line, priority = 1) {
        if (!keyword || !line) return 0;

        // 完全匹配（最高分）
        if (line.includes(keyword)) {
            return 100 / priority; // 优先级越高，分数越高
        }

        // 分词匹配
        const keywordParts = keyword.split(/[，、；；,;\s]+/).filter(s => s.trim().length >= 2);
        if (keywordParts.length === 0) return 0;

        let matchCount = 0;
        let totalLength = 0;

        for (const part of keywordParts) {
            const trimmedPart = part.trim();
            if (trimmedPart.length < 2) continue;

            totalLength += trimmedPart.length;
            if (line.includes(trimmedPart)) {
                matchCount++;
            }
        }

        if (matchCount === 0) return 0;

        // 计算匹配比例和覆盖率
        const matchRatio = matchCount / keywordParts.length; // 匹配的词数比例
        const avgPartLength = totalLength / keywordParts.length;

        // 基础分数：匹配比例 * 60
        let score = matchRatio * 60;

        // 长度加成：匹配的关键词越长，分数越高
        score += Math.min(avgPartLength, 10) * 2;

        // 优先级加成
        score = score / priority;

        return Math.round(score);
    }

    // 转义HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 从不同来源加载原始合同
    async loadOriginalContractAndRender() {
        let contractText = null;

        // 1. 尝试从页面中的 textarea 获取
        const reviewContent = document.getElementById('reviewContent');
        if (reviewContent && reviewContent.value.trim()) {
            contractText = reviewContent.value.trim();
        }

        // 2. 如果没有，尝试从服务器获取
        if (!contractText && this.currentContractId) {
            try {
                const response = await fetch(`${this.API_BASE}/../contracts/${this.currentContractId}`);
                const data = await response.json();
                if (data.success && data.contract && data.contract.content) {
                    contractText = data.contract.content;
                }
            } catch (error) {
                console.error('从服务器获取原始合同失败:', error);
            }
        }

        // 3. 如果获取到了，保存并渲染
        if (contractText) {
            this.previewData.originalContract = contractText;
            if (!this.previewData.contractFileName) {
                this.previewData.contractFileName = '未命名文件';
            }
            this.switchPreviewView('reviewed');
        } else {
            // 如果无法获取，显示错误
            const previewContent = document.getElementById('preview-content');
            if (previewContent) {
                previewContent.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center p-6">
                        <div class="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <p class="text-sm text-gray-700 mb-2">无法加载原始合同内容</p>
                        <p class="text-xs text-gray-500">请确保已上传文件或在文本框中输入了合同内容</p>
                    </div>
                `;
            }
        }
    }

    // 格式化合同文本
    formatContractText(text) {
        if (!text) return '';

        // 移除多余的空行
        let formatted = text.replace(/\n{3,}/g, '\n\n');

        // 高亮关键条款
        const keywords = ['甲方', '乙方', '合同', '协议', '条款', '违约', '责任', '保密', '期限', '金额', '付款'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'g');
            formatted = formatted.replace(regex, '<span class="font-semibold text-primary-600">$1</span>');
        });

        return formatted;
    }

    // 重置预览区
    resetPreview() {
        const previewContent = document.getElementById('preview-content');
        if (!previewContent) return;

        previewContent.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                </div>
                <p class="text-sm text-gray-500">在左侧编辑合同内容</p>
                <p class="text-xs text-gray-400 mt-1">预览将实时显示</p>
            </div>
        `;
    }

    // 显示提示
    showToast(message, type = 'info') {
        // 简单的提示实现
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'success' ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // 上传文件
    async uploadFile() {
        if (!this.currentFile) return null;

        const formData = new FormData();
        formData.append('file', this.currentFile);
        formData.append('title', this.currentFile.name.replace('.docx', ''));

        try {
            this.showToast('正在上传文件...', 'info');

            const response = await fetch(`${this.API_BASE}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.currentContractId = data.contract_id;
                this.showToast('文件上传成功', 'success');
                return data.contract_id;
            } else {
                throw new Error(data.message || '上传失败');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
            return null;
        }
    }

    // 开始审查
    async startReview(buttonEl) {
        // 如果没有contractId，先上传文件
        if (!this.currentContractId) {
            if (!this.currentFile) {
                this.showToast('请先选择文件', 'error');
                return;
            }
            const contractId = await this.uploadFile();
            if (!contractId) return;
        }

        try {
            // 显示加载状态
            buttonEl.disabled = true;
            buttonEl.textContent = '审查中...';

            console.log('开始审查，合同ID:', this.currentContractId);

            // 更新智能备注区域
            const smartNotes = document.getElementById('smartNotes');
            if (smartNotes) {
                smartNotes.innerHTML = `
                    <div class="p-3 bg-white rounded-lg border border-amber-200">
                        <p class="text-sm text-gray-700">⏳ 正在分析合同内容...</p>
                    </div>
                `;
            }

            // 开始审查
            const reviewUrl = `${this.API_BASE}/${this.currentContractId}/start`;
            console.log('审查请求URL:', reviewUrl);

            const response = await fetch(reviewUrl, {
                method: 'POST'
            });

            console.log('审查响应状态:', response.status);

            const data = await response.json();
            console.log('审查响应数据:', data);

            if (data.id) {
                this.currentReviewId = data.id;
                this.showToast('审查已开始', 'success');

                // 轮询审查结果
                this.pollReviewResult();
            } else {
                throw new Error('启动审查失败');
            }
        } catch (error) {
            console.error('审查过程出错:', error);
            this.showToast(error.message, 'error');
            buttonEl.disabled = false;
            buttonEl.textContent = '开始审查';
        }
    }

    // 轮询审查结果
    pollReviewResult() {
        if (!this.currentReviewId) return;

        console.log('开始轮询审查结果，审查ID:', this.currentReviewId);

        // 清除之前的轮询
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }

        this.pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.API_BASE}/${this.currentReviewId}`);
                const data = await response.json();

                console.log('轮询状态:', data.status);

                if (data.status === 'completed') {
                    clearInterval(this.pollInterval);
                    console.log('审查完成，结果:', data);
                    this.displayReviewResult(data);
                } else if (data.status === 'failed') {
                    clearInterval(this.pollInterval);
                    console.error('审查失败:', data.error_message);
                    this.showToast('审查失败: ' + (data.error_message || '未知错误'), 'error');
                    this.resetReviewButton();
                }
                // 继续轮询
            } catch (error) {
                console.error('轮询过程出错:', error);
                clearInterval(this.pollInterval);
                this.showToast('获取审查结果失败', 'error');
                this.resetReviewButton();
            }
        }, 2000);
    }

    // 重置审查按钮
    resetReviewButton() {
        const buttonEl = document.getElementById('startReviewBtn');
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.textContent = '开始审查';
        }
    }

    // 显示审查结果
    displayReviewResult(data) {
        console.log('开始显示审查结果:', data);
        this.resetReviewButton();

        const smartNotes = document.getElementById('smartNotes');

        if (!data.result) {
            console.warn('审查结果为空');
            if (smartNotes) {
                smartNotes.innerHTML = `
                    <div class="p-3 bg-white rounded-lg border border-red-200">
                        <p class="text-sm text-red-700">❌ 审查结果为空</p>
                    </div>
                `;
            }
            return;
        }

        const result = data.result;
        const issues = result.issues || [];

        console.log('问题列表:', issues);

        // 保存审查报告到预览数据
        this.previewData.reviewReport = result;

        console.log('审查完成，预览数据:', this.previewData);
        console.log('原始合同存在:', !!this.previewData.originalContract);
        console.log('审查报告存在:', !!this.previewData.reviewReport);

        // 尝试获取审查后的合同文本（如果API返回的话）
        if (data.reviewed_contract_text) {
            this.previewData.reviewedContract = data.reviewed_contract_text;
        }

        // 更新预览区，显示审查报告
        this.previewView = 'report';
        this.switchPreviewView('report');

        // 更新智能备注
        if (smartNotes) {
            smartNotes.innerHTML = `
                <div class="p-3 bg-white rounded-lg border border-green-200">
                    <p class="text-sm text-gray-700">✅ 审核完成！发现 ${issues.length} 个问题</p>
                    <div class="mt-2 flex gap-4 text-xs">
                        <span class="text-red-600">🔴 高风险: ${result.high_risk_count || 0}</span>
                        <span class="text-yellow-600">🟡 中风险: ${result.medium_risk_count || 0}</span>
                        <span class="text-green-600">🟢 低风险: ${result.low_risk_count || 0}</span>
                    </div>
                </div>
            `;
        }

        // 不再显示结果区域（已移除审查结果、建议修改、下载审查文件模块）
    }

    // 渲染问题列表
    renderIssueList(issues) {
        return issues.map(issue => `
            <div class="border-l-4 ${
                issue.severity === '高' ? 'border-red-500 bg-red-50' :
                issue.severity === '中' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
            } rounded-r-lg p-3 mb-2">
                <div class="text-sm font-medium text-gray-800 mb-1">${issue.category || '未分类'}</div>
                <div class="text-xs text-gray-500 mb-2">📍 ${issue.location_hint || '未知位置'}</div>
                <div class="text-sm text-gray-700">
                    <p class="mb-1"><strong>问题：</strong>${issue.problem}</p>
                    <p><strong>建议：</strong>${issue.suggestion}</p>
                </div>
            </div>
        `).join('');
    }

    // 下载审查报告
    async downloadReport() {
        if (!this.currentReviewId) {
            this.showToast('未找到审查记录', 'error');
            return;
        }

        try {
            this.showToast('正在下载审查报告...', 'info');

            const response = await fetch(`${this.API_BASE}/${this.currentReviewId}/report`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                // 生成有意义的文件名
                const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const contractName = this.previewData.contractFileName?.replace(/\.[^/.]+$/, '') || 'contract';
                a.download = `${contractName}_审查报告_${timestamp}.txt`;

                a.click();
                window.URL.revokeObjectURL(url);
                this.showToast('审查报告下载成功', 'success');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '下载失败');
            }
        } catch (error) {
            console.error('下载审查报告失败:', error);
            this.showToast(error.message || '下载审查报告失败', 'error');
        }
    }

    // 下载审查后合同
    async downloadAnnotatedFile() {
        if (!this.currentReviewId) {
            this.showToast('未找到审查记录', 'error');
            return;
        }

        try {
            this.showToast('正在下载审查后合同...', 'info');

            const response = await fetch(`${this.API_BASE}/${this.currentReviewId}/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                // 生成有意义的文件名
                const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const contractName = this.previewData.contractFileName?.replace(/\.[^/.]+$/, '') || 'contract';
                a.download = `${contractName}_审查后_${timestamp}.docx`;

                a.click();
                window.URL.revokeObjectURL(url);
                this.showToast('审查后合同下载成功', 'success');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '下载失败');
            }
        } catch (error) {
            console.error('下载审查后合同失败:', error);
            this.showToast(error.message || '下载审查后合同失败', 'error');
        }
    }

    initContractManageEvents() {
        // 标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('text-primary-600', 'border-primary-600');
                    b.classList.add('text-gray-500', 'border-transparent');
                });
                e.target.classList.remove('text-gray-500', 'border-transparent');
                e.target.classList.add('text-primary-600', 'border-primary-600');
            });
        });

        // 合同卡片点击
        document.querySelectorAll('.contract-card').forEach(card => {
            card.addEventListener('click', () => {
                alert('打开合同详情');
            });
        });
    }
}

// 初始化应用
let app; // 全局实例，供HTML中的onclick调用
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
