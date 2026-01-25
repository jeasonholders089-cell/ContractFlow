"""
重新生成带批注的审查文档
"""
import sys
sys.path.insert(0, r'f:\Agent项目\AI合同审查')

import requests
import os
from docx import Document
from backend.utils.comment_generator import CommentGenerator
from backend.utils.file_utils import FileManager

# 获取最新的审查结果
review_id = '068469f9-1e47-4d66-8462-6dd29d68cc0e'
response = requests.get(f'http://127.0.0.1:8000/api/reviews/{review_id}')
data = response.json()

print(f"审查ID: {review_id}")
print(f"状态: {data.get('status')}")
print(f"合同ID: {data.get('contract_id')}")

if data.get('result'):
    result = data.get('result')
    issues = result.get('issues', [])

    print(f"\n发现 {len(issues)} 个问题")

    # 获取原始文件路径
    contract_id = data.get('contract_id')
    file_manager = FileManager()

    # 查找原始文件
    base_dir = file_manager.storage_dir
    contract_dir = None
    for root, dirs, files in os.walk(base_dir):
        if contract_id in root:
            contract_dir = root
            break

    if contract_dir:
        # 查找原始docx文件（不是reviewed开头的）
        original_file = None
        for file in os.listdir(contract_dir):
            if file.endswith('.docx') and not file.startswith('reviewed_'):
                original_file = os.path.join(contract_dir, file)
                print(f"\n找到原始文件: {original_file}")
                break

        if original_file and os.path.exists(original_file):
            # 创建批注生成器
            comment_gen = CommentGenerator(original_file)

            # 重新定位问题（简化版 - 使用段落位置）
            from backend.utils.location_matcher import LocationMatcher
            parser = comment_gen.parser if hasattr(comment_gen, 'parser') else None

            if parser:
                parsed_doc = parser.parse_document(original_file)
                matcher = LocationMatcher(parsed_doc)

                issues_with_location = []
                for issue in issues:
                    # 尝试定位问题
                    location = matcher.locate_issue(issue)
                    issues_with_location.append({
                        'issue': issue,
                        'location': location,
                        'located': location is not None
                    })

                # 添加批注
                added_count = comment_gen.add_issues_as_comments(issues_with_location)
                print(f"成功添加了 {added_count} 个批注")

                # 保存带批注的文档
                reviewed_file_name = f"reviewed_with_comments_{os.path.basename(original_file)}"
                reviewed_file_path = os.path.join(contract_dir, reviewed_file_name)
                comment_gen.save(reviewed_file_path)
                print(f"\n保存带批注的文档到:\n{reviewed_file_path}")

                # 验证结果
                doc = Document(reviewed_file_path)
                ai_comment_count = sum(1 for p in doc.paragraphs if 'AI审核' in p.text)
                print(f"\n验证：文档中包含 'AI审核' 的段落数: {ai_comment_count}")

                if ai_comment_count > 0:
                    print("\n✅ 批注添加成功！请打开以下文件查看：")
                    print(f"   {os.path.abspath(reviewed_file_path)}")
                else:
                    print("\n❌ 批注添加失败")
            else:
                print("无法初始化文档解析器")
        else:
            print(f"未找到原始文件")
    else:
        print(f"未找到合同目录: {contract_id}")
else:
    print("审查没有结果")
