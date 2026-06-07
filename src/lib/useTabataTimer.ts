// The timer engine. Source of truth is an absolute `performance.now()` deadline
// per phase — we recompute the remaining time from that deadline every frame
// rather than accumulating ticks, so the timer never drifts and self-corrects
// after a stall or a backgrounded tab.
//
// The rAF loop lives in an effect keyed on `status`: flipping status to
// 'running' starts the loop, anything else tears it down. Display state is only
// updated from inside the frame callback, never synchronously.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildSequence, type Phase, type TabataConfig } from './tabata'
import { cueFinish, cuePip, cueRest, cueWork, unlockAudio } from './audio'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

export interface TimerView {
  phase: Phase
  phaseIndex: number
  /** Remaining time in the current phase, in seconds (float, for the ring). */
  remainingSec: number
  /** Remaining whole seconds, for the big digits. */
  remainingDisplay: number
  /** 0..1 elapsed fraction of the current phase. */
  phaseProgress: number
  totalRemainingSec: number
  totalElapsedSec: number
}

export interface TimerSnapshot extends TimerView {
  status: TimerStatus
}

const PIP_THRESHOLDS = [3, 2, 1]

function enterCue(kind: Phase['kind']): void {
  if (kind === 'work') cueWork()
  else if (kind === 'rest' || kind === 'rest-set') cueRest()
  else if (kind === 'done') cueFinish()
}

/**
 * Drives a Tabata workout. The hook resets via React identity, so callers that
 * can change the config should remount it with a `key` (our screens load the
 * config once, so this never happens mid-workout).
 */
export function useTabataTimer(config: TabataConfig) {
  const sequence = useMemo(() => buildSequence(config), [config])
  const totalSec = useMemo(
    () => sequence.reduce((sum, p) => sum + p.durationSec, 0),
    [sequence],
  )

  const makeView = useCallback(
    (index: number, remainingSec: number): TimerView => {
      const phase = sequence[index]
      const elapsedBefore = sequence
        .slice(0, index)
        .reduce((sum, p) => sum + p.durationSec, 0)
      const phaseElapsed = phase.durationSec - remainingSec
      return {
        phase,
        phaseIndex: index,
        remainingSec: Math.max(0, remainingSec),
        remainingDisplay: Math.max(0, Math.ceil(remainingSec - 0.0001)),
        phaseProgress: phase.durationSec > 0 ? phaseElapsed / phase.durationSec : 1,
        totalRemainingSec: Math.max(0, totalSec - elapsedBefore - phaseElapsed),
        totalElapsedSec: Math.min(totalSec, elapsedBefore + phaseElapsed),
      }
    },
    [sequence, totalSec],
  )

  const [status, setStatus] = useState<TimerStatus>('idle')
  const [view, setView] = useState<TimerView>(() =>
    makeView(0, sequence[0]?.durationSec ?? 0),
  )

  // Mutable engine state the rAF loop reads/writes between renders.
  const deadlineRef = useRef(0)
  const indexRef = useRef(0)
  const pausedRemainingRef = useRef(0)
  const firedPipsRef = useRef<Set<number>>(new Set())

  // The running loop. A self-correcting interval (not setInterval drift, not
  // rAF): every tick derives remaining time from the absolute deadline, so a
  // late or throttled tick never accumulates drift. Using an interval rather
  // than requestAnimationFrame keeps the clock advancing and cues firing even
  // when the tab is backgrounded (rAF pauses when hidden). 100ms is smooth for
  // a second-resolution display.
  useEffect(() => {
    if (status !== 'running') return
    const fired = firedPipsRef.current

    const tick = () => {
      const now = performance.now()
      let index = indexRef.current
      let remainingMs = deadlineRef.current - now

      const phase = sequence[index]
      if (phase.kind !== 'done') {
        const remainingSec = remainingMs / 1000
        for (const t of PIP_THRESHOLDS) {
          if (remainingSec <= t && !fired.has(t) && phase.durationSec >= t) {
            fired.add(t)
            cuePip()
          }
        }
      }

      // Advance through any phases whose deadline has passed (handles stalls).
      while (remainingMs <= 0 && sequence[index].kind !== 'done') {
        const overshoot = remainingMs // <= 0
        index += 1
        fired.clear()
        const next = sequence[index]
        enterCue(next.kind)
        if (next.kind === 'done') {
          indexRef.current = index
          setView(makeView(index, 0))
          setStatus('done')
          return
        }
        deadlineRef.current = now + next.durationSec * 1000 + overshoot
        remainingMs = deadlineRef.current - now
      }

      indexRef.current = index
      setView(makeView(index, remainingMs / 1000))
    }

    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [status, sequence, makeView])

  const start = useCallback(() => {
    unlockAudio()
    indexRef.current = 0
    firedPipsRef.current.clear()
    const first = sequence[0]
    if (!first || first.kind === 'done') {
      setView(makeView(sequence.length - 1, 0))
      setStatus('done')
      return
    }
    enterCue(first.kind)
    deadlineRef.current = performance.now() + first.durationSec * 1000
    setView(makeView(0, first.durationSec))
    setStatus('running')
  }, [sequence, makeView])

  const pause = useCallback(() => {
    if (status !== 'running') return
    pausedRemainingRef.current = Math.max(0, deadlineRef.current - performance.now())
    setStatus('paused')
  }, [status])

  const resume = useCallback(() => {
    if (status !== 'paused') return
    unlockAudio()
    deadlineRef.current = performance.now() + pausedRemainingRef.current
    setStatus('running')
  }, [status])

  const reset = useCallback(() => {
    indexRef.current = 0
    firedPipsRef.current.clear()
    setView(makeView(0, sequence[0]?.durationSec ?? 0))
    setStatus('idle')
  }, [makeView, sequence])

  const toggle = useCallback(() => {
    if (status === 'running') pause()
    else if (status === 'paused') resume()
    else start()
  }, [status, pause, resume, start])

  // Jump straight to the next phase, keeping the current run state. Reuses the
  // same enter-cue / done logic as the loop's automatic advance.
  const skip = useCallback(() => {
    if (status !== 'running' && status !== 'paused') return
    const index = indexRef.current
    if (sequence[index].kind === 'done') return

    const nextIndex = index + 1
    const next = sequence[nextIndex]
    indexRef.current = nextIndex
    firedPipsRef.current.clear()
    enterCue(next.kind)

    if (next.kind === 'done') {
      setView(makeView(nextIndex, 0))
      setStatus('done')
      return
    }
    if (status === 'paused') {
      pausedRemainingRef.current = next.durationSec * 1000
    } else {
      deadlineRef.current = performance.now() + next.durationSec * 1000
    }
    setView(makeView(nextIndex, next.durationSec))
  }, [sequence, status, makeView])

  const snapshot: TimerSnapshot = { ...view, status }
  return { snapshot, totalSec, sequence, start, pause, resume, reset, toggle, skip }
}
