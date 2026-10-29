import { expect, test, type Page } from '@playwright/test'

/**
 * HERO MECHANISM VERIFICATION (spec §7, §8, §26, §32, §33)
 *
 * These assertions cover the claims that cannot be verified by reading source:
 * they are statements about runtime behaviour across scroll positions.
 *
 * Reads `window.__hero`, published each frame by the Rotator in HeroCanvas.tsx.
 */

const TAU = Math.PI * 2

/** Dismiss the loader and wait for the hero canvas to be live. */
async function bootHero(page: Page): Promise<void> {
  await page.goto('/')
  // Loader resolves on real readiness signals, including the Three.js chunk.
  await page.waitForFunction(() => window.__hero !== undefined, null, { timeout: 30_000 })
  await page.waitForTimeout(300)
}

/**
 * Scroll to a fraction of the hero's own scroll distance and let the
 * Lenis → GSAP → useFrame pipeline settle.
 *
 * The hero section is `100vh + SCROLL_VH`; the 360° maps across the section's
 * ScrollTrigger range (start top-top → end bottom-bottom), which equals
 * SCROLL_VH. Keep in sync with SCROLL_VH in src/sections/hero/Hero.tsx.
 */
const HERO_SCROLL_VH = 1 // SCROLL_VH = 100vh

async function scrollToHeroProgress(page: Page, fraction: number): Promise<void> {
  await page.evaluate(
    ({ f, vh }) => {
      const scrollDistance = window.innerHeight * vh
      window.scrollTo({ top: scrollDistance * f, behavior: 'instant' })
    },
    { f: fraction, vh: HERO_SCROLL_VH },
  )
  // Lenis eases toward the target; poll until progress settles.
  await page.waitForFunction(
    (expected) => {
      const hero = window.__hero
      if (!hero) return false
      return Math.abs(hero.progress - expected) < 0.012
    },
    fraction,
    { timeout: 15_000 },
  )
}

async function readHero(page: Page) {
  return page.evaluate(() => window.__hero!)
}

test.describe('Hero 360° rotation', () => {
  test('starts at exactly 0° with zero scroll', async ({ page }) => {
    await bootHero(page)
    const hero = await readHero(page)
    expect(hero.progress).toBeCloseTo(0, 2)
    expect(hero.rotationY).toBeCloseTo(0, 3)
  })

  /**
   * SPEC §7: "Final frame must match initial frame."
   * rotationY at progress 1 must be exactly one full revolution, which is the
   * same orientation as 0. This is the single most important assertion in the
   * suite — it is the requirement a frame sequence can only approximate.
   */
  test('completes exactly one revolution — final orientation equals the first', async ({
    page,
  }) => {
    await bootHero(page)
    await scrollToHeroProgress(page, 1)

    const hero = await readHero(page)
    expect(hero.progress).toBeGreaterThan(0.985)
    expect(hero.revolutions).toBeCloseTo(1, 2)

    // Orientation modulo a full turn must land back at the start.
    const orientation = ((hero.rotationY % TAU) + TAU) % TAU
    const distanceFromStart = Math.min(orientation, TAU - orientation)
    expect(distanceFromStart).toBeLessThan(0.1)
  })

  /**
   * SPEC §7 sequence: 0% front → 25% side → 50% back → 75% opposite side →
   * 100% front. Verifies the mapping is linear across the whole range rather
   * than eased or clamped in the middle.
   */
  test('maps scroll linearly through the §7 keyframe sequence', async ({ page }) => {
    await bootHero(page)

    const checkpoints = [
      { fraction: 0.25, label: 'side' },
      { fraction: 0.5, label: 'back' },
      { fraction: 0.75, label: 'opposite side' },
    ]

    for (const { fraction, label } of checkpoints) {
      await scrollToHeroProgress(page, fraction)
      const hero = await readHero(page)
      const expectedRotation = fraction * TAU
      expect(
        Math.abs(hero.rotationY - expectedRotation),
        `at ${fraction * 100}% (${label}) rotation should be ${expectedRotation.toFixed(3)} rad`,
      ).toBeLessThan(0.12)
    }
  })

  /** SPEC §8: "Scroll down rotates forward; scroll up rotates backward." */
  test('reverses when scrolling back up', async ({ page }) => {
    await bootHero(page)

    await scrollToHeroProgress(page, 0.6)
    const forward = await readHero(page)

    await scrollToHeroProgress(page, 0.3)
    const reversed = await readHero(page)

    expect(reversed.rotationY).toBeLessThan(forward.rotationY)
    expect(reversed.rotationY).toBeCloseTo(0.3 * TAU, 1)
  })

  /** SPEC §8: "No zoom, shake, jumps, perspective changes or scale changes." */
  test('never changes scale during rotation', async ({ page }) => {
    await bootHero(page)

    const scaleAt = async (fraction: number) => {
      await scrollToHeroProgress(page, fraction)
      const hero = await readHero(page)
      return hero.scale
    }

    const atStart = await scaleAt(0)
    const atQuarter = await scaleAt(0.25)
    const atHalf = await scaleAt(0.5)
    const atEnd = await scaleAt(1)

    expect(atStart).toBe(1)
    expect(atQuarter).toBe(atStart)
    expect(atHalf).toBe(atStart)
    expect(atEnd).toBe(atStart)
  })

  /**
   * SPEC §8: rotation must be "directly synchronized with scroll" — i.e. it
   * must not drift or continue moving once scrolling stops. Catches any
   * accidental auto-spin or unsettled easing.
   */
  test('does not drift when scrolling stops', async ({ page }) => {
    await bootHero(page)
    await scrollToHeroProgress(page, 0.45)

    const first = await readHero(page)
    await page.waitForTimeout(1200)
    const second = await readHero(page)

    expect(Math.abs(second.rotationY - first.rotationY)).toBeLessThan(0.002)
  })
})

