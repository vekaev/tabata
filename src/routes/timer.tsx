import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TopLeft, TopRight, Logo } from '../components/Chrome'
import { useSettings } from '../lib/useSettings'
import { useWakeLock } from '../lib/platform'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useLang } from '../lib/i18n'
import { celebrate } from '../lib/confetti'
import { cueFinish, cuePip, unlockAudio } from '../lib/audio'
import { formatClock } from '../lib/tabata'
import { TimeText } from '../components/TimeText'
import { NumberStepper } from '../components/NumberStepper'
import { clearTimerState, loadTimerState, saveTimerState } from '../lib/timerState'

export const Route = createFileRoute('/timer')({
  head: () => ({
    meta: [
      { title: 'Interval Timer — Fullscreen Countdown Timer' },
      {
        name: 'description',
        content: 'Simple fullscreen countdown timer with large numbers for workouts, cooking and focus sessions.',
      },
    ],
  }),
  component: Timer,
})

type Status = 'idle' | 'running' | 'paused' | 'done'

const STORAGE_KEY = 'timer.seconds'
const PIP_THRESHOLDS = [3, 2, 1]

function loadSeconds(): number {
  try {
    const raw = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(raw) && raw > 0 ? raw : 60
  } catch {
    return 60
  }
}

function Timer() {
  const { settings, toggleSound } = useSettings()
  const { t } = useLang()
  const navigate = useNavigate()
  // Restore a persisted countdown on first mount (a page reload mid-run).
  // Remaining time for a running timer is recovered from the saved wall-clock
  // deadline; paused timers keep their frozen remaining ms.
  const [boot] = useState(() => {
    const saved = loadTimerState()
    if (saved) {
      const remainingMs =
        saved.status === 'paused'
          ? (saved.pausedRemainingMs ?? 0)
          : saved.status === 'running'
            ? Math.max(0, (saved.deadlineEpoch ?? 0) - Date.now())
            : 0
      return { status: saved.status as Status, totalSec: saved.totalSec, remainingMs }
    }
    const secs = loadSeconds()
    return { status: 'idle' as Status, totalSec: secs, remainingMs: secs * 1000 }
  })

  const [totalSec, setTotalSec] = useState(boot.totalSec)
  const [status, setStatus] = useState<Status>(boot.status)
  const [remainingMs, setRemainingMs] = useState(boot.remainingMs)

  const deadlineRef = useRef(0)
  const pausedRef = useRef(boot.status === 'paused' ? boot.remainingMs : 0)
  // Remaining ms to seed a restored *running* deadline when the loop spins up.
  const restoreRemainingRef = useRef(boot.status === 'running' ? boot.remainingMs : 0)
  const firedPips = useRef<Set<number>>(new Set())
  const celebratedRef = useRef(false)

  useWakeLock(status === 'running')

  // Live countdown in the browser tab while it runs.
  useDocumentTitle(
    status === 'idle'
      ? null
      : status === 'done'
        ? `${t('done')} · ${t('timer')}`
        : `${formatClock(remainingMs / 1000)} · ${t('timer')}`,
  )

  // Drift-free countdown: a self-correcting interval reading an absolute
  // performance.now() deadline (same approach as the Tabata engine).
  useEffect(() => {
    if (status !== 'running') return
    // Restored run: seed the perf-clock deadline from the recovered remaining.
    if (deadlineRef.current === 0) {
      deadlineRef.current = performance.now() + restoreRemainingRef.current
    }
    const id = setInterval(() => {
      const remaining = deadlineRef.current - performance.now()
      const sec = remaining / 1000
      for (const t of PIP_THRESHOLDS) {
        if (sec <= t && !firedPips.current.has(t) && totalSec >= t) {
          firedPips.current.add(t)
          cuePip()
        }
      }
      if (remaining <= 0) {
        setRemainingMs(0)
        setStatus('done')
        return
      }
      setRemainingMs(remaining)
    }, 100)
    return () => clearInterval(id)
  }, [status, totalSec])

  useEffect(() => {
    if (status === 'done' && !celebratedRef.current) {
      celebratedRef.current = true
      cueFinish()
      celebrate()
    }
  }, [status])

  // Persist the live countdown so a reload resumes it (anchored to the wall
  // clock, since performance.now() resets on reload).
  useEffect(() => {
    if (status === 'running') {
      const deadlineEpoch = Date.now() + Math.max(0, deadlineRef.current - performance.now())
      saveTimerState({ status, totalSec, deadlineEpoch })
    } else if (status === 'paused') {
      saveTimerState({ status, totalSec, pausedRemainingMs: pausedRef.current })
    } else if (status === 'done') {
      saveTimerState({ status, totalSec })
    } else {
      clearTimerState()
    }
  }, [status, totalSec])

  const startFrom = useCallback((seconds: number) => {
    unlockAudio()
    firedPips.current.clear()
    celebratedRef.current = false
    deadlineRef.current = performance.now() + seconds * 1000
    setRemainingMs(seconds * 1000)
    setStatus('running')
  }, [])

  const start = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(totalSec))
    } catch {
      /* best-effort */
    }
    if (totalSec > 0) startFrom(totalSec)
  }, [totalSec, startFrom])

  const pause = useCallback(() => {
    setStatus((s) => {
      if (s !== 'running') return s
      pausedRef.current = Math.max(0, deadlineRef.current - performance.now())
      return 'paused'
    })
  }, [])

  const resume = useCallback(() => {
    unlockAudio()
    deadlineRef.current = performance.now() + pausedRef.current
    setStatus('running')
  }, [])

  const reset = useCallback(() => {
    firedPips.current.clear()
    celebratedRef.current = false
    setRemainingMs(totalSec * 1000)
    setStatus('idle')
  }, [totalSec])

  const toggle = useCallback(() => {
    if (status === 'running') pause()
    else if (status === 'paused') resume()
    else if (status === 'idle') start()
    else reset()
  }, [status, pause, resume, start, reset])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      } else if (e.key.toLowerCase() === 'r') {
        reset()
      } else if (e.key === 'ArrowLeft' && status === 'idle') {
        navigate({ to: '/' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, reset, status, navigate])

  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  const setPart = (mins: number, secs: number) =>
    setTotalSec(Math.max(0, Math.min(99 * 60 + 59, mins * 60 + secs)))

  return (
    <div className="screen gap-[clamp(12px,3vmin,20px)]">
      <TopLeft title={t('timer')} />
      <TopRight muted={settings.soundPack === 'off'} onToggleMuted={toggleSound} />
      <Logo />
      <h1 className="sr-only">Interval Timer</h1>

      {status === 'idle' ? (
        <div className="flex flex-col items-center gap-7">
          {/* items-center aligns the colon with the steppers; the Min/Sec labels
              float underneath (absolute) so they don't affect that alignment. */}
          <div className="flex items-center gap-3 pb-7">
            <div className="relative flex flex-col items-center">
              <NumberStepper
                label={t('min')}
                testid="minutes"
                value={minutes}
                max={99}
                step={1}
                big
                onChange={(v) => setPart(v, seconds)}
              />
              <span className="absolute inset-x-0 top-full mt-2 text-center font-display text-[0.85rem] uppercase tracking-[0.1em] text-fg-tertiary">
                {t('min')}
              </span>
            </div>
            <span className="font-display text-[2.5rem] leading-none text-fg">:</span>
            <div className="relative flex flex-col items-center">
              <NumberStepper
                label={t('sec')}
                testid="seconds"
                value={seconds}
                max={59}
                step={5}
                big
                onChange={(v) => setPart(minutes, v)}
              />
              <span className="absolute inset-x-0 top-full mt-2 text-center font-display text-[0.85rem] uppercase tracking-[0.1em] text-fg-tertiary">
                {t('sec')}
              </span>
            </div>
          </div>
          <button className="btn btn-solid min-w-[200px]" onClick={start}>
            {t('start')}
          </button>
        </div>
      ) : (
        <>
          <div
            data-testid="time-remaining"
            className="display font-semibold text-[clamp(4rem,26vmin,22rem)]"
          >
            <TimeText value={formatClock(remainingMs / 1000)} />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
            {status === 'done' ? (
              <button className="btn btn-solid min-w-[160px] text-[1.2rem]" onClick={() => startFrom(totalSec)}>
                {t('again')}
              </button>
            ) : (
              <button className="btn btn-solid min-w-[160px] text-[1.2rem]" onClick={toggle}>
                {status === 'running' ? t('pause') : t('resume')}
              </button>
            )}
            <button className="btn min-w-[160px] text-[1.2rem]" onClick={reset}>
              {t('edit')}
            </button>
          </div>
          <p className="font-ui text-[0.72rem] uppercase tracking-[0.14em] text-fg-tertiary">
            Space {t('pause')} / {t('resume')} · R {t('edit')}
          </p>
        </>
      )}
    </div>
  )
}
