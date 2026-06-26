<template>
  <div class="wireless-connect">
    <h2>📶 无线连接</h2>
    <div class="connect-form">
      <n-input-group>
        <n-input
          v-model:value="ipAddress"
          placeholder="设备 IP 地址，如 192.168.1.100"
          :disabled="deviceStore.connecting"
          style="width: 300px"
        />
        <n-input-number
          v-model:value="port"
          :min="1"
          :max="65535"
          placeholder="端口"
          style="width: 100px"
        />
        <n-button
          type="primary"
          :loading="deviceStore.connecting"
          :disabled="!ipAddress.trim()"
          @click="connect"
        >
          连接
        </n-button>
      </n-input-group>
    </div>
    <div v-if="deviceStore.connectStatus" class="connect-status">
      {{ deviceStore.connectStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useDeviceStore } from '../../stores/device'

const message = useMessage()
const deviceStore = useDeviceStore()
const ipAddress = ref('')
const port = ref(5555)

async function connect(): Promise<void> {
  try {
    const result = await deviceStore.connectTCPIP(ipAddress.value.trim(), port.value)
    message.success(`连接成功: ${result}`)
  } catch (err: any) {
    message.error(err.message || '连接失败')
  }
}
</script>

<style scoped>
.wireless-connect {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;
}

.wireless-connect h2 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 16px;
}

.connect-form {
  display: flex;
}

.connect-status {
  margin-top: 8px;
  font-size: 13px;
  color: #6c757d;
}
</style>
