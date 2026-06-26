<template>
  <div class="settings">
    <h1>⚙️ 设置</h1>

    <n-tabs type="line" animated>
      <n-tab-pane name="video" tab="视频">
        <VideoSettings />
      </n-tab-pane>
      <n-tab-pane name="audio" tab="音频">
        <AudioSettings />
      </n-tab-pane>
      <n-tab-pane name="record" tab="录屏">
        <RecordSettings />
      </n-tab-pane>
      <n-tab-pane name="display" tab="显示">
        <DisplaySettings />
      </n-tab-pane>
      <n-tab-pane name="advanced" tab="高级">
        <AdvancedSettings />
      </n-tab-pane>
      <n-tab-pane name="app" tab="应用设置">
        <AppSettings />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import VideoSettings from '../components/settings/VideoSettings.vue'
import AudioSettings from '../components/settings/AudioSettings.vue'
import RecordSettings from '../components/settings/RecordSettings.vue'
import DisplaySettings from '../components/settings/DisplaySettings.vue'
import AdvancedSettings from '../components/settings/AdvancedSettings.vue'
import AppSettings from '../components/settings/AppSettings.vue'
</script>

<style scoped>
.settings h1 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 20px;
}
</style>
