// Settings dialog: color mode, accent color, display font, language, and a
// support link. Opened from the gear button in the top-right.

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTheme, type ThemeMode } from '../lib/useTheme'
import { useSettings } from '../lib/useSettings'
import { SOUND_PACKS, previewSoundPack } from '../lib/audio'
import { LANGS, useLang, type TFunction } from '../lib/i18n'
import { isElectron } from '../lib/platform'
import { Modal } from './Modal'
import { GearIcon } from './icons'

const SUPPORT_EMAIL = 'vekaev4@icloud.com'
const RELEASES_URL = 'https://github.com/vekaev/tabata/releases/latest'

export function ThemePanel() {
  const { mode, accent, customAccent, font, changeMode, changeAccent, changeFont, presets, fonts } =
    useTheme()
  const { lang, setLang, t } = useLang()
  const { settings, setPack } = useSettings()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  // On the web, go to the in-app download page; in the desktop app itself,
  // open the GitHub releases in the browser (e.g. to get it on another machine).
  const getApp = () => {
    if (isElectron) {
      window.open(RELEASES_URL, '_blank')
    } else {
      setOpen(false)
      void navigate({ to: '/download' })
    }
  }

  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'auto', label: t('auto') },
    { value: 'light', label: t('light') },
    { value: 'dark', label: t('dark') },
  ]
  const heading = 'mb-2 mt-4 font-ui text-[0.7rem] uppercase tracking-[0.18em] text-fg-tertiary first:mt-0'

  const openSupport = () =>
    window.open(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Tabata Timer — Support')}`,
      '_blank',
    )

  return (
    <>
      <button
        className="icon-btn icon-btn-bare focus-ring"
        onClick={() => setOpen(true)}
        aria-label={t('settings')}
        title={t('settings')}
      >
        <GearIcon />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t('settings')}>
        <p className={heading}>{t('mode')}</p>
        <div className="grid grid-cols-3 gap-1.5">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => changeMode(m.value)}
              aria-pressed={mode === m.value}
              className={`focus-ring rounded-md border px-2 py-2 font-ui text-sm transition-colors ${
                mode === m.value
                  ? 'border-fg bg-fg text-bg'
                  : 'border-border text-fg-secondary hover:bg-hover'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <p className={heading}>{t('accent')}</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => changeAccent(p.name)}
              aria-label={`${p.name} ${t('accent')}`}
              aria-pressed={accent === p.name}
              className={`focus-ring h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                accent === p.name ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface' : ''
              }`}
              style={{ backgroundColor: p.hex }}
            />
          ))}
          <label
            className={`focus-ring relative block h-7 w-7 cursor-pointer overflow-hidden rounded-full ${
              accent === 'custom' ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface' : ''
            }`}
            aria-label={`${t('custom')} ${t('accent')}`}
            title={t('custom')}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-full"
              style={
                accent === 'custom'
                  ? { backgroundColor: customAccent }
                  : {
                      background:
                        'conic-gradient(from 90deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)',
                    }
              }
            />
            <input
              type="color"
              value={customAccent}
              onChange={(e) => changeAccent('custom', e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>

        <p className={heading}>{t('font')}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {fonts.map((f) => (
            <button
              key={f.id}
              onClick={() => changeFont(f.id)}
              aria-pressed={font === f.id}
              className={`focus-ring flex items-center justify-between rounded-md border px-2.5 py-1.5 transition-colors ${
                font === f.id ? 'border-fg' : 'border-border hover:bg-hover'
              }`}
            >
              <span className="font-ui text-[0.7rem] text-fg-tertiary">{f.name}</span>
              <span className="text-lg leading-none text-fg" style={{ fontFamily: f.stack }}>
                20
              </span>
            </button>
          ))}
        </div>

        <p className={heading}>{t('sound')}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SOUND_PACKS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                previewSoundPack(s.id)
                setPack(s.id)
              }}
              aria-pressed={settings.soundPack === s.id}
              className={`focus-ring rounded-md border px-2 py-2 font-ui text-sm transition-colors ${
                settings.soundPack === s.id
                  ? 'border-fg bg-fg text-bg'
                  : 'border-border text-fg-secondary hover:bg-hover'
              }`}
            >
              {t(s.nameKey as Parameters<TFunction>[0])}
            </button>
          ))}
        </div>

        <p className={heading}>{t('language')}</p>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as (typeof LANGS)[number]['code'])}
          aria-label={t('language')}
          className="focus-ring w-full rounded-md border border-border bg-surface px-2 py-2 font-ui text-sm text-fg"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        <p className={heading}>{t('support')}</p>
        <button className="btn w-full px-4 py-2.5 text-[0.95rem]" onClick={openSupport}>
          {t('reportProblem')}
        </button>

        <button
          className="btn btn-solid mt-2 w-full px-4 py-2.5 text-[0.95rem]"
          onClick={getApp}
        >
          {t('getApp')}
        </button>
      </Modal>
    </>
  )
}
