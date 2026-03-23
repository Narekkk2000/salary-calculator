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
import BaseBox from '@/components/base/layout/BaseBox.vue'
import BaseHeading from '@/components/base/text/BaseHeading.vue'

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
  sub: string
  color: string
  icon: string
}

const cards = computed<KpiCard[]>(() => {
  const s = store.summary
  return [
    {
      label: 'Համախառն աշխատավարձ',
      value: fmt(s.grossSalary),
      sub: store.period === 'monthly' ? 'per month' : 'per year',
      color: 'black',
      icon: '◈',
    },
    {
      label: 'Մաքուր աշխատավարձ',
      value: fmt(s.netSalary),
      sub: store.period === 'monthly' ? 'take-home / month' : 'take-home / year',
      color: '#139846',
      icon: '◉',
    },
    {
      label: 'Ընդհանուր պահումներ',
      value: fmt(s.deductions.total),
      sub: pct(s.deductions.total) + ' of gross',
      color: '#F3724B',
      icon: '▼',
    },
    {
      label: 'Հարկման փաստացի դրույքաչափ',
      value: formatPercent(s.effectiveTaxRate, 1),
      sub: 'all deductions / gross',
      color: '#12400D',
      icon: '◌',
    },
  ]
})

// ── Deduction rows ─────────────────────────────────────────────────────────────
interface DeductionRow {
  label: string
  amount: number
  pctStr: string
  isFixed: boolean
  color: string
}

const rows = computed<DeductionRow[]>(() => {
  const d = store.summary.deductions
  return [
    {
      label: 'Եկամտային հարկ',
      amount: d.incomeTax,
      pctStr: pct(d.incomeTax),
      isFixed: false,
      color: 'black',
    },
    {
      label: 'Սոցիալական վճար',
      amount: d.socialPayment,
      pctStr: pct(d.socialPayment),
      isFixed: false,
      color: '#F3724B',
    },
    {
      label: 'Դրոշմանիշային վճար',
      amount: d.stampDuty,
      pctStr: 'Ամրագրված',
      isFixed: true,
      color: 'black',
    },
    {
      label: 'Առողջ. ապահովագրություն',
      amount: d.healthInsurance,
      pctStr: 'Ամրագրված',
      isFixed: true,
      color: 'black',
    },
  ]
})
</script>

<template>
  <div class="relative">

    <div class="flex flex-col gap-4">

      <!-- ── KPI cards (2×2 grid) ────────────────────────────────────────────── -->
      <div class="w-full border border-[#E8EEF6] rounded-[6px] p-5 flex flex-col gap-4 transition-all duration-200"
        style="background: #F7F8FA; border-top-left-radius: 0px;">

        <div v-for="(card, index) in cards" :key="card.label" class="pb-3 last:border-b-0 last:pb-0"
          :style="index < cards.length - 1 ? 'border-bottom: 1px solid rgba(255,255,255,0.08)' : ''">
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
            <BaseText tag="span" :style="{ fontWeight: index === 0 ? '600' : '400' }" variant="kpi-value-big" :rawColor="card.color">
              {{ card.value }}
            </BaseText>
          </BaseFlex>
        </div>
      </div>

      <!-- ── Deduction breakdown table ──────────────────────────────────────── -->
      <div>
        <!-- Header -->
        <BaseText class="mt-2 mb-2" variant="sub-hint" color="CONTENT">
          Պահումներ
        </BaseText>
        <div class="w-full border border-[#E8EEF6] rounded-[6px] p-5 flex flex-col gap-4 transition-all duration-200"
          style="background: #F7F8FA; border-top-left-radius: 0px;">

          <!-- Deduction rows -->
          <div v-for="row in rows" :key="row.label" class="flex items-center justify-between py-2.5"
            style="border-bottom: 1px solid rgba(99,179,237,0.05)">
            <!-- Left: colour dot + label -->
            <BaseFlex gap="2" align="center">
              <BaseText tag="span" variant="kpi-label" color="CONTENT">
                {{ row.label }}
              </BaseText>
            </BaseFlex>

            <!-- Right: amount + pct/fixed badge -->
            <BaseFlex gap="3" align="center">
              <BaseText tag="span" variant="kpi-value-big" style="font-weight: 400;" :rawColor="row.color" class="font-arm font-semibold">
                {{ fmt(row.amount) }}
              </BaseText>
              <span class="text-[10px] font-arm py-1 px-1.5 py-0.5 rounded-md" :style="{
                background: row.isFixed ? 'rgba(113,115,114,0.12)' : '#CCE3D6',
                color: row.isFixed ? 'black' : '#12400D',
              }">
                {{ row.pctStr }}
              </span>
            </BaseFlex>
          </div>

          <!-- Separator -->
          <div class="my-1" style="border-top: 2px solid rgba(99,179,237,0.10)" />

          <!-- Total deductions row -->
          <div class="flex items-center justify-between py-2.5">
            <BaseFlex gap="2" align="center">
              <BaseText tag="span" variant="kpi-label" color="CONTENT">
                Պահումներ
              </BaseText>
            </BaseFlex>
            <BaseFlex gap="3" align="center">
              <BaseText tag="span" variant="kpi-value-big" rawColor="#F3724B" class="font-arm font-semibold">
                {{ fmt(store.summary.deductions.total) }}
              </BaseText>
              <span class="text-[10px] font-ibm-mono px-1.5 py-0.5 rounded-md"
                :style="{ background: '#F7EAE4', color: 'black' }">
                {{ pct(store.summary.deductions.total) }}
              </span>
            </BaseFlex>
          </div>

          <!-- Separator -->
          <div class="my-1" style="border-top: 2px solid rgba(99,179,237,0.10)" />

          <!-- Net salary row (highlight) -->
          <div class="flex items-center justify-between py-3 px-3 mt-1"
            style="background: #E5F5E4;">
            <BaseFlex gap="2" align="center">
              <BaseText tag="span" variant="kpi-label" color="CONTENT">
                Մաքուր աշխատավարձ
              </BaseText>
            </BaseFlex>
            <BaseText tag="span" variant="kpi-value-big" rawColor="#388D19">
              {{ fmt(store.summary.netSalary) }}
            </BaseText>
          </div>

        </div>
      </div>
    </div>

    <SalaryDeductionsModal v-if="hasOpenedModal" v-model="isOpen" :cards="cards"
      :rows="rows.map(r => ({ ...r, amountStr: fmt(r.amount) }))" :net-salary-str="fmt(store.summary.netSalary)"
      :total-deductions-str="fmt(store.summary.deductions.total)"
      :total-deductions-pct="pct(store.summary.deductions.total)" />

  </div>
</template>
