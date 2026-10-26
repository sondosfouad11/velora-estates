import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import type { MotionValue } from 'motion/react';
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraRig, type CameraPose } from './CameraRig';
import { SceneLighting } from './SceneLighting';
import { VillaMaterialsProvider } from './villa/materials';
import { AURELIA, VillaAurelia } from './villa/VillaAurelia';

interface HeroCanvasProps {
  progress: MotionValue<number>;
  /** Pause rendering entirely (hero scrolled away or tab hidden). */
  active: boolean;
  reducedMotion: boolean;
  compact: boolean;
  onContextLost: () => void;
  /** Called when the visitor first touches/drags the model (phones). */
  onInteract?: () => void;
  onReady?: () => void;
}

const FROM: CameraPose = { radius: 102, azimuth: 36, elevation: 23, filmOffset: -7.5 };
const TO: CameraPose = { radius: 90, azimuth: -20, elevation: 10, filmOffset: -6.5 };


/**
 * Phone camera: the same framing as the desktop hero, but the visitor drives it. Dragging sideways turns the
 * model, pinching zooms, and vertical swipes are left to the browser so the page still scrolls
 * (the container's touch-action is set to pan-y in HomeHero.module.css).
 */
function MobileOrbit({ target, autoRotate, onInteract }: { target: [number, number, number]; autoRotate: boolean; onInteract: () => void }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const placed = useRef(false);
  const [auto, setAuto] = useState(autoRotate);
  const aspect = size.width / Math.max(size.height, 1);
  // Same pull-back rule as CameraRig so the whole model base fits the width.
  const radius = 102 * Math.max(1, 1.32 / aspect);

  useLayoutEffect(() => {
    if (placed.current || size.width < 2) return;
    placed.current = true; // place once: the address bar resizing the canvas must not reset a view the visitor chose
    const az = THREE.MathUtils.degToRad(36);
    const el = THREE.MathUtils.degToRad(23);
    camera.position.set(
      target[0] + radius * Math.cos(el) * Math.sin(az),
      target[1] + radius * Math.sin(el),
      target[2] + radius * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(...target);
  }, [camera, size.width, radius, target]);

  // Lift the model to the middle of its frame without moving the orbit centre.
  useLayoutEffect(() => {
    camera.setViewOffset(size.width, size.height, 0, Math.round(size.height * 0.15), size.width, size.height);
    return () => camera.clearViewOffset();
  }, [camera, size.width, size.height]);

  return (
    <OrbitControls
      target={target}
      enablePan={false}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.8}
      minDistance={radius * 0.55}
      maxDistance={radius * 1.15}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI / 2.1}
      autoRotate={auto}
      autoRotateSpeed={0.7}
      onStart={() => {
        setAuto(false);
        onInteract();
      }}
    />
  );
}

/** The live WebGL hero: Villa Aurelia on its model base, lit from afternoon to dusk by scroll. */
export default function HeroCanvas({ progress, active, reducedMotion, compact, onContextLost, onReady, onInteract }: HeroCanvasProps) {
  const [dpr, setDpr] = useState(compact ? 1.25 : 1.75);
  const getProgress = () => (reducedMotion || compact ? 0 : progress.get()); // phones keep the daylight scene

  useEffect(() => setDpr(compact ? 1.25 : 1.75), [compact]);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, dpr]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 28, near: 1, far: 260, position: [40, 20, 40] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost();
        });
        onReady?.();
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <VillaMaterialsProvider>
        <Suspense fallback={null}>
          <SceneLighting
            getDusk={getProgress}
            interiorLightPositions={AURELIA.lights}
            shadowMapSize={compact ? 1024 : 2048}
            shadowExtent={32}
          />
          <VillaAurelia detail={compact ? 'low' : 'high'} />
          {compact ? (
            <MobileOrbit target={AURELIA.focus} autoRotate={!reducedMotion} onInteract={() => onInteract?.()} />
          ) : (
            <CameraRig target={AURELIA.focus} from={FROM} to={TO} getProgress={getProgress} still={reducedMotion} fitNarrow />
          )}
        </Suspense>
      </VillaMaterialsProvider>
    </Canvas>
  );
}
