import confetti from 'canvas-confetti'

/** Celebratory multi-burst confetti, respecting reduced-motion preferences. */
export function celebrate(): void {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const colors = ['#e60023', '#ff1e2d', '#ffffff', '#22c55e']
  const fire = (particleRatio: number, opts: confetti.Options) =>
    confetti({
      origin: { y: 0.65 },
      colors,
      particleCount: Math.floor(180 * particleRatio),
      ...opts,
    })

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}
