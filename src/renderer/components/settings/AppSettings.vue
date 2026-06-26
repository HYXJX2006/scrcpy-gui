<template>
  <div class="settings-panel">
    <n-space vertical size="large">
      <div class="setting-row">
        <div class="setting-label">
          <span>主题</span>
          <span class="hint">切换界面的颜色主题</span>
        </div>
        <n-select
          v-model:value="theme"
          :options="[
            { label: '深色模式', value: 'dark' },
            { label: '浅色模式', value: 'light' }
          ]"
          style="width: 140px"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>自动检测设备</span>
          <span class="hint">启动时自动扫描已连接的 USB 设备</span>
        </div>
        <n-switch v-model:value="settingsStore.settings.autoSelectDevice" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>默认录屏目录</span>
          <span class="hint">录屏文件的默认保存位置</span>
        </div>
        <n-input
          v-model:value="settingsStore.settings.defaultRecordDir"
          placeholder="文档/scrcpy-recordings"
          style="width: 280px"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>退出时关闭 ADB</span>
        </div>
        <n-switch v-model:value="settingsStore.settings.closeAdbOnExit" />
      </div>

      <n-divider />

      <div class="actions">
        <n-button @click="sessionStore.resetOptions()">重置投屏设置</n-button>
        <n-button @click="settingsStore.resetSettings()">重置应用设置</n-button>
        <n-button @click="presetsStore.resetToDefaults()">重置预设</n-button>
      </div>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { useSessionStore } from '../../stores/session'
import { usePresetsStore } from '../../stores/presets'

const settingsStore = useSettingsStore()
const sessionStore = useSessionStore()
const presetsStore = usePresetsStore()

const theme = computed({
  get: () => settingsStore.settings.theme,
  set: (val: 'light' | 'dark') => settingsStore.updateSetting('theme', val)
})
</script>

<style scoped>
.settings-panel {
  width: 100%;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e8eaed;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label span:first-child {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.hint {
  font-size: 11px;
  color: #6c757d;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
