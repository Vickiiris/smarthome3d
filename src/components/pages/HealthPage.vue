<template>
  <div v-show="visible" class="page health-page">

    <!-- ========== 人物卡片 ========== -->
    <div class="health-hero">
      <div class="health-hero-inner">
        <div class="health-avatar-wrap">
          <div class="health-avatar">李</div>
          <div class="health-avatar-glow"></div>
        </div>
        <div class="health-hero-info">
          <div class="health-hero-name">李小溪 <span class="health-hero-age">29岁 · 女</span></div>
          <div class="health-hero-badges">
            <span class="hbadge hbadge-ok">健康良好</span>
            <span class="hbadge">绑定设备 3 台</span>
            <span class="hbadge hbadge-time"><span class="live-dot-sm"></span>实时监测</span>
          </div>
          <div class="health-hero-detail-row">
            <span class="hhdr-item"><span class="hhdr-dot" style="background:#ff6b6b"></span>心率 72次/分</span>
            <span class="hhdr-item"><span class="hhdr-dot" style="background:#60a5fa"></span>血氧 98%</span>
            <span class="hhdr-item"><span class="hhdr-dot" style="background:#f97316"></span>体温 36.6°C</span>
          </div>
        </div>
        <div class="health-score-ring">
          <div class="hsr-svg-wrap">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" class="hsr-bg"/>
              <circle cx="60" cy="60" r="52" class="hsr-fill"
                :stroke-dasharray="`${(92/100)*327} 327`"/>
            </svg>
            <div class="hsr-inner">
              <div class="hsr-val">92</div>
              <div class="hsr-label">健康分</div>
            </div>
          </div>
          <div class="hsr-sub">本周稳定 ↑</div>
        </div>
      </div>
    </div>

    <!-- ========== 核心指标网格 ========== -->
    <div class="health-metrics-grid">
      <div v-for="item in healthItems" :key="item.label" class="hmetric-card"
        :style="{ '--hc': item.color }"
        @click="$emit('openHealthDetail', item)"
      >
        <div class="hmetric-top">
          <span class="hmetric-icon">{{ item.icon }}</span>
          <span class="hmetric-label">{{ item.label }}</span>
          <span class="hmetric-badge" :class="getMetricStatus(item)">{{ getMetricStatusText(item) }}</span>
        </div>
        <div class="hmetric-value" v-html="formatMetricValue(item.value)"></div>
        <div class="hmetric-bar-wrap">
          <div class="hmetric-bar" :style="{ width: item.pct + '%' }"></div>
        </div>
        <div class="hmetric-footer">
          <span class="hmetric-range" v-html="formatMetricValue(item.range)"></span>
          <span class="hmetric-trend" :class="item.trend >= 0 ? 'up' : 'dn'">
            {{ item.trend >= 0 ? '↑' : '↓' }}{{ Math.abs(item.trend) }}
          </span>
        </div>
      </div>
    </div>

    <!-- ========== 心率 + 血压 ========== -->
    <div class="health-charts-row">
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-txt" style="color:#ff6b6b">💓</span>
            心率趋势
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: heartPeriod === p }" @click="heartPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item">
              <span class="hcm-label">最低</span>
              <span class="hcm-val" style="color:#22c55e">{{ currentHeartStats.min }}</span>
              <span class="hcm-unit">次/分</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">平均</span>
              <span class="hcm-val" style="color:#ff6b6b">{{ currentHeartStats.avg }}</span>
              <span class="hcm-unit">次/分</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">最高</span>
              <span class="hcm-val" style="color:#f59e0b">{{ currentHeartStats.max }}</span>
              <span class="hcm-unit">次/分</span>
            </div>
          </div>
          <div ref="heartChartRef" class="hchart-area"></div>
        </div>
      </div>

      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-txt" style="color:#60a5fa">🩺</span>
            血压分布
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: bpPeriod === p }" @click="bpPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row bp-meta">
            <div class="hchart-meta-item">
              <span class="hcm-label">收缩压</span>
              <span class="hcm-val" style="color:#ff6b6b">{{ currentBpStats.sys }}</span>
              <span class="hcm-unit">mmHg</span>
            </div>
            <div class="bp-divider">/</div>
            <div class="hchart-meta-item">
              <span class="hcm-label">舒张压</span>
              <span class="hcm-val" style="color:#60a5fa">{{ currentBpStats.dia }}</span>
              <span class="hcm-unit">mmHg</span>
            </div>
          </div>
          <div ref="bpChartRef" class="hchart-area"></div>
        </div>
      </div>
    </div>

    <!-- ========== 血氧 + 体温 ========== -->
    <div class="health-charts-row">
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-txt" style="color:#60a5fa">🫁</span>
            血氧饱和度
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: spo2Period === p }" @click="spo2Period = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item">
              <span class="hcm-label">当前</span>
              <span class="hcm-val" style="color:#60a5fa">{{ currentSpo2Stats.current }}</span>
              <span class="hcm-unit">%</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">最低</span>
              <span class="hcm-val" style="color:#94a3b8">{{ currentSpo2Stats.min }}</span>
              <span class="hcm-unit">%</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">状态</span>
              <span class="hcm-val" :style="{ color: currentSpo2Stats.current >= 95 ? '#22c55e' : '#f59e0b' }">{{ currentSpo2Stats.current >= 95 ? '正常' : '偏低' }}</span>
            </div>
          </div>
          <div ref="spo2ChartRef" class="hchart-area"></div>
        </div>
      </div>

      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-txt" style="color:#f97316">🌡</span>
            体温趋势
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: tempPeriod === p }" @click="tempPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item">
              <span class="hcm-label">当前</span>
              <span class="hcm-val" style="color:#f97316">{{ currentTempStats.current }}</span>
              <span class="hcm-unit">°C</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">最低</span>
              <span class="hcm-val" style="color:#22c55e">{{ currentTempStats.min }}</span>
              <span class="hcm-unit">°C</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">最高</span>
              <span class="hcm-val" style="color:#f59e0b">{{ currentTempStats.max }}</span>
              <span class="hcm-unit">°C</span>
            </div>
          </div>
          <div ref="tempChartRef" class="hchart-area"></div>
        </div>
      </div>
    </div>

    <!-- ========== 步数 + 睡眠 ========== -->
    <div class="health-charts-row">
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-txt" style="color:#00d4aa">👟</span>
            步数统计
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: stepsPeriod === p }" @click="stepsPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <div class="steps-overview-row">
            <div class="steps-progress-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" class="steps-ring-bg"/>
                <circle cx="50" cy="50" r="42" class="steps-ring-fill"
                  :stroke-dasharray="`${Math.min(100,(todaySteps/10000)*100)*264/100} 264`"/>
              </svg>
              <div class="steps-ring-inner">
                <div class="steps-ring-pct">{{ Math.round((todaySteps/10000)*100) }}%</div>
                <div class="steps-ring-goal">目标 10000</div>
              </div>
            </div>
            <div class="steps-stats-col">
              <div class="steps-stat-row">
                <span class="ssr-label">今日步数</span>
                <span class="ssr-val">{{ todaySteps.toLocaleString() }}</span>
              </div>
              <div class="steps-stat-row">
                <span class="ssr-label">距目标</span>
                <span class="ssr-val" :style="{ color: todaySteps >= 10000 ? '#00d4aa' : '#f59e0b' }">
                  {{ todaySteps >= 10000 ? '已达标 ✓' : (10000 - todaySteps).toLocaleString() + ' 步' }}
                </span>
              </div>
              <div class="steps-stat-row">
                <span class="ssr-label">消耗热量</span>
                <span class="ssr-val">{{ Math.round(todaySteps * 0.04) }} kcal</span>
              </div>
              <div class="steps-stat-row">
                <span class="ssr-label">行走距离</span>
                <span class="ssr-val">{{ (todaySteps * 0.7 / 1000).toFixed(1) }} km</span>
              </div>
              <div class="steps-stat-row">
                <span class="ssr-label">{{ stepsPeriod === '日' ? '本周合计' : stepsPeriod === '周' ? '本周日均' : '本月日均' }}</span>
                <span class="ssr-val">{{ currentStepsStats.summary }}</span>
              </div>
            </div>
          </div>
          <div ref="stepsChartRef" class="hchart-area steps-chart-area"></div>
        </div>
      </div>

      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-txt" style="color:#9B59B6">🌙</span>
            睡眠分析
          </h3>
          <span class="panel-time">昨夜</span>
        </div>
        <div class="hchart-body">
          <!-- 小米健康风格：顶部睡眠评分 + 总时长 -->
          <div class="xmsleep-header">
            <div class="xmsleep-score-ring">
              <svg viewBox="0 0 100 100" class="xmscore-svg">
                <circle cx="50" cy="50" r="42" class="xmscore-track"/>
                <circle cx="50" cy="50" r="42" class="xmscore-fill"
                  :stroke="sleepData.score >= 85 ? '#00d4aa' : sleepData.score >= 70 ? '#f59e0b' : '#ef4444'"
                  :stroke-dasharray="`${sleepData.score * 2.64} 264`"
                />
              </svg>
              <div class="xmscore-num">
                <span class="xmscore-val">{{ sleepData.score }}</span>
                <span class="xmscore-label">分</span>
              </div>
            </div>
            <div class="xmsleep-overview">
              <div class="xmsleep-total">
                <span class="xt-label">睡眠时长</span>
                <span class="xt-val">{{ sleepData.total }}<span class="xt-unit">h</span></span>
              </div>
              <div class="xmsleep-stats">
                <div class="xs-stat">
                  <span class="xs-icon">🛏️</span>
                  <span class="xs-label">入睡</span>
                  <span class="xs-val">23:00</span>
                </div>
                <div class="xs-stat">
                  <span class="xs-icon">☀️</span>
                  <span class="xs-label">起床</span>
                  <span class="xs-val">06:48</span>
                </div>
                <div class="xs-stat">
                  <span class="xs-icon">😴</span>
                  <span class="xs-label">清醒</span>
                  <span class="xs-val">{{ sleepData.awakeCount }}次</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 小米睡眠时段柱状图：纵向各时段 -->
          <div class="xmsleep-timeline">
            <div class="sleep-bars-header">
              <div class="sb-bar-spacer"></div>
              <div class="sb-y-label">60'</div>
              <div class="sb-y-label">30'</div>
              <div class="sb-y-label">0'</div>
            </div>
            <div class="sleep-bars-row">
              <span class="sb-hour-label">23:00</span>
              <div class="sb-stacked-bar" title="23:00 睡眠结构">
                <div class="sb-seg" style="height:8%;background:#fbbf24" title="清醒 3min"></div>
                <div class="sb-seg" style="height:40%;background:#a78bfa" title="浅睡 12min"></div>
                <div class="sb-seg" style="height:30%;background:#7c3aed" title="深睡 9min"></div>
                <div class="sb-seg" style="height:22%;background:#60a5fa" title="REM 7min"></div>
              </div>
              <span class="sb-hour-label">00:00</span>
              <div class="sb-stacked-bar">
                <div class="sb-seg" style="height:5%;background:#a78bfa" title="浅睡 3min"></div>
                <div class="sb-seg" style="height:55%;background:#7c3aed" title="深睡 33min"></div>
                <div class="sb-seg" style="height:40%;background:#a78bfa" title="浅睡 24min"></div>
              </div>
              <span class="sb-hour-label">01:00</span>
              <div class="sb-stacked-bar">
                <div class="sb-seg" style="height:15%;background:#60a5fa" title="REM 9min"></div>
                <div class="sb-seg" style="height:55%;background:#a78bfa" title="浅睡 33min"></div>
                <div class="sb-seg" style="height:30%;background:#7c3aed" title="深睡 18min"></div>
              </div>
              <span class="sb-hour-label">02:00</span>
              <div class="sb-stacked-bar">
                <div class="sb-seg" style="height:5%;background:#fbbf24" title="清醒 3min"></div>
                <div class="sb-seg" style="height:60%;background:#7c3aed" title="深睡 36min"></div>
                <div class="sb-seg" style="height:35%;background:#a78bfa" title="浅睡 21min"></div>
              </div>
              <span class="sb-hour-label">03:00</span>
              <div class="sb-stacked-bar">
                <div class="sb-seg" style="height:10%;background:#60a5fa" title="REM 6min"></div>
                <div class="sb-seg" style="height:45%;background:#a78bfa" title="浅睡 27min"></div>
                <div class="sb-seg" style="height:45%;background:#7c3aed" title="深睡 27min"></div>
              </div>
              <span class="sb-hour-label">04:00</span>
              <div class="sb-stacked-bar">
                <div class="sb-seg" style="height:50%;background:#a78bfa" title="浅睡 30min"></div>
                <div class="sb-seg" style="height:50%;background:#7c3aed" title="深睡 30min"></div>
              </div>
              <span class="sb-hour-label">05:00</span>
              <div class="sb-stacked-bar">
                <div class="sb-seg" style="height:10%;background:#fbbf24" title="清醒 6min"></div>
                <div class="sb-seg" style="height:35%;background:#60a5fa" title="REM 21min"></div>
                <div class="sb-seg" style="height:55%;background:#a78bfa" title="浅睡 33min"></div>
              </div>
              <span class="sb-hour-label">06:00</span>
              <div class="sb-stacked-bar">
                <div class="sb-seg" style="height:8%;background:#a78bfa" title="浅睡 5min"></div>
                <div class="sb-seg" style="height:30%;background:#60a5fa" title="REM 18min"></div>
                <div class="sb-seg" style="height:25%;background:#fbbf24" title="清醒 15min(早醒)"></div>
                <div class="sb-seg" style="height:37%;background:#a78bfa" title="浅睡 22min"></div>
              </div>
            </div>
            <div class="xtl-legend">
              <div class="xl-item" v-for="s in sleepStages" :key="s.name">
                <span class="xl-dot" :style="{ background: s.color }"></span>
                <span class="xl-name">{{ s.name }}</span>
                <span class="xl-val">{{ s.h }}h</span>
                <span class="xl-pct">{{ s.pct }}%</span>
              </div>
            </div>
          </div>
          <!-- 小米风格睡眠指标网格 -->
          <div class="xmsleep-metrics">
            <div class="xm-metric-card" v-for="m in sleepMetrics" :key="m.label">
              <div class="xmm-top">
                <span class="xmm-icon">{{ m.icon }}</span>
                <span class="xmm-label">{{ m.label }}</span>
              </div>
              <div class="xmm-val" :style="{ color: m.color }">{{ m.value }}</div>
              <div class="xmm-bar">
                <div class="xmm-fill" :style="{ width: m.pct + '%', background: m.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 健康建议 ========== -->
    <div class="panel-card">
      <div class="panel-header">
        <h3 class="panel-title">
          <span class="panel-icon-txt" style="color:#f59e0b">💡</span>
          健康建议
        </h3>
      </div>
      <div class="health-tips-grid">
        <div class="htip-card" v-for="tip in healthTips" :key="tip.title">
          <div class="htip-icon">{{ tip.icon }}</div>
          <div class="htip-body">
            <div class="htip-title">{{ tip.title }}</div>
            <div class="htip-desc">{{ tip.desc }}</div>
          </div>
          <div class="htip-tag" :style="{ background: tip.color + '22', color: tip.color }">{{ tip.tag }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

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

// ===== 按当前时段过滤趋势数据 =====
const currentHour = () => new Date().getHours()

const filteredHeartRate = computed(() => {
  const h = currentHour()
  return props.heartRateData.slice(0, h + 1)
})
const filteredSpo2 = computed(() => {
  const h = currentHour()
  return props.spo2Trend.slice(0, h + 1)
})
const filteredTemp = computed(() => {
  const h = currentHour()
  return props.tempTrend.slice(0, h + 1)
})

// ===== 日周月周期状态 =====
const periods = ['日', '周', '月']
const heartPeriod = ref('日')
const bpPeriod = ref('周')
const spo2Period = ref('日')
const tempPeriod = ref('日')
const stepsPeriod = ref('日')

// ===== 各指标日周月统计数据 =====
const currentHeartStats = computed(() => {
  if (heartPeriod.value === '日') {
    const d = filteredHeartRate.value
    return {
      avg: d.length ? Math.round(d.reduce((s, v) => s + v.value, 0) / d.length) : 72,
      min: d.length ? Math.min(...d.map(v => v.value)) : 58,
      max: d.length ? Math.max(...d.map(v => v.value)) : 88,
    }
  }
  if (heartPeriod.value === '周') {
    // 模拟周数据：每天一条代表值（取各天平均值）
    const days = [62, 65, 70, 68, 72, 69, 74]
    return { avg: 68, min: 55, max: 88 }
  }
  // 月
  return { avg: 70, min: 52, max: 92 }
})

const currentBpStats = computed(() => {
  if (bpPeriod.value === '周') {
    const w = props.bpWeekData
    return {
      sys: w.length ? Math.round(w.reduce((s, v) => s + v.sys, 0) / w.length) : 118,
      dia: w.length ? Math.round(w.reduce((s, v) => s + v.dia, 0) / w.length) : 76,
    }
  }
  if (bpPeriod.value === '日') return { sys: 118, dia: 76 }
  return { sys: 120, dia: 77 }
})

const currentSpo2Stats = computed(() => {
  const d = filteredSpo2.value
  const cur = d.length ? d[d.length - 1].value : 98
  const mn = d.length ? Math.min(...d.map(v => v.value)) : 96
  return { current: cur, min: mn }
})

const currentTempStats = computed(() => {
  const d = filteredTemp.value
  return {
    current: d.length ? parseFloat(d[d.length - 1].value.toFixed(1)) : 36.5,
    min: d.length ? parseFloat(Math.min(...d.map(v => v.value)).toFixed(1)) : 36.1,
    max: d.length ? parseFloat(Math.max(...d.map(v => v.value)).toFixed(1)) : 36.8,
  }
})

// 今日步数 = stepsTrend 最后一天
const todaySteps = computed(() => {
  if (!props.stepsTrend || props.stepsTrend.length === 0) return 0
  return Math.round(props.stepsTrend[props.stepsTrend.length - 1].value)
})
const currentStepsStats = computed(() => {
  const arr = props.stepsTrend || []
  if (stepsPeriod.value === '日') {
    return { summary: (arr.reduce((s, v) => s + v.value, 0) / 10000).toFixed(1) + '万步' }
  }
  if (stepsPeriod.value === '周') {
    const avg = arr.length ? Math.round(arr.reduce((s, v) => s + v.value, 0) / arr.length) : 0
    return { summary: avg.toLocaleString() + ' 步/天' }
  }
  // 月：模拟 30 天日均
  return { summary: '8,234 步/天' }
})

// Chart refs
const heartChartRef = ref(null)
const bpChartRef = ref(null)
const spo2ChartRef = ref(null)
const tempChartRef = ref(null)
const stepsChartRef = ref(null)
const sleepChartRef = ref(null)

let ec = null
let heartChart = null
let bpChart = null
let spo2Chart = null
let tempChart = null
let stepsChart = null
let sleepChart = null

// ============ 计算属性 ============
const latestSpo2 = computed(() => {
  const item = props.healthItems.find(i => i.label === '血氧')
  return item ? item.raw : 98
})
const latestTemp = computed(() => {
  const item = props.healthItems.find(i => i.label === '体温')
  return item ? item.raw : 36.5
})
const latestBp = computed(() => {
  const item = props.healthItems.find(i => i.label === '血压')
  if (!item) return { sys: 118, dia: 76 }
  const parts = item.value.split('/')
  return { sys: parseInt(parts[0]), dia: parseInt(parts[1]) }
})
const latestSteps = computed(() => {
  if (!props.stepsTrend || props.stepsTrend.length === 0) return 0
  return Math.round(props.stepsTrend[props.stepsTrend.length - 1].value)
})
const weekTotal = computed(() => props.stepsTrend.reduce((s, v) => s + v.value, 0))
const avgHeartRate = computed(() => {
  if (!filteredHeartRate.value.length) return 72
  return Math.round(filteredHeartRate.value.reduce((s, v) => s + v.value, 0) / filteredHeartRate.value.length)
})
const minHeartRate = computed(() => filteredHeartRate.value.length ? Math.min(...filteredHeartRate.value.map(v => v.value)) : 58)
const maxHeartRate = computed(() => filteredHeartRate.value.length ? Math.max(...filteredHeartRate.value.map(v => v.value)) : 88)
const minSpo2 = computed(() => filteredSpo2.value.length ? Math.min(...filteredSpo2.value.map(v => v.value)) : 96)
const minTemp = computed(() => filteredTemp.value.length ? Math.min(...filteredTemp.value.map(v => v.value)) : 36.0)
const maxTemp = computed(() => filteredTemp.value.length ? Math.max(...filteredTemp.value.map(v => v.value)) : 36.8)

const sleepStages = computed(() => {
  const { deep, light, rem, awakeMin } = props.sleepData
  const total = deep + light + rem + awakeMin
  return [
    { name: '深睡', h: (deep / 60).toFixed(1), pct: Math.round(deep / total * 100), color: '#7c3aed' },
    { name: '浅睡', h: (light / 60).toFixed(1), pct: Math.round(light / total * 100), color: '#a78bfa' },
    { name: 'REM', h: (rem / 60).toFixed(1), pct: Math.round(rem / total * 100), color: '#60a5fa' },
    { name: '清醒', h: (awakeMin / 60).toFixed(1), pct: Math.round(awakeMin / total * 100), color: '#fbbf24' },
  ]
})

// 睡眠时间轴：按真实睡眠结构排列的夜间时段
const sleepTimeline = computed(() => {
  const { deep, light, rem, awakeMin, awakeCount } = props.sleepData
  // 典型睡眠结构：入睡→N2(浅睡)→N3(深睡)→N2→REM→N2→N3→N2→REM→清醒
  // 每段大约占总睡眠时间的比例
  const segs = [
    { name: '清醒',   duration: Math.round(awakeMin * 0.2), color: '#fbbf24' }, // 入睡困难
    { name: '浅睡',   duration: Math.round(light * 0.25),   color: '#a78bfa' }, // 入睡期
    { name: '深睡',   duration: Math.round(deep * 0.4),      color: '#7c3aed' }, // 核心深睡
    { name: '浅睡',   duration: Math.round(light * 0.25),   color: '#a78bfa' }, // 中间过渡
    { name: 'REM',    duration: Math.round(rem * 0.5),      color: '#60a5fa' }, // 第一段REM
    { name: '浅睡',   duration: Math.round(light * 0.3),    color: '#a78bfa' }, // 周期间浅睡
    { name: '深睡',   duration: Math.round(deep * 0.6),      color: '#7c3aed' }, // 后半夜深睡更长
    { name: '浅睡',   duration: Math.round(light * 0.2),    color: '#a78bfa' },
    { name: 'REM',    duration: Math.round(rem * 0.5),      color: '#60a5fa' }, // 后段REM
    { name: '清醒',   duration: Math.round(awakeMin * 0.8), color: '#fbbf24' }, // 早醒
  ]
  const totalMin = deep + light + rem + awakeMin
  return {
    start: '23:00',
    end: '06:48',
    segments: segs.map(s => ({
      ...s,
      pct: totalMin > 0 ? Math.max(1.5, (s.duration / totalMin) * 100) : 0
    }))
  }
})

// 睡眠分析指标（小米健康风格：时长+状态）
const sleepMetrics = computed(() => {
  const { deep, light, rem, awakeMin, awakeCount } = props.sleepData
  const total = deep + light + rem + awakeMin
  const deepPct = total > 0 ? Math.round(deep / total * 100) : 0
  const remPct = total > 0 ? Math.round(rem / total * 100) : 0
  return [
    { icon: '💤', label: '深睡时长', value: (deep / 60).toFixed(1) + 'h', color: '#7c3aed' },
    { icon: '🌙', label: '浅睡时长', value: (light / 60).toFixed(1) + 'h', color: '#a78bfa' },
    { icon: '🧠', label: 'REM时长', value: (rem / 60).toFixed(1) + 'h', color: '#60a5fa' },
    { icon: '⏱️', label: '清醒次数', value: awakeCount + '次', color: '#fbbf24' },
  ]
})

function getMetricStatus(item) {
  if (item.label === '心率') { const s = props.getHeartStatus(item.raw); return s.class }
  if (item.label === '血压') { const parts = item.value.split('/'); const s = props.getBpStatus(parseInt(parts[0]), parseInt(parts[1])); return s.class }
  if (item.label === '血氧') { const s = props.getSpo2Status(item.raw); return s.class }
  if (item.label === '体温') { const s = props.getTempStatus(item.raw); return s.class }
  if (item.label === '步数') { const s = props.getStepsStatus(item.raw); return s.class }
  return 'normal'
}
function getMetricStatusText(item) {
  if (item.label === '心率') return props.getHeartStatus(item.raw).text
  if (item.label === '血压') { const parts = item.value.split('/'); return props.getBpStatus(parseInt(parts[0]), parseInt(parts[1])).text }
  if (item.label === '血氧') return props.getSpo2Status(item.raw).text
  if (item.label === '体温') return props.getTempStatus(item.raw).text
  if (item.label === '步数') return props.getStepsStatus(item.raw).text
  return '正常'
}

const healthTips = computed(() => [
  {
    icon: '🏃', title: '运动建议',
    desc: latestSteps.value < 6000 ? `今日步数 ${latestSteps.value.toLocaleString()}，偏少，建议晚饭后散步 30 分钟` : '今日步数达标，继续保持每天运动习惯',
    tag: latestSteps.value < 6000 ? '需运动' : '已达标', color: '#00d4aa'
  },
  {
    icon: '😴', title: '睡眠建议',
    desc: props.sleepData.score >= 85 ? '近期睡眠质量良好，建议保持 22:30 前入睡' : '睡眠质量偏低，建议睡前减少电子设备使用',
    tag: props.sleepData.score >= 85 ? '状态好' : '需改善', color: '#9B59B6'
  },
  {
    icon: '💧', title: '饮水提醒',
    desc: '今日建议饮水量 2000ml，当前摄入约 1200ml，还需补充 800ml',
    tag: '提醒', color: '#60a5fa'
  },
  {
    icon: '🍎', title: '营养摄入',
    desc: '今日热量摄入约 1850 kcal，蛋白质摄入偏低，建议增加鸡蛋、鱼肉等高蛋白食物',
    tag: '注意', color: '#f97316'
  },
])

// ============ 图表初始化 ============
const chartBg = 'transparent'
const tooltipCfg = {
  trigger: 'axis',
  backgroundColor: 'rgba(5,13,24,0.97)',
  borderColor: 'rgba(255,255,255,0.12)',
  textStyle: { color: '#e2e8f0', fontSize: 12 },
  axisPointer: { type: 'cross', crossStyle: { color: 'rgba(255,255,255,0.1)' } }
}
const axisStyle = {
  axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
  axisTick: { show: false },
  axisLabel: { color: '#94a3b8', fontSize: 11 }
}
const gridBase = { left: '3%', right: '4%', top: '8%', bottom: '8%', containLabel: true }

// 获取各周期图表数据
function getChartData(period, type) {
  if (type === 'heart') {
    if (period === '日') return { data: filteredHeartRate.value, xKey: 'time', yKey: 'value' }
    if (period === '周') return {
      data: [
        { time: '周一', value: 68 }, { time: '周二', value: 72 }, { time: '周三', value: 65 },
        { time: '周四', value: 70 }, { time: '周五', value: 73 }, { time: '周六', value: 69 },
        { time: '周日', value: 71 }
      ],
      xKey: 'time', yKey: 'value'
    }
    return {
      data: Array.from({ length: 30 }, (_, i) => ({ time: i + 1 + '日', value: 62 + Math.round(Math.random() * 12) })),
      xKey: 'time', yKey: 'value'
    }
  }
  if (type === 'spo2') {
    if (period === '日') return { data: filteredSpo2.value, xKey: 'time', yKey: 'value' }
    if (period === '周') return {
      data: Array.from({ length: 7 }, (_, i) => ({ time: ['一','二','三','四','五','六','日'][i], value: 96 + Math.round(Math.random() * 3) })),
      xKey: 'time', yKey: 'value'
    }
    return {
      data: Array.from({ length: 30 }, (_, i) => ({ time: i + 1 + '日', value: 95 + Math.round(Math.random() * 4) })),
      xKey: 'time', yKey: 'value'
    }
  }
  if (type === 'temp') {
    if (period === '日') return { data: filteredTemp.value, xKey: 'time', yKey: 'value' }
    if (period === '周') return {
      data: ['一','二','三','四','五','六','日'].map((d, i) => ({ time: d, value: (36.2 + Math.random() * 0.5).toFixed(1) })),
      xKey: 'time', yKey: 'value'
    }
    return {
      data: Array.from({ length: 30 }, (_, i) => ({ time: i + 1 + '日', value: (36.1 + Math.random() * 0.6).toFixed(1) })),
      xKey: 'time', yKey: 'value'
    }
  }
  return { data: [], xKey: 'time', yKey: 'value' }
}

function updateHeartChart() {
  if (!heartChart) return
  const { data, xKey, yKey } = getChartData(heartPeriod.value, 'heart')
  heartChart.setOption({ xAxis: { data: data.map(v => v[xKey]) }, series: [{ data: data.map(v => v[yKey]) }] })
}
function updateSpo2Chart() {
  if (!spo2Chart) return
  const { data, xKey, yKey } = getChartData(spo2Period.value, 'spo2')
  spo2Chart.setOption({ xAxis: { data: data.map(v => v[xKey]) }, series: [{ data: data.map(v => v[yKey]) }] })
}
function updateTempChart() {
  if (!tempChart) return
  const { data, xKey, yKey } = getChartData(tempPeriod.value, 'temp')
  tempChart.setOption({ xAxis: { data: data.map(v => v[xKey]) }, series: [{ data: data.map(v => v[yKey]) }] })
}

function updateBpChart() {
  if (!bpChart) return
  const d = getBpChartData(bpPeriod.value)
  bpChart.setOption({
    xAxis: { data: d.labels },
    series: [
      { data: d.sysData },
      { data: d.diaData }
    ]
  })
}

function updateStepsChart() {
  if (!stepsChart) return
  const period = stepsPeriod.value
  if (period === '日') {
    // 显示7天数据，今天高亮
    stepsChart.setOption({
      xAxis: { data: props.stepsTrend.map(v => v.day) },
      series: [{ data: props.stepsTrend.map(v => v.value) }]
    })
  } else if (period === '周') {
    stepsChart.setOption({
      xAxis: { data: props.stepsTrend.map(v => v.day) },
      series: [{ data: props.stepsTrend.map(v => v.value) }]
    })
  } else {
    // 月：补满30天
    const full = [...props.stepsTrend]
    while (full.length < 30) full.push({ day: '·', value: 0 })
    stepsChart.setOption({
      xAxis: { data: full.map((v, i) => i + 1 + '日') },
      series: [{ data: full.map(v => v.value || (5000 + Math.round(Math.random() * 5000))) }]
    })
  }
}

function initHeartChart() {
  if (!heartChartRef.value) return
  heartChart = ec.init(heartChartRef.value)
  const { data, xKey, yKey } = getChartData(heartPeriod.value, 'heart')
  const times = data.map(v => v[xKey])
  const vals = data.map(v => v[yKey])
  heartChart.setOption({
    backgroundColor: chartBg,
    tooltip: { ...tooltipCfg },
    grid: { ...gridBase },
    xAxis: {
      type: 'category', data: times,
      boundaryGap: false,
      ...axisStyle,
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value', min: 50, max: 110,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      ...axisStyle
    },
    series: [{
      data: vals,
      type: 'line', smooth: 0.4,
      lineStyle: { color: '#ff6b6b', width: 2.5 },
      areaStyle: {
        color: new ec.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,107,107,0.3)' },
          { offset: 1, color: 'rgba(255,107,107,0)' }
        ])
      },
      symbol: 'circle', symbolSize: 5,
      itemStyle: { color: '#ff6b6b' },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: 'rgba(255,107,107,0.4)', type: 'dashed', width: 1 },
        data: [{ yAxis: 100, label: { formatter: '上限 100', color: 'rgba(255,107,107,0.6)', fontSize: 10 } }]
      }
    }]
  })
}

