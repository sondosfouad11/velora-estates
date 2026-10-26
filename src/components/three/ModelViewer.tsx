import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef, type ComponentRef, type RefObject } from 'react';
import * as THREE from 'three';
import type { VillaVariant } from '../../types/property';
import { SceneLighting } from './SceneLighting';
import { VILLAS } from './villa';
import { VillaMaterialsProvider } from './villa/materials';

interface ModelViewerProps {
  variant: VillaVariant;
  dusk: boolean;
  resetSignal: number;
  reducedMotion: boolean;
  onContextLost: () => void;
}

type Controls = ComponentRef<typeof OrbitControls>;

/** Camera direction used for the starting view (normalised later). */
const HOME_DIR = new THREE.Vector3(0.62, 0.42, 0.72).normalize();

/**
 * Narrow frames see less of the model horizontally, so the camera backs off until the
 * whole plot fits the width. Wide frames (aspect 1.45 and up) keep the base framing.
 */
function fitScale(aspect: number) {
  return Math.min(1.8, Math.max(1, 1.45 / Math.max(aspect, 0.5)));
}

/** Puts the camera at the framed starting view on mount, on resize and when Reset is pressed. */
function Framing({
  controls,
  radius,
  focus,
  resetSignal,
}: {
  controls: RefObject<Controls | null>;
  radius: number;
  focus: [number, number, number];
  resetSignal: number;
}) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(size.height, 1);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const r = radius * fitScale(aspect);
    c.target.set(...focus);
    c.object.position.copy(HOME_DIR).multiplyScalar(r).add(c.target);
    c.minDistance = r * 0.42;
    c.maxDistance = r * 1.35;
    c.update();
  }, [controls, radius, focus, aspect, resetSignal]);

  // (Touch: vertical swipes scroll the page via touch-action: pan-y in ModelSection.module.css.)
  // Mouse wheel scrolls the page; Ctrl + wheel (and trackpad pinch) zooms.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const el = c.domElement as HTMLElement | null;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) e.stopImmediatePropagation();
    };
    el.addEventListener('wheel', onWheel, { capture: true });
    return () => el.removeEventListener('wheel', onWheel, { capture: true });
  });

  return null;
}

/** Interactive orbit view of a listing's procedural villa model (details page). */
export default function ModelViewer({ variant, dusk, resetSignal, reducedMotion, onContextLost }: ModelViewerProps) {
  const model = VILLAS[variant];
  const controls = useRef<Controls>(null);
  const duskValue = useRef(dusk ? 1 : 0);
  const target = useRef(dusk ? 1 : 0);
  target.current = dusk ? 1 : 0;

  const radius = Math.max(model.base.width, model.base.depth) * 1.85;
  const start = HOME_DIR.clone()
    .multiplyScalar(radius)
    .add(new THREE.Vector3(...model.focus));

  // Ease the dusk value toward its target each frame (read by SceneLighting).
  const getDusk = () => {
    duskValue.current += (target.current - duskValue.current) * (reducedMotion ? 1 : 0.06);
    return duskValue.current;
  };

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ fov: 30, near: 1, far: 400, position: start.toArray() }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <VillaMaterialsProvider>
        <SceneLighting
          getDusk={getDusk}
          interiorLightPositions={model.lights}
          shadowMapSize={2048}
          shadowExtent={Math.max(model.base.width, model.base.depth) * 0.7}
        />
        <model.Component />
        <OrbitControls
          ref={controls}
          target={model.focus}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2.15}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.35}
        />
        <Framing controls={controls} radius={radius} focus={model.focus} resetSignal={resetSignal} />
      </VillaMaterialsProvider>
    </Canvas>
  );
}
