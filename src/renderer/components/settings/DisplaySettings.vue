<template>
  <div class="settings-panel">
    <n-space vertical :size="compact ? 8 : 16">
      <div class="setting-row">
        <div class="setting-label">
          <span>全屏模式 <InfoTip tip="启动投屏后自动切换到全屏显示。<br>也可在投屏中按 Ctrl+f 切换。" /></span>
          <span class="hint">启动时自动全屏</span>
        </div>
        <n-switch v-model:value="sessionStore.options.fullscreen" :size="compact ? 'small' : 'medium'" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>息屏投屏 <InfoTip tip="投屏时自动关闭手机屏幕以省电。<br>点击设备屏幕或按电源键可唤醒。<br>适合长时间投屏的场景。" /></span>
          <span class="hint">投屏时关闭设备屏幕</span>
        </div>
        <n-switch v-model:value="sessionStore.options.turnScreenOff" :size="compact ? 'small' : 'medium'" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>保持屏幕常亮 <InfoTip tip="投屏期间阻止手机自动熄屏。<br>适合需要一直看手机画面的场景。<br>与息屏投屏功能互斥。" /></span>
          <span class="hint">投屏期间设备不自动息屏</span>
        </div>
        <n-switch v-model:value="sessionStore.options.stayAwake" :size="compact ? 'small' : 'medium'" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>关闭时息屏 <InfoTip tip="退出投屏后自动关闭手机屏幕。<br>适合远程控制场景，节省电量。" /></span>
          <span class="hint">退出投屏后关闭设备屏幕</span>
        </div>
        <n-switch v-model:value="sessionStore.options.powerOffOnClose" :size="compact ? 'small' : 'medium'" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>画面旋转 <InfoTip tip="强制锁定投屏画面的方向。<br>0°=竖屏，90°=横屏<br>不锁定则跟随手机当前方向。" /></span>
          <span class="hint">锁定画面方向</span>
        </div>
        <n-select
          v-model:value="orientation"
          :options="orientationOptions"
          style="width: 160px"
          :size="compact ? 'small' : 'medium'"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>虚拟显示 <InfoTip tip="在设备上创建一个虚拟显示器。<br>可以在虚拟屏上启动应用，不影响手机主屏操作。<br>适合同时运行多个应用。" /></span>
          <span class="hint">在虚拟显示器上启动应用</span>
        </div>
        <n-switch v-model:value="sessionStore.options.newDisplay" :size="compact ? 'small' : 'medium'" />
      </div>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '../../stores/session'
import InfoTip from '../common/InfoTip.vue'

withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  { compact: false }
)

const sessionStore = useSessionStore()

const orientationOptions = [
  { label: '不锁定', value: undefined },
  { label: '竖屏 0°', value: '0' },
  { label: '横屏 90°', value: '1' },
  { label: '竖屏 180°', value: '2' },
  { label: '横屏 270°', value: '3' }
]

const orientation = computed({
  get: () => sessionStore.options.lockOrientation,
  set: (val) => sessionStore.setOption('lockOrientation', val)
})
</script>

<style scoped>
.settings-panel { width: 100%; }
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
</style>
