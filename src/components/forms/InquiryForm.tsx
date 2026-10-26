import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useSubmission } from '../../features/inquiries/useSubmission';
import { enquiriesApi, type InquiryTopic } from '../../services/enquiries';
import { validateEnquiry } from '../../utils/validation';
import { Button } from '../ui/Button';
import { CheckboxField, SelectField, TextArea, TextField } from '../ui/Field';
import { FormResult } from './FormResult';
import styles from './forms.module.css';

interface InquiryFormProps {
  propertyId?: number;
  propertyTitle?: string;
  defaultTopic?: InquiryTopic;
  showTopic?: boolean;
}

export function InquiryForm({ propertyId, propertyTitle, defaultTopic = 'general', showTopic = true }: InquiryFormProps) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    topic: defaultTopic,
    message: propertyTitle ? `I'd like to know more about ${propertyTitle}.` : '',
    consent: false,
    website: '',
  });
  const { state, errors, submit, clearError, reset } = useSubmission(validateEnquiry, (v: typeof values) =>
    enquiriesApi.sendInquiry({ ...v, propertyId: propertyId ?? null }),
  );

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  if (state.phase === 'success') {
    return (
      <FormResult
        title="Message sent"
        reference={`Enquiry #${state.id}`}
        message={state.message}
        onReset={() => {
          reset();
          setValues((v) => ({ ...v, message: '' }));
        }}
        resetLabel="Send another message"
      />
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(values);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {state.phase === 'error' && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}
      <div className={styles.row}>
        <TextField label="Name" name="name" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
        <TextField label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
      </div>
      <div className={styles.row}>
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" optional value={values.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
        {showTopic && (
          <SelectField label="Topic" name="topic" value={values.topic} onChange={(e) => set('topic', e.target.value as InquiryTopic)}>
            <option value="buying">Buying</option>
            <option value="renting">Renting</option>
            <option value="selling">Selling with Velora</option>
            <option value="general">Something else</option>
          </SelectField>
        )}
      </div>
      <TextArea label="Message" name="message" value={values.message} onChange={(e) => set('message', e.target.value)} error={errors.message} rows={5} maxLength={3000} required />
      {/* Honeypot: hidden from people, tempting to bots. */}
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
            Use my details to reply to this enquiry, as described in the <Link to="/privacy">privacy notice</Link>.
          </>
        }
      />
      <Button type="submit" loading={state.phase === 'submitting'} block>
        {state.phase === 'submitting' ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
