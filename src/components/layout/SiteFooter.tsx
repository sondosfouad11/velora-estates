import { Link } from 'react-router';
import { CREDIT_NAME } from '../../config/credit';
import { Wordmark } from '../ui/Wordmark';
import styles from './SiteFooter.module.css';

const TOWNS = ['Capo Lume', 'Marevento', 'Portalba', 'Riva Celeste', 'Castel Ombra', 'Valdorsa'];

export function SiteFooter() {
  return (
    <footer className={`on-dark ${styles.footer}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <Wordmark className={styles.wordmark} />
          <p className={styles.lede}>Homes on the Costa Verenna, presented the way an architect presents a project.</p>
        </div>

        <nav aria-label="Explore" className={styles.col}>
          <h2 className={styles.heading}>Explore</h2>
          <Link to="/properties">All properties</Link>
          <Link to="/properties?status=sale">Homes for sale</Link>
          <Link to="/properties?status=rent">Homes to rent</Link>
          <Link to="/saved">Saved homes</Link>
        </nav>

        <nav aria-label="Towns" className={styles.col}>
          <h2 className={styles.heading}>Towns</h2>
          {TOWNS.map((town) => (
            <Link key={town} to={`/properties?q=${encodeURIComponent(town)}`}>
              {town}
            </Link>
          ))}
        </nav>

        <nav aria-label="Agency" className={styles.col}>
          <h2 className={styles.heading}>Agency</h2>
          <Link to="/about">Our approach</Link>
          <Link to="/agents">Agents</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>
      </div>

      <div className={`container ${styles.legal}`}>
        <p>© {new Date().getFullYear()} VELORA ESTATES. All rights reserved.</p>
        {CREDIT_NAME && <p className={styles.year}>Website by {CREDIT_NAME}</p>}
      </div>
    </footer>
  );
}
