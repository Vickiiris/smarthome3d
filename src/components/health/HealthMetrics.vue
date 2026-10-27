<template>
  <div class="health-metrics-grid">
    <div v-for="item in healthItems" :key="item.label"
         class="hmetric-card"
         :style="{ borderTopColor: item.color }"
         @click="$emit('openHealthDetail', item)">
      <div class="hmetric-top">
        <span class="hmetric-icon"><AppIcon :icon="item.icon" :size="17" /></span>
        <span class="hmetric-label">{{ item.label }}</span>
        <span class="hmetric-badge" :class="getStatus(item)">{{ getStatusText(item) }}</span>
      </div>
      <div class="hmetric-value" :style="{ color: item.color }">
        <span v-html="formatMetricValue(item.value)"></span>
      </div>
      <div class="hmetric-bar-wrap">
        <div class="hmetric-bar" :style="{ width: item.pct + '%', backgroundColor: item.color }"></div>
      </div>
      <div class="hmetric-footer">
        <span class="hmetric-range" :style="{ color: item.color }" v-html="formatMetricValue(item.range)"></span>
        <span class="hmetric-trend" :class="trendClass(item)">
          <template v-if="!item.trend">—</template>
          <template v-else>{{ item.trend > 0 ? '▲' : '▼' }} {{ Math.abs(item.trend) }}{{ unitOf(item) }}</template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  healthItems: { type: Array, required: true },
  formatMetricValue: { type: Function, required: true },
  getHeartStatus: Function, getBpStatus: Function,
  getSpo2Status: Function, getTempStatus: Function, getStepsStatus: Function,
})
defineEmits(['openHealthDetail'])

// 涨跌角标：补上单位，并按「该指标涨是好还是坏」着色
// 例：步数、血氧、睡眠上升是好事（绿），心率、体温、血压上升是坏事（红）
const UNITS = { 心率: '次', 血压: '', 体温: '°C', 血氧: '%', 睡眠: 'h', 步数: '步' }
const UP_IS_GOOD = new Set(['步数', '血氧', '睡眠'])

function unitOf(item) { return UNITS[item.label] ?? '' }
function trendClass(item) {
  if (!item.trend) return 'zero'
  const up = item.trend > 0
  const good = UP_IS_GOOD.has(item.label) ? up : !up
  return good ? 'good' : 'bad'
}

function getStatus(item) {
  if (item.label === '心率') return props.getHeartStatus(item.raw).class
  if (item.label === '血压') { const p = item.value.split('/'); return props.getBpStatus(parseInt(p[0]), parseInt(p[1])).class }
  if (item.label === '血氧') return props.getSpo2Status(item.raw).class
  if (item.label === '体温') return props.getTempStatus(item.raw).class
  if (item.label === '步数') return props.getStepsStatus(item.raw).class
  return 'normal'
}
function getStatusText(item) {
  if (item.label === '心率') return props.getHeartStatus(item.raw).text
  if (item.label === '血压') { const p = item.value.split('/'); return props.getBpStatus(parseInt(p[0]), parseInt(p[1])).text }
  if (item.label === '血氧') return props.getSpo2Status(item.raw).text
  if (item.label === '体温') return props.getTempStatus(item.raw).text
  if (item.label === '步数') return props.getStepsStatus(item.raw).text
  return '正常'
}
</script>

<style scoped>
.health-metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
.hmetric-card {
  padding: 14px 16px; background: var(--surface);
  border: 1px solid var(--border); border-radius: 12px; border-top: 2px solid;
  transition: all var(--transition); cursor: pointer;
}
.hmetric-card:hover { background: var(--surface-hover); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.hmetric-top { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.hmetric-icon { font-size: 16px; }
.hmetric-label { font-size: 12px; color: var(--text-2); flex: 1; }
.hmetric-badge { font-size: 10px; padding: 2px 8px; border-radius: 20px; background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
.hmetric-badge.warning { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.2); }
.hmetric-badge.danger { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
.hmetric-value { font-size: 22px; margin-bottom: 8px; line-height: 1; }
.hmetric-value :deep(.num) { font-family: var(--font-mono); color: inherit; }
.hmetric-bar-wrap { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 6px; }
.hmetric-bar { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.hmetric-footer { display: flex; justify-content: space-between; align-items: center; }
.hmetric-range { font-size: 10px; color: var(--text-3); }
.hmetric-range :deep(.num) { font-family: var(--font-mono); font-size: 10px; }
.hmetric-trend { font-size: 11px; font-weight: 600; }
.hmetric-trend.good { color: #22c55e; }
.hmetric-trend.bad { color: #ef4444; }
.hmetric-trend.zero { color: var(--text-3); }
</style>
