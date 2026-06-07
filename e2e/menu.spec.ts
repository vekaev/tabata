import { test, expect } from '@playwright/test'

test.describe('menu', () => {
  test('shows the three modes', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'CLOCK' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'TIMER' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'TABATA' })).toBeVisible()
    // The old "soon" placeholder modes are gone.
    await expect(page.getByText('FOR TIME')).toHaveCount(0)
    await expect(page.getByText('AMRAP')).toHaveCount(0)
  })

  test('navigates to each mode and back', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'TABATA' }).click()
    await expect(page).toHaveURL(/\/tabata$/)
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('link', { name: 'TIMER' }).click()
    await expect(page).toHaveURL(/\/timer$/)
    await page.getByRole('link', { name: 'Back' }).click()

    await page.getByRole('link', { name: 'CLOCK' }).click()
    await expect(page).toHaveURL(/\/clock$/)
  })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(overflow).toBe(false)
  })
})
