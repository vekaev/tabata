import { test, expect } from '@playwright/test'

test.describe('tabata config', () => {
  test('shows sensible defaults and a 4:00 total', async ({ page }) => {
    await page.goto('/tabata')
    await expect(page.getByTestId('rounds')).toHaveValue('8')
    await expect(page.getByTestId('workSec')).toHaveValue('20')
    await expect(page.getByTestId('restSec')).toHaveValue('10')
    await expect(page.getByTestId('sets')).toHaveValue('1')
    await expect(page.getByTestId('prepareSec')).toHaveValue('10')
    await expect(page.getByTestId('total')).toHaveText('Total 04:00')
    // Rest-between-sets is hidden with a single set.
    await expect(page.getByTestId('restBetweenSetsSec')).toHaveCount(0)
  })

  test('Advanced reveals rest-between-sets and round labels', async ({ page }) => {
    await page.goto('/tabata')
    await expect(page.getByTestId('restBetweenSetsSec')).toHaveCount(0)
    await page.getByRole('button', { name: /Advanced/i }).click()
    await expect(page.getByTestId('restBetweenSetsSec')).toBeVisible()
    await expect(page.getByPlaceholder('Round 1')).toBeVisible()
  })

  test('total updates live as fields change', async ({ page }) => {
    await page.goto('/tabata')
    await page.getByTestId('workSec').fill('40')
    await page.getByTestId('rounds').fill('5')
    await page.getByTestId('prepareSec').fill('0')
    // 5 * (40 + 10) - trailing rest (10) = 240s = 4:00
    await expect(page.getByTestId('total')).toHaveText('Total 04:00')
  })

  test('clamps out-of-range values when starting', async ({ page }) => {
    await page.goto('/tabata')
    await page.getByTestId('workSec').fill('9999')
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page).toHaveURL(/\/workout$/)
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('tabata.config') || '{}'),
    )
    expect(stored.workSec).toBe(3600)
  })

  test('selecting a preset fills fields and highlights it', async ({ page }) => {
    await page.goto('/tabata')
    const preset = page.getByRole('button', { name: 'Gym 40/10 × 5', exact: true })
    await preset.click()
    await expect(page.getByTestId('workSec')).toHaveValue('40')
    await expect(page.getByTestId('rounds')).toHaveValue('5')
    await expect(preset).toHaveAttribute('aria-pressed', 'true')

    // Editing a field deselects it.
    await page.getByTestId('rounds').fill('6')
    await expect(preset).toHaveAttribute('aria-pressed', 'false')
  })

  test('deleting a built-in preset hides it (and stays hidden)', async ({ page }) => {
    await page.goto('/tabata')
    const chip = page.getByRole('button', { name: 'Sweat 30/30 × 10', exact: true })
    await expect(chip).toBeVisible()
    await chip.hover()
    await page.getByRole('button', { name: 'Delete Sweat 30/30 × 10' }).click()
    await expect(chip).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('button', { name: 'Sweat 30/30 × 10', exact: true })).toHaveCount(0)
  })

  test('starting records the config in Recent history (latest first)', async ({ page }) => {
    await page.goto('/tabata')
    await page.getByTestId('workSec').fill('33')
    await page.getByTestId('rounds').fill('4')
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page).toHaveURL(/\/workout$/)

    await page.goto('/tabata')
    await expect(page.getByRole('button', { name: '33/10 × 4', exact: true })).toBeVisible()
  })

  test('a Recent item can be saved as a named preset (default name prefilled)', async ({ page }) => {
    await page.goto('/tabata')
    await page.getByTestId('workSec').fill('33')
    await page.getByTestId('rounds').fill('4')
    await page.getByRole('button', { name: 'Start' }).click()
    await page.goto('/tabata')

    await page.getByRole('button', { name: 'Save 33/10 × 4' }).click()

    // The inline editor opens with the default label prefilled.
    const nameInput = page.getByTestId('preset-name')
    await expect(nameInput).toHaveValue('33/10 × 4')
    await nameInput.fill('My WOD')
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.getByRole('button', { name: 'My WOD', exact: true })).toBeVisible()
  })
})
