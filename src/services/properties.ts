import agentData from '../data/agents.json';
import propertyData from '../data/properties.json';
import type { Agent, Paginated, Property, PropertyFilters, PropertySummary } from '../types/property';
import { ApiError } from './http';

/**
 * Listings and agents are bundled with the site (src/data/*.json), so it runs as a plain static
 * site with no server. The functions keep the same shape a real API would return.
 */
const properties = (propertyData as unknown as Property[]).filter((p) => p.published);
const agents = agentData as unknown as Agent[];

export interface PropertyMeta {
  towns: { name: string; count: number }[];
  ranges: { status: 'sale' | 'rent'; minPrice: number; maxPrice: number; minArea: number; maxArea: number; count: number }[];
}

export interface AgentWithListings extends Agent {
  listings: PropertySummary[];
}

export function filtersToQuery(f: Partial<PropertyFilters>): Record<string, string | number | null | undefined> {
  return {
    q: f.q,
    status: f.status,
    type: f.type,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    beds: f.beds,
    minArea: f.minArea,
    maxArea: f.maxArea,
    sort: f.sort,
    page: f.page,
  };
}

const MAX_PER_PAGE = 48;
const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function summary(p: Property): PropertySummary {
  return {
    id: p.id, slug: p.slug, title: p.title, town: p.town, district: p.district, type: p.type, status: p.status, price: p.price,
    pricePeriod: p.pricePeriod, bedrooms: p.bedrooms, bathrooms: p.bathrooms, areaSqm: p.areaSqm, featured: p.featured,
    coverImage: p.images[0] ?? null, modelVariant: p.modelVariant, createdAt: p.createdAt,
  };
}

const SORTS: Record<PropertyFilters['sort'], (a: Property, b: Property) => number> = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  'price-asc': (a, b) => a.price - b.price || a.id - b.id,
  'price-desc': (a, b) => b.price - a.price || b.id - a.id,
};

function search(f: Partial<PropertyFilters> & { perPage?: number; featured?: boolean; ids?: number[]; agentId?: number }) {
  const q = (f.q ?? '').trim().toLowerCase();
  const items = properties
    .filter((p) => !q || [p.title, p.town, p.district, p.summary].some((v) => v.toLowerCase().includes(q)))
    .filter((p) => !f.status || p.status === f.status)
    .filter((p) => !f.type || p.type === f.type)
    .filter((p) => f.minPrice == null || p.price >= f.minPrice)
    .filter((p) => f.maxPrice == null || p.price <= f.maxPrice)
    .filter((p) => f.beds == null || p.bedrooms >= f.beds)
    .filter((p) => f.minArea == null || p.areaSqm >= f.minArea)
    .filter((p) => f.maxArea == null || p.areaSqm <= f.maxArea)
    .filter((p) => !f.featured || p.featured)
    .filter((p) => !f.ids?.length || f.ids.includes(p.id))
    .filter((p) => f.agentId == null || p.agent.id === f.agentId)
    .sort(SORTS[f.sort ?? 'featured'] ?? SORTS.featured);

  const perPage = Math.max(1, Math.min(MAX_PER_PAGE, f.perPage ?? 9));
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const page = Math.min(Math.max(1, f.page ?? 1), pages);
  return { items: items.slice((page - 1) * perPage, page * perPage).map(summary), total: items.length, page, perPage, pages };
}

const missing = (what: string) => new ApiError(`${what} not found.`, 404);

export const propertiesApi = {
  async list(filters: Partial<PropertyFilters> & { perPage?: number; featured?: boolean; ids?: number[] }, _signal?: AbortSignal): Promise<Paginated<PropertySummary>> {
    await delay();
    return search(filters);
  },
  async get(slug: string, _signal?: AbortSignal): Promise<Property> {
    await delay();
    const found = properties.find((p) => p.slug === slug);
    if (!found) throw missing('Property');
    return found;
  },
  /** Same listing status, ranked by matching type, then town, then closeness in price. */
  async similar(slug: string, _signal?: AbortSignal): Promise<PropertySummary[]> {
    await delay();
    const base = properties.find((p) => p.slug === slug);
    if (!base) throw missing('Property');
    return properties
      .filter((p) => p.id !== base.id && p.status === base.status)
      .sort(
        (a, b) =>
          Number(b.type === base.type) - Number(a.type === base.type) ||
          Number(b.town === base.town) - Number(a.town === base.town) ||
          Math.abs(a.price - base.price) - Math.abs(b.price - base.price),
      )
      .slice(0, 3)
      .map(summary);
  },
  async meta(_signal?: AbortSignal): Promise<PropertyMeta> {
    await delay();
    const towns = new Map<string, number>();
    for (const p of properties) towns.set(p.town, (towns.get(p.town) ?? 0) + 1);
    const ranges = (['sale', 'rent'] as const).flatMap((status) => {
      const group = properties.filter((p) => p.status === status);
      if (!group.length) return [];
      const prices = group.map((p) => p.price);
      const areas = group.map((p) => p.areaSqm);
      return [{ status, minPrice: Math.min(...prices), maxPrice: Math.max(...prices), minArea: Math.min(...areas), maxArea: Math.max(...areas), count: group.length }];
    });
    return { towns: [...towns].sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, count })), ranges };
  },
};

export const agentsApi = {
  async list(_signal?: AbortSignal): Promise<Agent[]> {
    await delay();
    return agents;
  },
  async get(slug: string, _signal?: AbortSignal): Promise<AgentWithListings> {
    await delay();
    const agent = agents.find((a) => a.slug === slug);
    if (!agent) throw missing('Agent');
    return { ...agent, listings: search({ agentId: agent.id, perPage: MAX_PER_PAGE }).items };
  },
};
