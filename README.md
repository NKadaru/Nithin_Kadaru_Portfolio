# Nithin Kadaru — Portfolio

A premium, scroll-driven personal portfolio. The centrepiece is a **true 360°
hero**: a 3D subject whose rotation is driven directly by scroll position, with
the final frame landing exactly on the first.

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
| Fonts | Archivo · Inter · JetBrains Mono (self-hosted, no third-party requests) |
| Tests | Playwright (26 end-to-end) |
| Hosting | Cloudflare Pages (fully static) |

---

## Running it

> On Windows PowerShell use `npm.cmd` — the execution policy blocks npm's
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
npm run test:e2e   # Playwright (starts preview automatically)
```

---

## How the 360° hero works

Scroll progress maps linearly onto the subject's Y rotation:

```ts
group.rotation.y = progress * Math.PI * 2
```

That single line gives several properties for free:

- **Exact start/end match.** `0` and `2π` radians are the same orientation by
  definition, so the final frame is guaranteed identical to the first. A
  pre-rendered frame sequence can only approximate this.
- **Continuous at any scroll speed.** Nothing to step between, so no visible
  ticking on a fast flick.
- **Reversible.** Scrolling up decreases progress, which rotates backward.
- **Constant scale.** Scale is never written to, anywhere.
- **No autonomous motion.** Nothing moves unless the scroll position moves.

Pinning uses CSS `position: sticky` rather than GSAP's `pin`, which avoids the
injected pin-spacer element — a common source of layout shift and of scroll
height disagreements with Lenis.

Lenis is driven by GSAP's ticker rather than its own `requestAnimationFrame`
loop. Two independent loops produce one-frame disagreements between the scroll
position Lenis has applied and the one ScrollTrigger reads, which on a pinned
rotation reads as jitter.

### Swapping in a different 3D subject

`src/sections/hero/HeroSubject.tsx` is the only file that knows what is
rotating. Everything else — pinning, scroll mapping, loader, framing, tests —
is independent of it. The file carries full drop-in instructions.

Current subject is a **procedural stand-in** (coded geometry, no asset file).

Requirements for a real `.glb`:

- Binary glTF, single file, textures embedded
- Under ~2 MB after `npx gltf-transform optimize in.glb out.glb`
- Y-up, origin at the object's centre so it spins about its own axis
- PBR materials, no baked-in lighting
- Roughly `SUBJECT_HEIGHT` (4) units tall, or set `scale` to match

---

## Project layout

```
web/
├─ src/
│  ├─ content/content.ts     ← SINGLE SOURCE OF TRUTH for all copy and data
│  ├─ index.css              ← design tokens, type scale, base styles
│  ├─ lib/                   ← Lenis, GSAP registration, reduced-motion hook
│  ├─ components/            ← loader, navbar, cursor, reveal, section shells
│  └─ sections/
│     ├─ hero/               ← Hero, HeroCanvas (rotation driver), HeroSubject
│     └─ …                   ← About, Marquee, Work, Experience, Skills, …
├─ e2e/                      ← Playwright specs + OG image generator
└─ public/                   ← favicon, robots, sitemap, _headers, og image
```

**All visible copy lives in `src/content/content.ts`.** Components never
hardcode strings, so content changes don't touch markup.

---

## Content integrity

The content file enforces three rules:

1. **No invented metrics.** An unknown number is `null`. It renders as a
   dev-only TODO marker and is omitted entirely from production builds.
2. **No invented testimonials, clients or achievements.** Sections without real
   content are omitted rather than padded — see `omittedSections`.
3. Anything marked `TODO:` is awaiting a real answer.

`e2e/sections.spec.ts` asserts that no placeholder metrics and no TODO markers
reach a production build.

---

## Tests

```bash
npm run test:e2e
```

26 Playwright tests. The ones worth knowing about:

- **Rotation**: exactly one revolution; linear mapping through the 0/25/50/75/100%
  keyframes; reverses on scroll-up; zero scale drift; no drift once scrolling stops.
- **Framing**: subject occupies 75–85% of viewport height and stays centred,
  measured by projecting its bounding box through the camera (a WebGL canvas
  can't be pixel-read without `preserveDrawingBuffer`, which would cost
  performance on every frame just to enable a test).
- **Geometric text visibility**: section headings are checked for *rendered*
  visibility, not text content. A mask-based reveal can leave text present in
  the DOM but clipped out of view, and every content assertion still passes.
  That bug shipped once; it can't again.
- **Accessibility**: reduced-motion holds a static pose; skip link is the first
  tab stop; external links carry `rel="noopener"`.

WebGL in headless CI runs under SwiftShader — see `playwright.config.ts`.

---

## Accessibility

Semantic landmarks, a skip link, keyboard-operable navigation with Escape to
close the mobile menu, visible focus rings, `prefers-reduced-motion` honoured in
both JS and CSS (animation is replaced with instant state, not slowed down), and
the decorative canvas marked `aria-hidden`.

---

## License

Source is available to read. Content, copy and personal likeness are not
licensed for reuse.
