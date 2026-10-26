import { useId, useMemo, useState } from 'react';
import { calculateMortgage } from '../../utils/mortgage';
import { formatMoney } from '../../utils/format';
import styles from './MortgageCalculator.module.css';

/** Illustrative repayment estimate. All assumptions are stated and editable; no lender is implied. */
export function MortgageCalculator({ price }: { price: number }) {
  const id = useId();
  const [deposit, setDeposit] = useState(30);
  const [rate, setRate] = useState(3.6);
  const [years, setYears] = useState(25);
  const r = useMemo(() => calculateMortgage({ price, depositPercent: deposit, annualRatePercent: rate, years }), [price, deposit, rate, years]);
  const loanShare = price > 0 ? (r.loan / price) * 100 : 0;

  return (
    <div className={styles.calc}>
      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor={`${id}-deposit`}>
            Deposit <output htmlFor={`${id}-deposit`}>{deposit}% ({formatMoney(r.deposit)})</output>
          </label>
          <input id={`${id}-deposit`} type="range" min={10} max={80} step={5} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
        </div>
        <div className={styles.control}>
          <label htmlFor={`${id}-rate`}>
            Interest rate <output htmlFor={`${id}-rate`}>{rate.toFixed(1)}% a year</output>
          </label>
          <input id={`${id}-rate`} type="range" min={1} max={7} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </div>
        <div className={styles.control}>
          <label htmlFor={`${id}-years`}>
            Term <output htmlFor={`${id}-years`}>{years} years</output>
          </label>
          <input id={`${id}-years`} type="range" min={5} max={35} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </div>
      </div>

      <div className={styles.result} aria-live="polite">
        <p className={styles.monthly}>
          <span className={styles.amount}>{formatMoney(r.monthlyPayment)}</span>
          <span>per month, estimated</span>
        </p>
        <div className={styles.bar} aria-hidden="true">
          <span style={{ width: `${100 - loanShare}%` }} className={styles.barDeposit} />
          <span style={{ width: `${loanShare}%` }} className={styles.barLoan} />
        </div>
        <dl className={styles.breakdown}>
          <div>
            <dt>Loan</dt>
            <dd>{formatMoney(r.loan)}</dd>
          </div>
          <div>
            <dt>Total interest</dt>
            <dd>{formatMoney(r.totalInterest)}</dd>
          </div>
          <div>
            <dt>Total repaid</dt>
            <dd>{formatMoney(r.totalPaid)}</dd>
          </div>
        </dl>
      </div>
      <p className={styles.note}>
        Illustration only, using a standard repayment formula with a fixed rate for the whole term. It excludes taxes, notary and agency fees,
        insurance and lender charges. Not financial advice or an offer of credit.
      </p>
    </div>
  );
}
