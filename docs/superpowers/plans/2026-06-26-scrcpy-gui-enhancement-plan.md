# scrcpy GUI 完善 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-subagent-driven-development (recommended) or superpowers-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 scrcpy GUI 增加系统托盘、浅色主题、窗口记忆和 UX 优化

**Architecture:**
- 主进程：Electron Tray API 管理系统托盘，拦截 close 事件展示关闭弹窗，electron-store 持久化窗口状态
- 渲染进程：Naive UI lightTheme 替换 darkTheme，适配所有自定义组件为浅色主题
- IPC：新增 tray:minimize/tray:restore/close:dialog 等通道，preload 同步暴露

**Tech Stack:** Electron 34, Vue 3, Naive UI, UnoCSS, electron-store

---

### Task 1: 系统托盘 - 主进程实现

**Files:**
- Modify: `src/main/index.ts`
- Modify: `src/main/utils/path.ts`

- [ ] **Step 1: 在 path.ts 添加托盘图标路径函数**

```typescript
// src/main/utils/path.ts — 在文件末尾添加
import { join } from 'path'

export function getTrayIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'icon.ico')
  }
  return join(app.getAppPath(), 'resources', 'icon.ico')
}
```

- [ ] **Step 2: 重写 main/index.ts 添加 Tray + 关闭拦截**

```typescript
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { registerDeviceIPC } from './ipc/device'
import { registerScrcpyIPC } from './ipc/scrcpy'
import { registerAdbIPC } from './ipc/adb'
import { getTrayIconPath } from './utils/path'

app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('no-sandbox')

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) app.quit()

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// ---- 窗口关闭弹窗 ----
// 由渲染进程触发：用户选择"缩小到托盘"或"关闭应用"
ipcMain.on('close:minimizeToTray', () => {
  mainWindow?.hide()
})

ipcMain.on('close:quitApp', () => {
  tray?.destroy()
  tray = null
  app.quit()
})

// 渲染进程询问窗口是否最大化
ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false
})

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  // 阻止默认关闭，改为通知渲染进程弹出弹窗
  mainWindow.on('close', (event) => {
    if (tray) {
      event.preventDefault()
      mainWindow?.webContents.send('close:showDialog')
    }
    // 如果没有托盘（已销毁），允许正常关闭
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('maximize', () => mainWindow?.webContents.send('window:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window:maximized', false))
  mainWindow.on('closed', () => { mainWindow = null })
}

function createTray(): void {
  const iconPath = getTrayIconPath()
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('scrcpy GUI')

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          mainWindow?.show()
          mainWindow?.focus()
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          tray?.destroy()
          tray = null
          app.quit()
        }
      }
    ])
    tray?.setContextMenu(contextMenu)
  })
}

function registerIPC(): void {
  registerDeviceIPC(ipcMain, mainWindow)
  registerScrcpyIPC(ipcMain)
  registerAdbIPC(ipcMain)

  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window:close', () => mainWindow?.close())
}

app.whenReady().then(() => {
  registerIPC()
  createTray()
  createWindow()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    tray?.destroy()
    app.quit()
  }
})
```

- [ ] **Step 3: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```
Expected: main process builds without error

---

### Task 2: 系统托盘 - Preload + 渲染进程

**Files:**
- Modify: `src/preload/index.ts`
- Create: `src/renderer/components/common/CloseDialog.vue`
- Modify: `src/renderer/views/MirrorView.vue`

- [ ] **Step 1: Preload 添加关闭弹窗 IPC 通道**

在 `src/preload/index.ts` 的 ScrcpyAPI 接口中添加：
```typescript
// 在 ScrcpyAPI 接口中添加
onShowCloseDialog: (callback: () => void) => void
minimizeToTray: () => void
quitApp: () => void
```

在 contextBridge 中添加：
```typescript
onShowCloseDialog: (callback: () => void) => {
  ipcRenderer.on('close:showDialog', () => callback())
},
minimizeToTray: () => ipcRenderer.send('close:minimizeToTray'),
quitApp: () => ipcRenderer.send('close:quitApp'),
```

- [ ] **Step 2: 创建 CloseDialog.vue**

```vue
<template>
  <n-modal
    :show="visible"
    :mask-closable="false"
    preset="card"
    title="退出确认"
    style="width: 380px"
    :bordered="false"
  >
    <p style="margin-bottom: 16px; color: #6c7086;">
      投屏正在运行，选择操作方式：
    </p>
    <n-space justify="end">
      <n-button @click="minimizeToTray" type="primary" size="medium">
        缩小到托盘
      </n-button>
      <n-button @click="quitApp" type="error" size="medium" ghost>
        关闭应用
      </n-button>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'minimizeToTray'): void
  (e: 'quitApp'): void
}>()
</script>
```

- [ ] **Step 3: 在 App.vue 中挂载 CloseDialog**

在 `src/renderer/App.vue` 中添加：
```vue
<CloseDialog :visible="showCloseDialog" @minimize-to-tray="onMinimizeToTray" @quit-app="onQuitApp" />
```

并在 script 中添加：
```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import CloseDialog from './components/common/CloseDialog.vue'

