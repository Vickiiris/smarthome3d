<template>
  <div v-show="visible" class="page health-page">

    <HealthHero
      :heartRate="healthItems.find(i => i.label === '心率')?.raw ?? 72"
      :spo2="healthItems.find(i => i.label === '血氧')?.raw ?? 98"
      :temp="healthItems.find(i => i.label === '体温')?.raw ?? 36.6"
      :score="92"
    />

    <HealthMetrics
      :healthItems="healthItems"
      :formatMetricValue="formatMetricValue"
      :getHeartStatus="getHeartStatus" :getBpStatus="getBpStatus"
      :getSpo2Status="getSpo2Status" :getTempStatus="getTempStatus"
      :getStepsStatus="getStepsStatus"
      @openHealthDetail="(item) => $emit('openHealthDetail', item)"
    />

    <!-- 心率 + 血压 -->
    <div class="health-charts-row">
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title"><span class="panel-icon-txt" style="color:#ff6b6b">💓</span>心率趋势</h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: heartPeriod === p }" @click="heartPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item"><span class="hcm-label">最低</span><span class="hcm-val" style="color:#22c55e">{{ currentHeartStats.min }}</span><span class="hcm-unit">次/分</span></div>
            <div class="hchart-meta-item"><span class="hcm-label">平均</span><span class="hcm-val" style="color:#ff6b6b">{{ currentHeartStats.avg }}</span><span class="hcm-unit">次/分</span></div>
            <div class="hchart-meta-item"><span class="hcm-label">最高</span><span class="hcm-val" style="color:#f59e0b">{{ currentHeartStats.max }}</span><span class="hcm-unit">次/分</span></div>
          </div>
          <div ref="heartChartRef" class="hchart-area"></div>
        </div>
      </div>
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title"><span class="panel-icon-txt" style="color:#60a5fa">🩺</span>血压分布</h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: bpPeriod === p }" @click="bpPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row bp-meta">
            <div class="hchart-meta-item"><span class="hcm-label">收缩压</span><span class="hcm-val" style="color:#ff6b6b">{{ currentBpStats.sys }}</span><span class="hcm-unit">mmHg</span></div>
            <div class="bp-divider">/</div>
            <div class="hchart-meta-item"><span class="hcm-label">舒张压</span><span class="hcm-val" style="color:#60a5fa">{{ currentBpStats.dia }}</span><span class="hcm-unit">mmHg</span></div>
          </div>
          <div ref="bpChartRef" class="hchart-area"></div>
        </div>
      </div>
    </div>

    <!-- 血氧 + 体温 -->
    <div class="health-charts-row">
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title"><span class="panel-icon-txt" style="color:#60a5fa">🫁</span>血氧饱和度</h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: spo2Period === p }" @click="spo2Period = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item"><span class="hcm-label">当前</span><span class="hcm-val" style="color:#60a5fa">{{ currentSpo2Stats.current }}</span><span class="hcm-unit">%</span></div>
            <div class="hchart-meta-item"><span class="hcm-label">最低</span><span class="hcm-val" style="color:#94a3b8">{{ currentSpo2Stats.min }}</span><span class="hcm-unit">%</span></div>
            <div class="hchart-meta-item"><span class="hcm-label">状态</span><span class="hcm-unit" :style="{ color: currentSpo2Stats.current >= 95 ? '#22c55e' : '#f59e0b', fontSize: '16px' }">{{ currentSpo2Stats.current >= 95 ? '正常' : '偏低' }}</span></div>
          </div>
          <div ref="spo2ChartRef" class="hchart-area"></div>
        </div>
      </div>
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title"><span class="panel-icon-txt" style="color:#f97316">🌡</span>体温趋势</h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: tempPeriod === p }" @click="tempPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item"><span class="hcm-label">当前</span><span class="hcm-val" style="color:#f97316">{{ currentTempStats.current }}</span><span class="hcm-unit">°C</span></div>
            <div class="hchart-meta-item"><span class="hcm-label">最低</span><span class="hcm-val" style="color:#22c55e">{{ currentTempStats.min }}</span><span class="hcm-unit">°C</span></div>
            <div class="hchart-meta-item"><span class="hcm-label">最高</span><span class="hcm-val" style="color:#f59e0b">{{ currentTempStats.max }}</span><span class="hcm-unit">°C</span></div>
          </div>
          <div ref="tempChartRef" class="hchart-area"></div>
        </div>
      </div>
    </div>

    <!-- 步数 + 睡眠 -->
    <div class="health-charts-row">
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title"><span class="panel-icon-txt" style="color:#00d4aa">👟</span>步数统计</h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: stepsPeriod === p }" @click="stepsPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="steps-overview-row">
           <div class="steps-header">
            <div class="steps-progress-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" class="steps-ring-bg"/>
                <circle cx="50" cy="50" r="42" class="steps-ring-fill" :stroke-dasharray="`${Math.min(100,(todaySteps/10000)*100)*264/100} 264`"/>
              </svg>
              <div class="steps-ring-inner">
                <div class="steps-ring-pct">{{ Math.round((todaySteps/10000)*100) }}%</div>
                <div class="steps-ring-goal">目标 10000</div>
              </div>
            </div>
            <div class="steps-stats-col">
              <div class="steps-stat-row"><span class="ssr-label">今日步数</span><span class="ssr-val">{{ todaySteps.toLocaleString() + ' steps' }}</span></div>
              <div class="steps-stat-row"><span class="ssr-label">距离目标</span><span class="ssr-val">{{ todaySteps >= 10000 ? '✓ Done' : (10000 - todaySteps).toLocaleString() + ' left' }}</span></div>
              <div class="steps-stat-row"><span class="ssr-label">消耗热量</span><span class="ssr-val">{{ Math.round(todaySteps * 0.04) }} kcal</span></div>
              <div class="steps-stat-row"><span class="ssr-label">行走距离</span><span class="ssr-val">{{ (todaySteps * 0.7 / 1000).toFixed(1) }} km</span></div>
              <div class="steps-stat-row" v-if="stepsPeriod !== '日'"><span class="ssr-label">平均步数</span><span class="ssr-val">{{ currentStepsStats.summary }}</span></div>
            </div>
           </div>
          </div>
          <div ref="stepsChartRef" class="hchart-area steps-chart-area"></div>
        </div>
      </div>

      <!-- 睡眠分析 -->
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title"><span class="panel-icon-txt" style="color:#9B59B6">🌙</span>睡眠分析</h3>
        </div>
        <div class="hchart-body">
          <div class="xmsleep-header">
            <div class="xmsleep-score-ring">
              <svg viewBox="0 0 100 100" class="xmscore-svg">
                <circle cx="50" cy="50" r="42" class="xmscore-track"/>
                <circle cx="50" cy="50" r="42" class="xmscore-fill"
                  :stroke="currentSleepData.score >= 85 ? '#00d4aa' : currentSleepData.score >= 70 ? '#f59e0b' : '#ef4444'"
                  :stroke-dasharray="`${(currentSleepData.score / 100) * 264} 264`"/>
              </svg>
              <div class="xmscore-num"><span class="xmscore-val">{{ currentSleepData.score }}</span><span class="xmscore-label">分</span></div>
            </div>
            <div class="xmsleep-overview">
              <div class="xmsleep-total"><span class="xt-label">睡眠时长</span><span class="xt-val">{{ currentSleepData.total }}<span class="xt-unit">h</span></span></div>
              <div class="xmsleep-stats">
                <div class="xs-stat"><span class="xs-icon">🛏️</span><span class="xs-label">入睡</span><span class="xs-val">23:00</span></div>
                <div class="xs-stat"><span class="xs-icon">☀️</span><span class="xs-label">起床</span><span class="xs-val">06:48</span></div>
                <div class="xs-stat"><span class="xs-icon">😴</span><span class="xs-label">清醒</span><span class="xs-val">{{ currentSleepData.awakeCount }}次</span></div>
              </div>
            </div>
          </div>
          <div class="stl-wrap">
            <div class="stl-ruler">
              <span>23:00</span><span>00:00</span><span>01:00</span><span>02:00</span><span>03:00</span><span>04:00</span><span>05:00</span><span>06:00</span><span class="stl-r-end">06:48</span>
            </div>
            <div class="stl-band">
              <div v-for="seg in sleepBand" :key="seg.id" class="stl-seg"
                :style="{ width: seg.w + '%', background: seg.color }"
                @mouseenter="sleepTooltip = { show: true, x: $event.clientX, y: $event.clientY, seg }"
                @mousemove="sleepTooltip = { ...sleepTooltip, x: $event.clientX, y: $event.clientY }"
                @mouseleave="sleepTooltip.show = false">
                <span class="stl-seg-label" v-if="seg.w > 12">{{ seg.min >= 60 ? Math.floor(seg.min/60) + 'h' + (seg.min%60 > 0 ? (seg.min%60)+'m' : '') : seg.min + 'm' }}</span>
              </div>
            </div>
            <Teleport to="body">
              <div v-if="sleepTooltip.show" class="stl-tooltip" :style="{ left: sleepTooltip.x + 14 + 'px', top: sleepTooltip.y - 10 + 'px' }">
                <div class="stl-tip-dot" :style="{ background: sleepTooltip.seg?.color }"></div>
                <span class="stl-tip-stage">{{ sleepTooltip.seg?.label }}</span>
                <span class="stl-tip-min">{{ sleepTooltip.seg?.min }}m</span>
              </div>
            </Teleport>
            <div class="stl-bottom">
              <div class="stl-metrics">
                <div class="stl-m-item" v-for="m in sleepBandMetrics" :key="m.label">
                  <span class="stl-m-dot" :style="{ background: m.color }"></span>
                  <span class="stl-m-label">{{ m.label }}</span>
                  <span class="stl-m-val">{{ m.val }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <HealthTips :tips="healthTips" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHealthCharts } from '../../composables/useHealthCharts.js'
