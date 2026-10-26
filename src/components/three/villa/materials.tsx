import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { lawnTexture, pavingTexture, strataTexture, travertineTexture, waterNormalTexture } from './textures';

export interface VillaMaterials {
  travertine: THREE.MeshStandardMaterial;
  render: THREE.MeshStandardMaterial;
  renderWarm: THREE.MeshStandardMaterial;
  slab: THREE.MeshStandardMaterial;
  oak: THREE.MeshStandardMaterial;
  darkTimber: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  railGlass: THREE.MeshStandardMaterial;
  interior: THREE.MeshStandardMaterial;
  paving: THREE.MeshStandardMaterial;
  coping: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  poolLining: THREE.MeshStandardMaterial;
  lawn: THREE.MeshStandardMaterial;
  strata: THREE.MeshStandardMaterial;
  baseplate: THREE.MeshStandardMaterial;
  olive: THREE.MeshStandardMaterial;
  oliveDark: THREE.MeshStandardMaterial;
  cypress: THREE.MeshStandardMaterial;
  trunk: THREE.MeshStandardMaterial;
  lavender: THREE.MeshStandardMaterial;
  fabric: THREE.MeshStandardMaterial;
  copperRoof: THREE.MeshStandardMaterial;
  terracotta: THREE.MeshStandardMaterial;
}

/** Builds every material once per scene; all textures and materials are disposed on unmount. */
function createMaterials(): VillaMaterials {
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  const trav = travertineTexture();
  const pave = pavingTexture();
  const lawn = lawnTexture();
  const strata = strataTexture();
  const waterN = waterNormalTexture();

  return {
    travertine: std({ map: trav, roughness: 0.82, color: '#ffffff' }),
    render: std({ color: '#f1ede4', roughness: 0.9 }),
    renderWarm: std({ color: '#e9dcc6', roughness: 0.92 }),
    slab: std({ color: '#f7f4ee', roughness: 0.7 }),
    oak: std({ color: '#a77b4f', roughness: 0.68 }),
    darkTimber: std({ color: '#4a3c30', roughness: 0.75 }),
    frame: std({ color: '#2a2b28', roughness: 0.45, metalness: 0.6 }),
    glass: std({
      color: '#7c8f95',
      roughness: 0.05,
      metalness: 0.85,
      transparent: true,
      opacity: 0.55,
      envMapIntensity: 2.2,
    }),
    railGlass: std({ color: '#c9d6d6', roughness: 0.05, metalness: 0.5, transparent: true, opacity: 0.22, depthWrite: false }),
    // Interior back-planes: emissive intensity is animated from 0 (day) to warm glow (dusk).
    interior: std({ color: '#d8c7ad', roughness: 1, emissive: new THREE.Color('#ffb46b'), emissiveIntensity: 0 }),
    paving: std({ map: pave, roughness: 0.85 }),
    coping: std({ color: '#ddd3c2', roughness: 0.7 }),
    water: std({
      color: '#3f8e9c',
      roughness: 0.06,
      metalness: 0.25,
      normalMap: waterN,
      normalScale: new THREE.Vector2(0.35, 0.35),
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 1.4,
    }),
    poolLining: std({ color: '#7fb6bb', roughness: 0.6, emissive: new THREE.Color('#3fd0e0'), emissiveIntensity: 0 }),
    lawn: std({ map: lawn, roughness: 1 }),
    strata: std({ map: strata, roughness: 1 }),
    baseplate: std({ color: '#2b2c29', roughness: 0.5, metalness: 0.2 }),
    olive: std({ color: '#9aa180', roughness: 0.95 }),
    oliveDark: std({ color: '#767d5f', roughness: 0.95 }),
    cypress: std({ color: '#4f5a40', roughness: 0.95 }),
    trunk: std({ color: '#6b5a48', roughness: 1 }),
    lavender: std({ color: '#9b98a6', roughness: 1 }),
    fabric: std({ color: '#ece6da', roughness: 1 }),
    copperRoof: std({ color: '#7a5a42', roughness: 0.5, metalness: 0.55 }),
    terracotta: std({ color: '#b87a57', roughness: 0.9 }),
  };
}

const MaterialsContext = createContext<VillaMaterials | null>(null);

export function VillaMaterialsProvider({ children }: { children: ReactNode }) {
  const materials = useMemo(createMaterials, []);
  useEffect(
    () => () => {
      for (const m of Object.values(materials)) {
        for (const key of ['map', 'normalMap'] as const) (m[key] as THREE.Texture | null)?.dispose();
        m.dispose();
      }
    },
    [materials],
  );
  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>;
}

export function useVillaMaterials(): VillaMaterials {
  const m = useContext(MaterialsContext);
  if (!m) throw new Error('useVillaMaterials must be used inside VillaMaterialsProvider');
  return m;
}
