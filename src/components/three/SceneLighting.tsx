import { Environment, Lightformer } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useVillaMaterials } from './villa/materials';

interface SceneLightingProps {
  /** Returns 0 (afternoon) … 1 (dusk). Read every frame so scrolling never re-renders React. */
  getDusk: () => number;
  /** Interior lamp positions (metres) that switch on at dusk. */
  interiorLightPositions?: [number, number, number][];
  shadowMapSize?: number;
  /** Half-size of the shadow camera frustum in metres. */
  shadowExtent?: number;
}

const SUN_DAY = new THREE.Vector3(26, 38, 22);
const SUN_DUSK = new THREE.Vector3(42, 7, 26);
const SUN_COLOR_DAY = new THREE.Color('#fff1da');
const SUN_COLOR_DUSK = new THREE.Color('#ff9358');
const SKY_DAY = new THREE.Color('#f3efe6');
const SKY_DUSK = new THREE.Color('#465068');

export function SceneLighting({ getDusk, interiorLightPositions = [], shadowMapSize = 2048, shadowExtent = 30 }: SceneLightingProps) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const m = useVillaMaterials();
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const last = useRef(-1);
  const interiorLights = useRef<(THREE.PointLight | null)[]>([]);

  useFrame(() => {
    const d = THREE.MathUtils.clamp(getDusk(), 0, 1);
    if (Math.abs(d - last.current) < 0.0005) return;
    last.current = d;
    const e = d * d * (3 - 2 * d); // smoothstep
    if (sun.current) {
      sun.current.position.lerpVectors(SUN_DAY, SUN_DUSK, e);
      sun.current.color.lerpColors(SUN_COLOR_DAY, SUN_COLOR_DUSK, e);
      sun.current.intensity = THREE.MathUtils.lerp(2.9, 0.9, e);
    }
    if (hemi.current) {
      hemi.current.color.lerpColors(SKY_DAY, SKY_DUSK, e);
      hemi.current.intensity = THREE.MathUtils.lerp(0.85, 0.32, e);
    }
    // Windows and pool light up as the sun goes down; glass clears so the rooms read from outside.
    const glow = THREE.MathUtils.smoothstep(d, 0.3, 0.9);
    m.interior.emissiveIntensity = glow * 3.2;
    m.poolLining.emissiveIntensity = glow * 1.1;
    m.glass.opacity = THREE.MathUtils.lerp(0.55, 0.3, glow);
    m.water.color.copy(tmpColor.set('#3f8e9c').lerp(SKY_DUSK, e * 0.35));
    for (const l of interiorLights.current) if (l) l.intensity = glow * 60;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={[SKY_DAY, '#777b64', 0.85]} />
      <directionalLight
        ref={sun}
        position={SUN_DAY.toArray()}
        intensity={2.9}
        color={SUN_COLOR_DAY}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={1}
        shadow-camera-far={140}
      />
      {/* Warm lamps that switch on at dusk; positions sit inside every model's main volumes. */}
      {interiorLightPositions.map((p, i) => (
        <pointLight
          key={i}
          ref={(l) => {
            interiorLights.current[i] = l;
          }}
          position={p}
          color="#ffb46b"
          intensity={0}
          distance={18}
          decay={1.6}
        />
      ))}
      {/* Studio-style environment for glass and water reflections, rendered once locally. */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff6ea" position={[0, 12, 18]} scale={[40, 10, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#d9d4ca" position={[-25, 6, 0]} rotation-y={Math.PI / 2} scale={[30, 8, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#b68b62" position={[25, 3, -10]} rotation-y={-Math.PI / 2} scale={[30, 4, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 30, 0]} rotation-x={Math.PI / 2} scale={12} />
      </Environment>
    </>
  );
}
