import { PageHero } from '../components/layout/PageHero';
import { ClipReveal } from '../components/motion/ClipReveal';
import { ButtonLink } from '../components/ui/Button';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { agentsApi, propertiesApi } from '../services/properties';
import styles from './content.module.css';

export default function AboutPage() {
  useDocumentTitle('Our approach');
  const meta = useAsync((signal) => propertiesApi.meta(signal), []);
  const agents = useAsync((signal) => agentsApi.list(signal), []);
  const listings = meta.data?.ranges.reduce((sum, r) => sum + r.count, 0);

  return (
    <>
      <PageHero
        eyebrow="Our approach"
        title="An agency that reads homes as drawings"
        image="/uploads/properties/whitewashed-sea-terrace.jpg"
        lede="VELORA ESTATES shows every home with enough information that a visit confirms what you already understand."
      />
      <div className={`container ${styles.body}`}>
        <div className={styles.split}>
          <div className={styles.prose}>
            <h2>Why plans and models</h2>
            <p>
              Photographs flatter rooms. A plan tells you how they connect, where the light comes from and how far the kitchen is from the
              terrace. Every listing here is generated from a measured room schedule, so the plan, the bedroom count and the square metres
              always agree.
            </p>
            <p>
              For a few homes we go further and build a 3D model. You can turn it, zoom in and see the house lit at dusk before deciding
              whether a viewing is worth the drive.
            </p>
            <h2>How we work with buyers and tenants</h2>
            <ul>
              <li>One agent from first enquiry to handing over keys.</li>
              <li>Viewings confirmed by the listing agent, usually within a working day.</li>
              <li>Prices shown in full, with rentals priced per month.</li>
            </ul>
            <div>
              <ButtonLink to="/properties">Browse the listings</ButtonLink>
            </div>
          </div>

          <div>
            <ClipReveal>
              <img
                src="/uploads/properties/cliff-village.jpg"
                alt="Hillside village above the sea in late sun"
                style={{
                  width: '100%',
                  aspectRatio: '4 / 5',
                  objectFit: 'cover',
                  borderRadius: 3,
                }}
              />
            </ClipReveal>
            <p className={styles.meta} style={{ marginTop: '0.75rem' }}>
              Photo: Willian Was / StockSnap (CC0).
            </p>
            <dl className={styles.facts} style={{ marginTop: '2rem' }}>
              <div>
                <dt>Published listings</dt>
                <dd>{listings ?? '–'}</dd>
              </div>
              <div>
                <dt>Towns covered</dt>
                <dd>{meta.data?.towns.length ?? '–'}</dd>
              </div>
              <div>
                <dt>Agents</dt>
                <dd>{agents.data?.length ?? '–'}</dd>
              </div>
              <div>
                <dt>Homes with 3D models</dt>
                <dd>3</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
