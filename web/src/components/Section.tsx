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
  className = '',
}: {
  label: string
  heading: string
  supporting?: string
  className?: string
}) {
  return (
    <header className={`mb-16 md:mb-24 ${className}`}>
      <Reveal>
        <p className="label mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-accent" aria-hidden="true" />
          {label}
        </p>
      </Reveal>

      <h2 className="max-w-[20ch] font-display text-h2 text-bone">
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
