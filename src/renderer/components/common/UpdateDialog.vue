<template>
  <n-modal
    :show="visible"
    preset="card"
    title="📦 发现新版本"
    style="width: 420px"
    :bordered="false"
    :closable="true"
    @update:show="$emit('close')"
  >
    <div v-if="info" style="margin-bottom: 16px;">
      <p style="font-size: 14px; color: #6c757d; margin-bottom: 8px;">
        当前版本: <n-tag size="small" type="info">v{{ currentVersion }}</n-tag>
        → 新版本: <n-tag size="small" type="success">v{{ info.version }}</n-tag>
      </p>
      <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; max-height: 150px; overflow-y: auto;">
        <p style="font-size: 13px; color: #2c3e50; white-space: pre-wrap;">{{ info.notes || '暂无更新说明' }}</p>
      </div>
    </div>
    <n-space justify="end">
      <n-button @click="$emit('close')" size="medium">稍后更新</n-button>
      <n-button type="primary" @click="goDownload" size="medium">
        下载安装
      </n-button>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  info: { version: string; notes: string; url: string } | null
  currentVersion: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function goDownload() {
  window.open('https://github.com/HYXJX2006/scrcpy-gui/releases/latest', '_blank')
}
</script>
