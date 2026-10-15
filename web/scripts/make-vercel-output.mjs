/**
 * Wraps the already-built `dist/` directory in Vercel's Build Output API v3
 * format so it can be deployed with `vercel deploy --prebuilt`.
 *
 * WHY THIS EXISTS
 *
 * The goal is that the bytes CI tested are the bytes that go live — one build,
 * verified once, deployed as-is. The alternatives both rebuild:
 *
 *   - Vercel's Git integration clones the commit and builds on its own
 *     infrastructure, discarding whatever CI produced.
 *   - `vercel build` runs the build again inside the deploy job.
 *
 * Neither deploys the artifact the tests actually ran against.
 *
 * HEADERS
 *
 * In prebuilt mode, `vercel.json` is not consulted — routing and headers come
 * from `.vercel/output/config.json`. Rather than duplicate the header policy
 * (and let the two drift apart silently), this script reads the `headers`
 * array out of `vercel.json` and translates it into Build Output API routes.
 * `vercel.json` stays the single source of truth.
 *
 * Usage:  node scripts/make-vercel-output.mjs
 * Input:  dist/, vercel.json
 * Output: .vercel/output/static/**, .vercel/output/config.json
 */

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(webRoot, 'dist')
const outputDir = resolve(webRoot, '.vercel', 'output')
const staticDir = resolve(outputDir, 'static')
const vercelJsonPath = resolve(webRoot, 'vercel.json')

function fail(message) {
  console.error(`\nmake-vercel-output: ${message}\n`)
  process.exit(1)
}

if (!existsSync(distDir)) {
  fail('dist/ not found. Run `npm run build` first, or download the CI artifact.')
}
if (!existsSync(vercelJsonPath)) {
  fail('vercel.json not found; cannot derive header configuration.')
}

const vercelConfig = JSON.parse(await readFile(vercelJsonPath, 'utf8'))

/**
 * Translate vercel.json `headers` entries into Build Output API routes.
 *
 * `continue: true` is essential — without it the first matching route wins and
 * request handling stops there, so the catch-all security-header route would
 * swallow every request and nothing would ever be served.
 */
const headerRoutes = (vercelConfig.headers ?? []).map((entry) => ({
  src: entry.source,
  headers: Object.fromEntries(entry.headers.map((h) => [h.key, h.value])),
  continue: true,
}))

const config = {
  version: 3,
  routes: [
    ...headerRoutes,
    // Serve the entry document for the root path.
    { handle: 'filesystem' },
  ],
}

// Rebuild from scratch so a stale previous output can never be deployed.
await rm(outputDir, { recursive: true, force: true })
await mkdir(staticDir, { recursive: true })
await cp(distDir, staticDir, { recursive: true })
await writeFile(resolve(outputDir, 'config.json'), `${JSON.stringify(config, null, 2)}\n`)

console.log('make-vercel-output: wrote .vercel/output')
console.log(`  static files from: ${distDir}`)
console.log(`  header routes:     ${headerRoutes.length}`)
for (const route of headerRoutes) {
  console.log(`    ${route.src} -> ${Object.keys(route.headers).join(', ')}`)
}
