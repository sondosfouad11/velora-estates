import { Heart, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useFavorites } from '../../features/favorites/FavoritesContext';
import { Wordmark } from '../ui/Wordmark';
import styles from './SiteHeader.module.css';

const NAV = [
  { to: '/properties', label: 'Properties' },
  { to: '/agents', label: 'Agents' },
  { to: '/about', label: 'Our approach' },
  { to: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const { pathname } = useLocation();
  const { ids } = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const overHero = pathname === '/' && !scrolled;

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Hide while scrolling down past the first screen, reveal on any upward scroll.
      setHidden(y > window.innerHeight * 0.8 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const setTop = () => headerRef.current?.style.setProperty('--drawer-top', `${headerRef.current.getBoundingClientRect().bottom}px`);
    setTop();
    window.addEventListener('resize', setTop);
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', setTop);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${open ? styles.open : overHero ? styles.overHero : styles.solid} ${hidden && !open ? styles.hidden : ''}`}
    >
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.brand} aria-label="VELORA ESTATES home">
          <Wordmark />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.tools}>
          <NavLink
            to="/saved"
            className={({ isActive }) => `${styles.saved} ${isActive ? styles.active : ''}`}
            aria-label={`Saved homes, ${ids.length} saved`}
          >
            <Heart size={18} strokeWidth={1.6} aria-hidden="true" />
            <span className={styles.savedLabel}>Saved</span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={ids.length}
                className={styles.count}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                aria-hidden="true"
              >
                {ids.length}
              </motion.span>
            </AnimatePresence>
          </NavLink>
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} strokeWidth={1.6} aria-hidden="true" /> : <Menu size={22} strokeWidth={1.6} aria-hidden="true" />}
            <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className={styles.drawer}
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav aria-label="Mobile" className={styles.drawerNav}>
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <NavLink
                    to={item.to}
                    end
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.active : ''}`}
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
