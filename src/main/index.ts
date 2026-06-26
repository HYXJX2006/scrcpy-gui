import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { registerDeviceIPC } from './ipc/device'
import { registerScrcpyIPC } from './ipc/scrcpy'
import { registerAdbIPC } from './ipc/adb'
import { getTrayIconPath } from './utils/path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

// Simple JSON store (replaces electron-store, avoids asar issues)
interface WindowState {
  x?: number; y?: number; width: number; height: number; isMaximized: boolean
}

function createStore() {
  const storePath = join(app.getPath('userData'), 'store.json')
  let data: Record<string, any> = {}
  if (existsSync(storePath)) {
    try { data = JSON.parse(readFileSync(storePath, 'utf-8')) } catch { data = {} }
  }
  function save(): void {
    const dir = dirname(storePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8')
  }
  return {
    get(key: string, fallback: any = undefined) {
      const val = data[key]
      return val === undefined ? fallback : val
    },
    set(key: string, val: any) {
      data[key] = val
      save()
    }
  }
}
function dirname(p: string): string { return p.slice(0, p.lastIndexOf('/')) || p.slice(0, p.lastIndexOf('\\')) || p }

app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('no-sandbox')

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) app.quit()

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isCloseDialogShown = false

const store = createStore()

// Window state
function getWindowState(): WindowState {
  return store.get('windowState', { width: 1100, height: 760, isMaximized: false })
}
function saveWindowState(s: Partial<WindowState>) {
  const current = getWindowState()
  store.set('windowState', { ...current, ...s })
}

// 关闭弹窗 IPC
function resetCloseDialogFlag(): void { isCloseDialogShown = false }

ipcMain.on('close:minimizeToTray', () => {
  resetCloseDialogFlag()
  mainWindow?.hide()
})

ipcMain.on('close:quitApp', () => {
  app.quit()
})

ipcMain.on('close:cancel', () => {
  resetCloseDialogFlag()
})

ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)

function createWindow(): void {
  const saved = getWindowState()

  mainWindow = new BrowserWindow({
    width: saved.width,
    height: saved.height,
    ...(saved.x !== undefined && saved.y !== undefined ? { x: saved.x, y: saved.y } : {}),
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  mainWindow.on('close', (event) => {
    if (tray && !isCloseDialogShown) {
      event.preventDefault()
      isCloseDialogShown = true
      mainWindow?.webContents.send('close:showDialog')
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Window state persistence (debounced)
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  function debounceSave(): void {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (!mainWindow?.isMaximized()) {
        const [width, height] = mainWindow?.getSize() || [1100, 760]
        const [x, y] = mainWindow?.getPosition() || [0, 0]
        saveWindowState({ x, y, width, height, isMaximized: false })
      }
    }, 300)
  }

  mainWindow.on('resize', debounceSave)
  mainWindow.on('move', debounceSave)
  mainWindow.on('maximize', () => {
    saveWindowState({ isMaximized: true })
    mainWindow?.webContents.send('window:maximized', true)
  })
  mainWindow.on('unmaximize', () => {
    saveWindowState({ isMaximized: false })
    mainWindow?.webContents.send('window:maximized', false)
  })

  if (saved.isMaximized) mainWindow?.maximize()
  mainWindow.on('closed', () => { mainWindow = null })
}

function createTray(): void {
  const iconPath = getTrayIconPath()
  if (!existsSync(iconPath)) {
    console.warn('Tray icon not found:', iconPath)
    return
  }
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('scrcpy GUI')

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Window', click: () => { mainWindow?.show(); mainWindow?.focus() } },
    { type: 'separator' },
    { label: 'Exit', click: () => { app.quit() } }
  ])
  tray.setContextMenu(contextMenu)
}

function registerIPC(): void {
  registerDeviceIPC(ipcMain, mainWindow)
  registerScrcpyIPC(ipcMain)
  registerAdbIPC(ipcMain)

  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window:close', () => mainWindow?.close())
}

app.whenReady().then(() => {
  registerIPC()
  createTray()
  createWindow()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

export { mainWindow }
