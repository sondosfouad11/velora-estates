import { useVillaMaterials } from './materials';
import { Cypress, DeckWithOpening, DimensionLine, Glazing, GlassRail, Hedge, InteriorPlane, Louvres, Lounger, ModelBase, OliveTree, Pool, Span } from './parts';

/**
 * VILLA AURELIA — the hero model. Original design, built from primitives in metres.
 *
 * Plan (x → east, z → south/sea):
 *   Podium deck at y = 0.9 carries two stacked volumes:
 *   - lower volume: travertine, 24 × 9 m, fully glazed to the south under a 1.4 m canopy
 *   - upper volume: white render, 19 × 8 m, cantilevered 2.6 m past the lower volume's east end,
 *     its south glazing screened by oak louvres
 *   A travertine fin wall runs north–south past the west end; a 20 m pool lies along the south terrace.
 */

export const AURELIA = {
  name: 'Villa Aurelia',
  base: { width: 46, depth: 34 },
  focus: [1.5, 3.2, 1.5] as [number, number, number],
  overallLength: 28.2,
  lights: [
    [-6, 2.8, -1.5],
    [6, 2.8, -1.5],
    [1, 6.3, -3.5],
    [11, 6.3, -3.5],
  ] as [number, number, number][],
};

const F = 0.9; // podium / finished floor level
const L_TOP = F + 3.4; // lower volume ceiling
const L_ROOF = L_TOP + 0.35;
const U_TOP = L_ROOF + 3.2;

export function VillaAurelia({ showDimensions = true, detail = 'high' }: { showDimensions?: boolean; detail?: 'high' | 'low' }) {
  const m = useVillaMaterials();

  return (
    <group>
      <ModelBase width={AURELIA.base.width} depth={AURELIA.base.depth} />

      {/* Podium deck and front steps */}
      <DeckWithOpening x={[-14.5, 14.5]} z={[-8.5, 12]} top={F} hole={{ x: [-9.5, 10.5], z: [6.2, 10] }} material={m.paving} />
      {[0, 1, 2].map((i) => (
        <Span key={i} from={[-3.2, 0, 12 + i * 0.6]} to={[3.2, F * (1 - (i + 1) / 4), 12.6 + i * 0.6]} material={m.paving} tile={4} />
      ))}
      <Span from={[-1.6, 0, 13.8]} to={[1.6, 0.03, 17]} material={m.paving} tile={4} />

      {/* Lower volume — travertine back and west walls */}
      <Span from={[-12, F, -6.2]} to={[12, L_TOP, -5.8]} material={m.travertine} tile={3} />
      <Span from={[-12, F, -6.2]} to={[-11.6, L_TOP, 3]} material={m.travertine} tile={3} />
      <Glazing from={[-11.6, 3]} to={[12, 3]} y={F} height={L_TOP - F} bay={3} />
      <Glazing from={[12, -5.8]} to={[12, 3]} y={F} height={L_TOP - F} bay={2.9} />
      <InteriorPlane from={[-11.5, F, -5.75]} to={[11.9, L_TOP - 0.05, -5.6]} />
      {/* Living furniture glimpsed through the glass */}
      <Span from={[-8, F, -3.2]} to={[-3.5, F + 0.45, -2.2]} material={m.fabric} />
      <Span from={[-8, F, -3.4]} to={[-3.5, F + 0.85, -3.1]} material={m.fabric} />
      <Span from={[1, F, -2.5]} to={[6.5, F + 0.95, -1.4]} material={m.travertine} tile={2} />
      <Span from={[8, F + 0.72, -3]} to={[10.6, F + 0.78, -1.2]} material={m.oak} />

      {/* Lower roof slab with deep south canopy */}
      <Span from={[-12.5, L_TOP, -6.5]} to={[12.8, L_ROOF, 4.4]} material={m.slab} />

      {/* Upper volume — white render, cantilevered east */}
      <Span from={[-4, L_ROOF, -7.2]} to={[15.4, U_TOP, -6.8]} material={m.render} />
      <Span from={[-4, L_ROOF, -7.2]} to={[-3.6, U_TOP, 1]} material={m.render} />
      <Span from={[15, L_ROOF, -7.2]} to={[15.4, U_TOP, 1]} material={m.render} />
      <Span from={[12.8, L_ROOF - 0.35, -7.2]} to={[15.4, L_ROOF, 1]} material={m.slab} />
      <Glazing from={[-3.6, 1]} to={[15, 1]} y={L_ROOF} height={U_TOP - L_ROOF} bay={2.3} />
      <InteriorPlane from={[-3.5, L_ROOF, -6.75]} to={[14.9, U_TOP - 0.05, -6.6]} />
      <Louvres fromX={4.2} toX={14.9} z={1.35} y={L_ROOF} height={U_TOP - L_ROOF} />
      <Span from={[-4.4, U_TOP, -7.6]} to={[15.8, U_TOP + 0.3, 1.9]} material={m.slab} />

      {/* Roof terrace rails */}
      <GlassRail from={[-12.4, 4.3]} to={[12.7, 4.3]} y={L_ROOF} />
      <GlassRail from={[-12.4, -6.4]} to={[-12.4, 4.3]} y={L_ROOF} />
      <GlassRail from={[12.7, 1.9]} to={[12.7, 4.3]} y={L_ROOF} />

      {/* Travertine fin wall reaching into the garden */}
      <Span from={[-12.9, 0, -10]} to={[-12.5, L_ROOF + 0.6, 8.5]} material={m.travertine} tile={3} />

      {/* Pool terrace */}
      <Pool x={[-9.5, 10.5]} z={[6.2, 10]} level={F} />
      <Lounger position={[12.4, F, 6.8]} rotation={Math.PI / 2} />
      <Lounger position={[12.4, F, 8.4]} rotation={Math.PI / 2} />
      <Lounger position={[12.4, F, 10]} rotation={Math.PI / 2} />

      {/* Planting */}
      <Hedge from={[-14.2, 12.1]} to={[-3.6, 12.9]} height={0.55} material={m.lavender} />
      <Hedge from={[3.6, 12.1]} to={[14.2, 12.9]} height={0.55} material={m.lavender} />
      <OliveTree position={[-18, 0, 9]} scale={1.15} seed={3} />
      <OliveTree position={[17.5, 0, 14]} scale={1} seed={7} />
      <OliveTree position={[-8.5, 0, 15.5]} scale={0.9} seed={11} />
      {detail === 'high' && <OliveTree position={[19.5, 0, -2]} scale={1.1} seed={17} />}
      {detail === 'high' && <OliveTree position={[-19, 0, -6]} scale={0.95} seed={23} />}
      {[-15, -11, -7, -3, 1, 5, 9, 13, 17].map((x, i) =>
        detail === 'low' && i % 2 ? null : <Cypress key={x} position={[x, 0, -12.5 + (i % 2) * 0.6]} height={6.5 + (i % 3) * 0.9} seed={i + 1} />,
      )}

      {showDimensions && <DimensionLine from={[-12.9, 0.05, 15.6]} to={[15.4, 0.05, 15.6]} label={`${AURELIA.overallLength.toFixed(1)} m`} />}
    </group>
  );
}
