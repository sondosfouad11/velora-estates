import { PageHero } from '../components/layout/PageHero';
import { PropertyCard } from '../components/property/PropertyCard';
import { Button, ButtonLink } from '../components/ui/Button';
import { PageLoader } from '../components/ui/PageLoader';
import { StatePanel } from '../components/ui/StatePanel';
import { useFavorites } from '../features/favorites/FavoritesContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { propertiesApi } from '../services/properties';
import { plural } from '../utils/format';
import styles from './content.module.css';
import list from './PropertiesPage.module.css';

export default function SavedPage() {
  useDocumentTitle('Saved homes');
  const { ids, clear } = useFavorites();
  const key = ids.join(',');
  const result = useAsync(
    (signal) => (ids.length ? propertiesApi.list({ ids, perPage: 48, sort: 'newest' }, signal) : Promise.resolve(null)),
    [key],
  );

  // Homes may have been unpublished since they were saved; keep the saved order.
  const items = result.data ? ids.map((id) => result.data!.items.find((p) => p.id === id)).filter((p) => p !== undefined) : [];
  const missing = result.data ? ids.length - items.length : 0;

  return (
    <>
      <PageHero
        eyebrow="Your shortlist"
        title="Saved homes"
        image="/uploads/properties/courtyard-pool.jpg"
        focus="50% 55%"
        lede="Homes you save are kept in this browser, so there is no account to create. They stay here until you remove them."
      />
      <div className={`container ${styles.body}`}>
        {ids.length === 0 ? (
          <StatePanel title="No saved homes yet" action={<ButtonLink to="/properties">Browse properties</ButtonLink>}>
            <p>Select the heart on any listing to keep it here for later.</p>
          </StatePanel>
        ) : result.status === 'loading' && !result.data ? (
          <PageLoader label="Loading saved homes" />
        ) : result.status === 'error' ? (
          <StatePanel tone="error" title="Saved homes could not be loaded" action={<Button onClick={result.reload}>Try again</Button>}>
            <p>{result.error.message}</p>
          </StatePanel>
        ) : (
          <>
            <div className={list.toolbar}>
              <h2 className={list.count}>{plural(items.length, 'saved home')}</h2>
              <Button variant="quiet" size="sm" onClick={clear}>
                Remove all
              </Button>
            </div>
            {missing > 0 && <p className={styles.meta}>{plural(missing, 'saved home')} no longer listed and hidden.</p>}
            <ul className={list.grid}>
              {items.map((p) => (
                <li key={p.id}>
                  <PropertyCard property={p} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
