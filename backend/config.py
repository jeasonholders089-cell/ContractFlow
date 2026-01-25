"""
配置文件
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""

    # API 配置
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]

    # 通义千问配置
    dashscope_api_key: str = ""
    dashscope_model: str = "qwen3-max"
    dashscope_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    # 文件配置
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: list = [".docx"]
    upload_dir: str = "uploads"
    storage_dir: str = "storage"

    # 审核配置
    max_retries: int = 3
    max_tokens_per_section: int = 4000

    # 数据库配置
    database_url: str = "sqlite+aiosqlite:///./contract_review.db"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()