import HealthHero from '../health/HealthHero.vue'
import HealthMetrics from '../health/HealthMetrics.vue'
import HealthTips from '../health/HealthTips.vue'

const sleepTooltip = ref({ show: false, x: 0, y: 0, seg: null })

const props = defineProps({
  visible: { type: Boolean, required: true },
  healthItems: { type: Array, required: true },
  heartRateData: { type: Array, required: true },
  bpWeekData: { type: Array, required: true },
  spo2Trend: { type: Array, required: true },
  tempTrend: { type: Array, required: true },
  stepsTrend: { type: Array, required: true },
  sleepData: { type: Object, required: true },
  formatMetricValue: { type: Function, required: true },
  getHeartStatus: { type: Function, required: true },
  getBpStatus: { type: Function, required: true },
  getSpo2Status: { type: Function, required: true },
  getTempStatus: { type: Function, required: true },
  getStepsStatus: { type: Function, required: true },
})

defineEmits(['openHealthDetail'])

const {
  periods, heartPeriod, bpPeriod, spo2Period, tempPeriod, stepsPeriod,
  currentHeartStats, currentBpStats, currentSpo2Stats, currentTempStats,
  todaySteps, currentStepsStats,
  heartChartRef, bpChartRef, spo2ChartRef, tempChartRef, stepsChartRef,
} = useHealthCharts(props)

