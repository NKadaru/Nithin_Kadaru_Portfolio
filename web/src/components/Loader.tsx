import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { loader } from '../content/content'
import { useReducedMotion } from '../lib/useReducedMotion'

interface LoaderProps {
  onComplete: () => void
}

/**
 * PREMIUM LOADER (spec §28)
 *
 * `NITHIN` → "Loading experience…" with both a numeric counter and a progress
 * line (Q4.2 = both).
 *
 * Progress is real, not theatre: it tracks document readiness and font
 * loading, then waits for the Three.js chunk the hero dynamically imports.
 * A fake timed bar that finishes before the hero is ready would produce a
 * blank frame on dismissal, which is exactly what §28 is guarding against.
 */
export function Loader({ onComplete }: LoaderProps) {
  const reducedMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    let raf = 0

    // Real readiness signals, weighted by how long each typically takes.
    const signals: Array<{ weight: number; promise: Promise<unknown> }> = [
      { weight: 0.25, promise: document.fonts.ready },
      {
        weight: 0.2,
        promise:
          document.readyState === 'complete'
            ? Promise.resolve()
            : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
      },
      // The hero's Three.js chunk. Warming it here means the hero renders on
      // its first frame instead of flashing its Suspense fallback.
      { weight: 0.55, promise: import('../sections/hero/HeroCanvas') },
    ]

    let settled = 0
    const total = signals.reduce((sum, s) => sum + s.weight, 0)

    signals.forEach(({ weight, promise }) => {
      promise
        .catch(() => {
          // A failed signal must not hang the loader forever — the hero has
          // its own fallback for this case.
        })
        .then(() => {
          settled += weight
        })
    })

    // Ease the displayed number toward real progress so it never jumps.
    let shown = 0
    const tick = () => {
      if (cancelled) return
      const target = Math.min(1, settled / total)
      shown += (target - shown) * 0.08
      const pct = Math.round(shown * 100)
      setProgress(pct)

      if (target >= 1 && pct >= 99) {
        setProgress(100)
        setDone(true)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [])

  // Hold at 100% briefly so the completed state is legible, then dismiss.
  useEffect(() => {
    if (!done) return
    const delay = reducedMotion ? 0 : 420
    const timer = setTimeout(onComplete, delay)
    return () => clearTimeout(timer)
  }, [done, reducedMotion, onComplete])

  return (
    <AnimatePresence>
      {!done || progress < 100 ? (
        <motion.div
          className="fixed inset-0 z-100 flex flex-col justify-between bg-void gutter py-10"
          initial={false}
          exit={reducedMotion ? { opacity: 0 } : { y: '-100%' }}
          transition={{ duration: reducedMotion ? 0.15 : 1.1, ease: [0.83, 0, 0.17, 1] }}
          role="status"
          aria-live="polite"
          aria-label={`${loader.message}, ${progress}%`}
        >
          {/* Wordmark */}
          <div className="flex items-start justify-between">
            <span className="font-display text-h3 tracking-[-0.02em] text-bone">
              {loader.wordmark}
            </span>
            {loader.showCounter ? (
              <span className="font-mono text-h3 tabular-nums text-bone-dim">
                {String(progress).padStart(3, '0')}
              </span>
            ) : null}
          </div>

          {/* Message + progress line */}
          <div className="flex flex-col gap-5">
            <span className="label">
              {loader.message}
              <AnimatedEllipsis reducedMotion={reducedMotion} />
            </span>

            {loader.showLine ? (
              <div className="h-px w-full bg-hairline" role="presentation">
                <motion.div
                  className="h-px bg-bone"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/** Three dots cycling. Static under reduced motion. */
function AnimatedEllipsis({ reducedMotion }: { reducedMotion: boolean }) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (reducedMotion) return
    const interval = setInterval(() => {
      setCount((c) => (c % 3) + 1)
    }, 420)
    return () => clearInterval(interval)
  }, [reducedMotion])

  if (reducedMotion) return <span>...</span>
  return <span className="inline-block w-4 text-left">{'.'.repeat(count)}</span>
}
