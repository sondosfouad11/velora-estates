export interface MortgageInput {
  price: number;
  depositPercent: number; // 0–100
  annualRatePercent: number; // e.g. 3.6
  years: number;
}

export interface MortgageResult {
  loan: number;
  deposit: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
}

/** Standard annuity repayment formula. Illustrative only: ignores fees, taxes and insurance. */
export function calculateMortgage({ price, depositPercent, annualRatePercent, years }: MortgageInput): MortgageResult {
  const deposit = Math.round(price * clamp(depositPercent, 0, 100) / 100);
  const loan = Math.max(0, price - deposit);
  const months = Math.max(1, Math.round(years * 12));
  const r = annualRatePercent / 100 / 12;
  const monthlyPayment = loan === 0 ? 0 : r === 0 ? loan / months : (loan * r) / (1 - Math.pow(1 + r, -months));
  const totalPaid = monthlyPayment * months;
  return {
    loan,
    deposit,
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalPaid - loan),
    totalPaid: Math.round(totalPaid),
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
