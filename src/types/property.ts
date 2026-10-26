export type ListingStatus = 'sale' | 'rent';
export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'house';
export type VillaVariant = 'aurelia' | 'lume' | 'seren';

export const PROPERTY_TYPES: readonly PropertyType[] = ['apartment', 'villa', 'penthouse', 'house'];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  penthouse: 'Penthouse',
  house: 'Contemporary house',
};

export interface PropertyImage {
  id: number;
  url: string;
  alt: string;
  credit: string | null;
  sortOrder: number;
}

/** A room rectangle on the floor plan, in metres from the plan origin. */
export interface FloorPlanRoom {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FloorPlanLevel {
  label: string;
  rooms: FloorPlanRoom[];
}

export interface AgentSummary {
  id: number;
  slug: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  photoUrl: string | null;
}

export interface Agent extends AgentSummary {
  bio: string;
  languages: string[];
  areas: string[];
  listingCount: number;
}

export interface PropertySummary {
  id: number;
  slug: string;
  title: string;
  town: string;
  district: string;
  type: PropertyType;
  status: ListingStatus;
  price: number;
  /** For rentals: price is per month. */
  pricePeriod: 'total' | 'month';
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  featured: boolean;
  coverImage: PropertyImage | null;
  modelVariant: VillaVariant | null;
  createdAt: string;
}

export interface Property extends PropertySummary {
  summary: string;
  description: string;
  plotSqm: number | null;
  yearBuilt: number | null;
  energyRating: string | null;
  amenities: string[];
  images: PropertyImage[];
  floorPlan: FloorPlanLevel[];
  /** Position on the illustrative regional site plan, 0–100 on each axis. */
  mapX: number;
  mapY: number;
  agent: AgentSummary;
  published: boolean;
}

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export interface PropertyFilters {
  q: string;
  status: ListingStatus | '';
  type: PropertyType | '';
  minPrice: number | null;
  maxPrice: number | null;
  beds: number | null;
  minArea: number | null;
  maxArea: number | null;
  sort: SortKey;
  page: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}
