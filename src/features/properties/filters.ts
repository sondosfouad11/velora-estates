import { PROPERTY_TYPES, type PropertyFilters, type PropertyType, type SortKey } from '../../types/property';

export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured first' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
];

export const DEFAULT_FILTERS: PropertyFilters = {
  q: '',
  status: '',
  type: '',
  minPrice: null,
  maxPrice: null,
  beds: null,
  minArea: null,
  maxArea: null,
  sort: 'featured',
  page: 1,
};

function posInt(value: string | null, max = 1_000_000_000): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n > 0 && n < max ? n : null;
}

/** Parse URL search params leniently: anything invalid falls back to the default. */
export function parseFilters(params: URLSearchParams): PropertyFilters {
  const status = params.get('status');
  const type = params.get('type');
  const sort = params.get('sort');
  let minPrice = posInt(params.get('minPrice'));
  let maxPrice = posInt(params.get('maxPrice'));
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
  let minArea = posInt(params.get('minArea'), 100_000);
  let maxArea = posInt(params.get('maxArea'), 100_000);
  if (minArea !== null && maxArea !== null && minArea > maxArea) [minArea, maxArea] = [maxArea, minArea];
  const beds = posInt(params.get('beds'), 11);

  return {
    q: (params.get('q') ?? '').trim().slice(0, 80),
    status: status === 'sale' || status === 'rent' ? status : '',
    type: PROPERTY_TYPES.includes(type as PropertyType) ? (type as PropertyType) : '',
    minPrice,
    maxPrice,
    beds,
    minArea,
    maxArea,
    sort: SORTS.some((s) => s.value === sort) ? (sort as SortKey) : 'featured',
    page: posInt(params.get('page'), 10_000) ?? 1,
  };
}

/** Serialize only non-default values, in a stable order, so URLs stay short and shareable. */
export function serializeFilters(f: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.q) params.set('q', f.q);
  if (f.status) params.set('status', f.status);
  if (f.type) params.set('type', f.type);
  if (f.minPrice !== null) params.set('minPrice', String(f.minPrice));
  if (f.maxPrice !== null) params.set('maxPrice', String(f.maxPrice));
  if (f.beds !== null) params.set('beds', String(f.beds));
  if (f.minArea !== null) params.set('minArea', String(f.minArea));
  if (f.maxArea !== null) params.set('maxArea', String(f.maxArea));
  if (f.sort !== 'featured') params.set('sort', f.sort);
  if (f.page > 1) params.set('page', String(f.page));
  return params;
}

export function activeFilterCount(f: PropertyFilters): number {
  return [f.q, f.status, f.type, f.minPrice, f.maxPrice, f.beds, f.minArea, f.maxArea].filter((v) => v !== '' && v !== null).length;
}
