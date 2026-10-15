import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Single place where GSAP plugins are registered.
 *
 * Registering in each component risks double-registration and makes the
 * ScrollTrigger dependency easy to forget when a file is copied.
 */
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
