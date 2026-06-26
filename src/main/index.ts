import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { registerDeviceIPC } from './ipc/device'
import { registerScrcpyIPC } from './ipc/scrcpy'
import { registerAdbIPC } from './ipc/adb'
import { getTrayIconPath } from './utils/path'
import { existsSync } from 'fs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: Store } = require('electron-store') as any

app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('no-sandbox')

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) app.quit()

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isCloseDialogShown = false

interface WindowState {
  x?: number; y?: number; width: number; height: number; isMaximized: boolean
}

const store = new Store<{ windowState: WindowState }>({
  name: 'scrcpy-gui-window',
  defaults: { windowState: { width: 1100, height: 760, isMaximized: false } }
})

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
  const savedState = store.get('windowState')

  mainWindow = new BrowserWindow({
    width: savedState.width,
    height: savedState.height,
    ...(savedState.x !== undefined && savedState.y !== undefined ? { x: savedState.x, y: savedState.y } : {}),
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

  // 拦截关闭，弹出确认对话框
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

  // 窗口状态持久化（带防抖）
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  function debounceSave(): void {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (!mainWindow?.isMaximized()) {
        const [width, height] = mainWindow?.getSize() || [1100, 760]
        const [x, y] = mainWindow?.getPosition() || [0, 0]
        store.set('windowState', { x, y, width, height, isMaximized: false })
      }
    }, 300)
  }

  mainWindow.on('resize', debounceSave)
  mainWindow.on('move', debounceSave)
  mainWindow.on('maximize', () => {
    store.set('windowState', { ...store.get('windowState'), isMaximized: true })
    mainWindow?.webContents.send('window:maximized', true)
  })
  mainWindow.on('unmaximize', () => {
    store.set('windowState', { ...store.get('windowState'), isMaximized: false })
    mainWindow?.webContents.send('window:maximized', false)
  })

  // 恢复最大化
  if (savedState.isMaximized) mainWindow?.maximize()

  mainWindow.on('closed', () => { mainWindow = null })
}

function createTray(): void {
  const iconPath = getTrayIconPath()
  if (!existsSync(iconPath)) {
    console.warn('托盘图标不存在:', iconPath)
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
    { label: '显示窗口', click: () => { mainWindow?.show(); mainWindow?.focus() } },
    { type: 'separator' },
    { label: '退出', click: () => { app.quit() } }
  ])
  tray.setContextMenu(contextMenu)
}

function registerIPC(): void {
  registerScrcpyIPC(ipcMain)
  registerAdbIPC(ipcMain)

  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })
}

app.whenReady().then(() => {
  registerIPC()
  createTray()

  // 先创建窗口再注册 device IPC（需要 mainWindow）
  createWindow()
  registerDeviceIPC(ipcMain, mainWindow)

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

export { mainWindow }