// ===== 睡眠数据 =====
const currentSleepData = computed(() => props.sleepData)

const sleepBand = computed(() => {
  const { deep, light, rem, awakeMin, awakeCount } = currentSleepData.value
  const perWake = awakeCount >= 2 ? Math.round(awakeMin / 2) : awakeMin
  const deep1 = Math.round(deep * 0.30), light1 = Math.round(light * 0.25), rem1 = Math.round(rem * 0.45)
  const light2 = Math.round(light * 0.40), deep2 = Math.round(deep * 0.45), rem2 = Math.round(rem * 0.55)
  const light3 = light - light1 - light2, deep3 = deep - deep1 - deep2
  const rawTotal = awakeMin + deep + light + rem
  const segs = [
    { id: 'wake1', color: '#fbbf24', min: perWake, label: '清醒', w: perWake, isWake: true },
    { id: 'deep1', color: '#6366f1', min: deep1, label: '深睡', w: deep1 },
    { id: 'light1', color: '#818cf8', min: light1, label: '浅睡', w: light1 },
    { id: 'rem1', color: '#a78bfa', min: rem1, label: 'REM', w: rem1 },
    { id: 'light2', color: '#818cf8', min: light2, label: '浅睡', w: light2 },
    { id: 'deep2', color: '#6366f1', min: deep2, label: '深睡', w: deep2 },
  ]
  if (awakeCount >= 2) segs.push({ id: 'wake2', color: '#fbbf24', min: perWake, label: '清醒', w: perWake, isWake: true })
  segs.push(
    { id: 'rem2', color: '#a78bfa', min: rem2, label: 'REM', w: rem2 },
    { id: 'deep3', color: '#6366f1', min: deep3, label: '深睡', w: deep3 },
    { id: 'light3', color: '#818cf8', min: light3, label: '浅睡', w: light3 },
  )
  const toW = (m) => rawTotal > 0 ? Math.max(1.5, m / rawTotal * 100) : 0
  return segs.map(s => ({ ...s, w: toW(s.w) }))
})

