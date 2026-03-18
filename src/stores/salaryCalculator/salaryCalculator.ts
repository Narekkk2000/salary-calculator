import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SalaryPeriod,
  EmploymentSector,
  CalcDirection,
  SalaryCurrency,
  SalaryDeductions,
  SalarySummary,
} from '@/types/salary'
import {
  INCOME_TAX_STANDARD_RATE,
  INCOME_TAX_IT_RATE,
  SOCIAL_MONTHLY_THRESHOLD,
  SOCIAL_MONTHLY_BELOW_RATE,
  SOCIAL_MONTHLY_ABOVE_RATE,
  SOCIAL_MONTHLY_ABOVE_DEDUCTION,
  SOCIAL_MONTHLY_CAP,
  SOCIAL_YEARLY_THRESHOLD,
  SOCIAL_YEARLY_ABOVE_DEDUCTION,
  SOCIAL_YEARLY_CAP,
  STAMP_DUTY_BRACKETS,
  HEALTH_INSURANCE_MONTHLY,
  HEALTH_INSURANCE_YEARLY,
} from '@/constants/salaryTax'

// ─── Pure calculation helpers (no reactive dependencies) ─────────────────────

function calcIncomeTax(gross: number, sector: EmploymentSector): number {
  const rate = sector === 'it' ? INCOME_TAX_IT_RATE : INCOME_TAX_STANDARD_RATE
  return gross * rate
}

function calcSocialPayment(gross: number, period: SalaryPeriod): number {
  if (period === 'monthly') {
    if (gross <= SOCIAL_MONTHLY_THRESHOLD) {
      return gross * SOCIAL_MONTHLY_BELOW_RATE
    }
    return Math.min(
      gross * SOCIAL_MONTHLY_ABOVE_RATE - SOCIAL_MONTHLY_ABOVE_DEDUCTION,
      SOCIAL_MONTHLY_CAP,
    )
  } else {
    // Yearly
    if (gross <= SOCIAL_YEARLY_THRESHOLD) {
      return gross * SOCIAL_MONTHLY_BELOW_RATE
    }
    return Math.min(
      gross * SOCIAL_MONTHLY_ABOVE_RATE - SOCIAL_YEARLY_ABOVE_DEDUCTION,
      SOCIAL_YEARLY_CAP,
    )
  }
}

/**
 * Stamp duty brackets are defined per monthly salary.
 * For yearly period, apply bracket on monthly equivalent then scale × 12.
 */
function calcStampDuty(gross: number, period: SalaryPeriod): number {
  const monthlyGross = period === 'yearly' ? gross / 12 : gross
  const bracket = STAMP_DUTY_BRACKETS.find((b) => monthlyGross <= b.maxAmount)
  const monthlyDuty = bracket?.duty ?? STAMP_DUTY_BRACKETS[STAMP_DUTY_BRACKETS.length - 1].duty
  return period === 'yearly' ? monthlyDuty * 12 : monthlyDuty
}

function calcHealthInsurance(period: SalaryPeriod): number {
  return period === 'monthly' ? HEALTH_INSURANCE_MONTHLY : HEALTH_INSURANCE_YEARLY
}

function calcDeductionsFromGross(
  gross: number,
  period: SalaryPeriod,
  sector: EmploymentSector,
): SalaryDeductions {
  const incomeTax       = calcIncomeTax(gross, sector)
  const socialPayment   = calcSocialPayment(gross, period)
  const stampDuty       = calcStampDuty(gross, period)
  const healthInsurance = calcHealthInsurance(period)
  const total           = incomeTax + socialPayment + stampDuty + healthInsurance
  return { incomeTax, socialPayment, stampDuty, healthInsurance, total }
}

/**
 * Binary search to find the gross salary that yields a given net salary.
 * Stamp duty brackets and social cap make the relationship non-linear,
 * so iterative approximation is used. Converges to within 1 AMD.
 */
function findGrossFromNet(
  targetNet: number,
  period: SalaryPeriod,
  sector: EmploymentSector,
): number {
  if (targetNet <= 0) return 0
  let lo = targetNet
  let hi = targetNet * 4 // upper bound — no real salary has >75% deductions

  for (let i = 0; i < 80; i++) {
    const mid  = (lo + hi) / 2
    const ded  = calcDeductionsFromGross(mid, period, sector)
    const net  = mid - ded.total
    if (Math.abs(net - targetNet) < 0.5) return Math.round(mid)
    if (net < targetNet) lo = mid
    else hi = mid
  }
  return Math.round((lo + hi) / 2)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSalaryStore = defineStore('salaryCalculator', () => {
  // ── Input state ─────────────────────────────────────────────────────────────
  // `salaryAmount` is the raw user input: gross when direction=gross2net,
  // desired net when direction=net2gross
  const salaryAmount = ref<number>(500_000)
  const currency     = ref<SalaryCurrency>('AMD')
  const period       = ref<SalaryPeriod>('monthly')
  const sector       = ref<EmploymentSector>('standard')
  const direction    = ref<CalcDirection>('gross2net')

  // ── Derived: effective gross salary ─────────────────────────────────────────
  const grossSalary = computed<number>(() => {
    if (direction.value === 'gross2net') return Math.max(0, salaryAmount.value)
    return findGrossFromNet(salaryAmount.value, period.value, sector.value)
  })

  // ── Derived: itemised deductions ─────────────────────────────────────────────
  const deductions = computed<SalaryDeductions>(() =>
    calcDeductionsFromGross(grossSalary.value, period.value, sector.value),
  )

  // ── Derived: summary ─────────────────────────────────────────────────────────
  const summary = computed<SalarySummary>(() => {
    const gross  = grossSalary.value
    const d      = deductions.value
    const net    = Math.max(0, gross - d.total)
    const effRate = gross > 0 ? (d.total / gross) * 100 : 0
    return {
      grossSalary:      gross,
      netSalary:        net,
      deductions:       d,
      effectiveTaxRate: effRate,
    }
  })

  return {
    // State
    salaryAmount,
    currency,
    period,
    sector,
    direction,
    // Getters
    grossSalary,
    deductions,
    summary,
  }
})
