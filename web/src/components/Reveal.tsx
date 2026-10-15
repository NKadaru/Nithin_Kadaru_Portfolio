import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

interface RevealProps {
  children: ReactNode
  /** Stagger offset in seconds, for sequencing siblings (spec §25). */
  delay?: number
  /** Vertical travel in px. Kept small — spec §25 says "subtle". */
  distance?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'section'
}

/**
 * Scroll-triggered reveal: fade plus subtle vertical movement (spec §25).
 *
 * Duration sits in the spec's 0.5–1.2s band. Fires once, so content does not
 * re-animate when scrolled past twice — repeated animation on revisit reads as
 * noise rather than polish.
 *
 * Under `prefers-reduced-motion` the content renders in its final state with
 * no transition at all (spec §31).
 */
export function Reveal({
  children,
  delay = 0,
  distance = 24,
  className,
  as = 'div',
}: RevealProps) {
  const reducedMotion = useReducedMotion()
  const Component = motion[as]

  if (reducedMotion) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  )
}

/**
 * Text-mask reveal: the parent clips, the child slides up from below the
 * baseline (spec §25 "text masking"). For headlines, where a plain fade would
 * feel flat at large sizes.
 *
 * IMPORTANT — why the viewport trigger is on the PARENT:
 *
 * The obvious implementation puts `whileInView` on the translated child. That
 * deadlocks. The child starts at y:110%, which places it outside its
 * `overflow: clip` parent, so it is clipped out of the rendered page; its
 * intersection ratio with the viewport is therefore always 0, `whileInView`
 * never fires, and the text stays invisible forever.
 *
 * So the always-visible mask does the observing and drives the child through
 * variants. Caught by `e2e/sections.spec.ts`, which asserts every heading is
 * actually visible.
 */
export function RevealText({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <span className={className}>{children}</span>
  }

  return (
    <motion.span
      className="mask"
      initial="hidden"
      whileInView="visible"
      // `amount` rather than a negative margin: a heading sitting flush with
      // the top of the viewport falls outside a shrunken root and never fires.
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.span
        className={className}
        style={{ display: 'block' }}
        variants={{ hidden: { y: '110%' }, visible: { y: '0%' } }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </motion.span>
  )
}
