/**
 * Who designed and built this concept site. Footer credit. Set VITE_CREDIT_NAME in .env (defaults to Sondos Lasheen)
 * (e.g. VITE_CREDIT_NAME="Your Name"); when it is empty the credit line is simply omitted.
 * When the site is delivered to an agency with its own listings, clear it or keep it as a footer credit.
 */
export const CREDIT_NAME = ((import.meta.env.VITE_CREDIT_NAME as string | undefined) ?? 'Sondos Lasheen').trim();
