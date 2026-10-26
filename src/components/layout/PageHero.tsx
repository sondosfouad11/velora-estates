import type { ReactNode } from 'react';
import styles from './PageHero.module.css';

type Props = {
  title: string;
  lede?: ReactNode;
  eyebrow?: ReactNode;
  /** Background photo (decorative). */
  image: string;
  /** Focal point for object-position, e.g. "50% 40%". */
  focus?: string;
  children?: ReactNode;
};

/** Top band for inner pages: full-bleed villa photo under a charcoal wash, with light text. */
export function PageHero({ title, lede, eyebrow, image, focus = '50% 50%', children }: Props) {
  return (
    <header className={styles.hero}>
      <div className={styles.media} aria-hidden="true">
        <img src={image} alt="" decoding="async" fetchPriority="high" style={{ objectPosition: focus }} />
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
        {children}
      </div>
    </header>
  );
}
