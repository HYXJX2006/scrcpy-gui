@echo off
chcp 65001 >nul
title scrcpy GUI 下载与安装
setlocal enabledelayedexpansion

echo ========================================
echo  scrcpy GUI - CDN 高速下载
echo ========================================
echo.

:: 下载地址（镜像源优先，GitHub 直连作为备用）
set "BASE=https://ghproxy.com/https://github.com/HYXJX2006/scrcpy-gui/releases/download/v1.0.2"
set "FALLBACK=https://github.com/HYXJX2006/scrcpy-gui/releases/download/v1.0.2"
set "OUT=%TEMP%\scrcpy-gui"

if not exist "%OUT%" mkdir "%OUT%"

call :download "scrcpy-gui-portable.7z.001" 30MB
if errorlevel 1 goto :fail
call :download "scrcpy-gui-portable.7z.002" 30MB
if errorlevel 1 goto :fail
call :download "scrcpy-gui-portable.7z.003" 11MB
if errorlevel 1 goto :fail

echo.
echo 所有分卷下载完成，正在解压...
echo.

:: 尝试用系统安装的 7z 解压
set "SZ_EXE="
if exist "%ProgramFiles%\7-Zip\7z.exe" set "SZ_EXE=%ProgramFiles%\7-Zip\7z.exe"
if exist "%ProgramW6432%\7-Zip\7z.exe" set "SZ_EXE=%ProgramW6432%\7-Zip\7z.exe"
if exist "%ProgramFiles(x86)%\7-Zip\7z.exe" set "SZ_EXE=%ProgramFiles(x86)%\7-Zip\7z.exe"

if defined SZ_EXE (
  "%SZ_EXE%" x "%OUT%\scrcpy-gui-portable.7z.001" -o"%OUT%\extracted" -y -bd >nul
  if errorlevel 1 (
    echo 解压失败，请检查分卷是否完整
    pause
    exit /b 1
  )
  echo 解压完成！
) else (
  echo 未检测到 7-Zip。
  echo 请手动解压：
  echo   打开 %OUT%
  echo   右键 .001 → 7-Zip → 提取
  echo.
  echo 如果未安装 7-Zip，请访问 https://www.7-zip.org/
  pause
  exit /b 1
)

:: 复制到桌面
set "DEST=%USERPROFILE%\Desktop\scrcpy GUI"
if exist "%DEST%" rmdir /s /q "%DEST%"
move "%OUT%\extracted\scrcpy-gui-portable" "%DEST%" >nul

echo.
echo ========================================
echo  安装完成！
echo ========================================
echo.
echo  程序位置: %DEST%
echo  双击 "scrcpy GUI.exe" 即可运行
echo.
start "" "%DEST%"
pause
exit /b 0

:download
set "FILE=%~1"
set "SIZE=%~2"
echo 正在下载 %FILE% (%SIZE%)...
curl -# --connect-timeout 15 -L "%BASE%/%FILE%" -o "%OUT%\%FILE%"
if not errorlevel 1 (
  echo 完成!
  exit /b 0
)
echo 镜像源失败，尝试 GitHub 直连...
curl -# --connect-timeout 30 -L "%FALLBACK%/%FILE%" -o "%OUT%\%FILE%"
if errorlevel 1 (
  echo ✗ %FILE% 下载失败
  echo 请检查网络连接或手动访问：
  echo   %FALLBACK%/%FILE%
  exit /b 1
)
echo 完成!
exit /b 0

:fail
echo.
echo ========================================
echo  下载未完成，请稍后重试
echo  或者手动从 GitHub 下载安装版：
echo  https://github.com/HYXJX2006/scrcpy-gui/releases
echo ========================================
pause
exit /b 1
