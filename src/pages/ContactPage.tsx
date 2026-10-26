import { PageHero } from '../components/layout/PageHero';
import { InquiryForm } from '../components/forms/InquiryForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './content.module.css';

export default function ContactPage() {
  useDocumentTitle('Contact');
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the agency"
        image="/uploads/properties/sea-view-pool.jpg"
        focus="50% 45%"
        lede="Tell us whether you are buying, renting or selling, and roughly where. The right agent replies within one working day."
      />
      <div className={`container ${styles.body}`}>
        <div className={styles.split}>
          <div className={styles.prose}>
            <h2>What happens next</h2>
            <p>Your message is saved to the agency inbox, where an agent marks it as in progress and replies by email or phone.</p>
            <p>
              Viewing requests are confirmed by the listing agent, usually within a working day. If your question is about a specific home,
              ask it from that home&rsquo;s page so the right agent sees it first.
            </p>
          </div>
          <div className={styles.contactCard}>
            <InquiryForm />
          </div>
        </div>
      </div>
    </>
  );
}
