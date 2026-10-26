import { Link, useParams } from 'react-router';
import { PageHero } from '../components/layout/PageHero';
import { InquiryForm } from '../components/forms/InquiryForm';
import { AgentCard } from '../components/property/AgentCard';
import { PropertyCard } from '../components/property/PropertyCard';
import { Button, ButtonLink } from '../components/ui/Button';
import { PageLoader } from '../components/ui/PageLoader';
import { StatePanel } from '../components/ui/StatePanel';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { agentsApi } from '../services/properties';
import { plural } from '../utils/format';
import styles from './content.module.css';
import list from './PropertiesPage.module.css';

export default function AgentDetailPage() {
  const { slug = '' } = useParams();
  const agent = useAsync((signal) => agentsApi.get(slug, signal), [slug]);
  useDocumentTitle(agent.data?.name ?? (agent.status === 'error' ? 'Agent not found' : undefined));

  if (agent.status === 'loading' && !agent.data) return <PageLoader label="Loading agent" />;
  if (agent.status === 'error') {
    const missing = agent.error.status === 404;
    return (
      <div className={`container ${styles.page}`}>
        <StatePanel
          tone={missing ? 'empty' : 'error'}
          title={missing ? 'This agent profile does not exist' : 'This profile could not be loaded'}
          action={missing ? <ButtonLink to="/agents">See all agents</ButtonLink> : <Button onClick={agent.reload}>Try again</Button>}
        >
          <p>{missing ? 'They may have left the agency, or the link is mistyped.' : agent.error.message}</p>
        </StatePanel>
      </div>
    );
  }

  const a = agent.data!;
  return (
    <>
      <PageHero
        eyebrow={
          <>
            <Link to="/agents">Agents</Link>&nbsp;/&nbsp;{a.role}
          </>
        }
        title={a.name}
        image="/uploads/properties/curved-white-house.jpg"
        focus="50% 40%"
        lede={a.bio}
      />
      <div className={`container ${styles.body}`}>
        <div className={styles.split}>
          <div>
            <h2 className={styles.h2}>{plural(a.listings.length, 'current listing')}</h2>
            {a.listings.length === 0 ? (
              <p className={styles.meta} style={{ marginTop: '1rem' }}>
                No published listings at the moment.
              </p>
            ) : (
              <ul className={list.grid}>
                {a.listings.map((p) => (
                  <li key={p.id}>
                    <PropertyCard property={p} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside className={styles.contactCard}>
            <AgentCard agent={a} />
            <p className={styles.meta}>
              Covers {a.areas.join(', ')}. Speaks {a.languages.join(', ')}.
            </p>
            <InquiryForm />
          </aside>
        </div>
      </div>
    </>
  );
}