test.describe('Hero accessibility & layout', () => {
  /** SPEC §31: reduced motion replaces animation with a static state. */
  test('holds a static pose under prefers-reduced-motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()

    await bootHero(page)

    const before = await readHero(page)
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 2, behavior: 'instant' }))
    await page.waitForTimeout(600)
    const after = await readHero(page)

    // Rotation must be identical regardless of scroll position.
    expect(after.rotationY).toBeCloseTo(before.rotationY, 5)
    await context.close()
  })

  /** SPEC §6: subject occupies 75–85% of viewport height. */
  test('renders a full-viewport hero canvas with no layout shift', async ({ page }) => {
    await bootHero(page)

    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    const viewport = page.viewportSize()!
    expect(box!.height).toBeGreaterThanOrEqual(viewport.height - 2)
    expect(box!.width).toBeGreaterThanOrEqual(viewport.width - 2)
  })

  /**
   * Subject framing.
   *
   * Spec §6 asks for 75–85% of viewport height. Nithin asked for the subject
   * smaller, so the target is now ~69% (measured 0.6875 at distance 11.6).
   * These bounds assert the ACTUAL design intent rather than a spec figure the
   * design deliberately departs from — see the note on FRAMING in
   * HeroCanvas.tsx for how to restore spec compliance.
   *
   * Read from the projected bounding box measured inside the scene. Pixel
   * sampling was the obvious approach but a WebGL canvas cannot be read back
   * without `preserveDrawingBuffer`, which would cost performance on every
   * frame in production purely to enable a test.
   */
  test('subject fills ~69% of viewport height and is horizontally centred', async ({
    page,
  }) => {
    await bootHero(page)

    const hero = await readHero(page)

    expect(
      hero.heightFraction,
      `subject height was ${(hero.heightFraction * 100).toFixed(1)}% of viewport`,
    ).toBeGreaterThanOrEqual(0.64)
    expect(hero.heightFraction).toBeLessThanOrEqual(0.74)

    // "Perfectly centered" — within 1% of the viewport's horizontal centre.
    expect(hero.centreOffset).toBeLessThan(0.01)
  })

  /**
   * SPEC §8: the subject must stay centred and constant through the whole
   * revolution, not just at the start.
   */
  test('framing holds steady across the full revolution', async ({ page }) => {
    await bootHero(page)
    const atStart = await readHero(page)

    for (const fraction of [0.33, 0.66, 1]) {
      await scrollToHeroProgress(page, fraction)
      const hero = await readHero(page)
      expect(hero.heightFraction).toBeCloseTo(atStart.heightFraction, 5)
      expect(hero.centreOffset).toBeCloseTo(atStart.centreOffset, 5)
    }
  })

  /** SPEC §9: hero text must not cover the subject. */
  test('hero headline stays clear of the subject column', async ({ page }) => {
    await bootHero(page)

    const viewport = page.viewportSize()!
    const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(heading).not.toBeNull()

    // The subject owns the centre third; the headline must stay left of it.
    const centreThirdStart = viewport.width / 3
    expect(heading!.x + heading!.width).toBeLessThanOrEqual(centreThirdStart + 8)
  })

  /**
   * Regression guard: the headline was being clipped because a `ch`-based
   * max-width sat on a 16px wrapper instead of the heading, so `16ch`
   * resolved to ~128px and cut every line mid-word. Rendered text being
   * wider than its clipping container is invisible to a text-content
   * assertion, so it is checked geometrically.
   */
  test('hero headline is not clipped by its container', async ({ page }) => {
    await bootHero(page)

    const clipping = await page.evaluate(() => {
      const h1 = document.querySelector('h1')
      if (!h1) return null
      // The .mask wrapper is the element with overflow: clip.
      const mask = h1.querySelector('.mask') as HTMLElement | null
      const inner = mask?.firstElementChild as HTMLElement | null
      if (!mask || !inner) return null
      return {
        maskWidth: mask.clientWidth,
        innerWidth: inner.scrollWidth,
        headingWidth: h1.clientWidth,
      }
    })

    expect(clipping).not.toBeNull()
    // Horizontal overflow of the clipped wrapper means visibly cut glyphs.
    expect(
      clipping!.innerWidth,
      `inner text ${clipping!.innerWidth}px overflows mask ${clipping!.maskWidth}px`,
    ).toBeLessThanOrEqual(clipping!.maskWidth + 1)
  })

  /** SPEC §9/§10: hero text and scroll hint are present. */
  test('shows hero typography and the scroll indicator', async ({ page }) => {
    await bootHero(page)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'full-stack enterprise systems',
    )
    await expect(page.getByText('SCROLL TO EXPLORE')).toBeVisible()
    await expect(page.getByRole('link', { name: /view my work/i })).toBeVisible()
  })

  /** Skip link is the first tab stop (spec §31). */
  test('exposes a skip link as the first tab stop', async ({ page }) => {
    await bootHero(page)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused()
  })
})
