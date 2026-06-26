import { type IpcMain, BrowserWindow } from 'electron'
import type { ScrcpyOptions } from '../scrcpy/types'
import { ScrcpyLauncher } from '../scrcpy/launcher'

const launcher = new ScrcpyLauncher()

export function registerScrcpyIPC(ipcMain: IpcMain): void {
  launcher.setOnLog((msg) => {
    BrowserWindow?.getAllWindows()[0]?.webContents.send('scrcpy:log', msg)
  })

  launcher.setOnExit((code) => {
    BrowserWindow?.getAllWindows()[0]?.webContents.send('scrcpy:stopped', code)
  })

  ipcMain.handle('scrcpy:start', async (_event, options: ScrcpyOptions) => {
    if (launcher.isRunning()) {
      await launcher.stop()
      await new Promise((r) => setTimeout(r, 500))
    }
    await launcher.start(options)
  })

  ipcMain.handle('scrcpy:stop', async () => {
    await launcher.stop()
  })

  ipcMain.handle('scrcpy:restart', async (_event, options: ScrcpyOptions) => {
    await launcher.stop()
    await new Promise((r) => setTimeout(r, 500))
    await launcher.start(options)
  })

  ipcMain.handle('scrcpy:isRunning', () => {
    return launcher.isRunning()
  })
}
