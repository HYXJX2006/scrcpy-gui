"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const child_process = require("child_process");
const fs = require("fs");
function getScrcpyDir() {
  const candidates = [
    // 1. Packaged app (electron-builder): resources/scrcpy
    path.join(process.resourcesPath, "scrcpy"),
    // 2. Portable/renamed electron.exe: ../resources/scrcpy (relative to exe)
    path.join(path.dirname(electron.app.getPath("exe")), "resources", "scrcpy"),
    // 3. Dev mode: app root/resources/scrcpy
    path.join(electron.app.getAppPath(), "resources", "scrcpy"),
    // 4. Fallback: one level up from app path (asar case)
    path.join(path.dirname(electron.app.getAppPath()), "scrcpy")
  ];
  for (const candidate of candidates) {
    const exePath = path.join(candidate, "scrcpy.exe");
    if (fs.existsSync(exePath)) {
      return candidate;
    }
  }
  return candidates[0];
}
function getAdbPath() {
  return path.join(getScrcpyDir(), "adb.exe");
}
function getTrayIconPath() {
  if (electron.app.isPackaged) {
    return path.join(process.resourcesPath, "icon.ico");
  }
  return path.join(electron.app.getAppPath(), "resources", "icon.ico");
}
let pollTimer = null;
let lastDevices = [];
let mainWindowRef = null;
function adb$1(args) {
  const adbPath = getAdbPath();
  if (!fs.existsSync(adbPath)) {
    return "";
  }
  try {
    return child_process.execSync(`"${adbPath}" ${args}`, {
      cwd: getScrcpyDir(),
      timeout: 5e3,
      encoding: "utf-8"
    });
  } catch {
    return "";
  }
}
function parseDevices(output) {
  const devices = [];
  const lines = output.split("\n").filter((l) => l.trim());
  for (const line of lines) {
    if (line.startsWith("List of devices")) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const serial = parts[0];
    const state = parts[1];
    const device = { serial, state };
    for (let i = 2; i < parts.length; i++) {
      if (parts[i].startsWith("model:")) {
        device.model = parts[i].replace("model:", "");
      }
      if (parts[i].startsWith("product:")) {
        device.product = parts[i].replace("product:", "");
      }
      if (parts[i].startsWith("transport_id:")) {
        device.transportId = parts[i].replace("transport_id:", "");
      }
    }
    devices.push(device);
  }
  return devices;
}
function notifyDevices(devices) {
  mainWindowRef?.webContents.send("device:listChanged", devices);
}
function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    const output = adb$1("devices -l");
    if (!output) return;
    const devices = parseDevices(output);
    const changed = JSON.stringify(devices) !== JSON.stringify(lastDevices);
    if (changed) {
      lastDevices = devices;
      notifyDevices(devices);
    }
  }, 2e3);
}
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
function registerDeviceIPC(ipcMain, mainWindow) {
  mainWindowRef = mainWindow;
  ipcMain.handle("device:getDevices", () => {
    const output = adb$1("devices -l");
    if (!output) return [];
    return parseDevices(output);
  });
  ipcMain.handle(
    "device:connectTCPIP",
    async (_event, ip, port) => {
      try {
        const addr = port ? `${ip}:${port}` : `${ip}:5555`;
        const output = adb$1(`connect ${addr}`);
        return output.trim() || "连接失败";
      } catch (err) {
        throw new Error(`无线连接失败: ${err}`);
      }
    }
  );
  ipcMain.handle("device:disconnectDevice", async (_event, serial) => {
    try {
      adb$1(`disconnect ${serial}`);
    } catch {
    }
  });
  ipcMain.handle(
    "device:getProps",
    async (_event, serial) => {
      const prefix = serial ? `-s ${serial}` : "";
      const model = adb$1(`${prefix} shell getprop ro.product.model`).trim();
      const androidVersion = adb$1(
        `${prefix} shell getprop ro.build.version.release`
      ).trim();
      const sdkVersion = adb$1(
        `${prefix} shell getprop ro.build.version.sdk`
      ).trim();
      const resolution = adb$1(
        `${prefix} shell wm size`
      ).trim().replace("Physical size: ", "");
      return {
        model,
        androidVersion,
        sdkVersion,
        resolution
      };
    }
  );
  startPolling();
  mainWindow?.on("closed", () => {
    stopPolling();
  });
}
function buildArgs(options) {
  const args = [];
  if (options.deviceSerial) {
    args.push("-s", options.deviceSerial);
  } else if (options.tcpip) {
    args.push("--tcpip=" + options.tcpip);
  }
  if (options.maxSize) {
    args.push("-m", String(options.maxSize));
  }
  if (options.maxFps) {
    args.push("--max-fps", String(options.maxFps));
  }
  if (options.videoCodec && options.videoCodec !== "h264") {
    args.push("--video-codec", options.videoCodec);
  }
  if (options.videoEncoder) {
    args.push("--video-encoder", options.videoEncoder);
  }
  if (options.videoBitRate) {
    args.push("-b", options.videoBitRate);
  }
  if (options.lockOrientation) {
    const degMap = { "0": "0", "1": "90", "2": "180", "3": "270" };
    args.push("--display-orientation=" + (degMap[options.lockOrientation] || options.lockOrientation));
  }
  if (options.printFps) {
    args.push("--print-fps");
  }
  if (options.noAudio) {
    args.push("--no-audio");
  }
  if (options.audioSource && options.audioSource !== "output") {
    args.push("--audio-source", options.audioSource);
  }
  if (options.audioCodec && options.audioCodec !== "aac") {
    args.push("--audio-codec", options.audioCodec);
  }
  if (options.audioBuffer) {
    args.push("--audio-buffer", String(options.audioBuffer));
  }
  if (options.record && options.recordPath) {
    args.push("--record", options.recordPath);
  }
  if (options.recordFormat) {
    args.push("--record-format", options.recordFormat);
  }
  if (options.timeLimit) {
    args.push("--time-limit", String(options.timeLimit));
  }
  if (options.noPlayback) {
    args.push("--no-playback");
  }
  if (options.fullscreen) {
    args.push("-f");
  }
  if (options.turnScreenOff) {
    args.push("-S");
  }
  if (options.stayAwake) {
    args.push("--stay-awake");
  }
  if (options.powerOffOnClose) {
    args.push("--power-off-on-close");
  }
  if (options.keyboardMode && options.keyboardMode !== "sdk") {
    args.push("--keyboard", options.keyboardMode);
  }
  if (options.mouseMode && options.mouseMode !== "sdk") {
    args.push("--mouse", options.mouseMode);
  }
  if (options.newDisplay) {
    args.push("--new-display");
  }
  if (options.videoSource && options.videoSource !== "display") {
    args.push("--video-source", options.videoSource);
  }
  if (options.cameraSize) {
    args.push("--camera-size", options.cameraSize);
  }
  if (options.cameraFacing) {
    args.push("--camera-facing", options.cameraFacing);
  }
  if (options.noWindow) {
    args.push("--no-window");
  }
  if (options.noControl) {
    args.push("--no-control");
  }
  if (options.noVideo) {
    args.push("--no-video");
  }
  if (options.gamepad) {
    args.push("--gamepad", options.gamepad);
  }
  if (options.disableScreensaver) {
    args.push("--disable-screensaver");
  }
  if (options.forwardAllClicks) {
    args.push("--forward-all-clicks");
  }
  if (options.legacyGl) {
    args.push("--legacy-gl");
  }
  if (options.killAdbOnClose) {
    args.push("--kill-adb-on-close");
  }
  return args;
}
class ScrcpyLauncher {
  process = null;
  onLog = null;
  onExit = null;
  setOnLog(callback) {
    this.onLog = callback;
  }
  setOnExit(callback) {
    this.onExit = callback;
  }
  getScrcpyDir() {
    if (electron.app.isPackaged) {
      return path.join(process.resourcesPath, "scrcpy");
    }
    return path.join(electron.app.getAppPath(), "resources", "scrcpy");
  }
  getScrcpyPath() {
    return path.join(this.getScrcpyDir(), "scrcpy.exe");
  }
  isAvailable() {
    return fs.existsSync(this.getScrcpyPath());
  }
  async start(options) {
    if (this.process) {
      throw new Error("scrcpy 已在运行中");
    }
    const scrcpyPath = this.getScrcpyPath();
    if (!fs.existsSync(scrcpyPath)) {
      throw new Error(`找不到 scrcpy.exe: ${scrcpyPath}`);
    }
    const args = buildArgs(options);
    this.log(`启动 scrcpy: ${scrcpyPath} ${args.join(" ")}`);
    return new Promise((resolve, reject) => {
      try {
        const child = child_process.spawn(scrcpyPath, args, {
          cwd: this.getScrcpyDir(),
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: false,
          detached: false
        });
        this.process = child;
        child.stdout?.on("data", (data) => {
          this.log(data.toString().trim());
        });
        child.stderr?.on("data", (data) => {
          this.log(data.toString().trim());
        });
        child.on("error", (err) => {
          this.log(`scrcpy 启动失败: ${err.message}`);
          this.process = null;
          reject(err);
        });
        child.on("exit", (code, signal) => {
          this.log(`scrcpy 退出 (code=${code}, signal=${signal})`);
          this.process = null;
          this.onExit?.(code);
          resolve();
        });
        setTimeout(() => {
          if (child.exitCode !== null) {
            return;
          }
          this.log("scrcpy 启动成功");
          resolve();
        }, 500);
      } catch (err) {
        this.process = null;
        reject(err);
      }
    });
  }
  async stop() {
    if (!this.process) return;
    this.log("正在停止 scrcpy...");
    try {
      const pid = this.process.pid;
      if (pid) {
        child_process.spawn("taskkill", ["/F", "/T", "/PID", String(pid)], {
          stdio: "ignore"
        });
      }
    } catch {
      this.process.kill("SIGTERM");
    }
    this.process = null;
  }
  isRunning() {
    return this.process !== null && !this.process.killed && this.process.exitCode === null;
  }
  log(msg) {
    if (msg && this.onLog) {
      this.onLog(msg);
    }
  }
}
const launcher = new ScrcpyLauncher();
function registerScrcpyIPC(ipcMain) {
  launcher.setOnLog((msg) => {
    electron.BrowserWindow?.getAllWindows()[0]?.webContents.send("scrcpy:log", msg);
  });
  launcher.setOnExit((code) => {
    electron.BrowserWindow?.getAllWindows()[0]?.webContents.send("scrcpy:stopped", code);
  });
  ipcMain.handle("scrcpy:start", async (_event, options) => {
    if (launcher.isRunning()) {
      await launcher.stop();
      await new Promise((r) => setTimeout(r, 500));
    }
    await launcher.start(options);
  });
  ipcMain.handle("scrcpy:stop", async () => {
    await launcher.stop();
  });
  ipcMain.handle("scrcpy:restart", async (_event, options) => {
    await launcher.stop();
    await new Promise((r) => setTimeout(r, 500));
    await launcher.start(options);
  });
  ipcMain.handle("scrcpy:isRunning", () => {
    return launcher.isRunning();
  });
}
function adb(args, serial) {
  const adbPath = getAdbPath();
  if (!fs.existsSync(adbPath)) return "";
  const prefix = serial ? `-s ${serial}` : "";
  try {
    return child_process.execSync(`"${adbPath}" ${prefix} ${args}`, {
      cwd: getScrcpyDir(),
      timeout: 15e3,
      encoding: "utf-8"
    }).trim();
  } catch (e) {
    return e.stdout?.trim() || e.message || "";
  }
}
function registerAdbIPC(ipcMain) {
  ipcMain.handle(
    "adb:pushFile",
    async (_event, serial, localPath, remotePath) => {
      return adb(`push "${localPath}" "${remotePath}"`, serial);
    }
  );
  ipcMain.handle(
    "adb:pullFile",
    async (_event, serial, remotePath, localPath) => {
      return adb(`pull "${remotePath}" "${localPath}"`, serial);
    }
  );
  ipcMain.handle(
    "adb:installApk",
    async (_event, serial, apkPath) => {
      return adb(`install -r "${apkPath}"`, serial);
    }
  );
  ipcMain.handle(
    "adb:screenshot",
    async (_event, serial, fileTag) => {
      const picsDir = electron.app.getPath("pictures");
      const saveDir = path.join(picsDir, "scrcpy-screenshots");
      fs.mkdirSync(saveDir, { recursive: true });
      const savePath = path.join(saveDir, `scrcpy_${fileTag}.png`);
      const tmpPath = "/sdcard/screenshot.png";
      adb(`shell screencap -p ${tmpPath}`, serial);
      adb(`pull ${tmpPath} "${savePath}"`, serial);
      adb(`shell rm ${tmpPath}`, serial);
      return savePath;
    }
  );
  ipcMain.handle(
    "adb:toggleScreen",
    async (_event, serial) => {
      return adb("shell input keyevent 26", serial);
    }
  );
  ipcMain.handle(
    "adb:rotate",
    async (_event, serial, orientation) => {
      return adb(`shell settings put system user_rotation ${orientation}`, serial);
    }
  );
}
const { default: Store } = require("electron-store");
electron.app.commandLine.appendSwitch("disable-gpu");
electron.app.commandLine.appendSwitch("no-sandbox");
const gotSingleInstanceLock = electron.app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) electron.app.quit();
exports.mainWindow = null;
let tray = null;
let isCloseDialogShown = false;
const store = new Store({
  name: "scrcpy-gui-window",
  defaults: { windowState: { width: 1100, height: 760, isMaximized: false } }
});
function resetCloseDialogFlag() {
  isCloseDialogShown = false;
}
electron.ipcMain.on("close:minimizeToTray", () => {
  resetCloseDialogFlag();
  exports.mainWindow?.hide();
});
electron.ipcMain.on("close:quitApp", () => {
  electron.app.quit();
});
electron.ipcMain.on("close:cancel", () => {
  resetCloseDialogFlag();
});
electron.ipcMain.handle("window:isMaximized", () => exports.mainWindow?.isMaximized() ?? false);
function createWindow() {
  const savedState = store.get("windowState");
  exports.mainWindow = new electron.BrowserWindow({
    width: savedState.width,
    height: savedState.height,
    ...savedState.x !== void 0 && savedState.y !== void 0 ? { x: savedState.x, y: savedState.y } : {},
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  });
  exports.mainWindow.on("close", (event) => {
    if (tray && !isCloseDialogShown) {
      event.preventDefault();
      isCloseDialogShown = true;
      exports.mainWindow?.webContents.send("close:showDialog");
    }
  });
  exports.mainWindow.on("ready-to-show", () => exports.mainWindow?.show());
  if (process.env["ELECTRON_RENDERER_URL"]) {
    exports.mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    exports.mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  let saveTimer = null;
  function debounceSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (!exports.mainWindow?.isMaximized()) {
        const [width, height] = exports.mainWindow?.getSize() || [1100, 760];
        const [x, y] = exports.mainWindow?.getPosition() || [0, 0];
        store.set("windowState", { x, y, width, height, isMaximized: false });
      }
    }, 300);
  }
  exports.mainWindow.on("resize", debounceSave);
  exports.mainWindow.on("move", debounceSave);
  exports.mainWindow.on("maximize", () => {
    store.set("windowState", { ...store.get("windowState"), isMaximized: true });
    exports.mainWindow?.webContents.send("window:maximized", true);
  });
  exports.mainWindow.on("unmaximize", () => {
    store.set("windowState", { ...store.get("windowState"), isMaximized: false });
    exports.mainWindow?.webContents.send("window:maximized", false);
  });
  if (savedState.isMaximized) exports.mainWindow?.maximize();
  exports.mainWindow.on("closed", () => {
    exports.mainWindow = null;
  });
}
function createTray() {
  const iconPath = getTrayIconPath();
  if (!fs.existsSync(iconPath)) {
    console.warn("托盘图标不存在:", iconPath);
    return;
  }
  const icon = electron.nativeImage.createFromPath(iconPath);
  tray = new electron.Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip("scrcpy GUI");
  tray.on("click", () => {
    if (exports.mainWindow) {
      if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
      exports.mainWindow.show();
      exports.mainWindow.focus();
    }
  });
  const contextMenu = electron.Menu.buildFromTemplate([
    { label: "显示窗口", click: () => {
      exports.mainWindow?.show();
      exports.mainWindow?.focus();
    } },
    { type: "separator" },
    { label: "退出", click: () => {
      electron.app.quit();
    } }
  ]);
  tray.setContextMenu(contextMenu);
}
function registerIPC() {
  registerScrcpyIPC(electron.ipcMain);
  registerAdbIPC(electron.ipcMain);
  electron.ipcMain.on("window:minimize", () => exports.mainWindow?.minimize());
  electron.ipcMain.on("window:maximize", () => {
    if (exports.mainWindow?.isMaximized()) exports.mainWindow.unmaximize();
    else exports.mainWindow?.maximize();
  });
  electron.ipcMain.on("window:close", () => {
    exports.mainWindow?.close();
  });
}
electron.app.whenReady().then(() => {
  registerIPC();
  createTray();
  createWindow();
  registerDeviceIPC(electron.ipcMain, exports.mainWindow);
  electron.app.on("second-instance", () => {
    if (exports.mainWindow) {
      if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
      exports.mainWindow.focus();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
