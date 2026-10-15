import { PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import { Box3, Vector3, type Group } from 'three'
import { HeroSubject } from './HeroSubject'

/**
 * Camera framing.
 *
 * Solved rather than eyeballed so the subject reliably lands inside the
 * 75–85% viewport-height band spec §6 requires:
 *
 *   visibleHeight = 2 · distance · tan(fov / 2)
 *   fill          = totalSubjectHeight / visibleHeight
 *
 * Total subject height is SUBJECT_HEIGHT plus the collar and plinth, ≈ 4.24.
 * With fov 32° and distance 9.9:
 *   visibleHeight = 2 · 9.9 · tan(16°) = 5.675
 *   fill          = 4.24 / 5.675 ≈ 0.747
 *
 * Perspective inflates the measured on-screen height a little above the
 * geometric figure, which lands the rendered subject around 80%. Verified by
 * measuring the rendered bounding box in e2e/hero.spec.ts rather than trusted
 * from the arithmetic alone — an earlier distance of 9.2 measured at 86%,
 * outside the band.
 */
const FRAMING = {
  fov: 32,
  fovMobile: 42,
  distance: 9.9,
  /** Lifts the subject slightly above centre, leaving room for hero text below. */
  targetY: 0.15,
} as const

interface HeroCanvasProps {
  /**
   * Scroll progress, 0→1, written by the ScrollTrigger in Hero.tsx.
   * A ref rather than a prop so scroll updates never trigger a React render —
   * re-rendering the tree 60×/second would make the rotation stutter.
   */
  progressRef: RefObject<number>
  /** Pauses rendering when the hero is offscreen. */
  active: boolean
  /** Static pose, no rotation, for `prefers-reduced-motion` (spec §31). */
  reducedMotion: boolean
}

export function HeroCanvas({ progressRef, active, reducedMotion }: HeroCanvasProps) {
  return (
    <Canvas
      // 'never' fully stops the render loop when the hero is scrolled past,
      // which keeps the GPU idle for the rest of the page (spec §29).
      frameloop={active ? 'always' : 'never'}
      // Clamping DPR is the single biggest perf win on high-density displays:
      // uncapped, a 3× screen renders 9× the pixels.
      dpr={[1, 2]}
      gl={{
        antialias: true,
        // No alpha: the canvas sits on an opaque void background, and an
        // opaque buffer composites faster.
        alpha: false,
        powerPreference: 'high-performance',
      }}
      // Transparent to pointer events so the custom cursor and any text links
      // beneath remain interactive.
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <color attach="background" args={['#08080a']} />
      <ResponsiveCamera />
      <Rotator progressRef={progressRef} reducedMotion={reducedMotion}>
        <HeroSubject />
      </Rotator>
    </Canvas>
  )
}

interface RotatorProps {
  progressRef: RefObject<number>
  reducedMotion: boolean
  children: React.ReactNode
}

/**
 * THE 360° DRIVER (spec §7, §8, §26, §33).
 *
 * Maps scroll progress directly onto Y rotation:
 *
 *     rotation.y = progress × 2π
 *
 * Properties this gives, each one a spec requirement:
 *
 *  - TRUE 360°, not a fake. The actual object rotates in 3D; this is not a CSS
 *    transform on a flat image and not a video scrub (§26, §33).
 *  - EXACT start/end match. progress 0 → 0 rad and progress 1 → 2π rad are the
 *    same orientation by definition, so the final frame is guaranteed
 *    identical to the first. A frame sequence can only approximate this (§7).
 *  - DIRECTLY SCROLL-SYNCHRONIZED and REVERSIBLE. Scroll up decreases progress,
 *    which rotates backward. No easing or inertia is layered on top — Lenis
 *    has already smoothed the scroll input itself, so adding damping here
 *    would break the "directly synchronized" requirement (§8).
 *  - LINEAR. No easing curve, so angular velocity tracks scroll velocity (§8).
 *  - CONSTANT SCALE. Scale is never touched, anywhere (§7, §8).
 *  - NO AUTOMATIC MOTION. Nothing moves unless the scroll position moves (§8).
 *
 * Read in `useFrame` rather than written from the scroll handler so the
 * rotation is applied in the render loop, on the same frame as the draw.
 */
function Rotator({ progressRef, reducedMotion, children }: RotatorProps) {
  const groupRef = useRef<Group>(null)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  /**
   * Measures the subject's projected screen-space height as a fraction of
   * viewport height, so spec §6 (75–85%) can be asserted in a test.
   *
   * Projects the geometry's bounding box through the camera rather than
   * sampling pixels: a WebGL canvas cannot be read back without
   * `preserveDrawingBuffer`, which costs performance on every frame, and the
   * projected figure is exact rather than brightness-threshold dependent.
   *
   * Recomputed only on resize. `setFromObject` walks the entire subtree, which
   * is far too expensive to run per frame, and the measurement is invariant
   * under the Y rotation anyway.
   */
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    // Defer a frame so children have mounted and world matrices are current.
    const id = requestAnimationFrame(() => {
      const box = new Box3().setFromObject(group)
      if (box.isEmpty()) return

      const corners = [
        new Vector3(box.min.x, box.min.y, box.min.z),
        new Vector3(box.max.x, box.min.y, box.min.z),
        new Vector3(box.min.x, box.max.y, box.min.z),
        new Vector3(box.max.x, box.max.y, box.min.z),
        new Vector3(box.min.x, box.min.y, box.max.z),
        new Vector3(box.max.x, box.min.y, box.max.z),
        new Vector3(box.min.x, box.max.y, box.max.z),
        new Vector3(box.max.x, box.max.y, box.max.z),
      ]

      let minNdcY = Infinity
      let maxNdcY = -Infinity
      let minNdcX = Infinity
      let maxNdcX = -Infinity

      for (const corner of corners) {
        const ndc = corner.project(camera)
        minNdcY = Math.min(minNdcY, ndc.y)
        maxNdcY = Math.max(maxNdcY, ndc.y)
        minNdcX = Math.min(minNdcX, ndc.x)
        maxNdcX = Math.max(maxNdcX, ndc.x)
      }

      // NDC spans -1..1, so a viewport-filling object has a range of 2.
      framing.heightFraction = (maxNdcY - minNdcY) / 2
      framing.centreOffset = Math.abs((minNdcX + maxNdcX) / 2) / 2
    })

    return () => cancelAnimationFrame(id)
  }, [camera, size.width, size.height])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    if (reducedMotion) {
      // Static three-quarter pose: more interesting than dead-on front, and
      // shows the object's form without any motion at all.
      group.rotation.y = Math.PI * 0.12
      publishHeroState(0, group.rotation.y, group.scale.x)
      return
    }

    const progress = progressRef.current ?? 0
    group.rotation.y = progress * Math.PI * 2
    publishHeroState(progress, group.rotation.y, group.scale.x)
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {children}
    </group>
  )
}

