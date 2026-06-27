@echo off
chcp 65001 >nul
title scrcpy GUI 一键安装

echo ========================================
echo   scrcpy GUI 一键安装
echo   正在从 CDN 下载...
echo ========================================
echo.

set "URL=https://cdn.jsdelivr.net/gh/HYXJX2006/scrcpy-gui@v1.0.2/dist/scrcpy-gui-portable.7z"
set "TMP=%TEMP%\scrcpy-gui.7z"

echo 正在下载 (70MB)...
powershell -Command "Invoke-WebRequest -Uri '%URL%' -OutFile '%TMP%' -UseBasicParsing" 2>&1
if not exist "%TMP%" (
  echo 下载失败，尝试备用地址...
  powershell -Command "Invoke-WebRequest -Uri 'https://github.com/HYXJX2006/scrcpy-gui/raw/v1.0.2/dist/scrcpy-gui-portable.7z' -OutFile '%TMP%' -UseBasicParsing" 2>&1
)

echo 正在解压...
if not exist "%ProgramFiles%\scrcpy GUI" mkdir "%ProgramFiles%\scrcpy GUI"
powershell -Command "Expand-7Zip -Path '%TMP%' -DestinationPath '%ProgramFiles%\scrcpy GUI'" 2>&1
if %errorlevel% neq 0 (
  echo 系统没有 7zip，尝试另一种方式...
  powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%TMP%', '%ProgramFiles%\scrcpy GUI')" 2>nul
)

echo 创建桌面快捷方式...
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\scrcpy GUI.lnk'); $SC.TargetPath = '%ProgramFiles%\scrcpy GUI\scrcpy GUI.exe'; $SC.Save()"

echo.
echo ========================================
echo   ✅ 安装完成！
echo   桌面已创建快捷方式，双击即可运行
echo ========================================
pause
