import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPage: (page: number) => void;
}

/** Page numbers with ellipses: 1 … 4 5 6 … 12 */
export function pageList(page: number, pages: number): (number | 'gap')[] {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pages, total, perPage, onPage }: PaginationProps) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  return (
    <nav className={styles.nav} aria-label="Pagination">
      <p className={styles.range}>
        Showing {from}–{to} of {total}
      </p>
      <ul className={styles.list}>
        <li>
          <button type="button" className={styles.step} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft size={18} aria-hidden="true" /> <span>Previous</span>
          </button>
        </li>
        {pageList(page, pages).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <button type="button" className={`${styles.num} ${p === page ? styles.current : ''}`} aria-current={p === page ? 'page' : undefined} aria-label={`Page ${p}`} onClick={() => onPage(p)}>
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button type="button" className={styles.step} disabled={page >= pages} onClick={() => onPage(page + 1)}>
            <span>Next</span> <ChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
