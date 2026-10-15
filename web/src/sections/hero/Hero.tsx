import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { hero } from '../../content/content'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

// Code-split: the Three.js chunk is fetched during the loader (spec §28, §29)
// rather than blocking first paint.
const HeroCanvas = lazy(() =>
  import('./HeroCanvas').then((m) => ({ default: m.HeroCanvas })),
)

/**
 * Scroll distance over which the 360° completes (Q3.4 default).
 * 300vh of travel after the initial 100vh viewport — deliberate without
 * feeling like a drag.
 */
const SCROLL_VH = 300

export function Hero() {
  const reducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const progressRef = useRef<number>(0)
  const hintRef = useRef<HTMLDivElement>(null)

  /** Render loop runs only while the hero is on screen. */
  const [active, setActive] = useState(true)

  // ── Scroll → rotation progress ───────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) {
      progressRef.current = 0
      return
    }

    const section = sectionRef.current
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      // scrub:true ties progress to scroll position with no lag of its own.
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress
      },
      // Keep the GPU idle once the hero is behind us.
      onToggle: (self) => setActive(self.isActive),
    })

    return () => trigger.kill()
  }, [reducedMotion])

  // ── Scroll hint fades out as soon as scrolling begins (spec §10) ─────────
  useEffect(() => {
    if (reducedMotion) return
    const hint = hintRef.current
    const section = sectionRef.current
    if (!hint || !section) return

    const tween = gsap.fromTo(
      hint,
      { autoAlpha: 1 },
      {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          // Gone within the first 12% of the hero's scroll distance.
          end: `${window.innerHeight * 0.4} top`,
          scrub: true,
        },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      id="hero"
      // Tall section: the sticky child pins while this scrolls past.
      style={{ height: `calc(100vh + ${SCROLL_VH}vh)` }}
      className="relative"
      aria-label="Introduction"
    >
      {/*
        PINNING (spec §8) via CSS sticky rather than GSAP's pin.
        Sticky avoids the pin-spacer element GSAP injects, which is a common
        source of layout shift (spec §29 forbids it) and of scroll-height
        disagreements with Lenis.
      */}
      <div className="sticky top-0 h-screen w-full overflow-clip">
        {/* ── The 360° subject ── */}
        <div className="absolute inset-0">
          <Suspense fallback={<HeroFallback />}>
            <HeroCanvas
              progressRef={progressRef}
              active={active}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </div>

        {/*
          Vignette: darkens the frame edges so hero type stays legible over the
          subject without a flat scrim. Pointer-events off so it never
          intercepts clicks.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 78% 62% at 50% 45%, transparent 38%, rgba(8,8,10,0.72) 100%)',
          }}
        />

        {/* ── Hero typography (spec §9) ──
            Laid out as a grid with an empty centre column reserved for the
            subject, so text can never overlap it at any viewport width. The
            subject owns the middle third; type occupies the outer thirds. */}
        <div className="pointer-events-none absolute inset-0 grid grid-rows-[auto_1fr_auto] gutter py-24 md:py-28">
          {/* Eyebrow — top left */}
          <motion.p
            className="label"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {hero.label}
          </motion.p>

          {/* Middle row stays empty — this is the subject's space. */}
          <div aria-hidden="true" />

          {/* Bottom row: headline left, supporting right, centre left clear. */}
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_22%_minmax(0,1fr)] md:items-end md:gap-6">
            <div className="max-w-[26rem]">
              {/*
                max-width in `ch` must live on the heading itself, not the
                wrapper: `ch` resolves against the element's OWN font-size, so
                on a 16px wrapper 16ch is ~128px and clips the display type.
              */}
              <h1 className="max-w-[13ch] font-display text-[clamp(1.875rem,3.4vw,3rem)] leading-[1.0] tracking-[-0.03em] text-bone">
                <span className="mask">
                  <motion.span
                    className="block"
                    initial={reducedMotion ? false : { y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {hero.headline}
                  </motion.span>
                </span>
              </h1>

              {/* CTAs — pointer events re-enabled on the interactive layer only */}
              <motion.div
                className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3"
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <a
                  href={hero.primaryCta.href}
                  data-cursor="view"
                  className="inline-flex items-center gap-2 border border-bone bg-bone px-6 py-3 font-mono text-[0.65rem] tracking-[0.14em] text-void uppercase transition-colors duration-500 hover:bg-transparent hover:text-bone"
                >
                  {hero.primaryCta.label}
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center gap-2 border border-hairline-strong px-6 py-3 font-mono text-[0.65rem] tracking-[0.14em] text-bone-dim uppercase transition-colors duration-500 hover:border-bone hover:text-bone"
                >
                  {hero.secondaryCta.label}
                </a>
              </motion.div>
            </div>

            {/* Reserved centre gutter — keeps the subject's base clear. */}
            <div aria-hidden="true" className="hidden md:block" />

            {/* Supporting line — bottom right */}
            <motion.p
              className="max-w-[34ch] text-sm leading-relaxed text-bone-dim md:justify-self-end md:text-right"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {hero.supporting}
            </motion.p>
          </div>
        </div>

        {/* ── Scroll indicator (spec §10) ──
            Bottom-right rather than bottom-centre: centred, it lands on the
            subject's plinth, where muted grey text on lit metal fails
            contrast. The right gutter is clear at every rotation angle. */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute right-[clamp(1.25rem,5vw,6rem)] bottom-7 flex items-center gap-2.5"
        >
          <span className="label text-[0.625rem]">{hero.scrollHint}</span>
          <ArrowDown
            className="h-3.5 w-3.5 text-muted"
            style={
              reducedMotion ? undefined : { animation: 'heroArrow 2.4s ease-in-out infinite' }
            }
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Keyframes kept local to the hero rather than global. */}
      <style>{`
        @keyframes heroArrow {
          0%, 100% { transform: translateY(0); opacity: 0.55; }
          50%      { transform: translateY(5px); opacity: 1; }
        }
      `}</style>
    </section>
  )
}

/**
 * Shown while the Three.js chunk loads (spec §28 "graceful fallback").
 * Deliberately not a spinner — a quiet placeholder reads as intentional at
 * this scale, and the loader has already covered the heavy wait.
 */
function HeroFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-void" aria-hidden="true">
      <div className="h-[46vh] w-[14vw] min-w-28 border border-hairline bg-surface/40" />
    </div>
  )
}
