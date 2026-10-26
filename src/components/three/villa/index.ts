import type { ComponentType } from 'react';
import type { VillaVariant } from '../../../types/property';
import { AURELIA, VillaAurelia } from './VillaAurelia';
import { LUME, VillaLume } from './VillaLume';
import { SEREN, VillaSeren } from './VillaSeren';

export interface VillaModel {
  name: string;
  base: { width: number; depth: number };
  focus: [number, number, number];
  overallLength: number;
  lights: [number, number, number][];
  Component: ComponentType<{ showDimensions?: boolean; detail?: 'high' | 'low' }>;
}

/** Registry of the procedural villa models, keyed by the `model_variant` stored on each listing. */
export const VILLAS: Record<VillaVariant, VillaModel> = {
  aurelia: { ...AURELIA, Component: VillaAurelia },
  lume: { ...LUME, Component: VillaLume },
  seren: { ...SEREN, Component: VillaSeren },
};
