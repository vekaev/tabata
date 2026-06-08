import { app, BrowserWindow, Menu, dialog, screen, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import electronUpdater from 'electron-updater'
import contextMenu from 'electron-context-menu'
import { GITHUB_REPO } from '../src/lib/links'

const { autoUpdater } = electronUpdater
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// vite-plugin-electron injects these. In dev the renderer is served by Vite;
// in production it is the built index.html next to this file.
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const RENDERER_DIST = path.join(__dirname, '../dist')
const isMac = process.platform === 'darwin'

let win: BrowserWindow | null = null

// ---- Window-state persistence (hand-rolled: no extra runtime dependency) ----
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json')

interface WinState {
  width: number
  height: number
  x?: number
  y?: number
}

function loadWindowState(): WinState {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as WinState
    // Only restore the position if it's still on a connected display.
    if (s.x != null && s.y != null) {
      const onScreen = screen.getAllDisplays().some((d) => {
        const b = d.bounds
        return s.x! >= b.x && s.y! >= b.y && s.x! < b.x + b.width && s.y! < b.y + b.height
      })
      if (!onScreen) {
        delete s.x
        delete s.y
      }
    }
    return s
  } catch {
    return { width: 1100, height: 760 }
  }
}

function saveWindowState() {
  if (!win || win.isMinimized() || win.isFullScreen()) return
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(win.getBounds()))
  } catch {
    /* best-effort */
  }
}

function createWindow() {
  const state = loadWindowState()

  win = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
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
  win.on('close', saveWindowState)

  if (DEV_SERVER_URL) {
    void win.loadURL(DEV_SERVER_URL)
  } else {
    void win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Native macOS-style menu so the standard shortcuts (⌘C/V/Q/W, fullscreen, …)
// work and the app menu looks right. role-based items wire themselves up.
function buildMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: 'appMenu' as const }] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Tabata Timer on GitHub',
          click: () => void shell.openExternal(GITHUB_REPO),
        },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// Security: open external links/new windows in the OS browser and block any
// in-app navigation away from our own content.
function hardenNavigation() {
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url)
      return { action: 'deny' }
    })
    contents.on('will-navigate', (event, url) => {
      const allowed = DEV_SERVER_URL ?? 'file://'
      if (!url.startsWith(allowed)) {
        event.preventDefault()
        void shell.openExternal(url)
      }
    })
  })
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

// Right-click menu (cut/copy/paste, copy link, inspect in dev).
contextMenu({ showInspectElement: !app.isPackaged })

// Single-instance: focus the existing window instead of opening a second one.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
  })

  app.whenReady().then(() => {
    buildMenu()
    hardenNavigation()
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
}
