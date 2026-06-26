import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ScrcpyOptions } from '../../main/scrcpy/types'

interface Settings {
  theme: 'light' | 'dark'
  autoSelectDevice: boolean
  autoStartMirror: boolean
  defaultRecordDir: string
  closeAdbOnExit: boolean
  checkUpdateOnStart: boolean
}

const defaultSettings: Settings = {
  theme: 'dark',
  autoSelectDevice: true,
  autoStartMirror: false,
  defaultRecordDir: '',
  closeAdbOnExit: false,
  checkUpdateOnStart: true
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(loadFromStorage())
  const isDirty = ref(false)

  function loadFromStorage(): Settings {
    // Because we can't use electron-store in renderer, use localStorage
    try {
      const saved = localStorage.getItem('scrcpy-gui-settings')
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) }
      }
    } catch {
      // ignore
    }
    return { ...defaultSettings }
  }

  function saveToStorage(): void {
    try {
      localStorage.setItem('scrcpy-gui-settings', JSON.stringify(settings.value))
      isDirty.value = false
    } catch {
      // ignore
    }
  }

  // Auto-save on changes
  watch(
    settings,
    () => {
      isDirty.value = true
    },
    { deep: true }
  )

  // Debounced save
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    () => isDirty.value,
    (dirty) => {
      if (dirty) {
        if (saveTimer) clearTimeout(saveTimer)
        saveTimer = setTimeout(() => saveToStorage(), 1000)
      }
    }
  )

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    settings.value = { ...settings.value, [key]: value }
  }

  function resetSettings(): void {
    settings.value = { ...defaultSettings }
    saveToStorage()
  }

  return {
    settings,
    isDirty,
    updateSetting,
    resetSettings,
    saveToStorage
  }
})
