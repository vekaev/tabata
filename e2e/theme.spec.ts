import { test, expect } from '@playwright/test'

const accent = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
  )
const themeAttr = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.dataset.theme ?? 'auto')

test.describe('theme', () => {
  test('switches mode and persists across reload', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()

    await page.getByRole('button', { name: 'Dark' }).click()
    expect(await themeAttr(page)).toBe('dark')

    await page.reload()
    expect(await themeAttr(page)).toBe('dark') // applied by the pre-paint script

    // Back to auto removes the explicit override.
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'Auto' }).click()
    expect(await themeAttr(page)).toBe('auto')
  })

  test('changes accent color and persists', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'blue accent' }).click()
    expect(await accent(page)).toBe('#2563eb')

    await page.reload()
    expect(await accent(page)).toBe('#2563eb')
  })

  test('changes display font and persists', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'Bold 20' }).click()

    const font = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--font-display'),
      )
    expect(await font()).toContain('Bebas Neue')
    await page.reload()
    expect(await font()).toContain('Bebas Neue')
  })

  test('changes sound pack and persists', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()

    const pack = () =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('tabata.settings') || '{}').soundPack,
      )

    await page.getByRole('button', { name: 'Off', exact: true }).click()
    expect(await pack()).toBe('off')

    await page.getByRole('button', { name: 'Marimba' }).click()
    expect(await pack()).toBe('marimba')
  })

  test('switches language', async ({ page }) => {
    await page.goto('/tabata')
    // English default: the Start button.
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('combobox').selectOption('es')

    // Spanish: "Empezar", and <html lang> updates.
    await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('es')
  })
})
