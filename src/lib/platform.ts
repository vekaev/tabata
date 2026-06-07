// Small platform helpers: keep-screen-awake, fullscreen, and Electron detection.

import { useCallback, useEffect, useState } from 'react'

interface ElectronBridge {
  isElectron: true
  platform: string
}

/** Exposed by the Electron preload via contextBridge; undefined on the web. */
export const electron: ElectronBridge | undefined = (
  globalThis as unknown as { electron?: ElectronBridge }
).electron

export const isElectron = Boolean(electron)

type WakeLockSentinelLike = { release: () => Promise<void> }

/** Hold a screen Wake Lock while `active` is true (no-op where unsupported). */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinelLike | null = null
    let released = false

    const request = async () => {
      try {
        sentinel = await (
          navigator as unknown as {
            wakeLock: { request: (t: 'screen') => Promise<WakeLockSentinelLike> }
          }
        ).wakeLock.request('screen')
      } catch {
        // Denied or unsupported — fine, just no keep-awake.
      }
    }

    // Re-acquire when the tab becomes visible again (the lock drops on hide).
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !released) void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisible)
      void sentinel?.release().catch(() => {})
    }
  }, [active])
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
    } else {
      void document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  return { isFullscreen, toggle }
}
