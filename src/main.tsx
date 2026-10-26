import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/base.css';

// A fresh load or refresh always opens at the top of the page. Back/forward inside the
// site still returns to where you were, because the router keeps those positions in memory.
try {
  sessionStorage.removeItem('react-router-scroll-positions');
} catch {
  // Storage blocked: nothing saved to clear.
}
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
