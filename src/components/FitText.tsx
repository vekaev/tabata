// Renders a time string as large as possible on a single line: it measures the
// text and scales the font-size to fill the parent's width (capped by maxVh).
// This keeps the huge clock filling the screen for ANY chosen font without
// wrapping or overflowing.
import { useLayoutEffect, useRef } from 'react'
import { useTheme } from '../lib/useTheme'
import { TimeText } from './TimeText'

export function FitText({
  value,
  maxVh = 80,
  testid,
}: {
  value: string
  maxVh?: number
  testid?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { font } = useTheme() // re-fit when the display font changes

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      const parent = el.parentElement
      if (!parent || parent.clientWidth <= 0) return
      el.style.fontSize = '100px'
      const measured = el.scrollWidth || 1
      const byWidth = (100 * parent.clientWidth) / measured
      const byHeight = (window.innerHeight * maxVh) / 100
      el.style.fontSize = `${Math.min(byWidth * 0.92, byHeight)}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement ?? el)
    // Web fonts change metrics once loaded — re-fit then.
    void document.fonts?.ready?.then(fit)
    return () => ro.disconnect()
    // value.length (not value) so a ticking clock doesn't re-fit every second;
    // digits are tabular so width is constant for a given length.
  }, [value.length, font, maxVh])

  return (
    <div ref={ref} data-testid={testid} className="display whitespace-nowrap leading-none">
      <TimeText value={value} />
    </div>
  )
}