function getBpChartData(period) {
  if (period === '日') {
    return {
      labels: ['收缩压', '舒张压'],
      sysData: [118],
      diaData: [76],
    }
  }
  if (period === '周') {
    const days = ['一', '二', '三', '四', '五', '六', '日']
    return {
      labels: days.map(d => '周' + d),
      sysData: props.bpWeekData.map(v => v.sys),
      diaData: props.bpWeekData.map(v => v.dia),
    }
  }
  // 月
  return {
    labels: Array.from({ length: 30 }, (_, i) => i + 1 + '日'),
    sysData: Array.from({ length: 30 }, () => 112 + Math.round(Math.random() * 14)),
    diaData: Array.from({ length: 30 }, () => 72 + Math.round(Math.random() * 12)),
  }
}

function initBpChart() {
  if (!bpChartRef.value) return
  bpChart = ec.init(bpChartRef.value)
  const d = getBpChartData(bpPeriod.value)
  bpChart.setOption({
    backgroundColor: chartBg,
    tooltip: {
      ...tooltipCfg,
      formatter: (p) => {
        const d = getBpChartData(bpPeriod.value)
        return `${d.labels[p.axisIndex]}<br/><span style="color:#ff6b6b">收缩压 ${d.sysData[p.axisIndex]} mmHg</span><br/><span style="color:#60a5fa">舒张压 ${d.diaData[p.axisIndex]} mmHg</span>`
      }
    },
    grid: { ...gridBase },
    legend: {
      data: ['收缩压', '舒张压'],
      top: 0, right: 10,
      textStyle: { color: '#94a3b8', fontSize: 11 },
      itemWidth: 12, itemHeight: 8
    },
    xAxis: { type: 'category', data: d.labels, ...axisStyle },
    yAxis: { type: 'value', min: 60, max: 160, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisStyle },
    series: [
      {
        name: '收缩压', data: d.sysData, type: 'bar', barWidth: '35%',
        itemStyle: {
          color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ff6b6b' }, { offset: 1, color: 'rgba(255,107,107,0.3)' }]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '舒张压', data: d.diaData, type: 'bar', barWidth: '35%',
        itemStyle: {
          color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: 'rgba(96,165,250,0.3)' }]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  })
}

function initSpo2Chart() {
  if (!spo2ChartRef.value) return
  spo2Chart = ec.init(spo2ChartRef.value)
  const { data, xKey, yKey } = getChartData(spo2Period.value, 'spo2')
  const times = data.map(v => v[xKey])
  const vals = data.map(v => v[yKey])
  spo2Chart.setOption({
    backgroundColor: chartBg,
    tooltip: { ...tooltipCfg },
    grid: { ...gridBase },
    xAxis: { type: 'category', data: times, boundaryGap: false, ...axisStyle, splitLine: { show: false } },
    yAxis: { type: 'value', min: 90, max: 100, splitNumber: 4, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisStyle },
    series: [{
      data: vals, type: 'line', smooth: 0.5,
      lineStyle: { color: '#60a5fa', width: 2.5 },
      areaStyle: {
        color: new ec.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(96,165,250,0.3)' },
          { offset: 1, color: 'rgba(96,165,250,0)' }
        ])
      },
      symbol: 'circle', symbolSize: 4, itemStyle: { color: '#60a5fa' },
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: 'rgba(96,165,250,0.5)', type: 'dashed', width: 1.5 },
        data: [{ yAxis: 95, label: { formatter: '95%', color: 'rgba(96,165,250,0.7)', fontSize: 10 } }]
      }
    }]
  })
}

