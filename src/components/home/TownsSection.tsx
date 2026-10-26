import { Link } from 'react-router';
import { useAsync } from '../../hooks/useAsync';
import { propertiesApi } from '../../services/properties';
import { CoastMap } from '../property/CoastMap';
import styles from './home.module.css';

const CHARACTER: Record<string, string> = {
  'Capo Lume': 'Headland villas around the lighthouse, facing the western sea.',
  Marevento: 'The coast’s busiest resort town, with a long sandy bay.',
  Portalba: 'Old harbour, converted warehouses and the evening passeggiata.',
  'Riva Celeste': 'Newer seafront district with a marina and the pine wood.',
  'Castel Ombra': 'Stone hill village above vineyards, twenty minutes inland.',
  Valdorsa: 'Quiet valley of olive groves and contemporary houses.',
};

export function TownsSection() {
  const meta = useAsync((signal) => propertiesApi.meta(signal), []);
  const counts = meta.data ? Object.fromEntries(meta.data.towns.map((t) => [t.name, t.count])) : undefined;

  return (
    <section className={styles.towns} aria-labelledby="towns-title">
      <div className={`container ${styles.townsGrid}`}>
        <div>
          <h2 id="towns-title" className={styles.h2}>
            Six towns, one coastline
          </h2>
          <ul className={styles.townList}>
            {Object.entries(CHARACTER).map(([name, text]) => (
              <li key={name}>
                <Link to={`/properties?q=${encodeURIComponent(name)}`} className={styles.townLink}>
                  <span className={styles.townName}>{name}</span>
                  <span className={styles.townCount}>{counts ? `${counts[name] ?? 0} homes` : ''}</span>
                </Link>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <CoastMap townCounts={counts ?? {}} />
      </div>
    </section>
  );
}
