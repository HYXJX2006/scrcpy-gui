<template>
  <div class="control-bar">
    <div class="control-group">
      <n-button
        size="small" secondary
        :loading="fullscreenLoading"
        @click="toggleFullscreen"
        title="全屏"
      >
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </template>
      </n-button>

      <n-button
        size="small" secondary
        :loading="screenLoading"
        @click="toggleScreen"
        title="息屏/亮屏"
      >
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
          </svg>
        </template>
      </n-button>

      <n-button
        size="small" secondary
        :loading="rotateLoading"
        @click="rotateScreen"
        title="旋转"
      >
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </template>
      </n-button>

      <n-button
        size="small" secondary
        :loading="screenshotLoading"
        @click="takeScreenshot"
        title="截屏"
      >
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
        </template>
      </n-button>
    </div>

    <div class="control-group">
      <n-button size="small" secondary type="warning" @click="stopMirror">
        ⏹ 停止
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useSessionStore } from '../../stores/session'
import { useDeviceStore } from '../../stores/device'

const message = useMessage()
const sessionStore = useSessionStore()
const deviceStore = useDeviceStore()

const screenshotLoading = ref(false)
const screenLoading = ref(false)
const rotateLoading = ref(false)
const fullscreenLoading = ref(false)

function getSerial(): string | undefined {
  return deviceStore.selectedDevice?.serial
}

// 全屏：在 scrcpy 窗口按 Alt+Enter
async function toggleFullscreen(): Promise<void> {
  const serial = getSerial()
  if (!serial) { message.warning('请先连接设备'); return }
  fullscreenLoading.value = true
  try {
    // 修改本地选项
    sessionStore.setOption('fullscreen', !sessionStore.options.fullscreen)
    message.success(sessionStore.options.fullscreen ? '下次启动时全屏' : '下次启动时取消全屏')
  } finally {
    fullscreenLoading.value = false
  }
}

// 息屏/亮屏：通过 ADB 发送电源键
async function toggleScreen(): Promise<void> {
  const serial = getSerial()
  if (!serial) { message.warning('请先连接设备'); return }
  screenLoading.value = true
  try {
    await window.scrcpyAPI.toggleScreen(serial)
    message.info('已切换屏幕状态')
  } catch (err: any) {
    message.error('操作失败: ' + (err.message || err))
  } finally {
    screenLoading.value = false
  }
}

// 旋转屏幕：0=竖屏 1=横屏
async function rotateScreen(): Promise<void> {
  const serial = getSerial()
  if (!serial) { message.warning('请先连接设备'); return }
  rotateLoading.value = true
  try {
    const current = sessionStore.options.lockOrientation
    const next = current === '1' ? '0' : '1'
    sessionStore.setOption('lockOrientation', next as '0' | '1')
    await window.scrcpyAPI.rotate(serial, next)
    message.success(next === '1' ? '已切换横屏' : '已切换竖屏')
  } catch (err: any) {
    message.error('旋转失败: ' + (err.message || err))
  } finally {
    rotateLoading.value = false
  }
}

// 截屏
async function takeScreenshot(): Promise<void> {
  const serial = getSerial()
  if (!serial) { message.warning('请先连接设备'); return }
  screenshotLoading.value = true
  try {
    const now = new Date().toISOString().replace(/[:.]/g, '-')
    const result = await window.scrcpyAPI.takeScreenshot(serial, now)
    message.success(`截图已保存: ${result}`)
  } catch (err: any) {
    message.error('截图失败: ' + (err.message || err))
  } finally {
    screenshotLoading.value = false
  }
}

function stopMirror(): void {
  sessionStore.stop()
}
</script>

<style scoped>
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
}

.control-group {
  display: flex;
  gap: 6px;
}
</style>
