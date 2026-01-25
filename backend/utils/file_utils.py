"""
文件处理工具
"""
import os
import shutil
import aiofiles
from pathlib import Path
from typing import Optional, Tuple
from datetime import datetime, timedelta


class FileManager:
    """文件管理器"""

    def __init__(self, upload_dir: str = "uploads", storage_dir: str = "storage"):
        self.upload_dir = Path(upload_dir)
        self.storage_dir = Path(storage_dir)
        self.upload_dir.mkdir(exist_ok=True)
        self.storage_dir.mkdir(exist_ok=True)

    def get_upload_path(self, filename: str) -> Path:
        """获取上传文件路径"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        return self.upload_dir / f"{name}_{timestamp}{ext}"

    def get_storage_path(self, contract_id: str, filename: str) -> Path:
        """获取存储文件路径"""
        contract_dir = self.storage_dir / contract_id
        contract_dir.mkdir(exist_ok=True)
        return contract_dir / filename

    async def save_upload_file(self, file_content: bytes, filename: str) -> Path:
        """保存上传的文件"""
        path = self.get_upload_path(filename)
        async with aiofiles.open(path, "wb") as f:
            await f.write(file_content)
        return path

    async def save_reviewed_file(self, contract_id: str, filename: str, content: bytes) -> Path:
        """保存审查后的文件"""
        path = self.get_storage_path(contract_id, filename)
        async with aiofiles.open(path, "wb") as f:
            await f.write(content)
        return path

    def cleanup_old_files(self, max_age_hours: int = 24):
        """清理旧文件"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)

        for file_path in self.upload_dir.iterdir():
            if file_path.is_file():
                file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                if file_time < cutoff_time:
                    try:
                        file_path.unlink()
                    except Exception:
                        pass

    def delete_contract_files(self, contract_id: str):
        """删除合同相关文件"""
        contract_dir = self.storage_dir / contract_id
        if contract_dir.exists():
            try:
                shutil.rmtree(contract_dir)
            except Exception:
                pass

    def validate_file(self, filename: str, file_size: int, max_size: int,
                     allowed_extensions: list) -> Tuple[bool, Optional[str]]:
        """验证文件"""
        # 检查文件扩展名
        ext = Path(filename).suffix.lower()
        if ext not in allowed_extensions:
            return False, f"不支持的文件格式: {ext}，仅支持 {', '.join(allowed_extensions)}"

        # 检查文件大小
        if file_size > max_size:
            max_mb = max_size / (1024 * 1024)
            return False, f"文件过大，最大支持 {max_mb:.0f}MB"

        return True, None
