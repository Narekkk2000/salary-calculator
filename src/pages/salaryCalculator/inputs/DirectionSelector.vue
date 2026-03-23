<script setup lang="ts">
import { computed } from 'vue'
import { useSalaryStore } from '@/stores/salaryCalculator/salaryCalculator'
import { DIRECTION_OPTIONS } from '@/constants/salaryOptions'
import type { CalcDirection } from '@/types/salary'
import { COLORS } from '@/constants/colors'

import SectionCard from '@/components/shared/SectionCard.vue'
import BaseButton from '@/components/base/ui/BaseButton.vue'
import BaseText from '@/components/base/text/BaseText.vue'
import BaseFlex from '@/components/base/layout/BaseFlex.vue'
import { Icon } from '@iconify/vue'

const store = useSalaryStore()

const activeMap = computed(() =>
  Object.fromEntries(
    DIRECTION_OPTIONS.map((opt) => [opt.value, store.direction === opt.value]),
  ),
)
</script>

<template>
  <div>
    <BaseText class="mb-2" variant="sub-hint" color="CONTENT">
      Հաշվարկի նպատակը
    </BaseText>
    <div class="flex flex-col gap-3 w-full py-3 border border-#E0E7EF rounded-md" style="border-top-left-radius: 0px;">
      <BaseButton v-for="opt in DIRECTION_OPTIONS" :key="opt.value" variant="card-select" :active="activeMap[opt.value]"
        @click="store.direction = opt.value as CalcDirection">
        <!-- Icon + label -->
        <BaseFlex gap="6" justify="start" align="center" class="mb-2">
          <Icon v-if="activeMap[opt.value]" class="text-[#91B419]" icon="carbon:circle-filled" width="20" height="20" />
          <Icon v-else icon="jam:circle" class="text-black" width="20" height="20" />
          <BaseFlex col align="start" class="max-w-[300px]">
            <BaseText variant="card-title">
              {{ opt.label }}
            </BaseText>
            <!-- Description -->
            <BaseText tag="p" variant="footnote" color="MUTED" rawColor="#8B8B8B" class="leading-snug">
              {{ opt.description }}
            </BaseText>
          </BaseFlex>
        </BaseFlex>


      </BaseButton>
    </div>
  </div>


</template>
