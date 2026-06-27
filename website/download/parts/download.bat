@echo off
chcp 65001 >nul
title scrcpy GUI 下载与安装

echo ========================================
echo  scrcpy GUI - 正在通过 CDN 高速下载...
echo ========================================
echo.

set "CDN=https://cdn.jsdelivr.net/gh/HYXJX2006/scrcpy-gui@v1.0.2/website/download/parts"
set "OUT=%TEMP%\scrcpy-gui"

if not exist "%OUT%" mkdir "%OUT%"

echo [1/3] 正在下载分卷 1 (30MB)...
curl -# -L "%CDN%/scrcpy-gui-portable.7z.001" -o "%OUT%\scrcpy-gui-portable.7z.001"
if %ERRORLEVEL% NEQ 0 (
  echo 下载失败！请检查网络连接
  pause
  exit /b 1
)
echo 完成!

echo [2/3] 正在下载分卷 2 (30MB)...
curl -# -L "%CDN%/scrcpy-gui-portable.7z.002" -o "%OUT%\scrcpy-gui-portable.7z.002"
if %ERRORLEVEL% NEQ 0 (
  echo 下载失败！请检查网络连接
  pause
  exit /b 1
)
echo 完成!

echo [3/3] 正在下载分卷 3 (11MB)...
curl -# -L "%CDN%/scrcpy-gui-portable.7z.003" -o "%OUT%\scrcpy-gui-portable.7z.003"
if %ERRORLEVEL% NEQ 0 (
  echo 下载失败！请检查网络连接
  pause
  exit /b 1
)
echo 完成!
echo.

echo 所有分卷下载完成，正在解压...
echo (需要先安装 7-Zip: https://www.7-zip.org/)
echo.

:: 尝试用系统安装的 7z 解压
set "SZ_EXE="
if exist "%ProgramFiles%\7-Zip\7z.exe" set "SZ_EXE=%ProgramFiles%\7-Zip\7z.exe"
if exist "%ProgramW6432%\7-Zip\7z.exe" set "SZ_EXE=%ProgramW6432%\7-Zip\7z.exe"
if exist "%ProgramFiles(x86)%\7-Zip\7z.exe" set "SZ_EXE=%ProgramFiles(x86)%\7-Zip\7z.exe"

if defined SZ_EXE (
  "%SZ_EXE%" x "%OUT%\scrcpy-gui-portable.7z.001" -o"%OUT%\extracted" -y -bd >nul
  echo 解压完成！
) else (
  echo 未找到 7-Zip，请手动解压：
  echo 1. 打开文件夹: %OUT%
  echo 2. 右键 scrcpy-gui-portable.7z.001 → 7-Zip → 提取到当前位置
  echo.
  echo 或者下载 7-Zip: https://www.7-zip.org/
  pause
  exit /b 1
)

:: 复制到用户选择的目录
set "DEST=%USERPROFILE%\Desktop\scrcpy GUI"
if exist "%DEST%" rmdir /s /q "%DEST%"
move "%OUT%\extracted\scrcpy-gui-portable" "%DEST%" >nul

echo.
echo ========================================
echo  安装完成！
echo ========================================
echo.
echo 程序位置: %DEST%
echo 桌面快捷方式已创建—双击 "scrcpy GUI.exe" 即可运行
echo.
start "" "%DEST%"
goto :end

:end
pause