const showCloseDialog = ref(false)

function onMinimizeToTray(): void {
  showCloseDialog.value = false
  window.scrcpyAPI.minimizeToTray()
}

function onQuitApp(): void {
  showCloseDialog.value = false
  window.scrcpyAPI.quitApp()
}

onMounted(() => {
  // ... existing code
  window.scrcpyAPI.onShowCloseDialog(() => {
    showCloseDialog.value = true
  })
})
```

- [ ] **Step 4: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```
Expected: build succeeds

---

### Task 3: 浅色主题 - 全局配置

**Files:**
- Modify: `src/renderer/App.vue`
- Modify: `src/renderer/main.ts`
- Modify: `src/renderer/styles/global.css`
- Modify: `uno.config.ts`

- [ ] **Step 1: 将 darkTheme 替换为 lightTheme**

在 `src/renderer/App.vue` 中：
```vue
<n-config-provider :theme="lightTheme" :locale="zhCN" :date-locale="dateZhCN">
```

```typescript
import { lightTheme, zhCN, dateZhCN } from 'naive-ui'
```

移除对 `darkTheme` 的引用。

- [ ] **Step 2: 更新 global.css 为浅色主题**

```css
/* src/renderer/styles/global.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  background-color: #f5f6fa;
  color: #2c3e50;
}

::selection {
  background: rgba(74, 144, 217, 0.2);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
```

- [ ] **Step 3: 更新 uno.config.ts 颜色变量**

```typescript
// uno.config.ts
export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'card': 'bg-[#ffffff] rounded-lg border border-[#e8eaed] p-4 shadow-sm'
  },
  safelist: [],
  theme: {
    colors: {
      primary: '#4A90D9',
      'primary-light': '#64B5F6',
      'bg-page': '#f5f6fa',
      'bg-card': '#ffffff',
      'text-primary': '#2c3e50',
      'text-secondary': '#6c757d',
      'border-light': '#e8eaed',
    }
  }
})
```

