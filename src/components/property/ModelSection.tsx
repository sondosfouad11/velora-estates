import { Moon, RotateCcw, Sun } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useWebGLSupport } from '../../hooks/useWebGL';
import type { VillaVariant } from '../../types/property';
import styles from './ModelSection.module.css';

const ModelViewer = lazy(() => import('../three/ModelViewer'));

const NAMES: Record<VillaVariant, string> = { aurelia: 'Villa Aurelia', lume: 'Casa Lume', seren: 'Villa Seren' };

/**
 * Interactive 3D model block for listings that have one. The WebGL chunk loads only when the
 * block scrolls near the viewport; without WebGL a render of the same model is shown instead.
 */
export function ModelSection({ variant }: { variant: VillaVariant }) {
  const webgl = useWebGLSupport();
  const reduce = useReducedMotion() ?? false;
  const [dusk, setDusk] = useState(false);
  const [reset, setReset] = useState(0);
  const [near, setNear] = useState(false);
  const [lost, setLost] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const live = webgl === true && !lost;

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        <div ref={box} className={styles.stage}>
          {live && near ? (
            <Suspense fallback={<p className={styles.loading}>Loading 3D model…</p>}>
              <ModelViewer variant={variant} dusk={dusk} resetSignal={reset} reducedMotion={reduce} onContextLost={() => setLost(true)} />
            </Suspense>
          ) : webgl === false || lost ? (
            <img
              className={styles.fallback}
              src={`/images/model-${variant}.jpg`}
              alt={`Render of the ${NAMES[variant]} 3D model`}
              loading="lazy"
            />
          ) : (
            <p className={styles.loading}>Loading 3D model…</p>
          )}
        </div>
        {live && (
          <div className={styles.controls}>
            <div className={styles.toggle} role="group" aria-label="Lighting">
              <button type="button" aria-pressed={!dusk} onClick={() => setDusk(false)}>
                <Sun size={16} aria-hidden="true" /> Day
              </button>
              <button type="button" aria-pressed={dusk} onClick={() => setDusk(true)}>
                <Moon size={16} aria-hidden="true" /> Dusk
              </button>
            </div>
            <button type="button" className={styles.reset} onClick={() => setReset((n) => n + 1)}>
              <RotateCcw size={16} aria-hidden="true" /> Reset view
            </button>
          </div>
        )}
      </div>
      <p className={styles.note}>
        {live
          ? 'Drag sideways to turn the model. Pinch, or hold Ctrl and scroll, to zoom. An interactive 3D model of this home.'
          : 'A rendered view of the model. Interactive 3D needs WebGL, which is not available in this browser.'}
      </p>
    </div>
  );
}
