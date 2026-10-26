import { Check, Link2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { InquiryForm } from '../components/forms/InquiryForm';
import { ViewingForm } from '../components/forms/ViewingForm';
import { AgentCard } from '../components/property/AgentCard';
import { CoastMap } from '../components/property/CoastMap';
import { FavoriteButton } from '../components/property/FavoriteButton';
import { FloorPlan } from '../components/property/FloorPlan';
import { Gallery } from '../components/property/Gallery';
import { ModelSection } from '../components/property/ModelSection';
import { MortgageCalculator } from '../components/property/MortgageCalculator';
import { PropertyCard } from '../components/property/PropertyCard';
import { Button, ButtonLink } from '../components/ui/Button';
import { PageLoader } from '../components/ui/PageLoader';
import { StatePanel } from '../components/ui/StatePanel';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { propertiesApi } from '../services/properties';
import { PROPERTY_TYPE_LABEL, type Property, type PropertySummary } from '../types/property';
import { formatArea, formatMoney, formatNumber, formatPrice } from '../utils/format';
import styles from './PropertyDetailPage.module.css';

type Tab = 'question' | 'viewing';

export default function PropertyDetailPage() {
  const { slug = '' } = useParams();
  const result = useAsync((signal) => propertiesApi.get(slug, signal), [slug]);
  const similar = useAsync((signal) => propertiesApi.similar(slug, signal), [slug]);
  useDocumentTitle(result.data ? `${result.data.title}, ${result.data.town}` : result.status === 'error' ? 'Property not found' : undefined);

  if (result.status === 'loading' && !result.data) return <PageLoader label="Loading property" />;

  if (result.status === 'error') {
    const missing = result.error.status === 404;
    return (
      <div className={`container ${styles.statePage}`}>
        <StatePanel
          tone={missing ? 'empty' : 'error'}
          title={missing ? 'This home is no longer listed' : 'This property could not be loaded'}
          action={
            <>
              <ButtonLink to="/properties">Browse all properties</ButtonLink>
              {!missing && (
                <Button variant="secondary" onClick={result.reload}>
                  Try again
                </Button>
              )}
            </>
          }
        >
          <p>{missing ? 'It may have been sold, let or withdrawn. Similar homes are still available.' : result.error.message}</p>
        </StatePanel>
      </div>
    );
  }

  return <PropertyDetail property={result.data!} similar={similar.data ?? []} />;
}

function PropertyDetail({ property: p, similar }: { property: Property; similar: PropertySummary[] }) {
  const [tab, setTab] = useState<Tab>('viewing');
  const [copied, setCopied] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLElement>(null);

  useEffect(() => setTab('viewing'), [p.id]);

  const openContact = (t: Tab) => {
    setTab(t);
    contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => contactRef.current?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true }), 500);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Copy this link', window.location.href);
    }
  };

  const specs: [string, string][] = [
    ['Type', PROPERTY_TYPE_LABEL[p.type]],
    ['Bedrooms', String(p.bedrooms)],
    ['Bathrooms', String(p.bathrooms)],
    ['Living area', formatArea(p.areaSqm)],
    ...(p.plotSqm ? ([['Plot', formatArea(p.plotSqm)]] as [string, string][]) : []),
    ...(p.yearBuilt ? ([['Built', String(p.yearBuilt)]] as [string, string][]) : []),
    ...(p.energyRating ? ([['Energy rating', p.energyRating]] as [string, string][]) : []),
  ];

  return (
    <article className={styles.page}>
      <div className="container">
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to="/properties">Properties</Link>
            </li>
            <li>
              <Link to={`/properties?q=${encodeURIComponent(p.town)}`}>{p.town}</Link>
            </li>
            <li aria-current="page">{p.title}</li>
          </ol>
        </nav>

        <header className={styles.header}>
          <div>
            <p className={styles.place}>
              {p.district}, {p.town}
            </p>
            <h1 className={styles.title}>{p.title}</h1>
          </div>
          <div className={styles.headerAside}>
            <p className={styles.price}>{formatPrice(p)}</p>
            <p className={styles.status}>{p.status === 'sale' ? 'For sale' : 'To rent, furnished options on request'}</p>
            <div className={styles.headerActions}>
              <FavoriteButton id={p.id} title={p.title} variant="inline" />
              <Button variant="secondary" onClick={share} icon={copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}>
                {copied ? 'Link copied' : 'Share'}
              </Button>
            </div>
          </div>
        </header>

        <Gallery
          images={p.images}
          title={p.title}
          extra={p.modelVariant ? { label: 'Open 3D model', onSelect: () => modelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) } : undefined}
        />

        <div className={styles.layout}>
          <div className={styles.main}>
            <dl className={styles.specs}>
              {specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <section className={styles.section} aria-labelledby="about-home">
              <h2 id="about-home" className={styles.h2}>
                About this home
              </h2>
              <p className={styles.summary}>{p.summary}</p>
              {p.description.split(/\n{2,}/).map((para, i) => (
                <p key={i} className={styles.para}>
                  {para}
                </p>
              ))}
            </section>

            {p.amenities.length > 0 && (
              <section className={styles.section} aria-labelledby="features">
                <h2 id="features" className={styles.h2}>
                  Features
                </h2>
                <ul className={styles.amenities}>
                  {p.amenities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </section>
            )}

            {p.modelVariant && (
              <section ref={modelRef} className={styles.section} aria-labelledby="model">
                <h2 id="model" className={styles.h2}>
                  Walk around the model
                </h2>
                <ModelSection variant={p.modelVariant} />
              </section>
            )}

            <section className={styles.section} aria-labelledby="plan">
              <h2 id="plan" className={styles.h2}>
                Floor plan
              </h2>
              <FloorPlan levels={p.floorPlan} areaSqm={p.areaSqm} />
            </section>

            <section className={styles.section} aria-labelledby="location">
              <h2 id="location" className={styles.h2}>
                Location
              </h2>
              <p className={styles.para}>
                {p.district} is in {p.town}, on the Costa Verenna. The marker shows the home&rsquo;s approximate position on our illustrative plan;
                the exact address is shared once a viewing is confirmed.
              </p>
              <CoastMap marker={{ x: p.mapX, y: p.mapY, label: p.title }} title={`Illustrative plan showing ${p.title} in ${p.town}`} />
            </section>

            {p.status === 'sale' ? (
              <section className={styles.section} aria-labelledby="mortgage">
                <h2 id="mortgage" className={styles.h2}>
                  Estimate monthly repayments
                </h2>
                <MortgageCalculator price={p.price} />
              </section>
            ) : (
              <section className={styles.section} aria-labelledby="move-in">
                <h2 id="move-in" className={styles.h2}>
                  Move-in costs
                </h2>
                <dl className={styles.moveIn}>
                  <div>
                    <dt>First month&rsquo;s rent</dt>
                    <dd>{formatMoney(p.price)}</dd>
                  </div>
                  <div>
                    <dt>Security deposit (two months, illustrative)</dt>
                    <dd>{formatMoney(p.price * 2)}</dd>
                  </div>
                  <div>
                    <dt>Due before move-in</dt>
                    <dd>{formatMoney(p.price * 3)}</dd>
                  </div>
                </dl>
                <p className={styles.small}>Indicative figures. Final terms are agreed with the landlord.</p>
              </section>
            )}
          </div>

          <aside className={styles.aside} ref={contactRef} aria-label="Contact the agent">
            <div className={styles.panel}>
              <AgentCard agent={p.agent} compact />
              <div className={styles.tabs} role="tablist" aria-label="Contact options">
                <button type="button" role="tab" id="tab-viewing" aria-selected={tab === 'viewing'} aria-controls="panel-contact" onClick={() => setTab('viewing')}>
                  Request a viewing
                </button>
                <button type="button" role="tab" id="tab-question" aria-selected={tab === 'question'} aria-controls="panel-contact" onClick={() => setTab('question')}>
                  Ask a question
                </button>
              </div>
              <div id="panel-contact" role="tabpanel" aria-labelledby={`tab-${tab}`}>
                {tab === 'viewing' ? (
                  <ViewingForm key={`v-${p.id}`} propertyId={p.id} propertyTitle={p.title} />
                ) : (
                  <InquiryForm key={`q-${p.id}`} propertyId={p.id} propertyTitle={p.title} defaultTopic={p.status === 'sale' ? 'buying' : 'renting'} showTopic={false} />
                )}
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className={styles.similar} aria-labelledby="similar">
            <h2 id="similar" className={styles.h2}>
              Similar homes
            </h2>
            <ul>
              {similar.map((s) => (
                <li key={s.id}>
                  <PropertyCard property={s} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Mobile sticky action bar */}
      <div className={styles.stickyBar} data-sticky-bar="">
        <p>
          <strong>{formatPrice(p)}</strong>
          <span>
            {p.bedrooms} bed, {formatNumber(p.areaSqm)} m²
          </span>
        </p>
        <Button onClick={() => openContact('viewing')}>Request viewing</Button>
      </div>
    </article>
  );
}
