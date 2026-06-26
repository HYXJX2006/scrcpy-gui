# scrcpy GUI 完善设计文档

日期: 2026-06-26

## 概述

基于 scrcpy (v4.0) 的 Electron + Vue 3 图形界面，本次完善聚焦于三个方向：系统托盘功能、UI 视觉升级（浅色主题）、用户体验细节优化。

---

## 一、系统托盘

### 关闭弹窗

- 用户点击窗口右上角 **×** 关闭按钮时，拦截默认关闭行为
- 弹出底部对话框（Naive UI 的 `n-modal`），包含两个操作按钮：
  - **缩小到托盘**（默认高亮，回车触发）→ 隐藏窗口，保留在系统托盘
  - **关闭应用** → 停止 scrcpy 进程，退出应用
- 弹窗样式与主界面一致，居中显示

### 托盘行为

- 应用启动时创建系统托盘图标（使用 `resources/icon.ico`）
- **左键单击** → 如果窗口隐藏则恢复显示，如果已显示则聚焦窗口
- **右键单击** → 弹出上下文菜单：
  - 「显示窗口」→ 恢复并聚焦窗口
  - 「退出」→ 停止 scrcpy，退出应用
- 所有窗口关闭后，应用不退出（保留在托盘），直到用户选择「退出」

### 技术实现

- Electron `Tray` API + `nativeImage` 创建托盘图标
- 主进程拦截 `BrowserWindow` 的 `close` 事件，阻止默认关闭
- `ipcMain` 处理「缩小到托盘」和「关闭应用」的命令
- Windows 托盘图标使用 `.ico` 格式

---

## 二、UI 视觉升级（浅色主题）

### 整体风格

- **浅色主题**：背景 `#f8f9fa`，卡片 `#ffffff`，主文字 `#2c3e50`
- **主色调**：蓝色系 `#4A90D9`，辅助色 `#64B5F6`，成功 `#4CAF50`，警告 `#FF9800`
- **卡片化布局**：圆角 `12px`，柔和阴影 `0 2px 12px rgba(0,0,0,0.08)`
- **渐变克制**：仅品牌标识和页面标题使用微渐变，操作界面保持纯色
- **过渡动画**：hover 状态 0.2s ease，页面切换使用 Naive UI 内置过渡

### 具体改造

| 组件 | 当前 | 改造后 |
|------|------|--------|
| TitleBar | 深色背景 | 浅色背景，灰色分割线 |
| SideNav | 深色竖条 | 浅色背景，选中态蓝色高亮 |
| 设备卡片 | 深色卡片 | 白色卡片，设备状态彩色指示点 |
| 设置面板 | 深色背景 | 浅色分割线，更清晰的层级 |
| 控制栏 | 深色底 | 浅色底，按钮图标更清晰 |
| 全局滚动条 | 暗色 | 浅色细滚动条 |

- Naive UI 的 `darkTheme` 替换为 `lightTheme`
- UnoCSS 颜色变量适配浅色系
- 确保所有自定义 CSS 颜色同步更新

---

## 三、用户体验优化

### 设备连接体验

- 设备状态增加彩色指示灯：绿色（已连接）、灰色（离线）、橙色（未授权）
- 连接中显示加载动画（Naive UI `n-spin`）
- 连接成功/失败使用 `n-notification` 弹出轻提示

### 控制栏改进

- 息屏/亮屏按钮增加加载状态（已实现）
- 快捷键提示：悬停显示对应 scrcpy 快捷键（已实现）
- 按钮点击反馈：点击时视觉反馈

### 日志面板

- 自动滚动到底部
- 不同日志级别颜色区分（info=灰色，error=红色，success=绿色）
- 日志上限 500 条，自动清理旧日志

### 错误处理

- scrcpy 启动失败时显示友好错误提示
- 设备断开时自动重置连接状态
- 网络超时/ADB 未找到时的引导提示

### 窗口状态记忆

- 使用 `electron-store` 保存：
  - 窗口位置（x, y）
  - 窗口大小（width, height）
  - 最大化状态
- 应用启动时恢复上次窗口状态

---

## 四、技术实现

### 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/main/index.ts` | 修改 | 添加 Tray API、关闭拦截、窗口状态管理 |
| `src/main/ipc/scrcpy.ts` | 修改 | 添加 tray IPC 通道 |
| `src/main/utils/path.ts` | 修改 | 添加托盘图标路径 |
| `src/preload/index.ts` | 修改 | 添加 tray API 暴露 |
| `src/renderer/App.vue` | 修改 | Naive UI lightTheme、浅色适配 |
| `src/renderer/main.ts` | 修改 | 主题配置 |
| `src/renderer/styles/global.css` | 修改 | 浅色主题 CSS |
| `src/renderer/components/layout/TitleBar.vue` | 修改 | 浅色适配 |
| `src/renderer/components/layout/SideNav.vue` | 修改 | 浅色适配 |
| `src/renderer/components/device/DeviceList.vue` | 修改 | 状态指示器 |
| `src/renderer/components/control/ControlBar.vue` | 修改 | 快捷键提示 |
| `src/renderer/components/common/TerminalOutput.vue` | 修改 | 日志分级颜色 |
| `src/renderer/views/HomeView.vue` | 修改 | 连接状态反馈 |
| `src/renderer/views/MirrorView.vue` | 修改 | 错误处理优化 |

### 依赖项

- 无需新增依赖，Electron 内置 Tray 和 Menu API
- 窗口状态使用已有的 `electron-store`

### 排除范围

- 不做多语言支持
- 不做 macOS/Linux 托盘适配（仅 Windows）
- 不做实时画面编辑

---

## 五、验收标准

1. 点击 × 弹出关闭对话框 → 选「缩小到托盘」窗口隐藏，托盘图标出现
2. 左键单击托盘图标 → 窗口恢复显示
3. 右键单击托盘图标 → 菜单出现，可「显示窗口」或「退出」
4. 浅色主题全局生效 → 所有页面、组件均为浅色
5. 设备状态指示灯显示正确
6. 窗口关闭后重新打开 → 位置和大小与上次一致
7. 截屏功能正常，保存到 `图片/scrcpy-screenshots/`
