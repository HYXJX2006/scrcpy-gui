# scrcpy GUI 官网 + 安装包实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Subagent-driven execution

**Goal:** 创建 scrcpy GUI 产品官网和标准 Windows 安装包

**Architecture:** 
- 官网：纯静态 HTML，深色主题，下载按钮链接到安装包
- 安装包：NSIS 脚本编译，将便携版打包成标准安装程序

**Tech Stack:** HTML/CSS, NSIS

---

### Task 1: 产品官网首页

**Files:**
- Create: `website/index.html`

- [ ] **Step 1: 创建 website/index.html**

完整的官网首页，深色主题，包含导航栏、Hero、功能卡片、展示区、下载区、页脚。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>scrcpy GUI - Android 投屏控制工具</title>
<style>
  /* 全局重置 */
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, 'Microsoft YaHei', 'Segoe UI', sans-serif; background: #0f1419; color: #fff; scroll-behavior: smooth; }
  a { color: inherit; text-decoration: none; }

  /* 导航栏 */
  .nav { display:flex; justify-content:space-between; align-items:center; padding:16px 60px; background:rgba(0,0,0,0.3); position:sticky; top:0; z-index:100; backdrop-filter:blur(10px); }
  .nav-brand { font-size:22px; font-weight:700; display:flex; align-items:center; gap:8px; }
  .nav-brand span { color:#4A90D9; }
  .nav-links { display:flex; gap:32px; font-size:14px; color:#aaa; }
  .nav-links a:hover { color:#fff; }
  .nav-download-btn { background:#4A90D9; color:#fff; border:none; padding:8px 24px; border-radius:20px; font-size:14px; cursor:pointer; font-weight:500; transition:background 0.2s; }
  .nav-download-btn:hover { background:#3d89cc; }

  /* Hero */
  .hero { text-align:center; padding:100px 20px 80px; background:linear-gradient(180deg, #0f1419 0%, #1a1a2e 100%); }
  .hero h1 { font-size:52px; font-weight:800; margin-bottom:16px; }
  .hero h1 span { background:linear-gradient(135deg, #4A90D9, #64B5F6, #89b4fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hero p { font-size:18px; color:#888; margin-bottom:40px; max-width:500px; margin-left:auto; margin-right:auto; line-height:1.6; }
  .hero-download { background:linear-gradient(135deg, #4A90D9 0%, #64B5F6 100%); border:none; color:#fff; padding:18px 56px; border-radius:30px; font-size:18px; font-weight:600; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; }
  .hero-download:hover { transform:scale(1.05); box-shadow:0 8px 24px rgba(74,144,217,0.4); }
  .hero-info { color:#555; font-size:13px; margin-top:16px; }
  .hero-info code { background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:4px; color:#888; }

  /* 特性卡片 */
  .features { display:flex; justify-content:center; gap:40px; padding:80px 60px; background:#0f1419; flex-wrap:wrap; }
  .feature-card { text-align:center; width:220px; padding:24px; border-radius:12px; transition:background 0.2s; }
  .feature-card:hover { background:rgba(255,255,255,0.03); }
  .feature-icon { font-size:40px; margin-bottom:12px; }
  .feature-card h3 { font-size:16px; margin-bottom:8px; font-weight:600; }
  .feature-card p { font-size:13px; color:#666; line-height:1.6; }

  /* 截图展示 */
  .showcase { text-align:center; padding:60px; background:#0a0e13; }
  .showcase h2 { font-size:28px; margin-bottom:8px; }
  .showcase .sub { color:#555; margin-bottom:40px; font-size:15px; }

  /* 下载区 */
  .download { text-align:center; padding:80px 60px; background:linear-gradient(180deg, #0f1419 0%, #0a0e13 100%); }
  .download h2 { font-size:28px; margin-bottom:8px; }
  .download .sub { color:#555; margin-bottom:32px; }
  .download-btn { display:inline-flex; align-items:center; gap:10px; background:#4A90D9; color:#fff; border:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer; transition:background 0.2s; }
  .download-btn:hover { background:#3d89cc; }
  .download .req { color:#45475a; font-size:12px; margin-top:20px; line-height:1.8; }

  /* 页脚 */
  .footer { padding:32px 60px; text-align:center; border-top:1px solid #1e1e2e; color:#45475a; font-size:13px; }
  .footer a { color:#4A90D9; }
  .footer a:hover { text-decoration:underline; }

  /* 移动端适配 */
  @media (max-width:768px) {
    .nav { padding:16px 20px; }
    .nav-links { display:none; }
    .hero h1 { font-size:32px; }
    .hero p { font-size:15px; }
    .features { padding:40px 20px; gap:20px; }
    .feature-card { width:100%; max-width:280px; }
    .showcase { padding:40px 20px; }
    .download { padding:40px 20px; }
  }
</style>
</head>
<body>

<!-- 导航栏 -->
<div class="nav">
  <div class="nav-brand">📱 <span>scrcpy</span> GUI</div>
  <div class="nav-links">
    <a href="#features">功能特性</a>
    <a href="#showcase">效果展示</a>
    <a href="#download">下载安装</a>
    <a href="https://github.com/Genymobile/scrcpy" target="_blank">开源项目</a>
  </div>
  <button class="nav-download-btn" onclick="document.getElementById('download').scrollIntoView({behavior:'smooth'})">免费下载</button>
</div>

<!-- Hero -->
<div class="hero">
  <h1><span>scrcpy GUI</span></h1>
  <p>将 Android 设备投屏到电脑<br>图形化操作，开箱即用</p>
  <button class="hero-download" onclick="document.getElementById('download').scrollIntoView({behavior:'smooth'})">📥 立即下载</button>
  <p class="hero-info">v1.0.0 · Windows 10/11 64位 · 内置 scrcpy v4.0 · <code>免费 · 开源 · 无需 root</code></p>
</div>

<!-- 功能特性 -->
<div class="features" id="features">
  <div class="feature-card">
    <div class="feature-icon">📡</div>
    <h3>无线投屏</h3>
    <p>USB 或 WiFi 连接，手机无需安装应用，即插即用</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🎵</div>
    <h3>音频同步</h3>
    <p>Android 11+ 音频实时转发，声音从电脑播放</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🎬</div>
    <h3>屏幕录制</h3>
    <p>一键录制为 MP4/MKV，支持同时录制音频</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">⚡</div>
    <h3>低延迟</h3>
    <p>35-70ms 延迟 · H264/H265/AV1 · 最高 120fps</p>
  </div>
</div>

<!-- 展示 -->
<div class="showcase" id="showcase">
  <h2>简洁直观的界面</h2>
  <p class="sub">设备管理 · 投屏控制 · 设置面板 · 预设配置</p>
  <div style="max-width:800px;margin:0 auto;background:#1a1a2e;border-radius:12px;padding:60px 20px;border:1px solid #2a2a3e;">
    <p style="color:#555;">📱 设备已连接 · 投屏运行中 · 日志实时显示</p>
  </div>
</div>

<!-- 下载 -->
<div class="download" id="download">
  <h2>下载安装</h2>
  <p class="sub">一键安装，开箱即用，无任何依赖</p>
  <button class="download-btn">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    下载 Windows 版 (182MB)
  </button>
  <p class="req">
    系统要求：Windows 10/11 64位 · Android 5.0+<br>
    手机端需开启 USB 调试（设置 → 开发者选项 → USB 调试）
  </p>
</div>

<!-- 页脚 -->
<div class="footer">
  <p>scrcpy GUI 基于 <a href="https://github.com/Genymobile/scrcpy" target="_blank">scrcpy</a> · 采用 Apache 2.0 开源协议 · © 2026</p>
</div>

</body>
</html>
```

- [ ] **Step 2: 验证页面**

在浏览器中直接打开 `website/index.html`，确认：
- 导航栏固定顶部显示
- Hero 渐变色正常
- 特性卡片布局正常
- 下载按钮存在
- 页脚信息正确

---

### Task 2: NSIS 安装包

**Files:**
- Create: `scripts/installer.nsi`
- Run: NSIS compiler to generate `website/download/scrcpy-gui-setup.exe`

- [ ] **Step 1: 更新 portable 目录**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui
rm -f dist/scrcpy-gui-portable/resources/app.asar
cat > out/package.json << 'EOF'
{"name":"scrcpy-gui","version":"1.0.0","main":"main/index.js"}
EOF
asar pack out/ dist/scrcpy-gui-portable/resources/app.asar
```

- [ ] **Step 2: 编写 NSIS 安装脚本**

```nsis
; scripts/installer.nsi
Unicode true
!include "MUI2.nsh"
!include "FileFunc.nsh"

Name "scrcpy GUI"
OutFile "..\website\download\scrcpy-gui-setup.exe"
InstallDir "$PROGRAMFILES64\scrcpy GUI"
RequestExecutionLevel admin

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "SimpChinese"

Section "安装程序"
  SetOutPath "$INSTDIR"
  File /r "..\dist\scrcpy-gui-portable\*.*"

  ; 创建快捷方式
  CreateShortCut "$DESKTOP\scrcpy GUI.lnk" "$INSTDIR\scrcpy GUI.exe"
  CreateDirectory "$SMPROGRAMS\scrcpy GUI"
  CreateShortCut "$SMPROGRAMS\scrcpy GUI\scrcpy GUI.lnk" "$INSTDIR\scrcpy GUI.exe"
  CreateShortCut "$SMPROGRAMS\scrcpy GUI\卸载.lnk" "$INSTDIR\uninstall.exe"

  ; 写卸载信息
  WriteUninstaller "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI" "DisplayName" "scrcpy GUI"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI" "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI" "DisplayIcon" "$INSTDIR\scrcpy GUI.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI" "Publisher" "scrcpy GUI"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\scrcpy GUI.lnk"
  RMDir /r "$SMPROGRAMS\scrcpy GUI"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI"
SectionEnd
```

- [ ] **Step 3: 编译安装包**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui/scripts
makensis="C:/Users/黄宇轩/AppData/Local/electron-builder/Cache/nsis/609356999/makensis.exe"
"$makensis" installer.nsi
```

Expected: `website/download/scrcpy-gui-setup.exe` created (~150-200MB)

- [ ] **Step 4: 验证安装包**

双击生成的安装包，确认：
- 安装向导能正常启动
- 可选择安装目录
- 安装进度条正常
- 桌面快捷方式创建成功
- 卸载功能正常

---

### Task 3: 清理 + 最终验证

- [ ] **Step 1: 清理项目**

```bash
rm -f E:/workspace/claude_workplace/scrcpy-gui/out/package.json
rm -rf E:/workspace/claude_workplace/scrcpy-gui/.superpowers
```

- [ ] **Step 2: 最终验证**
  - [ ] 官网页面打开正常
  - [ ] 官网下载按钮存在
  - [ ] 安装包文件存在且可运行
  - [ ] 便携版 exe 可正常使用
