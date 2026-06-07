// Theme store: color mode (auto/light/dark) + accent color (preset or custom).
// The actual DOM application also happens in a tiny pre-paint script in
// index.html so there's no flash; this hook keeps React state in sync and
// exposes setters for the settings UI. Choices persist to localStorage and the
// keys match the pre-paint script.

import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'auto' | 'light' | 'dark'
export type AccentName = 'red' | 'blue' | 'green' | 'violet' | 'orange' | 'custom'
export type FontId = 'default' | 'oswald' | 'bebas' | 'mono'

export const FONTS: { id: FontId; name: string; stack: string }[] = [
  { id: 'default', name: 'Default', stack: "'Barlow Condensed', sans-serif" },
  { id: 'oswald', name: 'Classic', stack: "'Oswald', sans-serif" },
  { id: 'bebas', name: 'Bold', stack: "'Bebas Neue', sans-serif" },
  { id: 'mono', name: 'Mono', stack: "'Space Mono', monospace" },
]

export const ACCENT_PRESETS: { name: Exclude<AccentName, 'custom'>; hex: string }[] = [
  { name: 'red', hex: '#e60023' },
  { name: 'blue', hex: '#2563eb' },
  { name: 'green', hex: '#16a34a' },
  { name: 'violet', hex: '#7c3aed' },
  { name: 'orange', hex: '#ea580c' },
]

const KEYS = { mode: 'theme', accent: 'accent', custom: 'accentCustom', font: 'font' } as const
const DEFAULT_CUSTOM = '#22d3ee'

function get(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function set(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* best-effort */
  }
}

const root = () => document.documentElement

function applyMode(mode: ThemeMode): void {
  if (mode === 'auto') delete root().dataset.theme
  else root().dataset.theme = mode
}

/** Apply an accent by setting the single `--accent` variable (or clearing it
 *  for the default red). `--accent-strong` derives from it in CSS. */
function applyAccent(accent: AccentName, customHex: string): void {
  if (accent === 'red') {
    root().style.removeProperty('--accent')
    return
  }
  const hex =
    accent === 'custom'
      ? customHex
      : (ACCENT_PRESETS.find((p) => p.name === accent)?.hex ?? customHex)
  root().style.setProperty('--accent', hex)
}

function applyFont(font: FontId): void {
  if (font === 'default') {
    root().style.removeProperty('--font-display')
    return
  }
  const stack = FONTS.find((f) => f.id === font)?.stack
  if (stack) root().style.setProperty('--font-display', stack)
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => (get(KEYS.mode) as ThemeMode) ?? 'auto')
  const [accent, setAccent] = useState<AccentName>(() => (get(KEYS.accent) as AccentName) ?? 'red')
  const [customAccent, setCustomAccent] = useState<string>(() => get(KEYS.custom) ?? DEFAULT_CUSTOM)
  const [font, setFont] = useState<FontId>(() => (get(KEYS.font) as FontId) ?? 'default')

  // Re-apply on mount so React state and the DOM agree (and to cover the case
  // where JS is the first to run, e.g. in Electron).
  useEffect(() => {
    applyMode(mode)
    applyAccent(accent, customAccent)
    applyFont(font)
  }, [mode, accent, customAccent, font])

  const changeMode = useCallback((next: ThemeMode) => {
    setMode(next)
    set(KEYS.mode, next === 'auto' ? null : next)
    applyMode(next)
  }, [])

  const changeAccent = useCallback((next: AccentName, hex?: string) => {
    setAccent(next)
    set(KEYS.accent, next === 'red' ? null : next)
    if (next === 'custom' && hex) {
      setCustomAccent(hex)
      set(KEYS.custom, hex)
      applyAccent('custom', hex)
    } else {
      applyAccent(next, hex ?? customAccent)
    }
  }, [customAccent])

  const changeFont = useCallback((next: FontId) => {
    setFont(next)
    set(KEYS.font, next === 'default' ? null : next)
    applyFont(next)
  }, [])

  return {
    mode,
    accent,
    customAccent,
    font,
    changeMode,
    changeAccent,
    changeFont,
    presets: ACCENT_PRESETS,
    fonts: FONTS,
  }
}
