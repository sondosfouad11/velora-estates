import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { createBrowserRouter } from 'react-router';
import { PageLoader } from '../components/ui/PageLoader';
import { SiteLayout } from '../components/layout/SiteLayout';
import { RouteError } from '../pages/RouteError';

const HomePage = lazy(() => import('../pages/HomePage'));
const PropertiesPage = lazy(() => import('../pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('../pages/PropertyDetailPage'));
const SavedPage = lazy(() => import('../pages/SavedPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const AgentsPage = lazy(() => import('../pages/AgentsPage'));
const AgentDetailPage = lazy(() => import('../pages/AgentDetailPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));


function page(Component: LazyExoticComponent<ComponentType>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Dev-only capture page for static renders (excluded from production builds by the DEV check).
const devRoutes = import.meta.env.DEV ? [{ path: '/__render/:view', element: page(lazy(() => import('../pages/RenderStudio'))) }] : [];

export const router = createBrowserRouter([
  ...devRoutes,
  {
    element: <SiteLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: page(HomePage) },
      { path: '/properties', element: page(PropertiesPage) },
      { path: '/properties/:slug', element: page(PropertyDetailPage) },
      { path: '/saved', element: page(SavedPage) },
      { path: '/about', element: page(AboutPage) },
      { path: '/agents', element: page(AgentsPage) },
      { path: '/agents/:slug', element: page(AgentDetailPage) },
      { path: '/contact', element: page(ContactPage) },
      { path: '/privacy', element: page(PrivacyPage) },
      { path: '*', element: page(NotFoundPage) },
    ],
  },
]);
