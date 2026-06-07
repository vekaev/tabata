import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import electron from 'vite-plugin-electron/simple'

// `ELECTRON=1` is set by the desktop build/dev scripts. The web build never
// sees it, so the web deploy keeps absolute asset paths and browser history.
const isElectron = process.env.ELECTRON === '1'

// https://vite.dev/config/
export default defineConfig({
  // A packaged Electron app loads over file://, which needs relative asset
  // paths or the window renders blank. The web build keeps '/'.
  base: isElectron ? './' : '/',
  plugins: [
    // The router plugin must run BEFORE the React plugin.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    // Only build the main/preload processes for the desktop target.
    ...(isElectron
      ? [
          electron({
            main: { entry: 'electron/main.ts' },
            preload: { input: 'electron/preload.ts' },
          }),
        ]
      : []),
  ],
  server: {
    port: 5173,
  },
})
