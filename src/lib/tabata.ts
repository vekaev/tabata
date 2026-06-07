// Domain model for the Tabata timer and the logic that expands a config into a
// flat sequence of timed phases. Keeping this pure makes the timer engine and
// the UI trivial to reason about and test.

export type PhaseKind = 'prepare' | 'work' | 'rest' | 'rest-set' | 'cooldown' | 'done'

export interface TabataConfig {
  id: string
  name: string
  /** "Get ready" countdown before the first work interval. */
  prepareSec: number
  workSec: number
  restSec: number
  /** Work/rest rounds inside a single set. */
  rounds: number
  /** Groups of rounds. Rest separates sets; there is none after the last set. */
  sets: number
  restBetweenSetsSec: number
  /** Cooldown countdown after the final work interval. */
  cooldownSec: number
  /** Optional per-round labels (index = round - 1), repeated across sets. */
  roundNames?: string[]
}

/** A built-in preset carries a translation key for its display-name prefix. */
export type Preset = TabataConfig & { nameKey: string }

export interface Phase {
  kind: PhaseKind
  /** Duration in seconds (0 for the terminal `done` phase). */
  durationSec: number
  /** 1-based round within the current set; undefined for non-round phases. */
  round?: number
  /** 1-based set; undefined for prepare/done. */
  set?: number
  /** Optional label for a work phase (e.g. "Goblet squat"). */
  name?: string
}

export const DEFAULT_CONFIG: Omit<TabataConfig, 'id' | 'name'> = {
  prepareSec: 10,
  workSec: 20,
  restSec: 10,
  rounds: 8,
  sets: 1,
  restBetweenSetsSec: 60,
  cooldownSec: 0,
}

export const PRESETS: Preset[] = [
  { id: 'classic', nameKey: 'pClassic', name: 'Classic', prepareSec: 10, workSec: 20, restSec: 10, rounds: 8, sets: 1, restBetweenSetsSec: 60, cooldownSec: 0 },
  { id: 'crosshero', nameKey: 'pGym', name: 'Gym', prepareSec: 10, workSec: 40, restSec: 10, rounds: 5, sets: 1, restBetweenSetsSec: 60, cooldownSec: 0 },
  { id: 'emom-style', nameKey: 'pSweat', name: 'Sweat', prepareSec: 10, workSec: 30, restSec: 30, rounds: 10, sets: 1, restBetweenSetsSec: 60, cooldownSec: 0 },
  { id: 'double', nameKey: 'pDouble', name: 'Double Tabata', prepareSec: 10, workSec: 20, restSec: 10, rounds: 8, sets: 2, restBetweenSetsSec: 60, cooldownSec: 0 },
]

const clampInt = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(Number.isFinite(value) ? value : min)))

/** Coerce raw form input into a valid config (defends against bad localStorage). */
export function normalizeConfig(c: Partial<TabataConfig>): TabataConfig {
  return {
    id: c.id ?? 'custom',
    name: c.name ?? 'Custom',
    prepareSec: clampInt(c.prepareSec ?? DEFAULT_CONFIG.prepareSec, 0, 60),
    workSec: clampInt(c.workSec ?? DEFAULT_CONFIG.workSec, 1, 3600),
    restSec: clampInt(c.restSec ?? DEFAULT_CONFIG.restSec, 0, 3600),
    rounds: clampInt(c.rounds ?? DEFAULT_CONFIG.rounds, 1, 99),
    sets: clampInt(c.sets ?? DEFAULT_CONFIG.sets, 1, 99),
    restBetweenSetsSec: clampInt(c.restBetweenSetsSec ?? DEFAULT_CONFIG.restBetweenSetsSec, 0, 3600),
    cooldownSec: clampInt(c.cooldownSec ?? DEFAULT_CONFIG.cooldownSec, 0, 3600),
    ...(Array.isArray(c.roundNames)
      ? { roundNames: c.roundNames.map((n) => String(n ?? '').slice(0, 40)) }
      : {}),
  }
}

/** Expand a config into the ordered list of phases the timer will run through. */
export function buildSequence(config: TabataConfig): Phase[] {
  const c = normalizeConfig(config)
  const phases: Phase[] = []

  if (c.prepareSec > 0) {
    phases.push({ kind: 'prepare', durationSec: c.prepareSec })
  }

  for (let set = 1; set <= c.sets; set++) {
    for (let round = 1; round <= c.rounds; round++) {
      const name = c.roundNames?.[round - 1]?.trim() || undefined
      phases.push({ kind: 'work', durationSec: c.workSec, round, set, name })
      const isLastRoundOfLastSet = set === c.sets && round === c.rounds
      // Skip the trailing rest at the very end so the timer ends on work.
      if (c.restSec > 0 && !isLastRoundOfLastSet) {
        phases.push({ kind: 'rest', durationSec: c.restSec, round, set })
      }
    }
    if (set < c.sets && c.restBetweenSetsSec > 0) {
      phases.push({ kind: 'rest-set', durationSec: c.restBetweenSetsSec, set })
    }
  }

  if (c.cooldownSec > 0) {
    phases.push({ kind: 'cooldown', durationSec: c.cooldownSec })
  }

  phases.push({ kind: 'done', durationSec: 0 })
  return phases
}

export function totalDurationSec(config: TabataConfig): number {
  return buildSequence(config).reduce((sum, p) => sum + p.durationSec, 0)
}

const NUMERIC_KEYS = [
  'prepareSec',
  'workSec',
  'restSec',
  'rounds',
  'sets',
  'restBetweenSetsSec',
  'cooldownSec',
] as const

/** Two configs are "the same" if all their numeric fields match (name/id aside). */
export function sameConfig(a: TabataConfig, b: TabataConfig): boolean {
  return NUMERIC_KEYS.every((k) => a[k] === b[k])
}

/** A short human label derived from a config, e.g. "20/10 × 8" or "20/10 × 8 × 2". */
export function configLabel(config: TabataConfig): string {
  const c = normalizeConfig(config)
  const base = `${c.workSec}/${c.restSec} × ${c.rounds}`
  return c.sets > 1 ? `${base} × ${c.sets}` : base
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`
}
