// Single source of truth for external links and the desktop download asset
// names, so the repo / release URLs aren't duplicated across the web app and
// the Electron main process. Keep this file dependency-free (no React / DOM)
// so it can be imported from both bundles.

export const GITHUB_REPO = 'https://github.com/vekaev/tabata'
export const RELEASES_LATEST = `${GITHUB_REPO}/releases/latest`
export const DOWNLOAD_BASE = `${RELEASES_LATEST}/download`

/** Stable, version-less installer filenames (see electron-builder artifactName). */
export const DOWNLOADS = {
  mac: 'Tabata-mac.dmg',
  windows: 'Tabata-Setup.exe',
  linux: 'Tabata-linux.AppImage',
} as const

export const downloadUrl = (file: string) => `${DOWNLOAD_BASE}/${file}`
