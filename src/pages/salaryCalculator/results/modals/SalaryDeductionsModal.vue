<template>
  <BaseModal
    :model-value="modelValue"
    max-width="2xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <template #header="{ close }">
      <div
        class="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style="border-bottom: 1px solid rgba(99,179,237,0.1)"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-1 h-5 rounded-full"
            style="background: linear-gradient(to bottom, #B9E919, rgba(185,233,25,0.2))"
          />
          <BaseHeading :level="2" variant="section-title" color="CONTENT">
            Salary Breakdown
          </BaseHeading>
        </div>
        <button
          type="button"
          class="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer transition-all duration-150"
          style="background: rgba(99,179,237,0.06); border: 1px solid rgba(99,179,237,0.12); color: #717372;"
          aria-label="Close"
          @mouseenter="($event.currentTarget as HTMLButtonElement).style.color = '#B9E919'"
          @mouseleave="($event.currentTarget as HTMLButtonElement).style.color = '#717372'"
          @click="close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </template>

    <!-- ── Body ────────────────────────────────────────────────────────────── -->
    <div class="p-6 flex flex-col gap-6">

      <!-- KPI cards -->
      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="card in cards"
          :key="card.label"
          class="rounded-xl py-3 px-5 flex flex-col justify-center gap-2 min-h-36 transition-all duration-200"
          style="background: var(--color-app-bg); border: 1px solid rgba(99,179,237,0.09);"
        >
          <div class="flex items-center gap-2">
            <BaseText tag="span" variant="kpi-icon-modal" :rawColor="card.color">{{ card.icon }}</BaseText>
            <BaseText tag="span" variant="kpi-label-modal" color="CONTENT">{{ card.label }}</BaseText>
          </div>
          <div class="text-2xl font-semibold leading-tight font-ibm-mono" :style="{ color: card.color }">
            {{ card.value }}
          </div>
          <BaseText tag="div" variant="footnote-modal" color="MUTED" class="leading-tight">{{ card.sub }}</BaseText>
        </div>
      </div>

      <!-- Deduction table -->
      <div class="rounded-xl overflow-hidden" style="border: 1px solid rgba(99,179,237,0.09);">
        <div class="px-5 py-3" style="border-bottom: 1px solid rgba(99,179,237,0.07); background: var(--color-app-bg)">
          <BaseHeading :level="3" variant="section-title" color="MUTED">Deduction Breakdown</BaseHeading>
        </div>
        <div class="px-5 py-2 flex flex-col">
          <!-- Deduction rows -->
          <div
            v-for="row in rows"
            :key="row.label"
            class="flex items-center justify-between py-3"
            style="border-bottom: 1px solid rgba(99,179,237,0.05)"
          >
            <BaseFlex gap="2" align="center">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: row.color }" />
              <BaseText tag="span" variant="footnote" color="CONTENT" class="text-sm">{{ row.label }}</BaseText>
            </BaseFlex>
            <BaseFlex gap="3" align="center">
              <BaseText tag="span" variant="footnote" :rawColor="row.color" class="font-ibm-mono font-semibold text-sm">
                {{ row.amountStr }}
              </BaseText>
              <span
                class="text-[10px] font-ibm-mono px-1.5 py-0.5 rounded-md"
                :style="{
                  background: row.isFixed ? 'rgba(113,115,114,0.12)' : 'rgba(61,120,17,0.10)',
                  color:      row.isFixed ? COLORS.MUTED : COLORS.SECONDARY,
                }"
              >{{ row.pctStr }}</span>
            </BaseFlex>
          </div>

          <!-- Total -->
          <div class="my-1" style="border-top: 2px solid rgba(99,179,237,0.10)" />
          <div class="flex items-center justify-between py-3">
            <BaseFlex gap="2" align="center">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: COLORS.WARNING }" />
              <BaseText tag="span" variant="footnote" color="CONTENT" class="font-semibold text-sm">Total Deductions</BaseText>
            </BaseFlex>
            <BaseFlex gap="3" align="center">
              <BaseText tag="span" variant="footnote" :rawColor="COLORS.WARNING" class="font-ibm-mono font-semibold text-sm">
                {{ totalDeductionsStr }}
              </BaseText>
              <span class="text-[10px] font-ibm-mono px-1.5 py-0.5 rounded-md"
                :style="{ background: 'rgba(241,206,100,0.12)', color: COLORS.WARNING }">
                {{ totalDeductionsPct }}
              </span>
            </BaseFlex>
          </div>

          <!-- Net salary highlight -->
          <div class="my-1" style="border-top: 2px solid rgba(99,179,237,0.10)" />
          <div
            class="flex items-center justify-between py-3 px-3 rounded-lg my-2"
            style="background: rgba(185,233,25,0.07); border: 1px solid rgba(185,233,25,0.18)"
          >
            <BaseFlex gap="2" align="center">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: COLORS.ACCENT }" />
              <BaseText tag="span" variant="footnote" color="CONTENT" class="font-bold text-sm">Net Salary</BaseText>
            </BaseFlex>
            <BaseText tag="span" variant="footnote" :rawColor="COLORS.ACCENT" class="font-ibm-mono font-bold text-lg">
              {{ netSalaryStr }}
            </BaseText>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Footer ──────────────────────────────────────────────────────────── -->
    <template #footer>
      <div class="px-6 py-3" style="border-top: 1px solid rgba(99,179,237,0.07)">
        <BaseText tag="p" variant="footnote" color="DEEP">
          All values are indicative. Tax rules apply to Armenian resident employees.
        </BaseText>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { COLORS } from '@/constants/colors'
import BaseModal   from '@/components/base/overlays/BaseModal.vue'
import BaseHeading from '@/components/base/text/BaseHeading.vue'
import BaseText    from '@/components/base/text/BaseText.vue'
import BaseFlex    from '@/components/base/layout/BaseFlex.vue'

export interface KpiCard {
  label: string; value: string; sub: string; color: string; icon: string
}
export interface DeductionRow {
  label: string; amountStr: string; pctStr: string; isFixed: boolean; color: string
}

defineProps<{
  modelValue:        boolean
  cards:             KpiCard[]
  rows:              DeductionRow[]
  netSalaryStr:      string
  totalDeductionsStr: string
  totalDeductionsPct: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
