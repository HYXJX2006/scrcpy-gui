@echo off
chcp 65001 >nul
title scrcpy GUI 安装程序

echo ========================================
echo  正在从 Gitee 下载 scrcpy GUI...
echo ========================================
echo.

set "BASE=https://gitee.com/hyxjx2006/scrcpy-gui/raw/main/website/download/parts"

echo [1/2] 下载分卷 1...
powershell -Command "Invoke-WebRequest -Uri '%BASE%/scrcpy-gui.7z.001' -OutFile '%TEMP%\scrcpy-gui.7z.001' -UseBasicParsing"
echo 完成!

echo [2/2] 下载分卷 2...
powershell -Command "Invoke-WebRequest -Uri '%BASE%/scrcpy-gui.7z.002' -OutFile '%TEMP%\scrcpy-gui.7z.002' -UseBasicParsing"
echo 完成!

echo.
echo 正在解压安装...
powershell -Command "& 'E:\workspace\claude_workplace\scrcpy-gui\node_modules\7zip-bin\win\x64\7za.exe' x '-o%TEMP%\scrcpy-gui' '%TEMP%\scrcpy-gui.7z.001' -y -bd" >nul

echo.
echo 正在复制到 Program Files...
if not exist "%ProgramFiles%\scrcpy GUI" mkdir "%ProgramFiles%\scrcpy GUI"
xcopy /E /I /Y "%TEMP%\scrcpy-gui\scrcpy-gui-portable\*" "%ProgramFiles%\scrcpy GUI\" >nul

echo 创建快捷方式...
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%USERPROFILE%\Desktop\scrcpy GUI.lnk'); $SC.TargetPath = '%ProgramFiles%\scrcpy GUI\scrcpy GUI.exe'; $SC.Save()"

echo.
echo ========================================
echo  安装完成!
echo  桌面已创建快捷方式，双击即可运行
echo ========================================
pause
