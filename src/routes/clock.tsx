import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TopLeft, TopRight, Logo } from '../components/Chrome'
import { FitText } from '../components/FitText'
import { useLang } from '../lib/i18n'

export const Route = createFileRoute('/clock')({
  head: () => ({
    meta: [
      { title: 'Fullscreen Clock — Minimalist Big Digital Clock' },
      {
        name: 'description',
        content: 'A clean, minimalist fullscreen digital clock with oversized numbers in black and white.',
      },
    ],
  }),
  component: Clock,
})

function currentTime(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function Clock() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [time, setTime] = useState(currentTime)

  useEffect(() => {
    const id = setInterval(() => setTime(currentTime()), 250)
    return () => clearInterval(id)
  }, [])

  // ArrowLeft mirrors the on-screen back button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate({ to: '/' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <div className="screen">
      <TopLeft title={t('clock')} />
      <TopRight />
      <Logo />
      <h1 className="sr-only">Fullscreen Clock</h1>
      <FitText value={time} maxVh={82} testid="clock" />
    </div>
  )
}
