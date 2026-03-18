<script setup lang="ts">
import { computed } from 'vue'
import { useSalaryStore }  from '@/stores/salaryCalculator/salaryCalculator'
import { useSalaryAmount } from '@/composables/features/salary/useSalaryAmount'
import { formatPresetLabel } from '@/utils/formatters'
import {
  SALARY_AMOUNT_PRESETS_MONTHLY,
  SALARY_CURRENCY_OPTIONS,
  SALARY_PERIOD_OPTIONS,
} from '@/constants/salaryOptions'
import type { SalaryPeriod, SalaryCurrency } from '@/types/salary'
import { CURRENCY_SYMBOLS } from '@/constants/currency'

import SectionCard  from '@/components/shared/SectionCard.vue'
import InputField   from '@/components/shared/InputField.vue'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'
import BaseButton   from '@/components/base/ui/BaseButton.vue'
import BaseFlex     from '@/components/base/layout/BaseFlex.vue'
import BaseText     from '@/components/base/text/BaseText.vue'
import BaseDivider from '@/components/base/ui/BaseDivider.vue'

const store = useSalaryStore()
const { localValue, validationError, onInput, isPresetActive, selectPreset } = useSalaryAmount()

// ── Presets scaled to the active period ──────────────────────────────────────
const presets = computed(() =>
  SALARY_AMOUNT_PRESETS_MONTHLY.map((p) =>
    store.period === 'yearly' ? p * 12 : p,
  ),
)

// ── Input label changes with calc direction ───────────────────────────────────
const inputLabel = computed(() =>
  store.direction === 'net2gross' ? 'Ցանկալի աշխատավարձ' : 'Համախառն աշխատավարձ',
)

// ── Period toggle: convert amount when switching ──────────────────────────────
function onPeriodChange(newPeriod: string) {
  const prev = store.period
  const cur  = parseFloat(localValue.value.replace(/\./g, ''))
  if (!isNaN(cur) && cur > 0) {
    const converted = prev === 'monthly' ? cur * 12 : Math.round(cur / 12)
    store.salaryAmount    = converted
    localValue.value      = String(converted)
    validationError.value = ''
  }
  store.period = newPeriod as SalaryPeriod
}
</script>

<template>
    <BaseFlex col align="start" gap="4">

            <!-- ── Amount input + currency ────────────────────────────────────────── -->
      <BaseFlex col align="stretch" class="w-full">
         <ToggleSwitch
            class="self-end"
            :options="SALARY_CURRENCY_OPTIONS"
            :model-value="store.currency"
            @update:model-value="(val) => (store.currency = val as SalaryCurrency)"
          />
          <InputField
            has-prefix
            :label="inputLabel"
            type="number"
            inputmode="numeric"
            placeholder="500000"
            label-margin-top="-28px"
            :model-value="localValue"
            :error="validationError"
            @update:model-value="onInput"
          >
            <template #prefix>{{ CURRENCY_SYMBOLS[store.currency] }}</template>
          </InputField>


      </BaseFlex>

              <!-- Quick-set presets -->
        <BaseFlex gap="2" wrap class="mt-3">
          <BaseButton
            v-for="preset in presets"
            :key="preset"
            variant="preset"
            :active="isPresetActive(preset)"
            @click="selectPreset(preset)"
          >
            {{ formatPresetLabel(preset) }}
          </BaseButton>
        </BaseFlex>

        <BaseDivider/>

      <!-- ── Period toggle ──────────────────────────────────────────────────── -->
      <BaseFlex align="center" justify="between" gap="3" class="w-full">
        <BaseText variant="sub-hint" color="CONTENT">Ժամանակահատված</BaseText>
        <ToggleSwitch
          :options="SALARY_PERIOD_OPTIONS"
          :model-value="store.period"
          @update:model-value="onPeriodChange"
        />
      </BaseFlex>
    </BaseFlex>
    <BaseDivider/>
</template>
