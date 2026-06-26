import { execSync, spawn } from 'child_process'
import type { BrowserWindow, IpcMain } from 'electron'
import { getAdbPath, getScrcpyDir } from '../utils/path'
import { existsSync } from 'fs'
import type { DeviceInfo, DeviceProps } from '../scrcpy/types'

let pollTimer: ReturnType<typeof setInterval> | null = null
let lastDevices: DeviceInfo[] = []
let mainWindowRef: BrowserWindow | null = null

/**
 * Execute ADB command and return stdout
 */
function adb(args: string): string {
  const adbPath = getAdbPath()
  if (!existsSync(adbPath)) {
    return ''
  }
  try {
    return execSync(`"${adbPath}" ${args}`, {
      cwd: getScrcpyDir(),
      timeout: 5000,
      encoding: 'utf-8'
    })
  } catch {
    return ''
  }
}

/**
 * Parse `adb devices -l` output into DeviceInfo[]
 */
function parseDevices(output: string): DeviceInfo[] {
  const devices: DeviceInfo[] = []
  const lines = output.split('\n').filter((l) => l.trim())

  for (const line of lines) {
    // Skip header
    if (line.startsWith('List of devices')) continue

    // Format: serial  state  usb:... product:... model:... device:... transport_id:...
    const parts = line.trim().split(/\s+/)
    if (parts.length < 2) continue

    const serial = parts[0]
    const state = parts[1] as DeviceInfo['state']

    const device: DeviceInfo = { serial, state }

    // Extract extra properties from `adb devices -l`
    for (let i = 2; i < parts.length; i++) {
      if (parts[i].startsWith('model:')) {
        device.model = parts[i].replace('model:', '')
      }
      if (parts[i].startsWith('product:')) {
        device.product = parts[i].replace('product:', '')
      }
      if (parts[i].startsWith('transport_id:')) {
        device.transportId = parts[i].replace('transport_id:', '')
      }
    }

    devices.push(device)
  }

  return devices
}

/**
 * Broadcast device list change to renderer
 */
function notifyDevices(devices: DeviceInfo[]): void {
  mainWindowRef?.webContents.send('device:listChanged', devices)
}

/**
 * Poll ADB devices periodically
 */
function startPolling(): void {
  if (pollTimer) return

  pollTimer = setInterval(() => {
    const output = adb('devices -l')
    if (!output) return

    const devices = parseDevices(output)
    const changed =
      JSON.stringify(devices) !== JSON.stringify(lastDevices)

    if (changed) {
      lastDevices = devices
      notifyDevices(devices)
    }
  }, 2000)
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

export function registerDeviceIPC(
  ipcMain: IpcMain,
  mainWindow: BrowserWindow | null
): void {
  mainWindowRef = mainWindow

  // Get current device list
  ipcMain.handle('device:getDevices', () => {
    const output = adb('devices -l')
    if (!output) return []
    return parseDevices(output)
  })

  // Connect to device via TCP/IP
  ipcMain.handle(
    'device:connectTCPIP',
    async (_event, ip: string, port?: number) => {
      try {
        const addr = port ? `${ip}:${port}` : `${ip}:5555`
        const output = adb(`connect ${addr}`)
        return output.trim() || '连接失败'
      } catch (err) {
        throw new Error(`无线连接失败: ${err}`)
      }
    }
  )

  // Disconnect device
  ipcMain.handle('device:disconnectDevice', async (_event, serial: string) => {
    try {
      adb(`disconnect ${serial}`)
    } catch {
      // ignore
    }
  })

  // Get device properties
  ipcMain.handle(
    'device:getProps',
    async (_event, serial: string): Promise<DeviceProps> => {
      const prefix = serial ? `-s ${serial}` : ''
      const model = adb(`${prefix} shell getprop ro.product.model`).trim()
      const androidVersion = adb(
        `${prefix} shell getprop ro.build.version.release`
      ).trim()
      const sdkVersion = adb(
        `${prefix} shell getprop ro.build.version.sdk`
      ).trim()
      const resolution = adb(
        `${prefix} shell wm size`
      ).trim().replace('Physical size: ', '')

      return {
        model,
        androidVersion,
        sdkVersion,
        resolution
      }
    }
  )

  // Start polling when app is ready
  startPolling()

  // Cleanup
  mainWindow?.on('closed', () => {
    stopPolling()
  })
}
