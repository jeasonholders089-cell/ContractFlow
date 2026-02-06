"""
合同撰写功能数据初始化脚本

用法:
    python -m backend.scripts.init_contract_writing_data
"""
import sys
import asyncio
from pathlib import Path
from datetime import datetime

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy import select
from backend.database import AsyncSessionLocal
from backend.models.contract_writing import ContractTemplate, ContractClause
from backend.models.review import generate_id


# ============ 模板数据 ============

TEMPLATES = [
    {
        "name": "通用合同模板",
        "category": "general",
        "description": "通用合同模板，适用于各类商业合同",
        "variables": [
            {"name": "party_a_name", "type": "text", "label": "甲方名称", "required": True},
            {"name": "party_b_name", "type": "text", "label": "乙方名称", "required": True},
            {"name": "contract_subject", "type": "text", "label": "合同标的", "required": True},
            {"name": "amount", "type": "number", "label": "合同金额", "required": False},
        ],
        "clauses": []
    },
    {
        "name": "劳动合同模板",
        "category": "labor",
        "description": "标准劳动合同模板，适用于企业与员工签订劳动关系",
        "variables": [
            {"name": "party_a_name", "type": "text", "label": "用人单位名称", "required": True},
            {"name": "party_b_name", "type": "text", "label": "劳动者姓名", "required": True},
            {"name": "position", "type": "text", "label": "工作岗位", "required": True},
            {"name": "salary", "type": "number", "label": "月薪（元）", "required": True},
            {"name": "start_date", "type": "date", "label": "合同开始日期", "required": True},
            {"name": "duration", "type": "text", "label": "合同期限", "required": True},
        ],
        "clauses": []
    },
    {
        "name": "采购合同模板",
        "category": "procurement",
        "description": "货物采购合同模板，适用于企业间货物买卖",
        "variables": [
            {"name": "party_a_name", "type": "text", "label": "采购方名称", "required": True},
            {"name": "party_b_name", "type": "text", "label": "供应方名称", "required": True},
            {"name": "goods_name", "type": "text", "label": "货物名称", "required": True},
            {"name": "quantity", "type": "number", "label": "数量", "required": True},
            {"name": "unit_price", "type": "number", "label": "单价（元）", "required": True},
            {"name": "total_amount", "type": "number", "label": "总金额（元）", "required": True},
            {"name": "delivery_date", "type": "date", "label": "交货日期", "required": True},
        ],
        "clauses": []
    },
    {
        "name": "服务合同模板",
        "category": "service",
        "description": "服务合同模板，适用于各类服务外包",
        "variables": [
            {"name": "party_a_name", "type": "text", "label": "委托方名称", "required": True},
            {"name": "party_b_name", "type": "text", "label": "服务方名称", "required": True},
            {"name": "service_content", "type": "text", "label": "服务内容", "required": True},
            {"name": "service_fee", "type": "number", "label": "服务费用（元）", "required": True},
            {"name": "service_period", "type": "text", "label": "服务期限", "required": True},
        ],
        "clauses": []
    },
    {
        "name": "租赁合同模板",
        "category": "rental",
        "description": "房屋租赁合同模板，适用于房屋租赁",
        "variables": [
            {"name": "party_a_name", "type": "text", "label": "出租方名称", "required": True},
            {"name": "party_b_name", "type": "text", "label": "承租方名称", "required": True},
            {"name": "property_address", "type": "text", "label": "房屋地址", "required": True},
            {"name": "rental_fee", "type": "number", "label": "月租金（元）", "required": True},
            {"name": "deposit", "type": "number", "label": "押金（元）", "required": True},
            {"name": "rental_period", "type": "text", "label": "租赁期限", "required": True},
        ],
        "clauses": []
    }
]


# ============ 条款数据 ============

