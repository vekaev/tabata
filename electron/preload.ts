import { contextBridge } from 'electron'

// The only thing the renderer needs to know is that it is running inside
// Electron (so it can switch to hash-history routing). Anything more would go
// through ipcRenderer here, never by enabling nodeIntegration.
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  platform: process.platform,
})
