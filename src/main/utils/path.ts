import { app } from 'electron'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

/**
 * Get the path to the scrcpy resources directory.
 * Tries multiple locations since the path differs between dev and portable modes.
 */
export function getScrcpyDir(): string {
  // Possible locations, checked in order:
  const candidates = [
    // 1. Packaged app (electron-builder): resources/scrcpy
    join(process.resourcesPath, 'scrcpy'),
    // 2. Portable/renamed electron.exe: ../resources/scrcpy (relative to exe)
    join(dirname(app.getPath('exe')), 'resources', 'scrcpy'),
    // 3. Dev mode: app root/resources/scrcpy
    join(app.getAppPath(), 'resources', 'scrcpy'),
    // 4. Fallback: one level up from app path (asar case)
    join(dirname(app.getAppPath()), 'scrcpy')
  ]

  for (const candidate of candidates) {
    const exePath = join(candidate, 'scrcpy.exe')
    if (existsSync(exePath)) {
      return candidate
    }
  }

  // Return the most likely candidate even if not found
  return candidates[0]
}

/**
 * Get the scrcpy executable path
 */
export function getScrcpyPath(): string {
  return join(getScrcpyDir(), 'scrcpy.exe')
}

/**
 * Get the ADB executable path
 */
export function getAdbPath(): string {
  return join(getScrcpyDir(), 'adb.exe')
}

/**
 * Get the default recording directory
 */
export function getDefaultRecordDir(): string {
  return join(app.getPath('documents'), 'scrcpy-recordings')
}

/**
 * Get the tray icon path
 */
export function getTrayIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'icon.ico')
  }
  return join(app.getAppPath(), 'resources', 'icon.ico')
}
