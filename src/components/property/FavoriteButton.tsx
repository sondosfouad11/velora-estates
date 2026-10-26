import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useFavorites } from '../../features/favorites/FavoritesContext';
import styles from './FavoriteButton.module.css';

export function FavoriteButton({ id, title, variant = 'overlay' }: { id: number; title: string; variant?: 'overlay' | 'inline' }) {
  const { has, toggle } = useFavorites();
  const saved = has(id);
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${saved ? styles.saved : ''}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved homes` : `Save ${title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
    >
      <motion.span key={String(saved)} initial={{ scale: saved ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className={styles.icon}>
        <Heart size={18} strokeWidth={1.7} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
      </motion.span>
      {variant === 'inline' && <span>{saved ? 'Saved' : 'Save home'}</span>}
    </button>
  );
}
