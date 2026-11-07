import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
const fixture = JSON.parse(
  await readFile(new URL('../../public/sample-workspace.json', import.meta.url), 'utf8'),
)
test('maximum accepted content remains usable at 320 px with portable JSON', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/')
  const value = structuredClone(fixture)
  value.name = 'W'.repeat(80)
  value.start = 'scene-0'
  value.scenes = Array.from({ length: 12 }, (_, i) => ({
    id: `scene-${i}`,
    title: 'T'.repeat(60),
    body: 'B'.repeat(1000),
    choices: Array.from({ length: 4 }, (_, c) => ({
      id: `choice-${c}`,
      label: 'L'.repeat(60),
      to: `scene-${(i + 1) % 12}`,
    })),
  }))
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.getByLabel('Workspace JSON', { exact: true }).fill(JSON.stringify(value))
  await page.getByRole('button', { name: 'Import workspace', exact: true }).click()
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: value.name, level: 1, exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByRole('button', { name: 'Add scene', exact: true })).toBeDisabled()
  await expect(page.locator('[data-scene]')).toHaveCount(12)
  await expect(page.getByRole('button', { name: 'Add choice', exact: true })).toBeDisabled()
  await expect(page.locator('[data-visitor=one] button').first()).toHaveText('L'.repeat(60))
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'JSON', exact: true }).click()
  const download = await pending,
    encoded = await readFile((await download.path())!, 'utf8')
  expect(JSON.parse(encoded).name).toBe(value.name)
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.getByLabel('Workspace JSON', { exact: true }).fill(encoded)
  await page.getByRole('button', { name: 'Import workspace', exact: true }).click()
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  await page.reload()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
