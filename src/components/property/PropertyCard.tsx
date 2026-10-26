import { Bath, BedDouble, Box, Ruler } from 'lucide-react';
import { Link } from 'react-router';
import { PROPERTY_TYPE_LABEL, type PropertySummary } from '../../types/property';
import { formatArea, formatPrice } from '../../utils/format';
import { FavoriteButton } from './FavoriteButton';
import styles from './PropertyCard.module.css';
import { PropertyImage } from './PropertyImage';

interface PropertyCardProps {
  property: PropertySummary;
  layout?: 'grid' | 'list';
  eager?: boolean;
  tone?: 'light' | 'dark';
}

export function PropertyCard({ property: p, layout = 'grid', eager, tone = 'light' }: PropertyCardProps) {
  const href = `/properties/${p.slug}`;
  return (
    <article className={`${styles.card} ${styles[layout]} ${tone === 'dark' ? styles.dark : ''}`}>
      <div className={styles.media}>
        <Link to={href} tabIndex={-1} aria-hidden="true" className={styles.mediaLink}>
          <PropertyImage image={p.coverImage} title={p.title} eager={eager} className={styles.image} />
        </Link>
        <div className={styles.badges}>
          <span className={styles.badge}>{p.status === 'sale' ? 'For sale' : 'To rent'}</span>
          {p.featured && <span className={`${styles.badge} ${styles.featured}`}>Featured</span>}
          {p.modelVariant && (
            <span className={`${styles.badge} ${styles.model}`} title="This listing has an interactive 3D model">
              <Box size={13} strokeWidth={1.8} aria-hidden="true" /> 3D model
            </span>
          )}
        </div>
        <div className={styles.fav}>
          <FavoriteButton id={p.id} title={p.title} />
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.place}>
          {p.town}, {p.district}
        </p>
        <h3 className={styles.title}>
          <Link to={href} className={styles.titleLink}>
            {p.title}
          </Link>
        </h3>
        <p className={styles.price}>{formatPrice(p)}</p>
        <ul className={styles.specs} aria-label="Key details">
          <li>{PROPERTY_TYPE_LABEL[p.type]}</li>
          <li>
            <BedDouble size={16} strokeWidth={1.6} aria-hidden="true" />
            {p.bedrooms} <span className="visually-hidden">bedrooms</span>
          </li>
          <li>
            <Bath size={16} strokeWidth={1.6} aria-hidden="true" />
            {p.bathrooms} <span className="visually-hidden">bathrooms</span>
          </li>
          <li>
            <Ruler size={16} strokeWidth={1.6} aria-hidden="true" />
            {formatArea(p.areaSqm)}
          </li>
        </ul>
      </div>
    </article>
  );
}
