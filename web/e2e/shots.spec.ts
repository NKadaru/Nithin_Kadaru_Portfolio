import { test } from '@playwright/test'

/**
 * Not an assertion suite — captures stills for visual review.
 * Run with: npx playwright test e2e/shots.spec.ts
 */

const SECTIONS = ['about', 'work', 'experience', 'skills', 'how-i-work', 'contact']

test('capture hero stills across the rotation', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => window.__hero !== undefined, null, { timeout: 30_000 })
  await page.waitForTimeout(600)

  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((frac) => {
      window.scrollTo({ top: window.innerHeight * 3 * frac, behavior: 'instant' })
    }, f)
    await page.waitForFunction(
      (expected) => Math.abs((window.__hero?.progress ?? -1) - expected) < 0.012,
      f,
      { timeout: 15_000 },
    )
    await page.waitForTimeout(500)
    await page.screenshot({
      path: `shots/hero-${String(Math.round(f * 100)).padStart(3, '0')}.png`,
    })
  }
})

test('capture each section', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => window.__hero !== undefined, null, { timeout: 30_000 })
  await page.waitForTimeout(800)

  for (const id of SECTIONS) {
    await page.evaluate((sectionId) => {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }, id)
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `shots/section-${id}.png` })
  }

  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
  )
  await page.waitForTimeout(1200)
  await page.screenshot({ path: 'shots/section-footer.png' })
})
