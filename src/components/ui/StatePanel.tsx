import type { ReactNode } from 'react';
import styles from './StatePanel.module.css';

interface StatePanelProps {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: 'empty' | 'error';
  /** A drawn plan mark gives empty states a recognisable shape without decoration. */
  compact?: boolean;
}

export function StatePanel({ title, children, action, tone = 'empty', compact }: StatePanelProps) {
  return (
    <div className={`${styles.panel} ${compact ? styles.compact : ''}`} role={tone === 'error' ? 'alert' : 'status'}>
      <svg className={styles.mark} viewBox="0 0 64 48" aria-hidden="true">
        {tone === 'error' ? (
          <>
            <path d="M6 42h52M12 42V14h40v28" />
            <path d="M24 22l16 12M40 22L24 34" />
          </>
        ) : (
          <>
            <path d="M6 42h52M12 42V14h40v28M12 26h18v16M38 14v12h14" />
            <path className={styles.dim} d="M12 6h40M12 3v6M52 3v6" />
          </>
        )}
      </svg>
      <h2 className={styles.title}>{title}</h2>
      {children && <div className={styles.body}>{children}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
