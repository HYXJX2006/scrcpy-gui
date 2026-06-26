<template>
  <div class="device-list" :class="{ collapsed }">
    <div class="section-header">
      <h2>📱 设备列表</h2>
      <n-button size="tiny" quaternary circle @click="deviceStore.refreshDevices()" title="刷新">
        <template #icon>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </template>
      </n-button>
    </div>

    <div v-if="deviceStore.devices.length === 0" class="empty-state">
      <p>未检测到设备</p>
      <p class="hint">请通过 USB 连接安卓设备</p>
      <p class="hint">并确保已开启 USB 调试</p>
    </div>

    <div v-else class="devices">
      <div
        v-for="device in deviceStore.devices"
        :key="device.serial"
        class="device-item"
        :class="{
          selected: deviceStore.selectedDevice?.serial === device.serial,
          offline: device.state !== 'device'
        }"
        @click="deviceStore.selectDevice(device)"
      >
        <div class="device-icon">
          <span class="status-dot" :class="device.state"></span>
          {{ device.state === 'device' ? '📱' : '❌' }}
        </div>
        <div class="device-detail">
          <div class="device-model">{{ device.model || device.serial }}</div>
          <div class="device-serial">{{ device.serial }}</div>
          <div class="device-state" :class="device.state">
            {{ device.state === 'device' ? '已连接' : device.state === 'offline' ? '离线' : '未授权' }}
          </div>
        </div>
      </div>
      </div>
    </div>

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
            <div class="device-last-seen" style="color: #adb5bd; font-size: 11px;">
              上次连接: {{ formatDate(device.lastConnected) }}
            </div>
          </div>
        </div>
      </div>
    </div>

</template>

<script setup lang="ts">
import { useDeviceStore } from '../../stores/device'
import { useMessage } from 'naive-ui'

withDefaults(
  defineProps<{
    collapsed?: boolean
  }>(),
  { collapsed: false }
)

const deviceStore = useDeviceStore()
const message = useMessage()

async function reconnect(device: { serial: string }): Promise<void> {
  // 先检查设备是否已连接（USB）
  await deviceStore.refreshDevices()
  const found = deviceStore.devices.find(d => d.serial === device.serial)
  if (found) {
    deviceStore.selectDevice(found)
    message.success(`已选择设备: ${device.model || device.serial}`)
    return
  }
  // 不在当前设备列表中，尝试无线连接
  try {
    const result = await window.scrcpyAPI.connectTCPIP(device.serial)
    message.success(`已尝试连接: ${result}`)
  } catch (err: any) {
    // 显示更友好的提示
    message.warning(`设备 ${device.model || device.serial} 未找到，请确认 USB 已连接或输入正确的 IP 地址`)
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours().toString().padStart(2, '0')
    const mins = d.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hours}:${mins}`
  } catch { return iso }
}
</script>

<style scoped>
.device-list {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h2 {
  font-size: 18px;
  color: #2c3e50;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.hint {
  font-size: 12px;
  margin-top: 4px;
  color: #ced4da;
}

.devices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  cursor: pointer;
  transition: all 0.15s;
}

.device-item:hover {
  border-color: #ced4da;
  background: #f8f9fa;
}

.device-item.selected {
  border-color: #4A90D9;
  background: rgba(74, 144, 217, 0.06);
}

.device-item.offline {
  opacity: 0.5;
}

.device-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
}

.device-detail {
  flex: 1;
  min-width: 0;
}

.device-model {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 2px;
}

.device-serial {
  font-size: 11px;
  color: #adb5bd;
  margin-bottom: 4px;
  word-break: break-all;
}

.device-state {
  font-size: 11px;
  font-weight: 500;
}

.device-state.device {
  color: #a6e3a1;
}

.device-state.offline {
  color: #f38ba8;
}

.device-state.unauthorized {
  color: #fab387;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  flex-shrink: 0;
}
.status-dot.device { background: #4CAF50; box-shadow: 0 0 4px rgba(76,175,80,0.4); }
.status-dot.offline { background: #adb5bd; }
.status-dot.unauthorized { background: #FF9800; }
</style>
