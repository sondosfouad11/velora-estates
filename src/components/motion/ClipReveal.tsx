import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface ClipRevealProps {
  children: ReactNode;
  className?: string;
  /** Direction the image opens toward. */
  from?: 'bottom' | 'left';
  delay?: number;
}

/** Opens an image like a drawing being unmasked: clip-path inset animates to zero when in view. */
export function ClipReveal({ children, className, from = 'bottom', delay = 0 }: ClipRevealProps) {
  const reduce = useReducedMotion();
  const hidden = from === 'bottom' ? 'inset(100% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)';
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: hidden }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}
