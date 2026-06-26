<template>
  <div class="settings-panel">
    <n-space vertical :size="compact ? 8 : 16">
      <div class="setting-row">
        <div class="setting-label">
          <span>录屏 <InfoTip tip="开启后会在投屏的同时录制视频。<br>录制文件保存在电脑上，不影响手机。<br>支持同时录制画面和声音。" /></span>
          <span class="hint">录制设备画面到文件</span>
        </div>
        <n-switch v-model:value="recording" :size="compact ? 'small' : 'medium'" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>录屏格式 <InfoTip tip="MP4：通用性最强，推荐日常使用<br>MKV：更灵活，适合后期处理<br>纯音频推荐 OPUS/FLAC/WAV" /></span>
          <span class="hint">选择容器格式</span>
        </div>
        <n-select
          v-model:value="sessionStore.options.recordFormat"
          :options="formatOptions"
          style="width: 140px"
          :size="compact ? 'small' : 'medium'"
          :disabled="!sessionStore.options.record"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>保存位置 <InfoTip tip="录屏文件的保存目录。<br>留空则使用默认位置（文档/scrcpy-recordings）" /></span>
          <span class="hint">选择录屏文件保存目录</span>
        </div>
        <n-input
          v-model:value="recordPath"
          placeholder="默认：文档/scrcpy-recordings"
          :disabled="!sessionStore.options.record"
          style="width: 280px"
          :size="compact ? 'small' : 'medium'"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>仅录制不播放 <InfoTip tip="开启后屏幕不显示画面，只在后台录制。<br>适合需要录屏但不需要实时观看的场景。<br>节省系统资源。" /></span>
          <span class="hint">后台录制，不显示画面</span>
        </div>
        <n-switch
          v-model:value="sessionStore.options.noPlayback"
          :size="compact ? 'small' : 'medium'"
          :disabled="!sessionStore.options.record"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span>录制时长限制 <InfoTip tip="设置录制时长上限，超过自动停止。<br>0 为不限时长。防止忘记关闭一直录下去。" /></span>
          <span class="hint">超过时间自动停止录制</span>
        </div>
        <n-input-number
          v-model:value="timeLimit"
          :min="0"
          :max="3600"
          :disabled="!sessionStore.options.record"
          style="width: 140px"
          :size="compact ? 'small' : 'medium'"
        >
          <template #suffix>秒</template>
        </n-input-number>
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

const formatOptions = [
  { label: 'MP4', value: 'mp4' },
  { label: 'MKV', value: 'mkv' },
  { label: 'OPUS', value: 'opus' },
  { label: 'FLAC', value: 'flac' },
  { label: 'WAV', value: 'wav' }
]

const recording = computed({
  get: () => sessionStore.options.record || false,
  set: (val: boolean) => {
    sessionStore.setOption('record', val)
    if (val && !sessionStore.options.recordPath) {
      sessionStore.setOption('recordPath', '')
    }
  }
})

const recordPath = computed({
  get: () => sessionStore.options.recordPath || '',
  set: (val: string) => sessionStore.setOption('recordPath', val || undefined)
})

const timeLimit = computed({
  get: () => sessionStore.options.timeLimit || 0,
  set: (val: number | null) => sessionStore.setOption('timeLimit', val || undefined)
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
