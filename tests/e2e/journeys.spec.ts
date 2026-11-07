import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
test('nearest typed providers keep the two visitor paths independent through choices and backtracking', async ({
  page,
}) => {
  await page.goto('/')
  const one = page.locator('[data-visitor="one"]'),
    two = page.locator('[data-visitor="two"]')
  await one.getByRole('button', { name: 'Take the river path', exact: true }).click()
  await expect(one.locator('[data-ui="scene-title"]')).toHaveText('Beside the water')
  await expect(two.locator('[data-ui="scene-title"]')).toHaveText('A free morning')
  await two.getByRole('button', { name: 'Visit the little market', exact: true }).click()
  await expect(two.locator('[data-ui="scene-title"]')).toHaveText('A few useful things')
  await one.getByRole('button', { name: 'Walk to the garden', exact: true }).click()
  await expect(one).toContainText('end of this path')
  await expect(two.locator('[data-ui="journey-path"]')).toHaveText('begin → market')
  await one.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(one.locator('[data-ui="scene-title"]')).toHaveText('Beside the water')
  await expect(two.locator('[data-ui="scene-title"]')).toHaveText('A few useful things')
})
test('saved scene edits restart both live contexts and referenced scenes cannot be deleted', async ({
  page,
}) => {
  await page.goto('/')
  const one = page.locator('[data-visitor="one"]'),
    two = page.locator('[data-visitor="two"]')
  await one.getByRole('button', { name: 'Take the river path', exact: true }).click()
  await two.getByRole('button', { name: 'Visit the little market', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Scene title', exact: true })
    .fill('A newly framed beginning')
  await page.getByRole('button', { name: 'Save scene', exact: true }).click()
  await expect(one.locator('[data-ui="scene-title"]')).toHaveText('A newly framed beginning')
  await expect(two.locator('[data-ui="scene-title"]')).toHaveText('A newly framed beginning')
  await page.locator('[data-scene="garden"]').click()
  await expect(page.getByRole('button', { name: 'Remove scene', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Add scene', exact: true }).click()
  await expect(page.locator('[data-scene]')).toHaveCount(7)
  await expect(
    page.getByText('3 endings · 1 unreachable scenes', { exact: true }),
  ).not.toBeVisible()
  await expect(page.getByText('4 endings · 1 unreachable scenes', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Remove scene', exact: true }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.locator('[data-scene]')).toHaveCount(7)
  await page.getByRole('button', { name: 'Remove scene', exact: true }).click()
  await page
    .locator('dialog[open]')
    .getByRole('button', { name: 'Remove scene', exact: true })
    .click()
  await expect(page.locator('[data-scene]')).toHaveCount(6)
})
test('cycles remain usable but one visitor stops after fifty decisions without affecting the other', async ({
  page,
}) => {
  await page.goto('/')
  const value = {
    version: 1,
    name: 'A small loop',
    start: 'loop',
    scenes: [
      {
        id: 'loop',
        title: 'Another turn',
        body: 'Try the same path.',
        choices: [{ id: 'again', label: 'Again', to: 'loop' }],
      },
    ],
  }
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.getByLabel('Workspace JSON', { exact: true }).fill(JSON.stringify(value))
  await page.getByRole('button', { name: 'Import workspace', exact: true }).click()
  const one = page.locator('[data-visitor="one"]'),
    two = page.locator('[data-visitor="two"]')
  for (let i = 0; i < 50; i++) await one.getByRole('button', { name: 'Again', exact: true }).click()
  await expect(one.getByRole('button', { name: 'Again', exact: true })).toBeDisabled()
  await expect(one).toContainText('50 decisions')
  await expect(two.getByRole('button', { name: 'Again', exact: true })).toBeEnabled()
  await one.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(one.getByRole('button', { name: 'Again', exact: true })).toBeEnabled()
  await one.getByRole('button', { name: 'Restart path', exact: true }).click()
  await expect(one.locator('[data-ui="journey-path"]')).toHaveText('loop')
})
test('editing choices and downloading Markdown preserve the fixed preview frame and complete graph', async ({
  page,
}) => {
  await page.goto('/')
  const frame = page.locator('[data-ui="journey-preview"]'),
    before = (await frame.boundingBox())!.height
  await page.getByRole('textbox', { name: 'Choice 1 label', exact: true }).fill('A [quieter] way')
  await page.getByRole('button', { name: 'Save scene', exact: true }).click()
  await expect(
    page
      .locator('[data-visitor="one"]')
      .getByRole('button', { name: 'A [quieter] way', exact: true }),
  ).toBeVisible()
  expect((await frame.boundingBox())!.height).toBe(before)
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Markdown', exact: true }).click()
  const download = await pending,
    md = await readFile((await download.path())!, 'utf8')
  expect(download.suggestedFilename()).toMatch(/^CH-[A-F0-9]{8}\.md$/)
  expect(md).toContain('A \\[quieter\\] way → Beside the water (river)')
  expect(md).toContain('End of this path.')
  expect(md).toContain('CodeSculptor')
})
