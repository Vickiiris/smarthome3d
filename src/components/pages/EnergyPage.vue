<template>
  <div v-show="visible" class="page">
    <div ref="sceneCardRef" class="scene-card" :class="{ fullscreen: isFullscreen }">
      <div class="scene-overlay">
        <div class="room-tabs">
          <button class="room-tab" :class="{ active: activeRoom === 'all' }" @click="$emit('switchRoom', 'all')">全景</button>
          <button v-for="room in rooms" :key="room.id" class="room-tab" :class="{ active: activeRoom === room.id }" @click="$emit('switchRoom', room.id)">{{ room.name }}</button>
        </div>
        <div class="overlay-right">
          <button v-if="isFullscreen" class="fullscreen-btn" @click="$emit('toggleFullscreen')" title="退出全屏">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          </button>
          <button v-else class="fullscreen-btn" @click="$emit('toggleFullscreen')" title="全屏">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 第一行：核心指标卡片 -->
    <div class="energy-overview-row">
      <div class="energy-metric-card electric" @click="$emit('openEnergyDetail', 'today')">
        <div class="em-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="em-info">
          <div class="em-label">今日用电</div>
          <div class="em-value">{{ dailyEnergy }} <span class="em-unit">kWh</span></div>
          <div class="em-trend" :class="electricTrend.dir">{{ electricTrend.label }}</div>
        </div>
      </div>
      <div class="energy-metric-card water" @click="$emit('openEnergyDetail', 'water')">
        <div class="em-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
        </div>
        <div class="em-info">
          <div class="em-label">今日用水</div>
          <div class="em-value">{{ waterToday.toFixed(2) }} <span class="em-unit">m³</span></div>
          <div class="em-trend" :class="waterTrend.dir">{{ waterTrend.label }}</div>
        </div>
      </div>
      <div class="energy-metric-card gas" @click="$emit('openEnergyDetail', 'gas')">
        <div class="em-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-3-4-.5 2-.5 4-1 6a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 22c4.97 0 9-4.03 9-9-4.5 0-9 4.5-9 9z"/><path d="M12 22c-4.97 0-9-4.03-9-9 4.5 0 9 4.5 9 9z"/></svg>
        </div>
        <div class="em-info">
          <div class="em-label">今日燃气</div>
          <div class="em-value">{{ gasToday.toFixed(2) }} <span class="em-unit">m³</span></div>
          <div class="em-trend" :class="gasTrend.dir">{{ gasTrend.label }}</div>
        </div>
      </div>
      <div class="energy-metric-card cost" @click="$emit('openEnergyDetail', 'cost')">
        <div class="em-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <div class="em-info">
          <div class="em-label">今日费用</div>
          <div class="em-value">¥{{ todayCost }}</div>
          <div class="em-trend" :class="costTrend.dir">{{ costTrend.label }}</div>
        </div>
      </div>
    </div>

    <!-- 第二行：趋势图表 -->
    <div class="charts-row">
      <div class="panel-card chart-lg">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon electric" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            用电趋势
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: electricPeriod === p }" @click="$emit('update:electricPeriod', p)">{{ p }}</button>
          </div>
        </div>
        <div ref="lineChartRef" class="chart-box"></div>
      </div>
      <div class="panel-card chart-sm">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon electric" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            用电结构
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: electricPiePeriod === p }" @click="$emit('update:electricPiePeriod', p)">{{ p }}</button>
          </div>
        </div>
        <div ref="pieChartRef" class="chart-box"></div>
      </div>
    </div>

    <!-- 第三行：水气图表 -->
    <div class="charts-row">
      <div class="panel-card chart-lg">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon water" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            用水趋势
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: waterPeriod === p }" @click="$emit('update:waterPeriod', p)">{{ p }}</button>
          </div>
        </div>
        <div ref="waterChartRef" class="chart-box"></div>
      </div>
      <div class="panel-card chart-sm">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon water" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            用水结构
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: waterPiePeriod === p }" @click="$emit('update:waterPiePeriod', p)">{{ p }}</button>
          </div>
        </div>
        <div ref="waterPieChartRef" class="chart-box"></div>
      </div>
    </div>

    <!-- 第四行：燃气图表 -->
    <div class="charts-row">
      <div class="panel-card chart-lg">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon gas" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-3-4-.5 2-.5 4-1 6a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 22c4.97 0 9-4.03 9-9-4.5 0-9 4.5-9 9z"/><path d="M12 22c-4.97 0-9-4.03-9-9 4.5 0 9 4.5 9 9z"/></svg>
            燃气趋势
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: gasPeriod === p }" @click="$emit('update:gasPeriod', p)">{{ p }}</button>
          </div>
        </div>
        <div ref="gasChartRef" class="chart-box"></div>
      </div>
      <div class="panel-card chart-sm">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon gas" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            燃气结构
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: gasPiePeriod === p }" @click="$emit('update:gasPiePeriod', p)">{{ p }}</button>
          </div>
        </div>
        <div ref="gasPieChartRef" class="chart-box"></div>
      </div>
    </div>

    <!-- 第五行：费用明细 -->
    <div class="energy-cost-detail-row">
      <div class="cost-detail-card" @click="$emit('openEnergyDetail', 'electricCost')">
        <div class="cdc-header">
          <div class="cdc-icon electric">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div class="cdc-title">电费明细</div>
        </div>
        <div class="cdc-body">
          <div class="cdc-main">
            <span class="cdc-value">¥{{ electricMonthCost }}</span>
            <span class="cdc-label">本月预估</span>
          </div>
          <div class="cdc-items">
            <div class="cdc-item"><span>峰时用电</span><span>¥{{ electricPeakCost }}</span></div>
            <div class="cdc-item"><span>平时用电</span><span>¥{{ electricNormalCost }}</span></div>
            <div class="cdc-item"><span>谷时用电</span><span>¥{{ electricValleyCost }}</span></div>
          </div>
        </div>
      </div>
      <div class="cost-detail-card" @click="$emit('openEnergyDetail', 'waterCost')">
        <div class="cdc-header">
          <div class="cdc-icon water">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          </div>
          <div class="cdc-title">水费明细</div>
        </div>
        <div class="cdc-body">
          <div class="cdc-main">
            <span class="cdc-value">¥{{ waterMonthCost }}</span>
            <span class="cdc-label">本月预估</span>
          </div>
          <div class="cdc-items">
            <div class="cdc-item"><span>生活用水</span><span>¥{{ waterLifeCost }}</span></div>
            <div class="cdc-item"><span>洗浴用水</span><span>¥{{ waterBathCost }}</span></div>
            <div class="cdc-item"><span>厨房用水</span><span>¥{{ waterKitchenCost }}</span></div>
          </div>
        </div>
      </div>
      <div class="cost-detail-card" @click="$emit('openEnergyDetail', 'gasCost')">
        <div class="cdc-header">
          <div class="cdc-icon gas">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-3-4-.5 2-.5 4-1 6a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 22c4.97 0 9-4.03 9-9-4.5 0-9 4.5-9 9z"/><path d="M12 22c-4.97 0-9-4.03-9-9 4.5 0 9 4.5 9 9z"/></svg>
          </div>
          <div class="cdc-title">燃气费明细</div>
        </div>
        <div class="cdc-body">
          <div class="cdc-main">
            <span class="cdc-value">¥{{ gasMonthCost }}</span>
            <span class="cdc-label">本月预估</span>
          </div>
          <div class="cdc-items">
            <div class="cdc-item"><span>热水器</span><span>¥{{ gasHeaterCost }}</span></div>
            <div class="cdc-item"><span>燃气灶</span><span>¥{{ gasStoveCost }}</span></div>
            <div class="cdc-item"><span>壁挂炉</span><span>¥{{ gasBoilerCost }}</span></div>
          </div>
        </div>
      </div>
      <div class="cost-detail-card total" @click="$emit('openEnergyDetail', 'cost')">
        <div class="cdc-header">
          <div class="cdc-icon total">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div class="cdc-title">费用总计</div>
        </div>
        <div class="cdc-body">
          <div class="cdc-main">
            <span class="cdc-value">¥{{ totalMonthCost }}</span>
            <span class="cdc-label">本月合计</span>
          </div>
          <div class="cdc-items">
            <div class="cdc-item"><span>电费</span><span>¥{{ electricMonthCost }}</span></div>
            <div class="cdc-item"><span>水费</span><span>¥{{ waterMonthCost }}</span></div>
            <div class="cdc-item"><span>燃气费</span><span>¥{{ gasMonthCost }}</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第六行：设备能耗排行 + 环保贡献 -->
    <div class="energy-bottom-row">
      <div class="panel-card rank-card">
        <div class="panel-header">
          <h3 class="panel-title">能耗排行</h3>
          <div class="period-tabs">
            <button v-for="t in rankTabs" :key="t.key" class="ptab" :class="{ active: rankTab === t.key }" @click="$emit('update:rankTab', t.key)">{{ t.label }}</button>
          </div>
        </div>
        <div class="rank-list">
          <div v-for="(item, i) in currentRankList" :key="item.name" class="rank-item" @click="$emit('openEnergyDetail', rankTab + '-rank', item)">
            <div class="rank-num" :class="['g','s','b'][i] || ''">{{ i + 1 }}</div>
            <div class="rank-icon">{{ item.icon }}</div>
            <div class="rank-info">
              <span class="rank-name">{{ item.name }}</span>
              <div class="rank-bar-w"><div class="rank-bar" :style="{ width: item.pct + '%', background: item.color }"></div></div>
            </div>
            <span class="rank-val">{{ item.val }} {{ item.unit }}</span>
          </div>
        </div>
      </div>
      <div class="eco-contribute-card" @click="$emit('openEnergyDetail', 'carbon')">
        <div class="eco-header">
          <span class="eco-icon">🌱</span>
          <span class="eco-title">环保贡献</span>
          <span class="eco-badge-tag">本月</span>
        </div>
        <div class="eco-stats">
          <div class="eco-stat primary">
            <div class="eco-value">{{ carbonReduction }}</div>
            <div class="eco-unit">kg</div>
            <div class="eco-label">CO₂ 减排</div>
          </div>
          <div class="eco-divider"></div>
          <div class="eco-stat">
            <div class="eco-value">{{ Math.floor(carbonReduction / 5) }}</div>
            <div class="eco-unit">棵</div>
            <div class="eco-label">相当于植树</div>
          </div>
          <div class="eco-divider"></div>
          <div class="eco-stat">
            <div class="eco-value">{{ (carbonReduction * 8.3).toFixed(0) }}</div>
            <div class="eco-unit">km</div>
            <div class="eco-label">少开车</div>
          </div>
        </div>
        <div class="eco-progress-row">
          <div class="eco-progress-label">本月节能目标 <span class="eco-progress-pct">{{ savingRate }}%</span></div>
          <div class="eco-progress-bar">
            <div class="eco-progress-fill" :style="{ width: Math.min(savingRate, 100) + '%' }"></div>
          </div>
          <div class="eco-progress-sub">距离 30% 目标还差 {{ Math.max(0, 30 - savingRate) }}%</div>
        </div>
        <div class="eco-tips">
          <div class="eco-tip">
            <span class="tip-icon">💡</span>
            <span>节能率高于 {{ savingRate }}% 的家庭</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const sceneCardRef = ref(null)
