"""
测试合同审查API
"""
import asyncio
import httpx
import json
import os
from pathlib import Path


# 设置Windows控制台编码
if os.name == "nt":
    os.system("chcp 65001 >nul")


BASE_URL = "http://127.0.0.1:8000"


async def test_upload_and_review():
    """测试上传和审查功能"""

    # 查找测试文件
    test_files = list(Path("backend/uploads").glob("*.docx"))

    if not test_files:
        print("[ERROR] 没有找到测试文件，请先上传一个docx文件")
        return

    test_file = test_files[0]
    print(f"[INFO] 使用测试文件: {test_file.name}")

    async with httpx.AsyncClient(timeout=120.0) as client:
        # 1. 上传文件
        print("\n[1/5] 上传文件...")
        with open(test_file, "rb") as f:
            files = {"file": (test_file.name, f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
            response = await client.post(f"{BASE_URL}/api/reviews/upload", files=files)

        if response.status_code != 200:
            print(f"[ERROR] 上传失败: {response.status_code} - {response.text}")
            return

        upload_result = response.json()
        contract_id = upload_result["contract_id"]
        print(f"[OK] 上传成功! 合同ID: {contract_id}")

        # 2. 开始审查
        print("\n[2/5] 开始AI审查...")
        response = await client.post(f"{BASE_URL}/api/reviews/{contract_id}/start")

        if response.status_code != 200:
            print(f"[ERROR] 启动审查失败: {response.status_code} - {response.text}")
            return

        print(f"[DEBUG] Response: {response.text}")
        start_result = response.json()
        review_id = start_result.get("review_id") or start_result.get("id")
        if not review_id:
            print(f"[ERROR] No review_id in response: {start_result}")
            return
        print(f"[OK] 审查已启动! 审查ID: {review_id}")

        # 3. 轮询检查审查状态
        print("\n[3/5] 等待审查完成...")
        max_attempts = 60
        for attempt in range(max_attempts):
            await asyncio.sleep(2)
            response = await client.get(f"{BASE_URL}/api/reviews/{review_id}")

            if response.status_code != 200:
                print(f"[ERROR] 获取状态失败: {response.status_code}")
                continue

            result = response.json()
            status = result["status"]
            print(f"   Status: {status}... ({attempt + 1}/{max_attempts})")

            if status == "completed":
                print("\n[OK] 审查完成!")
                print(f"   - High Risk: {result.get('high_risk_count', 0)}")
                print(f"   - Medium Risk: {result.get('medium_risk_count', 0)}")
                print(f"   - Low Risk: {result.get('low_risk_count', 0)}")

                issues = result.get("issues", [])
                if issues:
                    print(f"\n[INFO] Found {len(issues)} issues:")
                    for i, issue in enumerate(issues[:5], 1):
                        print(f"   {i}. [{issue.get('severity', 'M')}] {issue.get('problem', '')[:50]}...")

                return result
            elif status == "failed":
                print(f"[ERROR] 审查失败: {result.get('error', '未知错误')}")
                return None

        print("[TIMEOUT] 审查超时")
        return None


async def test_download(review_id: str):
    """测试下载功能"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 下载带批注的文档
        print(f"\n[4/5] 下载带批注的文档...")
        response = await client.get(f"{BASE_URL}/api/reviews/{review_id}/download")

        if response.status_code == 200:
            output_path = Path(f"test_reviewed_{review_id}.docx")
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"[OK] 文档已保存: {output_path}")
        else:
            print(f"[ERROR] 下载失败: {response.status_code}")

        # 下载审查报告
        print(f"\n[5/5] 下载审查报告...")
        response = await client.get(f"{BASE_URL}/api/reviews/{review_id}/report")

        if response.status_code == 200:
            output_path = Path(f"test_report_{review_id}.txt")
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"[OK] 报告已保存: {output_path}")
            # 打印报告内容
            print("\n[REPORT] 报告内容:")
            content = response.content.decode("utf-8")
            print(content[:500] if len(content) > 500 else content)
        else:
            print(f"[ERROR] 下载报告失败: {response.status_code}")


async def main():
    print("=" * 60)
    print("[TEST] Contract Review System Test")
    print("=" * 60)

    result = await test_upload_and_review()

    if result and result["status"] == "completed":
        review_id = result["id"]
        await test_download(review_id)

    print("\n" + "=" * 60)
    print("[DONE] Test Complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())