import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { navCta, navLinks, site } from '../content/content'
import { useReducedMotion } from '../lib/useReducedMotion'

/**
 * MINIMAL STICKY NAV (spec §5)
 *
 * Transparent at rest; gains a subtle background, blur and a thin bottom
 * hairline once scrolled. Mobile opens a premium fullscreen menu.
 */
export function Navbar() {
  const reducedMotion = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock background scroll while the fullscreen menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Esc closes the menu — keyboard parity with the close button (spec §31).
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-700',
          scrolled
            ? 'border-b border-hairline bg-void/72 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <nav
          className="gutter flex h-16 items-center justify-between md:h-20"
          aria-label="Primary"
        >
          {/* Wordmark */}
          <a
            href="#hero"
            className="font-display text-base tracking-[-0.02em] text-bone transition-opacity duration-300 hover:opacity-70"
          >
            {site.wordmark}
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative font-mono text-[0.7rem] tracking-[0.12em] text-bone-dim uppercase transition-colors duration-300 hover:text-bone"
                >
                  {link.label}
                  {/* Hairline underline grows from the left on hover (spec §4 micro-interaction). */}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
                </a>
              </li>
            ))}
            <li>
              <a
                href={navCta.href}
                className="border border-hairline-strong px-5 py-2.5 font-mono text-[0.7rem] tracking-[0.12em] text-bone uppercase transition-colors duration-500 hover:border-bone hover:bg-bone hover:text-void"
              >
                {navCta.label}
              </a>
            </li>
          </ul>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="font-mono text-[0.7rem] tracking-[0.12em] text-bone uppercase md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            Menu
          </button>
        </nav>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        reducedMotion={reducedMotion}
      />
    </>
  )
}

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  reducedMotion: boolean
}

/** Premium fullscreen mobile menu (spec §5, §30). */
function MobileMenu({ open, onClose, reducedMotion }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Move focus into the panel when it opens so keyboard and screen-reader
  // users land inside the menu rather than behind it.
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          tabIndex={-1}
          className="fixed inset-0 z-60 flex flex-col bg-void gutter md:hidden"
          initial={reducedMotion ? { opacity: 0 } : { y: '-100%' }}
          animate={reducedMotion ? { opacity: 1 } : { y: '0%' }}
          exit={reducedMotion ? { opacity: 0 } : { y: '-100%' }}
          transition={{ duration: reducedMotion ? 0.15 : 0.8, ease: [0.83, 0, 0.17, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex h-16 items-center justify-between">
            <span className="font-display text-base tracking-[-0.02em] text-bone">
              {site.wordmark}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[0.7rem] tracking-[0.12em] text-bone uppercase"
            >
              Close
            </button>
          </div>

          <ul className="flex flex-1 flex-col justify-center gap-3">
            {navLinks.map((link, i) => (
              <li key={link.href} className="mask">
                <motion.a
                  href={link.href}
                  onClick={onClose}
                  className="block font-display text-h2 text-bone"
                  initial={reducedMotion ? false : { y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{
                    duration: 0.7,
                    delay: reducedMotion ? 0 : 0.12 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {link.label}
                </motion.a>
              </li>
            ))}
          </ul>

          <a
            href={navCta.href}
            onClick={onClose}
            className="mb-10 border border-bone bg-bone px-7 py-4 text-center font-mono text-[0.7rem] tracking-[0.14em] text-void uppercase"
          >
            {navCta.label}
          </a>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
