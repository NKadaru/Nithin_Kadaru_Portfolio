import { expect, test, type Page } from '@playwright/test'

/**
 * SECTION CONTENT VERIFICATION
 *
 * The important assertion here is that headings are VISIBLY RENDERED, not
 * merely present in the DOM.
 *
 * A scroll-reveal built on a clipping mask can deadlock: if the observed
 * element starts translated outside its `overflow: clip` parent, it is clipped
 * out of the page, its intersection ratio is permanently 0, the reveal never
 * fires and the text never appears. Every text-content assertion still passes,
 * because the text IS in the DOM — just invisible. That shipped once already,
 * so it is checked geometrically from here on.
 */

const SECTIONS = [
  { id: 'about', heading: 'More than a .NET developer.' },
  { id: 'work', heading: 'Systems I’ve designed, built and shipped.' },
  { id: 'experience', heading: 'Where I’ve done the work.' },
  { id: 'skills', heading: 'The stack I work in.' },
  { id: 'how-i-work', heading: 'How I operate.' },
  { id: 'contact', heading: 'Have a role in mind? Let’s talk.' },
]

async function boot(page: Page): Promise<void> {
  await page.goto('/')
  await page.waitForFunction(() => window.__hero !== undefined, null, { timeout: 30_000 })
  await page.waitForTimeout(400)
}

async function scrollTo(page: Page, id: string): Promise<void> {
  await page.evaluate((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, id)
  // Allow the reveal transition (1s) to finish.
  await page.waitForTimeout(1500)
}

test.describe('Sections render', () => {
  for (const { id, heading } of SECTIONS) {
    test(`${id}: heading is visible and not clipped away`, async ({ page }) => {
      await boot(page)
      await scrollTo(page, id)

      const section = page.locator(`#${id}`)
      await expect(section).toBeVisible()

      const h2 = section.locator('h2').first()
      await expect(h2).toContainText(heading.slice(0, 18))

      /*
       * The real check. A mask-clipped heading has a DOM node and text
       * content, but its rendered glyphs sit outside the clip rect. Compare
       * the inner animated span's position against its clipping parent.
       */
      const geometry = await h2.evaluate((el) => {
        const mask = el.querySelector('.mask') as HTMLElement | null
        if (!mask) return { hasMask: false, offset: 0, maskHeight: el.clientHeight }
        const inner = mask.firstElementChild as HTMLElement | null
        if (!inner) return { hasMask: true, offset: 0, maskHeight: mask.clientHeight }

        const maskBox = mask.getBoundingClientRect()
        const innerBox = inner.getBoundingClientRect()
        return {
          hasMask: true,
          // How far the text has slid out of its clipping window.
          offset: Math.abs(innerBox.top - maskBox.top),
          maskHeight: maskBox.height,
        }
      })

      expect(geometry.maskHeight).toBeGreaterThan(8)
      // Text must have settled back inside the mask, not be parked below it.
      expect(
        geometry.offset,
        `heading text is offset ${geometry.offset}px from its clipping mask — reveal did not complete`,
      ).toBeLessThan(4)
    })
  }

  test('work section lists every project with problem and approach', async ({ page }) => {
    await boot(page)
    await scrollTo(page, 'work')

    const items = page.locator('#work ol > li')
    await expect(items).toHaveCount(4)

    // Each entry must carry real substance, not just a title.
    await expect(page.locator('#work').getByText('Problem', { exact: true })).toHaveCount(4)
    await expect(page.locator('#work').getByText('Approach', { exact: true })).toHaveCount(4)

    // Project titles must be visible, not clipped.
    const firstTitle = page.locator('#work h3').first()
    await expect(firstTitle).toBeVisible()
    await expect(firstTitle).toContainText('Billing Systems Translation Layer')
  })

  test('experience lists both roles with dates', async ({ page }) => {
    await boot(page)
    await scrollTo(page, 'experience')

    const roles = page.locator('#experience ol > li')
    await expect(roles).toHaveCount(2)
    await expect(page.locator('#experience')).toContainText('CTDI')
    await expect(page.locator('#experience')).toContainText('Tata Consultancy Services')
    await expect(page.locator('#experience')).toContainText("Oct '22")
  })

  test('contact exposes real, working links', async ({ page }) => {
    await boot(page)
    await scrollTo(page, 'contact')

    const email = page.locator('#contact a[href^="mailto:"]').first()
    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('href', /nithin12\.reddy@outlook\.com/i)

    const linkedin = page.locator('#contact a[href*="linkedin.com"]').first()
    await expect(linkedin).toBeVisible()

    const github = page.locator('#contact a[href*="github.com"]').first()
    await expect(github).toBeVisible()

    // External links must not leak referrer or allow tab-nabbing.
    await expect(linkedin).toHaveAttribute('rel', /noopener/)
    await expect(linkedin).toHaveAttribute('target', '_blank')
  })

  /**
   * Integrity guard: no fabricated metric may reach production. Unknown
   * values render as dev-only TODO markers, which must not appear in a
   * production build, and must never be replaced by invented numbers.
   */
  test('no fabricated metrics — unsupplied results stay empty in production', async ({
    page,
  }) => {
    await boot(page)
    await scrollTo(page, 'work')

    const workText = (await page.locator('#work').textContent()) ?? ''

    // The spec's placeholder stats belong to the original author of the brief.
    expect(workText).not.toContain('400+')
    expect(workText).not.toContain('40K+')
    expect(workText).not.toContain('9.10')

    // A production build must not surface development TODO chips.
    const todoChips = page.locator('#work [class*="border-dashed"]')
    const chipCount = await todoChips.count()
    expect(chipCount).toBe(0)
  })

  test('navbar links resolve to real sections', async ({ page }) => {
    await boot(page)

    const hrefs = await page.locator('header nav a[href^="#"]').evaluateAll((links) =>
      links.map((l) => l.getAttribute('href')!),
    )

    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      const target = page.locator(href)
      await expect(target, `${href} should exist on the page`).toHaveCount(1)
    }
  })

  test('footer renders wordmark and copyright', async ({ page }) => {
    await boot(page)
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
    )
    await page.waitForTimeout(800)

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('Built with curiosity + code')
    await expect(footer).toContainText('Nithin Kadaru')
  })
})
