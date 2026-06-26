# scrcpy GUI

> Android 设备投屏控制工具 — 图形化界面，开箱即用

基于 [scrcpy v4.0](https://github.com/Genymobile/scrcpy) 的 Electron + Vue 3 图形界面封装。

| 平台 | 地址 |
|------|------|
| 📦 **下载安装包** | [Gitee Release](https://gitee.com/hyxjx2006/scrcpy-gui/releases/tag/v1.0.1) |
| 🇨🇳 **Gitee 镜像** | [gitee.com/hyxjx2006/scrcpy-gui](https://gitee.com/hyxjx2006/scrcpy-gui) |
| 🌏 **GitHub 主仓库** | [github.com/HYXJX2006/scrcpy-gui](https://github.com/HYXJX2006/scrcpy-gui) |
| 🌐 **产品官网** | [hyxjx2006.github.io/scrcpy-gui](https://hyxjx2006.github.io/scrcpy-gui) |

## ✨ 功能

- 📱 **设备管理** — USB 自动发现、WiFi 无线连接、连接历史
- 🎬 **投屏控制** — 启动/停止、息屏/亮屏、旋转、截屏
- 🎵 **音频同步** — Android 11+ 音频实时转发
- 📹 **屏幕录制** — 一键录制为 MP4/MKV，支持音画同步
- ⚙️ **视频设置** — 分辨率/帧率/编码器/码率自由调节
- 📋 **预设配置** — 均衡/低延迟/高画质/无线/仅录屏 一键切换
- 🔒 **系统托盘** — 关闭弹窗、托盘图标、后台运行
- 🎨 **浅色主题** — 清爽界面
- 💾 **窗口记忆** — 记住位置和大小

## 📥 下载

[下载最新安装包](https://github.com/HYXJX2006/scrcpy-gui/releases/latest)

或直接使用绿色便携版：`dist/scrcpy-gui-portable/scrcpy GUI.exe`

## 📖 使用说明

[完整使用说明 → USAGE.md](USAGE.md)

涵盖连接方式、快捷键、设置说明、预设配置、常见问题等。

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 打包便携版
npm run pack

# 打包安装包（需网络畅通）
npm run dist
```

## 🛠️ 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Electron 34 |
| 前端 | Vue 3 + TypeScript |
| UI | Naive UI |
| 样式 | UnoCSS |
| 构建 | electron-vite + Vite |
| 打包 | electron-builder + NSIS |

## 📋 系统要求

- **操作系统**: Windows 10/11 64位
- **手机**: Android 5.0+（音频需 Android 11+）
- **其他**: 无需 root，无需安装额外应用

## 📄 开源协议

Apache 2.0 · 基于 [scrcpy](https://github.com/Genymobile/scrcpy)
