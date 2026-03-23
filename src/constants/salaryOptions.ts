import type { SalaryPeriod, EmploymentSector, CalcDirection, SalaryCurrency } from '@/types/salary'

// ─── Salary Amount presets (monthly AMD) ─────────────────────────────────────

export const SALARY_AMOUNT_PRESETS_MONTHLY = [
  150_000,
  300_000,
  500_000,
  750_000,
  1_000_000,
  2_000_000,
] as const

// ─── Currency options (display label only — tax rules are always AMD-based) ───

export const SALARY_CURRENCY_OPTIONS: { value: SalaryCurrency; label: string }[] = [
  { value: 'AMD', label: 'AMD' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

// ─── Period options ───────────────────────────────────────────────────────────

export const SALARY_PERIOD_OPTIONS: { value: SalaryPeriod; label: string }[] = [
  { value: 'monthly', label: 'Ամսական' },
  { value: 'yearly',  label: 'Տարեկան'  },
]

// ─── Sector options ───────────────────────────────────────────────────────────

export interface SectorOption {
  value:        EmploymentSector
  icon:         string
  iconSelected: string
  label:        string
  description:  string
  rate:         number
}

export const SECTOR_OPTIONS: SectorOption[] = [
  {
    value:       'standard',
    icon:        '○',
    iconSelected: '◉',
    label:       'Ստանդարտ',
    description: 'Ընդհանուր զբաղվածություն',
    rate:        20,
  },
  {
    value:       'it',
    icon:        '○',
    iconSelected: '◉',
    label:       'ՏՏ ոլորտ',
    description: 'Տեղեկատվական տեխնոլոգիաներ՝ արտոնյալ սակագին',
    rate:        10,
  },
]

// ─── Calculation direction options ────────────────────────────────────────────

export interface DirectionOption {
  value:       CalcDirection
  icon:        string
  label:       string
  description: string
}

export const DIRECTION_OPTIONS: DirectionOption[] = [
  {
    value:       'gross2net',
    icon:        '▼',
    label:       'Համախառնից - Զուտ',
    description: 'Մուտքագրեք աշխատանքային պայմանագրում նշված թիվը, հաշվելու՝ որքան աշխատավարձ կունենաք հարկերից հետո։',
  },
  {
    value:       'net2gross',
    icon:        '▲',
    label:       'Զուտ աշխատավարձից - Համախառն',
    description: 'Մուտքագրեք փաստացի ստացված աշխատավարձը, հաշվելու՝ որքան է կազմում Ձեր համախառն աշխատավարձը (ներառյալ հարկերը)։',
  },
]
