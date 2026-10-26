import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { PropertyMeta } from '../../services/properties';
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPES, type PropertyFilters } from '../../types/property';
import { formatMoneyCompact } from '../../utils/format';
import styles from './FilterPanel.module.css';

const PRICE_STEPS = {
  sale: [250_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 4_000_000, 5_000_000],
  rent: [1_000, 2_000, 3_000, 5_000, 7_500, 10_000, 15_000],
};
const AREA_STEPS = [50, 80, 100, 150, 200, 250, 300, 400];
const BEDS = [1, 2, 3, 4, 5];

interface FilterPanelProps {
  filters: PropertyFilters;
  meta: PropertyMeta | null;
  onChange: (patch: Partial<PropertyFilters>) => void;
  onReset: () => void;
  /** Mobile sheet state. */
  open: boolean;
  onClose: () => void;
}

export function FilterPanel({ filters, meta, onChange, onReset, open, onClose }: FilterPanelProps) {
  const mobile = useMediaQuery('(max-width: 1000px)');
  const [q, setQ] = useState(filters.q);
  const sheet = useRef<HTMLDivElement>(null);

  // Keep the text box in sync with the URL (back/forward, chip removal).
  useEffect(() => setQ(filters.q), [filters.q]);

  // Debounce keyword search so the URL and API are not hit on every keystroke.
  useEffect(() => {
    if (q.trim() === filters.q) return;
    const t = window.setTimeout(() => onChange({ q: q.trim() }), 350);
    return () => window.clearTimeout(t);
  }, [q, filters.q, onChange]);

  useEffect(() => {
    if (!mobile || !open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    sheet.current?.querySelector<HTMLElement>('input, select, button')?.focus();
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobile, open, onClose]);

  const priceSteps = filters.status ? PRICE_STEPS[filters.status] : [];
  const towns = meta?.towns ?? [];

  const body = (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()} aria-label="Filter properties">
      <div className={styles.group}>
        <label className={styles.label} htmlFor="f-q">
          Keyword or place
        </label>
        <div className={styles.searchBox}>
          <Search size={17} strokeWidth={1.7} aria-hidden="true" />
          <input id="f-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Town, district or name" list="f-towns" maxLength={80} />
          <datalist id="f-towns">
            {towns.map((t) => (
              <option key={t.name} value={t.name} />
            ))}
          </datalist>
        </div>
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.label}>Listing</legend>
        <div className={styles.segmented}>
          {[
            { v: '', l: 'All' },
            { v: 'sale', l: 'For sale' },
            { v: 'rent', l: 'To rent' },
          ].map((o) => (
            <label key={o.v} className={filters.status === o.v ? styles.on : ''}>
              <input
                type="radio"
                name="f-status"
                value={o.v}
                checked={filters.status === o.v}
                onChange={() => onChange({ status: o.v as PropertyFilters['status'], minPrice: null, maxPrice: null })}
              />
              {o.l}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.label}>Home type</legend>
        <div className={styles.pills}>
          {[{ v: '', l: 'Any' }, ...PROPERTY_TYPES.map((t) => ({ v: t, l: PROPERTY_TYPE_LABEL[t] }))].map((o) => (
            <label key={o.v} className={`${styles.pill} ${filters.type === o.v ? styles.on : ''}`}>
              <input type="radio" name="f-type" value={o.v} checked={filters.type === o.v} onChange={() => onChange({ type: o.v as PropertyFilters['type'] })} />
              {o.l}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group} disabled={!filters.status}>
        <legend className={styles.label}>{filters.status === 'rent' ? 'Monthly rent' : 'Price'}</legend>
        {!filters.status && <p className={styles.hint}>Choose For sale or To rent to filter by price.</p>}
        <div className={styles.range}>
          <select aria-label="Minimum price" value={filters.minPrice ?? ''} onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : null })}>
            <option value="">No min</option>
            {priceSteps.map((p) => (
              <option key={p} value={p}>
                {formatMoneyCompact(p)}
              </option>
            ))}
          </select>
          <span aria-hidden="true">to</span>
          <select aria-label="Maximum price" value={filters.maxPrice ?? ''} onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}>
            <option value="">No max</option>
            {priceSteps.map((p) => (
              <option key={p} value={p}>
                {formatMoneyCompact(p)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.label}>Bedrooms</legend>
        <div className={styles.segmented}>
          <label className={filters.beds === null ? styles.on : ''}>
            <input type="radio" name="f-beds" checked={filters.beds === null} onChange={() => onChange({ beds: null })} />
            Any
          </label>
          {BEDS.map((b) => (
            <label key={b} className={filters.beds === b ? styles.on : ''}>
              <input type="radio" name="f-beds" checked={filters.beds === b} onChange={() => onChange({ beds: b })} />
              {b}+
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.label}>Living area</legend>
        <div className={styles.range}>
          <select aria-label="Minimum area" value={filters.minArea ?? ''} onChange={(e) => onChange({ minArea: e.target.value ? Number(e.target.value) : null })}>
            <option value="">No min</option>
            {AREA_STEPS.map((a) => (
              <option key={a} value={a}>
                {a} m²
              </option>
            ))}
          </select>
          <span aria-hidden="true">to</span>
          <select aria-label="Maximum area" value={filters.maxArea ?? ''} onChange={(e) => onChange({ maxArea: e.target.value ? Number(e.target.value) : null })}>
            <option value="">No max</option>
            {AREA_STEPS.map((a) => (
              <option key={a} value={a}>
                {a} m²
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <button type="button" className={styles.reset} onClick={onReset}>
        Reset filters
      </button>
    </form>
  );

  if (!mobile) {
    return <aside className={styles.sidebar}>{body}</aside>;
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={sheet}
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.sheetHead}>
              <h2>Filters</h2>
              <button type="button" onClick={onClose} className={styles.close}>
                <X size={22} strokeWidth={1.6} aria-hidden="true" />
                <span className="visually-hidden">Close filters</span>
              </button>
            </div>
            {body}
            <div className={styles.sheetFoot}>
              <Button block onClick={onClose}>
                Show results
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
