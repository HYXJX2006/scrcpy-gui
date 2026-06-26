<template>
  <div class="settings-panel">
    <n-space vertical size="large">
      <h3>键盘与鼠标</h3>

      <div class="setting-row">
        <div class="setting-label">
          <span>键盘模式 <InfoTip tip="SDK：标准模式，兼容性好（默认）<br>UHID：模拟物理键盘，输入延迟更低<br>Virtual：虚拟键盘布局<br>游戏推荐 UHID，日常使用 SDK 即可。" /></span>
          <span class="hint">选择键盘输入方式</span>
        </div>
        <n-select
          v-model:value="sessionStore.options.keyboardMode"
          :options="keyboardOptions"
          style="width: 180px"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>鼠标模式 <InfoTip tip="SDK：标准模式，兼容性好（默认）<br>UHID：模拟物理鼠标，更精确<br>没有明显差异时选 SDK 即可。" /></span>
          <span class="hint">选择鼠标输入方式</span>
        </div>
        <n-select
          v-model:value="sessionStore.options.mouseMode"
          :options="mouseOptions"
          style="width: 180px"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>游戏手柄 <InfoTip tip="启用游戏手柄支持，可连接手柄操控手机游戏。<br>UHID 模式兼容性更好。<br>需手机 Android 12+。" /></span>
          <span class="hint">启用游戏手柄支持</span>
        </div>
        <n-select
          v-model:value="sessionStore.options.gamepad"
          :options="gamepadOptions"
          style="width: 180px"
        />
      </div>

      <n-divider />

      <h3>视频源</h3>

      <div class="setting-row">
        <div class="setting-label">
          <span>视频源 <InfoTip tip="设备屏幕：默认模式，投屏手机画面<br>摄像头：将手机当网络摄像头使用<br>需 Android 12+ 支持摄像头镜像。" /></span>
          <span class="hint">选择投屏来源</span>
        </div>
        <n-select
          v-model:value="source"
          :options="sourceOptions"
          style="width: 180px"
        />
      </div>

      <div v-if="sessionStore.options.videoSource === 'camera'" class="sub-settings">
        <div class="setting-row">
          <div class="setting-label">
            <span>摄像头方向 <InfoTip tip="后置摄像头：拍摄前方画面<br>前置摄像头：自拍视角" /></span>
          </div>
          <n-select
            v-model:value="sessionStore.options.cameraFacing"
            :options="cameraOptions"
            style="width: 160px"
          />
        </div>
        <div class="setting-row">
          <div class="setting-label">
            <span>摄像头尺寸 <InfoTip tip="指定摄像头采集分辨率。<br>格式：宽x高，如 1920x1080。<br>留空使用默认分辨率。" /></span>
          </div>
          <n-input
            v-model:value="cameraSize"
            placeholder="如 1920x1080"
            style="width: 160px"
          />
        </div>
      </div>

      <n-divider />

      <h3>其他</h3>

      <div class="setting-row">
        <div class="setting-label">
          <span>不创建窗口 <InfoTip tip="无窗口模式运行，适合后台录制。<br>启动后不会有投屏窗口，仅在后台运行。<br>与「仅录制不播放」一起使用效果最佳。" /></span>
          <span class="hint">无窗口模式运行（后台录制等）</span>
        </div>
        <n-switch v-model:value="sessionStore.options.noWindow" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>禁用屏保 <InfoTip tip="投屏期间阻止电脑进入屏幕保护。<br>适合长时间投屏的场景。" /></span>
          <span class="hint">投屏时阻止电脑屏保</span>
        </div>
        <n-switch v-model:value="sessionStore.options.disableScreensaver" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>退出时关闭 ADB <InfoTip tip="关闭 scrcpy 后自动结束 ADB 进程。<br>推荐开启，避免后台残留 adb 进程。" /></span>
        </div>
        <n-switch v-model:value="sessionStore.options.killAdbOnClose" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>OpenGL 旧版兼容 <InfoTip tip="使用旧版 OpenGL 渲染。<br>仅在显卡驱动有兼容问题时开启。<br>正常情况下不需要开。" /></span>
          <span class="hint">兼容老旧显卡</span>
        </div>
        <n-switch v-model:value="sessionStore.options.legacyGl" />
      </div>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '../../stores/session'
import InfoTip from '../common/InfoTip.vue'

const sessionStore = useSessionStore()

const keyboardOptions = [
  { label: 'SDK (默认)', value: 'sdk' },
  { label: 'UHID (物理键盘模拟)', value: 'uhid' },
  { label: 'Virtual (虚拟键盘)', value: 'virtual' }
]

const mouseOptions = [
  { label: 'SDK (默认)', value: 'sdk' },
  { label: 'UHID (物理鼠标模拟)', value: 'uhid' }
]

const gamepadOptions = [
  { label: '禁用', value: undefined },
  { label: 'UHID', value: 'uhid' },
  { label: 'SDK', value: 'sdk' }
]

const sourceOptions = [
  { label: '设备屏幕 (默认)', value: 'display' },
  { label: '摄像头', value: 'camera' }
]

const cameraOptions = [
  { label: '后置摄像头', value: 'back' },
  { label: '前置摄像头', value: 'front' }
]

const source = computed({
  get: () => sessionStore.options.videoSource || 'display',
  set: (val: 'display' | 'camera') => sessionStore.setOption('videoSource', val)
})

const cameraSize = computed({
  get: () => sessionStore.options.cameraSize || '',
  set: (val: string) => sessionStore.setOption('cameraSize', val || undefined)
})
</script>

<style scoped>
.settings-panel { width: 100%; }
h3 {
  font-size: 16px;
  color: #2c3e50;
  margin: 0;
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
.sub-settings {
  padding-left: 24px;
  border-left: 2px solid #e8eaed;
}
</style>
