// One-off generator for raster assets (PWA icons, Apple touch icon, OG image)
// from inline SVG/HTML, rendered with the Chromium that ships with Playwright.
// Run: node scripts/gen-assets.mjs
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, '..', 'public')
const BUILD = path.join(__dirname, '..', 'build')

const ACCENT = '#e60023'
const BG = '#0a0a0a'

// Stopwatch clock mark, scalable via the `scale` (0..1 of the square).
const clock = (scale = 1) => {
  const s = 100
  const inset = (1 - scale) * s * 0.5
  return `
    <g transform="translate(${inset} ${inset}) scale(${scale})">
      <circle cx="50" cy="55" r="32" fill="none" stroke="${ACCENT}" stroke-width="8" />
      <line x1="50" y1="55" x2="50" y2="33" stroke="#fff" stroke-width="8" stroke-linecap="round" />
      <line x1="50" y1="55" x2="68" y2="65" stroke="#fff" stroke-width="8" stroke-linecap="round" />
      <rect x="38" y="10" width="24" height="11" rx="5.5" fill="#fff" />
    </g>`
}

const iconSvg = (scale) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="${BG}" />
    ${clock(scale)}
  </svg>`

const ogHtml = `
  <html><head>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700&family=Barlow:wght@500&display=swap" rel="stylesheet" />
    <style>
      * { margin: 0; box-sizing: border-box; }
      body { width: 1200px; height: 630px; background: ${BG}; color: #fff;
        font-family: 'Barlow Condensed', sans-serif; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 8px; }
      .timer { font-size: 280px; font-weight: 700; line-height: 0.9; letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums; }
      .work { color: #22c55e; }
      .sep { color: rgba(255,255,255,0.4); }
      .rest { color: ${ACCENT}; }
      .title { font-size: 64px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
      .sub { font-family: 'Barlow', sans-serif; font-size: 30px; font-weight: 500;
        letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
      .logo { position: absolute; bottom: 40px; right: 48px; background: ${ACCENT}; color: #fff;
        font-weight: 700; font-size: 28px; letter-spacing: 0.06em; padding: 8px 16px; border-radius: 10px; }
    </style>
  </head><body>
    <div class="timer"><span class="work">20</span><span class="sep">:</span><span class="rest">10</span></div>
    <div class="title">Tabata Timer</div>
    <div class="sub">Free Online HIIT &amp; Interval Timer</div>
    <div class="logo">TABATA</div>
  </body></html>`

const browser = await chromium.launch()

async function rasterizeSvg(svg, size, file, dir = PUBLIC) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(
    `<html><body style="margin:0">${svg.replace('width="100" height="100"', `width="${size}" height="${size}"`)}</body></html>`,
  )
  await page.locator('svg').screenshot({ path: path.join(dir, file), omitBackground: true })
  await page.close()
  console.log('wrote', path.relative(path.join(__dirname, '..'), path.join(dir, file)))
}

// PWA + Apple icons
await rasterizeSvg(iconSvg(1), 192, 'icon-192.png')
await rasterizeSvg(iconSvg(1), 512, 'icon-512.png')
await rasterizeSvg(iconSvg(1), 180, 'apple-touch-icon.png')
await rasterizeSvg(iconSvg(0.66), 512, 'icon-maskable-512.png') // padded for safe zone

// Desktop app icon (electron-builder reads build/icon.png → .icns/.ico). A bit
// of padding so the clock mark isn't cropped by macOS's rounded-rect mask.
await rasterizeSvg(iconSvg(0.82), 1024, 'icon.png', BUILD)

// Open Graph image
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await og.setContent(ogHtml)
await og.evaluate(() => document.fonts.ready)
await og.waitForTimeout(300)
await og.screenshot({ path: path.join(PUBLIC, 'og-image.png') })
await og.close()
console.log('wrote og-image.png')

await browser.close()
