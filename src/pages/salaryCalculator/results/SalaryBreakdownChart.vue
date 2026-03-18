<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js'
import { useSalaryStore } from '@/stores/salaryCalculator/salaryCalculator'
import { useModal } from '@/composables/ui/useModal'
import { COLORS } from '@/constants/colors'
import type { SalaryCurrency } from '@/types/salary'
import { CURRENCY_SYMBOLS } from '@/constants/currency'

import BaseBox     from '@/components/base/layout/BaseBox.vue'
import BaseFlex    from '@/components/base/layout/BaseFlex.vue'
import BaseHeading from '@/components/base/text/BaseHeading.vue'
import BaseButton  from '@/components/base/ui/BaseButton.vue'

const SalaryBreakdownChartModal = defineAsyncComponent(
  () => import('@/pages/salaryCalculator/results/modals/SalaryBreakdownChartModal.vue'),
)

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

// ── Store ─────────────────────────────────────────────────────────────────────

const store = useSalaryStore()

// ── Chart type toggle ─────────────────────────────────────────────────────────

type ChartStyle = 'doughnut' | 'bar'
const chartStyle = ref<ChartStyle>('doughnut')

// ── Expand / modal ────────────────────────────────────────────────────────────

const { isOpen, open } = useModal()
const hasOpenedModal = ref(false)

function handleExpandClick() {
  hasOpenedModal.value = true
  open()
}

// ── Currency formatter ────────────────────────────────────────────────────────

function fmtTooltip(v: number): string {
  const sym = CURRENCY_SYMBOLS[store.currency]
  return `${sym}${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v)}`
}

function fmtTick(v: number): string {
  const sym = CURRENCY_SYMBOLS[store.currency]
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `${sym}${(v / 1_000).toFixed(0)}K`
  return `${sym}${v}`
}

// ── Chart segment definitions ─────────────────────────────────────────────────

const segments = computed(() => {
  const s = store.summary
  return [
    { label: 'Net Salary',       value: s.netSalary,          color: COLORS.ACCENT    },
    { label: 'Income Tax',       value: s.deductions.incomeTax,       color: COLORS.SECONDARY },
    { label: 'Social Payment',   value: s.deductions.socialPayment,   color: COLORS.WARNING   },
    { label: 'Stamp Duty',       value: s.deductions.stampDuty,       color: COLORS.MUTED     },
    { label: 'Health Insurance', value: s.deductions.healthInsurance, color: COLORS.DIM       },
  ]
})

// ── Doughnut chart ────────────────────────────────────────────────────────────

const doughnutData = computed(() => ({
  labels: segments.value.map((s) => s.label),
  datasets: [
    {
      data:            segments.value.map((s) => s.value),
      backgroundColor: segments.value.map((s) => s.color),
      borderColor:     segments.value.map(() => COLORS.SURFACE),
      borderWidth:     3,
      hoverOffset:     8,
    },
  ],
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400 },
  cutout: '62%',
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color:  COLORS.MUTED,
        font:   { family: '\'IBM Plex Mono\', monospace', size: 11, weight: 500 as any },
        boxWidth:  12,
        boxHeight: 12,
        padding:   14,
        generateLabels: (chart: any) => {
          const data  = chart.data
          if (!data.labels?.length) return []
          const total = (data.datasets[0].data as number[]).reduce((a: number, b: number) => a + b, 0)
          return data.labels.map((label: string, i: number) => {
            const value = data.datasets[0].data[i] as number
            const pct   = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
            return {
              text:        `${label}  ${pct}%`,
              fillStyle:   data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].borderColor[i],
              lineWidth:   1,
              hidden:      false,
              index:       i,
            }
          })
        },
      },
    },
    tooltip: {
      backgroundColor: COLORS.SURFACE,
      borderColor:     'rgba(99,179,237,0.2)',
      borderWidth:     1,
      titleColor:      COLORS.MUTED,
      bodyColor:       COLORS.CONTENT,
      titleFont:       { family: '\'IBM Plex Mono\', monospace', size: 10 },
      bodyFont:        { family: '\'IBM Plex Mono\', monospace', size: 11 },
      callbacks: {
        label: (ctx: any) => {
          const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0)
          const pct   = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : '0.0'
          return ` ${ctx.label}: ${fmtTooltip(ctx.raw)}  (${pct}%)`
        },
      },
    },
  },
}))

// ── Horizontal Bar chart ──────────────────────────────────────────────────────

