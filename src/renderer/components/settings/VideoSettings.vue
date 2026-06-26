<template>
  <div class="settings-panel">
    <n-space vertical :size="compact ? 8 : 16">
      <div class="setting-row">
        <div class="setting-label">
          <span>分辨率限制 <InfoTip tip="限制画面尺寸可以显著提升投屏流畅度。<br>数值越小性能越好，原始尺寸画质最好。<br>适合：游戏时设 1024，演示时设原始尺寸。" /></span>
          <span class="hint">限制画面尺寸以提升性能</span>
        </div>
        <n-select
          v-model:value="sessionStore.options.maxSize"
          :options="sizeOptions"
          style="width: 180px"
          :size="compact ? 'small' : 'medium'"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>帧率 <InfoTip tip="限制最大帧率可以降低带宽和发热。<br>0=自动（设备原生帧率）<br>游戏推荐 60fps，日常 30fps 足够流畅。" /></span>
          <span class="hint">限制帧率以降低带宽</span>
        </div>
        <n-slider
          v-model:value="sessionStore.options.maxFps"
          :min="0"
          :max="120"
          :step="15"
          :marks="fpsMarks"
          style="width: 240px"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>视频编码 <InfoTip tip="H264：兼容性最好，延迟最低（推荐）<br>H265：同等码率画质更好，但延迟略高<br>AV1：画质最高，但需设备硬解支持<br>如果投屏花屏，先切回 H264。" /></span>
          <span class="hint">H265 画质更好，H264 延迟更低</span>
        </div>
        <n-radio-group v-model:value="codec" :size="compact ? 'small' : 'medium'">
          <n-radio-button value="h264">H264</n-radio-button>
          <n-radio-button value="h265">H265</n-radio-button>
          <n-radio-button value="av1">AV1</n-radio-button>
        </n-radio-group>
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>视频码率 <InfoTip tip="码率越高画质越好，但带宽占用也越大。<br>8M 是默认值，日常使用画质足够。<br>WiFi 连接推荐 4~8M，USB 可用 16~32M。" /></span>
          <span class="hint">码率越高画质越好</span>
        </div>
        <n-select
          v-model:value="bitRate"
          :options="bitrateOptions"
          style="width: 180px"
          :size="compact ? 'small' : 'medium'"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>显示 FPS <InfoTip tip="在屏幕左上角显示实时帧率，方便评估投屏流畅度。<br>可在投屏过程中随时按 Ctrl+i 切换。" /></span>
          <span class="hint">在屏幕左上角显示帧率</span>
        </div>
        <n-switch v-model:value="sessionStore.options.printFps" :size="compact ? 'small' : 'medium'" />
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

const sizeOptions = [
  { label: '原始尺寸', value: 0 },
  { label: '3840 (4K)', value: 3840 },
  { label: '2560 (2K)', value: 2560 },
  { label: '1920 (1080p)', value: 1920 },
  { label: '1280 (720p)', value: 1280 },
  { label: '1024', value: 1024 },
  { label: '800', value: 800 },
  { label: '640', value: 640 }
]

const fpsMarks = {
  0: '自动',
  30: '30',
  60: '60',
  120: '120'
}

const codec = computed({
  get: () => sessionStore.options.videoCodec || 'h264',
  set: (val: 'h264' | 'h265' | 'av1') => sessionStore.setOption('videoCodec', val)
})

const bitRate = computed({
  get: () => sessionStore.options.videoBitRate || '8M',
  set: (val: string) => sessionStore.setOption('videoBitRate', val)
})

const bitrateOptions = [
  { label: '1 Mbps', value: '1M' },
  { label: '2 Mbps', value: '2M' },
  { label: '4 Mbps', value: '4M' },
  { label: '8 Mbps (默认)', value: '8M' },
  { label: '12 Mbps', value: '12M' },
  { label: '16 Mbps', value: '16M' },
  { label: '24 Mbps', value: '24M' },
  { label: '32 Mbps', value: '32M' },
  { label: '50 Mbps', value: '50M' }
]
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
