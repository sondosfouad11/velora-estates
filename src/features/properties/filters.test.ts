import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, activeFilterCount, parseFilters, serializeFilters } from './filters';

describe('parseFilters', () => {
  it('returns defaults for an empty query', () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it('reads valid values', () => {
    const f = parseFilters(new URLSearchParams('q=Capo&status=sale&type=villa&minPrice=500000&beds=3&sort=price-desc&page=2'));
    expect(f).toMatchObject({ q: 'Capo', status: 'sale', type: 'villa', minPrice: 500000, beds: 3, sort: 'price-desc', page: 2 });
  });

  it('ignores hand-edited garbage instead of crashing', () => {
    const f = parseFilters(new URLSearchParams('minPrice=abc&beds=-2&page=0&status=lease&type=castle&sort=random&maxArea=1e9'));
    expect(f).toEqual(DEFAULT_FILTERS);
  });

  it('swaps inverted price and area ranges', () => {
    const f = parseFilters(new URLSearchParams('minPrice=900000&maxPrice=100000&minArea=300&maxArea=80'));
    expect(f).toMatchObject({ minPrice: 100000, maxPrice: 900000, minArea: 80, maxArea: 300 });
  });
});

describe('serializeFilters', () => {
  it('round-trips and omits defaults', () => {
    const f = { ...DEFAULT_FILTERS, status: 'rent' as const, maxPrice: 5000, page: 1 };
    const params = serializeFilters(f);
    expect(params.toString()).toBe('status=rent&maxPrice=5000');
    expect(parseFilters(params)).toEqual(f);
  });

  it('counts active filters, excluding sort and page', () => {
    expect(activeFilterCount({ ...DEFAULT_FILTERS, q: 'x', beds: 2, sort: 'newest', page: 3 })).toBe(2);
  });
});
