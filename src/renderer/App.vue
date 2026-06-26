<template>
  <n-config-provider :theme="lightTheme" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <div class="app-container" :class="{ 'is-maximized': isMaximized }">
            <TitleBar @toggle-maximize="toggleMaximize" />
            <div class="app-body">
              <SideNav />
              <main class="main-content">
                <router-view />
              </main>
            </div>
          </div>
          <CloseDialog
            :visible="showCloseDialog"
            @minimize-to-tray="onMinimizeToTray"
            @quit-app="onQuitApp"
            @cancel="onCancelClose"
          />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { lightTheme, zhCN, dateZhCN } from 'naive-ui'
import TitleBar from './components/layout/TitleBar.vue'
import SideNav from './components/layout/SideNav.vue'
import CloseDialog from './components/common/CloseDialog.vue'
import { useDeviceStore } from './stores/device'
import { useSessionStore } from './stores/session'

const deviceStore = useDeviceStore()
const sessionStore = useSessionStore()
const isMaximized = ref(false)
const showCloseDialog = ref(false)

async function toggleMaximize(): Promise<void> {
  window.scrcpyAPI.maximizeWindow()
}

function onMinimizeToTray(): void {
  showCloseDialog.value = false
  window.scrcpyAPI.minimizeToTray()
}

function onQuitApp(): void {
  showCloseDialog.value = false
  window.scrcpyAPI.quitApp()
}

function onCancelClose(): void {
  showCloseDialog.value = false
  // 通知主进程重置关闭标记，下次才能继续拦截
  window.scrcpyAPI.cancelClose()
}

onMounted(() => {
  deviceStore.listen()
  sessionStore.listen()
  deviceStore.refreshDevices()

  window.scrcpyAPI.onWindowMaximized((maximized) => {
    isMaximized.value = maximized
  })

  window.scrcpyAPI.onShowCloseDialog(() => {
    showCloseDialog.value = true
  })
})

onUnmounted(() => {
  deviceStore.cleanup()
  sessionStore.cleanup()
  window.scrcpyAPI.removeAllListeners('close:showDialog')
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
  color: #2c3e50;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.is-maximized .main-content {
  padding-top: 20px;
}
</style>
