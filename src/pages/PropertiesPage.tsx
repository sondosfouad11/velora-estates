import { PageHero } from '../components/layout/PageHero';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { PropertyCard } from '../components/property/PropertyCard';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/PageLoader';
import { StatePanel } from '../components/ui/StatePanel';
import { FilterPanel } from '../features/properties/FilterPanel';
import { activeFilterCount, SORTS } from '../features/properties/filters';
import { Pagination } from '../features/properties/Pagination';
import { usePropertyFilters } from '../features/properties/usePropertyFilters';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { propertiesApi } from '../services/properties';
import { PROPERTY_TYPE_LABEL, type PropertyFilters } from '../types/property';
import { formatMoneyCompact, plural } from '../utils/format';
import styles from './PropertiesPage.module.css';

const VIEW_KEY = 'velora:listing-view';

interface Chip {
  key: string;
  label: string;
  clear: Partial<PropertyFilters>;
}

function chipList(f: PropertyFilters): Chip[] {
  const chips: Chip[] = [];
  if (f.q) chips.push({ key: 'q', label: `“${f.q}”`, clear: { q: '' } });
  if (f.status)
    chips.push({
      key: 'status',
      label: f.status === 'sale' ? 'For sale' : 'To rent',
      clear: { status: '' },
    });
  if (f.type)
    chips.push({
      key: 'type',
      label: PROPERTY_TYPE_LABEL[f.type],
      clear: { type: '' },
    });
  if (f.minPrice !== null || f.maxPrice !== null) {
    const label =
      f.minPrice !== null && f.maxPrice !== null
        ? `${formatMoneyCompact(f.minPrice)} – ${formatMoneyCompact(f.maxPrice)}`
        : f.minPrice !== null
          ? `From ${formatMoneyCompact(f.minPrice)}`
          : `Up to ${formatMoneyCompact(f.maxPrice!)}`;
    chips.push({
      key: 'price',
      label,
      clear: { minPrice: null, maxPrice: null },
    });
  }
  if (f.beds !== null)
    chips.push({
      key: 'beds',
      label: `${f.beds}+ bedrooms`,
      clear: { beds: null },
    });
  if (f.minArea !== null || f.maxArea !== null) {
    const label =
      f.minArea !== null && f.maxArea !== null
        ? `${f.minArea}–${f.maxArea} m²`
        : f.minArea !== null
          ? `From ${f.minArea} m²`
          : `Up to ${f.maxArea} m²`;
    chips.push({ key: 'area', label, clear: { minArea: null, maxArea: null } });
  }
  return chips;
}

export default function PropertiesPage() {
  const { filters, update, reset } = usePropertyFilters();
  const [view, setView] = useState<'grid' | 'list'>(() => {
    try {
      return window.localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const resultsTop = useRef<HTMLElement>(null);
  const key = JSON.stringify(filters);
  const result = useAsync((signal) => propertiesApi.list({ ...filters, perPage: 9 }, signal), [key]);
  const meta = useAsync((signal) => propertiesApi.meta(signal), []);
  const chips = chipList(filters);
  const count = activeFilterCount(filters);

  useDocumentTitle(filters.status === 'rent' ? 'Homes to rent' : filters.status === 'sale' ? 'Homes for sale' : 'Properties');

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* storage unavailable: the choice lasts for this visit only */
    }
  }, [view]);

  const goToPage = (page: number) => {
    update({ page });
    resultsTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const data = result.data;
  const loadingFirst = result.status === 'loading' && !data;

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Listings"
        title="Homes on the Costa Verenna"
        image="/uploads/properties/white-modern-villa.jpg"
        focus="50% 35%"
        lede="Search every published listing. Your filters live in the address bar, so any search can be shared or bookmarked."
      />

      <div className={`container ${styles.layout}`}>
        <FilterPanel
          filters={filters}
          meta={meta.data}
          onChange={update}
          onReset={reset}
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
        />

        <section className={styles.results} aria-labelledby="results-heading" ref={resultsTop}>
          <div className={styles.toolbar}>
            <h2 id="results-heading" className={styles.count} aria-live="polite">
              {loadingFirst ? 'Loading homes…' : data ? plural(data.total, 'home') : 'Results'}
            </h2>
            <div className={styles.tools}>
              <Button
                variant="secondary"
                size="sm"
                className={styles.filterToggle}
                icon={<SlidersHorizontal aria-hidden="true" />}
                onClick={() => setPanelOpen(true)}
              >
                Filters{count ? ` (${count})` : ''}
              </Button>
              <label className={styles.sort}>
                <span className="visually-hidden">Sort by</span>
                <select value={filters.sort} onChange={(e) => update({ sort: e.target.value as PropertyFilters['sort'] })}>
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.viewSwitch} role="group" aria-label="Layout">
                <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')} title="Grid view">
                  <LayoutGrid size={18} strokeWidth={1.6} aria-hidden="true" />
                  <span className="visually-hidden">Grid view</span>
                </button>
                <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} title="List view">
                  <List size={18} strokeWidth={1.6} aria-hidden="true" />
                  <span className="visually-hidden">List view</span>
                </button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className={styles.chips} aria-label="Active filters">
              <AnimatePresence initial={false}>
                {chips.map((c) => (
                  <motion.li
                    key={c.key}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button type="button" className={styles.chip} onClick={() => update(c.clear)} aria-label={`Remove filter: ${c.label}`}>
                      {c.label}
                      <X size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
              <li>
                <button type="button" className={styles.clearAll} onClick={reset}>
                  Clear all filters
                </button>
              </li>
            </ul>
          )}

          {result.status === 'error' && (
            <StatePanel tone="error" title="Listings could not be loaded" action={<Button onClick={result.reload}>Try again</Button>}>
              <p>{result.error.message}</p>
            </StatePanel>
          )}

          {loadingFirst && (
            <div className={view === 'grid' ? styles.grid : styles.list} aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i}>
                  <Skeleton style={{ aspectRatio: '4 / 3' }} />
                  <Skeleton style={{ height: 22, width: '70%', marginTop: 16 }} />
                  <Skeleton style={{ height: 16, width: '45%', marginTop: 10 }} />
                </div>
              ))}
            </div>
          )}

          {data && data.total === 0 && result.status !== 'error' && (
            <StatePanel
              title="No homes match this search"
              action={
                <>
                  <Button onClick={reset}>Clear all filters</Button>
                  {chips.length > 1 && (
                    <Button variant="secondary" onClick={() => update(chips[chips.length - 1].clear)}>
                      Remove {chips[chips.length - 1].label}
                    </Button>
                  )}
                </>
              }
            >
              <p>
                Try a wider price range or fewer bedrooms.{' '}
                {filters.status === 'rent' ? 'Rentals are priced per month.' : 'Villas on this coast start at around $3m.'}
              </p>
            </StatePanel>
          )}

          {data && data.total > 0 && result.status !== 'error' && (
            <LayoutGroup>
              <ul
                className={`${view === 'grid' ? styles.grid : styles.list} ${result.status === 'loading' ? styles.stale : ''}`}
                aria-busy={result.status === 'loading'}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {data.items.map((p, i) => (
                    <motion.li
                      key={p.id}
                      layout="position"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.45,
                          delay: i * 0.035,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.97,
                        transition: { duration: 0.18 },
                      }}
                    >
                      <PropertyCard property={p} layout={view} eager={i < 3} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </LayoutGroup>
          )}

          {data && data.pages > 1 && (
            <Pagination page={data.page} pages={data.pages} total={data.total} perPage={data.perPage} onPage={goToPage} />
          )}
        </section>
      </div>
    </div>
  );
}
