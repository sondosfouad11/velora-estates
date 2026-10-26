import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { PropertyFilters } from '../../types/property';
import { DEFAULT_FILTERS, parseFilters, serializeFilters } from './filters';

/** Filter state stored in the URL, so filtered listings can be shared and survive reloads. */
export function usePropertyFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  const update = useCallback(
    (patch: Partial<PropertyFilters>, options: { keepPage?: boolean } = {}) => {
      const next = { ...filters, ...patch };
      if (!options.keepPage && !('page' in patch)) next.page = 1;
      setParams(serializeFilters(next), { replace: !('page' in patch), preventScrollReset: true });
    },
    [filters, setParams],
  );

  const reset = useCallback(() => {
    setParams(serializeFilters({ ...DEFAULT_FILTERS, sort: filters.sort }), { preventScrollReset: true });
  }, [filters.sort, setParams]);

  return { filters, update, reset };
}
