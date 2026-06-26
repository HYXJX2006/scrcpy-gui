import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import type { DeviceInfo, DeviceProps } from '../../main/scrcpy/types'

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<DeviceInfo[]>([])
  const selectedDevice = ref<DeviceInfo | null>(null)
  const deviceProps = ref<DeviceProps | null>(null)
  const connecting = ref(false)
  const connectStatus = ref('')

  // === Device History ===
  interface DeviceHistoryEntry {
    serial: string
    model: string
    lastConnected: string
  }

  const history = ref<DeviceHistoryEntry[]>(loadHistory())

  function loadHistory(): DeviceHistoryEntry[] {
    try {
      const data = localStorage.getItem('scrcpy-device-history')
      return data ? JSON.parse(data) : []
    } catch { return [] }
  }

  function saveToHistory(device: { serial: string; model?: string }): void {
    const entry: DeviceHistoryEntry = {
      serial: device.serial,
      model: device.model || device.serial,
      lastConnected: new Date().toISOString()
    }
    const existing = history.value.findIndex(h => h.serial === device.serial)
    if (existing >= 0) {
      history.value[existing] = entry
    } else {
      history.value.unshift(entry)
    }
    // Keep max 10 entries
    history.value = history.value.slice(0, 10)
    localStorage.setItem('scrcpy-device-history', JSON.stringify(history.value))
  }

  function clearHistory(): void {
    history.value = []
    localStorage.removeItem('scrcpy-device-history')
  }

  // Fetch device list
  async function refreshDevices(): Promise<void> {
    try {
      devices.value = await window.scrcpyAPI.getDevices()
    } catch {
      // ADB not available
      devices.value = []
    }
  }

  // Select a device
  function selectDevice(device: DeviceInfo | null): void {
    selectedDevice.value = device
    if (device) {
      loadDeviceProps(device.serial)
    } else {
      deviceProps.value = null
    }
  }

  // Load device properties
  async function loadDeviceProps(serial: string): Promise<void> {
    try {
      deviceProps.value = await window.scrcpyAPI.getDeviceProps(serial)
    } catch {
      deviceProps.value = null
    }
  }

  // Connect via TCP/IP
  async function connectTCPIP(ip: string, port?: number): Promise<string> {
    connecting.value = true
    connectStatus.value = '正在连接...'
    try {
      const result = await window.scrcpyAPI.connectTCPIP(ip, port)
      connectStatus.value = result
      await refreshDevices()
      return result
    } catch (err: any) {
      connectStatus.value = err.message || '连接失败'
      throw err
    } finally {
      connecting.value = false
    }
  }

  // Disconnect
  async function disconnectDevice(serial: string): Promise<void> {
    try {
      await window.scrcpyAPI.disconnectDevice(serial)
      if (selectedDevice.value?.serial === serial) {
        selectedDevice.value = null
        deviceProps.value = null
      }
      await refreshDevices()
    } catch {
      // ignore
    }
  }

  // Listen for device list changes
  function listen(): void {
    window.scrcpyAPI.onDeviceListChange((newDevices) => {
      devices.value = newDevices
      // Auto-select if only one device
      if (newDevices.length === 1 && !selectedDevice.value) {
        selectDevice(newDevices[0])
      }
      // Deselect if disconnected
      if (
        selectedDevice.value &&
        !newDevices.find((d) => d.serial === selectedDevice.value?.serial)
      ) {
        selectedDevice.value = null
        deviceProps.value = null
      }
    })
  }

  function cleanup(): void {
    window.scrcpyAPI.removeAllListeners('device:listChanged')
  }

  return {
    devices,
    selectedDevice,
    deviceProps,
    connecting,
    connectStatus,
    history,
    refreshDevices,
    selectDevice,
    loadDeviceProps,
    connectTCPIP,
    disconnectDevice,
    saveToHistory,
    clearHistory,
    listen,
    cleanup
  }
})
