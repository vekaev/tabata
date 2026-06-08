// Persisted live-timer state, so reloading the page mid-run resumes exactly
// where it left off (the Tabata workout and the countdown Timer).
//
// The running engines key off `performance.now()`, which resets to ~0 on every
// page load — useless across a reload. So here we anchor the remaining time to
// the WALL clock (`Date.now()`): we store the epoch millisecond the current
// phase ends, and on restore convert it back into a fresh performance-clock
// deadline. Paused runs store the frozen remaining millis instead.

const WORKOUT_KEY = 'tabata.workoutState'
const TIMER_KEY = 'tabata.timerState'

export type LiveStatus = 'running' | 'paused' | 'done'

export interface WorkoutState {
  /** Signature of the phase sequence; only restore if it still matches. */
  sig: string
  status: LiveStatus
  index: number
  /** Epoch ms when the current phase ends (running only). */
  deadlineEpoch?: number
  /** Frozen remaining ms in the current phase (paused only). */
  pausedRemainingMs?: number
}

export interface TimerState {
  status: LiveStatus
  totalSec: number
  deadlineEpoch?: number
  pausedRemainingMs?: number
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* best-effort */
  }
}

function clear(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* best-effort */
  }
}

export const loadWorkoutState = (): WorkoutState | null => read<WorkoutState>(WORKOUT_KEY)
export const saveWorkoutState = (s: WorkoutState): void => write(WORKOUT_KEY, s)
export const clearWorkoutState = (): void => clear(WORKOUT_KEY)

export const loadTimerState = (): TimerState | null => read<TimerState>(TIMER_KEY)
export const saveTimerState = (s: TimerState): void => write(TIMER_KEY, s)
export const clearTimerState = (): void => clear(TIMER_KEY)