function initTempChart() {
  if (!tempChartRef.value) return
  tempChart = ec.init(tempChartRef.value)
  const { data, xKey, yKey } = getChartData(tempPeriod.value, 'temp')
  const times = data.map(v => v[xKey])
  const vals = data.map(v => v[yKey])
  tempChart.setOption({
    backgroundColor: chartBg,
    tooltip: {
      ...tooltipCfg,
      formatter: (p) => `${p[0].name}<br/><span style="color:#f97316">体温 ${p[0].value}°C</span>`
    },
    grid: { ...gridBase },
    xAxis: { type: 'category', data: times, boundaryGap: false, ...axisStyle, splitLine: { show: false } },
    yAxis: { type: 'value', min: 35.5, max: 37.8, splitNumber: 3, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisStyle },
    series: [{
      data: vals, type: 'line', smooth: 0.5,
      lineStyle: { color: '#f97316', width: 2.5 },
      areaStyle: {
        color: new ec.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(249,115,22,0.3)' },
          { offset: 1, color: 'rgba(249,115,22,0)' }
        ])
      },
      symbol: 'circle', symbolSize: 4, itemStyle: { color: '#f97316' },
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: 'rgba(249,115,22,0.5)', type: 'dashed', width: 1.5 },
        data: [
          { yAxis: 37.2, label: { formatter: '37.2°', color: 'rgba(249,115,22,0.7)', fontSize: 10 } },
          { yAxis: 36.1, label: { formatter: '36.1°', color: 'rgba(34,197,94,0.7)', fontSize: 10 } }
        ]
      }
    }]
  })
}

