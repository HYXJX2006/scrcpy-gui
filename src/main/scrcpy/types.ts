// Shared types for scrcpy options

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

export interface Preset {
  id: string
  name: string
  description: string
  options: Partial<ScrcpyOptions>
  createdAt: string
  updatedAt: string
}
