import { PageHero } from '../components/layout/PageHero';
import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './content.module.css';

export default function PrivacyPage() {
  useDocumentTitle('Privacy');
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy"
        image="/uploads/properties/infinity-pool-terrace.jpg"
        focus="50% 45%"
        lede="How this website handles the information you enter."
      />
      <div className={`container ${styles.body}`}>
        <div className={styles.prose}>
          <h2>What is stored</h2>
          <ul>
            <li>Enquiry and viewing forms: the name, email, phone, dates and message you type, plus the time of submission.</li>
            <li>Saved homes and your grid or list preference: stored in your own browser (localStorage), never sent anywhere.</li>
          </ul>

          <h2>What is not done</h2>
          <ul>
            <li>No analytics, advertising or tracking scripts are loaded.</li>
            <li>Fonts and the 3D scene are served from this site; no third-party requests are made while you browse.</li>
          </ul>

          <h2>Where it lives</h2>
          <p>This website does not run a server of its own, so nothing you type into a form leaves your browser.</p>

          <h2>Photography and models</h2>
          <p>Photographs are CC0 images from StockSnap contributors, credited on each listing. The 3D villas are original models.</p>

          <h2>Questions</h2>
          <p>
            Questions about your data, or a request to have it removed? Use the <Link to="/contact">contact form</Link> and we will reply
            within one working day.
          </p>
        </div>
      </div>
    </>
  );
}
