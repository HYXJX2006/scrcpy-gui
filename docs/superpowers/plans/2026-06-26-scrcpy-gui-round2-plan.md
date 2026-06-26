# scrcpy GUI 第二轮改进 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-subagent-driven-development (recommended) or superpowers-executing-plans to implement this plan task-by-task.

**Goal:** 添加快捷键悬浮窗、低延迟优化预设、设备历史管理

**Architecture:** 无 IPC 变更，全部为前端组件和配置修改。ShortcutHint 为独立 Vue 组件，设备历史使用 localStorage 持久化。

**Tech Stack:** Vue 3, Naive UI

---

### Task 1: 快捷键悬浮窗组件

**Files:**
- Create: `src/renderer/components/common/ShortcutHint.vue`
- Modify: `src/renderer/views/MirrorView.vue`

- [ ] **Step 1: 创建 ShortcutHint.vue**

```vue
<template>
  <n-modal
    :show="visible"
    @update:show="$emit('close')"
    :mask-closable="true"
    preset="card"
    title="⌨️ scrcpy 快捷键"
    style="width: 420px"
    :bordered="false"
    :segmented="{ content: true }"
  >
    <n-table :bordered="false" :single-line="false" size="small">
      <thead>
        <tr><th>快捷键</th><th>功能</th></tr>
      </thead>
      <tbody>
        <tr v-for="item in shortcuts" :key="item.key">
          <td><n-tag size="small">{{ item.key }}</n-tag></td>
          <td>{{ item.desc }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-modal>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
defineEmits<{ (e: 'close'): void }>()

interface Shortcut { key: string; desc: string }

const shortcuts: Shortcut[] = [
  { key: 'Ctrl+f', desc: '切换全屏模式' },
  { key: 'Ctrl+x', desc: '退出全屏' },
  { key: 'Ctrl+o', desc: '息屏/亮屏' },
  { key: 'Ctrl+r', desc: '旋转画面' },
  { key: 'Ctrl+s', desc: '截屏' },
  { key: 'Ctrl+v', desc: '电脑剪贴板 → 手机' },
  { key: 'Ctrl+c', desc: '手机剪贴板 → 电脑' },
  { key: '右键', desc: '返回键' },
  { key: '中键', desc: '主页键' },
  { key: 'Ctrl+左键', desc: '最近任务' },
  { key: 'Ctrl+↑', desc: '音量+' },
  { key: 'Ctrl+↓', desc: '音量-' },
  { key: 'Ctrl+i', desc: '显示/隐藏 FPS' },
  { key: 'Ctrl+Shift+s', desc: '打开设置面板' }
]
</script>
```

- [ ] **Step 2: 在 MirrorView.vue 中集成**

在模板的控制栏上方添加按钮和 ShortcutHint：
```vue
<!-- 在 header-actions 中添加 -->
<n-button size="small" quaternary @click="showShortcuts = true">
  ⌨️ 快捷键
</n-button>

<!-- 在模板末尾添加 -->
<ShortcutHint :visible="showShortcuts" @close="showShortcuts = false" />
```

在 script 中添加：
```typescript
import ShortcutHint from '../components/common/ShortcutHint.vue'
const showShortcuts = ref(false)
```

