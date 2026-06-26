import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScrcpyOptions } from '../../main/scrcpy/types'
import { getDefaultOptions } from '../../main/scrcpy/options'
import { useDeviceStore } from './device'

export const useSessionStore = defineStore('session', () => {
  const options = ref<ScrcpyOptions>(getDefaultOptions())
  const isRunning = ref(false)
  const logs = ref<string[]>([])
  const error = ref<string | null>(null)

  const optionsSummary = computed(() => {
    const parts: string[] = []
    const o = options.value
    if (o.maxSize) parts.push(`${o.maxSize}p`)
    if (o.maxFps) parts.push(`${o.maxFps}fps`)
    if (o.videoCodec) parts.push(o.videoCodec.toUpperCase())
    if (o.videoBitRate) parts.push(o.videoBitRate)
    if (o.record) parts.push('📹录制')
    if (o.turnScreenOff) parts.push('💤息屏')
    if (o.newDisplay) parts.push('🖥️虚拟显示')
    if (o.noAudio) parts.push('🔇无音频')
    return parts.join(' · ') || '默认'
  })

  // Update a specific option
  function setOption<K extends keyof ScrcpyOptions>(
    key: K,
    value: ScrcpyOptions[K]
  ): void {
    options.value = { ...options.value, [key]: value }
  }

  // Reset to defaults
  function resetOptions(): void {
    options.value = getDefaultOptions()
  }

  // Load a full options object
  function loadOptions(opts: Partial<ScrcpyOptions>): void {
    options.value = { ...getDefaultOptions(), ...opts }
  }

  // Start mirroring
  async function start(deviceSerial?: string): Promise<void> {
    error.value = null
    try {
      if (deviceSerial) {
        options.value.deviceSerial = deviceSerial
      }
      // Deep clone to strip Vue reactivity Proxy before IPC
      await window.scrcpyAPI.startScrcpy(JSON.parse(JSON.stringify(options.value)))
      isRunning.value = true

      // 成功启动后保存到设备历史
      const deviceStore = useDeviceStore()
      if (deviceStore.selectedDevice) {
        deviceStore.saveToHistory(deviceStore.selectedDevice)
      }
    } catch (err: any) {
      error.value = err.message || '启动失败'
      throw err
    }
  }

  // Stop mirroring
  async function stop(): Promise<void> {
    try {
      await window.scrcpyAPI.stopScrcpy()
      isRunning.value = false
    } catch {
      // ignore
    }
  }

  // Restart with new options
  async function restart(): Promise<void> {
    try {
      await window.scrcpyAPI.restartScrcpy(JSON.parse(JSON.stringify(options.value)))
      isRunning.value = true
    } catch (err: any) {
      error.value = err.message || '重启失败'
      throw err
    }
  }

  // Add log entry
  function addLog(msg: string): void {
    const timestamp = new Date().toLocaleTimeString()
    logs.value.push(`[${timestamp}] ${msg}`)
    // Keep last 500 logs
    if (logs.value.length > 500) {
      logs.value = logs.value.slice(-500)
    }
  }

  // Clear logs
  function clearLogs(): void {
    logs.value = []
  }

  // Listen for scrcpy events
  function listen(): void {
    // Sync running state with main process on startup
    window.scrcpyAPI.isScrcpyRunning().then((running) => {
      isRunning.value = running
    }).catch(() => { /* ignore */ })

    window.scrcpyAPI.onScrcpyLog((msg) => {
      addLog(msg)
    })
    window.scrcpyAPI.onScrcpyStopped((code) => {
      isRunning.value = false
      addLog(`scrcpy 已退出 (code: ${code ?? 'unknown'})`)
    })
  }

  function cleanup(): void {
    window.scrcpyAPI.removeAllListeners('scrcpy:log')
    window.scrcpyAPI.removeAllListeners('scrcpy:stopped')
  }

  return {
    options,
    isRunning,
    logs,
    error,
    optionsSummary,
    setOption,
    resetOptions,
    loadOptions,
    start,
    stop,
    restart,
    addLog,
    clearLogs,
    listen,
    cleanup
  }
})
