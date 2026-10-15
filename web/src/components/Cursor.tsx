import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

/**
 * CUSTOM CURSOR (spec §24)
 *
 * Small dot at rest; expands into a circle over interactive elements; shows
 * `VIEW` over project links and `EXPLORE` over images. Disabled on touch
 * devices entirely.
 *
 * Opt in per element with `data-cursor="view" | "explore" | "hover"`.
 *
 * Accessibility note: the native cursor is only hidden on elements marked
 * `.cursor-none-desktop`, and this component never captures pointer events,
 * so nothing here interferes with keyboard navigation or screen readers. It
 * is also skipped under `prefers-reduced-motion`, where a lagging follower
 * element is exactly the kind of motion users are asking to avoid.
 */
type CursorState = 'default' | 'hover' | 'view' | 'explore'

const LABELS: Record<CursorState, string> = {
  default: '',
  hover: '',
  view: 'VIEW',
  explore: 'EXPLORE',
}

export function Cursor() {
  const reducedMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [state, setState] = useState<CursorState>('default')
  const [visible, setVisible] = useState(false)

  const dotRef = useRef<HTMLDivElement>(null)
  // Target vs rendered position, lerped for a slight trailing feel.
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  // Only enable on devices with a real pointer (spec §24: disable on mobile).
  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setEnabled(mql.matches && !reducedMotion)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [reducedMotion])

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)

      // Resolve cursor state from the hovered element, honouring explicit
      // data-cursor hints first and falling back to generic interactivity.
      const el = e.target
      if (!(el instanceof Element)) return

      const marked = el.closest('[data-cursor]')
      if (marked instanceof HTMLElement) {
        const hint = marked.dataset.cursor as CursorState | undefined
        setState(hint && hint in LABELS ? hint : 'hover')
        return
      }

      setState(el.closest('a, button, [role="button"], input, textarea') ? 'hover' : 'default')
    }

    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    let raf = 0
    const tick = () => {
      // Lerp toward the pointer. 0.18 trails just enough to feel considered
      // without feeling sluggish or disconnected.
      current.current.x += (target.current.x - current.current.x) * 0.18
      current.current.y += (target.current.y - current.current.y) * 0.18

      const dot = dotRef.current
      if (dot) {
        dot.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [enabled, visible])

  if (!enabled) return null

  const label = LABELS[state]
  const isExpanded = state !== 'default'

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-90 hidden md:block"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms ease' }}
    >
      <div
        className="grid place-items-center rounded-full border border-bone transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: label ? 68 : isExpanded ? 38 : 7,
          height: label ? 68 : isExpanded ? 38 : 7,
          backgroundColor: label ? 'rgba(242,239,233,0.06)' : isExpanded ? 'transparent' : '#f2efe9',
          backdropFilter: label ? 'blur(2px)' : 'none',
        }}
      >
        {label ? (
          <span className="font-mono text-[0.5rem] tracking-[0.16em] text-bone uppercase">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
