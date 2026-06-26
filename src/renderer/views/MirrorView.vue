<template>
  <div class="mirror">
    <header class="mirror-header">
      <h1>📺 投屏控制</h1>
      <div class="header-actions">
        <n-button
          :type="sessionStore.isRunning ? 'warning' : 'primary'"
          :disabled="!deviceStore.selectedDevice"
          :loading="starting"
          @click="toggleMirror"
        >
          {{ sessionStore.isRunning ? '停止投屏' : '开始投屏' }}
        </n-button>
        <n-button
          v-if="sessionStore.isRunning"
          secondary
          @click="showQuickSettings = !showQuickSettings"
        >
          ⚡ 快速设置
        </n-button>
        <n-button size="small" quaternary @click="showShortcuts = true">
          ⌨️ 快捷键
        </n-button>
      </div>
    </header>

    <!-- Device info bar -->
    <div v-if="deviceStore.selectedDevice" class="device-bar">
      <div class="device-info">
        <n-icon size="20"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/></svg></n-icon>
        <span class="device-name">{{ deviceStore.deviceProps?.model || deviceStore.selectedDevice.serial }}</span>
        <n-tag v-if="deviceStore.deviceProps?.resolution" size="tiny">{{ deviceStore.deviceProps.resolution }}</n-tag>
        <n-tag size="tiny">Android {{ deviceStore.deviceProps?.androidVersion }}</n-tag>
      </div>
      <div class="session-info">
        <span class="badge">{{ sessionStore.optionsSummary }}</span>
      </div>
    </div>

    <div v-else class="no-device">
      <n-empty description="请先在首页选择要投屏的设备">
        <template #extra>
          <n-button type="primary" @click="router.push('/')">前往首页</n-button>
        </template>
      </n-empty>
    </div>

    <!-- Quick settings panel -->
    <n-collapse-transition :show="showQuickSettings">
      <div class="quick-settings">
        <n-space vertical>
          <VideoSettings compact />
          <AudioSettings compact />
          <RecordSettings compact />
          <DisplaySettings compact />
        </n-space>
      </div>
    </n-collapse-transition>

    <!-- Control bar (shown when running) -->
    <n-collapse-transition :show="sessionStore.isRunning">
      <ControlBar />
    </n-collapse-transition>

    <!-- Scrcpy log -->
    <div class="log-section">
      <div class="log-header">
        <h3>📋 日志</h3>
        <n-button size="tiny" quaternary @click="sessionStore.clearLogs()">清空</n-button>
      </div>
      <TerminalOutput :logs="sessionStore.logs" />
    </div>

    <!-- Error alert -->
    <n-alert v-if="sessionStore.error" type="error" closable class="error-alert">
      {{ sessionStore.error }}
    </n-alert>

    <ShortcutHint :visible="showShortcuts" @close="showShortcuts = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDeviceStore } from '../stores/device'
import { useSessionStore } from '../stores/session'
import VideoSettings from '../components/settings/VideoSettings.vue'
import AudioSettings from '../components/settings/AudioSettings.vue'
import RecordSettings from '../components/settings/RecordSettings.vue'
import DisplaySettings from '../components/settings/DisplaySettings.vue'
import ControlBar from '../components/control/ControlBar.vue'
import TerminalOutput from '../components/common/TerminalOutput.vue'
import ShortcutHint from '../components/common/ShortcutHint.vue'

const router = useRouter()
const deviceStore = useDeviceStore()
const sessionStore = useSessionStore()
const starting = ref(false)
const showQuickSettings = ref(false)
const showShortcuts = ref(false)

async function toggleMirror(): Promise<void> {
  if (sessionStore.isRunning) {
    await sessionStore.stop()
    return
  }

  starting.value = true
  try {
    await sessionStore.start(deviceStore.selectedDevice?.serial)
  } catch {
    // error is already set in store
  } finally {
    starting.value = false
  }
}
</script>

<style scoped>
.mirror {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mirror-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mirror-header h1 {
  font-size: 22px;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.device-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
}

.device-name {
  font-weight: 600;
}

.badge {
  font-size: 12px;
  color: #6c757d;
  background: rgba(74, 144, 217, 0.06);
  padding: 2px 8px;
  border-radius: 4px;
}

.no-device {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.quick-settings {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  max-height: 400px;
  overflow-y: auto;
}

.log-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-header h3 {
  font-size: 14px;
  color: #6c757d;
}

.error-alert {
  position: fixed;
  bottom: 20px;
  right: 20px;
  max-width: 400px;
  z-index: 100;
}
</style>