const sleepBandMetrics = computed(() => {
  const { deep, light, rem, awakeMin } = currentSleepData.value
  const h = (m) => m >= 60 ? Math.floor(m/60) + 'h' + (m%60 > 0 ? (m%60)+'m' : '') : m + 'm'
  return [
    { label: '深睡', color: '#6366f1', val: h(deep) },
    { label: '浅睡', color: '#818cf8', val: h(light) },
    { label: 'REM', color: '#a78bfa', val: h(rem) },
    { label: '清醒', color: '#fbbf24', val: h(awakeMin) },
  ]
})

// ===== 健康建议 =====
const latestSteps = computed(() => {
  if (!props.stepsTrend?.length) return 0
  return Math.round(props.stepsTrend[props.stepsTrend.length - 1].value)
})
const healthTips = computed(() => [
  { icon: '🏃', title: '运动建议', desc: latestSteps.value < 6000 ? `今日步数 ${latestSteps.value.toLocaleString()}，偏少，建议晚饭后散步 30 分钟` : '今日步数达标，继续保持每天运动习惯', tag: latestSteps.value < 6000 ? '需运动' : '已达标', color: '#00d4aa' },
  { icon: '😴', title: '睡眠建议', desc: currentSleepData.value.score >= 85 ? '近期睡眠质量良好，建议保持 22:30 前入睡' : '睡眠质量偏低，建议睡前减少电子设备使用', tag: currentSleepData.value.score >= 85 ? '状态好' : '需改善', color: '#9B59B6' },
  { icon: '💧', title: '饮水提醒', desc: '今日建议饮水量 2000ml，当前摄入约 1200ml，还需补充 800ml', tag: '提醒', color: '#60a5fa' },
  { icon: '🍎', title: '营养摄入', desc: '今日热量摄入约 1850 kcal，蛋白质摄入偏低，建议增加鸡蛋、鱼肉等高蛋白食物', tag: '注意', color: '#f97316' },
])
</script>

<style scoped>
.health-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.hchart-meta-row { display: flex; gap: 16px; margin-bottom: 10px; }
.bp-meta { gap: 0; align-items: center; }
.hchart-meta-item { text-align: center; flex: 1; }
.hcm-label { display: block; font-size: 10px; color: var(--text-3); margin-bottom: 2px; }
.hcm-val { font-family: var(--font-mono); font-size: 20px; font-weight: 600; }
.hcm-unit { font-size: 11px; margin-left: 2px; font-weight: 400; color: var(--text-3); }
.bp-divider { font-size: 28px; color: var(--text-3); font-weight: 300; margin: 0 8px; }
.hchart-area { width: 100%; height: 160px; }

