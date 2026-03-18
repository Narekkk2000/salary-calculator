<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useSalaryStore } from '@/stores/salaryCalculator/salaryCalculator'
import { useModal } from '@/composables/ui/useModal'
import { formatNumber, formatPercent } from '@/utils/format'
import { COLORS } from '@/constants/colors'
import type { SalaryCurrency } from '@/types/salary'
import { CURRENCY_SYMBOLS } from '@/constants/currency'

import BaseText from '@/components/base/text/BaseText.vue'
import BaseFlex from '@/components/base/layout/BaseFlex.vue'
import BaseBox     from '@/components/base/layout/BaseBox.vue'
import BaseHeading  from '@/components/base/text/BaseHeading.vue'

const SalaryDeductionsModal = defineAsyncComponent(
  () => import('@/pages/salaryCalculator/results/modals/SalaryDeductionsModal.vue'),
)

const store = useSalaryStore()

const fmt = (v: number) =>
  `${CURRENCY_SYMBOLS[store.currency]}${formatNumber(v, 0)}`

const pct = (v: number) =>
  store.summary.grossSalary > 0
    ? formatPercent((v / store.summary.grossSalary) * 100, 1)
    : '—'

// ── Expand / modal ────────────────────────────────────────────────────────────

const { isOpen, open } = useModal()
const hasOpenedModal = ref(false)

function handleExpandClick() {
  hasOpenedModal.value = true
  open()
}

// ── KPI cards ─────────────────────────────────────────────────────────────────
interface KpiCard {
  label: string
  value: string
  sub:   string
  color: string
  icon:  string
}

const cards = computed<KpiCard[]>(() => {
  const s = store.summary
  return [
    {
      label: 'Համախառն աշխատավարձ',
      value: fmt(s.grossSalary),
      sub:   store.period === 'monthly' ? 'per month' : 'per year',
      color: COLORS.CONTENT,
      icon:  '◈',
    },
    {
      label: 'Մաքուր աշխատավարձ',
      value: fmt(s.netSalary),
      sub:   store.period === 'monthly' ? 'take-home / month' : 'take-home / year',
      color: COLORS.ACCENT,
      icon:  '◉',
    },
    {
      label: 'Ընդհանուր պահումներ',
      value: fmt(s.deductions.total),
      sub:   pct(s.deductions.total) + ' of gross',
      color: COLORS.WARNING,
      icon:  '▼',
    },
    {
      label: 'Հարկման փաստացի դրույքաչափ',
      value: formatPercent(s.effectiveTaxRate, 1),
      sub:   'all deductions / gross',
      color: COLORS.SECONDARY,
      icon:  '◌',
    },
  ]
})

// ── Deduction rows ─────────────────────────────────────────────────────────────
interface DeductionRow {
  label:   string
  amount:  number
  pctStr:  string
  isFixed: boolean
  color:   string
}

const rows = computed<DeductionRow[]>(() => {
  const d = store.summary.deductions
  return [
    {
      label:   'Եկամտային հարկ',
      amount:  d.incomeTax,
      pctStr:  pct(d.incomeTax),
      isFixed: false,
      color:   COLORS.SECONDARY,
    },
    {
      label:   'Սոցիալական վճար',
      amount:  d.socialPayment,
      pctStr:  pct(d.socialPayment),
      isFixed: false,
      color:   COLORS.WARNING,
    },
    {
      label:   'րոշմանիշային վճար',
      amount:  d.stampDuty,
      pctStr:  'ամրագրված',
      isFixed: true,
      color:   COLORS.MUTED,
    },
    {
      label:   'Առողջ. ապահովագրություն',
      amount:  d.healthInsurance,
      pctStr:  'ամրագրված',
      isFixed: true,
      color:   COLORS.DIM,
    },
  ]
})
</script>

