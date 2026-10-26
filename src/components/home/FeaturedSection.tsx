import { motion, useReducedMotion } from 'motion/react';
import { useAsync } from '../../hooks/useAsync';
import { propertiesApi } from '../../services/properties';
import { PropertyCard } from '../property/PropertyCard';
import { ButtonLink, Button } from '../ui/Button';
import { Skeleton } from '../ui/PageLoader';
import { StatePanel } from '../ui/StatePanel';
import styles from './home.module.css';

export function FeaturedSection() {
  const reduce = useReducedMotion();
  const featured = useAsync((signal) => propertiesApi.list({ featured: true, perPage: 6, sort: 'featured' }, signal), []);
  const all = useAsync((signal) => propertiesApi.list({ perPage: 1 }, signal), []);

  return (
    <section className={`on-dark ${styles.featured}`} aria-labelledby="featured-title">
      <div className="container">
        <header className={styles.sectionHead}>
          <h2 id="featured-title" className={styles.h2}>
            Featured homes
          </h2>
          <p className={styles.sectionLede}>
            Six listings our agents are showing this month, from a cliff-top villa with a model you can turn to a loft in the old boatyard.
          </p>
          <ButtonLink to="/properties" variant="light" className={styles.headAction}>
            {all.data ? `View all ${all.data.total} properties` : 'View all properties'}
          </ButtonLink>
        </header>

        {featured.status === 'error' && !featured.data ? (
          <StatePanel tone="error" title="Featured homes could not be loaded" action={<Button variant="light" onClick={featured.reload}>Try again</Button>}>
            <p>{featured.error.message}</p>
          </StatePanel>
        ) : (
          <div className={styles.featuredGrid}>
            {featured.data
              ? featured.data.items.map((p, i) => (
                  <motion.div
                    key={p.id}
                    className={styles.featuredItem}
                    initial={reduce ? false : { opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                    transition={{ duration: 0.9, delay: (i % 3) * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <PropertyCard property={p} tone="dark" />
                  </motion.div>
                ))
              : Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className={styles.featuredItem}>
                    <Skeleton style={{ aspectRatio: '4 / 3', opacity: 0.15 }} />
                    <Skeleton style={{ height: 22, width: '60%', marginTop: 16, opacity: 0.15 }} />
                  </div>
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
