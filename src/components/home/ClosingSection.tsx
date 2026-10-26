import { ButtonLink } from '../ui/Button';
import styles from './home.module.css';

export function ClosingSection() {
  return (
    <section className={styles.closing} aria-labelledby="closing-title">
      <div className={`container ${styles.closingInner}`}>
        <h2 id="closing-title" className={styles.closingTitle}>
          Tell us what you are looking for. We will tell you what we would show you first.
        </h2>
        <div className={styles.closingActions}>
          <ButtonLink to="/contact" size="lg">
            Contact the agency
          </ButtonLink>
          <ButtonLink to="/agents" variant="secondary" size="lg">
            Meet the agents
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
