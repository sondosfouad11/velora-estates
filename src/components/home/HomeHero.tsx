import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useWebGLSupport } from '../../hooks/useWebGL';
import { SplitWords } from '../motion/SplitWords';
import { ButtonLink } from '../ui/Button';
import styles from './HomeHero.module.css';
import { TitleBlockSearch } from './TitleBlockSearch';

const HeroCanvas = lazy(() => import('../three/HeroCanvas'));

const FALLBACK = '/images/villa-aurelia-render.jpg';

/**
 * Home hero: a live WebGL model of Villa Aurelia. On large screens the section is taller than the
 * viewport and its stage is sticky, so ordinary scrolling turns afternoon into dusk before the page
 * hands off to the evening-toned featured homes. Never hijacks scrolling; content is plain DOM.
 */
export function HomeHero() {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const compact = useMediaQuery('(max-width: 760px)');
  const webgl = useWebGLSupport();
  const [contextLost, setContextLost] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);

  const { scrollYProgress } = useScroll({ target: section, offset: compact || reduce ? ['start start', 'end start'] : ['start start', 'end end'] });
  const progress = useTransform(scrollYProgress, [0, compact || reduce ? 0.9 : 1], [0, 1], { clamp: true });

  const duskOpacity = useTransform(progress, [0.15, 0.9], [0, 1]);
  const copyOpacity = useTransform(progress, [0, 0.42], [1, 0]);
  const copyY = useTransform(progress, [0, 0.42], [0, -40]);
  const searchOpacity = useTransform(progress, [0.25, 0.55], [1, 0]);
  const searchEvents = useTransform(progress, (p) => (p > 0.5 ? 'none' : 'auto'));
  const captionOpacity = useTransform(progress, [0.6, 0.85], [0, 1]);
  const captionY = useTransform(progress, [0.6, 0.85], [24, 0]);

  // Render only while the hero is on screen and the tab is visible.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let onScreen = true;
    const update = () => setActive(onScreen && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const live = webgl === true && !contextLost;
  const tall = !compact && !reduce;

  return (
    <section ref={section} className={`${styles.hero} ${tall ? styles.tall : ''}`} aria-labelledby="hero-title">
      <div className={styles.stage}>
        <div className={styles.skyDay} aria-hidden="true" />
        <motion.div className={styles.skyDusk} style={tall ? { opacity: duskOpacity } : { opacity: 0 }} aria-hidden="true" />

        <div className={`${styles.scene} ${ready || !live ? styles.sceneIn : ''}`}>
          {live ? (
            <Suspense fallback={null}>
              <HeroCanvas
                progress={progress}
                active={active}
                reducedMotion={reduce}
                compact={compact}
                onContextLost={() => setContextLost(true)}
                onReady={() => setReady(true)}
                onInteract={() => setTouched(true)}
              />
            </Suspense>
          ) : webgl === false || contextLost ? (
            <img className={styles.fallback} src={FALLBACK} alt="Rendered model of Villa Aurelia: stacked travertine and white volumes with an infinity pool, on a cut terrain base." />
          ) : null}
          {live && compact && ready && (
          <p className={`${styles.hint} ${touched ? styles.hintGone : ''}`} aria-hidden="true">
            Drag to turn the villa, pinch to zoom
          </p>
        )}
        </div>

        <div className={`container ${styles.layout}`}>
          <motion.div className={styles.copy} style={tall ? { opacity: copyOpacity, y: copyY } : undefined}>
            <SplitWords text="Find a place that feels like yours." className={styles.title} delay={0.2} />
            <motion.p className={styles.lede} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.8 }}>
              Villas, apartments and contemporary houses along the Costa Verenna, each presented with its plans, its setting and an agent
              who has walked every room.
            </motion.p>
            <motion.div className={styles.actions} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
              <ButtonLink to="/properties" size="lg">
                Explore properties
              </ButtonLink>
              <ButtonLink to="/#approach" variant="secondary" size="lg">
                Discover our approach
              </ButtonLink>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.search}
            style={tall ? { opacity: searchOpacity, pointerEvents: searchEvents } : undefined}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <TitleBlockSearch caption={{ title: 'Villa Aurelia', detail: 'Capo Lume, 412 m², model 1:200', href: '/properties/villa-aurelia' }} />
          </motion.div>

          {tall && (
            <motion.div className={`on-dark ${styles.duskCaption}`} style={{ opacity: captionOpacity, y: captionY }}>
              <p className={styles.duskKicker}>Villa Aurelia at dusk</p>
              <p className={styles.duskText}>Five bedrooms, a 20-metre pool and the whole western sea. Modelled to the metre.</p>
              <Link to="/properties/villa-aurelia" className={styles.duskLink}>
                See the listing and walk around the model
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
