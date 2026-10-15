# Deploying to Cloudflare Pages

The site is **fully static** — no contact form backend (Q2.1), so no serverless
functions, no environment variables, no runtime. `npm run build` emits a `dist/`
folder of plain files.

---

## Build settings (both routes need these)

| Setting | Value |
|---|---|
| Framework preset | **None** (do not pick a preset — Vite 8 isn't matched correctly) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `web` |
| Node version | `24` — read automatically from `web/.nvmrc` |

---

## Route A — Git integration (recommended)

Auto-deploys on every push. Takes about ten minutes once.

### 1. Create the GitHub repo

```bash
cd C:\Nithin_CODE\premium-360-portfolio
git init
git add .
git commit -m "Premium 360 portfolio: hero + all sections"
git branch -M main
```

Create an empty repo at <https://github.com/new> named `portfolio`, then:

```bash
git remote add origin https://github.com/NKadaru/portfolio.git
git push -u origin main
```

> **Public or private?** Public is better for a job search — a recruiter or
> engineering manager can read the code, and this codebase demonstrates
> TypeScript, WebGL, testing and CI. Cloudflare can deploy from either.

### 2. Connect Cloudflare

1. Sign up free at <https://dash.cloudflare.com/sign-up> (no card required).
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorise GitHub, pick the `portfolio` repo.
4. Enter the build settings from the table above. **Root directory must be `web`.**
5. **Save and Deploy.**

First build takes 2–3 minutes. You get `https://<project>.pages.dev`.

### 3. Set the project name

The project name becomes the subdomain, so name it deliberately —
`nithin-kadaru` gives `https://nithin-kadaru.pages.dev`, which is what the SEO
tags are currently set to. If you choose something else, see
"Changing the URL" below.

---

## Route B — Wrangler CLI (fastest, no repo)

Live URL in roughly two minutes.

```bash
cd C:\Nithin_CODE\premium-360-portfolio\web
npm.cmd run build
npx.cmd wrangler pages deploy dist --project-name=nithin-kadaru
```

Opens a browser to authorise, then uploads. Re-run the same two commands to
redeploy. No CI, no automatic deploys — fine for getting a link onto LinkedIn
today, then switching to Route A later.

---

## Changing the URL

The canonical URL appears in **four** places and they must agree, or your SEO
tags and share previews point at a domain you don't control:

1. `web/src/content/content.ts` → `site.canonicalUrl`
2. `web/index.html` → `canonical`, `og:url`, `og:image`, `twitter:image`, and the JSON-LD `url`
3. `web/public/sitemap.xml` → `<loc>`
4. `web/public/robots.txt` → `Sitemap:`

Then rebuild and redeploy.

### Custom domain (optional, not free)

A domain costs roughly $10–15/year. Cloudflare charges nothing extra to attach
one: **Pages project → Custom domains → Set up a domain**. DNS is automatic if
the domain is registered with Cloudflare.

---

## After the first deploy — do these three things

### 1. Verify the deployed artefacts

```
https://<your-url>/                 → the site
https://<your-url>/og/og-image.png  → the 1200x630 share card
https://<your-url>/robots.txt       → should list the sitemap
```

### 2. Force LinkedIn to fetch a fresh preview

LinkedIn caches link previews aggressively and will keep serving a broken one.

Paste the URL into <https://www.linkedin.com/post-inspector/> and hit
**Inspect**. Confirm the card shows the title, description and image. Re-run it
after any change to the OG tags.

### 3. Attach it to your profile

Two places, use both:

- **Featured section** — Profile → Add profile section → Recommended →
  Add featured → Link. This renders the OG image as a visual card and is the
  one recruiters actually click.
- **Contact info → Website** — Profile → Contact info → edit → Website →
  add the URL, type "Portfolio". Appears in the sidebar.

---

## What CI does

`.github/workflows/ci.yml` runs on every push and PR to `main`: lint, build,
then the full Playwright suite (26 tests) including the WebGL hero rotation
checks under software rendering.

Cloudflare deploys independently of CI, so a red build does **not** block a
deploy. If you want that guarantee, switch off Cloudflare's automatic builds and
deploy from the workflow with `wrangler-action` instead.

---

## Free tier limits

| | Cloudflare Pages free |
|---|---|
| Bandwidth | **Unmetered** |
| Builds | 500/month |
| Files per site | 20,000 (this site has ~20) |
| Custom domains | 100, free to attach |
| Commercial use | **Allowed** |

The commercial-use point is why this is a safer default than Vercel's Hobby
tier, which is non-commercial only. Not an issue for a job-search portfolio
today, but it would become one if you ever sold services from the site.
