<script setup lang="ts">
import { computed } from 'vue'
import { useSalaryStore } from '@/stores/salaryCalculator/salaryCalculator'
import { SECTOR_OPTIONS } from '@/constants/salaryOptions'
import type { EmploymentSector } from '@/types/salary'
import { COLORS } from '@/constants/colors'

import SectionCard from '@/components/shared/SectionCard.vue'
import BaseButton  from '@/components/base/ui/BaseButton.vue'
import BaseText    from '@/components/base/text/BaseText.vue'
import BaseFlex    from '@/components/base/layout/BaseFlex.vue'

const store = useSalaryStore()

const activeMap = computed(() =>
  Object.fromEntries(
    SECTOR_OPTIONS.map((opt) => [opt.value, store.sector === opt.value]),
  ),
)
</script>

<template>
  <SectionCard title="Զբաղվածության ոլորտ">
    <div class="flex items-start justify-evenly">
      <BaseButton
        v-for="opt in SECTOR_OPTIONS"
        class="flex-1"
        :key="opt.value"
        variant="card-select"
        :active="activeMap[opt.value]"
        @click="store.sector = opt.value as EmploymentSector"
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
        <!-- <BaseText tag="p" variant="footnote" color="MUTED" class="mb-2 leading-snug">
          {{ opt.description }}
        </BaseText> -->

        <!-- Rate badge -->
        <BaseText
          tag="span"
          variant="hint"
          :rawColor="activeMap[opt.value] ? COLORS.SECONDARY : COLORS.MUTED"
        >
          {{ opt.rate }}% եկամտային հարկ
        </BaseText>
      </BaseButton>
    </div>
  </SectionCard>
</template>
