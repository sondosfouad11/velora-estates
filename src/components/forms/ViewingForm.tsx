import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useSubmission } from '../../features/inquiries/useSubmission';
import { enquiriesApi, type ViewingTime } from '../../services/enquiries';
import { validateViewing } from '../../utils/validation';
import { Button } from '../ui/Button';
import { CheckboxField, TextArea, TextField } from '../ui/Field';
import { FormResult } from './FormResult';
import styles from './forms.module.css';

function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const TIMES: { value: ViewingTime; label: string; hint: string }[] = [
  { value: 'morning', label: 'Morning', hint: '9–12' },
  { value: 'afternoon', label: 'Afternoon', hint: '12–17' },
  { value: 'evening', label: 'Evening', hint: '17–20' },
];

export function ViewingForm({ propertyId, propertyTitle }: { propertyId: number; propertyTitle: string }) {
  const { min, max } = useMemo(() => {
    const t = new Date();
    const a = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
    const b = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 120);
    return { min: isoDate(a), max: isoDate(b) };
  }, []);
  const [values, setValues] = useState({ name: '', email: '', phone: '', preferredDate: '', preferredTime: '' as ViewingTime | '', message: '', consent: false, website: '' });
  const { state, errors, submit, clearError, reset } = useSubmission(validateViewing, (v: typeof values) =>
    enquiriesApi.requestViewing({ ...v, preferredTime: v.preferredTime as ViewingTime, propertyId }),
  );

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  if (state.phase === 'success') {
    return <FormResult title="Viewing requested" reference={`Request #${state.id}`} message={state.message} onReset={reset} resetLabel="Request another time" />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(values);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-label={`Request a viewing of ${propertyTitle}`}>
      {state.phase === 'error' && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}
      <div className={styles.row}>
        <TextField label="Preferred date" type="date" name="preferredDate" min={min} max={max} value={values.preferredDate} onChange={(e) => set('preferredDate', e.target.value)} error={errors.preferredDate} required />
        <fieldset className={styles.times} aria-invalid={!!errors.preferredTime}>
          <legend>Time of day</legend>
          <div>
            {TIMES.map((t) => (
              <label key={t.value} className={values.preferredTime === t.value ? styles.timeOn : ''}>
                <input type="radio" name="preferredTime" value={t.value} checked={values.preferredTime === t.value} onChange={() => set('preferredTime', t.value)} />
                <span>{t.label}</span>
                <small>{t.hint}</small>
              </label>
            ))}
          </div>
          {errors.preferredTime && (
            <p className={styles.fieldError} role="alert">
              {errors.preferredTime}
            </p>
          )}
        </fieldset>
      </div>
      <TextField label="Name" name="name" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
      <div className={styles.row}>
        <TextField label="Email" type="email" name="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
        <TextField label="Phone" type="tel" name="phone" autoComplete="tel" value={values.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} required />
      </div>
      <TextArea label="Anything we should know?" optional name="message" rows={3} maxLength={1500} value={values.message} onChange={(e) => set('message', e.target.value)} error={errors.message} />
      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>
      <CheckboxField
        checked={values.consent}
        onChange={(e) => set('consent', e.target.checked)}
        error={errors.consent}
        label={
          <>
            Use my details to arrange this viewing (<Link to="/privacy">privacy notice</Link>).
          </>
        }
      />
      <Button type="submit" loading={state.phase === 'submitting'} block>
        {state.phase === 'submitting' ? 'Sending request…' : 'Request viewing'}
      </Button>
    </form>
  );
}
