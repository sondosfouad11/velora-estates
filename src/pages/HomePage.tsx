import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { ApproachSection } from '../components/home/ApproachSection';
import { ClosingSection } from '../components/home/ClosingSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { HomeHero } from '../components/home/HomeHero';
import { ModelledHomesSection } from '../components/home/ModelledHomesSection';
import { TownsSection } from '../components/home/TownsSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle(null);
  const { hash } = useLocation();

  // Support /#approach links from anywhere on the site.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <>
      <HomeHero />
      <FeaturedSection />
      <ApproachSection />
      <ModelledHomesSection />
      <TownsSection />
      <ClosingSection />
    </>
  );
}
