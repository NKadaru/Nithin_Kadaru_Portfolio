# Nithin Kadaru — Portfolio

A premium, scroll-driven personal portfolio. The centrepiece is a
**scroll-synchronised 360° WebGL hero**: a real 3D portrait object whose
rotation is driven directly by scroll position, with the final orientation
landing exactly on the first.

**Live:** <https://nithin-kadaru-portfolio.vercel.app>

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 · TypeScript · Vite 8 |
| Styling | Tailwind CSS 4 (`@theme` design tokens) |
| 3D | Three.js · React Three Fiber · drei |
| Scroll motion | GSAP ScrollTrigger · Lenis |
| UI motion | Framer Motion |
| Icons | Lucide React |
| Fonts | Archivo · Inter · JetBrains Mono (self-hosted) |
| Tests | Playwright (28 CI behavioural tests) |
| Hosting | Vercel (fully static, deployment gated by GitHub Actions) |

---

## Running it

> On Windows PowerShell use `npm.cmd` — the execution policy may block npm's
> PowerShell shim.

```bash
cd web
npm ci
npm run dev        # http://localhost:5173
```

```bash
npm run build      # typecheck + production build to dist/
npm run lint       # oxlint
npm run preview    # serve the production build on :4173
npm run test:e2e   # all Playwright specs; starts preview automatically
```

---

## How the 360° hero works

Scroll progress maps linearly onto the subject's Y rotation:

```ts
group.rotation.y = progress * Math.PI * 2
```

That mapping provides:

- **Exact start/end match.** `0` and `2π` radians are the same orientation.
- **Continuous movement.** There is no frame sequence to step through.
- **Reversibility.** Scrolling upward decreases progress and rotates backward.
- **Constant scale.** Scroll never changes the rotating group's scale.
- **No autonomous motion.** The object moves only when scroll position moves.

Pinning uses CSS `position: sticky` instead of GSAP's `pin`, avoiding an
injected pin-spacer and its potential layout shift. Lenis is driven by GSAP's
ticker so smooth scrolling and ScrollTrigger read the same frame state.

The Three.js tree is lazy-loaded, device pixel ratio is capped, and the render
loop pauses after the hero leaves the viewport. Reduced-motion users receive a
static three-quarter pose.

### Portrait GLB

`web/src/sections/hero/HeroSubject.tsx` remains the only component that knows
what rotates. It now loads:

```text
web/public/models/nithin-portrait.glb
```

The model was generated locally from `IMG_3511.JPG` and is approximately
148 KB. It contains:

- A cropped 768×1482 JPEG embedded inside the GLB
- A gently curved portrait surface
- A shallow dark backing and visible edge depth
- An unlit photo material (`KHR_materials_unlit`) to preserve source colours
- A centred origin and calibrated scale for the existing hero framing

A single photograph cannot describe the unseen sides of a person. This asset is
therefore intentionally a three-dimensional portrait object, not a fabricated
full-body scan. During the complete revolution, the front photograph, curved
edge and backing rotate through view.

### Regenerating or replacing the portrait

The reproducible converter is `web/scripts/create-portrait-glb.mjs`. It uses the
project's installed Playwright Chromium browser for local JPEG decoding and
never uploads the source image.

From `web/`:

```bash
node scripts/create-portrait-glb.mjs "C:\path\to\portrait.jpg"
```

The default output is `public/models/nithin-portrait.glb`. An optional second
argument can specify another output file:

```bash
node scripts/create-portrait-glb.mjs "C:\path\to\portrait.jpg" "public\models\portrait.glb"
```

The crop ratios in the converter are tuned for `IMG_3511.JPG`; adjust them for
a differently composed photograph. If replacing the generated asset with a
scanned model, keep it Y-up, centred on its rotation axis, self-contained, and
close to four world units tall. Re-run the hero Playwright suite after changing
its geometry or scale.

The CSP permits `blob:` under both `img-src` and `connect-src` because
GLTFLoader exposes the embedded texture through a temporary browser blob URL
and loads it with the Fetch API.

---

## Project layout

```text
web/
├─ src/
│  ├─ content/content.ts     ← single source of truth for copy and data
│  ├─ index.css              ← design tokens, type scale, base styles
│  ├─ lib/                   ← Lenis, GSAP registration, reduced-motion hook
│  ├─ components/            ← loader, navbar, cursor, reveal, section shells
│  └─ sections/
│     ├─ hero/               ← pinning, rotation driver, GLB subject seam
│     └─ …                   ← About, Work, Experience, Skills, Contact, …
├─ public/
│  ├─ models/                ← self-contained portrait GLB
│  ├─ og/ and icons/         ← social and application images
│  └─ _headers               ← optional Cloudflare-equivalent headers
├─ scripts/
│  ├─ create-portrait-glb.mjs
│  └─ make-vercel-output.mjs
├─ e2e/                      ← behavioural, visual-capture and image-generator specs
├─ vercel.json               ← Vercel build settings and security headers
└─ playwright.config.ts
```

**All visible copy lives in `src/content/content.ts`.** Components do not embed
portfolio claims directly, so content changes remain separate from markup.

---

## Content integrity

The content file enforces three rules:

1. **No invented metrics.** An unknown number is `null`; it appears as a
   development-only TODO marker and is omitted from production builds.
2. **No invented testimonials, clients or achievements.** Sections without real
   content are omitted rather than padded — see `omittedSections`.
3. Anything marked `TODO:` is awaiting a confirmed answer.

`e2e/sections.spec.ts` asserts that placeholder metrics and TODO markers never
reach a production build.

---

## Tests

The CI verification job runs 28 behavioural Playwright tests from
`hero.spec.ts` and `sections.spec.ts`:

- **Rotation:** exactly one revolution; linear 0/25/50/75/100% mapping;
  reversibility; constant scale; no drift after scrolling stops.
- **Framing:** projected subject height stays within the intentional 64–74%
  viewport band and remains horizontally centred throughout the revolution.
- **Layout:** the canvas fills the viewport and hero/section text is rendered,
  visible and not clipped.
- **Content:** expected projects and roles render, links resolve, and unknown
  metrics stay out of production.
- **Accessibility:** reduced motion is static and the skip link is the first tab
  stop.

WebGL runs under SwiftShader on headless CI. `shots.spec.ts` and
`og-image.spec.ts` are auxiliary capture/generator specs and are not part of the
28-test deployment gate.

---

## Deployment

Production is deployed to Vercel by `.github/workflows/ci.yml`.

1. A push or pull request to `main` runs install, lint, build and the 28
   behavioural Playwright tests.
2. Pull requests stop after verification and never deploy.
3. A successful push to `main` uploads the tested `dist/` artifact.
4. The gated deploy job creates Vercel's output wrapper, replaces its static
   payload with that tested artifact, and deploys it to production.
5. CI verifies that the public production alias returns the application shell.

Vercel Git deployment for `main` is disabled in `web/vercel.json`, ensuring a
failed verification cannot be bypassed by an independent automatic deployment.
Security headers are defined in that file; `web/public/_headers` is retained as
a Cloudflare Pages equivalent but is ignored by Vercel.

---

## Accessibility

The site provides semantic landmarks, a skip link, keyboard-operable navigation
with Escape handling, visible focus rings, `prefers-reduced-motion` support in
both JS and CSS, and a decorative canvas marked `aria-hidden`.

---

## License

Source is available to read. Content, copy and personal likeness are not
licensed for reuse.
