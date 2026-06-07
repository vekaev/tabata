import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { electron, isElectron } from './lib/platform'
import './index.css'

// Tag the document for Electron-only styling (frameless window: drag strip +
// keeping corner controls clear of the macOS traffic lights).
if (electron) {
  document.documentElement.dataset.electron = 'true'
  document.documentElement.dataset.platform = electron.platform
}

// Packaged Electron loads over file://, where HTML5 history breaks on reload —
// use hash history there. The web build uses the default browser history.
const router = createRouter({
  routeTree,
  history: isElectron ? createHashHistory() : undefined,
  defaultPreload: 'intent',
  scrollRestoration: false,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isElectron && <div className="drag-strip" aria-hidden />}
    <RouterProvider router={router} />
  </StrictMode>,
)
