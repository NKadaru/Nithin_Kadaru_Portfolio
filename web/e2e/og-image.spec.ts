import { test } from '@playwright/test'

/**
 * Generates the Open Graph share image as a 1200×630 PNG.
 *
 * Why a PNG and not the SVG the scaffold shipped: LinkedIn, Slack and X do not
 * render SVG in link previews. Without a raster image the share card falls
 * back to a bare text link, which is the single most visible thing a recruiter
 * sees before they ever reach the site.
 *
 * Run with: npx playwright test e2e/og-image.spec.ts
 * Output:   public/og/og-image.png
 */
test('generate og:image', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 630 })

  // Reuse the real fonts from the dev/preview server so the card matches the
  // site's typography rather than approximating it with system fonts.
  await page.goto('/')
  await page.waitForFunction(() => document.fonts.status === 'loaded', null, {
    timeout: 20_000,
  })

  await page.setContent(
    `<!doctype html>
    <html>
      <head>
        <link rel="stylesheet" href="/src/index.css" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1200px; height: 630px;
            background: #08080a;
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 72px 80px;
            font-family: 'Inter Variable', Inter, system-ui, sans-serif;
            overflow: hidden;
          }
          .top { display: flex; align-items: center; justify-content: space-between; }
          .mark {
            font-family: 'Archivo Variable', Archivo, sans-serif;
            font-weight: 600; font-size: 30px; letter-spacing: -0.02em; color: #f2efe9;
          }
          .role {
            font-family: 'JetBrains Mono Variable', monospace;
            font-size: 15px; letter-spacing: 0.18em; text-transform: uppercase; color: #7d7a74;
          }
          h1 {
            font-family: 'Archivo Variable', Archivo, sans-serif;
            font-weight: 600; font-size: 96px; line-height: 0.95;
            letter-spacing: -0.04em; color: #f2efe9; max-width: 15ch;
          }
          .rule { width: 72px; height: 3px; background: #e4572e; margin-bottom: 36px; }
          .bottom {
            display: flex; align-items: flex-end; justify-content: space-between;
            font-family: 'JetBrains Mono Variable', monospace;
            font-size: 16px; letter-spacing: 0.1em; text-transform: uppercase; color: #b8b5ae;
          }
          .stack { color: #7d7a74; font-size: 14px; letter-spacing: 0.14em; }
        </style>
      </head>
      <body>
        <div class="top">
          <span class="mark">NITHIN KADARU</span>
          <span class="role">.NET Developer</span>
        </div>

        <div>
          <div class="rule"></div>
          <h1>I build scalable backend systems.</h1>
        </div>

        <div class="bottom">
          <span>Backend &amp; Full-Stack .NET Engineer</span>
          <span class="stack">C# · ASP.NET Core · SQL Server · AWS</span>
        </div>
      </body>
    </html>`,
    { waitUntil: 'load' },
  )

  await page.waitForTimeout(600)
  await page.screenshot({ path: 'public/og/og-image.png' })
})
