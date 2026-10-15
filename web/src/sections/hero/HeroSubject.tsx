import { Environment, Lightformer, RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'

/**
 * HERO SUBJECT — THE SWAP SEAM (spec §27)
 *
 * This is the only file that knows what is actually rotating. The rotation
 * driver, pinning, scroll mapping, loader and layout are all independent of
 * it, so replacing the subject never touches the rest of the site.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * TO DROP IN THE REAL .glb (Q3.2):
 *
 *   1. Put the file at `public/models/subject.glb`
 *   2. Replace the <ProceduralSubject /> below with:
 *
 *        import { useGLTF } from '@react-three/drei'
 *        const { scene } = useGLTF('/models/subject.glb')
 *        return <primitive object={scene} />
 *
 *   3. Preload it so the loader (spec §28) waits for it:
 *        useGLTF.preload('/models/subject.glb')
 *
 *   Asset requirements: binary .glb under ~2 MB after
 *   `npx gltf-transform optimize in.glb out.glb`, Y-up, origin at the object's
 *   centre so it spins about its own axis, PBR materials with no baked lighting,
 *   and roughly SUBJECT_HEIGHT units tall (or set `scale` to match).
 * ───────────────────────────────────────────────────────────────────────────
 */

/**
 * Target height in world units. The camera is framed so an object this tall
 * occupies ~80% of viewport height, satisfying spec §6 (75–85%).
 * Keep this in sync with `FRAMING` in HeroCanvas.tsx.
 */
export const SUBJECT_HEIGHT = 4

export function HeroSubject() {
  return (
    <>
      <ProceduralSubject />
      <StudioEnvironment />
    </>
  )
}

/**
 * Procedural stand-in: a machined, finned monolith.
 *
 * Deliberate design constraints:
 *  - ASYMMETRIC. A sphere or plain cylinder would look motionless while
 *    rotating, so the full 360° would be invisible. The accent inset sits on
 *    one face only, which makes the complete revolution legible — and makes
 *    the 0°/360° frame match verifiable by eye.
 *  - No animation of its own. Spec §8 forbids automatic spinning; every bit of
 *    motion comes from scroll.
 *  - Reads as hardware rather than decoration, which suits a backend engineer
 *    better than an abstract blob.
 */
function ProceduralSubject() {
  // Stacked horizontal fins, heat-sink style. Memoized so the array identity
  // is stable across re-renders and React doesn't rebuild the subtree.
  const fins = useMemo(() => {
    const count = 11
    const spacing = 0.26
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      y: (i - (count - 1) / 2) * spacing,
      // Slight taper toward the ends — avoids a mechanical, uniform stack.
      width: 1.72 - Math.abs(i - (count - 1) / 2) * 0.045,
    }))
  }, [])

  return (
    <group>
      {/* Core column */}
      <RoundedBox args={[1.1, SUBJECT_HEIGHT, 1.1]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#5e5e68" metalness={0.72} roughness={0.38} />
      </RoundedBox>

      {/* Fin stack */}
      {fins.map((fin) => (
        <RoundedBox
          key={fin.key}
          args={[fin.width, 0.085, 1.34]}
          radius={0.03}
          smoothness={3}
          position={[0, fin.y, 0]}
        >
          <meshStandardMaterial color="#9ea0ac" metalness={0.8} roughness={0.26} />
        </RoundedBox>
      ))}

      {/*
        Accent inset — on the +Z face only. This is the rotation tell: it is
        front-facing at 0% and again at 100%, which is how the exact start/end
        frame match required by spec §7 is verified visually.
      */}
      <mesh position={[0, 0.72, 0.58]}>
        <boxGeometry args={[0.1, 1.15, 0.035]} />
        <meshStandardMaterial
          color="#e4572e"
          emissive="#e4572e"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>

      {/* Machined collar near the base — breaks vertical symmetry. */}
      <mesh position={[0, -SUBJECT_HEIGHT / 2 + 0.22, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.12, 48]} />
        <meshStandardMaterial color="#b4b6c2" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Base plinth — grounds the object so it doesn't read as floating. */}
      <mesh position={[0, -SUBJECT_HEIGHT / 2 - 0.06, 0]}>
        <cylinderGeometry args={[1.05, 1.15, 0.12, 64]} />
        <meshStandardMaterial color="#3c3c44" metalness={0.6} roughness={0.52} />
      </mesh>
    </group>
  )
}

/**
 * Self-contained studio lighting.
 *
 * `<Environment>` with Lightformer children renders its own cubemap in-engine,
 * so metal picks up real reflections with NO external HDRI download — no
 * third-party CDN request, nothing to fail offline, nothing to add to the
 * critical path (spec §29).
 *
 * Swap to `<Environment files="/hdri/studio.hdr" />` if you later want a
 * photographic HDRI from Poly Haven.
 */
function StudioEnvironment() {
  return (
    <>
      <Environment resolution={256}>
        {/* Key light — large soft source, upper front-left. */}
        <Lightformer
          form="rect"
          intensity={9}
          position={[-3.5, 3.5, 4]}
          scale={[6, 8, 1]}
          target={[0, 0, 0]}
        />
        {/* Cool rim from behind-right, separates the subject from the void. */}
        <Lightformer
          form="rect"
          intensity={6.5}
          color="#c4d4f0"
          position={[4, 1.5, -3.5]}
          scale={[5, 7, 1]}
          target={[0, 0, 0]}
        />
        {/* Low warm bounce so shadow sides aren't dead black. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#f0dcc4"
          position={[0, -3.5, 2.5]}
          scale={[7, 3, 1]}
          target={[0, 0, 0]}
        />
        {/* Thin overhead strip — gives the fins a specular edge highlight. */}
        <Lightformer
          form="rect"
          intensity={8}
          position={[0, 5.5, 0.5]}
          scale={[1.2, 6, 1]}
          target={[0, 0, 0]}
        />
        {/* Front fill — keeps the face toward the viewer legible at every angle. */}
        <Lightformer
          form="rect"
          intensity={3.2}
          position={[0, 0.5, 6]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />
      </Environment>

      {/* Directional lights sharpen edge definition the env map alone leaves soft. */}
      <directionalLight position={[-2.5, 4, 3.5]} intensity={1.8} />
      <directionalLight position={[3, 1, -2.5]} intensity={0.9} color="#c4d4f0" />
      <ambientLight intensity={0.35} />
    </>
  )
}
