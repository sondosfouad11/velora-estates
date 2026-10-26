import { motion, useReducedMotion } from 'motion/react';
import { Fragment, type ElementType } from 'react';
import styles from './motion.module.css';

interface SplitWordsProps {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
}

/** Headline whose words rise out of a mask, one after another. Screen readers get the plain text. */
export function SplitWords({ text, as: Tag = 'h1', className, delay = 0, stagger = 0.07 }: SplitWordsProps) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className={styles.mask} aria-hidden="true">
            <motion.span
              className={styles.word}
              initial={reduce ? false : { y: '108%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.05, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
