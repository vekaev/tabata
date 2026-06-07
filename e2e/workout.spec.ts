import { test, expect, type Page } from '@playwright/test'
import type { TabataConfig } from '../src/lib/tabata'

// Seed a config and open the (auto-starting) workout under a controlled clock.
// page.clock.install() MUST run before goto: the workout records its deadline on
// mount, so the fake clock has to be in place first.
async function startWorkout(page: Page, config: Partial<TabataConfig>) {
  await page.clock.install()
  // Freeze time; it now only moves when we call runFor(). Must happen before
  // navigation so the workout captures the frozen clock when it auto-starts.
  await page.clock.pauseAt(new Date('2030-01-01T00:00:00'))
  await page.addInitScript((c) => {
    localStorage.setItem('tabata.config', JSON.stringify(c))
  }, config)
  await page.goto('/workout')
  // Wait for the component to mount and auto-start (capturing its deadline at
  // the frozen clock) before any runFor advances time.
  await page.getByTestId('phase-label').waitFor()
}

test.describe('workout timer', () => {
  test('runs prepare → work → rest with a drift-free countdown', async ({ page }) => {
    await startWorkout(page, { prepareSec: 3, workSec: 5, restSec: 3, rounds: 2, sets: 1 })

    const phase = page.getByTestId('phase-label')
    const time = page.getByTestId('time-remaining')

    await expect(phase).toHaveText('Get Ready')

    await page.clock.runFor(3100) // into round 1 work
    await expect(phase).toHaveAttribute('data-phase', 'work')
    await expect(time).toHaveText('00:05')

    await page.clock.runFor(5000) // work done → rest
    await expect(phase).toHaveAttribute('data-phase', 'rest')
    await expect(time).toHaveText('00:03')
    await expect(page.getByText('Round 1 / 2')).toBeVisible()
  })

  test('shows SET REST between sets', async ({ page }) => {
    await startWorkout(page, {
      prepareSec: 0,
      workSec: 5,
      restSec: 0,
      rounds: 1,
      sets: 2,
      restBetweenSetsSec: 5,
    })
    await page.clock.runFor(5100)
    const phase = page.getByTestId('phase-label')
    await expect(phase).toHaveAttribute('data-phase', 'rest-set')
    await expect(phase).toHaveText('Set Rest')
  })

  test('reaches DONE and offers restart', async ({ page }) => {
    await startWorkout(page, { prepareSec: 0, workSec: 1, restSec: 0, rounds: 1, sets: 1 })
    await page.clock.runFor(1200)
    await expect(page.getByText('Done', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Again' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
  })

  test('pause freezes the clock; resume continues it', async ({ page }) => {
    await startWorkout(page, { prepareSec: 0, workSec: 20, restSec: 10, rounds: 8, sets: 1 })
    const time = page.getByTestId('time-remaining')

    await page.clock.runFor(2000)
    await expect(time).toHaveText('00:18')

    await page.getByRole('button', { name: 'Pause' }).click()
    await page.clock.runFor(3000) // time passes while paused...
    await expect(time).toHaveText('00:18') // ...but the display holds

    await page.getByRole('button', { name: 'Resume' }).click()
    await page.clock.runFor(3000)
    await expect(time).toHaveText('00:15')
  })

  test('skip jumps straight to the next phase', async ({ page }) => {
    await startWorkout(page, { prepareSec: 10, workSec: 20, restSec: 10, rounds: 8, sets: 1 })
    const phase = page.getByTestId('phase-label')
    await expect(phase).toHaveText('Get Ready')

    // Skip the prepare countdown → straight into round 1 work at full duration.
    await page.getByRole('button', { name: 'Skip' }).click()
    await expect(phase).toHaveAttribute('data-phase', 'work')
    await expect(page.getByTestId('time-remaining')).toHaveText('00:20')

    // Skip again → rest.
    await page.getByRole('button', { name: 'Skip' }).click()
    await expect(phase).toHaveAttribute('data-phase', 'rest')
    await expect(page.getByTestId('time-remaining')).toHaveText('00:10')
  })

  test('shows a named round during the workout', async ({ page }) => {
    await page.clock.install()
    await page.clock.pauseAt(new Date('2030-01-01T00:00:00'))
    await page.goto('/tabata')

    await page.getByRole('button', { name: /Round names/i }).click()
    await page.getByPlaceholder('Round 1').fill('Goblet squat')
    await page.getByRole('button', { name: 'Start' }).click()

    await page.getByTestId('phase-label').waitFor()
    await page.clock.runFor(11_000) // past the prepare into round 1 work
    await expect(page.getByTestId('phase-label')).toHaveAttribute('data-phase', 'work')
    await expect(page.getByText('Goblet squat')).toBeVisible()
  })

  test('restart returns to the beginning', async ({ page }) => {
    await startWorkout(page, { prepareSec: 5, workSec: 20, restSec: 10, rounds: 8, sets: 1 })
    await page.clock.runFor(2000)
    await page.getByRole('button', { name: 'Restart' }).click()
    await expect(page.getByTestId('phase-label')).toHaveText('Get Ready')
    await expect(page.getByTestId('time-remaining')).toHaveText('00:05')
  })
})
