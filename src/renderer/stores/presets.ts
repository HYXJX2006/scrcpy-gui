import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Preset, ScrcpyOptions } from '../../main/scrcpy/types'

const STORAGE_KEY = 'scrcpy-gui-presets'

const defaultPresets: Preset[] = [
  {
    id: 'preset-balanced',
    name: '⚖️ 均衡模式',
    description: '默认设置，适合日常使用',
    options: {
      maxSize: 0,
      maxFps: 0,
      videoCodec: 'h264',
      videoBitRate: '8M',
      audioSource: 'output'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'preset-low-latency',
    name: '⚡ 低延迟模式',
    description: '降低分辨率、提高码率，适合游戏等低延迟场景',
    options: {
      maxSize: 1024,
      maxFps: 60,
      videoCodec: 'h264',
      videoBitRate: '16M',
      noAudio: false
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'preset-high-quality',
    name: '🎨 高画质',
    description: '适合录屏演示，最大化画质',
    options: {
      maxSize: 0,
      maxFps: 60,
      videoCodec: 'h265',
      videoBitRate: '32M',
      audioSource: 'output'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'preset-wireless',
    name: '📶 无线模式',
    description: 'WiFi 连接时减少带宽占用',
    options: {
      maxSize: 1280,
      maxFps: 30,
      videoCodec: 'h264',
      videoBitRate: '4M',
      noAudio: true
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'preset-record-only',
    name: '🎥 仅录屏',
    description: '不投屏画面仅后台录制',
    options: {
      noWindow: true,
      noControl: true,
      record: true,
      recordPath: '',
      videoCodec: 'h265',
      videoBitRate: '24M'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
]

function generateId(): string {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const usePresetsStore = defineStore('presets', () => {
  const presets = ref<Preset[]>(loadFromStorage())

  function loadFromStorage(): Preset[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    return [...defaultPresets]
  }

  function saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.value))
    } catch {
      // ignore
    }
  }

  function addPreset(name: string, description: string, options: Partial<ScrcpyOptions>): Preset {
    const now = new Date().toISOString()
    const preset: Preset = {
      id: generateId(),
      name,
      description,
      options,
      createdAt: now,
      updatedAt: now
    }
    presets.value.push(preset)
    saveToStorage()
    return preset
  }

  function updatePreset(id: string, updates: Partial<Preset>): void {
    const idx = presets.value.findIndex((p) => p.id === id)
    if (idx !== -1) {
      presets.value[idx] = {
        ...presets.value[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveToStorage()
    }
  }

  function deletePreset(id: string): void {
    presets.value = presets.value.filter((p) => p.id !== id)
    saveToStorage()
  }

  function getPreset(id: string): Preset | undefined {
    return presets.value.find((p) => p.id === id)
  }

  function resetToDefaults(): void {
    presets.value = [...defaultPresets]
    saveToStorage()
  }

  return {
    presets,
    addPreset,
    updatePreset,
    deletePreset,
    getPreset,
    resetToDefaults
  }
})
