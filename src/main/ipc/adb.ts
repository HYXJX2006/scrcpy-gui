import type { IpcMain } from 'electron'
import { app } from 'electron'
import { execSync } from 'child_process'
import { join } from 'path'
import { getAdbPath, getScrcpyDir } from '../utils/path'
import { existsSync, mkdirSync } from 'fs'

function adb(args: string, serial?: string): string {
  const adbPath = getAdbPath()
  if (!existsSync(adbPath)) return ''
  const prefix = serial ? `-s ${serial}` : ''
  try {
    return execSync(`"${adbPath}" ${prefix} ${args}`, {
      cwd: getScrcpyDir(),
      timeout: 15000,
      encoding: 'utf-8'
    }).trim()
  } catch (e: any) {
    return e.stdout?.trim() || e.message || ''
  }
}

export function registerAdbIPC(ipcMain: IpcMain): void {
  // Push file to device
  ipcMain.handle(
    'adb:pushFile',
    async (_event, serial: string, localPath: string, remotePath: string) => {
      return adb(`push "${localPath}" "${remotePath}"`, serial)
    }
  )

  // Pull file from device
  ipcMain.handle(
    'adb:pullFile',
    async (_event, serial: string, remotePath: string, localPath: string) => {
      return adb(`pull "${remotePath}" "${localPath}"`, serial)
    }
  )

  // Install APK
  ipcMain.handle(
    'adb:installApk',
    async (_event, serial: string, apkPath: string) => {
      return adb(`install -r "${apkPath}"`, serial)
    }
  )

  // Take screenshot
  ipcMain.handle(
    'adb:screenshot',
    async (_event, serial: string, fileTag: string) => {
      const picsDir = app.getPath('pictures')
      const saveDir = join(picsDir, 'scrcpy-screenshots')
      mkdirSync(saveDir, { recursive: true })
      const savePath = join(saveDir, `scrcpy_${fileTag}.png`)
      const tmpPath = '/sdcard/screenshot.png'
      adb(`shell screencap -p ${tmpPath}`, serial)
      adb(`pull ${tmpPath} "${savePath}"`, serial)
      adb(`shell rm ${tmpPath}`, serial)
      return savePath
    }
  )

  // Toggle screen on/off (simulates power button)
  ipcMain.handle(
    'adb:toggleScreen',
    async (_event, serial: string) => {
      return adb('shell input keyevent 26', serial)
    }
  )

  // Rotate display (0=portrait, 1=landscape)
  ipcMain.handle(
    'adb:rotate',
    async (_event, serial: string, orientation: string) => {
      return adb(`shell settings put system user_rotation ${orientation}`, serial)
    }
  )
}
