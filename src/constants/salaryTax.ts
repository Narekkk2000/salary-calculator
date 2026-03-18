// ─── Income Tax rates ─────────────────────────────────────────────────────────

export const INCOME_TAX_STANDARD_RATE = 0.20  // 20% — general employment
export const INCOME_TAX_IT_RATE       = 0.10  // 10% — IT sector preferential

// ─── Social Payment (Pension) — Monthly thresholds ───────────────────────────

export const SOCIAL_MONTHLY_THRESHOLD        = 500_000   // AMD/month
export const SOCIAL_MONTHLY_BELOW_RATE       = 0.05      // 5%  when salary ≤ threshold
export const SOCIAL_MONTHLY_ABOVE_RATE       = 0.10      // 10% when salary > threshold
export const SOCIAL_MONTHLY_ABOVE_DEDUCTION  = 25_000    // AMD deducted from gross * 10%
export const SOCIAL_MONTHLY_CAP              = 87_500    // AMD maximum monthly social payment

// ─── Social Payment (Pension) — Yearly thresholds ────────────────────────────

export const SOCIAL_YEARLY_THRESHOLD         = 6_000_000 // AMD/year
export const SOCIAL_YEARLY_ABOVE_DEDUCTION   = 300_000   // AMD deducted from gross * 10%
export const SOCIAL_YEARLY_CAP               = 1_050_000 // AMD maximum yearly social payment

// ─── Stamp Duty — fixed bracket amounts (applied to monthly salary) ───────────

export interface StampDutyBracket {
  /** Upper bound of this bracket (AMD, inclusive). Infinity for the last bracket. */
  maxAmount: number
  /** Fixed AMD amount owed for this bracket. */
  duty: number
}

export const STAMP_DUTY_BRACKETS: readonly StampDutyBracket[] = [
  { maxAmount: 100_000,   duty:  1_500 },
  { maxAmount: 200_000,   duty:  3_000 },
  { maxAmount: 500_000,   duty:  5_500 },
  { maxAmount: 1_000_000, duty:  8_500 },
  { maxAmount: Infinity,  duty: 15_000 },
] as const

// ─── Health Insurance — fixed monthly/yearly amounts ─────────────────────────

export const HEALTH_INSURANCE_MONTHLY = 10_800    // AMD
export const HEALTH_INSURANCE_YEARLY  = 129_600   // AMD  (= 10,800 × 12)
