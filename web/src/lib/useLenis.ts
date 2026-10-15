import Lenis from 'lenis'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * Lenis smooth scroll (spec §3, §8), driven by GSAP's ticker.
 *
 * Why the ticker rather than Lenis's own requestAnimationFrame loop: GSAP and
 * Lenis each running their own rAF produces one-frame disagreements between
 * the scroll position Lenis has applied and the position ScrollTrigger reads.
 * On a pinned, scroll-driven rotation that reads as jitter. Sharing a single
 * ticker makes the hero rotation exactly scroll-synchronized, which spec §8
 * requires.
 *
 * Disabled entirely under `prefers-reduced-motion` — native scrolling is
 * returned to the browser (spec §31).
 */
export function useLenis(): void {
  const reducedMotion = useReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reducedMotion) return

    const lenis = new Lenis({
      // ~1s to settle: smooth but still feels directly connected to input.
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      // Touch smoothing fights native momentum on iOS and feels laggy.
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis

    // Let ScrollTrigger read scroll position from Lenis.
    lenis.on('scroll', ScrollTrigger.update)

    const onTick = (time: number) => {
      // GSAP ticker time is seconds; Lenis expects milliseconds.
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)

    // GSAP's default lag smoothing stalls the ticker after a slow frame, which
    // desynchronizes scroll-linked animation. Off for scroll-driven work.
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(onTick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])
}

/** Jump to a section. Uses Lenis when active, native scroll otherwise. */
export function scrollToSection(href: string): void {
  const target = document.querySelector(href)
  if (!(target instanceof HTMLElement)) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
