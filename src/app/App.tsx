import { MotionConfig } from 'motion/react';
import { RouterProvider } from 'react-router';
import { FavoritesProvider } from '../features/favorites/FavoritesContext';
import { router } from './router';

export function App() {
  return (
    // reducedMotion="user" makes every Motion animation honour prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <FavoritesProvider>
        <RouterProvider router={router} />
      </FavoritesProvider>
    </MotionConfig>
  );
}
