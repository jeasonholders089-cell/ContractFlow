@echo off
echo ====================================
echo   AI 合同审查系统 - 启动脚本
echo ====================================
echo.

REM 尝试使用 py launcher（推荐）
where py >nul 2>&1
if not errorlevel 1 (
    echo 使用 py launcher 启动...
    cd /d "%~dp0backend"
    py main.py
    pause
    exit /b 0
)

REM 尝试使用 AnaConda Python
set ANACONDA_PYTHON=E:\AnaConda\python.exe
if exist "%ANACONDA_PYTHON%" (
    echo 使用 AnaConda Python 启动...
    cd /d "%~dp0backend"
    "%ANACONDA_PYTHON%" main.py
    pause
    exit /b 0
)

REM 使用系统 Python
echo 使用系统 Python 启动...
cd /d "%~dp0backend"
python main.py

pause
