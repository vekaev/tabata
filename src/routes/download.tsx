import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { TopLeft, TopRight, Logo } from '../components/Chrome'
import { isElectron } from '../lib/platform'
import { DOWNLOADS, RELEASES_LATEST, downloadUrl } from '../lib/links'

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

type DesktopOS = 'mac' | 'windows' | 'linux'
type OS = DesktopOS | 'mobile' | 'unknown'

const PLATFORMS: Record<DesktopOS, { label: string; file: string; note: string }> = {
  mac: {
    label: 'Download for macOS',
    file: DOWNLOADS.mac,
    note: 'Universal — Apple Silicon & Intel · macOS 11+',
  },
  windows: {
    label: 'Download for Windows',
    file: DOWNLOADS.windows,
    note: 'Windows 10 & 11 · 64-bit installer',
  },
  linux: {
    label: 'Download for Linux',
    file: DOWNLOADS.linux,
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
  iframe.src = downloadUrl(file)
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
  // Mac users (or undetected visitors) get the one-time "how to open" guide,
  // since the app isn't signed with a paid Apple certificate.
  const showMacHelp = primary === 'mac' || !primary

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
              href={downloadUrl(PLATFORMS[primary].file)}
              download
              style={{ background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}
            >
              {PLATFORMS[primary].label}
            </a>
            <p className="text-sm text-[var(--fg-secondary)]">
              Your download should start automatically.{' '}
              <a className="underline" href={downloadUrl(PLATFORMS[primary].file)} download>
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
            <a key={k} className="btn" href={downloadUrl(PLATFORMS[k].file)} download>
              {PLATFORMS[k].label}
            </a>
          ))}
        </div>

        {showMacHelp && <MacOpenHelp />}

        <a
          className="text-sm text-[var(--fg-secondary)] underline"
          href={RELEASES_LATEST}
          target="_blank"
          rel="noreferrer"
        >
          All releases &amp; changelog →
        </a>
      </div>
    </div>
  )
}

// One-time instructions for opening an unsigned app on macOS. Shown to Mac
// visitors so the Gatekeeper warning ("Apple could not verify…") doesn't look
// like a dead end.
function MacOpenHelp() {
  return (
    <div className="w-full rounded-xl border border-border bg-[var(--surface)] p-5 text-start">
      <p className="font-display text-base uppercase tracking-[0.06em] text-[var(--fg)]">
        Opening it on a Mac
      </p>
      <p className="mt-1 text-sm text-[var(--fg-secondary)]">
        macOS shows an “Apple could not verify…” warning the first time, because the app
        isn’t signed with a paid Apple certificate. It’s safe — open it once like this:
      </p>
      <ol className="mt-3 flex flex-col gap-2 text-sm text-[var(--fg-secondary)]">
        <li className="flex gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
            1
          </span>
          <span>
            Open the <strong className="text-[var(--fg)]">.dmg</strong> and drag{' '}
            <strong className="text-[var(--fg)]">Tabata</strong> into{' '}
            <strong className="text-[var(--fg)]">Applications</strong>.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
            2
          </span>
          <span>
            Double-click Tabata. When macOS blocks it, click{' '}
            <strong className="text-[var(--fg)]">Done</strong>.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
            3
          </span>
          <span>
            Go to <strong className="text-[var(--fg)]">System Settings → Privacy &amp; Security</strong>,
            scroll down, and click <strong className="text-[var(--fg)]">Open Anyway</strong> next to
            Tabata — then <strong className="text-[var(--fg)]">Open</strong>. You only do this once.
          </span>
        </li>
      </ol>
      <div className="mt-3 text-xs text-[var(--fg-secondary)]">
        <p>Prefer the Terminal? Run this once:</p>
        <div className="mt-1.5 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-hover px-2 py-1.5 text-[var(--fg)]">
            xattr -cr /Applications/Tabata.app
          </code>
          <CopyButton text="xattr -cr /Applications/Tabata.app" />
        </div>
        <a
          className="mt-2 inline-block underline"
          href="https://support.apple.com/guide/mac-help/mh40616/mac"
          target="_blank"
          rel="noreferrer"
        >
          Apple’s guide →
        </a>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      aria-label="Copy command to clipboard"
      className="focus-ring shrink-0 rounded-md border border-border px-2.5 py-1.5 font-ui text-xs text-[var(--fg-secondary)] transition-colors hover:bg-hover hover:text-[var(--fg)]"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
