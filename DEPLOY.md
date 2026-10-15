# Deploying

The site is **fully static** — no contact form backend (Q2.1), so no serverless
functions, no environment variables, no runtime. `npm run build` emits a `dist/`
folder of plain files.

Current target: **Vercel**.

---

## Vercel project settings

Set these under **Project → Settings → Build and Deployment**.

| Setting | Value |
|---|---|
| **Root Directory** | **`web`** ← the one that breaks the build if wrong |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Node.js Version | 24.x |

The repo is a monorepo-style layout: the app lives in `web/`, not the root. If
Root Directory is left as `./`, Vercel finds no `package.json` and the build
fails immediately.

`web/vercel.json` already declares the framework, build command, output
directory, security headers and cache policy, so most of this is picked up
automatically — but **Root Directory must still be set in the dashboard**,
because Vercel has to find `vercel.json` before it can read it.

### Headers

`web/vercel.json` applies a strict Content-Security-Policy, HSTS,
`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and
`Permissions-Policy`, plus year-long immutable caching on `/assets/*` (safe,
since Vite content-hashes filenames) and no-cache on `index.html` so deploys
take effect immediately.

> `web/public/_headers` is the Cloudflare Pages equivalent. Vercel ignores it.
> It is kept so the project can move to Cloudflare without redoing the work —
> if you commit to Vercel permanently, it can be deleted.

---

## The URL appears in four places

They must agree, or the SEO tags and share previews point at a domain you do
not control:

1. `web/src/content/content.ts` → `site.canonicalUrl`
2. `web/index.html` → `canonical`, `og:url`, `og:image`, `twitter:image`, and the JSON-LD `url`
3. `web/public/sitemap.xml` → `<loc>`
4. `web/public/robots.txt` → `Sitemap:`

All four are currently set to:

```
https://nithin-kadaru-portfolio.vercel.app
```

**Confirm this matches what Vercel actually assigned.** The project slug is
derived from the repo name (`Nithin_Kadaru_Portfolio`), but Vercel will append a
suffix if the name is already taken. Check **Project → Domains**.

### Custom domain (optional, ~$10–15/year)

**Project → Settings → Domains → Add.** Vercel charges nothing to attach one
and provisions the TLS certificate automatically. Then update the four places
above.

---

## After the first deploy — do these four things

### 1. Verify the deployed artefacts

```
https://<your-url>/                 → the site loads, hero rotates on scroll
https://<your-url>/og/og-image.png  → the 1200x630 share card
https://<your-url>/robots.txt       → lists the sitemap
https://<your-url>/sitemap.xml      → one <url> entry
```

### 2. Confirm the security headers applied

```bash
curl -sI https://<your-url>/ | findstr /I "content-security-policy strict-transport"
```

If these are missing, `vercel.json` was not picked up — almost always because
Root Directory is not set to `web`.

### 3. Force LinkedIn to fetch a fresh preview

LinkedIn caches link previews aggressively and will keep serving a broken one.

Paste the URL into <https://www.linkedin.com/post-inspector/> and hit
**Inspect**. Confirm the card shows title, description and image. Re-run after
any change to the OG tags.

### 4. Attach it to your LinkedIn profile

Use both placements:

- **Featured** — Profile → Add profile section → Recommended → Add featured →
  Link. Renders the OG image as a visual card. This is the one recruiters click.
- **Contact info → Website** — Profile → Contact info → edit → Website → add
  the URL, type "Portfolio". Appears in the sidebar.

---

## Free tier caveat worth knowing

Vercel's **Hobby** plan is free (100 GB bandwidth) but is licensed for
**non-commercial use only**.

A job-search portfolio is personal use, so you are compliant today. If you ever
restore the Services section and sell work through the site, that becomes a
breach and you would need the Pro plan. Cloudflare Pages has no such
restriction and unmetered bandwidth — `web/public/_headers` is already written
for it if you want to move.

---

## CI

`.github/workflows/ci.yml` runs on every push and PR to `main`: lint, build,
then the 26 Playwright tests including the WebGL hero rotation checks under
software rendering (CI runners have no GPU).

**Vercel deploys independently of CI, so a failing test does not block a
deploy.** To gate deploys on tests, disable Vercel's Git auto-deploy and deploy
from the workflow with the Vercel CLI after the test step, using a
`VERCEL_TOKEN` repository secret.
