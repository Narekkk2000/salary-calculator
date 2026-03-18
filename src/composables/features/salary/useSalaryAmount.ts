import { useSalaryStore } from '@/stores/salaryCalculator/salaryCalculator'
import { useValidatedNumberField } from '@/composables/utils/useValidatedNumberField'
import { validateLoanAmount } from '@/utils/validators'

export const MAX_SALARY_AMOUNT = 100_000_000

export const useSalaryAmount = () => {
  const store = useSalaryStore()

  const { localValue, validationError, onInput } = useValidatedNumberField({
    source:    () => store.salaryAmount,
    commit:    (n) => { store.salaryAmount = n },
    validator: (val) => validateLoanAmount(val, MAX_SALARY_AMOUNT),
    parse:     (val) => parseFloat(val.replace(/\./g, '')),
  })

  const isPresetActive = (preset: number) => store.salaryAmount === preset

  const selectPreset = (preset: number) => {
    store.salaryAmount    = preset
    localValue.value      = String(preset)
    validationError.value = ''
  }

  return { localValue, validationError, onInput, isPresetActive, selectPreset }
}
