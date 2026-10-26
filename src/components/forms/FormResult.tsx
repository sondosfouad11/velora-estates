import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import styles from './forms.module.css';

interface FormResultProps {
  title: string;
  message: string;
  reference: string;
  onReset: () => void;
  resetLabel: string;
}

/** Success state that replaces a submitted form; focus moves to it so screen readers announce it. */
export function FormResult({ title, message, reference, onReset, resetLabel }: FormResultProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <motion.div ref={ref} className={styles.result} tabIndex={-1} role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <svg viewBox="0 0 48 48" className={styles.tick} aria-hidden="true">
        <motion.circle cx="24" cy="24" r="21" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.path d="M15 24.5l6 6 12-13" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.45 }} />
      </svg>
      <h3>{title}</h3>
      <p>{message}</p>
      <p className={styles.reference}>Reference: {reference}</p>
      <button type="button" className={styles.again} onClick={onReset}>
        {resetLabel}
      </button>
    </motion.div>
  );
}
