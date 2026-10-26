import styles from './Wordmark.module.css';

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`${styles.mark} ${className ?? ''}`}>
      <span className={styles.name}>Velora</span>
      <span className={styles.rule} aria-hidden="true" />
      <span className={styles.sub}>Estates</span>
    </span>
  );
}
