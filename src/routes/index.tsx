import { Link, createFileRoute } from '@tanstack/react-router'
import { TopRight, Logo } from '../components/Chrome'
import { unlockAudio } from '../lib/audio'
import { useLang } from '../lib/i18n'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: 'Tabata Timer — Free Fullscreen Interval & HIIT Timer' }],
  }),
  component: Menu,
})

function Menu() {
  const { t } = useLang()
  const modes = [
    { label: t('tabata'), to: '/tabata' as const },
    { label: t('clock'), to: '/clock' as const },
    { label: t('timer'), to: '/timer' as const },
  ]

  return (
    <div className="screen">
      <TopRight />
      <Logo />
      <h1 className="sr-only">Tabata Timer — Free Fullscreen Interval &amp; HIIT Timer</h1>
      <nav className="btn-stack" aria-label="Timer modes">
        {modes.map((mode) => (
          <Link key={mode.to} to={mode.to} className="btn" onClick={unlockAudio}>
            {mode.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
