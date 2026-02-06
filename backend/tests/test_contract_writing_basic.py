"""
合同撰写功能基本测试
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.utils.document_builder import ContractDocumentBuilder
from backend.utils.contract_prompts import (
    build_requirement_analysis_prompt,
    build_contract_generation_prompt,
    build_contract_refinement_prompt,
    build_clause_suggestion_prompt
)


class TestDocumentBuilder:
    """测试文档生成器"""

    def test_create_simple_contract(self):
        """测试创建简单合同"""
        print("  [测试] 创建简单合同...")
        builder = ContractDocumentBuilder()

        content = """
甲方：测试公司A
乙方：测试公司B

第一条 测试条款
这是一个测试条款。

第二条 另一个测试条款
这是另一个测试条款。
"""

        # 创建文档
        file_path = builder.create_contract_document(
            content=content,
            title="测试合同",
            metadata={'author': 'Test'}
        )

        # 验证文件存在
        assert Path(file_path).exists(), "文件不存在"
        assert Path(file_path).stat().st_size > 0, "文件大小为0"

        print(f"    [OK] 文档创建成功: {file_path}")

        # 清理测试文件
        Path(file_path).unlink()
        print("    [OK] 测试文件已清理")

    def test_clause_title_recognition(self):
        """测试条款标题识别"""
        print("  [测试] 条款标题识别...")
        builder = ContractDocumentBuilder()

        # 测试各种条款格式
        assert builder._is_clause_title("第一条 测试"), "第一条 格式识别失败"
        assert builder._is_clause_title("第1条 测试"), "第1条 格式识别失败"
        assert builder._is_clause_title("1. 测试"), "1. 格式识别失败"
        assert builder._is_clause_title("一、测试"), "一、格式识别失败"
        assert not builder._is_clause_title("普通文本"), "普通文本误识别"

        print("    [OK] 所有条款格式识别正确")

    def test_party_info_recognition(self):
        """测试甲乙方信息识别"""
        print("  [测试] 甲乙方信息识别...")
        builder = ContractDocumentBuilder()

        assert builder._is_party_info("甲方：测试公司"), "甲方识别失败"
        assert builder._is_party_info("乙方：测试公司"), "乙方识别失败"
        assert builder._is_party_info("出租方：测试"), "出租方识别失败"
        assert builder._is_party_info("承租方：测试"), "承租方识别失败"
        assert not builder._is_party_info("普通文本"), "普通文本误识别"

        print("    [OK] 所有甲乙方格式识别正确")


class TestContractPrompts:
    """测试 Prompt 构建"""

    def test_requirement_analysis_prompt(self):
        """测试需求分析 Prompt"""
        print("  [测试] 需求分析 Prompt...")
        prompt = build_requirement_analysis_prompt("我需要一份劳动合同")

        assert "我需要一份劳动合同" in prompt, "用户需求未包含"
        assert "合同类型" in prompt, "缺少合同类型字段"
        assert "JSON" in prompt, "缺少JSON格式要求"

        print("    [OK] Prompt 构建正确")

    def test_contract_generation_prompt(self):
        """测试合同生成 Prompt"""
        print("  [测试] 合同生成 Prompt...")
        prompt = build_contract_generation_prompt(
            user_requirement="技术服务合同",
            contract_type="服务合同",
            elements='{"party_a": "公司A"}',
            template_context=""
        )

        assert "技术服务合同" in prompt, "用户需求未包含"
        assert "服务合同" in prompt, "合同类型未包含"
        assert "公司A" in prompt, "关键要素未包含"

        print("    [OK] Prompt 构建正确")

    def test_refinement_prompt(self):
        """测试合同优化 Prompt"""
        print("  [测试] 合同优化 Prompt...")
        prompt = build_contract_refinement_prompt(
            current_content="原合同内容",
            user_feedback="需要修改付款方式"
        )

        assert "原合同内容" in prompt, "当前内容未包含"
        assert "需要修改付款方式" in prompt, "用户反馈未包含"

        print("    [OK] Prompt 构建正确")

    def test_clause_suggestion_prompt(self):
        """测试条款推荐 Prompt"""
        print("  [测试] 条款推荐 Prompt...")
        prompt = build_clause_suggestion_prompt(
            contract_type="劳动合同",
            current_content="合同内容",
            elements="{}"
        )

        assert "劳动合同" in prompt, "合同类型未包含"
        assert "合同内容" in prompt, "当前内容未包含"
        assert "missing_required_clauses" in prompt, "缺少推荐字段"

        print("    [OK] Prompt 构建正确")


def run_tests():
    """运行所有测试"""
    print("=" * 60)
    print("合同撰写功能基本测试")
    print("=" * 60)
    print()

    test_classes = [TestDocumentBuilder(), TestContractPrompts()]
    total_tests = 0
    passed_tests = 0
    failed_tests = 0

    for test_class in test_classes:
        class_name = test_class.__class__.__name__
        print(f"[{class_name}]")

        # 获取所有测试方法
        test_methods = [method for method in dir(test_class) if method.startswith('test_')]

        for method_name in test_methods:
            total_tests += 1
            try:
                method = getattr(test_class, method_name)
                method()
                passed_tests += 1
            except AssertionError as e:
                failed_tests += 1
                print(f"    [FAILED] {method_name}: {str(e)}")
            except Exception as e:
                failed_tests += 1
                print(f"    [ERROR] {method_name}: {str(e)}")

        print()

    print("=" * 60)
    print(f"测试结果: {passed_tests}/{total_tests} 通过")
    if failed_tests > 0:
        print(f"失败: {failed_tests}")
    else:
        print("所有测试通过!")
    print("=" * 60)

    return failed_tests == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

