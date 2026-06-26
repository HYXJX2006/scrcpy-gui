<template>
  <n-modal
    :show="visible"
    :mask-closable="true"
    preset="card"
    title="退出确认"
    style="width: 380px"
    :bordered="false"
    :closable="true"
    @update:show="onClose"
  >
    <p style="margin-bottom: 24px; color: #6c757d;">
      投屏正在运行，请选择操作方式：
    </p>
    <n-space justify="end">
      <n-button @click="$emit('minimizeToTray')" type="primary" size="medium">
        缩小到托盘
      </n-button>
      <n-button @click="$emit('quitApp')" size="medium" ghost>
        关闭应用
      </n-button>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'minimizeToTray'): void
  (e: 'quitApp'): void
  (e: 'cancel'): void
}>()

function onClose(): void {
  emit('cancel')
}
</script>