function initStepsChart() {
  if (!stepsChartRef.value) return
  stepsChart = ec.init(stepsChartRef.value)
  const days = props.stepsTrend.map(v => v.day)
  const vals = props.stepsTrend.map(v => v.value)
  stepsChart.setOption({
    backgroundColor: chartBg,
    tooltip: {
      ...tooltipCfg,
      formatter: (p) => `${p[0].name}<br/><span style="color:#00d4aa">${p[0].value.toLocaleString()} 步</span><br/><span style="color:#94a3b8">${p[0].value >= 10000 ? '✅ 已达标' : `距目标还差 ${(10000 - p[0].value).toLocaleString()} 步`}</span>`
    },
    grid: { ...gridBase, left: '2%', right: '4%' },
    xAxis: { type: 'category', data: days, ...axisStyle },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisStyle },
    series: [{
      data: vals, type: 'bar', barWidth: '55%',
      itemStyle: {
        color: (p) => p.value >= 10000
          ? new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#00d4aa' }, { offset: 1, color: 'rgba(0,212,170,0.4)' }])
          : new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0,212,170,0.6)' }, { offset: 1, color: 'rgba(0,212,170,0.2)' }]),
        borderRadius: [4, 4, 0, 0]
      },
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: 'rgba(0,212,170,0.5)', type: 'dashed', width: 1.5 },
        data: [{ yAxis: 10000, label: { formatter: '目标 10000', color: 'rgba(0,212,170,0.7)', fontSize: 10 } }]
      }
    }]
  })
}

