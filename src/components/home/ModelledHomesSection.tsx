import { Link } from 'react-router';
import { ClipReveal } from '../motion/ClipReveal';
import styles from './home.module.css';

const MODELS = [
  { slug: 'villa-aurelia', name: 'Villa Aurelia', place: 'Capo Lume', note: 'Two stacked volumes, a cantilever and a 20-metre pool.', image: '/images/model-aurelia.jpg' },
  { slug: 'casa-lume', name: 'Casa Lume', place: 'Marevento', note: 'A glazed gable hall beside a low timber wing.', image: '/images/model-lume.jpg' },
  { slug: 'villa-seren', name: 'Villa Seren', place: 'Castel Ombra', note: 'Four wings around a courtyard and a reflecting pool.', image: '/images/model-seren.jpg' },
];

/** The three homes with procedural 3D models. Images are renders of the same live models. */
export function ModelledHomesSection() {
  return (
    <section className={styles.models} aria-labelledby="models-title">
      <div className="container">
        <header className={styles.sectionHead}>
          <h2 id="models-title" className={styles.h2}>
            Three homes you can walk around
          </h2>
          <p className={styles.sectionLede}>
            Each is an original 3D model built for this site. Open the listing to turn it, zoom in and see it lit at dusk.
          </p>
        </header>
        <ul className={styles.modelList}>
          {MODELS.map((m, i) => (
            <li key={m.slug}>
              <Link to={`/properties/${m.slug}`} className={styles.modelLink}>
                <ClipReveal className={styles.modelImage} delay={i * 0.12}>
                  <img src={m.image} alt={`Render of the ${m.name} 3D model`} loading="lazy" />
                </ClipReveal>
                <span className={styles.modelMeta}>
                  <span className={styles.modelName}>{m.name}</span>
                  <span className={styles.modelPlace}>{m.place}</span>
                </span>
                <span className={styles.modelNote}>{m.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