- [ ] **Step 3: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```

---

### Task 2: 低延迟预设 + 延迟优化

**Files:**
- Modify: `src/renderer/stores/presets.ts`
- Modify: `src/renderer/views/MirrorView.vue`

- [ ] **Step 1: 在预设中添加「低延迟模式」**

在 `src/renderer/stores/presets.ts` 的 `defaultPresets` 数组中添加：
```typescript
{
  id: 'preset-low-latency-v2',
  name: '⚡ 低延迟模式',
  description: '降低分辨率、提高码率，适合游戏等低延迟场景',
  options: {
    maxSize: 1024,
    maxFps: 60,
    videoCodec: 'h264',
    videoBitRate: '16M',
    noAudio: false
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}
```

把原来的 `preset-low-latency` 替换掉（ID 可以沿用或新增）。

更新原有的 `preset-wireless` 的码率设置：
```typescript
// 无线模式：进一步限制带宽
options: {
  maxSize: 1280,
  maxFps: 30,
  videoCodec: 'h264',
  videoBitRate: '4M',
  noAudio: true  // 无线时默认关音频降延迟
}
```

- [ ] **Step 2: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```

---

### Task 3: 设备历史管理

**Files:**
- Create: `src/renderer/stores/history.ts`（或者直接在 device store 中扩展）
- Modify: `src/renderer/components/device/DeviceList.vue`
- Modify: `src/renderer/stores/device.ts`
- Modify: `src/renderer/stores/session.ts`

- [ ] **Step 1: 在 device store 中添加历史记录管理**

在 `src/renderer/stores/device.ts` 中添加：
```typescript
// 设备历史接口
interface DeviceHistory {
  serial: string
  model: string
  lastConnected: string  // ISO date string
}

// 保存设备到历史
function saveToHistory(device: DeviceInfo): void {
  const history = loadHistory()
  const existing = history.findIndex(h => h.serial === device.serial)
  const entry: DeviceHistory = {
    serial: device.serial,
    model: device.model || device.serial,
    lastConnected: new Date().toISOString()
  }
  if (existing >= 0) {
    history[existing] = entry
  } else {
    history.unshift(entry)
  }
  // 保留最近 10 个
  localStorage.setItem('scrcpy-device-history', JSON.stringify(history.slice(0, 10)))
}

// 加载历史
function loadHistory(): DeviceHistory[] {
  try {
    const data = localStorage.getItem('scrcpy-device-history')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

// 在 selectDevice 或 refreshDevices 中调用 saveToHistory
```

同时暴露 `history` ref 和 `loadHistory`、`clearHistory` 方法。

- [ ] **Step 2: 在 session store 的 start() 成功后保存设备历史**

在 `src/renderer/stores/session.ts` 的 `start()` 函数中，成功启动后：
```typescript
// 在 start() 的 try 块中，await window.scrcpyAPI.startScrcpy(...) 之后
import { useDeviceStore } from './device'
const deviceStore = useDeviceStore()
if (deviceStore.selectedDevice) {
  deviceStore.saveToHistory(deviceStore.selectedDevice)
}
```

- [ ] **Step 3: 在 DeviceList.vue 中添加历史设备区域**

在模板末尾（设备列表下方）添加：
```vue
<div v-if="deviceStore.history.length > 0" class="history-section">
  <div class="section-header" style="margin-top: 24px;">
    <h2>📋 历史设备</h2>
    <n-button size="tiny" quaternary @click="deviceStore.clearHistory()">清除</n-button>
  </div>
  <div class="devices">
    <div
      v-for="device in deviceStore.history"
      :key="device.serial"
      class="device-item"
      @click="reconnect(device)"
    >
      <div class="device-icon">📱</div>
      <div class="device-detail">
        <div class="device-model">{{ device.model }}</div>
        <div class="device-serial">{{ device.serial }}</div>
        <div class="device-state" style="color: #adb5bd; font-size: 11px;">
          上次连接: {{ formatDate(device.lastConnected) }}
        </div>
      </div>
    </div>
  </div>
</div>
```

在 script 中添加：
```typescript
import { useMessage } from 'naive-ui'
const message = useMessage()

async function reconnect(device: { serial: string }): Promise<void> {
  try {
    const result = await window.scrcpyAPI.connectTCPIP(device.serial)
    message.success(`已尝试连接: ${result}`)
  } catch (err: any) {
    message.error(`连接失败: ${err.message || err}`)
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.getMonth()+1}月${d.getDate()}日 ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
  } catch { return iso }
}
```

- [ ] **Step 4: 编译验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1 | tail -5
```

---

### Task 4: 全量编译 + 开发运行验证

- [ ] **Step 1: 全量编译**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && npm run build 2>&1
```
Expected: exit code 0

- [ ] **Step 2: 开发模式验证**

```bash
cd E:/workspace/claude_workplace/scrcpy-gui && timeout 12 npm run dev 2>&1 || true
```
Expected: app launches, no "Store is not a constructor" error

- [ ] **Step 3: 功能验证清单**
  - [ ] 投屏页面有「⌨️ 快捷键」按钮
  - [ ] 点击按钮弹出快捷键列表浮窗
  - [ ] 点击遮罩层关闭浮窗
  - [ ] 预设中有「低延迟模式」
  - [ ] 连接一次设备后，首页出现历史设备列表
  - [ ] 快速设置面板文字不挤在一起（垂直排列）
