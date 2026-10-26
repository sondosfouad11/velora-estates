import { Link, useLocation } from 'react-router';
import { ButtonLink } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  const { pathname } = useLocation();
  return (
    <div className={`container ${styles.page}`}>
      <svg className={styles.plan} viewBox="0 0 320 200" aria-hidden="true">
        <path d="M20 180h280M40 180V60h120v120M160 100h100v80M40 60l60-40 60 40" />
        <path className={styles.missing} d="M190 100v-30h50v30" />
        <path className={styles.dim} d="M40 192h220M40 186v12M260 186v12" />
        <text x="150" y="214" textAnchor="middle">
          ?
        </text>
      </svg>
      <h1 className={styles.title}>This room isn&rsquo;t on the plan</h1>
      <p className={styles.text}>
        Nothing lives at <code>{pathname}</code>. The listing may have been removed, or the address was mistyped.
      </p>
      <div className={styles.actions}>
        <ButtonLink to="/properties">Browse properties</ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Go to the home page
        </ButtonLink>
      </div>
      <p className={styles.small}>
        Looking for someone? <Link to="/agents">See the agents</Link>.
      </p>
    </div>
  );
}
