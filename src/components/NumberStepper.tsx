// Accessible number field with − / + steppers and press-and-hold-to-repeat.
//
// Per current guidance (GOV.UK number-input handling + NN/G input-stepper
// guidelines + WCAG target sizes) this beats a native `type=number` (tiny spin
// buttons, scroll-wheel mutations, dropped invalid input) and a wheel picker
// (poor a11y, hard exact landings) for nudging small integers on mobile:
//   - the value is a real text input → numeric keypad + precise/typed entry
//   - large ± buttons → one-tap for the common case, hold to fly to big values
import { useCallback, useEffect, useRef } from 'react'

interface Props {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
  step?: number
  testid?: string
  big?: boolean
}

export function NumberStepper({
  value,
  onChange,
  label,
  min = 0,
  max = 9999,
  step = 1,
  testid,
  big = false,
}: Props) {
  const clamp = useCallback((n: number) => Math.max(min, Math.min(max, n)), [min, max])

  // The hold loop reads the latest value through a ref so it keeps counting.
  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const repeatedRef = useRef(false)

  const apply = useCallback(
    (dir: 1 | -1) => onChange(clamp(valueRef.current + dir * step)),
    [onChange, clamp, step],
  )

  const stopHold = useCallback(() => {
    if (holdRef.current) {
      clearTimeout(holdRef.current)
      holdRef.current = null
    }
  }, [])

  const startHold = useCallback(
    (dir: 1 | -1) => {
      repeatedRef.current = false
      stopHold()
      let delay = 280
      const run = () => {
        repeatedRef.current = true
        apply(dir)
        delay = Math.max(45, delay * 0.82) // accelerate on a long hold
        holdRef.current = setTimeout(run, delay)
      }
      holdRef.current = setTimeout(run, 380) // wait before auto-repeating
    },
    [apply, stopHold],
  )

  // A trailing click fires after a hold; swallow it so we don't double-count.
  const clickStep = useCallback(
    (dir: 1 | -1) => {
      if (repeatedRef.current) {
        repeatedRef.current = false
        return
      }
      apply(dir)
    },
    [apply],
  )

  useEffect(() => stopHold, [stopHold])

  const btn =
    'flex shrink-0 select-none items-center justify-center rounded-md border border-border text-fg-secondary transition-colors hover:border-border-strong hover:bg-hover active:scale-95 disabled:opacity-30 disabled:hover:border-border disabled:hover:bg-transparent [touch-action:manipulation]'
  const btnSize = big ? 'h-12 w-12 text-3xl' : 'h-11 w-11 text-2xl'
  const inputSize = big ? 'w-[110px] text-[2.5rem]' : 'w-[64px] text-[1.6rem]'

  const stepButton = (dir: 1 | -1) => (
    <button
      type="button"
      className={`${btn} ${btnSize}`}
      aria-label={`${dir > 0 ? 'Increase' : 'Decrease'} ${label}`}
      disabled={dir > 0 ? value >= max : value <= min}
      onPointerDown={(e) => {
        e.preventDefault()
        startHold(dir)
      }}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onClick={() => clickStep(dir)}
    >
      {dir > 0 ? '+' : '−'}
    </button>
  )

  return (
    <div className="inline-flex items-center gap-1.5">
      {stepButton(-1)}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        aria-label={label}
        data-testid={testid}
        value={String(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, '')
          onChange(digits === '' ? 0 : Number(digits))
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            onChange(clamp(value + step))
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            onChange(clamp(value - step))
          }
        }}
        onBlur={() => onChange(clamp(value))}
        onFocus={(e) => e.target.select()}
        className={`focus-ring rounded border border-border bg-transparent px-1 py-2 text-center font-display font-medium text-fg ${inputSize}`}
      />
      {stepButton(1)}
    </div>
  )
}
