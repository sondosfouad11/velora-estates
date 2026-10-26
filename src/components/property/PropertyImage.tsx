import { useState } from 'react';
import type { PropertyImage as Img } from '../../types/property';
import styles from './PropertyImage.module.css';

interface Props {
  image: Img | null;
  /** Shown in the drawn placeholder when the photo is missing or fails to load. */
  title: string;
  sizes?: string;
  eager?: boolean;
  className?: string;
}

/** Listing photo with lazy loading and an on-brand drawn placeholder if it is missing or fails. */
export function PropertyImage({ image, title, eager, className }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!image || failed) {
    return (
      <div className={`${styles.frame} ${styles.placeholder} ${className ?? ''}`} role="img" aria-label={`${title} (photo unavailable)`}>
        <svg viewBox="0 0 120 80" aria-hidden="true">
          <path d="M10 70h100M20 70V34h46v36M66 46h34v24M20 34l23-16 23 16M78 46v-8h22v8" />
          <path className={styles.accent} d="M20 76h80M20 73v6M100 73v6" />
        </svg>
        <span>Photo unavailable</span>
      </div>
    );
  }

  return (
    <div className={`${styles.frame} ${loaded ? styles.loaded : ''} ${className ?? ''}`}>
      <img
        src={image.url}
        alt={image.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
