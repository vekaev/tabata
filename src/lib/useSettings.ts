// App settings (sound pack / volume) persisted to localStorage and pushed into
// the audio engine. Kept tiny and shared across screens.

import { useCallback, useEffect, useRef, useState } from 'react'
import { setSoundPack, setVolume, type SoundPack } from './audio'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  onStorageChange,
  saveSettings,
  type AppSettings,
} from './storage'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  // Remembers the last audible pack so the quick mute toggle can restore it.
  const lastAudibleRef = useRef<SoundPack>('beeps')

  // Load once and keep in sync with other tabs.
  useEffect(() => {
    const apply = () => {
      const s = loadSettings()
      setSettings(s)
      setSoundPack(s.soundPack)
      setVolume(s.volume)
      if (s.soundPack !== 'off') lastAudibleRef.current = s.soundPack
    }
    apply()
    return onStorageChange('settings', apply)
  }, [])

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      setSoundPack(next.soundPack)
      setVolume(next.volume)
      if (next.soundPack !== 'off') lastAudibleRef.current = next.soundPack
      saveSettings(next)
      return next
    })
  }, [])

  const setPack = useCallback((soundPack: SoundPack) => update({ soundPack }), [update])

  // Header quick toggle: off ⟷ the last audible pack.
  const toggleSound = useCallback(() => {
    setSettings((prev) => {
      const soundPack: SoundPack = prev.soundPack === 'off' ? lastAudibleRef.current : 'off'
      const next = { ...prev, soundPack }
      setSoundPack(soundPack)
      saveSettings(next)
      return next
    })
  }, [])

  return { settings, setPack, toggleSound }
}
