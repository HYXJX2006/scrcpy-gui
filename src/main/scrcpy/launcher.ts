import { spawn, type ChildProcess } from 'child_process'
import { join } from 'path'
import { app } from 'electron'
import { existsSync } from 'fs'
import type { ScrcpyOptions } from './types'
import { buildArgs } from './options'

export class ScrcpyLauncher {
  private process: ChildProcess | null = null
  private onLog: ((msg: string) => void) | null = null
  private onExit: ((code: number | null) => void) | null = null

  setOnLog(callback: (msg: string) => void): void {
    this.onLog = callback
  }

  setOnExit(callback: (code: number | null) => void): void {
    this.onExit = callback
  }

  getScrcpyDir(): string {
    // In development: resources/scrcpy/
    // In production: process.resourcesPath/scrcpy/
    if (app.isPackaged) {
      return join(process.resourcesPath, 'scrcpy')
    }
    return join(app.getAppPath(), 'resources', 'scrcpy')
  }

  getScrcpyPath(): string {
    return join(this.getScrcpyDir(), 'scrcpy.exe')
  }

  isAvailable(): boolean {
    return existsSync(this.getScrcpyPath())
  }

  async start(options: ScrcpyOptions): Promise<void> {
    if (this.process) {
      throw new Error('scrcpy 已在运行中')
    }

    const scrcpyPath = this.getScrcpyPath()
    if (!existsSync(scrcpyPath)) {
      throw new Error(`找不到 scrcpy.exe: ${scrcpyPath}`)
    }

    const args = buildArgs(options)
    this.log(`启动 scrcpy: ${scrcpyPath} ${args.join(' ')}`)

    return new Promise((resolve, reject) => {
      try {
        const child = spawn(scrcpyPath, args, {
          cwd: this.getScrcpyDir(),
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: false,
          detached: false
        })

        this.process = child

        child.stdout?.on('data', (data: Buffer) => {
          this.log(data.toString().trim())
        })

        child.stderr?.on('data', (data: Buffer) => {
          this.log(data.toString().trim())
        })

        child.on('error', (err) => {
          this.log(`scrcpy 启动失败: ${err.message}`)
          this.process = null
          reject(err)
        })

        child.on('exit', (code, signal) => {
          this.log(`scrcpy 退出 (code=${code}, signal=${signal})`)
          this.process = null
          this.onExit?.(code)
          resolve()
        })

        // Small delay to detect immediate startup failure
        setTimeout(() => {
          if (child.exitCode !== null) {
            // Process already exited - startup failed
            return
          }
          this.log('scrcpy 启动成功')
          resolve()
        }, 500)
      } catch (err) {
        this.process = null
        reject(err)
      }
    })
  }

  async stop(): Promise<void> {
    if (!this.process) return

    this.log('正在停止 scrcpy...')

    // On Windows, use taskkill to kill the process tree
    try {
      const pid = this.process.pid
      if (pid) {
        spawn('taskkill', ['/F', '/T', '/PID', String(pid)], {
          stdio: 'ignore'
        })
      }
    } catch {
      this.process.kill('SIGTERM')
    }

    this.process = null
  }

  isRunning(): boolean {
    return this.process !== null && !this.process.killed && this.process.exitCode === null
  }

  private log(msg: string): void {
    if (msg && this.onLog) {
      this.onLog(msg)
    }
  }
}
