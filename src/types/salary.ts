export type SalaryPeriod    = 'monthly' | 'yearly'
export type EmploymentSector = 'standard' | 'it'
export type CalcDirection   = 'gross2net' | 'net2gross'
export type SalaryCurrency  = 'AMD' | 'USD' | 'EUR'

export interface SalaryDeductions {
  incomeTax:      number
  socialPayment:  number
  stampDuty:      number
  healthInsurance: number
  total:          number
}

export interface SalarySummary {
  grossSalary:      number
  netSalary:        number
  deductions:       SalaryDeductions
  effectiveTaxRate: number
}
