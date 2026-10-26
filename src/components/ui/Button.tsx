import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger' | 'light';
type Size = 'md' | 'sm' | 'lg';

interface Common {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  block?: boolean;
  children: ReactNode;
}

function classes(variant: Variant, size: Size, block?: boolean, extra?: string) {
  return [styles.button, styles[variant], styles[size], block ? styles.block : '', extra ?? ''].join(' ').trim();
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  block,
  loading,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type={type}
      className={classes(variant, size, block, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon}
      <span>{children}</span>
      {iconEnd}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, iconEnd, block, children, className, ...rest }: Common & LinkProps) {
  return (
    <Link className={classes(variant, size, block, className)} {...rest}>
      {icon}
      <span>{children}</span>
      {iconEnd}
    </Link>
  );
}
