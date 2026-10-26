import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { useVillaMaterials } from './materials';

export type Vec3 = [number, number, number];

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

/** Rescales BoxGeometry UVs so textures keep a real-world size (1 texture = `tile` metres). */
function worldUV(geometry: THREE.BoxGeometry, w: number, h: number, d: number, tile: number) {
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  // Face order: +x, -x, +y, -y, +z, -z; four vertices each (no segments).
  const dims: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  for (let face = 0; face < 6; face++) {
    const [du, dv] = dims[face];
    for (let v = 0; v < 4; v++) {
      const i = face * 4 + v;
      uv.setXY(i, (uv.getX(i) * du) / tile, (uv.getY(i) * dv) / tile);
    }
  }
  uv.needsUpdate = true;
}

interface BlockProps {
  size: Vec3;
  position: Vec3;
  material: THREE.Material | THREE.Material[];
  rotation?: Vec3;
  tile?: number;
  shadows?: boolean;
}

/** An axis-aligned box positioned by its centre. The workhorse of every villa. */
export function Block({ size, position, material, rotation, tile, shadows = true }: BlockProps) {
  const [w, h, d] = size;
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow={shadows} receiveShadow>
      <boxGeometry args={size} onUpdate={tile ? (g) => worldUV(g, w, h, d, tile) : undefined} />
    </mesh>
  );
}

/** Box from min/max corners — easier to read in plan coordinates. */
export function Span({ from, to, material, tile, shadows }: { from: Vec3; to: Vec3; material: THREE.Material | THREE.Material[]; tile?: number; shadows?: boolean }) {
  const size: Vec3 = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]), Math.abs(to[2] - from[2])];
  const position: Vec3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  return <Block size={size} position={position} material={material} tile={tile} shadows={shadows} />;
}

/**
 * A raised deck (from y = 0 to `top`) with a rectangular opening for a pool,
 * built as four slabs so the water inside the opening stays visible.
 */
