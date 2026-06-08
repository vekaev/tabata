import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { TopLeft, TopRight, Logo } from '../components/Chrome'
import { isElectron } from '../lib/platform'

export const Route = createFileRoute('/download')({
  head: () => ({
    meta: [
      { title: 'Download Tabata Timer — Free Desktop App for macOS, Windows & Linux' },
      {
        name: 'description',
        content:
          'Download the free Tabata Timer desktop app for macOS (Apple Silicon & Intel), Windows, and Linux. No account, no ads, works offline.',
      },
    ],
  }),
  component: Download,
})

// Stable, version-less GitHub release URLs — they always resolve to the latest
// release's matching asset, so these links never need updating.
const BASE = 'https://github.com/vekaev/tabata/releases/latest/download'

type DesktopOS = 'mac' | 'windows' | 'linux'
type OS = DesktopOS | 'mobile' | 'unknown'

const PLATFORMS: Record<DesktopOS, { label: string; file: string; note: string }> = {
  mac: {
    label: 'Download for macOS',
    file: 'Tabata-mac.dmg',
    note: 'Universal — Apple Silicon & Intel · macOS 11+',
  },
  windows: {
    label: 'Download for Windows',
    file: 'Tabata-Setup.exe',
    note: 'Windows 10 & 11 · 64-bit installer',
  },
  linux: {
    label: 'Download for Linux',
    file: 'Tabata-linux.AppImage',
    note: 'AppImage · make executable and run',
  },
}

function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'unknown'
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const ua = nav.userAgent || ''
  if (/Android/i.test(ua) || /iPhone|iPod/i.test(ua)) return 'mobile'
  const plat = nav.userAgentData?.platform || nav.platform || ua
  // iPadOS 13+ reports as "MacIntel"; tell it apart by the touch screen.
  if (/iPad/i.test(ua) || (/Mac/i.test(plat) && nav.maxTouchPoints > 1)) return 'mobile'
  if (/Mac/i.test(plat)) return 'mac'
  if (/Win/i.test(plat)) return 'windows'
  if (/Linux/i.test(plat)) return 'linux'
  return 'unknown'
}

function triggerDownload(file: string) {
  // A hidden iframe fetches the asset (GitHub serves it as an attachment, so it
  // downloads) without ever navigating the page away — even if the URL 404s.
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = `${BASE}/${file}`
  document.body.appendChild(iframe)
  setTimeout(() => iframe.remove(), 20000)
}

const isDesktop = (os: OS): os is DesktopOS =>
  os === 'mac' || os === 'windows' || os === 'linux'

function Download() {
  const [os] = useState<OS>(detectOS)

  useEffect(() => {
    if (isDesktop(os) && !isElectron) {
      // Small delay so the page paints before the browser's download prompt.
      const id = setTimeout(() => triggerDownload(PLATFORMS[os].file), 700)
      return () => clearTimeout(id)
    }
  }, [os])

  const primary = isDesktop(os) ? os : null
  const others = (Object.keys(PLATFORMS) as DesktopOS[]).filter((k) => k !== primary)

  return (
    <div className="screen">
      <TopLeft title="Download" />
      <TopRight />
      <Logo />

      <div className="flex w-full max-w-[440px] flex-col items-center gap-6 py-16">
        <div className="space-y-2">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
          >
            Download Tabata
          </h1>
          <p className="text-[var(--fg-secondary)]">
            Free desktop app — no account, no ads, works offline.
          </p>
        </div>

        {primary ? (
          <div className="flex w-full flex-col items-center gap-2">
            <a
              className="btn"
              href={`${BASE}/${PLATFORMS[primary].file}`}
              download
              style={{ background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}
            >
              {PLATFORMS[primary].label}
            </a>
            <p className="text-sm text-[var(--fg-secondary)]">
              Your download should start automatically.{' '}
              <a className="underline" href={`${BASE}/${PLATFORMS[primary].file}`} download>
                Click here
              </a>{' '}
              if it didn’t.
            </p>
            <p className="text-xs text-[var(--fg-secondary)]">{PLATFORMS[primary].note}</p>
          </div>
        ) : os === 'mobile' ? (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-[var(--fg-secondary)]">
              On phones, Tabata runs right in your browser — no app needed.
            </p>
            <Link
              to="/"
              className="btn"
              style={{ background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}
            >
              Open Tabata
            </Link>
            <p className="pt-2 text-xs text-[var(--fg-secondary)]">Or get the desktop app:</p>
          </div>
        ) : (
          <p className="text-[var(--fg-secondary)]">Choose your platform:</p>
        )}

        <div className="btn-stack">
          {others.map((k) => (
            <a key={k} className="btn" href={`${BASE}/${PLATFORMS[k].file}`} download>
              {PLATFORMS[k].label}
            </a>
          ))}
        </div>

        <a
          className="text-sm text-[var(--fg-secondary)] underline"
          href="https://github.com/vekaev/tabata/releases/latest"
          target="_blank"
          rel="noreferrer"
        >
          All releases &amp; changelog →
        </a>
      </div>
    </div>
  )
}
