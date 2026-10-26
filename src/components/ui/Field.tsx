import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

interface FieldShellProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  id: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ label, hint, error, optional, id, children, className }: FieldShellProps) {
  return (
    <div className={`${styles.field} ${error ? styles.invalid : ''} ${className ?? ''}`}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: ReactNode, error?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type Base = { label: string; hint?: ReactNode; error?: string; optional?: boolean; className?: string };

export function TextField({ label, hint, error, optional, className, id: idProp, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional} id={id} className={className}>
      <input id={id} className={styles.control} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} {...rest} />
    </FieldShell>
  );
}

export function TextArea({ label, hint, error, optional, className, id: idProp, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional} id={id} className={className}>
      <textarea id={id} className={`${styles.control} ${styles.textarea}`} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} {...rest} />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  className,
  id: idProp,
  children,
  ...rest
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional} id={id} className={className}>
      <div className={styles.selectWrap}>
        <select id={id} className={`${styles.control} ${styles.select}`} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} {...rest}>
          {children}
        </select>
      </div>
    </FieldShell>
  );
}

export function CheckboxField({ label, error, id: idProp, className, ...rest }: { label: ReactNode; error?: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className={`${styles.checkField} ${error ? styles.invalid : ''} ${className ?? ''}`}>
      <input type="checkbox" id={id} className={styles.checkbox} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      <label htmlFor={id} className={styles.checkLabel}>
        {label}
      </label>
      {error && (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
