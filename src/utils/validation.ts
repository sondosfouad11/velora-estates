/** Client-side checks that mirror backend/src/validation/validator.ts so users see errors before submitting. */

export type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkName(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Name is required.';
  if (v.length < 2) return 'Name must be at least 2 characters.';
  if (v.length > 120) return 'Name must be 120 characters or fewer.';
  return null;
}

export function checkEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Email is required.';
  if (!EMAIL.test(v) || v.length > 190) return 'Enter a valid email address, like name@example.com.';
  return null;
}

export function checkPhone(value: string, required: boolean): string | null {
  const v = value.trim();
  if (!v) return required ? 'Phone is required.' : null;
  const digits = v.replace(/\D/g, '');
  if (!/^[0-9+()\s.-]+$/.test(v) || digits.length < 7 || digits.length > 15) return 'Enter a phone number with 7–15 digits.';
  return null;
}

export function checkMessage(value: string, required: boolean, min = 10, max = 3000): string | null {
  const v = value.trim();
  if (!v) return required ? 'Message is required.' : null;
  if (v.length < min) return `Message must be at least ${min} characters.`;
  if (v.length > max) return `Message must be ${max} characters or fewer.`;
  return null;
}

/** Days between today (local) and a YYYY-MM-DD date. */
export function daysFromToday(isoDate: string, today: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  if (target.getMonth() !== m - 1) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function checkViewingDate(value: string): string | null {
  if (!value) return 'Choose a preferred date.';
  const days = daysFromToday(value);
  if (days === null) return 'Enter a date in the format YYYY-MM-DD.';
  if (days < 1) return 'Choose a date from tomorrow onwards.';
  if (days > 120) return 'Choose a date within the next 120 days.';
  return null;
}

interface EnquiryValues {
  name: string;
  email: string;
  phone?: string;
  message: string;
  consent: boolean;
}

export function validateEnquiry(values: EnquiryValues): FieldErrors {
  const errors: FieldErrors = {};
  const set = (key: string, message: string | null) => {
    if (message) errors[key] = message;
  };
  set('name', checkName(values.name));
  set('email', checkEmail(values.email));
  set('phone', checkPhone(values.phone ?? '', false));
  set('message', checkMessage(values.message, true));
  if (!values.consent) errors.consent = 'Confirm that we may use your details to reply.';
  return errors;
}

interface ViewingValues {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  consent: boolean;
}

export function validateViewing(values: ViewingValues): FieldErrors {
  const errors: FieldErrors = {};
  const set = (key: string, message: string | null) => {
    if (message) errors[key] = message;
  };
  set('name', checkName(values.name));
  set('email', checkEmail(values.email));
  set('phone', checkPhone(values.phone, true));
  set('preferredDate', checkViewingDate(values.preferredDate));
  if (!['morning', 'afternoon', 'evening'].includes(values.preferredTime)) errors.preferredTime = 'Choose a time of day.';
  set('message', checkMessage(values.message, false, 0, 1500));
  if (!values.consent) errors.consent = 'Confirm that we may use your details to arrange the viewing.';
  return errors;
}