CLAUSES = [
    {
        "title": "付款方式条款",
        "category": "payment",
        "contract_type": "general",
        "content": "甲方应按照本合同约定的付款方式和期限向乙方支付合同款项。付款方式为银行转账，乙方应提供有效的银行账户信息。",
        "is_required": True,
        "risk_level": "high",
        "compliance_notes": "根据《民法典》第五百零九条，当事人应当按照约定全面履行自己的义务。"
    },
    {
        "title": "违约责任条款",
        "category": "liability",
        "contract_type": "general",
        "content": "任何一方违反本合同约定，应承担违约责任，向守约方支付违约金。违约金的数额为合同总金额的10%。",
        "is_required": True,
        "risk_level": "high",
        "compliance_notes": "根据《民法典》第五百七十七条，当事人一方不履行合同义务或者履行合同义务不符合约定的，应当承担继续履行、采取补救措施或者赔偿损失等违约责任。"
    },
    {
        "title": "保密条款",
        "category": "confidentiality",
        "contract_type": "general",
        "content": "双方对在合同履行过程中知悉的对方商业秘密和保密信息负有保密义务，未经对方书面同意不得向第三方披露。保密期限为合同终止后三年。",
        "is_required": False,
        "risk_level": "medium",
        "compliance_notes": "根据《民法典》第五百零一条，当事人在订立合同过程中知悉的商业秘密或者其他应当保密的信息，无论合同是否成立，不得泄露或者不正当地使用。"
    },
    {
        "title": "争议解决条款",
        "category": "dispute",
        "contract_type": "general",
        "content": "因本合同引起的或与本合同有关的任何争议，双方应友好协商解决。协商不成的，任何一方均可向合同签订地人民法院提起诉讼。",
        "is_required": True,
        "risk_level": "medium",
        "compliance_notes": "根据《民事诉讼法》第三十四条，合同或者其他财产权益纠纷的当事人可以书面协议选择被告住所地、合同履行地、合同签订地、原告住所地、标的物所在地等与争议有实际联系的地点的人民法院管辖。"
    },
    {
        "title": "合同变更条款",
        "category": "modification",
        "contract_type": "general",
        "content": "本合同的任何修改、补充或变更，须经双方协商一致，并以书面形式作出。口头约定不具有法律效力。",
        "is_required": False,
        "risk_level": "low",
        "compliance_notes": "根据《民法典》第五百四十三条，当事人协商一致，可以变更合同。"
    },
    {
        "title": "合同终止条款",
        "category": "termination",
        "contract_type": "general",
        "content": "本合同在以下情况下终止：(1)合同期限届满；(2)双方协商一致解除；(3)因不可抗力导致合同无法履行；(4)一方严重违约，守约方有权单方解除合同。",
        "is_required": True,
        "risk_level": "medium",
        "compliance_notes": "根据《民法典》第五百五十七条，有下列情形之一的，债权债务终止。"
    },
    {
        "title": "知识产权条款",
        "category": "intellectual_property",
        "contract_type": "service",
        "content": "乙方在履行本合同过程中产生的知识产权成果归甲方所有。乙方保证其提供的服务不侵犯任何第三方的知识产权。",
        "is_required": False,
        "risk_level": "high",
        "compliance_notes": "根据《民法典》第八百四十二条，完成工作成果的知识产权的归属，由当事人约定。"
    },
    {
        "title": "质量保证条款",
        "category": "quality",
        "contract_type": "procurement",
        "content": "乙方保证所提供的货物符合国家质量标准和合同约定的质量要求。货物质保期为交付后12个月，质保期内出现质量问题，乙方应免费维修或更换。",
        "is_required": True,
        "risk_level": "high",
        "compliance_notes": "根据《产品质量法》第二十六条，产品质量应当符合相关标准。"
    },
    {
        "title": "交付验收条款",
        "category": "delivery",
        "contract_type": "procurement",
        "content": "乙方应按照合同约定的时间和地点交付货物。甲方收到货物后应在5个工作日内完成验收，验收合格后签署验收单。",
        "is_required": True,
        "risk_level": "medium",
        "compliance_notes": "根据《民法典》第六百零四条，标的物毁损、灭失的风险，在标的物交付之前由出卖人承担，交付之后由买受人承担。"
    },
    {
        "title": "工作时间条款",
        "category": "working_hours",
        "contract_type": "labor",
        "content": "乙方实行标准工时制，每日工作8小时，每周工作40小时。甲方因工作需要安排乙方加班的，应支付加班工资。",
        "is_required": True,
        "risk_level": "high",
        "compliance_notes": "根据《劳动法》第三十六条，国家实行劳动者每日工作时间不超过八小时、平均每周工作时间不超过四十四小时的工时制度。"
    },
    {
        "title": "社会保险条款",
        "category": "social_insurance",
        "contract_type": "labor",
        "content": "甲方应依法为乙方缴纳养老保险、医疗保险、失业保险、工伤保险和生育保险。社会保险费用由甲乙双方按照国家规定的比例分担。",
        "is_required": True,
        "risk_level": "high",
        "compliance_notes": "根据《劳动法》第七十二条，用人单位和劳动者必须依法参加社会保险，缴纳社会保险费。"
    },
    {
        "title": "试用期条款",
        "category": "probation",
        "contract_type": "labor",
        "content": "乙方试用期为3个月。试用期内，乙方月工资为正式工资的80%。试用期满考核合格的，正式录用；不合格的，甲方可以解除劳动合同。",
        "is_required": False,
        "risk_level": "medium",
        "compliance_notes": "根据《劳动合同法》第十九条，劳动合同期限三个月以上不满一年的，试用期不得超过一个月；劳动合同期限一年以上不满三年的，试用期不得超过二个月；三年以上固定期限和无固定期限的劳动合同，试用期不得超过六个月。"
    },
    {
        "title": "房屋用途条款",
        "category": "usage",
        "contract_type": "rental",
        "content": "承租方承租房屋用途为居住/办公。未经出租方书面同意，承租方不得擅自改变房屋用途。",
        "is_required": True,
        "risk_level": "medium",
        "compliance_notes": "根据《民法典》第七百零七条，租赁期限六个月以上的，应当采用书面形式。"
    },
    {
        "title": "房屋维修条款",
        "category": "maintenance",
        "contract_type": "rental",
        "content": "租赁期间，房屋及其附属设施的维修责任由出租方承担。因承租方使用不当造成的损坏，由承租方负责维修或赔偿。",
        "is_required": True,
        "risk_level": "medium",
        "compliance_notes": "根据《民法典》第七百一十二条，出租人应当履行租赁物的维修义务。"
    },
    {
        "title": "转租条款",
        "category": "sublease",
        "contract_type": "rental",
        "content": "未经出租方书面同意，承租方不得将房屋转租给第三方。擅自转租的，出租方有权解除合同并要求承租方承担违约责任。",
        "is_required": True,
        "risk_level": "high",
        "compliance_notes": "根据《民法典》第七百一十六条，承租人经出租人同意，可以将租赁物转租给第三人。"
    }
]


