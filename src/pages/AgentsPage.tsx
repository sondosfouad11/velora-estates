import { PageHero } from '../components/layout/PageHero';
import { Link } from 'react-router';
import { AgentPortrait } from '../components/property/AgentCard';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/PageLoader';
import { StatePanel } from '../components/ui/StatePanel';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { agentsApi } from '../services/properties';
import { plural } from '../utils/format';
import styles from './content.module.css';

export default function AgentsPage() {
  useDocumentTitle('Agents');
  const agents = useAsync((signal) => agentsApi.list(signal), []);

  return (
    <>
      <PageHero
        eyebrow="The team"
        title="The agents"
        image="/uploads/properties/stucco-villa-pool.jpg"
        focus="50% 60%"
        lede="Six agents, each responsible for a stretch of the coast. Every listing names the agent who will show it to you."
      />
      <div className={`container ${styles.body}`}>
        {agents.status === 'loading' && !agents.data && <PageLoader label="Loading agents" />}
        {agents.status === 'error' && (
          <StatePanel tone="error" title="Agents could not be loaded" action={<Button onClick={agents.reload}>Try again</Button>}>
            <p>{agents.error.message}</p>
          </StatePanel>
        )}
        {agents.data && (
          <ul className={styles.grid3}>
            {agents.data.map((a) => (
              <li key={a.id} className={styles.agentCard}>
                <div className={styles.agentTop}>
                  <AgentPortrait agent={a} size={72} />
                  <div>
                    <h2 className={styles.agentName}>
                      <Link to={`/agents/${a.slug}`}>{a.name}</Link>
                    </h2>
                    <p className={styles.meta}>{a.role}</p>
                  </div>
                </div>
                <p>{a.bio}</p>
                <ul className={styles.tags} aria-label="Areas">
                  {a.areas.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className={styles.meta}>
                  Speaks {a.languages.join(', ')}. <Link to={`/agents/${a.slug}`}>{plural(a.listingCount, 'listing')}</Link>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
