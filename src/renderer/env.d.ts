declare global {
  interface Window {
    scrcpyAPI: import('../preload/index').ScrcpyAPI
  }
}
export {}
