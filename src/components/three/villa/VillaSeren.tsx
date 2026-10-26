import { useVillaMaterials } from './materials';
import { Block, Cypress, DeckWithOpening, DimensionLine, Glazing, Hedge, InteriorPlane, ModelBase, OliveTree, Pool, Span } from './parts';

/**
 * VILLA SEREN — a single-storey courtyard villa among vineyards. Original design.
 * Four warm-rendered wings (26 × 22 m overall) around a 12 × 10 m courtyard, with deep
 * colonnaded loggias facing inwards and a long reflecting pool down the courtyard's axis.
 */

export const SEREN = {
  name: 'Villa Seren',
  base: { width: 44, depth: 36 },
  focus: [0, 1.6, 0] as [number, number, number],
  overallLength: 26,
  lights: [
    [0, 2.6, -8.5],
    [-10.5, 2.6, 2],
    [10.5, 2.6, 0],
  ] as [number, number, number][],
};

const F = 0.5;
const WALL = F + 3.6;
const ROOF = WALL + 0.4;

// Outer footprint and courtyard (plan, metres)
const OX: [number, number] = [-13, 13];
const OZ: [number, number] = [-11, 11];
const CX: [number, number] = [-6, 6];
const CZ: [number, number] = [-5, 5];

function Colonnade({ from, to, z, x, count }: { from: number; to: number; z?: number; x?: number; count: number }) {
  const m = useVillaMaterials();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const t = from + ((to - from) * i) / (count - 1);
        const pos: [number, number, number] = x !== undefined ? [x, (F + WALL) / 2, t] : [t, (F + WALL) / 2, z!];
        return <Block key={i} size={[0.34, WALL - F, 0.34]} position={pos} material={m.travertine} tile={2} />;
      })}
    </>
  );
}

export function VillaSeren({ showDimensions = true, detail = 'high' }: { showDimensions?: boolean; detail?: 'high' | 'low' }) {
  const m = useVillaMaterials();
  const loggia = 2.2; // depth of the covered walkway inside the courtyard

  return (
    <group>
      <ModelBase width={SEREN.base.width} depth={SEREN.base.depth} />

      {/* Plinth of the house */}
      <DeckWithOpening x={[OX[0] - 1, OX[1] + 1]} z={[OZ[0] - 1, OZ[1] + 1.6]} top={F} hole={{ x: [-1.2, 1.2], z: [-3.6, 6.8] }} material={m.paving} />

      {/* North wing (back) */}
      <Span from={[OX[0], F, OZ[0]]} to={[OX[1], WALL, CZ[0] - loggia]} material={m.renderWarm} />
      {/* West and east wings */}
      <Span from={[OX[0], F, CZ[0] - loggia]} to={[CX[0] - loggia, WALL, OZ[1]]} material={m.renderWarm} />
      <Span from={[CX[1] + loggia, F, CZ[0] - loggia]} to={[OX[1], WALL, CZ[1] + loggia]} material={m.renderWarm} />
      {/* South side: low travertine garden wall with a central gate opening */}
      <Span from={[CX[0] - loggia, F, OZ[1] - 0.4]} to={[-1.6, F + 2.2, OZ[1]]} material={m.travertine} tile={3} />
      <Span from={[1.6, F, OZ[1] - 0.4]} to={[OX[1], F + 2.2, OZ[1]]} material={m.travertine} tile={3} />
      <Span from={[OX[1] - 0.4, F, CZ[1] + loggia]} to={[OX[1], F + 2.2, OZ[1]]} material={m.travertine} tile={3} />

      {/* Courtyard-facing glazing behind the loggias */}
      <Glazing from={[CX[0] - loggia, CZ[0] - loggia]} to={[CX[1] + loggia, CZ[0] - loggia]} y={F} height={WALL - F - 0.2} bay={2.6} />
      <Glazing from={[CX[0] - loggia, CZ[0] - loggia]} to={[CX[0] - loggia, CZ[1] + loggia]} y={F} height={WALL - F - 0.2} bay={2.4} />
      <Glazing from={[CX[1] + loggia, CZ[0] - loggia]} to={[CX[1] + loggia, CZ[1] + loggia]} y={F} height={WALL - F - 0.2} bay={2.4} />
      <InteriorPlane from={[CX[0] - loggia + 0.1, F, CZ[0] - loggia - 0.3]} to={[CX[1] + loggia - 0.1, WALL - 0.3, CZ[0] - loggia - 0.15]} />

      {/* Deep roof slabs over each wing and its loggia */}
      <Span from={[OX[0] - 0.4, WALL, OZ[0] - 0.4]} to={[OX[1] + 0.4, ROOF, CZ[0]]} material={m.slab} />
      <Span from={[OX[0] - 0.4, WALL, CZ[0]]} to={[CX[0], ROOF, OZ[1] + 0.4]} material={m.slab} />
      <Span from={[CX[1], WALL, CZ[0]]} to={[OX[1] + 0.4, ROOF, CZ[1] + loggia + 0.4]} material={m.slab} />

      <Colonnade from={CX[0]} to={CX[1]} z={CZ[0]} count={6} />
      <Colonnade from={CZ[0] + 2.5} to={CZ[1] + 5} x={CX[0]} count={5} />
      <Colonnade from={CZ[0] + 2.5} to={CZ[1]} x={CX[1]} count={4} />

      {/* Courtyard: reflecting pool on the axis, planted beds either side */}
      <Pool x={[-1.2, 1.2]} z={[-3.6, 6.8]} level={F} depth={0.6} coping={0.25} />
      <Hedge from={[-4.8, -3]} to={[-2.4, 3]} height={F + 0.4} material={m.lavender} />
      <Hedge from={[2.4, -3]} to={[4.8, 3]} height={F + 0.4} material={m.lavender} />
      <OliveTree position={[-3.6, F, 4.6]} scale={0.75} seed={29} />

      {/* Vineyard rows outside the walls */}
      {Array.from({ length: detail === 'high' ? 7 : 4 }, (_, i) => (
        <Hedge key={i} from={[-20, 13.5 + i * 0.9 * (detail === 'high' ? 1 : 1.6)]} to={[20, 13.8 + i * 0.9 * (detail === 'high' ? 1 : 1.6)]} height={0.9} material={m.olive} />
      ))}
      {[-19, -15, 15, 19].map((x, i) => (
        <Cypress key={x} position={[x, 0, -14 + (i % 2) * 2]} height={7 + (i % 2)} seed={i + 9} />
      ))}
      <Cypress position={[-2.6, 0, 13]} height={6.5} seed={3} />
      <Cypress position={[2.6, 0, 13]} height={6.8} seed={4} />
      <OliveTree position={[17.5, 0, 2]} seed={31} />

      {showDimensions && <DimensionLine from={[OX[0], 0.05, -16]} to={[OX[1], 0.05, -16]} label={`${SEREN.overallLength.toFixed(1)} m`} />}
    </group>
  );
}