const barData = computed(() => ({
  labels: segments.value.map((s) => s.label),
  datasets: [
    {
      label:           'Amount',
      data:            segments.value.map((s) => s.value),
      backgroundColor: segments.value.map((s) => s.color),
      borderRadius:    4,
      borderSkipped:   false,
    },
  ],
}))

const barOptions = computed(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: COLORS.SURFACE,
      borderColor:     'rgba(99,179,237,0.2)',
      borderWidth:     1,
      titleColor:      COLORS.MUTED,
      bodyColor:       COLORS.CONTENT,
      titleFont:       { family: '\'IBM Plex Mono\', monospace', size: 10 },
      bodyFont:        { family: '\'IBM Plex Mono\', monospace', size: 11 },
      callbacks: {
        label: (ctx: any) => ` ${fmtTooltip(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: {
      grid:   { color: 'rgba(255,255,255,0.04)' },
      ticks:  {
        color: COLORS.DIM,
        font:  { family: '\'IBM Plex Mono\', monospace', size: 9 },
        callback: (v: any) => fmtTick(v),
      },
      border: { display: false },
    },
    y: {
      grid:   { display: false },
      ticks:  {
        color: COLORS.MUTED,
        font:  { family: '\'IBM Plex Mono\', monospace', size: 10 },
      },
      border: { display: false },
    },
  },
}))

const hasData = computed(() => store.summary.grossSalary > 0)
</script>

<template>
  <div class="w-full flex flex-col items-start items-center gap-3 bg-gray-50 p-2 rounded-sm">

      <BaseHeading :level="3" variant="section-title" color="MUTED">
        Աշխատավարձի բացվածք
      </BaseHeading>

    <!-- Expand button -->
    <!-- <button
      type="button"
      aria-label="Expand chart"
      class="absolute -top-0 right-0 flex items-center justify-center w-6 h-6 rounded-md cursor-pointer transition-all duration-150"
      style="background: rgba(99,179,237,0.05); border: 1px solid rgba(99,179,237,0.1); color: #3C5801;"
      @mouseenter="($event.currentTarget as HTMLButtonElement).style.color = '#B9E919'"
      @mouseleave="($event.currentTarget as HTMLButtonElement).style.color = '#3C5801'"
      @click="handleExpandClick"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </button> -->
    <button @click="handleExpandClick" class="font-arm bg-black text-white rounded-sm px-2 py-1">
      Բացել
    </button>

  <!-- <BaseBox overflow>
    <BaseFlex
      justify="between"
      align="center"
      class="px-5 py-3"
      style="border-bottom: 1px solid rgba(99,179,237,0.07)"
    >
      <BaseHeading :level="3" variant="section-title" color="MUTED">
        Salary Breakdown
      </BaseHeading>

      <BaseFlex gap="1.5" align="center">
        <BaseButton
          variant="toggle"
          :style="{
            color:      COLORS.MUTED,
            border:     chartStyle === 'doughnut'
              ? '1px solid rgba(185,233,25,0.4)'
              : '1px solid rgba(99,179,237,0.12)',
            background: chartStyle === 'doughnut'
              ? 'rgba(185,233,25,0.08)'
              : 'transparent',
          }"
          @click="chartStyle = 'doughnut'"
        >
          Doughnut
        </BaseButton>
        <BaseButton
          variant="toggle"
          :style="{
            color:      COLORS.MUTED,
            border:     chartStyle === 'bar'
              ? '1px solid rgba(185,233,25,0.4)'
              : '1px solid rgba(99,179,237,0.12)',
            background: chartStyle === 'bar'
              ? 'rgba(185,233,25,0.08)'
              : 'transparent',
          }"
          @click="chartStyle = 'bar'"
        >
          Bar
        </BaseButton>
      </BaseFlex>
    </BaseFlex>

    <div class="p-5" style="height: 280px">
      <Doughnut
        v-if="chartStyle === 'doughnut' && hasData"
        :data="doughnutData"
        :options="doughnutOptions"
      />

      <Bar
        v-else-if="chartStyle === 'bar' && hasData"
        :data="barData"
        :options="barOptions"
      />

      <div
        v-else
        class="flex items-center justify-center h-full text-xs font-ibm-mono"
        :style="{ color: COLORS.DIM }"
      >
        Enter a salary to see the breakdown
      </div>
    </div>
  </BaseBox> -->

  <SalaryBreakdownChartModal
    v-if="hasOpenedModal"
    v-model="isOpen"
    :segments="segments"
    :currency="store.currency"
    :initial-style="chartStyle"
  />

  </div>
</template>