export function DeckWithOpening({
  x,
  z,
  top,
  hole,
  material,
}: {
  x: [number, number];
  z: [number, number];
  top: number;
  hole: { x: [number, number]; z: [number, number] };
  material: THREE.Material;
}) {
  return (
    <group>
      <Span from={[x[0], 0, z[0]]} to={[x[1], top, hole.z[0]]} material={material} tile={4} />
      <Span from={[x[0], 0, hole.z[1]]} to={[x[1], top, z[1]]} material={material} tile={4} />
      <Span from={[x[0], 0, hole.z[0]]} to={[hole.x[0], top, hole.z[1]]} material={material} tile={4} />
      <Span from={[hole.x[1], 0, hole.z[0]]} to={[x[1], top, hole.z[1]]} material={material} tile={4} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Facade elements                                                     */
/* ------------------------------------------------------------------ */

interface GlazingProps {
  /** Start and end of the glazing line in plan (x, z), bottom y and height. */
  from: [number, number];
  to: [number, number];
  y: number;
  height: number;
  /** Mullion spacing in metres. */
  bay?: number;
}

/** A frameless-looking glass wall with slim dark mullions and head/sill frames. */
export function Glazing({ from, to, y, height, bay = 2.4 }: GlazingProps) {
  const m = useVillaMaterials();
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const angle = -Math.atan2(dz, dx);
  const cx = (from[0] + to[0]) / 2;
  const cz = (from[1] + to[1]) / 2;
  const bays = Math.max(1, Math.round(length / bay));
  const mullions = useMemo(() => Array.from({ length: bays + 1 }, (_, i) => -length / 2 + (i * length) / bays), [bays, length]);

  return (
    <group position={[cx, y, cz]} rotation={[0, angle, 0]}>
      <mesh position={[0, height / 2, 0]} material={m.glass}>
        <boxGeometry args={[length, height, 0.03]} />
      </mesh>
      {mullions.map((x) => (
        <mesh key={x} position={[x, height / 2, 0]} material={m.frame} castShadow>
          <boxGeometry args={[0.07, height, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, height - 0.05, 0]} material={m.frame}>
        <boxGeometry args={[length, 0.1, 0.14]} />
      </mesh>
      <mesh position={[0, 0.04, 0]} material={m.frame}>
        <boxGeometry args={[length, 0.08, 0.14]} />
      </mesh>
    </group>
  );
}

/** Vertical timber fins in front of glazing, filtering low sun. */
export function Louvres({ fromX, toX, z, y, height, spacing = 0.42, material }: { fromX: number; toX: number; z: number; y: number; height: number; spacing?: number; material?: THREE.Material }) {
  const m = useVillaMaterials();
  const xs = useMemo(() => {
    const out: number[] = [];
    for (let x = fromX; x <= toX + 1e-6; x += spacing) out.push(x);
    return out;
  }, [fromX, toX, spacing]);
  return (
    <group>
      {xs.map((x) => (
        <mesh key={x} position={[x, y + height / 2, z]} material={material ?? m.oak} castShadow receiveShadow>
          <boxGeometry args={[0.07, height, 0.32]} />
        </mesh>
      ))}
    </group>
  );
}

/** Frameless glass balustrade with a thin top channel. */
export function GlassRail({ from, to, y, height = 1.05 }: { from: [number, number]; to: [number, number]; y: number; height?: number }) {
  const m = useVillaMaterials();
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const angle = -Math.atan2(dz, dx);
  return (
    <group position={[(from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2]} rotation={[0, angle, 0]}>
      <mesh position={[0, height / 2, 0]} material={m.railGlass}>
        <boxGeometry args={[length, height, 0.02]} />
      </mesh>
      <mesh position={[0, height, 0]} material={m.frame}>
        <boxGeometry args={[length, 0.04, 0.05]} />
      </mesh>
    </group>
  );
}

/** Warm interior back-plane seen through glazing; its emissive glow is driven by the dusk value. */
export function InteriorPlane({ from, to }: { from: Vec3; to: Vec3 }) {
  const m = useVillaMaterials();
  return <Span from={from} to={to} material={m.interior} shadows={false} />;
}

/* ------------------------------------------------------------------ */
/* Water                                                               */
/* ------------------------------------------------------------------ */

interface PoolProps {
  /** Plan rectangle of the water. */
  x: [number, number];
  z: [number, number];
  /** Deck level (top of coping). */
  level: number;
  depth?: number;
  coping?: number;
}

export function Pool({ x, z, level, depth = 1.4, coping = 0.32 }: PoolProps) {
  const m = useVillaMaterials();
  const w = x[1] - x[0];
  const d = z[1] - z[0];
  const cx = (x[0] + x[1]) / 2;
  const cz = (z[0] + z[1]) / 2;

  // One clock drives the shared water normal map: slow drift, never distracting.
  useFrame((_, delta) => {
    const n = m.water.normalMap;
    if (n) {
      n.offset.x += delta * 0.012;
      n.offset.y += delta * 0.008;
    }
  });

  return (
    <group>
      {/* Basin lining */}
      <Block size={[w, depth, d]} position={[cx, level - depth / 2 - 0.06, cz]} material={m.poolLining} shadows={false} />
      {/* Water surface */}
      <mesh position={[cx, level - 0.07, cz]} rotation={[-Math.PI / 2, 0, 0]} material={m.water} receiveShadow>
        <planeGeometry args={[w, d]} />
      </mesh>
      {/* Coping */}
      <Block size={[w + coping * 2, 0.06, coping]} position={[cx, level + 0.01, z[0] - coping / 2]} material={m.coping} />
      <Block size={[w + coping * 2, 0.06, coping]} position={[cx, level + 0.01, z[1] + coping / 2]} material={m.coping} />
      <Block size={[coping, 0.06, d]} position={[x[0] - coping / 2, level + 0.01, cz]} material={m.coping} />
      <Block size={[coping, 0.06, d]} position={[x[1] + coping / 2, level + 0.01, cz]} material={m.coping} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Landscape                                                           */
/* ------------------------------------------------------------------ */

function rand(seed: number) {
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Olive tree in the manner of an architectural model: a split, leaning trunk under smooth,
 * flattened canopy masses (model-maker's foam rather than low-poly facets).
 */
export function OliveTree({ position, scale = 1, seed = 1 }: { position: Vec3; scale?: number; seed?: number }) {
  const m = useVillaMaterials();
  const clumps = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + rand(seed + i) * 0.8;
        const r = i === 0 ? 0 : 0.8 + rand(seed * 3 + i) * 0.7;
        return {
          pos: [Math.cos(a) * r, 2.7 + rand(seed * 5 + i) * 0.7, Math.sin(a) * r] as Vec3,
          s: [1.2 + rand(seed + i * 2) * 0.4, 0.7 + rand(seed + i * 4) * 0.25, 1.15 + rand(seed + i * 6) * 0.4] as Vec3,
          dark: i % 3 === 0,
        };
      }),
    [seed],
  );
  const lean = (rand(seed * 9) - 0.5) * 0.35;
  return (
    <group position={position} scale={scale} rotation={[0, rand(seed) * Math.PI * 2, 0]}>
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, lean]} material={m.trunk} castShadow>
        <cylinderGeometry args={[0.16, 0.26, 1.8, 7]} />
      </mesh>
      <mesh position={[0.25, 1.9, 0]} rotation={[0, 0, lean - 0.5]} material={m.trunk} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1.3, 6]} />
      </mesh>
      <mesh position={[-0.2, 1.95, 0.1]} rotation={[0.2, 0, lean + 0.45]} material={m.trunk} castShadow>
        <cylinderGeometry args={[0.07, 0.13, 1.3, 6]} />
      </mesh>
      {clumps.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.s} material={c.dark ? m.oliveDark : m.olive} castShadow receiveShadow>
          <sphereGeometry args={[0.85, 18, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/** Italian cypress: a narrow lathe-turned flame on a short trunk. */
export function Cypress({ position, height = 7, seed = 1 }: { position: Vec3; height?: number; seed?: number }) {
  const m = useVillaMaterials();
  const geometry = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const radius = Math.sin(Math.pow(t, 0.75) * Math.PI) * (0.55 + rand(seed) * 0.15) * (1 - t * 0.35);
      pts.push(new THREE.Vector2(Math.max(radius, 0.02), t * height));
    }
    return new THREE.LatheGeometry(pts, 20);
  }, [height, seed]);
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} material={m.trunk}>
        <cylinderGeometry args={[0.1, 0.14, 0.5, 6]} />
      </mesh>
      <mesh position={[0, 0.35, 0]} geometry={geometry} material={m.cypress} castShadow receiveShadow />
    </group>
  );
}

/** Sun lounger: frame, reclined back and cushion. */
export function Lounger({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  const m = useVillaMaterials();
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block size={[0.7, 0.28, 1.5]} position={[0, 0.14, 0.15]} material={m.darkTimber} />
      <Block size={[0.66, 0.08, 1.45]} position={[0, 0.32, 0.15]} material={m.fabric} />
      <Block size={[0.66, 0.08, 0.7]} position={[0, 0.55, -0.82]} rotation={[0.85, 0, 0]} material={m.fabric} />
    </group>
  );
}

/** Clipped hedge or lavender bed. */
export function Hedge({ from, to, height = 0.6, material }: { from: [number, number]; to: [number, number]; height?: number; material?: THREE.Material }) {
  const m = useVillaMaterials();
  return <Span from={[from[0], 0, from[1]]} to={[to[0], height, to[1]]} material={material ?? m.oliveDark} />;
}

/* ------------------------------------------------------------------ */
/* Model base and annotation                                           */
/* ------------------------------------------------------------------ */

/**
 * The architectural model base: a lawn-topped block whose sides are cut to show soil strata,
 * seated on a dark base board. Top surface sits at y = 0.
 */
export function ModelBase({ width, depth, height = 2.6 }: { width: number; depth: number; height?: number }) {
  const m = useVillaMaterials();
  const materials = useMemo(() => [m.strata, m.strata, m.lawn, m.baseplate, m.strata, m.strata], [m]);
  return (
    <group>
      <mesh position={[0, -height / 2, 0]} material={materials} receiveShadow>
        <boxGeometry
          args={[width, height, depth]}
          onUpdate={(g) => {
            // Strata repeat along the length of each cut face; lawn tiles every 6 m.
            const uv = g.attributes.uv as THREE.BufferAttribute;
            const faces: [number, number][] = [
              [depth / 10, 1],
              [depth / 10, 1],
              [width / 6, depth / 6],
              [1, 1],
              [width / 10, 1],
              [width / 10, 1],
            ];
            for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) uv.setXY(f * 4 + v, uv.getX(f * 4 + v) * faces[f][0], uv.getY(f * 4 + v) * faces[f][1]);
            uv.needsUpdate = true;
          }}
        />
      </mesh>
      <mesh position={[0, -height - 0.18, 0]} material={m.baseplate} receiveShadow>
        <boxGeometry args={[width + 1.2, 0.36, depth + 1.2]} />
      </mesh>
    </group>
  );
}

interface DimensionProps {
  from: Vec3;
  to: Vec3;
  label: string;
  /** Tick length (metres). */
  tick?: number;
  color?: string;
  children?: ReactNode;
}

/** Text label drawn to a canvas texture and shown as a camera-facing sprite. */
function DimensionText({ position, text, height = 1.1 }: { position: Vec3; text: string; height?: number }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    const g = c.getContext('2d')!;
    const font = '600 44px "Hanken Grotesk Variable", "Segoe UI", system-ui, sans-serif';
    g.font = font;
    const w = Math.ceil(g.measureText(text).width) + 40;
    c.width = w;
    c.height = 72;
    g.font = font;
    g.fillStyle = 'rgba(245, 242, 236, 0.94)';
    g.beginPath();
    g.roundRect(0, 0, w, 72, 8);
    g.fill();
    g.fillStyle = '#20211f';
    g.textBaseline = 'middle';
    g.fillText(text, 20, 38);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [text]);
  useEffect(() => () => texture.dispose(), [texture]);
  const aspect = texture.image.width / texture.image.height;
  return (
    <sprite position={position} scale={[height * aspect, height, 1]} renderOrder={10}>
      <spriteMaterial map={texture} depthTest={false} transparent toneMapped={false} />
    </sprite>
  );
}

/** Architectural dimension line with 45° end ticks and a camera-facing measurement label. */
export function DimensionLine({ from, to, label, tick = 0.6, color = '#20211f' }: DimensionProps) {
  const mid: Vec3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const ticks = useMemo(() => {
    const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
    // 45° architectural slash ticks
    const slash = new THREE.Vector3(-dir.z, 0, dir.x).add(dir).normalize().multiplyScalar(tick / 2);
    const mk = (p: Vec3): [Vec3, Vec3] => [
      [p[0] - slash.x, p[1] - slash.y, p[2] - slash.z],
      [p[0] + slash.x, p[1] + slash.y, p[2] + slash.z],
    ];
    return [mk(from), mk(to)];
  }, [from, to, tick]);
  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={1} transparent opacity={0.85} />
      {ticks.map((pts, i) => (
        <Line key={i} points={pts} color={color} lineWidth={1.6} />
      ))}
      <DimensionText position={[mid[0], mid[1] + 0.7, mid[2]]} text={label} />
    </group>
  );
}
