import type { ScrcpyOptions } from './types'

/**
 * Build scrcpy command-line arguments from options object
 */
export function buildArgs(options: ScrcpyOptions): string[] {
  const args: string[] = []

  // Device selection
  if (options.deviceSerial) {
    args.push('-s', options.deviceSerial)
  } else if (options.tcpip) {
    args.push('--tcpip=' + options.tcpip)
  }

  // Video
  if (options.maxSize) {
    args.push('-m', String(options.maxSize))
  }
  if (options.maxFps) {
    args.push('--max-fps', String(options.maxFps))
  }
  if (options.videoCodec && options.videoCodec !== 'h264') {
    args.push('--video-codec', options.videoCodec)
  }
  if (options.videoEncoder) {
    args.push('--video-encoder', options.videoEncoder)
  }
  if (options.videoBitRate) {
    args.push('-b', options.videoBitRate)
  }
  if (options.lockOrientation) {
    // Map old values (0,1,2,3) to degrees (0,90,180,270) for scrcpy v4.0
    const degMap: Record<string, string> = { '0': '0', '1': '90', '2': '180', '3': '270' }
    args.push('--display-orientation=' + (degMap[options.lockOrientation] || options.lockOrientation))
  }
  if (options.printFps) {
    args.push('--print-fps')
  }

  // Audio
  if (options.noAudio) {
    args.push('--no-audio')
  }
  if (options.audioSource && options.audioSource !== 'output') {
    args.push('--audio-source', options.audioSource)
  }
  if (options.audioCodec && options.audioCodec !== 'aac') {
    args.push('--audio-codec', options.audioCodec)
  }
  if (options.audioBuffer) {
    args.push('--audio-buffer', String(options.audioBuffer))
  }

  // Recording
  if (options.record && options.recordPath) {
    args.push('--record', options.recordPath)
  }
  if (options.recordFormat) {
    args.push('--record-format', options.recordFormat)
  }
  if (options.timeLimit) {
    args.push('--time-limit', String(options.timeLimit))
  }
  if (options.noPlayback) {
    args.push('--no-playback')
  }

  // Display
  if (options.fullscreen) {
    args.push('-f')
  }
  if (options.turnScreenOff) {
    args.push('-S')
  }
  if (options.stayAwake) {
    args.push('--stay-awake')
  }
  if (options.powerOffOnClose) {
    args.push('--power-off-on-close')
  }

  // Advanced
  if (options.keyboardMode && options.keyboardMode !== 'sdk') {
    args.push('--keyboard', options.keyboardMode)
  }
  if (options.mouseMode && options.mouseMode !== 'sdk') {
    args.push('--mouse', options.mouseMode)
  }
  if (options.newDisplay) {
    args.push('--new-display')
  }
  if (options.videoSource && options.videoSource !== 'display') {
    args.push('--video-source', options.videoSource)
  }
  if (options.cameraSize) {
    args.push('--camera-size', options.cameraSize)
  }
  if (options.cameraFacing) {
    args.push('--camera-facing', options.cameraFacing)
  }
  if (options.noWindow) {
    args.push('--no-window')
  }
  if (options.noControl) {
    args.push('--no-control')
  }
  if (options.noVideo) {
    args.push('--no-video')
  }
  if (options.gamepad) {
    args.push('--gamepad', options.gamepad)
  }
  if (options.disableScreensaver) {
    args.push('--disable-screensaver')
  }
  if (options.forwardAllClicks) {
    args.push('--forward-all-clicks')
  }
  if (options.legacyGl) {
    args.push('--legacy-gl')
  }
  if (options.killAdbOnClose) {
    args.push('--kill-adb-on-close')
  }

  return args
}

/**
 * Create a human-readable summary of the current options
 */
export function getOptionsSummary(options: ScrcpyOptions): string {
  const parts: string[] = []

  if (options.maxSize) parts.push(`${options.maxSize}p`)
  if (options.maxFps) parts.push(`${options.maxFps}fps`)
  if (options.videoCodec) parts.push(options.videoCodec.toUpperCase())
  if (options.videoBitRate) parts.push(`码率 ${options.videoBitRate}`)
  if (options.record) parts.push('📹 录制中')
  if (options.turnScreenOff) parts.push('💤 息屏')
  if (options.newDisplay) parts.push('🖥️ 虚拟显示')

  return parts.join(' | ') || '默认设置'
}

/**
 * Default options
 */
export function getDefaultOptions(): ScrcpyOptions {
  return {
    maxSize: 0,
    maxFps: 0,
    videoCodec: 'h264',
    videoBitRate: '8M',
    audioSource: 'output',
    keyboardMode: 'sdk',
    mouseMode: 'sdk',
    noAudio: false,
    printFps: false,
    stayAwake: false,
    turnScreenOff: false,
    powerOffOnClose: false,
    fullscreen: false,
    record: false
  }
}
