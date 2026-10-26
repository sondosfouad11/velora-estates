import styles from './PageLoader.module.css';

/** Route-level loading state: a drawn line that extends across the top of the content area. */
export function PageLoader({ label = 'Loading page' }: { label?: string }) {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.line} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={`${styles.skeleton} ${className ?? ''}`} style={style} aria-hidden="true" />;
}
