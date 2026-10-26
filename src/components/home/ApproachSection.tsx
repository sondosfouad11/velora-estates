import { useAsync } from '../../hooks/useAsync';
import { propertiesApi } from '../../services/properties';
import { FloorPlan } from '../property/FloorPlan';
import { ButtonLink } from '../ui/Button';
import { Skeleton } from '../ui/PageLoader';
import styles from './home.module.css';

const PRACTICES = [
  {
    title: 'Walked and measured',
    text: 'Every listing starts with an agent visit and a measured room schedule, so the area we quote is the area you walk through.',
  },
  {
    title: 'Drawn, not only photographed',
    text: 'Plans are drawn from that schedule. The bedrooms, the square metres and the plan on the page always agree.',
  },
  {
    title: 'Modelled where it matters',
    text: 'Selected homes get a 3D model you can turn, light at dusk and walk around before you book a viewing.',
  },
];

export function ApproachSection() {
  const sample = useAsync((signal) => propertiesApi.get('villa-aurelia', signal), []);
  return (
    <section id="approach" className={styles.approach} aria-labelledby="approach-title">
      <div className={`container ${styles.approachGrid}`}>
        <div>
          <h2 id="approach-title" className={styles.h2}>
            We present a home the way its architect would.
          </h2>
          <ol className={styles.practices}>
            {PRACTICES.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
          <ButtonLink to="/about" variant="secondary">
            Read about the agency
          </ButtonLink>
        </div>
        <div className={styles.approachPlan}>
          {sample.data ? (
            <>
              <FloorPlan levels={sample.data.floorPlan} areaSqm={sample.data.areaSqm} />
              <p className={styles.planCaption}>Villa Aurelia, drawn from its listing. Switch levels to see both floors.</p>
            </>
          ) : sample.status === 'error' ? (
            <p className={styles.planCaption}>The sample plan is unavailable while the listings service is offline.</p>
          ) : (
            <Skeleton style={{ aspectRatio: '4 / 3' }} />
          )}
        </div>
      </div>
    </section>
  );
}
