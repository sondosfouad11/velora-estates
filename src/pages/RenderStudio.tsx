import { motionValue } from 'motion/react';
import { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router';
import type { VillaVariant } from '../types/property';

const ModelViewer = lazy(() => import('../components/three/ModelViewer'));
const HeroCanvas = lazy(() => import('../components/three/HeroCanvas'));

/**
 * Development-only page used by scripts/render-assets.mjs to capture the static renders
 * (model thumbnails and the no-WebGL hero fallback) from the same live scenes. Not routed in production.
 */
export default function RenderStudio() {
  const { view = 'aurelia' } = useParams();
  const progress = useMemo(() => motionValue(0), []);
  const style = { position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #ece6da, #f3efe7 45%, #e3ddd1)' } as const;

  return (
    <div style={style} data-render-ready>
      <Suspense fallback={null}>
        {view === 'hero' ? (
          <HeroCanvas progress={progress} active reducedMotion compact={false} onContextLost={() => {}} />
        ) : (
          <ModelViewer variant={view as VillaVariant} dusk={false} resetSignal={0} reducedMotion onContextLost={() => {}} />
        )}
      </Suspense>
    </div>
  );
}
