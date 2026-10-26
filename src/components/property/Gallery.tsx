import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PropertyImage as Img } from '../../types/property';
import { PropertyImage } from './PropertyImage';
import styles from './Gallery.module.css';

/** Listing gallery: crossfading main image, thumbnail strip, keyboard arrows and a full-screen view. */
export function Gallery({ images, title, extra }: { images: Img[]; title: string; extra?: { label: string; onSelect: () => void } }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [full, setFull] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const count = images.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setDirection(next > index ? 1 : -1);
      setIndex(((next % count) + count) % count);
    },
    [count, index],
  );

  useEffect(() => {
    if (!full) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFull(false);
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      openRef.current?.focus();
    };
  }, [full, go, index]);

  if (count === 0) {
    return <PropertyImage image={null} title={title} className={styles.main} />;
  }

  const current = images[index];

  return (
    <div className={styles.gallery}>
      <div
        className={styles.stage}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title} photos`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(index + 1);
          if (e.key === 'ArrowLeft') go(index - 1);
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current.id}
            className={styles.slide}
            custom={direction}
            initial={{ opacity: 0, clipPath: direction > 0 ? 'inset(0 0 0 12%)' : 'inset(0 12% 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <PropertyImage image={current} title={title} eager={index === 0} className={styles.main} />
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(index - 1)} aria-label="Previous photo">
              <ChevronLeft size={22} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(index + 1)} aria-label="Next photo">
              <ChevronRight size={22} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </>
        )}
        <div className={styles.meta}>
          <span className={styles.counter} aria-live="polite">
            {index + 1} / {count}
          </span>
          <button ref={openRef} type="button" className={styles.expand} onClick={() => setFull(true)}>
            <Expand size={16} strokeWidth={1.8} aria-hidden="true" /> Full screen
          </button>
        </div>
      </div>

      <div className={styles.thumbs} role="list">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            role="listitem"
            className={`${styles.thumb} ${i === index ? styles.thumbOn : ''}`}
            onClick={() => go(i)}
            aria-label={`Show photo ${i + 1}: ${img.alt}`}
            aria-current={i === index}
          >
            <img src={img.url} alt="" loading="lazy" />
          </button>
        ))}
        {extra && (
          <button type="button" role="listitem" className={`${styles.thumb} ${styles.extra}`} onClick={extra.onSelect}>
            {extra.label}
          </button>
        )}
      </div>
      {current.credit && <p className={styles.credit}>{current.credit}</p>}

      <AnimatePresence>
        {full && (
          <motion.div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${title}, photo ${index + 1} of ${count}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button ref={closeRef} type="button" className={styles.close} onClick={() => setFull(false)}>
              <X size={24} aria-hidden="true" />
              <span className="visually-hidden">Close full-screen view</span>
            </button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.img key={current.id} src={current.url} alt={current.alt} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
            </AnimatePresence>
            <div className={styles.lightboxBar}>
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo">
                <ChevronLeft aria-hidden="true" />
              </button>
              <p>
                {current.alt}
                <span>
                  Photo {index + 1} of {count}
                </span>
                {current.credit && <span>{current.credit}</span>}
              </p>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next photo">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