/** Latest measured framing, published alongside the rotation state. */
const framing = { heightFraction: 0, centreOffset: 0 }

/**
 * Publishes the live rotation state for automated verification.
 *
 * The 360° requirement is the one thing in this build that cannot be checked
 * by reading the source — it is a claim about runtime behaviour across scroll
 * positions. Exposing these values lets a Playwright test assert that
 * progress 0 and progress 1 land on the same orientation, that rotation
 * reverses on scroll-up, that scale never drifts, and that the subject stays
 * inside the §6 height band.
 *
 * Cost is a handful of float writes per frame, which is negligible, so this
 * ships in production too and doubles as a post-deploy smoke test.
 */
declare global {
  interface Window {
    __hero?: {
      progress: number
      rotationY: number
      revolutions: number
      scale: number
      /** Projected subject height as a fraction of viewport height (spec §6). */
      heightFraction: number
      /** Subject centre's horizontal offset from viewport centre, 0–1. */
      centreOffset: number
    }
  }
}

function publishHeroState(progress: number, rotationY: number, scale: number): void {
  if (typeof window === 'undefined') return
  window.__hero = {
    progress,
    rotationY,
    revolutions: rotationY / (Math.PI * 2),
    scale,
    heightFraction: framing.heightFraction,
    centreOffset: framing.centreOffset,
  }
}

/**
 * Keeps the subject correctly framed across viewport sizes and orientation
 * changes without ever changing its apparent scale mid-scroll (spec §8 forbids
 * scale changes during rotation — this only reacts to resize).
 *
 * Declarative rather than mutating `useThree().camera` directly: mutating a
 * value returned from a hook defeats the React compiler's optimization of the
 * component, and drei's PerspectiveCamera already handles
 * `updateProjectionMatrix` when its props change.
 */
function ResponsiveCamera() {
  const size = useThree((state) => state.size)

  const aspect = size.width / size.height
  const isMobile = size.width < 768
  const base = isMobile ? FRAMING.fovMobile : FRAMING.fov
  // On very wide, short viewports the limiting dimension is height, so widen
  // the fov to keep the full subject visible.
  const heightCompensation = aspect > 1.9 ? 4 : 0

  return (
    <PerspectiveCamera
      makeDefault
      fov={base + heightCompensation}
      position={[0, FRAMING.targetY, FRAMING.distance]}
      near={0.1}
      far={100}
    />
  )
}