- [ ] **Step 4: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```
Expected: build succeeds (may have color warnings, JS bundle size may change)

---

### Task 4: 浅色主题 - 组件适配

**Files:**
- Modify: `src/renderer/App.vue`（全局背景色）
- Modify: `src/renderer/components/layout/TitleBar.vue`
- Modify: `src/renderer/components/layout/SideNav.vue`
- Modify: `src/renderer/components/device/DeviceList.vue`
- Modify: `src/renderer/components/settings/VideoSettings.vue`
- Modify: `src/renderer/components/settings/AudioSettings.vue`
- Modify: `src/renderer/components/settings/RecordSettings.vue`
- Modify: `src/renderer/components/settings/DisplaySettings.vue`
- Modify: `src/renderer/components/settings/AdvancedSettings.vue`
- Modify: `src/renderer/components/common/TerminalOutput.vue`
- Modify: `src/renderer/views/HomeView.vue`
- Modify: `src/renderer/views/MirrorView.vue`
- Modify: `src/renderer/views/PresetsView.vue`
- Modify: `src/renderer/views/AboutView.vue`
- Modify: `src/renderer/views/SettingsView.vue`

- [ ] **Step 1: App.vue 背景色**

```css
.app-container {
  background-color: #f5f6fa;
  color: #2c3e50;
}
```

- [ ] **Step 2: TitleBar.vue 浅色**

```css
.title-bar { background: #ffffff; border-bottom: 1px solid #e8eaed; }
.app-title { color: #4A90D9; font-weight: 600; }
.control-btn:hover { background: rgba(0,0,0,0.05); }
.control-close:hover { background: #e64553; }
.control-close:hover svg line { stroke: #fff; }
```

- [ ] **Step 3: SideNav.vue 浅色**

```css
.side-nav { background: #ffffff; border-right: 1px solid #e8eaed; }
.nav-item { color: #adb5bd; }
.nav-item:hover { color: #4A90D9; background: rgba(74,144,217,0.06); }
.nav-item.active { color: #4A90D9; background: rgba(74,144,217,0.1); }
.version { color: #ced4da; }
```

- [ ] **Step 4: DeviceList.vue 浅色**

```css
.empty-state { color: #6c757d; }
.hint { color: #adb5bd; }
.device-item { background: #ffffff; border: 1px solid #e8eaed; }
.device-item:hover { border-color: #4A90D9; }
.device-item.selected { border-color: #4A90D9; background: rgba(74,144,217,0.04); }
.device-model { color: #2c3e50; }
.section-header h2 { color: #2c3e50; }
```

- [ ] **Step 5: 设置面板全局替换**

所有 settings 组件的 `.setting-row` 和 `span:first-child` 颜色改为浅色：
```css
.setting-label span:first-child { color: #2c3e50; }
.hint { color: #6c757d; }
```

所有 `border-bottom: 1px solid #313244` 改为 `border-bottom: 1px solid #e8eaed`

所有 `background: #181825` / `#1e1e2e` 改为 `background: #ffffff`

- [ ] **Step 6: TerminalOutput.vue 浅色**

```css
.terminal { background: #f0f2f5; border: 1px solid #e8eaed; }
.log-line { color: #495057; }
.empty { color: #adb5bd; }
```

- [ ] **Step 7: 各 View 页面浅色适配**

全局搜索替换所有深色背景色和文字色：
- `#181825` → `#ffffff`
- `#1e1e2e` → `#f8f9fa`
- `#cdd6f4` → `#2c3e50`
- `#a6adc8` / `#6c7086` → `#6c757d`
- `#585b70` / `#45475a` → `#adb5bd`
- `#313244` border → `#e8eaed` border
- `rgba(137,180,250,...)` → `rgba(74,144,217,...)`

- [ ] **Step 8: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```
Expected: build succeeds

---

### Task 5: 窗口状态记忆

**Files:**
- Modify: `src/main/index.ts`

- [ ] **Step 1: 添加窗口状态持久化**

在 `src/main/index.ts` 中，导入 electron-store：
```typescript
import Store from 'electron-store'

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized: boolean
}

const store = new Store<{ windowState: WindowState }>({
  defaults: {
    windowState: {
      width: 1100,
      height: 760,
      isMaximized: false
    }
  }
})
```

- [ ] **Step 2: 使用存储的状态创建窗口**

```typescript
function createWindow(): void {
  const savedState = store.get('windowState')

  mainWindow = new BrowserWindow({
    width: savedState.width,
    height: savedState.height,
    ...(savedState.x !== undefined && savedState.y !== undefined
      ? { x: savedState.x, y: savedState.y }
      : {}),
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  // 恢复最大化状态
  if (savedState.isMaximized) {
    mainWindow.maximize()
  }

  // 监听窗口变化并保存
  mainWindow.on('resize', () => {
    if (!mainWindow?.isMaximized()) {
      const [width, height] = mainWindow?.getSize() || [1100, 760]
      store.set('windowState', { ...store.get('windowState'), width, height })
    }
  })

  mainWindow.on('move', () => {
    if (!mainWindow?.isMaximized()) {
      const [x, y] = mainWindow?.getPosition() || [0, 0]
      store.set('windowState', { ...store.get('windowState'), x, y })
    }
  })

  mainWindow.on('maximize', () => {
    store.set('windowState', { ...store.get('windowState'), isMaximized: true })
    mainWindow?.webContents.send('window:maximized', true)
  })

  mainWindow.on('unmaximize', () => {
    store.set('windowState', { ...store.get('windowState'), isMaximized: false })
    mainWindow?.webContents.send('window:maximized', false)
  })

  // ... rest of createWindow
}
```

- [ ] **Step 3: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```
Expected: build succeeds

---

### Task 6: 用户体验优化

**Files:**
- Modify: `src/renderer/components/device/DeviceList.vue`
- Modify: `src/renderer/views/HomeView.vue`
- Modify: `src/renderer/views/MirrorView.vue`

- [ ] **Step 1: 设备状态指示灯**

在 `DeviceList.vue` 的设备状态处添加彩色圆点：
```vue
<span class="status-dot" :class="device.state"></span>
```

CSS:
```css
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.status-dot.device { background: #4CAF50; }
.status-dot.offline { background: #adb5bd; }
.status-dot.unauthorized { background: #FF9800; }
```

- [ ] **Step 2: 日志颜色分级**

在 `TerminalOutput.vue` 中，根据日志内容添加颜色：
```css
.log-line.error { color: #e53935; }
.log-line.success { color: #43a047; }
.log-line.warning { color: #fb8c00; }
```

并在日志显示时匹配关键字：
```typescript
function logClass(line: string): string {
  if (line.includes('ERROR') || line.includes('失败')) return 'error'
  if (line.includes('成功')) return 'success'
  if (line.includes('warning') || line.includes('注意')) return 'warning'
  return ''
}
```

- [ ] **Step 3: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```
Expected: build succeeds

---

### Task 7: 全量编译验证 + 开发运行测试

- [ ] **Step 1: 完整编译**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1
```
Expected: exit code 0, all three bundles built

- [ ] **Step 2: 开发模式验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && timeout 12 npm run dev 2>&1 || true
```
Expected: electron window opens, light theme visible, tray icon in system tray area

- [ ] **Step 3: 功能验证清单**
  - [ ] 点击 × → 弹出关闭确认弹窗
  - [ ] 选「缩小到托盘」→ 窗口隐藏，托盘图标出现
  - [ ] 左键托盘图标 → 窗口恢复
  - [ ] 右键托盘图标 → 菜单出现，可退出
  - [ ] 全局背景为浅色
  - [ ] 设备列表显示状态圆点
  - [ ] 窗口关闭后重新打开，位置大小保留
