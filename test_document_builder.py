"""
测试 DocumentBuilder 功能
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from backend.utils.document_builder import create_contract_document


def test_create_contract():
    """测试创建合同文档"""

    # 测试合同内容
    content = """
甲方（委托方）：北京科技有限公司
地址：北京市朝阳区xxx路xxx号
联系电话：010-12345678

乙方（受托方）：上海服务有限公司
地址：上海市浦东新区xxx路xxx号
联系电话：021-87654321

根据《中华人民共和国民法典》及相关法律法规，甲乙双方在平等自愿的基础上，就技术服务事宜达成如下协议：

第一条 服务内容
乙方为甲方提供软件开发服务，包括但不限于系统设计、编码实现、测试部署等工作。

第二条 服务期限
本合同服务期限为2024年1月1日至2024年12月31日，共计12个月。

第三条 服务费用
合同总金额为人民币100万元（大写：壹佰万元整）。

第四条 付款方式
甲方应按照以下方式向乙方支付服务费用：
1. 合同签订后5个工作日内支付30%作为预付款
2. 项目中期验收合格后支付40%
3. 项目最终验收合格后支付剩余30%

第五条 违约责任
任何一方违反本合同约定，应承担违约责任，向守约方支付违约金。违约金的数额为合同总金额的10%。

第六条 争议解决
因本合同引起的或与本合同有关的任何争议，双方应友好协商解决。协商不成的，任何一方均可向合同签订地人民法院提起诉讼。

第七条 其他约定
本合同一式两份，甲乙双方各执一份，具有同等法律效力。
"""

    # 创建文档
    try:
        file_path = create_contract_document(
            content=content,
            title="技术服务合同",
            metadata={
                'author': 'ContractFlow AI',
                'title': '技术服务合同',
                'subject': '服务合同文档'
            }
        )

        print(f"[OK] 文档创建成功！")
        print(f"  文件路径: {file_path}")

        # 检查文件是否存在
        import os
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            print(f"  文件大小: {file_size} 字节")
            print(f"\n测试通过！")
            return True
        else:
            print(f"[ERROR] 文件不存在")
            return False

    except Exception as e:
        print(f"[ERROR] 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("DocumentBuilder 功能测试")
    print("=" * 60)
    print()

    success = test_create_contract()

    print()
    print("=" * 60)
    if success:
        print("所有测试通过！")
    else:
        print("测试失败！")
    print("=" * 60)
