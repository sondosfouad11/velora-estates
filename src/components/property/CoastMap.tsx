import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import styles from './CoastMap.module.css';

/**
 * Illustrative site plan of the fictional Costa Verenna, drawn as authored SVG geometry.
 * Coordinates share the 0–100 plan grid stored on each listing (map_x, map_y).
 * This is deliberately not a live map: the places do not exist.
 */

export const TOWNS = [
  { name: 'Riva Celeste', x: 17, y: 64, anchor: 'end' as const },
  { name: 'Portalba', x: 36, y: 58, anchor: 'start' as const },
  { name: 'Marevento', x: 58, y: 48, anchor: 'start' as const },
  { name: 'Capo Lume', x: 79, y: 64, anchor: 'start' as const },
  { name: 'Castel Ombra', x: 45, y: 21, anchor: 'start' as const },
  { name: 'Valdorsa', x: 70, y: 17, anchor: 'start' as const },
];

const W = 1000;
const H = 620;
const sx = (x: number) => (x / 100) * W;
const sy = (y: number) => (y / 100) * H;

// Coastline in plan units (x 0–100, y 0–100); the sea lies below it.
const COAST: [number, number][] = [
  [0, 77], [6, 75.5], [12, 74.5], [20, 73], [26, 70], [31, 66], [36, 63.2], [41, 61.5], [47, 59], [53, 56.5], [58, 55], [63, 55.6],
  [67, 57.5], [70, 61], [72.5, 67], [74.5, 73.5], [77, 77.5], [81, 78.2], [85, 75], [87.5, 69], [89.5, 62.5], [93, 59], [100, 58],
];

function smoothPath(points: [number, number][]): string {
  const p = points.map(([x, y]) => [sx(x), sy(y)]);
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += ` Q${x0},${y0} ${mx},${my}`;
  }
  d += ` L${p[p.length - 1][0]},${p[p.length - 1][1]}`;
  return d;
}

const coastLine = smoothPath(COAST);
const seaArea = `${coastLine} L${W},${H} L0,${H} Z`;

// Inland contour rings around the two hill towns.
function contour(cx: number, cy: number, rx: number, ry: number, wobble: number, seed: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = 1 + Math.sin(a * 3 + seed) * wobble + Math.cos(a * 5 + seed * 2) * wobble * 0.5;
    pts.push(`${(sx(cx) + Math.cos(a) * rx * r).toFixed(1)},${(sy(cy) + Math.sin(a) * ry * r).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
}

const CONTOURS = [
  ...[1, 2, 3, 4].map((k) => contour(46, 22, 30 + k * 34, 20 + k * 22, 0.08, k)),
  ...[1, 2, 3].map((k) => contour(71, 16, 26 + k * 30, 16 + k * 18, 0.1, k + 4)),
];

const ROADS = [
  'M170,397 C260,380 300,365 360,360 S520,330 580,300 S700,330 790,397',
  'M360,360 C390,280 420,200 450,130',
  'M580,300 C620,240 660,170 700,105',
  'M450,130 C540,110 620,100 700,105',
];

interface CoastMapProps {
  /** Highlight a single listing position. */
  marker?: { x: number; y: number; label: string };
  /** Link towns to filtered listings and show counts. */
  townCounts?: Record<string, number>;
  className?: string;
  title?: string;
}

export function CoastMap({ marker, townCounts, className, title = 'Illustrative plan of the Costa Verenna coast' }: CoastMapProps) {
  const reduce = useReducedMotion();
  return (
    <figure className={`${styles.figure} ${className ?? ''}`}>
      {/* With town links inside, the SVG is a group of links, not a single image. */}
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role={townCounts ? 'group' : 'img'} aria-labelledby="coast-title">
        <title id="coast-title">{title}</title>
        <defs>
          <pattern id="sea-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <line x1="0" y1="0" x2="0" y2="9" className={styles.hatch} />
          </pattern>
        </defs>

        <path d={seaArea} className={styles.sea} />
        <path d={seaArea} fill="url(#sea-hatch)" />
        {CONTOURS.map((d, i) => (
          <path key={i} d={d} className={styles.contour} />
        ))}
        {ROADS.map((d, i) => (
          <path key={i} d={d} className={styles.road} />
        ))}
        <motion.path
          d={coastLine}
          className={styles.coast}
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }}
        />

        <text x={sx(14)} y={sy(90)} className={styles.seaLabel}>
          Mare Verenna
        </text>

        {TOWNS.map((t) => {
          const count = townCounts?.[t.name];
          const label = (
            <g className={styles.town}>
              <rect x={sx(t.x) - 5} y={sy(t.y) - 5} width="10" height="10" className={styles.townMark} />
              <text x={sx(t.x) + (t.anchor === 'end' ? -14 : 14)} y={sy(t.y) + 5} textAnchor={t.anchor} className={styles.townLabel}>
                {t.name}
                {count !== undefined && <tspan className={styles.townCount}>{` ${count}`}</tspan>}
              </text>
            </g>
          );
          return townCounts ? (
            <Link key={t.name} to={`/properties?q=${encodeURIComponent(t.name)}`} aria-label={`${t.name}: ${count ?? 0} listings`}>
              {label}
            </Link>
          ) : (
            <g key={t.name}>{label}</g>
          );
        })}

        {marker && (
          <g className={styles.marker}>
            <circle cx={sx(marker.x)} cy={sy(marker.y)} r="22" className={styles.markerHalo} />
            <circle cx={sx(marker.x)} cy={sy(marker.y)} r="7" className={styles.markerDot} />
            <line x1={sx(marker.x)} y1={sy(marker.y) - 10} x2={sx(marker.x)} y2={sy(marker.y) - 62} className={styles.leader} />
            <text x={sx(marker.x)} y={sy(marker.y) - 72} textAnchor="middle" className={styles.markerLabel}>
              {marker.label}
            </text>
          </g>
        )}

        {/* North arrow and scale bar */}
        <g transform={`translate(${W - 70}, 70)`} className={styles.north}>
          <circle r="26" />
          <path d="M0,-20 L8,12 L0,6 L-8,12 Z" />
          <text y="-32" textAnchor="middle">
            N
          </text>
        </g>
        <g transform={`translate(${W - 250}, ${H - 40})`} className={styles.scale}>
          <path d="M0,0 H200 M0,-6 V6 M100,-4 V4 M200,-6 V6" />
          <rect x="0" y="-3" width="100" height="6" />
          <text x="0" y="-12">
            0
          </text>
          <text x="200" y="-12" textAnchor="end">
            2 km
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption}>Illustrative plan. Positions are approximate.</figcaption>
    </figure>
  );
}
