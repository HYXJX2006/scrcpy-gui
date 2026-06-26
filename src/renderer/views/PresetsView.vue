<template>
  <div class="presets">
    <div class="presets-header">
      <h1>📋 预设配置</h1>
      <n-button type="primary" @click="showSaveDialog = true">
        <template #icon><n-icon>+</n-icon></template>
        新建预设
      </n-button>
    </div>

    <p class="desc">保存常用的配置方案，快速切换不同场景</p>

    <div class="preset-grid">
      <n-card
        v-for="preset in presetsStore.presets"
        :key="preset.id"
        class="preset-card"
        hoverable
        @click="applyPreset(preset)"
      >
        <template #header>
          <div class="preset-name">{{ preset.name }}</div>
        </template>
        <p class="preset-desc">{{ preset.description }}</p>
        <div class="preset-options">
          <n-tag v-if="preset.options.maxSize" size="tiny">{{ preset.options.maxSize }}p</n-tag>
          <n-tag v-if="preset.options.maxFps" size="tiny">{{ preset.options.maxFps }}fps</n-tag>
          <n-tag v-if="preset.options.videoCodec" size="tiny">{{ preset.options.videoCodec.toUpperCase() }}</n-tag>
          <n-tag v-if="preset.options.videoBitRate" size="tiny">{{ preset.options.videoBitRate }}</n-tag>
        </div>
        <template #action>
          <n-space justify="end">
            <n-button size="tiny" quaternary @click.stop="loadToSettings(preset)">加载</n-button>
            <n-button size="tiny" quaternary danger @click.stop="deletePreset(preset.id)">删除</n-button>
          </n-space>
        </template>
      </n-card>
    </div>

    <!-- Save dialog -->
    <n-modal v-model:show="showSaveDialog" title="新建预设" preset="card" style="width: 400px">
      <n-form>
        <n-form-item label="名称">
          <n-input v-model:value="newPresetName" placeholder="例如：录视频专用" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="newPresetDesc" placeholder="简要说明" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSaveDialog = false">取消</n-button>
          <n-button type="primary" @click="savePreset" :disabled="!newPresetName.trim()">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { usePresetsStore } from '../stores/presets'
import { useSessionStore } from '../stores/session'
import type { Preset } from '../../main/scrcpy/types'

const message = useMessage()
const presetsStore = usePresetsStore()
const sessionStore = useSessionStore()

const showSaveDialog = ref(false)
const newPresetName = ref('')
const newPresetDesc = ref('')

function applyPreset(preset: Preset): void {
  sessionStore.loadOptions(preset.options)
  message.success(`已加载预设: ${preset.name}`)
}

function loadToSettings(preset: Preset): void {
  sessionStore.loadOptions(preset.options)
  message.success(`已加载: ${preset.name}，${preset.description}`)
}

function deletePreset(id: string): void {
  presetsStore.deletePreset(id)
  message.success('已删除预设')
}

function savePreset(): void {
  presetsStore.addPreset(
    newPresetName.value.trim(),
    newPresetDesc.value.trim(),
    { ...sessionStore.options }
  )
  newPresetName.value = ''
  newPresetDesc.value = ''
  showSaveDialog.value = false
  message.success('预设已保存')
}
</script>

<style scoped>
.presets h1 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.presets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.desc {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 24px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.preset-card {
  cursor: pointer;
}

.preset-name {
  font-weight: 600;
  color: #2c3e50;
}

.preset-desc {
  color: #6c757d;
  font-size: 13px;
  margin-bottom: 8px;
}

.preset-options {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
