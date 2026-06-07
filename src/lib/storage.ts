// localStorage persistence. Wrapped so a quota error or private-mode failure
// never crashes the app, and so changes in another tab/window stay in sync via
// the `storage` event.

import { configLabel, normalizeConfig, sameConfig, type TabataConfig } from './tabata'

const KEYS = {
  config: 'tabata.config',
  presets: 'tabata.presets',
  settings: 'tabata.settings',
  history: 'tabata.history',
} as const

const HISTORY_LIMIT = 8

import type { SoundPack } from './audio'

export interface AppSettings {
  soundPack: SoundPack
  volume: number
}

export const DEFAULT_SETTINGS: AppSettings = { soundPack: 'beeps', volume: 0.6 }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / private-mode errors — persistence is best-effort.
  }
}

export const loadConfig = (fallback: TabataConfig): TabataConfig =>
  normalizeConfig(read<Partial<TabataConfig>>(KEYS.config, fallback))

export const saveConfig = (config: TabataConfig): void => write(KEYS.config, config)

export const loadPresets = (): TabataConfig[] =>
  read<TabataConfig[]>(KEYS.presets, []).map(normalizeConfig)

export const savePresets = (presets: TabataConfig[]): void => write(KEYS.presets, presets)

export const loadHistory = (): TabataConfig[] =>
  read<TabataConfig[]>(KEYS.history, []).map(normalizeConfig)

export const saveHistory = (history: TabataConfig[]): void => write(KEYS.history, history)

// IDs are generated here (outside React render) so callers don't need an
// impure Date.now() in component scope.
const uid = (prefix: string) => `${prefix}-${Date.now()}`

/**
 * Record a used config at the top of the history (most-recent first), skipping
 * consecutive duplicates and capping the list. Returns the new history.
 */
export function pushHistory(config: TabataConfig): TabataConfig[] {
  const current = loadHistory()
  if (current[0] && sameConfig(current[0], config)) return current
  const entry: TabataConfig = {
    ...normalizeConfig(config),
    id: uid('hist'),
    name: configLabel(config),
  }
  const next = [entry, ...current].slice(0, HISTORY_LIMIT)
  saveHistory(next)
  return next
}

/** Create a normalized, named user preset (with a fresh id). */
export function createUserPreset(source: TabataConfig, name: string): TabataConfig {
  return normalizeConfig({ ...source, id: uid('user'), name })
}

export const loadSettings = (): AppSettings => {
  const raw = read<Partial<AppSettings> & { muted?: boolean }>(KEYS.settings, {})
  // Migrate the old `muted` boolean to the sound-pack model.
  const soundPack = raw.soundPack ?? (raw.muted ? 'off' : DEFAULT_SETTINGS.soundPack)
  return { ...DEFAULT_SETTINGS, ...raw, soundPack }
}

export const saveSettings = (settings: AppSettings): void => write(KEYS.settings, settings)

/** Subscribe to cross-tab changes for a given key. Returns an unsubscribe fn. */
export function onStorageChange(key: keyof typeof KEYS, handler: () => void): () => void {
  const fullKey = KEYS[key]
  const listener = (e: StorageEvent) => {
    if (e.key === fullKey) handler()
  }
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}