<template>
  <div class="relative">

  <div class="flex flex-col gap-4">

    <!-- ── KPI cards (2×2 grid) ────────────────────────────────────────────── -->
        <div
        class="w-full border border-[#E8EEF6] rounded-[3px] p-5 flex flex-col gap-4 transition-all duration-200"
        style="background: #F7F8FA;"
      >
    
      <div
        v-for="(card, index) in cards"
        :key="card.label"
          class="pb-3 last:border-b-0 last:pb-0"
          :style="index < cards.length - 1 ? 'border-bottom: 1px solid rgba(255,255,255,0.08)' : ''"
      >
        <BaseFlex gap="8" align="center" justify="between">
          <!-- Icon + label -->
          <BaseFlex gap="1.5">
            <BaseText tag="span" variant="kpi-label" rawColor="black">
              {{ card.label }}
            </BaseText>
            <BaseText tag="span" variant="kpi-icon" :rawColor="card.color">
              {{ card.icon }}
            </BaseText>
          </BaseFlex>

          <!-- Value -->
          <BaseText tag="span" :variant="index === 0 ? 'kpi-value-big' : 'kpi-value'" :rawColor="card.color">
            {{ card.value }}
          </BaseText>
        </BaseFlex>
      </div>
    </div>

    <!-- ── Deduction breakdown table ──────────────────────────────────────── -->
    <BaseBox>
      <!-- Header -->
      <div
        class="px-5 py-3"
        style="border-bottom: 1px solid rgba(99,179,237,0.07)"
      >
        <BaseHeading :level="3" variant="section-title" color="MUTED">Պահումների բացվածք</BaseHeading>
      </div>

              <div
        class="w-full border border-[#E8EEF6] rounded-[3px] p-5 flex flex-col gap-4 transition-all duration-200"
        style="background: #F7F8FA;"
      >

        <!-- Deduction rows -->
        <div
          v-for="row in rows"
          :key="row.label"
          class="flex items-center justify-between py-2.5"
          style="border-bottom: 1px solid rgba(99,179,237,0.05)"
        >
          <!-- Left: colour dot + label -->
          <BaseFlex gap="2" align="center">
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0 font-arm"
              :style="{ background: row.color }"
            />
            <BaseText tag="span" variant="kpi-label" color="CONTENT">
              {{ row.label }}
            </BaseText>
          </BaseFlex>

          <!-- Right: amount + pct/fixed badge -->
          <BaseFlex gap="3" align="center">
            <BaseText
              tag="span"
              variant="kpi-value"
              :rawColor="row.color"
              class="font-arm font-semibold"
            >
              {{ fmt(row.amount) }}
            </BaseText>
            <span
              class="text-[10px] font-arm px-1.5 py-0.5 rounded-md"
              :style="{
                background: row.isFixed ? 'rgba(113,115,114,0.12)' : 'rgba(61,120,17,0.10)',
                color:      row.isFixed ? COLORS.MUTED : COLORS.SECONDARY,
              }"
            >
              {{ row.pctStr }}
            </span>
          </BaseFlex>
        </div>

        <!-- Separator -->
        <div class="my-1" style="border-top: 2px solid rgba(99,179,237,0.10)" />

        <!-- Total deductions row -->
        <div class="flex items-center justify-between py-2.5">
          <BaseFlex gap="2" align="center">
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ background: COLORS.WARNING }" />
            <BaseText tag="span" variant="footnote" color="CONTENT" class="font-semibold">
              Ընդհանուր պահումներ
            </BaseText>
          </BaseFlex>
          <BaseFlex gap="3" align="center">
            <BaseText
              tag="span"
              variant="footnote"
              :rawColor="COLORS.WARNING"
              class="font-ibm-mono font-semibold"
            >
              {{ fmt(store.summary.deductions.total) }}
            </BaseText>
            <span
              class="text-[10px] font-ibm-mono px-1.5 py-0.5 rounded-md"
              :style="{ background: 'rgba(241,206,100,0.12)', color: COLORS.WARNING }"
            >
              {{ pct(store.summary.deductions.total) }}
            </span>
          </BaseFlex>
        </div>

        <!-- Separator -->
        <div class="my-1" style="border-top: 2px solid rgba(99,179,237,0.10)" />

        <!-- Net salary row (highlight) -->
        <div
          class="flex items-center justify-between py-3 px-3 rounded-lg mt-1"
          style="background: rgba(185,233,25,0.07); border: 1px solid rgba(185,233,25,0.18)"
        >
          <BaseFlex gap="2" align="center">
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ background: COLORS.ACCENT }" />
            <BaseText tag="span" variant="footnote" color="CONTENT" class="font-bold">
              Մաքուր աշխատավարձ
            </BaseText>
          </BaseFlex>
          <BaseText
            tag="span"
            variant="footnote"
            :rawColor="COLORS.ACCENT"
            class="font-ibm-mono font-bold text-base"
          >
            {{ fmt(store.summary.netSalary) }}
          </BaseText>
        </div>

      </div>
    </BaseBox>
  </div>

  <SalaryDeductionsModal
    v-if="hasOpenedModal"
    v-model="isOpen"
    :cards="cards"
    :rows="rows.map(r => ({ ...r, amountStr: fmt(r.amount) }))"
    :net-salary-str="fmt(store.summary.netSalary)"
    :total-deductions-str="fmt(store.summary.deductions.total)"
    :total-deductions-pct="pct(store.summary.deductions.total)"
  />

  </div>
</template>
