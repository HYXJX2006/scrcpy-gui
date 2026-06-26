@echo off
REM scrcpy GUI - 一键同步到 Gitee 和 GitHub
REM 使用: 在项目根目录运行 sync.bat

echo ========================================
echo  scrcpy GUI - 同步到 Gitee + GitHub
echo ========================================
echo.

REM 检查是否有未提交的更改
git status --porcelain > .sync-temp
findstr "." .sync-temp >nul
if not errorlevel 1 (
    echo [1/5] 提交本地更改...
    git add -A
    git commit -m "sync: auto commit before push" || echo (no changes to commit)
) else (
    echo [1/5] 无本地更改
)
del .sync-temp 2>nul

REM 更新版本号（如果 package.json 有变更）
echo [2/5] 推送到 GitHub...
git push origin main
git push origin gh-pages --force

echo [3/5] 推送到 Gitee...
git push gitee main
git push gitee gh-pages --force

echo [4/5] 更新 Release - 重编译安装包...
if exist scripts\rebuild-release.bat (
    call scripts\rebuild-release.bat
)

echo [5/5] 完成!
echo.
echo 同步结果:
echo   GitHub: https://github.com/HYXJX2006/scrcpy-gui
echo   Gitee:  https://gitee.com/hyxjx2006/scrcpy-gui
echo   Pages:  https://hyxjx2006.github.io/scrcpy-gui
echo.
pause
