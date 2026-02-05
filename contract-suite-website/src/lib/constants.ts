import iconWriting from "@/assets/icon-writing.png";
import iconReview from "@/assets/icon-review.png";
import iconManagement from "@/assets/icon-management.png";
import meetingImg from "@/assets/meeting.jpg";
import signingImg from "@/assets/signing.jpg";
import handshakeImg from "@/assets/handshake.jpg";

export const NAV_LINKS = [
  { label: "首页", href: "hero" },
  { label: "功能特色", href: "features" },
  { label: "解决方案", href: "solutions" },
  { label: "价格方案", href: "pricing" },
];

export const FEATURES = [
  {
    id: "writing",
    title: "智能撰写",
    description: "基于AI大模型的合同起草助手，引用海量法律范本，自动填充条款，降低合规风险。",
    icon: iconWriting,
  },
  {
    id: "review",
    title: "智能审查",
    description: "秒级扫描合同漏洞，提供风险预警与修改建议，确保每一份契约都安全无忧。",
    icon: iconReview,
  },
  {
    id: "management",
    title: "全生命周期管理",
    description: "从归档、履约追踪到续约提醒，可视化看板让合同管理井井有条，数据一目了然。",
    icon: iconManagement,
  },
];

export const SOLUTIONS = [
  {
    title: "企业法务",
    description: "释放法务人力，专注于复杂案件与高价值决策。",
    image: meetingImg,
    benefits: [
        "风险识别准确率提升 90%",
        "合同审查效率提升 5 倍",
        "法务知识库自动沉淀",
    ]
  },
  {
    title: "销售团队",
    description: "移动端随时随地发起签约，加速成单周期。",
    image: signingImg,
    benefits: [
        "合同签署周期缩短 75%",
        "随时随地移动审批",
        "客户签署状态实时追踪",
    ]
  },
  {
    title: "采购管理",
    description: "供应商合同标准化管理，履约风险全程监控。",
    image: handshakeImg,
    benefits: [
        "履约异常实时预警 100%",
        "供应商信用自动评级",
        "付款计划自动提醒",
    ]
  },
];

export const PRICING_PLANS = [
  {
    name: "团队版",
    price: "¥999",
    period: "/年",
    description: "适合初创团队与小型企业",
    features: ["5个账号", "智能审查（100份/月）", "标准合同模版库", "基础电子签章"],
    popular: false,
  },
  {
    name: "企业版",
    price: "¥4,999",
    period: "/年",
    description: "适合快速成长的中型企业",
    features: ["20个账号", "智能审查（无限量）", "高级风险预警", "API集成支持", "专属客户经理"],
    popular: true,
  },
  {
    name: "集团版",
    price: "定制",
    period: "",
    description: "适合大型集团与跨国公司",
    features: ["账号数量不限", "私有化部署", "定制化开发", "7x24小时SLA保障"],
    popular: false,
  },
];
