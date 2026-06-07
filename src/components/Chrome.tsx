// The three fixed corner controls shared by every screen: a back button + title
// (top-left), sound + theme + fullscreen controls (top-right), and the logo
// (bottom-right).

import { Link } from '@tanstack/react-router'
import { useFullscreen } from '../lib/platform'
import { useLang } from '../lib/i18n'
import { ThemePanel } from './ThemePanel'
import {
  BackIcon,
  CollapseIcon,
  ExpandIcon,
  SoundOffIcon,
  SoundOnIcon,
} from './icons'

export function TopLeft({ title, to = '/' }: { title: string; to?: string }) {
  const { t } = useLang()
  return (
    <div className="corner corner-tl">
      <Link to={to} className="icon-btn focus-ring" aria-label={t('back')}>
        <BackIcon />
      </Link>
      <span className="corner-title">{title}</span>
    </div>
  )
}

export function TopRight({
  muted,
  onToggleMuted,
}: {
  muted?: boolean
  onToggleMuted?: () => void
}) {
  const { isFullscreen, toggle } = useFullscreen()
  const { t } = useLang()
  return (
    <div className="corner corner-tr">
      {onToggleMuted && (
        <button
          className="icon-btn icon-btn-bare focus-ring"
          onClick={onToggleMuted}
          aria-label={muted ? t('unmute') : t('mute')}
          title={muted ? t('unmute') : t('mute')}
          aria-pressed={muted}
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
      )}
      <ThemePanel />
      <button
        className="icon-btn icon-btn-bare focus-ring"
        onClick={toggle}
        aria-label={t('fullscreen')}
        title={t('fullscreen')}
      >
        {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
      </button>
    </div>
  )
}

export function Logo() {
  const { t } = useLang()
  return (
    <div className="corner corner-br">
      <span className="logo uppercase" aria-label="Tabata Timer">
        {t('tabata')}
      </span>
    </div>
  )
}