const lineChartRef = ref(null)
const pieChartRef = ref(null)
const waterChartRef = ref(null)
const gasChartRef = ref(null)
const waterPieChartRef = ref(null)
const gasPieChartRef = ref(null)

defineExpose({ 
  sceneCardRef,
  lineChartRef,
  pieChartRef,
  waterChartRef,
  gasChartRef,
  waterPieChartRef,
  gasPieChartRef
})

const props = defineProps({
  visible: { type: Boolean, required: true },
  isFullscreen: { type: Boolean, required: true },
  activeRoom: { type: String, required: true },
  rooms: { type: Array, required: true },
  dailyEnergy: { type: [Number, String], required: true },
  waterToday: { type: Number, required: true },
  gasToday: { type: Number, required: true },
  electricTrend: { type: Object, required: true },
  waterTrend: { type: Object, required: true },
  gasTrend: { type: Object, required: true },
  costTrend: { type: Object, required: true },
  rankTab: { type: String, required: true },
  currentRankList: { type: Array, required: true },
  carbonReduction: { type: Number, required: true },
  savingRate: { type: Number, required: true },
  electricPeriod: { type: String, default: '日' },
  waterPeriod: { type: String, default: '日' },
  gasPeriod: { type: String, default: '日' },
  electricPiePeriod: { type: String, default: '日' },
  waterPiePeriod: { type: String, default: '日' },
  gasPiePeriod: { type: String, default: '日' },
  // Chart refs
  lineChartRef: { type: Object, default: null },
  pieChartRef: { type: Object, default: null },
  waterChartRef: { type: Object, default: null },
  gasChartRef: { type: Object, default: null },
  waterPieChartRef: { type: Object, default: null },
  gasPieChartRef: { type: Object, default: null },
})

