import { test, expect } from '@playwright/test'

test.describe('clock', () => {
  test('shows the current time and ticks', async ({ page }) => {
    await page.clock.install()
    // Seconds are timezone-independent, so assert on those to avoid TZ flakiness.
    await page.clock.pauseAt(new Date('2030-06-15T10:20:30'))
    await page.goto('/clock')

    const clock = page.getByTestId('clock')
    await expect(clock).toHaveText(/^\d{2}:\d{2}:30$/)

    await page.clock.runFor(3000)
    await expect(clock).toHaveText(/^\d{2}:\d{2}:33$/)
  })

  test('renders huge on a single line without overflowing', async ({ page }) => {
    await page.goto('/clock')
    const box = await page.getByTestId('clock').evaluate((el) => {
      const r = el.getBoundingClientRect()
      const fs = parseFloat(getComputedStyle(el).fontSize)
      return { width: r.width, height: r.height, fs, vw: window.innerWidth }
    })
    // Big: the digits use a large share of the viewport width.
    expect(box.width).toBeGreaterThan(box.vw * 0.5)
    // One line: height is about a single line tall, and it doesn't overflow.
    expect(box.height).toBeLessThan(box.fs * 1.4)
    expect(box.width).toBeLessThanOrEqual(box.vw + 1)
  })
})
