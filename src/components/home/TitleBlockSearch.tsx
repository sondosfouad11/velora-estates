import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { serializeFilters, DEFAULT_FILTERS } from '../../features/properties/filters';
import { useAsync } from '../../hooks/useAsync';
import { propertiesApi } from '../../services/properties';
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPES, type ListingStatus, type PropertyType } from '../../types/property';
import { formatMoneyCompact } from '../../utils/format';
import styles from './TitleBlockSearch.module.css';

const BUDGETS: Record<ListingStatus, number[]> = {
  sale: [750_000, 1_500_000, 2_500_000, 5_000_000],
  rent: [3_000, 6_000, 10_000, 15_000],
};

/**
 * The hero search, drawn as an architectural title block: bordered cells with small labels,
 * the last cell captioning the model above it.
 */
export function TitleBlockSearch({ caption }: { caption?: { title: string; detail: string; href: string } }) {
  const navigate = useNavigate();
  const meta = useAsync((signal) => propertiesApi.meta(signal), []);
  const [status, setStatus] = useState<ListingStatus>('sale');
  const [town, setTown] = useState('');
  const [type, setType] = useState<PropertyType | ''>('');
  const [budget, setBudget] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = serializeFilters({
      ...DEFAULT_FILTERS,
      status,
      q: town.trim(),
      type,
      maxPrice: budget ? Number(budget) : null,
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form className={styles.block} onSubmit={onSubmit} role="search" aria-label="Search properties">
      <div className={`${styles.cell} ${styles.mode}`} role="group" aria-labelledby="tb-mode-label">
        <span className={styles.label} id="tb-mode-label">
          Looking to
        </span>
        <div className={styles.segmented}>
          {(['sale', 'rent'] as const).map((s) => (
            <label key={s} className={`${styles.segment} ${status === s ? styles.on : ''}`}>
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => {
                  setStatus(s);
                  setBudget('');
                }}
              />
              {s === 'sale' ? 'Buy' : 'Rent'}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.cell}>
        <label className={styles.label} htmlFor="tb-town">
          Where
        </label>
        {meta.status === 'error' ? (
          <input id="tb-town" className={styles.control} placeholder="Town or district" value={town} onChange={(e) => setTown(e.target.value)} />
        ) : (
          <select id="tb-town" className={styles.control} value={town} onChange={(e) => setTown(e.target.value)}>
            <option value="">Anywhere on the coast</option>
            {meta.data?.towns.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} ({t.count})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.cell}>
        <label className={styles.label} htmlFor="tb-type">
          Home type
        </label>
        <select id="tb-type" className={styles.control} value={type} onChange={(e) => setType(e.target.value as PropertyType | '')}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.cell}>
        <label className={styles.label} htmlFor="tb-budget">
          {status === 'sale' ? 'Budget up to' : 'Monthly rent up to'}
        </label>
        <select id="tb-budget" className={styles.control} value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="">No limit</option>
          {BUDGETS[status].map((b) => (
            <option key={b} value={b}>
              {formatMoneyCompact(b)}
              {status === 'rent' ? ' / month' : ''}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.submit}>
        <Search size={18} strokeWidth={1.8} aria-hidden="true" />
        Search homes
      </button>

      {caption && (
        <p className={styles.caption}>
          <span className={styles.label}>Model above</span>
          <Link to={caption.href} className={styles.captionLink}>
            {caption.title}
          </Link>
          <span className={styles.captionDetail}>{caption.detail}</span>
        </p>
      )}
    </form>
  );
}