const periods = ['日', '周', '月']
const rankTabs = [
  { key: 'electric', label: '用电' },
  { key: 'water', label: '用水' },
  { key: 'gas', label: '燃气' }
]

defineEmits(['switchRoom', 'toggleFullscreen', 'openEnergyDetail', 'update:rankTab', 'update:electricPeriod', 'update:waterPeriod', 'update:gasPeriod', 'update:electricPiePeriod', 'update:waterPiePeriod', 'update:gasPiePeriod'])

// Computed cost values - 基于实际用量计算
const dEnergy = computed(() => parseFloat(props.dailyEnergy) || 0)
const dWater = computed(() => props.waterToday || 0)
const dGas = computed(() => props.gasToday || 0)

// 统一单价：电费 0.558元/kWh，水费 2.47元/m³，燃气费 2.53元/m³
const ELECTRIC_RATE = 0.558
const WATER_RATE = 2.47
const GAS_RATE = 2.53

// 今日总费用
const todayCost = computed(() => (dEnergy.value * ELECTRIC_RATE + dWater.value * WATER_RATE + dGas.value * GAS_RATE).toFixed(1))

// 电费明细（基于实际用电量）
const electricMonthCost = computed(() => (dEnergy.value * ELECTRIC_RATE * 30).toFixed(1))
const electricPeakCost = computed(() => (dEnergy.value * ELECTRIC_RATE * 30 * 0.6).toFixed(1))
const electricNormalCost = computed(() => (dEnergy.value * ELECTRIC_RATE * 30 * 0.3).toFixed(1))
const electricValleyCost = computed(() => (dEnergy.value * ELECTRIC_RATE * 30 * 0.1).toFixed(1))

