import { motion } from 'motion/react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { BackToTop } from './BackToTop';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function SiteLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      {/* Each route fades in; content is never hidden longer than the transition. */}
      <motion.main
        id="main"
        key={pathname}
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ outline: 'none' }}
      >
        <Outlet />
      </motion.main>
      <SiteFooter />
      <BackToTop />
      {/* Default per-visit key: a new navigation (search, link) opens at the top; only Back/Forward restores the old spot. */}
      <ScrollRestoration />
    </>
  );
}
