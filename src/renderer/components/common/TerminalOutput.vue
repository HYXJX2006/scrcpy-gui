<template>
  <div class="terminal" ref="terminalRef">
    <div v-if="logs.length === 0" class="empty">等待日志...</div>
    <div v-for="(line, i) in logs" :key="i" :class="logClass(line)" class="log-line">{{ line }}</div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, nextTick } from 'vue'

const props = defineProps<{
  logs: string[]
}>()

const terminalRef = ref<HTMLElement | null>(null)

function logClass(line: string): string {
  if (line.includes('ERROR') || line.includes('失败') || line.includes('error')) return 'error'
  if (line.includes('成功') || line.includes('SUCCESS')) return 'success'
  if (line.includes('warning') || line.includes('WARN')) return 'warning'
  return ''
}

watch(
  () => props.logs.length,
  async () => {
    await nextTick()
    if (terminalRef.value) {
      terminalRef.value.scrollTop = terminalRef.value.scrollHeight
    }
  }
)
</script>

<style scoped>
.terminal {
  flex: 1;
  background: #f0f2f5;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-y: auto;
  min-height: 100px;
  max-height: 300px;
  border: 1px solid #e8eaed;
}

.empty {
  color: #ced4da;
  font-style: italic;
}

.log-line {
  color: #6c757d;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-line:empty {
  padding: 2px 0;
}

.log-line.error { color: #e53935; }
.log-line.success { color: #43a047; }
.log-line.warning { color: #fb8c00; }
</style>
