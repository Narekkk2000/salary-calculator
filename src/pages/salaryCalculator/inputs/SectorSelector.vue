<script setup lang="ts">
import { computed } from 'vue'
import { useSalaryStore } from '@/stores/salaryCalculator/salaryCalculator'
import { SECTOR_OPTIONS } from '@/constants/salaryOptions'
import type { EmploymentSector } from '@/types/salary'
import { COLORS } from '@/constants/colors'

import SectionCard from '@/components/shared/SectionCard.vue'
import BaseButton from '@/components/base/ui/BaseButton.vue'
import BaseText from '@/components/base/text/BaseText.vue'
import BaseFlex from '@/components/base/layout/BaseFlex.vue'
import { Icon } from '@iconify/vue'

const store = useSalaryStore()

const activeMap = computed(() =>
  Object.fromEntries(
    SECTOR_OPTIONS.map((opt) => [opt.value, store.sector === opt.value]),
  ),
)
</script>

<template>
  <div class="flex items-start justify-evenly flex-col">
    <BaseText class="mb-2" variant="sub-hint" color="CONTENT">
      Զբաղվածության ոլորտը
    </BaseText>

    <BaseFlex class="w-full py-3 border border-#E0E7EF rounded-md" align="start" justify="evenly"
      style="border-top-left-radius: 0px;">
      <BaseButton v-for="opt in SECTOR_OPTIONS" class="flex-1 flex flex-col items-start justify-center" :key="opt.value"
        variant="card-select" :active="activeMap[opt.value]" @click="store.sector = opt.value as EmploymentSector">
        <!-- Icon + label -->
        <BaseFlex gap="5" class="mb-2">
          <BaseText variant="icon-glyph">
            <Icon v-if="activeMap[opt.value]" class="text-[#91B419]" icon="carbon:circle-filled" width="20"
              height="20" />
            <Icon v-else icon="jam:circle" class="text-black" width="20" height="20" />
          </BaseText>
          <BaseFlex col gap="2" align="start">
            <BaseText variant="card-title" >
              {{ opt.label }}
            </BaseText>
            <BaseText  tag="span" variant="hint">
              {{ opt.rate }}% եկամտային հարկ
            </BaseText>
          </BaseFlex>
        </BaseFlex>

        <!-- Rate badge -->
      </BaseButton>
    </BaseFlex>
  </div>
</template>
