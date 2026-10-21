import { Environment, Lightformer, useGLTF } from '@react-three/drei'

/**
 * HERO SUBJECT — THE SWAP SEAM
 *
 * The supplied IMG_3511 portrait is embedded inside this local GLB, so the
 * browser makes no third-party image request. Because one photograph cannot
 * describe the unseen sides of a person, the model is intentionally a shallow,
 * gently curved portrait object rather than a fabricated 360° body scan.
 */
const MODEL_PATH = '/models/nithin-portrait.glb'
const MODEL_SCALE = 1.13

/** Target model height in world units; keep in sync with HeroCanvas framing. */
export const SUBJECT_HEIGHT = 4

export function HeroSubject() {
  return (
    <>
      <PortraitModel />
      <StudioEnvironment />
    </>
  )
}

function PortraitModel() {
  const { scene } = useGLTF(MODEL_PATH)
  return <primitive object={scene} scale={MODEL_SCALE} />
}

// Start fetching the model with the lazy Three.js chunk rather than waiting
// for the first committed Canvas frame.
useGLTF.preload(MODEL_PATH)

/**
 * Self-contained studio lighting.
 *
 * Lightformers render an in-engine environment map, so the portrait backing
 * and curved surface receive depth-defining highlights without an external
 * HDRI download.
 */
function StudioEnvironment() {
  return (
    <>
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={9}
          position={[-3.5, 3.5, 4]}
          scale={[6, 8, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={6.5}
          color="#c4d4f0"
          position={[4, 1.5, -3.5]}
          scale={[5, 7, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#f0dcc4"
          position={[0, -3.5, 2.5]}
          scale={[7, 3, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={8}
          position={[0, 5.5, 0.5]}
          scale={[1.2, 6, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3.2}
          position={[0, 0.5, 6]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />
      </Environment>

      <directionalLight position={[-2.5, 4, 3.5]} intensity={1.8} />
      <directionalLight position={[3, 1, -2.5]} intensity={0.9} color="#c4d4f0" />
      <ambientLight intensity={0.35} />
    </>
  )
}
