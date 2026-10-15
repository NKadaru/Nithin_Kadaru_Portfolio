import { marqueeItems } from '../content/content'
import { useReducedMotion } from '../lib/useReducedMotion'

/**
 * MARQUEE (spec §12) — "slow, smooth and refined."
 *
 * CSS animation on a duplicated track rather than a JS loop: it runs on the
 * compositor, costs no main-thread work, and cannot stutter when the hero's
 * WebGL context or ScrollTrigger is busy (spec §29 "prevent scroll jank").
 *
 * The track is rendered twice and translated by exactly -50%, which makes the
 * wrap point seamless.
 *
 * Under reduced motion it renders as a static, non-scrolling row.
 */
export function Marquee() {
  const reducedMotion = useReducedMotion()

  return (
    <section
      aria-label="Areas of focus"
      className="overflow-clip border-t border-hairline py-10 md:py-14"
    >
      {reducedMotion ? (
        <ul className="gutter flex flex-wrap items-center gap-x-8 gap-y-3">
          {marqueeItems.map((item) => (
            <li key={item} className="label text-bone-dim">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="flex w-max items-center"
          style={{ animation: 'marqueeScroll 48s linear infinite' }}
        >
          {/* Two identical tracks; aria-hidden on the clone so it is not
              announced twice by a screen reader. */}
          <MarqueeTrack />
          <MarqueeTrack ariaHidden />
        </div>
      )}

      <style>{`
        @keyframes marqueeScroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </section>
  )
}

function MarqueeTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      {marqueeItems.map((item) => (
        <li key={item} className="flex items-center">
          <span className="px-8 font-display text-[clamp(1.5rem,3.2vw,2.5rem)] tracking-[-0.02em] whitespace-nowrap text-bone-dim md:px-12">
            {item}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        </li>
      ))}
    </ul>
  )
}
