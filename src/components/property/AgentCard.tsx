import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router';
import type { AgentSummary } from '../../types/property';
import styles from './AgentCard.module.css';

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/** Agent portrait: uploaded photo if present, otherwise a typographic monogram (no stock faces for fictional people). */
export function AgentPortrait({ agent, size = 64 }: { agent: Pick<AgentSummary, 'name' | 'photoUrl'>; size?: number }) {
  return agent.photoUrl ? (
    <img className={styles.photo} src={agent.photoUrl} alt="" width={size} height={size} style={{ width: size, height: size }} />
  ) : (
    <span className={styles.monogram} style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">
      {initials(agent.name)}
    </span>
  );
}

export function AgentCard({ agent, compact }: { agent: AgentSummary; compact?: boolean }) {
  return (
    <div className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <AgentPortrait agent={agent} size={compact ? 52 : 64} />
      <div className={styles.text}>
        <p className={styles.name}>
          <Link to={`/agents/${agent.slug}`}>{agent.name}</Link>
        </p>
        <p className={styles.role}>{agent.role}</p>
        <ul className={styles.contact}>
          <li>
            <Phone size={14} aria-hidden="true" />
            <a href={`tel:${agent.phone.replace(/\s/g, '')}`}>{agent.phone}</a>
          </li>
          <li>
            <Mail size={14} aria-hidden="true" />
            <a href={`mailto:${agent.email}`}>{agent.email}</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
