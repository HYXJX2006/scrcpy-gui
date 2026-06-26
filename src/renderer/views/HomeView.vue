<template>
  <div class="home">
    <header class="page-header">
      <h1>📱 scrcpy GUI</h1>
      <p class="subtitle">Android 设备投屏控制工具</p>
    </header>

    <div class="quick-connect">
      <h2>快速开始</h2>
      <div class="steps">
        <div class="step">
          <div class="step-icon">1</div>
          <div>
            <strong>连接设备</strong>
            <p>通过 USB 或 WiFi 连接安卓设备</p>
          </div>
        </div>
        <div class="step">
          <div class="step-icon">2</div>
          <div>
            <strong>选择设备</strong>
            <p>在下方列表中选择要投屏的设备</p>
          </div>
        </div>
        <div class="step">
          <div class="step-icon">3</div>
          <div>
            <strong>开始投屏</strong>
            <p>点击「开始投屏」按钮，即可在电脑上操作</p>
          </div>
        </div>
      </div>
    </div>

    <DeviceList />

    <WirelessConnect />

    <div class="status-bar">
      <n-tag v-if="sessionStore.isRunning" type="success" size="small">投屏运行中</n-tag>
      <n-tag v-else type="default" size="small">未连接</n-tag>
      <span class="device-count">{{ deviceStore.devices.length }} 台设备</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DeviceList from '../components/device/DeviceList.vue'
import WirelessConnect from '../components/device/WirelessConnect.vue'
import { useDeviceStore } from '../stores/device'
import { useSessionStore } from '../stores/session'

const router = useRouter()
const deviceStore = useDeviceStore()
const sessionStore = useSessionStore()

onMounted(() => {
  deviceStore.refreshDevices()
})
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #4A90D9, #cba6f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #6c757d;
  font-size: 14px;
}

.quick-connect {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;
}

.quick-connect h2 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #2c3e50;
}

.steps {
  display: flex;
  gap: 20px;
}

.step {
  display: flex;
  gap: 12px;
  flex: 1;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4A90D9;
  color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step strong {
  display: block;
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.step p {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.status-bar {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #6c757d;
  font-size: 13px;
}

.device-count {
  margin-left: auto;
}
</style>
