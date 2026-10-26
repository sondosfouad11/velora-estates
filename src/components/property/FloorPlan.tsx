import { motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';
import type { FloorPlanLevel } from '../../types/property';
import styles from './FloorPlan.module.css';

interface FloorPlanProps {
  levels: FloorPlanLevel[];
  /** Listed living area, shown beside the plan's own measured total. */
  areaSqm: number;
}

const PX = 30; // SVG units per metre
const PAD = 70;

/** Architectural floor plan drawn from room rectangles (metres), with level tabs and dimensions. */
export function FloorPlan({ levels, areaSqm }: FloorPlanProps) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const tabsId = useId();

  if (levels.length === 0) {
    return <p className={styles.empty}>A floor plan has not been drawn for this listing yet.</p>;
  }

  const level = levels[Math.min(active, levels.length - 1)];
  const width = Math.max(...level.rooms.map((r) => r.x + r.w));
  const depth = Math.max(...level.rooms.map((r) => r.y + r.h));
  const levelArea = level.rooms.reduce((sum, r) => sum + r.w * r.h, 0);
  const vbW = width * PX + PAD * 2;
  const vbH = depth * PX + PAD * 2;

  return (
    <div className={styles.wrap}>
      {levels.length > 1 && (
        <div className={styles.tabs} role="tablist" aria-label="Floor plan levels">
          {levels.map((l, i) => (
            <button
              key={l.label}
              type="button"
              role="tab"
              id={`${tabsId}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${tabsId}-panel`}
              className={`${styles.tab} ${i === active ? styles.tabOn : ''}`}
              onClick={() => setActive(i)}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <div id={`${tabsId}-panel`} role={levels.length > 1 ? 'tabpanel' : undefined} aria-labelledby={levels.length > 1 ? `${tabsId}-tab-${active}` : undefined}>
        <svg viewBox={`0 0 ${vbW} ${vbH}`} className={styles.svg} role="img" aria-label={`${level.label} plan, ${width.toFixed(1)} by ${depth.toFixed(1)} metres, ${level.rooms.length} rooms`}>
          <g transform={`translate(${PAD} ${PAD})`} key={level.label}>
            {level.rooms.map((r, i) => {
              const x = r.x * PX;
              const y = r.y * PX;
              const w = r.w * PX;
              const h = r.h * PX;
              const area = r.w * r.h;
              const small = w < 90 || h < 60;
              return (
                <g key={`${r.name}-${i}`}>
                  <motion.rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    className={styles.room}
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: i * 0.06, ease: [0.65, 0, 0.35, 1] }}
                  />
                  <text x={x + w / 2} y={y + h / 2 - (small ? 0 : 6)} textAnchor="middle" className={small ? styles.labelSmall : styles.label}>
                    {r.name}
                  </text>
                  {!small && (
                    <text x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle" className={styles.area}>
                      {area.toFixed(1)} m²
                    </text>
                  )}
                </g>
              );
            })}
            {/* Outer wall */}
            <rect x={0} y={0} width={width * PX} height={depth * PX} className={styles.outer} />

            {/* Overall dimensions */}
            <g className={styles.dim}>
              <line x1={0} y1={-34} x2={width * PX} y2={-34} />
              <line x1={-6} y1={-40} x2={6} y2={-28} />
              <line x1={width * PX - 6} y1={-40} x2={width * PX + 6} y2={-28} />
              <text x={(width * PX) / 2} y={-44} textAnchor="middle">
                {width.toFixed(2)} m
              </text>
              <line x1={-34} y1={0} x2={-34} y2={depth * PX} />
              <line x1={-40} y1={-6} x2={-28} y2={6} />
              <line x1={-40} y1={depth * PX - 6} x2={-28} y2={depth * PX + 6} />
              <text x={-44} y={(depth * PX) / 2} textAnchor="middle" transform={`rotate(-90 ${-44} ${(depth * PX) / 2})`}>
                {depth.toFixed(2)} m
              </text>
            </g>
          </g>
        </svg>
      </div>
      <p className={styles.note}>
        {level.label}: {levelArea.toFixed(0)} m² of {areaSqm} m² listed living area. Illustrative plan generated from the listing&rsquo;s room schedule; not to scale for construction.
      </p>
    </div>
  );
}