/* 步数 */
.steps-header { display: flex; gap: 16px; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(155,89,182,0.15); border-radius: 12px; margin-bottom: 14px; width: 100%; }
.steps-overview-row { display: flex; gap: 20px; align-items: center; margin-bottom: 10px; }
.steps-progress-ring { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
.steps-progress-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.steps-ring-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 8; }
.steps-ring-fill { fill: none; stroke: #00d4aa; stroke-width: 8; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50%; transition: stroke-dasharray 0.8s ease; }
.steps-ring-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.steps-ring-pct { font-size: 18px; font-weight: 800; color: #00d4aa; font-family: var(--font-mono); line-height: 1; }
.steps-ring-goal { font-size: 9px; color: var(--text-3); margin-top: 2px; }
.steps-stats-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.steps-stat-row { display: flex; align-items: center; gap: 15px; font-size: 12px; margin-bottom: 4px; }
.ssr-label { font-size: 11px; color: var(--text-2); font-weight: 500; margin: 0; padding: 0; }
.ssr-val { font-size: 12px; font-weight: 600; color: var(--text); font-family: var(--font-mono); margin: 0; padding: 0; }
.steps-chart-area { height: 200px; }

/* 睡眠 */
.xmsleep-header { display: flex; gap: 16px; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(155,89,182,0.15); border-radius: 12px; margin-bottom: 14px; }
.xmsleep-score-ring { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.xmscore-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.xmscore-track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 7; }
.xmscore-fill { fill: none; stroke-width: 7; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50%; transition: stroke-dasharray 0.8s ease; }
.xmscore-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.xmscore-val { font-size: 26px; font-weight: 800; color: var(--text); font-family: var(--font-mono); line-height: 1; }
.xmscore-label { font-size: 11px; color: var(--text-3); font-weight: 500; }
.xmsleep-overview { flex: 1; }
.xmsleep-total { margin-bottom: 8px; }
.xt-label { display: block; font-size: 11px; color: var(--text-3); margin-bottom: 2px; }
.xt-val { font-size: 28px; font-weight: 800; color: var(--text); font-family: var(--font-mono); line-height: 1; }
.xt-unit { font-size: 14px; color: var(--text-2); margin-left: 2px; }
.xmsleep-stats { display: flex; gap: 14px; }
.xs-stat { display: flex; align-items: center; gap: 4px; }
.xs-icon { font-size: 13px; }
.xs-label { font-size: 11px; color: var(--text-3); }
.xs-val { font-size: 13px; font-weight: 700; font-family: var(--font-mono); color: var(--text); }

/* 睡眠时间条 */
.stl-wrap { margin-bottom: 12px; }
.stl-ruler { display: flex; justify-content: space-between; margin-top: 35px; font-size: 10px; color: var(--text-3); font-family: var(--font-mono); margin-bottom: 4px; padding: 0 2px; }
.stl-r-end { text-align: right; }
.stl-band { display: flex; height: 80px; gap: 1px; border-radius: 6px; overflow: hidden; margin-top: 15px; }
.stl-seg { height: 100%; display: flex; align-items: center; justify-content: center; transition: filter 0.2s; overflow: hidden; position: relative; min-width: 2px; }
.stl-seg:hover { filter: brightness(1.2); }
.stl-seg-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.9); font-family: var(--font-mono); text-shadow: 0 1px 4px rgba(0,0,0,0.6); white-space: nowrap; line-height: 1; }
.stl-tooltip { position: fixed; z-index: 9999; pointer-events: none; display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); backdrop-filter: blur(8px); font-size: 12px; color: #fff; }
.stl-tip-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.stl-tip-stage { font-weight: 600; color: rgba(255,255,255,0.8); }
.stl-tip-min { font-family: var(--font-mono); font-weight: 700; }
.stl-bottom { display: flex; align-items: center; margin-top: 30px; }
.stl-metrics { display: flex; gap: 16px; flex-wrap: wrap; }
.stl-m-item { display: flex; align-items: center; gap: 5px; font-size: 11px; }
.stl-m-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.stl-m-label { color: var(--text-2); }
.stl-m-val { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text); }

/* 通用面板 */
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.panel-title { font-size: 14px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 6px; }
.panel-icon-txt { font-size: 16px; }
.period-tabs { display: flex; gap: 4px; }
.ptab { padding: 3px 10px; font-size: 11px; font-weight: 600; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--text-3); border-radius: 20px; cursor: pointer; transition: all 0.2s; }
.ptab:hover { color: var(--text-2); border-color: rgba(255,255,255,0.2); }
.ptab.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); color: #818cf8; }

/* 响应式 */
@media (max-width: 1100px) { .health-charts-row { grid-template-columns: 1fr; } }
</style>
