import { contextBridge, ipcRenderer } from 'electron'

// Type definition for the exposed API
export interface ScrcpyAPI {
  // Device operations
  getDevices: () => Promise<DeviceInfo[]>
  connectTCPIP: (ip: string, port?: number) => Promise<string>
  disconnectDevice: (serial: string) => Promise<void>
  getDeviceProps: (serial: string) => Promise<DeviceProps>

  // Scrcpy operations
  startScrcpy: (options: ScrcpyOptions) => Promise<void>
  stopScrcpy: () => Promise<void>
  restartScrcpy: (options: ScrcpyOptions) => Promise<void>
  isScrcpyRunning: () => Promise<boolean>

  // ADB file operations
  pushFile: (serial: string, localPath: string, remotePath: string) => Promise<string>
  pullFile: (serial: string, remotePath: string, localPath: string) => Promise<string>
  installApk: (serial: string, apkPath: string) => Promise<string>
  takeScreenshot: (serial: string, fileTag: string) => Promise<string>
  toggleScreen: (serial: string) => Promise<string>
  rotate: (serial: string, orientation: string) => Promise<string>

  // Window control
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  isMaximized: () => Promise<boolean>

  // Events
  onDeviceListChange: (callback: (devices: DeviceInfo[]) => void) => void
  onScrcpyLog: (callback: (log: string) => void) => void
  onScrcpyStopped: (callback: (code: number | null) => void) => void
  onWindowMaximized: (callback: (maximized: boolean) => void) => void
  onShowCloseDialog: (callback: () => void) => void
  minimizeToTray: () => void
  quitApp: () => void
  cancelClose: () => void
  removeAllListeners: (channel: string) => void
}

// Types
export interface DeviceInfo {
  serial: string
  state: 'device' | 'offline' | 'unauthorized'
  model?: string
  product?: string
  transportId?: string
}

export interface DeviceProps {
  model: string
  androidVersion: string
  sdkVersion: string
  resolution: string
  battery?: string
  ip?: string
}

export interface ScrcpyOptions {
  deviceSerial?: string
  tcpip?: string
  maxSize?: number
  maxFps?: number
  videoCodec?: 'h264' | 'h265' | 'av1'
  videoBitRate?: string
  videoEncoder?: string
  lockOrientation?: '0' | '1' | '2' | '3'
  printFps?: boolean
  noAudio?: boolean
  audioSource?: 'output' | 'playback' | 'mic'
  audioCodec?: 'aac' | 'opus' | 'flac' | 'raw'
  audioBuffer?: number
  record?: boolean
  recordPath?: string
  recordFormat?: 'mp4' | 'mkv' | 'opus' | 'flac' | 'wav'
  timeLimit?: number
  noPlayback?: boolean
  fullscreen?: boolean
  turnScreenOff?: boolean
  stayAwake?: boolean
  powerOffOnClose?: boolean
  keyboardMode?: 'sdk' | 'uhid' | 'virtual'
  mouseMode?: 'sdk' | 'uhid'
  newDisplay?: boolean
  videoSource?: 'display' | 'camera'
  cameraSize?: string
  cameraFacing?: 'front' | 'back'
  noWindow?: boolean
  noControl?: boolean
  noVideo?: boolean
  gamepad?: 'uhid' | 'sdk'
  disableScreensaver?: boolean
  forwardAllClicks?: boolean
  legacyGl?: boolean
  killAdbOnClose?: boolean
}

// Expose API to renderer
contextBridge.exposeInMainWorld('scrcpyAPI', {
  // Device
  getDevices: () => ipcRenderer.invoke('device:getDevices'),
  connectTCPIP: (ip: string, port?: number) =>
    ipcRenderer.invoke('device:connectTCPIP', ip, port),
  disconnectDevice: (serial: string) =>
    ipcRenderer.invoke('device:disconnectDevice', serial),
  getDeviceProps: (serial: string) =>
    ipcRenderer.invoke('device:getProps', serial),

  // Scrcpy
  startScrcpy: (options: ScrcpyOptions) =>
    ipcRenderer.invoke('scrcpy:start', options),
  stopScrcpy: () => ipcRenderer.invoke('scrcpy:stop'),
  restartScrcpy: (options: ScrcpyOptions) =>
    ipcRenderer.invoke('scrcpy:restart', options),
  isScrcpyRunning: () => ipcRenderer.invoke('scrcpy:isRunning'),

  // ADB
  pushFile: (serial: string, localPath: string, remotePath: string) =>
    ipcRenderer.invoke('adb:pushFile', serial, localPath, remotePath),
  pullFile: (serial: string, remotePath: string, localPath: string) =>
    ipcRenderer.invoke('adb:pullFile', serial, remotePath, localPath),
  installApk: (serial: string, apkPath: string) =>
    ipcRenderer.invoke('adb:installApk', serial, apkPath),
  takeScreenshot: (serial: string, fileTag: string) =>
    ipcRenderer.invoke('adb:screenshot', serial, fileTag),
  toggleScreen: (serial: string) =>
    ipcRenderer.invoke('adb:toggleScreen', serial),
  rotate: (serial: string, orientation: string) =>
    ipcRenderer.invoke('adb:rotate', serial, orientation),

  // Window
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // Events
  onDeviceListChange: (callback: (devices: DeviceInfo[]) => void) => {
    ipcRenderer.on('device:listChanged', (_event, devices) => callback(devices))
  },
  onScrcpyLog: (callback: (log: string) => void) => {
    ipcRenderer.on('scrcpy:log', (_event, log) => callback(log))
  },
  onScrcpyStopped: (callback: (code: number | null) => void) => {
    ipcRenderer.on('scrcpy:stopped', (_event, code) => callback(code))
  },
  onWindowMaximized: (callback: (maximized: boolean) => void) => {
    ipcRenderer.on('window:maximized', (_event, maximized) =>
      callback(maximized)
    )
  },
  onShowCloseDialog: (callback: () => void) => {
    ipcRenderer.on('close:showDialog', () => callback())
  },
  minimizeToTray: () => ipcRenderer.send('close:minimizeToTray'),
  quitApp: () => ipcRenderer.send('close:quitApp'),
  cancelClose: () => ipcRenderer.send('close:cancel'),
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
} as ScrcpyAPI)
