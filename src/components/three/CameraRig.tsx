import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface CameraPose {
  /** Orbit radius in metres. */
  radius: number;
  /** Horizontal angle in degrees: 0 = looking from the south (+z), positive = swung to the east. */
  azimuth: number;
  /** Elevation above the horizon in degrees. */
  elevation: number;
  /** Horizontal film offset (mm on a 35 mm gauge): negative pushes the subject right of centre. */
  filmOffset: number;
}

interface CameraRigProps {
  target: [number, number, number];
  from: CameraPose;
  to: CameraPose;
  /** 0…1 read every frame. */
  getProgress: () => number;
  /** Disable idle drift and pointer parallax. */
  still?: boolean;
  /** Back the camera off on any frame narrower than 16:9 (full-viewport hero stage). */
  fitNarrow?: boolean;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Restrained architectural camera: interpolates between two orbit poses with scroll,
 * adds a slow idle drift and a small damped pointer parallax. Portrait screens pull back
 * so the whole model stays in frame.
 */
export function CameraRig({ target, from, to, getProgress, still = false, fitNarrow = false }: CameraRigProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0, p: getProgress() });
  const focus = useRef(new THREE.Vector3(...target));

  useEffect(() => {
    if (still) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [still]);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-delta * 3.2); // frame-rate independent damping
    const s = smooth.current;
    s.x += (pointer.current.x - s.x) * k;
    s.y += (pointer.current.y - s.y) * k;
    s.p += (getProgress() - s.p) * (1 - Math.exp(-delta * 6));

    const t = ease(THREE.MathUtils.clamp(s.p, 0, 1));
    const aspect = size.width / Math.max(size.height, 1);
    // Full-screen stages are tuned for 16:9 and back off steadily as the frame narrows (laptops,
    // tablets) so the model never crowds the copy. Compact (phone) frames back off until the whole model base fits the width.
    const portraitPull = fitNarrow ? 1 + Math.max(0, 1.7 - aspect) * 0.6 : Math.max(1, 1.32 / aspect);
    const drift = still ? 0 : Math.sin(state.clock.elapsedTime * 0.08) * 1.4;

    const radius = THREE.MathUtils.lerp(from.radius, to.radius, t) * portraitPull;
    const az = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(from.azimuth, to.azimuth, t) + drift + (still ? 0 : s.x * 3));
    const el = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(from.elevation, to.elevation, t) + (still ? 0 : -s.y * 1.5));

    focus.current.set(target[0], target[1] - (fitNarrow ? 0 : 12), target[2]); // phones: lift the model to the middle of its frame
    camera.position.set(
      focus.current.x + radius * Math.cos(el) * Math.sin(az),
      focus.current.y + radius * Math.sin(el),
      focus.current.z + radius * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(focus.current);

    const offset = aspect < 1.1 ? 0 : THREE.MathUtils.lerp(from.filmOffset, to.filmOffset, t);
    if (Math.abs(camera.filmOffset - offset) > 0.01) {
      camera.filmOffset = offset;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
