import { test, expect } from '@playwright/test'

test.describe('timer', () => {
  test('counts down from a set duration and finishes', async ({ page }) => {
    await page.clock.install()
    await page.clock.pauseAt(new Date('2030-01-01T00:00:00'))
    await page.goto('/timer')

    await page.getByTestId('minutes').fill('0')
    await page.getByTestId('seconds').fill('5')
    await page.getByRole('button', { name: 'Start' }).click()

    const time = page.getByTestId('time-remaining')
    await expect(time).toHaveText('00:05')

    await page.clock.runFor(3000)
    await expect(time).toHaveText('00:02')

    await page.clock.runFor(3000)
    await expect(time).toHaveText('00:00')
    await expect(page.getByRole('button', { name: 'Again' })).toBeVisible()
  })

  test('pause holds the countdown', async ({ page }) => {
    await page.clock.install()
    await page.clock.pauseAt(new Date('2030-01-01T00:00:00'))
    await page.goto('/timer')

    await page.getByTestId('minutes').fill('1')
    await page.getByTestId('seconds').fill('0')
    await page.getByRole('button', { name: 'Start' }).click()

    const time = page.getByTestId('time-remaining')
    await page.clock.runFor(10_000)
    await expect(time).toHaveText('00:50')

    await page.getByRole('button', { name: 'Pause' }).click()
    await page.clock.runFor(5000)
    await expect(time).toHaveText('00:50')

    await page.getByRole('button', { name: 'Resume' }).click()
    await page.clock.runFor(10_000)
    await expect(time).toHaveText('00:40')
  })
})
