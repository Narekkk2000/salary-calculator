<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useSalaryStore } from '@/stores/salaryCalculator/salaryCalculator'
import { COLORS } from '@/constants/colors'
import { formatPercent } from '@/utils/format'

import BaseBox     from '@/components/base/layout/BaseBox.vue'
import BaseFlex    from '@/components/base/layout/BaseFlex.vue'
import BaseHeading from '@/components/base/text/BaseHeading.vue'

import SalaryAmountInput from '@/pages/salaryCalculator/inputs/SalaryAmountInput.vue'
import SectorSelector    from '@/pages/salaryCalculator/inputs/SectorSelector.vue'
import DirectionSelector from '@/pages/salaryCalculator/inputs/DirectionSelector.vue'

// Async-load result panels (same pattern as other calculators)
const SalaryDeductionsCard  = defineAsyncComponent(
  () => import('@/pages/salaryCalculator/results/SalaryDeductionsCard.vue'),
)
const SalaryBreakdownChart  = defineAsyncComponent(
  () => import('@/pages/salaryCalculator/results/SalaryBreakdownChart.vue'),
)

const store = useSalaryStore()

const salaryStats = computed(() => [
  {
    value: store.period === 'monthly' ? 'Monthly' : 'Yearly',
    label: 'period',
    color: COLORS.CONTENT,
  },
  {
    value: store.sector === 'it' ? 'IT (10%)' : 'Standard (20%)',
    label: 'income tax',
    color: COLORS.SECONDARY,
  },
  {
    value: formatPercent(store.summary.effectiveTaxRate, 1),
    label: 'effective rate',
    color: COLORS.WARNING,
  },
  {
    value: store.currency,
    label: 'currency',
    color: COLORS.MUTED,
  },
])
</script>

<template>
  <BaseBox
    class="w-full  p-5 sm:p-6 lg:p-8"
    style="box-shadow: rgba(149, 157, 165, 0.2) 0px 12px 30px"
  >
      <div class="w-full space-y-5">
        <BaseFlex gap="3" class="mb-1">
          <div
            class="w-1.5 h-4 rounded-full"
          />
        </BaseFlex>

        <SalaryAmountInput />
        <SectorSelector />
        <DirectionSelector />
      </div>

      <div class="space-y-5">
        <SalaryDeductionsCard />
        <SalaryBreakdownChart />
      </div>
  </BaseBox>
</template>
