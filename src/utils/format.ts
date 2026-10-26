import type { PropertySummary } from '../types/property';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-IE');

export function formatMoney(value: number): string {
  return usd.format(value);
}

/** Compact dollars for chips and axes: $4.85m, $640k, $3,200. */
export function formatMoneyCompact(value: number): string {
  if (value >= 1_000_000) return `$${trimZeros((value / 1_000_000).toFixed(2))}m`;
  if (value >= 100_000) return `$${Math.round(value / 1000)}k`;
  return usd.format(value);
}

function trimZeros(text: string): string {
  return text.replace(/\.?0+$/, '');
}

export function formatPrice(p: Pick<PropertySummary, 'price' | 'pricePeriod'>): string {
  return p.pricePeriod === 'month' ? `${usd.format(p.price)} / month` : usd.format(p.price);
}

export function formatArea(sqm: number): string {
  return `${num.format(sqm)} m²`;
}

export function formatNumber(value: number): string {
  return num.format(value);
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatShortDate(isoDate: string): string {
  // Date-only strings are parsed as local dates to avoid timezone shifts.
  const [y, m, d] = isoDate.split('-').map(Number);
  return shortDate.format(new Date(y, m - 1, d));
}

/** "3 days ago" style relative time for admin lists. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diff = (now.getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return plural(Math.floor(diff / 60), 'minute') + ' ago';
  if (diff < 86400) return plural(Math.floor(diff / 3600), 'hour') + ' ago';
  if (diff < 86400 * 30) return plural(Math.floor(diff / 86400), 'day') + ' ago';
  return formatDate(iso);
}
