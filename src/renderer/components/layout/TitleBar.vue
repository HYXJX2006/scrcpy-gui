<template>
  <header class="title-bar">
    <div class="drag-region">
      <div class="app-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <span class="app-title">scrcpy GUI</span>
    </div>
    <div class="window-controls">
      <button class="control-btn" title="最小化" @click="minimize">
        <svg width="12" height="12" viewBox="0 0 12 12"><rect y="5" width="12" height="2" fill="#6c757d" /></svg>
      </button>
      <button class="control-btn" title="最大化" @click="toggleMaximize">
        <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" stroke="#6c757d" stroke-width="1.5" fill="none" /></svg>
      </button>
      <button class="control-btn control-close" title="关闭" @click="closeWin">
        <svg width="12" height="12" viewBox="0 0 12 12"><line x1="1" y1="1" x2="11" y2="11" stroke="#6c757d" stroke-width="2" /><line x1="11" y1="1" x2="1" y2="11" stroke="#6c757d" stroke-width="2" /></svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
function minimize(): void {
  window.scrcpyAPI.minimizeWindow()
}

function toggleMaximize(): void {
  window.scrcpyAPI.maximizeWindow()
}

function closeWin(): void {
  window.scrcpyAPI.closeWindow()
}
</script>

<style scoped>
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  background: #ffffff;
  user-select: none;
  flex-shrink: 0;
}

.drag-region {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  height: 100%;
  flex: 1;
  -webkit-app-region: drag;
}

.app-icon {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
  letter-spacing: 0.3px;
  -webkit-app-region: drag;
}

.window-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  outline: none;
  -webkit-app-region: no-drag;
  position: relative;
  z-index: 10;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.control-close:hover {
  background: #e64553;
}
</style>