// 水费明细（基于实际用水量）
const waterMonthCost = computed(() => (dWater.value * WATER_RATE * 30).toFixed(1))
const waterLifeCost = computed(() => (dWater.value * WATER_RATE * 30 * 0.7).toFixed(1))
const waterBathCost = computed(() => (dWater.value * WATER_RATE * 30 * 0.2).toFixed(1))
const waterKitchenCost = computed(() => (dWater.value * WATER_RATE * 30 * 0.1).toFixed(1))

// 燃气费明细（基于实际用气量）
const gasMonthCost = computed(() => (dGas.value * GAS_RATE * 30).toFixed(1))
const gasHeaterCost = computed(() => (dGas.value * GAS_RATE * 30 * 0.55).toFixed(1))
const gasStoveCost = computed(() => (dGas.value * GAS_RATE * 30 * 0.35).toFixed(1))
const gasBoilerCost = computed(() => (dGas.value * GAS_RATE * 30 * 0.1).toFixed(1))

// 费用总计
const totalMonthCost = computed(() => {
  const e = parseFloat(electricMonthCost.value) || 0
  const w = parseFloat(waterMonthCost.value) || 0
  const g = parseFloat(gasMonthCost.value) || 0
  return (e + w + g).toFixed(1)
})
</script>

<style scoped>
.period-tabs { display: flex; gap: 4px; }
.ptab { padding: 3px 10px; font-size: 11px; font-weight: 600; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--text-3); border-radius: 20px; cursor: pointer; transition: all 0.2s; }
.ptab:hover { color: var(--text-2); border-color: rgba(255,255,255,0.2); }
.ptab.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); color: #818cf8; }

/* 图表高度 - 参考健康监测页面 */
.chart-box { width: 100%; height: 160px; }
</style>
