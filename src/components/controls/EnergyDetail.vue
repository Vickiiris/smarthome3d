<template>
  <div class="energy-detail">
    <!-- 费用总计双栏详情 -->
    <template v-if="device.id === 'energy-cost-total'">
      <div class="cost-detail-two-col">
        <div class="cost-detail-col">
          <div class="cdc-header">📅 今日估算</div>
          <div class="cdc-big">{{ liveTotalCost }}<span class="cdc-unit">元</span></div>
          <div class="cdc-list">
            <div class="cdc-row cdc-row--total"><span>⚡ 日电费</span><span>¥{{ liveElectricCost }}</span></div>
            <div class="cdc-row cdc-row--total"><span>💧 日水费</span><span>¥{{ liveWaterCost }}</span></div>
            <div class="cdc-row cdc-row--total"><span>🔥 日燃气费</span><span>¥{{ liveGasCost }}</span></div>
          </div>
        </div>
        <div class="cost-detail-col">
          <div class="cdc-header">📆 本月估算</div>
          <div class="cdc-big">{{ monthTotalCost }}<span class="cdc-unit">元</span></div>
          <div class="cdc-list">
            <div class="cdc-row cdc-row--total"><span>⚡ 月电费</span><span>¥{{ monthElectricCost }}</span></div>
            <div class="cdc-row cdc-row--total"><span>💧 月水费</span><span>¥{{ monthWaterCost }}</span></div>
            <div class="cdc-row cdc-row--total"><span>🔥 月燃气费</span><span>¥{{ monthGasCost }}</span></div>
          </div>
        </div>
      </div>
      <div class="cost-trend-two-col">
        <div class="cost-detail-col">
          <div class="cdc-chart-title">📈 今日趋势</div>
          <div class="ed-bars">
            <div v-for="(item, index) in historyStats" :key="index" class="ed-bar-item">
              <div class="ed-bar-label">{{ item.label }}</div>
              <div class="ed-bar-wrap"><div class="ed-bar" :style="{ width: item.width + '%', background: item.color }"></div></div>
              <div class="ed-bar-val">{{ item.value }}元</div>
            </div>
          </div>
        </div>
        <div class="cost-detail-col">
          <div class="cdc-chart-title">📈 本月趋势</div>
          <div class="ed-bars">
            <div v-for="(item, index) in monthHistoryStats" :key="index" class="ed-bar-item">
              <div class="ed-bar-label">{{ item.label }}</div>
              <div class="ed-bar-wrap"><div class="ed-bar" :style="{ width: item.width + '%', background: item.color }"></div></div>
              <div class="ed-bar-val">{{ item.value }}元</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 费用类双栏详情 -->
    <template v-else-if="isCostTypeDual">
      <div class="cost-detail-two-col">
        <div class="cost-detail-col">
          <div class="cdc-header">📅 今日估算</div>
          <div class="cdc-big">{{ costTypeTodayValue }}<span class="cdc-unit">{{ costTypeUnit }}</span></div>
          <div class="cdc-list">
            <template v-if="device.energyType === 'electricCost'">
              <div class="cdc-section-title">📊 各电器明细</div>
              <div v-for="item in device._rankList" :key="item.name" class="cdc-device-row">
                <span class="cdc-device-name">{{ item.icon }} {{ item.name }}</span>
                <div class="cdc-device-bar"><div class="cdc-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                <span class="cdc-device-val">{{ item.val.toFixed(2) }} kWh · ¥{{ (item.val * ELECTRIC_RATE).toFixed(3) }}</span>
              </div>
            </template>
            <template v-if="device.energyType === 'waterCost'">
              <div class="cdc-section-title">📊 各用途明细</div>
              <div v-for="item in device._rankList" :key="item.name" class="cdc-device-row">
                <span class="cdc-device-name">{{ item.icon }} {{ item.name }}</span>
                <div class="cdc-device-bar"><div class="cdc-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                <span class="cdc-device-val">{{ item.val.toFixed(3) }} m³ · ¥{{ (item.val * WATER_RATE).toFixed(3) }}</span>
              </div>
            </template>
            <template v-if="device.energyType === 'gasCost'">
              <div class="cdc-section-title">📊 各设备明细</div>
              <div v-for="item in device._rankList" :key="item.name" class="cdc-device-row">
                <span class="cdc-device-name">{{ item.icon }} {{ item.name }}</span>
                <div class="cdc-device-bar"><div class="cdc-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                <span class="cdc-device-val">{{ item.val.toFixed(3) }} m³ · ¥{{ (item.val * GAS_RATE).toFixed(3) }}</span>
              </div>
            </template>
          </div>
        </div>
        <div class="cost-detail-col">
          <div class="cdc-header">📆 本月估算</div>
          <div class="cdc-big">{{ costTypeMonthValue }}<span class="cdc-unit">{{ costTypeUnit }}</span></div>
          <div class="cdc-list">
            <template v-if="device.energyType === 'electricCost'">
              <div class="cdc-section-title">📊 各电器明细</div>
              <div v-for="item in device._rankList" :key="'m-'+item.name" class="cdc-device-row">
                <span class="cdc-device-name">{{ item.icon }} {{ item.name }}</span>
                <div class="cdc-device-bar"><div class="cdc-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                <span class="cdc-device-val">{{ (item.val * 30).toFixed(2) }} kWh · ¥{{ (item.val * 30 * ELECTRIC_RATE).toFixed(3) }}</span>
              </div>
            </template>
            <template v-if="device.energyType === 'waterCost'">
              <div class="cdc-section-title">📊 各用途明细</div>
              <div v-for="item in device._rankList" :key="'m-'+item.name" class="cdc-device-row">
                <span class="cdc-device-name">{{ item.icon }} {{ item.name }}</span>
                <div class="cdc-device-bar"><div class="cdc-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                <span class="cdc-device-val">{{ (item.val * 30).toFixed(3) }} m³ · ¥{{ (item.val * 30 * WATER_RATE).toFixed(3) }}</span>
              </div>
            </template>
            <template v-if="device.energyType === 'gasCost'">
              <div class="cdc-section-title">📊 各设备明细</div>
              <div v-for="item in device._rankList" :key="'m-'+item.name" class="cdc-device-row">
                <span class="cdc-device-name">{{ item.icon }} {{ item.name }}</span>
                <div class="cdc-device-bar"><div class="cdc-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                <span class="cdc-device-val">{{ (item.val * 30).toFixed(3) }} m³ · ¥{{ (item.val * 30 * GAS_RATE).toFixed(3) }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="cost-trend-two-col">
        <div class="cost-detail-col">
          <div class="cdc-chart-title">📈 今日趋势</div>
          <div class="ed-bars">
            <div v-for="(item, index) in historyStats" :key="index" class="ed-bar-item">
              <div class="ed-bar-label">{{ item.label }}</div>
              <div class="ed-bar-wrap"><div class="ed-bar" :style="{ width: item.width + '%', background: item.color }"></div></div>
              <div class="ed-bar-val">{{ item.value }}{{ costTypeTrendUnit }}</div>
            </div>
          </div>
        </div>
        <div class="cost-detail-col">
          <div class="cdc-chart-title">📈 本月趋势</div>
          <div class="ed-bars">
            <div v-for="(item, index) in costTypeMonthHistory" :key="index" class="ed-bar-item">
              <div class="ed-bar-label">{{ item.label }}</div>
              <div class="ed-bar-wrap"><div class="ed-bar" :style="{ width: item.width + '%', background: item.color }"></div></div>
              <div class="ed-bar-val">{{ item.value }}{{ costTypeTrendUnit }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 非费用类单列详情 -->
    <template v-else>
      <div class="ed-big">
        <span class="ed-val">{{ liveEnergyValue }}</span>
        <span class="ed-unit">{{ device.unit }}</span>
        <span v-if="device.trend" class="ed-trend" :class="device.trend.includes('+') ? 'up' : 'down'">{{ device.trend }}</span>
      </div>
      <p class="ed-desc">{{ device.desc }}</p>
    </template>

    <!-- 各电器明细 -->
    <div class="ed-devices" v-if="device.id?.includes('today') || device.id?.includes('power')">
      <div class="ed-section-title">🔌 各电器用电明细</div>
      <div class="ed-device-list">
        <div v-for="item in device._rankList" :key="item.name" class="ed-device-item">
          <span class="ed-device-name">{{ item.icon }} {{ item.name }}</span>
          <div class="ed-device-bar"><div class="ed-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
          <span class="ed-device-val">{{ item.val }} {{ item.unit }}</span>
        </div>
      </div>
    </div>

    <!-- 用水明细 -->
    <div class="ed-devices" v-if="device.id?.includes('water') && !device.id?.includes('Cost') && !device.id?.includes('rank')">
      <div class="ed-section-title">🚿 用水明细</div>
      <div class="ed-device-list">
        <div v-for="item in device._rankList" :key="item.name" class="ed-device-item">
          <span class="ed-device-name">{{ item.icon }} {{ item.name }}</span>
          <div class="ed-device-bar"><div class="ed-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
          <span class="ed-device-val">{{ item.val }} {{ item.unit }}</span>
        </div>
      </div>
    </div>

    <!-- 燃气明细 -->
    <div class="ed-devices" v-if="device.id?.includes('gas') && !device.id?.includes('Cost') && !device.id?.includes('rank')">
      <div class="ed-section-title">🔥 燃气使用明细</div>
      <div class="ed-device-list">
        <div v-for="item in device._rankList" :key="item.name" class="ed-device-item">
          <span class="ed-device-name">{{ item.icon }} {{ item.name }}</span>
          <div class="ed-device-bar"><div class="ed-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
          <span class="ed-device-val">{{ item.val }} {{ item.unit }}</span>
        </div>
      </div>
    </div>

    <!-- 分时段耗能明细 -->
    <div class="ed-periods" v-if="device.periods">
      <div class="ed-section-title">⏰ 今日分时段耗能</div>
      <div class="ed-period-list">
        <div v-for="p in device.periods" :key="p.label" class="ed-period-item">
          <div class="ed-period-label">{{ p.label }}</div>
          <div class="ed-period-bar"><div class="ed-period-fill" :style="{ width: p.pct + '%', background: p.color }"></div></div>
          <div class="ed-period-val">{{ p.value }} {{ device.unit }}</div>
        </div>
      </div>
    </div>

    <!-- 费用明细 -->
    <div class="ed-cost-detail" v-if="(device.id?.includes('Cost') || device.id === 'energy-cost') && !isCostTypeDual && device.id !== 'energy-cost-total'">
      <div class="ed-section-title">💰 费用明细</div>
      <div class="ed-cost-list">
        <div class="ed-cost-item" v-if="device.id === 'energy-cost'">
          <div class="ed-cost-row"><span>⚡ 电费</span><span>¥{{ liveElectricCost }}</span></div>
          <div class="ed-cost-row"><span>💧 水费</span><span>¥{{ liveWaterCost }}</span></div>
          <div class="ed-cost-row"><span>🔥 燃气费</span><span>¥{{ liveGasCost }}</span></div>
          <div class="ed-cost-row total"><span>合计</span><span>¥{{ liveTotalCost }}</span></div>
        </div>
        <div class="ed-cost-item" v-if="device.id?.includes('electricCost')">
          <div v-for="item in device._rankList" :key="item.name" class="ed-cost-row">
            <span>{{ item.icon }} {{ item.name }}</span><span>¥{{ (item.val * 0.558).toFixed(3) }}</span>
          </div>
          <div class="ed-cost-row total"><span>合计</span><span>¥{{ liveEnergyValue }}</span></div>
        </div>
        <div class="ed-cost-item" v-if="device.id?.includes('waterCost')">
          <div v-for="item in device._rankList" :key="item.name" class="ed-cost-row">
            <span>{{ item.icon }} {{ item.name }}</span><span>¥{{ (item.val * 2.47).toFixed(3) }}</span>
          </div>
          <div class="ed-cost-row total"><span>合计</span><span>¥{{ liveEnergyValue }}</span></div>
        </div>
        <div class="ed-cost-item" v-if="device.id?.includes('gasCost')">
          <div v-for="item in device._rankList" :key="item.name" class="ed-cost-row">
            <span>{{ item.icon }} {{ item.name }}</span><span>¥{{ (item.val * 2.53).toFixed(3) }}</span>
          </div>
          <div class="ed-cost-row total"><span>合计</span><span>¥{{ liveEnergyValue }}</span></div>
        </div>
      </div>
    </div>

    <!-- 环保贡献详情 -->
    <div class="ed-carbon-detail" v-if="device.id === 'energy-carbon'">
      <div class="ed-section-title">🌿 环保贡献明细</div>
      <div class="ed-carbon-grid">
        <div class="ed-carbon-item"><div class="ed-carbon-icon">🏭</div><div class="ed-carbon-val">{{ device.value }}<span class="ed-carbon-unit">kg</span></div><div class="ed-carbon-label">CO₂ 减排量</div></div>
        <div class="ed-carbon-item"><div class="ed-carbon-icon">🌳</div><div class="ed-carbon-val">{{ Math.floor(device.value / 5) }}<span class="ed-carbon-unit">棵</span></div><div class="ed-carbon-label">等效植树</div></div>
        <div class="ed-carbon-item"><div class="ed-carbon-icon">🚗</div><div class="ed-carbon-val">{{ (device.value * 8.3).toFixed(0) }}<span class="ed-carbon-unit">km</span></div><div class="ed-carbon-label">少开车</div></div>
        <div class="ed-carbon-item"><div class="ed-carbon-icon">💡</div><div class="ed-carbon-val">{{ (device.value * 1.5).toFixed(1) }}<span class="ed-carbon-unit">kWh</span></div><div class="ed-carbon-label">节约电能</div></div>
        <div class="ed-carbon-item"><div class="ed-carbon-icon">💧</div><div class="ed-carbon-val">{{ (device.value * 0.12).toFixed(1) }}<span class="ed-carbon-unit">m³</span></div><div class="ed-carbon-label">节约用水</div></div>
        <div class="ed-carbon-item"><div class="ed-carbon-icon">🔥</div><div class="ed-carbon-val">{{ (device.value * 0.08).toFixed(1) }}<span class="ed-carbon-unit">m³</span></div><div class="ed-carbon-label">节约燃气</div></div>
      </div>
      <div class="ed-carbon-summary">
        <div class="ed-carbon-summary-title">📊 本月节能表现</div>
        <div class="ed-carbon-summary-row"><span>节能率</span><span class="highlight">{{ device._savingRate ?? 18 }}%</span></div>
        <div class="ed-carbon-summary-row"><span>月度目标</span><span>30%</span></div>
        <div class="ed-carbon-summary-row"><span>超越家庭比例</span><span class="highlight">72%</span></div>
        <div class="ed-carbon-summary-row"><span>连续节能</span><span>14 天</span></div>
        <div class="ed-carbon-progress">
          <div class="ed-carbon-progress-bar"><div class="ed-carbon-progress-fill" :style="{ width: `${ Math.min(100, Math.max(0, (device._savingRate ?? 18) / 30 * 100)) }%` }"></div></div>
          <div class="ed-carbon-progress-label">距离 30% 目标还差 {{ Math.max(0, 30 - (device._savingRate ?? 18)) }}%</div>
        </div>
      </div>
    </div>

    <!-- 历史对比 -->
    <div class="ed-chart" v-if="!isWideModal">
      <div class="ed-chart-title">📈 用能趋势对比</div>
      <div class="ed-bars">
        <div v-for="(item, index) in historyStats" :key="index" class="ed-bar-item">
          <div class="ed-bar-label">{{ item.label }}</div>
          <div class="ed-bar-wrap"><div class="ed-bar" :style="{ width: item.width + '%', background: item.color }"></div></div>
          <div class="ed-bar-val">{{ item.value }}{{ device.unit }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue'
import { useEnergyDetail } from '../../composables/useEnergyDetail.js'

const props = defineProps({
  device: Object,
  chartData: Object,
  energyLiveData: Object,
})

const deviceRef = toRef(props, 'device')
const chartDataRef = toRef(props, 'chartData')
const energyLiveDataRef = toRef(props, 'energyLiveData')

const {
  liveElectricCost, liveWaterCost, liveGasCost, liveTotalCost,
  liveEnergyValue,
  monthElectricCost, monthWaterCost, monthGasCost, monthTotalCost,
  isWideModal, isCostTypeDual,
  costTypeTodayValue, costTypeMonthValue, costTypeUnit, costTypeTrendUnit,
  costTypeMonthHistory, historyStats, monthHistoryStats,
  ELECTRIC_RATE, WATER_RATE, GAS_RATE,
} = useEnergyDetail(deviceRef, chartDataRef, energyLiveDataRef)
</script>

<style scoped>
.energy-detail { padding: 8px 0; }
.ed-big { text-align: center; padding: 20px; }
.ed-val { font-size: 36px; font-weight: 800;  font-family: var(--font-mono); }
.ed-unit { font-size: 14px; color: var(--text-3); margin-left: 4px; }
.ed-trend { font-size: 12px; font-weight: 600; margin-left: 8px; }
.ed-trend.up { color: #ef4444; }
.ed-trend.down { color: #22c55e; }
.ed-desc { font-size: 12px; color: var(--text-3); text-align: center; margin-top: 4px; }
.ed-section-title { font-size: 13px; font-weight: 600; color: var(--text-2); margin-bottom: 10px; padding-top: 12px; border-top: 1px solid var(--border); }
.ed-device-list { display: flex; flex-direction: column; gap: 8px; }
.ed-device-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.ed-device-name { width: 56px; flex-shrink: 0; color: var(--text-2); }
.ed-device-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.ed-device-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
.ed-device-val { flex-shrink: 0; color: var(--text-1); font-size: 11px; font-family: var(--font-mono); }
.ed-period-list { display: flex; flex-direction: column; gap: 8px; }
.ed-period-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.ed-period-label { width: 60px; flex-shrink: 0; color: var(--text-2); font-size: 11px; }
.ed-period-bar { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.ed-period-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.ed-period-val { flex-shrink: 0; color: var(--text-1); font-size: 11px; font-family: var(--font-mono); }
.ed-cost-list { display: flex; flex-direction: column; gap: 10px; }
.ed-cost-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; }
.ed-cost-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 4px 0; color: var(--text-2); }
.ed-cost-row span:last-child { font-weight: 500; color: var(--text-1); }
.ed-cost-row.total { border-top: 1px solid var(--border); margin-top: 6px; padding-top: 8px; font-weight: 600; }
.ed-cost-row.total span:last-child { color: var(--primary); }
.ed-chart-title { font-size: 13px; font-weight: 600; color: var(--text-2); margin-bottom: 10px; padding-top: 12px; border-top: 1px solid var(--border); }
.ed-bars { display: flex; flex-direction: column; gap: 8px; }
.ed-bar-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.ed-bar-label { width: 56px; flex-shrink: 0; color: var(--text-3); font-size: 11px; }
.ed-bar-wrap { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.ed-bar { height: 100%; border-radius: 3px; transition: width 0.3s; }
.ed-bar-val { flex-shrink: 0; color: var(--text-1); font-size: 11px; font-family: var(--font-mono); }
.ed-carbon-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.ed-carbon-item { text-align: center; padding: 12px 8px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); }
.ed-carbon-icon { font-size: 24px; margin-bottom: 6px; }
.ed-carbon-val { font-size: 18px; font-weight: 700; color: var(--primary); font-family: var(--font-mono); }
.ed-carbon-unit { font-size: 11px; color: var(--text-3); margin-left: 2px; }
.ed-carbon-label { font-size: 10px; color: var(--text-3); margin-top: 4px; }
.ed-carbon-summary { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; }
.ed-carbon-summary-title { font-size: 13px; font-weight: 600; color: var(--text-2); margin-bottom: 10px; }
.ed-carbon-summary-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; color: var(--text-2); }
.ed-carbon-summary-row .highlight { color: var(--primary); font-weight: 600; }
.ed-carbon-progress { margin-top: 10px; }
.ed-carbon-progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.ed-carbon-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), #22c55e); border-radius: 3px; transition: width 0.5s; }
.ed-carbon-progress-label { font-size: 10px; color: var(--text-3); margin-top: 4px; text-align: center; }

/* 双栏布局 */
.cost-detail-two-col { display: flex; gap: 16px; }
.cost-trend-two-col { display: flex; gap: 16px; margin-top: 16px; }
.cost-detail-col { flex: 1; min-width: 0; padding: 16px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; }
.cdc-header { font-size: 13px; font-weight: 600; color: var(--text-2); margin-bottom: 8px; padding-bottom: 8px; }
.cdc-big { font-size: 28px; font-weight: 700; margin-bottom: 12px; line-height: 1.2; font-family: var(--font-mono);}
.cdc-big::after { content: ''; display: block; width: 100%; height: 1px; background: var(--border); margin-top: 8px; }
.cdc-unit { font-size: 13px; font-weight: 400; color: var(--text-3); margin-left: 2px; font-family: var(--font-display);}
.cdc-list { margin-bottom: 12px; }
.cdc-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 4px 0; color: var(--text-2); }
.cdc-row--total { font-weight: 600; color: var(--text-1); margin-top: 4px; padding-top: 6px; }
.cdc-row span:last-child { font-weight: 500; color: var(--text-1); }
.cdc-section-title { font-size: 12px; font-weight: 600; color: var(--text-2); }
.cdc-device-row { display: flex; align-items: center; gap: 6px; padding: 3px 0; font-size: 12px; }
.cdc-device-name { width: 52px; flex-shrink: 0; color: var(--text-2); white-space: nowrap; }
.cdc-device-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.cdc-device-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
.cdc-device-val { flex-shrink: 0; color: var(--text-1); font-size: 11px; white-space: nowrap; }
.cdc-chart-title { font-size: 12px; font-weight: 600; color: var(--text-2); margin-bottom: 8px; padding-top: 8px; }
.cost-detail-col .ed-bars { margin-top: 4px; }
</style>
