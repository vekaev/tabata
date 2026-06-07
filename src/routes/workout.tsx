import { useCallback, useEffect, useMemo, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TopLeft, TopRight, Logo } from '../components/Chrome'
import { useTabataTimer } from '../lib/useTabataTimer'
import { useSettings } from '../lib/useSettings'
import { useWakeLock } from '../lib/platform'
import { celebrate } from '../lib/confetti'
import { TimeText } from '../components/TimeText'
import { useLang, type TFunction } from '../lib/i18n'
import { DEFAULT_CONFIG, formatClock, type PhaseKind } from '../lib/tabata'
import { loadConfig } from '../lib/storage'

export const Route = createFileRoute('/workout')({
  head: () => ({
    meta: [
      { title: 'Tabata Workout — Running Interval Timer' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Workout,
})

function phaseLabel(kind: PhaseKind, t: TFunction): string {
  if (kind === 'prepare') return t('getReady')
  if (kind === 'work') return t('work')
  if (kind === 'rest') return t('rest')
  if (kind === 'rest-set') return t('setRest')
  if (kind === 'cooldown') return t('cooldown')
  return t('done')
}

// Subtle full-screen tint that adapts to the active theme via color-mix.
function tint(kind: PhaseKind): string {
  if (kind === 'work') return 'color-mix(in srgb, var(--work) 9%, var(--bg))'
  if (kind === 'rest' || kind === 'rest-set')
    return 'color-mix(in srgb, var(--rest) 9%, var(--bg))'
  return 'var(--bg)'
}

function labelColor(kind: PhaseKind): string {
  if (kind === 'work') return 'text-work-bright'
  if (kind === 'rest' || kind === 'rest-set') return 'text-rest-bright'
  return 'text-fg-tertiary'
}

function progressColor(kind: PhaseKind): string {
  if (kind === 'work') return 'bg-work-bright'
  if (kind === 'rest' || kind === 'rest-set') return 'bg-rest-bright'
  return 'bg-fg'
}

function Workout() {
  const navigate = useNavigate()
  const { settings, toggleSound } = useSettings()
  const { t } = useLang()

  // Config is read once from localStorage (the cross-screen sync mechanism).
  const config = useMemo(
    () => loadConfig({ id: 'custom', name: 'Custom', ...DEFAULT_CONFIG }),
    [],
  )

  const { snapshot, totalSec, sequence, start, reset, toggle, skip } = useTabataTimer(config)
  const { status, phase, phaseIndex, remainingDisplay, totalRemainingSec, phaseProgress } = snapshot

  // The label for the current work round, or a "Next: …" preview otherwise.
  const upcomingName = sequence.slice(phaseIndex + 1).find((p) => p.kind === 'work')?.name
  const roundName =
    phase.kind === 'work'
      ? phase.name
      : phase.kind !== 'done' && upcomingName
        ? `${t('next')}: ${upcomingName}`
        : undefined

  useWakeLock(status === 'running')

  // Auto-start on mount so arriving from the config screen begins immediately.
  // `start` is stable for a given config, so this runs once per workout (twice
  // under StrictMode, which simply restarts cleanly from zero).
  useEffect(() => {
    start()
  }, [start])

  // Confetti once, when the workout completes. A ref guard keeps it from
  // re-firing on re-render, and restart() re-arms it.
  const celebratedRef = useRef(false)
  useEffect(() => {
    if (status === 'done' && !celebratedRef.current) {
      celebratedRef.current = true
      celebrate()
    }
  }, [status])

  const restart = useCallback(() => {
    celebratedRef.current = false
    reset()
    start()
  }, [reset, start])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      } else if (e.key.toLowerCase() === 'r') {
        restart()
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 's') {
        skip()
      } else if (e.key === 'ArrowLeft') {
        navigate({ to: '/' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, restart, skip, navigate])

  const isDone = status === 'done'

  return (
    <div
      className="screen gap-[clamp(12px,3vmin,20px)]"
      style={{ backgroundColor: isDone ? 'var(--bg)' : tint(phase.kind) }}
    >
      <TopLeft
        title={
          phase.set && config.sets > 1
            ? `${t('tabata')} · ${t('set')} ${phase.set}/${config.sets}`
            : t('tabata')
        }
      />
      <TopRight muted={settings.soundPack === 'off'} onToggleMuted={toggleSound} />
      <Logo />
      <h1 className="sr-only">Tabata Workout</h1>

      {isDone ? (
        <div className="flex flex-col items-center gap-[18px]">
          <div className="display m-0 font-bold uppercase tracking-[0.05em] text-work-bright text-[clamp(5rem,20vmin,14rem)]">
            {t('done')}
          </div>
          <p className="m-0 font-ui text-base uppercase tracking-[0.18em] text-fg-tertiary">
            {formatClock(totalSec)} · {config.rounds * config.sets} {t('roundsLower')}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
            <button className="btn btn-solid min-w-[160px] text-[1.2rem]" onClick={restart}>
              {t('again')}
            </button>
            <button
              className="btn min-w-[160px] text-[1.2rem]"
              onClick={() => navigate({ to: '/tabata' })}
            >
              {t('edit')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            data-testid="phase-label"
            data-phase={phase.kind}
            className={`display font-semibold uppercase tracking-[0.35em] text-[clamp(1.4rem,5vmin,2.6rem)] ${labelColor(phase.kind)}`}
          >
            {phaseLabel(phase.kind, t)}
          </div>

          {roundName && (
            <div className="max-w-[90vw] truncate font-display text-[clamp(1.1rem,4vmin,2rem)] text-fg-secondary">
              {roundName}
            </div>
          )}

          <div className="flex items-center justify-center gap-[clamp(20px,6vw,70px)]">
            {phase.round != null && (
              <span
                className="display font-bold text-accent text-[clamp(3.5rem,16vmin,12rem)]"
                aria-label={`${t('round')} ${phase.round} / ${config.rounds}`}
              >
                {phase.round}
              </span>
            )}
            <span data-testid="time-remaining" className="display font-semibold text-[clamp(4rem,26vmin,22rem)]">
              <TimeText value={formatClock(remainingDisplay)} />
            </span>
            {/* Invisible mirror of the round number so the clock stays dead-centered. */}
            {phase.round != null && (
              <span
                aria-hidden
                className="invisible display font-bold text-[clamp(3.5rem,16vmin,12rem)]"
              >
                {phase.round}
              </span>
            )}
          </div>

          <div className="flex gap-7 font-ui text-[0.85rem] uppercase tracking-[0.16em] text-fg-tertiary">
            {phase.round != null && (
              <span>
                {t('round')} {phase.round} / {config.rounds}
              </span>
            )}
            <span>
              {t('total')} {formatClock(totalRemainingSec)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
            <button className="btn btn-solid min-w-[150px] text-[1.2rem]" onClick={toggle}>
              {status === 'running' ? t('pause') : t('resume')}
            </button>
            <button className="btn min-w-[150px] text-[1.2rem]" onClick={skip}>
              {t('skip')}
            </button>
            <button className="btn btn-danger min-w-[150px] text-[1.2rem]" onClick={restart}>
              {t('restart')}
            </button>
          </div>
          <p className="font-ui text-[0.72rem] uppercase tracking-[0.14em] text-fg-tertiary">
            Space {t('pause')} / {t('resume')} · → {t('skip')} · R {t('restart')}
          </p>
        </>
      )}

      <div className="fixed bottom-0 left-0 h-1 w-full bg-[rgb(255_255_255_/_0.08)]" aria-hidden>
        <div
          className={`h-full transition-[width] duration-100 ease-linear ${progressColor(phase.kind)}`}
          style={{ width: `${Math.min(100, Math.max(0, phaseProgress * 100))}%` }}
        />
      </div>
    </div>
  )
}