async function initAllCharts() {
  if (!props.visible) return
  ec = await import('echarts')
  await nextTick()
  initHeartChart()
  initBpChart()
  initSpo2Chart()
  initTempChart()
  initStepsChart()
}

function resizeCharts() {
  heartChart?.resize()
  bpChart?.resize()
  spo2Chart?.resize()
  tempChart?.resize()
  stepsChart?.resize()
}

// ============ 监听更新 ============
watch(() => props.visible, async (v) => {
  if (v) {
    await nextTick()
    if (!ec) {
      await initAllCharts()
    } else {
      resizeCharts()
    }
  }
})

watch(() => props.heartRateData, () => {
  if (!ec || !heartChart) return
  const data = filteredHeartRate.value
  heartChart.setOption({
    xAxis: { data: data.map(v => v.time) },
    series: [{ data: data.map(v => v.value) }]
  })
}, { deep: true })

watch(() => props.spo2Trend, () => {
  if (!ec || !spo2Chart) return
  const data = filteredSpo2.value
  spo2Chart.setOption({
    xAxis: { data: data.map(v => v.time) },
    series: [{ data: data.map(v => v.value) }]
  })
}, { deep: true })

watch(() => props.tempTrend, () => {
  if (!ec || !tempChart) return
  const data = filteredTemp.value
  tempChart.setOption({
    xAxis: { data: data.map(v => v.time) },
    series: [{ data: data.map(v => v.value) }]
  })
}, { deep: true })

