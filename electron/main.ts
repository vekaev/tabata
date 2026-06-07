import { app, BrowserWindow, dialog, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// vite-plugin-electron injects these. In dev the renderer is served by Vite;
// in production it is the built index.html next to this file.
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const RENDERER_DIST = path.join(__dirname, '../dist')
const isMac = process.platform === 'darwin'

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 480,
    minHeight: 480,
    show: false, // show on ready-to-show to avoid a white flash
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
    title: 'Tabata',
    // Drop the OS title bar so the app fills the window. macOS keeps the traffic
    // lights (nudged into place); Windows/Linux get a themed overlay so the
    // close/min/max buttons remain available.
    titleBarStyle: 'hidden',
    ...(isMac
      ? { trafficLightPosition: { x: 14, y: 18 } }
      : { titleBarOverlay: { color: '#0a0a0a', symbolColor: '#ffffff', height: 40 } }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => win?.show())

  // Open external links (and mailto:) in the system handler, never in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (DEV_SERVER_URL) {
    void win.loadURL(DEV_SERVER_URL)
  } else {
    void win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Auto-update from GitHub Releases (electron-updater). Checks on launch and
// every few hours; prompts to restart once an update is downloaded.
function initAutoUpdates() {
  if (DEV_SERVER_URL) return // only in packaged builds
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-downloaded', async (info) => {
    if (!win) return
    const { response } = await dialog.showMessageBox(win, {
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update ready',
      message: `Tabata ${info.version} is ready.`,
      detail: 'Restart to apply the update.',
    })
    if (response === 0) autoUpdater.quitAndInstall()
  })
  autoUpdater.on('error', (err) => console.error('auto-update error', err))

  void autoUpdater.checkForUpdates()
  setInterval(() => void autoUpdater.checkForUpdates(), 1000 * 60 * 60 * 4)
}

app.whenReady().then(() => {
  createWindow()
  initAutoUpdates()
})

app.on('window-all-closed', () => {
  if (!isMac) app.quit()
  win = null
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
