<template>
  <n-modal
    :show="visible"
    @update:show="$emit('close')"
    title="⌨️ scrcpy 快捷键"
    style="width: 420px"
    preset="card"
    :bordered="false"
    :mask-closable="true"
  >
    <n-table :bordered="false" :single-line="false" size="small">
      <thead>
        <tr><th>快捷键</th><th>功能</th></tr>
      </thead>
      <tbody>
        <tr v-for="item in shortcuts" :key="item.key">
          <td><n-tag size="small">{{ item.key }}</n-tag></td>
          <td>{{ item.desc }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-modal>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
defineEmits<{ (e: 'close'): void }>()

interface Shortcut { key: string; desc: string }
const shortcuts: Shortcut[] = [
  { key: 'Ctrl+f', desc: '切换全屏模式' },
  { key: 'Ctrl+x', desc: '退出全屏' },
  { key: 'Ctrl+o', desc: '息屏/亮屏' },
  { key: 'Ctrl+r', desc: '旋转画面' },
  { key: 'Ctrl+s', desc: '截屏' },
  { key: 'Ctrl+v', desc: '电脑剪贴板 → 手机' },
  { key: 'Ctrl+c', desc: '手机剪贴板 → 电脑' },
  { key: '右键', desc: '返回键' },
  { key: '中键', desc: '主页键' },
  { key: 'Ctrl+左键', desc: '最近任务' },
  { key: 'Ctrl+↑', desc: '音量+' },
  { key: 'Ctrl+↓', desc: '音量-' },
  { key: 'Ctrl+i', desc: '显示/隐藏 FPS' },
  { key: 'Ctrl+Shift+s', desc: '打开设置面板' }
]
</script>

<style scoped>
.shortcut-table {
  margin-top: 0;
}
</style>
