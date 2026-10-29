import type { ReactNode } from 'react'
import { Reveal, RevealText } from './Reveal'

/**
 * Shared section shell. Keeps vertical rhythm, gutters and the hairline rule
 * between sections consistent so the page reads as one editorial system
 * rather than a stack of unrelated blocks (spec §4).
 */
export function Section({
  id,
  children,
  className = '',
  label,
  ariaLabel,
}: {
  id: string
  children: ReactNode
  className?: string
  label?: string
  ariaLabel?: string
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel ?? label}
      className={`gutter border-t border-hairline py-24 md:py-36 ${className}`}
    >
      {children}
    </section>
  )
}

/**
 * Editorial section header: a mono eyebrow label above a large display
 * heading, with the heading mask-revealing on scroll.
 */
export function SectionHeading({
  label,
  heading,
  supporting,
  compact = false,
  className = '',
}: {
  label: string
  heading: string
  supporting?: string
  /**
   * Smaller heading block: a larger eyebrow label, a smaller heading and less
   * space below. Used by the timeline sections (Experience, Education), where
   * the entries are the content and the heading only introduces them.
   */
  compact?: boolean
  className?: string
}) {
  const spacing = compact ? 'mb-8 md:mb-12' : 'mb-16 md:mb-24'
  // `!` because `.label` sets font-size in the same utilities layer and is
  // emitted later, so a plain size class would lose.
  const labelSize = compact ? 'mb-4 text-[0.875rem]!' : 'mb-6'
  const headingSize = compact
    ? 'max-w-[24ch] text-[clamp(1.25rem,calc(2.6vw_-_0.125rem),2rem)] leading-[1.1] tracking-[-0.02em]'
    : 'max-w-[20ch] text-h2'

  return (
    <header className={`${spacing} ${className}`}>
      <Reveal>
        <p className={`label ${labelSize} flex items-center gap-3`}>
          <span className="inline-block h-px w-8 bg-accent" aria-hidden="true" />
          {label}
        </p>
      </Reveal>

      <h2 className={`${headingSize} font-display text-bone`}>
        <RevealText delay={0.08}>{heading}</RevealText>
      </h2>

      {supporting ? (
        <Reveal delay={0.16}>
          <p className="mt-7 max-w-[52ch] text-lead text-bone-dim">{supporting}</p>
        </Reveal>
      ) : null}
    </header>
  )
}

/**
 * Development-only marker for content awaiting a real answer.
 *
 * Renders nothing in production, so an unanswered question can never ship as
 * visible filler — but stays loud during development so the gap is not
 * forgotten. This is the mechanism that lets `null` metrics be honest rather
 * than invented.
 */
export function TodoChip({ children }: { children: ReactNode }) {
  if (!import.meta.env.DEV) return null
  return (
    <span className="inline-flex items-center gap-1.5 border border-dashed border-accent/60 px-2.5 py-1 font-mono text-[0.625rem] tracking-wider text-accent uppercase">
      {children}
    </span>
  )
}
