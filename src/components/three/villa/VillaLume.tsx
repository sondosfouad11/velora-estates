import { useMemo } from 'react';
import * as THREE from 'three';
import { useVillaMaterials } from './materials';
import { Cypress, DeckWithOpening, DimensionLine, Glazing, Hedge, InteriorPlane, Lounger, ModelBase, OliveTree, Pool, Span } from './parts';

/**
 * CASA LUME — a contemporary gabled family house. Original design.
 * A tall white gable hall (8 × 16 m, ridge 9.2 m) whose south gable is fully glazed,
 * joined to a low flat-roofed wing clad in dark timber, with a garden pool beside the wing.
 */

export const LUME = {
  name: 'Casa Lume',
  base: { width: 40, depth: 32 },
  focus: [2, 3.6, 1] as [number, number, number],
  overallLength: 22.4,
  lights: [
    [-2, 2.5, 2],
    [-2, 5.5, -3],
    [7.5, 2.4, -1.5],
  ] as [number, number, number][],
};

const F = 0.45;
const EAVE = F + 5.6;
const RIDGE = F + 9.2;
const HALF = 4; // half-width of the gable hall

function gableShape(inset = 0) {
  const s = new THREE.Shape();
  s.moveTo(-HALF + inset, 0);
  s.lineTo(HALF - inset, 0);
  s.lineTo(HALF - inset, EAVE - F - inset * 0.5);
  s.lineTo(0, RIDGE - F - inset);
  s.lineTo(-HALF + inset, EAVE - F - inset * 0.5);
  s.closePath();
  return s;
}

export function VillaLume({ showDimensions = true, detail = 'high' }: { showDimensions?: boolean; detail?: 'high' | 'low' }) {
  const m = useVillaMaterials();

  // Gable hall walls: extruded pentagon shell, depth 16 m along z.
  const hall = useMemo(() => {
    const shape = gableShape();
    shape.holes.push(new THREE.Path(gableShape(0.3).getPoints()));
    return new THREE.ExtrudeGeometry(shape, { depth: 16, bevelEnabled: false });
  }, []);
  const gableGlass = useMemo(() => new THREE.ShapeGeometry(gableShape(0.3)), []);

  // Roof planes: two dark standing-seam slabs following the pitch.
  const pitch = Math.atan2(RIDGE - EAVE, HALF);
  const slope = Math.hypot(RIDGE - EAVE, HALF) + 0.5;

  // Mullions across the glazed gable
  const mullions = [-2.8, -1.4, 0, 1.4, 2.8];

  return (
    <group>
      <ModelBase width={LUME.base.width} depth={LUME.base.depth} />

      {/* Garden terrace */}
      <DeckWithOpening x={[-6.5, 16]} z={[-10, 11]} top={F} hole={{ x: [5, 14.5], z: [6.4, 8.2] }} material={m.paving} />

      {/* Gable hall */}
      <mesh geometry={hall} material={m.render} position={[-2, F, -8]} castShadow receiveShadow />
      <mesh geometry={gableGlass} material={m.glass} position={[-2, F, 7.95]} />
      <mesh geometry={gableGlass} material={m.render} position={[-2, F, -7.9]} castShadow />
      {mullions.map((x) => {
        const h = x === 0 ? RIDGE - F - 0.3 : EAVE - F - 0.15 + (HALF - Math.abs(x)) * ((RIDGE - EAVE) / HALF) - 0.3;
        return <Span key={x} from={[-2 + x - 0.035, F, 7.9]} to={[-2 + x + 0.035, F + h, 8.05]} material={m.frame} />;
      })}
      {[2.6, 5.4].map((y) => (
        <Span key={y} from={[-5.7, F + y, 7.9]} to={[1.7, F + y + 0.07, 8.05]} material={m.frame} />
      ))}
      <InteriorPlane from={[-5.6, F, -7.6]} to={[1.6, EAVE - 0.2, -7.4]} />
      <Span from={[-5.2, F + 2.9, -7.4]} to={[1.2, F + 3.1, 0]} material={m.oak} />

      {/* Roof */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[-2 + side * (HALF / 2 + 0.12), (EAVE + RIDGE) / 2 + 0.12, 0]}
          rotation={[0, 0, -side * pitch]}
          material={m.baseplate}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[slope, 0.18, 16.8]} />
        </mesh>
      ))}

      {/* Timber wing (flat roof), east of the hall */}
      <Span from={[2, F, -6]} to={[13.2, F + 3.4, -5.6]} material={m.darkTimber} />
      <Span from={[12.8, F, -6]} to={[13.2, F + 3.4, 3]} material={m.darkTimber} />
      <Glazing from={[2, 3]} to={[12.8, 3]} y={F} height={3.4} bay={2.7} />
      <InteriorPlane from={[2.1, F, -5.55]} to={[12.7, F + 3.3, -5.4]} />
      <Span from={[1.8, F + 3.4, -6.4]} to={[13.8, F + 3.75, 4.8]} material={m.slab} />
      {/* Covered terrace columns */}
      {[4.5, 8.5, 12.5].map((x) => (
        <Span key={x} from={[x - 0.1, F, 4.5]} to={[x + 0.1, F + 3.4, 4.7]} material={m.frame} />
      ))}

      {/* Garden pool and loungers */}
      <Pool x={[5, 14.5]} z={[6.4, 8.2]} level={F} depth={1.2} />
      <Lounger position={[6.5, F, 9.8]} rotation={Math.PI} />
      <Lounger position={[8.2, F, 9.8]} rotation={Math.PI} />

      {/* Planting */}
      <Hedge from={[-6.5, 11.2]} to={[3, 11.8]} height={0.5} material={m.lavender} />
      <OliveTree position={[-10.5, 0, 6]} seed={5} />
      <OliveTree position={[17.5, 0, 11]} scale={0.85} seed={13} />
      {detail === 'high' && <OliveTree position={[-12, 0, -6]} scale={1.05} seed={19} />}
      {[-8, -4, 1, 6, 11, 15].map((x, i) => (detail === 'low' && i % 2 ? null : <Cypress key={x} position={[x, 0, -12.5]} height={6 + (i % 3)} seed={i + 4} />))}

      {showDimensions && <DimensionLine from={[-6, 0.05, 12.5]} to={[16.4, 0.05, 12.5]} label={`${LUME.overallLength.toFixed(1)} m`} />}
    </group>
  );
}
