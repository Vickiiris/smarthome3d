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
          <span>24小时</span>
        </div>
        <div ref="lineChartRef" class="chart-box"></div>
      </div>
      <div class="panel-card chart-sm">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon electric" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            用电结构
          </h3>
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
          <span>24小时</span>
        </div>
        <div ref="waterChartRef" class="chart-box"></div>
      </div>
      <div class="panel-card chart-sm">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon water" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            用水结构
          </h3>
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
          <span>24小时</span>
        </div>
        <div ref="gasChartRef" class="chart-box"></div>
      </div>
      <div class="panel-card chart-sm">
        <div class="panel-header">
          <h3 class="panel-title">
            <svg class="panel-icon gas" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            燃气结构
          </h3>
        </div>
        <div ref="gasPieChartRef" class="chart-box"></div>
      </div>
    </div>

    <!-- 第五行：费用明细 -->
    <div class="energy-cost-detail-row">
      <div class="cost-detail-card" @click="$emit('openEnergyDetail', 'cost')">
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
    </div>

    <!-- 第六行：设备能耗排行 + 环保贡献 -->
    <div class="energy-bottom-row">
      <div class="panel-card rank-card">
        <div class="panel-header"><h3 class="panel-title">能耗排行</h3><span>用电/用水/燃气</span></div>
        <div class="rank-tabs">
          <button class="rank-tab" :class="{ active: rankTab === 'electric' }" @click="$emit('update:rankTab', 'electric')">用电</button>
          <button class="rank-tab" :class="{ active: rankTab === 'water' }" @click="$emit('update:rankTab', 'water')">用水</button>
          <button class="rank-tab" :class="{ active: rankTab === 'gas' }" @click="$emit('update:rankTab', 'gas')">燃气</button>
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
  // Chart refs
  lineChartRef: { type: Object, default: null },
  pieChartRef: { type: Object, default: null },
  waterChartRef: { type: Object, default: null },
  gasChartRef: { type: Object, default: null },
  waterPieChartRef: { type: Object, default: null },
  gasPieChartRef: { type: Object, default: null },
})

defineEmits(['switchRoom', 'toggleFullscreen', 'openEnergyDetail', 'update:rankTab'])

// Computed cost values
const todayCost = computed(() => ((props.dailyEnergy ?? 8.5) * 0.6 + props.waterToday * 3.5 + props.gasToday * 2.8).toFixed(1))
const electricMonthCost = computed(() => ((props.dailyEnergy ?? 8.5) * 0.6 * 30 + props.waterToday * 3.5 * 30 + props.gasToday * 2.8 * 30).toFixed(1))
const electricPeakCost = computed(() => ((props.dailyEnergy ?? 8.5) * 0.6 * 30 * 0.6).toFixed(1))
const electricNormalCost = computed(() => ((props.dailyEnergy ?? 8.5) * 0.6 * 30 * 0.3).toFixed(1))
const electricValleyCost = computed(() => ((props.dailyEnergy ?? 8.5) * 0.6 * 30 * 0.1).toFixed(1))
const waterMonthCost = computed(() => (props.waterToday * 30 * 3.5).toFixed(1))
const waterLifeCost = computed(() => (props.waterToday * 30 * 3.5 * 0.7).toFixed(1))
const waterBathCost = computed(() => (props.waterToday * 30 * 3.5 * 0.2).toFixed(1))
const waterKitchenCost = computed(() => (props.waterToday * 30 * 3.5 * 0.1).toFixed(1))
const gasMonthCost = computed(() => (props.gasToday * 30 * 2.8).toFixed(1))
const gasHeaterCost = computed(() => (props.gasToday * 30 * 2.8 * 0.55).toFixed(1))
const gasStoveCost = computed(() => (props.gasToday * 30 * 2.8 * 0.35).toFixed(1))
const gasBoilerCost = computed(() => (props.gasToday * 30 * 2.8 * 0.1).toFixed(1))
</script>
