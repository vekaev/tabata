import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TopLeft, TopRight, Logo } from '../components/Chrome'
import { useSettings } from '../lib/useSettings'
import { useWakeLock } from '../lib/platform'
import { useLang } from '../lib/i18n'
import { celebrate } from '../lib/confetti'
import { cueFinish, cuePip, unlockAudio } from '../lib/audio'
import { formatClock } from '../lib/tabata'
import { TimeText } from '../components/TimeText'
import { NumberStepper } from '../components/NumberStepper'

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
  const [totalSec, setTotalSec] = useState(loadSeconds)
  const [status, setStatus] = useState<Status>('idle')
  const [remainingMs, setRemainingMs] = useState(totalSec * 1000)

  const deadlineRef = useRef(0)
  const pausedRef = useRef(0)
  const firedPips = useRef<Set<number>>(new Set())
  const celebratedRef = useRef(false)

  useWakeLock(status === 'running')

  // Drift-free countdown: a self-correcting interval reading an absolute
  // performance.now() deadline (same approach as the Tabata engine).
  useEffect(() => {
    if (status !== 'running') return
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
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-2">
              <NumberStepper
                label={t('min')}
                testid="minutes"
                value={minutes}
                max={99}
                step={1}
                big
                onChange={(v) => setPart(v, seconds)}
              />
              <span className="font-display text-[0.85rem] uppercase tracking-[0.1em] text-fg-tertiary">
                {t('min')}
              </span>
            </div>
            <span className="pt-3 font-display text-[2.5rem] text-fg">:</span>
            <div className="flex flex-col items-center gap-2">
              <NumberStepper
                label={t('sec')}
                testid="seconds"
                value={seconds}
                max={59}
                step={5}
                big
                onChange={(v) => setPart(minutes, v)}
              />
              <span className="font-display text-[0.85rem] uppercase tracking-[0.1em] text-fg-tertiary">
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
