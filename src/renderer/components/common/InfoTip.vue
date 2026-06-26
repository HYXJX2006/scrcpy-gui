<template>
  <n-tooltip trigger="hover" :placement="placement" :width="maxWidth">
    <template #trigger>
      <span class="info-tip" :style="{ fontSize: size + 'px' }">ⓘ</span>
    </template>
    <div class="tip-content" v-html="tip"></div>
  </n-tooltip>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tip: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    size?: number
    maxWidth?: number
  }>(),
  {
    placement: 'right',
    size: 14,
    maxWidth: 280
  }
)
</script>

<style scoped>
.info-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  cursor: help;
  transition: color 0.15s;
  margin-left: 4px;
  user-select: none;
}

.info-tip:hover {
  color: #4A90D9;
}

.tip-content {
  font-size: 12px;
  line-height: 1.6;
  color: #2c3e50;
}
</style>
