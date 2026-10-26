import { describe, expect, it } from 'vitest';
import { formatArea, formatMoneyCompact, formatPrice, formatRelative } from './format';
import { calculateMortgage } from './mortgage';
import { validateEnquiry } from './validation';

describe('format', () => {
  it('formats sale and rental prices', () => {
    expect(formatPrice({ price: 4850000, pricePeriod: 'total' })).toBe('$4,850,000');
    expect(formatPrice({ price: 3200, pricePeriod: 'month' })).toBe('$3,200 / month');
  });

  it('formats compact dollars and areas', () => {
    expect(formatMoneyCompact(4850000)).toBe('$4.85m');
    expect(formatMoneyCompact(2000000)).toBe('$2m');
    expect(formatMoneyCompact(640000)).toBe('$640k');
    expect(formatArea(1250)).toBe('1,250 m²');
  });

  it('formats relative times', () => {
    const now = new Date('2026-10-23T12:00:00Z');
    expect(formatRelative('2026-10-23T11:59:30Z', now)).toBe('just now');
    expect(formatRelative('2026-10-21T12:00:00Z', now)).toBe('2 days ago');
  });
});

describe('calculateMortgage', () => {
  it('matches the annuity formula', () => {
    // $500,000 loan at 3.6% over 25 years ≈ $2,530/month
    const r = calculateMortgage({ price: 625000, depositPercent: 20, annualRatePercent: 3.6, years: 25 });
    expect(r.deposit).toBe(125000);
    expect(r.loan).toBe(500000);
    expect(r.monthlyPayment).toBe(2530);
    expect(r.totalPaid - r.totalInterest).toBe(500000);
  });

  it('handles zero interest and full deposit', () => {
    expect(calculateMortgage({ price: 120000, depositPercent: 0, annualRatePercent: 0, years: 10 }).monthlyPayment).toBe(1000);
    expect(calculateMortgage({ price: 120000, depositPercent: 100, annualRatePercent: 4, years: 10 }).monthlyPayment).toBe(0);
  });
});

describe('validateEnquiry', () => {
  it('requires name, valid email, message and consent', () => {
    const errors = validateEnquiry({ name: 'A', email: 'nope', message: 'short', consent: false });
    expect(Object.keys(errors).sort()).toEqual(['consent', 'email', 'message', 'name']);
  });

  it('accepts a complete enquiry and an optional phone', () => {
    expect(validateEnquiry({ name: 'Ana Ruiz', email: 'ana@example.test', message: 'Is the terrace south facing?', consent: true })).toEqual({});
    expect(validateEnquiry({ name: 'Ana Ruiz', email: 'ana@example.test', message: 'Is the terrace south facing?', consent: true, phone: '12' })).toHaveProperty('phone');
  });
});