# ============ 初始化函数 ============

async def init_templates(session):
    """初始化模板数据"""
    print("开始初始化模板数据...")

    for template_data in TEMPLATES:
        # 检查模板是否已存在
        result = await session.execute(
            select(ContractTemplate).where(
                ContractTemplate.name == template_data["name"]
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"  模板 '{template_data['name']}' 已存在，跳过")
            continue

        # 创建新模板
        template = ContractTemplate(
            id=generate_id(),
            name=template_data["name"],
            category=template_data["category"],
            description=template_data["description"],
            template_content="",  # 模板内容为空，由AI生成
            variables=template_data["variables"],
            clauses=template_data["clauses"],
            is_system=True,
            is_active=True,
            usage_count=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(template)
        print(f"  [OK] 创建模板: {template_data['name']}")

    await session.commit()
    print(f"模板初始化完成，共创建 {len(TEMPLATES)} 个模板\n")


async def init_clauses(session):
    """初始化条款数据"""
    print("开始初始化条款数据...")

    for clause_data in CLAUSES:
        # 检查条款是否已存在
        result = await session.execute(
            select(ContractClause).where(
                ContractClause.title == clause_data["title"]
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"  条款 '{clause_data['title']}' 已存在，跳过")
            continue

        # 创建新条款
        clause = ContractClause(
            id=generate_id(),
            title=clause_data["title"],
            category=clause_data["category"],
            contract_type=clause_data["contract_type"],
            content=clause_data["content"],
            variables=[],
            is_required=clause_data["is_required"],
            risk_level=clause_data["risk_level"],
            compliance_notes=clause_data["compliance_notes"],
            usage_count=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(clause)
        print(f"  [OK] 创建条款: {clause_data['title']}")

    await session.commit()
    print(f"条款初始化完成，共创建 {len(CLAUSES)} 个条款\n")


async def main():
    """主函数"""
    print("=" * 60)
    print("合同撰写功能数据初始化")
    print("=" * 60)
    print()

    # 获取数据库会话
    async with AsyncSessionLocal() as session:
        try:
            # 初始化模板
            await init_templates(session)

            # 初始化条款
            await init_clauses(session)

            print("=" * 60)
            print("数据初始化完成！")
            print("=" * 60)

        except Exception as e:
            print(f"\n错误: {str(e)}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
