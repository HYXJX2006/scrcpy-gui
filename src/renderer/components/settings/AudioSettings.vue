<template>
  <div class="settings-panel">
    <n-space vertical :size="compact ? 8 : 16">
      <div class="setting-row">
        <div class="setting-label">
          <span>音频转发 <InfoTip tip="将手机声音通过电脑扬声器播放。<br>需 Android 11+ 支持。<br>关闭后投屏将只有画面没有声音。" /></span>
          <span class="hint">需 Android 11+ 支持</span>
        </div>
        <n-switch
          :value="!sessionStore.options.noAudio"
          :size="compact ? 'small' : 'medium'"
          @update:value="(val) => sessionStore.setOption('noAudio', !val)"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>音频源 <InfoTip tip="output：转发设备全部音频输出（默认）<br>playback：捕获正在播放的音频<br>mic：使用设备麦克风录音<br>选择 mic 可当无线麦克风用。" /></span>
          <span class="hint">选择音频采集来源</span>
        </div>
        <n-select
          v-model:value="sessionStore.options.audioSource"
          :options="sourceOptions"
          style="width: 160px"
          :size="compact ? 'small' : 'medium'"
          :disabled="sessionStore.options.noAudio"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>音频编码 <InfoTip tip="AAC：通用性最好，兼容性最佳（默认）<br>OPUS：压缩率更高，同样码率音质更好<br>FLAC：无损格式，文件较大<br>RAW：未压缩 WAV，音质最好文件最大" /></span>
          <span class="hint">AAC 通用性最好</span>
        </div>
        <n-select
          v-model:value="sessionStore.options.audioCodec"
          :options="codecOptions"
          style="width: 160px"
          :size="compact ? 'small' : 'medium'"
          :disabled="sessionStore.options.noAudio"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>音频缓冲 <InfoTip tip="增加缓冲可以减少音频卡顿和爆音。<br>但会增加延迟（不同步）。<br>WiFi 连接推荐 200ms，USB 可设为 0。" /></span>
          <span class="hint">增加缓冲减少音频卡顿</span>
        </div>
        <n-slider
          v-model:value="buffer"
          :min="0"
          :max="500"
          :step="50"
          :marks="{ 0: '0ms', 250: '250ms', 500: '500ms' }"
          style="width: 240px"
          :disabled="sessionStore.options.noAudio"
        />
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

const sourceOptions = [
  { label: '音频输出', value: 'output' },
  { label: '音频播放', value: 'playback' },
  { label: '麦克风', value: 'mic' }
]

const codecOptions = [
  { label: 'AAC (默认)', value: 'aac' },
  { label: 'OPUS', value: 'opus' },
  { label: 'FLAC', value: 'flac' },
  { label: 'RAW (WAV)', value: 'raw' }
]

const buffer = computed({
  get: () => sessionStore.options.audioBuffer || 0,
  set: (val: number) => sessionStore.setOption('audioBuffer', val || undefined)
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
