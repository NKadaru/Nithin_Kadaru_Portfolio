import { Analytics } from '@vercel/analytics/react'
import { useCallback, useEffect, useState } from 'react'
import { Cursor } from './components/Cursor'
import { Loader } from './components/Loader'
import { Navbar } from './components/Navbar'
import { useLenis } from './lib/useLenis'
import { ScrollTrigger } from './lib/gsap'
import { About } from './sections/About'
import { Contact, FinalCta, Footer } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Hero } from './sections/hero/Hero'
import { HowIWork } from './sections/HowIWork'
import { Marquee } from './sections/Marquee'
import { Skills } from './sections/Skills'
import { Work } from './sections/Work'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  // Smooth scroll, shared with GSAP's ticker.
  useLenis()

  const onLoaderComplete = useCallback(() => setLoaded(true), [])

  // Hold scroll at the top while the loader is up, so the hero always begins
  // at exactly 0% rotation (spec §7 requires the start frame to be definite).
  useEffect(() => {
    if (loaded) return
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => {
      document.body.style.overflow = ''
    }
  }, [loaded])

  // Section heights settle after fonts load; stale ScrollTrigger measurements
  // would misalign the hero's scroll mapping.
  useEffect(() => {
    if (!loaded) return
    const refresh = () => ScrollTrigger.refresh()
    document.fonts.ready.then(refresh)
    const timer = setTimeout(refresh, 400)
    return () => clearTimeout(timer)
  }, [loaded])

  return (
    <>
      <Loader onComplete={onLoaderComplete} />
      <Cursor />

      {/* Skip link — first tab stop (spec §31). */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:border focus:border-bone focus:bg-void focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-bone"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <About />
        <Marquee />
        <Work />
        <Experience />
        <Skills />
        <HowIWork />
        <Contact />
        <FinalCta />
      </main>

      <Footer />
      <Analytics />
    </>
  )
}