watch(() => props.stepsTrend, () => {
  if (!ec || !stepsChart) return
  stepsChart.setOption({
    xAxis: { data: props.stepsTrend.map(v => v.day) },
    series: [{ data: props.stepsTrend.map(v => v.value) }]
  })
}, { deep: true })

// 周期切换 → 重新渲染图表
watch(heartPeriod, () => { nextTick(() => updateHeartChart()) })
watch(bpPeriod, () => { nextTick(() => updateBpChart()) })
watch(spo2Period, () => { nextTick(() => updateSpo2Chart()) })
watch(tempPeriod, () => { nextTick(() => updateTempChart()) })
watch(stepsPeriod, () => { nextTick(() => updateStepsChart()) })

onMounted(() => {
  window.addEventListener('resize', resizeCharts)
})
</script>

<style scoped>
/* ===== 人物卡片 ===== */
.health-hero { margin-bottom: 18px; }
.health-hero-inner {
  display: flex; align-items: center; gap: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(0,212,170,0.08) 0%, rgba(96,165,250,0.06) 100%);
  border: 1px solid rgba(0,212,170,0.15);
  border-radius: 16px;
}
.health-avatar-wrap { position: relative; flex-shrink: 0; }
.health-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #00d4aa, #0ea5e9);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700; color: #fff;
  position: relative; z-index: 1;
}
.health-avatar-glow {
  position: absolute; inset: -4px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(0,212,170,0.3), rgba(14,165,233,0.3));
  animation: pulse-ring 2.5s ease-in-out infinite;
}
@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.08); opacity: 0.3; }
}
.health-hero-info { flex: 1; }
.health-hero-name { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.health-hero-age { font-size: 13px; color: var(--text-2); font-weight: 400; margin-left: 8px; }
.health-hero-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.hbadge {
  font-size: 11px; padding: 3px 10px; border-radius: 20px;
  background: rgba(255,255,255,0.06); color: var(--text-2);
  border: 1px solid rgba(255,255,255,0.08);
}
.hbadge-ok { background: rgba(34,197,94,0.1); color: #22c55e; border-color: rgba(34,197,94,0.2); }
.hbadge-time {
  display: flex; align-items: center; gap: 5px;
  background: rgba(0,212,170,0.08); color: #00d4aa;
  border-color: rgba(0,212,170,0.15);
}
.live-dot-sm {
  width: 6px; height: 6px; border-radius: 50%;
  background: #00d4aa; box-shadow: 0 0 6px #00d4aa;
  animation: pulse-dot 1.5s ease-in-out infinite;
}
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.health-hero-detail-row { display: flex; gap: 16px; font-size: 12px; color: var(--text-2); }
.hhdr-item { display: flex; align-items: center; gap: 5px; }
.hhdr-dot { width: 7px; height: 7px; border-radius: 50%; }

/* ===== 健康评分环 ===== */
.health-score-ring { text-align: center; flex-shrink: 0; }
.hsr-svg-wrap { position: relative; width: 90px; height: 90px; margin: 0 auto; }
.hsr-svg-wrap svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.hsr-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 7; }
.hsr-fill {
  fill: none; stroke: #00d4aa; stroke-width: 7;
  stroke-linecap: round;
  transform: rotate(-90deg); transform-origin: 50%;
}
.hsr-inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.hsr-val { font-size: 28px; font-weight: 800; color: #00d4aa; font-family: var(--font-mono); line-height: 1; }
.hsr-label { font-size: 10px; color: var(--text-3); margin-top: 2px; }
.hsr-sub { font-size: 11px; color: var(--text-3); margin-top: 4px; }

/* ===== 核心指标网格 ===== */
.health-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px; margin-bottom: 18px;
}
.hmetric-card {
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  border-top: 2px solid var(--hc, var(--primary));
  transition: all var(--transition);
  cursor: pointer;
}
.hmetric-card:hover {
  background: var(--surface-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.hmetric-top { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.hmetric-icon { font-size: 16px; }
.hmetric-label { font-size: 12px; color: var(--text-2); flex: 1; }
.hmetric-badge {
  font-size: 10px; padding: 2px 8px; border-radius: 20px;
  background: rgba(34,197,94,0.1); color: #22c55e;
  border: 1px solid rgba(34,197,94,0.2);
}
.hmetric-badge.warning { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.2); }
.hmetric-badge.danger { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
.hmetric-value {
  font-size: 22px; font-weight: 800; color: var(--text);
  font-family: var(--font-mono); margin-bottom: 8px; line-height: 1;
}
.hmetric-value :deep(.num) { font-family: var(--font-mono); }
.hmetric-bar-wrap {
  height: 3px; background: rgba(255,255,255,0.06);
  border-radius: 2px; overflow: hidden; margin-bottom: 6px;
}
.hmetric-bar {
  height: 100%; border-radius: 2px;
  background: var(--hc, var(--primary));
  transition: width 0.6s ease;
}
.hmetric-footer { display: flex; justify-content: space-between; align-items: center; }
.hmetric-range { font-size: 10px; color: var(--text-3); }
.hmetric-range :deep(.num) { font-family: var(--font-mono); font-size: 10px; }
.hmetric-trend { font-size: 11px; font-weight: 600; }
.hmetric-trend.up { color: #ef4444; }
.hmetric-trend.dn { color: #22c55e; }

/* ===== 图表行布局 ===== */
.health-charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px; margin-bottom: 16px;
}
.hchart-meta-row { display: flex; gap: 16px; margin-bottom: 10px; }
.bp-meta { gap: 0; align-items: center; }
.hchart-meta-item { text-align: center; flex: 1; }
.hcm-label { display: block; font-size: 10px; color: var(--text-3); margin-bottom: 2px; }
.hcm-val { font-family: var(--font-mono); font-size: 20px; font-weight: 700; }
.hcm-unit { font-size: 10px; color: var(--text-3); margin-left: 2px; }
.bp-divider { font-size: 28px; color: var(--text-3); font-weight: 300; margin: 0 8px; }
.hchart-area { width: 100%; height: 160px; }

/* ===== 步数图表区域 ===== */
.steps-overview-row { display: flex; gap: 20px; align-items: center; margin-bottom: 10px; }

/* ===== 睡眠结构 + 睡眠分析 ===== */
.sleep-struct { margin-bottom: 14px; }
.sleep-struct-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 6px;
}
.ss-time { font-size: 11px; color: var(--text-3); font-family: var(--font-mono); }
/* ===== 小米健康风格睡眠结构 ===== */
.xmsleep-header {
  display: flex; gap: 16px; align-items: center;
  padding: 12px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(155,89,182,0.15);
  border-radius: 12px;
  margin-bottom: 14px;
}
.xmsleep-score-ring { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.xmscore-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.xmscore-track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 7; }
.xmscore-fill {
  fill: none; stroke-width: 7;
  stroke-linecap: round;
  transform: rotate(-90deg); transform-origin: 50%;
  transition: stroke-dasharray 0.8s ease;
}
.xmscore-num {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center; flex-direction: column;
}
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

/* 小米风格睡眠时间线 */
.xmsleep-timeline { margin-bottom: 12px; }
.xtl-track {
  display: flex; height: 36px; border-radius: 8px; overflow: hidden;
  background: rgba(255,255,255,0.04);
}
.xtl-seg {
  height: 100%; min-width: 2px;
  transition: width 0.4s ease;
}
.xtl-seg:hover { filter: brightness(1.2); }
.xtl-ticks {
  display: flex; justify-content: space-between;
  padding: 4px 0 0;
  font-size: 9px; color: var(--text-3);
  font-family: var(--font-mono);
}
.xtl-legend {
  display: flex; gap: 10px; margin-top: 6px; flex-wrap: wrap;
}
.xl-item { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.xl-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.xl-name { color: var(--text-2); }
.xl-val { font-family: var(--font-mono); font-weight: 600; color: var(--text); }
.xl-pct { color: var(--text-3); }

/* 小米风格睡眠指标网格 */
.xmsleep-metrics {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
}
.xm-metric-card {
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  transition: background 0.2s;
}
.xm-metric-card:hover { background: rgba(255,255,255,0.06); }
.xmm-top { display: flex; align-items: center; gap: 5px; margin-bottom: 6px; }
.xmm-icon { font-size: 14px; }
.xmm-label { font-size: 11px; color: var(--text-3); }
.xmm-val { font-size: 18px; font-weight: 800; font-family: var(--font-mono); margin-bottom: 6px; line-height: 1; }
.xmm-bar { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.xmm-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; opacity: 0.7; }

@media (max-width: 768px) {
  .xmsleep-metrics { grid-template-columns: 1fr 1fr; }
  .xmsleep-header { flex-wrap: wrap; }
}
.steps-progress-ring { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
.steps-progress-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.steps-ring-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 8; }
.steps-ring-fill {
  fill: none; stroke: #00d4aa; stroke-width: 8;
  stroke-linecap: round;
  transform: rotate(-90deg); transform-origin: 50%;
  transition: stroke-dasharray 0.8s ease;
}
.steps-ring-inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.steps-ring-pct { font-size: 18px; font-weight: 800; color: #00d4aa; font-family: var(--font-mono); line-height: 1; }
.steps-ring-goal { font-size: 9px; color: var(--text-3); margin-top: 2px; }
.steps-stats-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.steps-stat-row { display: flex; justify-content: space-between; align-items: center; }
.ssr-label { font-size: 11px; color: var(--text-2); }
.ssr-val { font-size: 12px; font-weight: 600; color: var(--text); font-family: var(--font-mono); }
.steps-chart-area { height: 120px; }

/* ===== 健康建议 ===== */
.health-tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.htip-card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all var(--transition);
}
.htip-card:hover { background: var(--surface-hover); }
.htip-icon { font-size: 22px; min-width: 28px; }
.htip-body { flex: 1; }
.htip-title { font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.htip-desc { font-size: 11px; color: var(--text-2); line-height: 1.5; }
.htip-tag {
  font-size: 10px; padding: 3px 8px; border-radius: 20px;
  align-self: flex-start; white-space: nowrap;
  border: 1px solid;
}

/* ===== 通用面板元素 ===== */
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.panel-title {
  font-size: 14px; font-weight: 600; color: var(--text);
  display: flex; align-items: center; gap: 6px;
}
.panel-icon-txt { font-size: 16px; }
.panel-time { font-size: 11px; color: var(--text-3); }

/* ===== 周期切换标签 ===== */
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.period-tabs { display: flex; gap: 4px; }
.ptab {
  padding: 3px 10px; font-size: 11px; font-weight: 600;
  background: transparent; border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-3); border-radius: 20px; cursor: pointer;
  transition: all 0.2s;
}
.ptab:hover { color: var(--text-2); border-color: rgba(255,255,255,0.2); }
.ptab.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); color: #818cf8; }

/* ===== 睡眠时段纵向柱状图 ===== */
.sleep-bars-header {
  display: grid; grid-template-columns: 36px 1fr; align-items: end;
  margin-bottom: 2px;
}
.sb-bar-spacer { grid-column: 1; }
.sb-y-labels { display: flex; flex-direction: column; justify-content: space-between; height: 80px; grid-row: 1; grid-column: 1; padding-right: 4px; }
.sb-y-label { font-size: 9px; color: var(--text-3); font-family: var(--font-mono); text-align: right; }
.sleep-bars-row {
  display: flex; align-items: flex-end; gap: 4px;
  height: 80px; overflow-x: auto; scrollbar-width: none;
}
.sb-hour-label { font-size: 9px; color: var(--text-3); font-family: var(--font-mono); flex-shrink: 0; }
.sb-stacked-bar {
  display: flex; flex-direction: column-reverse;
  width: 14px; height: 80px; border-radius: 3px 3px 0 0; overflow: hidden;
  flex-shrink: 0; gap: 1px;
}
.sb-seg { width: 100%; transition: height 0.3s ease; flex-shrink: 0; }
.sb-seg:hover { filter: brightness(1.3); }

/* ===== 响应式 ===== */
@media (max-width: 1100px) {
  .health-metrics-grid { grid-template-columns: repeat(3, 1fr); }
  .health-charts-row { grid-template-columns: 1fr; }
  .xmsleep-metrics { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .health-metrics-grid { grid-template-columns: 1fr 1fr; }
  .health-tips-grid { grid-template-columns: 1fr; }
  .health-hero-inner { flex-wrap: wrap; }
  .steps-overview-row { flex-direction: column; align-items: flex-start; }
  .sleep-analysis { grid-template-columns: 1fr 1fr; }
}
</style>
