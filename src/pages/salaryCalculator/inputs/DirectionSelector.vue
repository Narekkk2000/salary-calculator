<script setup lang="ts">
import { computed } from 'vue'
import { useSalaryStore } from '@/stores/salaryCalculator/salaryCalculator'
import { DIRECTION_OPTIONS } from '@/constants/salaryOptions'
import type { CalcDirection } from '@/types/salary'
import { COLORS } from '@/constants/colors'

import SectionCard from '@/components/shared/SectionCard.vue'
import BaseButton  from '@/components/base/ui/BaseButton.vue'
import BaseText    from '@/components/base/text/BaseText.vue'
import BaseFlex    from '@/components/base/layout/BaseFlex.vue'

const store = useSalaryStore()

const activeMap = computed(() =>
  Object.fromEntries(
    DIRECTION_OPTIONS.map((opt) => [opt.value, store.direction === opt.value]),
  ),
)
</script>

<template>
  <SectionCard title="Calculation Direction">
    <div class="grid grid-cols-1 gap-3">
      <BaseButton
        v-for="opt in DIRECTION_OPTIONS"
        :key="opt.value"
        variant="card-select"
        :active="activeMap[opt.value]"
        @click="store.direction = opt.value as CalcDirection"
      >
        <!-- Icon + label -->
        <BaseFlex gap="2" class="mb-2">
          <BaseText
            variant="icon-glyph"
            :rawColor="activeMap[opt.value] ? COLORS.ACCENT : COLORS.MUTED"
          >
            {{ opt.icon }}
          </BaseText>
          <BaseText
            variant="card-title"
            :rawColor="activeMap[opt.value] ? COLORS.CONTENT : COLORS.MUTED"
          >
            {{ opt.label }}
          </BaseText>
        </BaseFlex>

        <!-- Description -->
        <BaseText tag="p" variant="footnote" color="MUTED" class="leading-snug">
          {{ opt.description }}
        </BaseText>
      </BaseButton>
    </div>
  </SectionCard>
</template>
