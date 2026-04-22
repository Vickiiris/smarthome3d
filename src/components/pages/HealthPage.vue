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
      <div v-for="item in healthItems" :key="item.label"
           class="hmetric-card"
           :style="{ borderTopColor: item.color }"
           @click="$emit('openHealthDetail', item)">
        <div class="hmetric-top">
          <span class="hmetric-icon">{{ item.icon }}</span>
          <span class="hmetric-label">{{ item.label }}</span>
          <span class="hmetric-badge" :class="getMetricStatus(item)">{{ getMetricStatusText(item) }}</span>
        </div>
        <!-- 数值: 颜色直接内联，与 env-detail-value 完全一致 -->
        <div class="hmetric-value" :style="{ color: item.color }">
          <span v-html="formatMetricValue(item.value)"></span>
        </div>
        <div class="hmetric-bar-wrap">
          <div class="hmetric-bar" :style="{ width: item.pct + '%', backgroundColor: item.color }"></div>
        </div>
        <div class="hmetric-footer">
          <span class="hmetric-range" :style="{ color: item.color }" v-html="formatMetricValue(item.range)"></span>
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
              <span class="hcm-val" :style="{ color: currentSpo2Stats.current >= 95 ? '#22c55e' : '#f59e0b' }">
                {{ currentSpo2Stats.current >= 95 ? '正常' : '偏低' }}
              </span>
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
      <!-- 步数统计 -->
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

      <!-- 睡眠分析 -->
      <div class="panel-card hchart-card">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-txt" style="color:#9B59B6">🌙</span>
            睡眠分析
            <span class="panel-time">昨夜</span>
          </h3>
          <div class="period-tabs">
            <button v-for="p in periods" :key="p" class="ptab" :class="{ active: sleepPeriod === p }" @click="sleepPeriod = p">{{ p }}</button>
          </div>
        </div>
        <div class="hchart-body">
          <!-- 小米健康风格: 顶部评分环 + 总时长 -->
          <div class="xmsleep-header">
            <div class="xmsleep-score-ring">
              <svg viewBox="0 0 100 100" class="xmscore-svg">
                <circle cx="50" cy="50" r="42" class="xmscore-track"/>
                <circle cx="50" cy="50" r="42" class="xmscore-fill"
                  :stroke="currentSleepData.score >= 85 ? '#00d4aa' : currentSleepData.score >= 70 ? '#f59e0b' : '#ef4444'"
                  :stroke-dasharray="`${(currentSleepData.score / 100) * 264} 264`"
                />
              </svg>
              <div class="xmscore-num">
                <span class="xmscore-val">{{ currentSleepData.score }}</span>
                <span class="xmscore-label">分</span>
              </div>
            </div>
            <div class="xmsleep-overview">
              <div class="xmsleep-total">
                <span class="xt-label">睡眠时长</span>
                <span class="xt-val">{{ currentSleepData.total }}<span class="xt-unit">h</span></span>
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
                  <span class="xs-val">{{ currentSleepData.awakeCount }}次</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 小米运动健康风格: 横向分段柱状图，4色堆叠条 -->
          <!-- 每行=1个时段(23:00~06:00)，每条柱由深睡/浅睡/REM/清醒四色分段叠加 -->
          <div class="xmsleep-timeline">
            <!-- 左侧阶段图例 + 8个时段水平轴 -->
            <div class="sl-row sl-header-row">
              <span class="sl-label-cell"></span>
              <span v-for="(seg, si) in sleepSegs" :key="si" class="sl-axis-lbl">{{ seg.hour }}</span>
            </div>
            <!-- 睡眠阶段行: 深睡/浅睡/REM/清醒，横向分段条 -->
            <div v-for="stg in sleepStageDefs" :key="stg.name" class="sl-row">
              <span class="sl-label-cell" :style="{ color: stg.color }">{{ stg.name }}</span>
              <div class="sl-bar-row">
                <div v-for="(seg, si) in sleepSegs" :key="si" class="sl-seg-wrap">
                  <div class="sl-seg"
                    :style="{
                      height: seg[stg.key + 'Pct'] + '%',
                      backgroundColor: seg[stg.key + 'Pct'] > 0 ? stg.color : 'transparent',
                      minHeight: seg[stg.key + 'Pct'] > 0 ? '2px' : '0'
                    }"
                    :title="`${stg.name} ${seg.hour} ${seg[stg.key]}min`"
                  ></div>
                </div>
              </div>
            </div>
            <!-- 底部图例 -->
            <div class="sl-legend">
              <div v-for="stg in sleepStageDefs" :key="stg.name" class="sl-legend-item">
                <span class="sl-legend-dot" :style="{ background: stg.color }"></span>
                <span class="sl-legend-name">{{ stg.name }}</span>
                <span class="sl-legend-h">{{ (currentSleepData[stg.key === 'deep' ? 'deep' : stg.key === 'light' ? 'light' : stg.key === 'rem' ? 'rem' : 'awakeMin'] / 60).toFixed(1) }}h</span>
                <span class="sl-legend-pct">{{ sleepStages.find(s => s.name === stg.name)?.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 健康建议 ========== -->
    <div class="health-tips-grid">
      <div v-for="tip in healthTips" :key="tip.title" class="htip-card">
        <div class="htip-icon">{{ tip.icon }}</div>
        <div class="htip-body">
          <div class="htip-title">{{ tip.title }}</div>
          <div class="htip-desc">{{ tip.desc }}</div>
        </div>
        <span class="htip-tag" :style="{ color: tip.color, borderColor: tip.color, backgroundColor: tip.color + '18' }">{{ tip.tag }}</span>
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

// ===== 当前小时 =====
const currentHour = () => new Date().getHours()

// ===== 按日周期过滤数据 =====
const filteredHeartRate = computed(() => props.heartRateData.slice(0, currentHour() + 1))
const filteredSpo2 = computed(() => props.spo2Trend.slice(0, currentHour() + 1))
const filteredTemp = computed(() => props.tempTrend.slice(0, currentHour() + 1))

// ===== 周期状态 =====
const periods = ['日', '周', '月']
const heartPeriod = ref('日')
const bpPeriod = ref('周')
const spo2Period = ref('日')
const tempPeriod = ref('日')
const stepsPeriod = ref('日')
const sleepPeriod = ref('日')

// ===== 统计数据 =====
// 心率
const currentHeartStats = computed(() => {
  if (heartPeriod.value === '日') {
    const d = filteredHeartRate.value
    if (!d.length) return { avg: 72, min: 58, max: 88 }
    return {
      avg: Math.round(d.reduce((s, v) => s + v.value, 0) / d.length),
      min: Math.min(...d.map(v => v.value)),
      max: Math.max(...d.map(v => v.value)),
    }
  }
  if (heartPeriod.value === '周') return { avg: 68, min: 55, max: 88 }
  return { avg: 70, min: 52, max: 92 }
})

// 血压
const currentBpStats = computed(() => {
  if (bpPeriod.value === '周') {
    const w = props.bpWeekData
    return {
      sys: w.length ? Math.round(w.reduce((s, v) => s + v.sys, 0) / w.length) : 118,
      dia: w.length ? Math.round(w.reduce((s, v) => s + v.dia, 0) / w.length) : 76,
    }
  }
  if (bpPeriod.value === '日') {
    const d = props.bpWeekData
    const today = d.length ? d[d.length - 1] : { sys: 118, dia: 76 }
    return { sys: today.sys, dia: today.dia }
  }
  return { sys: 120, dia: 77 }
})

// spo2 固定数据
const SPO2_W = [97, 98, 96, 97, 98, 97, 98]
const SPO2_M = Array.from({ length: 30 }, (_, i) => 96 + [1,0,2,1,0,1,2,0,1,2,1,0,2,1,0,2,1,0,1,2,0,1,2,0,1,0,2,1,0,2][i])
const currentSpo2Stats = computed(() => {
  if (spo2Period.value === '日') {
    const d = filteredSpo2.value
    return { current: d.length ? d[d.length - 1].value : 98, min: d.length ? Math.min(...d.map(v => v.value)) : 96 }
  }
  if (spo2Period.value === '周') {
    return { current: SPO2_W[SPO2_W.length - 1], min: Math.min(...SPO2_W) }
  }
  return { current: SPO2_M[SPO2_M.length - 1], min: Math.min(...SPO2_M) }
})

// 体温固定数据
const TEMP_W = [36.4, 36.3, 36.2, 36.5, 36.3, 36.4, 36.3]
const TEMP_M = Array.from({ length: 30 }, (_, i) => {
  const offsets = [0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2]
  return parseFloat((36.3 + offsets[i % offsets.length]).toFixed(1))
})
const currentTempStats = computed(() => {
  if (tempPeriod.value === '日') {
    const d = filteredTemp.value
    return {
      current: d.length ? parseFloat(d[d.length - 1].value.toFixed(1)) : 36.5,
      min: d.length ? parseFloat(Math.min(...d.map(v => v.value)).toFixed(1)) : 36.1,
      max: d.length ? parseFloat(Math.max(...d.map(v => v.value)).toFixed(1)) : 36.8,
    }
  }
  if (tempPeriod.value === '周') return { current: TEMP_W[TEMP_W.length - 1], min: Math.min(...TEMP_W), max: Math.max(...TEMP_W) }
  return { current: TEMP_M[TEMP_M.length - 1], min: Math.min(...TEMP_M), max: Math.max(...TEMP_M) }
})

// 步数
const todaySteps = computed(() => {
  if (!props.stepsTrend?.length) return 0
  return Math.round(props.stepsTrend[props.stepsTrend.length - 1].value)
})
const currentStepsStats = computed(() => {
  const arr = props.stepsTrend || []
  if (stepsPeriod.value === '日') return { summary: (arr.reduce((s, v) => s + v.value, 0) / 10000).toFixed(1) + '万步' }
  if (stepsPeriod.value === '周') {
    const avg = arr.length ? Math.round(arr.reduce((s, v) => s + v.value, 0) / arr.length) : 0
    return { summary: avg.toLocaleString() + ' 步/天' }
  }
  return { summary: '8,234 步/天' }
})

// ===== 睡眠阶段数据 =====
const sleepStageDefs = [
  { name: '深睡', color: '#6366f1', key: 'deep' },
  { name: '浅睡', color: '#818cf8', key: 'light' },
  { name: 'REM',  color: '#a78bfa', key: 'rem' },
  { name: '清醒', color: '#fbbf24', key: 'awake' },
]

// 睡眠周/月固定数据
const SLEEP_W = { total: 7.5, score: 85, deep: 96, light: 180, rem: 66, awakeMin: 18, awakeCount: 2 }
const SLEEP_M = { total: 7.3, score: 82, deep: 88, light: 174, rem: 60, awakeMin: 22, awakeCount: 3 }
const currentSleepData = computed(() => {
  if (sleepPeriod.value === '周') return SLEEP_W
  if (sleepPeriod.value === '月') return SLEEP_M
  return props.sleepData
})

// sleepStages: 各阶段占比
const sleepStages = computed(() => {
  const { deep, light, rem, awakeMin } = currentSleepData.value
  const total = deep + light + rem + awakeMin
  if (!total) return []
  return [
    { name: '深睡', h: (deep / 60).toFixed(1), pct: Math.round(deep / total * 100), color: '#6366f1' },
    { name: '浅睡', h: (light / 60).toFixed(1), pct: Math.round(light / total * 100), color: '#818cf8' },
    { name: 'REM', h: (rem / 60).toFixed(1), pct: Math.round(rem / total * 100), color: '#a78bfa' },
    { name: '清醒', h: (awakeMin / 60).toFixed(1), pct: Math.round(awakeMin / total * 100), color: '#fbbf24' },
  ]
})

// sleepSegs: 8个时段(23:00~06:00)，每段含各阶段分钟数和占百分比
const sleepHourlyPcts = [
  { deep: 0.15, light: 0.28, rem: 0.22, awake: 0.15 }, // 23:00
  { deep: 0.40, light: 0.35, rem: 0.20, awake: 0.05 }, // 00:00
  { deep: 0.35, light: 0.35, rem: 0.25, awake: 0.05 }, // 01:00
  { deep: 0.50, light: 0.40, rem: 0.00, awake: 0.10 }, // 02:00
  { deep: 0.30, light: 0.35, rem: 0.30, awake: 0.05 }, // 03:00
  { deep: 0.50, light: 0.50, rem: 0.00, awake: 0.00 }, // 04:00
  { deep: 0.30, light: 0.40, rem: 0.25, awake: 0.05 }, // 05:00
  { deep: 0.10, light: 0.50, rem: 0.25, awake: 0.15 }, // 06:00
]
const SLEEP_HOURS = ['23:00','00:00','01:00','02:00','03:00','04:00','05:00','06:00']
const sleepSegs = computed(() => {
  const { deep, light, rem, awakeMin } = currentSleepData.value
  const total = deep + light + rem + awakeMin
  return SLEEP_HOURS.map((hour, i) => {
    const p = sleepHourlyPcts[i]
    return {
      hour,
      deep:   Math.round(deep * p.deep),
      light:  Math.round(light * p.light),
      rem:    Math.round(rem * p.rem),
      awake:  Math.round(awakeMin * p.awake),
      deepPct:   total ? Math.round((deep * p.deep)   / total * 100) : 0,
      lightPct:  total ? Math.round((light * p.light) / total * 100) : 0,
      remPct:    total ? Math.round((rem * p.rem)    / total * 100) : 0,
      awakePct:  total ? Math.round((awakeMin * p.awake) / total * 100) : 0,
    }
  })
})

// ===== 核心指标状态 ======
function getMetricStatus(item) {
  if (item.label === '心率') return props.getHeartStatus(item.raw).class
  if (item.label === '血压') { const parts = item.value.split('/'); return props.getBpStatus(parseInt(parts[0]), parseInt(parts[1])).class }
  if (item.label === '血氧') return props.getSpo2Status(item.raw).class
  if (item.label === '体温') return props.getTempStatus(item.raw).class
  if (item.label === '步数') return props.getStepsStatus(item.raw).class
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

// ===== 健康建议 =====
const latestSteps = computed(() => {
  if (!props.stepsTrend?.length) return 0
  return Math.round(props.stepsTrend[props.stepsTrend.length - 1].value)
})
const healthTips = computed(() => [
  {
    icon: '🏃', title: '运动建议',
    desc: latestSteps.value < 6000
      ? `今日步数 ${latestSteps.value.toLocaleString()}，偏少，建议晚饭后散步 30 分钟`
      : '今日步数达标，继续保持每天运动习惯',
    tag: latestSteps.value < 6000 ? '需运动' : '已达标', color: '#00d4aa'
  },
  {
    icon: '😴', title: '睡眠建议',
    desc: currentSleepData.value.score >= 85 ? '近期睡眠质量良好，建议保持 22:30 前入睡' : '睡眠质量偏低，建议睡前减少电子设备使用',
    tag: currentSleepData.value.score >= 85 ? '状态好' : '需改善', color: '#9B59B6'
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

// ============ ECharts 图表 ============
const chartBg = 'transparent'
const tooltipCfg = {
  trigger: 'axis',
  backgroundColor: 'rgba(5,13,24,0.97)',
  borderColor: 'rgba(255,255,255,0.12)',
  textStyle: { color: '#e2e8f0', fontSize: 12 },
  axisPointer: { type: 'cross', crossStyle: { color: 'rgba(255,255,255,0.1)' } }
}
const AXIS_COLOR = '#94a3b8'
const gridBase = { left: '3%', right: '4%', top: '8%', bottom: '8%', containLabel: true }
const axisCfg = {
  axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
  axisTick: { show: false },
  axisLabel: { color: AXIS_COLOR, fontSize: 11 }
}

const heartChartRef = ref(null)
const bpChartRef = ref(null)
const spo2ChartRef = ref(null)
const tempChartRef = ref(null)
const stepsChartRef = ref(null)

let ec = null
let heartChart = null
let bpChart = null
let spo2Chart = null
let tempChart = null
let stepsChart = null

// tooltip 工厂
function mkTooltip(chartData, xKey, unit, color) {
  return {
    ...tooltipCfg,
    formatter: (params) => {
      const p = params[0]
      const raw = chartData[p.dataIndex]
      const t = raw?.[xKey] ?? p.axisValueLabel ?? p.name
      const v = p.value
      return `<div style="font-size:12px;line-height:1.8">`
        + `<span style="color:${AXIS_COLOR}">${t}</span><br/>`
        + `<span style="color:${color};font-variant-numeric:tabular-nums;font-weight:600">${v}${unit}</span>`
        + `</div>`
    }
  }
}

// 获取各图表数据
function getHeartData(period) {
  if (period === '日') return { data: filteredHeartRate.value, xKey: 'time' }
  if (period === '周') return {
    data: [
      { time: '周一', value: 68 }, { time: '周二', value: 72 }, { time: '周三', value: 65 },
      { time: '周四', value: 70 }, { time: '周五', value: 73 }, { time: '周六', value: 69 },
      { time: '周日', value: 71 }
    ], xKey: 'time'
  }
  return {
    data: Array.from({ length: 30 }, (_, i) => ({ time: (i+1)+'日', value: 62 + [5,8,3,10,6,9,4,7,11,2,8,5,3,9,6,4,10,7,2,8,5,3,9,6,4,10,7,2,5,8][i] })),
    xKey: 'time'
  }
}
function getSpo2Data(period) {
  if (period === '日') return { data: filteredSpo2.value, xKey: 'time' }
  if (period === '周') return { data: SPO2_W.map((v, i) => ({ time: ['一','二','三','四','五','六','日'][i], value: v })), xKey: 'time' }
  return { data: SPO2_M.map((v, i) => ({ time: (i+1)+'日', value: v })), xKey: 'time' }
}
function getTempData(period) {
  if (period === '日') return { data: filteredTemp.value, xKey: 'time' }
  if (period === '周') return { data: TEMP_W.map((v, i) => ({ time: ['一','二','三','四','五','六','日'][i], value: v })), xKey: 'time' }
  return { data: TEMP_M.map((v, i) => ({ time: (i+1)+'日', value: v })), xKey: 'time' }
}
function getStepsData(period) {
  if (period === '日') {
    const today = props.stepsTrend?.length ? props.stepsTrend[props.stepsTrend.length - 1] : null
    const hourData = today?.hourData
    if (hourData?.length) return { data: hourData.map(h => ({ time: h.hour, value: h.value })), xKey: 'time' }
    return { data: today ? [{ time: '今日', value: today.value }] : [], xKey: 'time' }
  }
  if (period === '月') return {
    data: ['第1周','第2周','第3周','第4周'].map((w, i) => ({ time: w, value: [7234, 8156, 6890, 9032][i] })),
    xKey: 'time'
  }
  return {
    data: ['周一','周二','周三','周四','周五','周六','周日'].map((d, i) => ({ time: d, value: [7234,8156,6890,9032,7521,10234,6543][i] })),
    xKey: 'time'
  }
}
function getBpData(period) {
  if (period === '日') {
    const w = props.bpWeekData
    const today = w.length ? w[w.length - 1] : { sys: 118, dia: 76 }
    return { labels: ['今日'], sysData: [today.sys], diaData: [today.dia] }
  }
  if (period === '月') return {
    labels: ['1日','5日','10日','15日','20日','25日','30日'],
    sysData: [118, 122, 115, 120, 117, 123, 116],
    diaData: [76, 80, 74, 78, 75, 82, 77],
  }
  return {
    labels: ['周一','周二','周三','周四','周五','周六','周日'],
    sysData: props.bpWeekData.map(v => v.sys),
    diaData: props.bpWeekData.map(v => v.dia),
  }
}

// ===== 初始化函数 =====
function initHeartChart() {
  if (!heartChartRef.value) return
  heartChart = ec.init(heartChartRef.value)
  const { data, xKey } = getHeartData(heartPeriod.value)
  heartChart.setOption({
    backgroundColor: chartBg,
    tooltip: mkTooltip(data, xKey, ' bpm', '#ff6b6b'),
    grid: { ...gridBase },
    xAxis: { type: 'category', data: data.map(v => v[xKey]), boundaryGap: false, splitLine: { show: false }, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11 } },
    yAxis: { type: 'value', min: 50, max: 110, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11, fontVariantNumeric: 'tabular-nums' } },
    series: [{
      data: data.map(v => v.value),
      type: 'line', smooth: 0.4,
      lineStyle: { color: '#ff6b6b', width: 2.5 },
      areaStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,107,0.3)' }, { offset: 1, color: 'rgba(255,107,107,0)' }]) },
      symbol: 'circle', symbolSize: 5, itemStyle: { color: '#ff6b6b' },
      markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(255,107,107,0.4)', type: 'dashed', width: 1 }, data: [{ yAxis: 100, label: { formatter: '上限 100', color: 'rgba(255,107,107,0.6)', fontSize: 10 } }] }
    }]
  })
}

function initBpChart() {
  if (!bpChartRef.value) return
  bpChart = ec.init(bpChartRef.value)
  const d = getBpData(bpPeriod.value)
  bpChart.setOption({
    backgroundColor: chartBg,
    tooltip: {
      ...tooltipCfg,
      formatter: (params) => {
        const p = params[0]
        const d = getBpData(bpPeriod.value)
        const idx = (bpPeriod.value === '日' || !d.labels.length) ? 0 : Math.min(p.dataIndex, d.labels.length - 1)
        const label = d.labels[idx] ?? '--'
        const sys = d.sysData[idx] !== undefined ? d.sysData[idx] : '--'
        const dia = d.diaData[idx] !== undefined ? d.diaData[idx] : '--'
        return `<div style="font-size:12px;line-height:1.8"><span style="color:${AXIS_COLOR}">${label}</span><br/><span style="color:#ff6b6b;font-variant-numeric:tabular-nums;font-weight:600">收缩压 ${sys} mmHg</span><br/><span style="color:#60a5fa;font-variant-numeric:tabular-nums;font-weight:600">舒张压 ${dia} mmHg</span></div>`
      }
    },
    grid: { ...gridBase },
    legend: { data: ['收缩压','舒张压'], top: 0, right: 10, textStyle: { color: AXIS_COLOR, fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
    xAxis: { type: 'category', data: d.labels, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11 } },
    yAxis: { type: 'value', min: 60, max: 160, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11, fontVariantNumeric: 'tabular-nums' } },
    series: [
      { name: '收缩压', data: d.sysData, type: 'bar', barWidth: '35%',
        itemStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ff6b6b' }, { offset: 1, color: 'rgba(255,107,107,0.3)' }]), borderRadius: [4, 4, 0, 0] } },
      { name: '舒张压', data: d.diaData, type: 'bar', barWidth: '35%',
        itemStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: 'rgba(96,165,250,0.3)' }]), borderRadius: [4, 4, 0, 0] } },
    ]
  })
}

function initSpo2Chart() {
  if (!spo2ChartRef.value) return
  spo2Chart = ec.init(spo2ChartRef.value)
  const { data, xKey } = getSpo2Data(spo2Period.value)
  spo2Chart.setOption({
    backgroundColor: chartBg,
    tooltip: mkTooltip(data, xKey, '%', '#60a5fa'),
    grid: { ...gridBase },
    xAxis: { type: 'category', data: data.map(v => v[xKey]), boundaryGap: false, splitLine: { show: false }, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11 } },
    yAxis: { type: 'value', min: 90, max: 100, splitNumber: 4, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11, fontVariantNumeric: 'tabular-nums' } },
    series: [{
      data: data.map(v => v.value),
      type: 'line', smooth: 0.5,
      lineStyle: { color: '#60a5fa', width: 2.5 },
      areaStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(96,165,250,0.3)' }, { offset: 1, color: 'rgba(96,165,250,0)' }]) },
      symbol: 'circle', symbolSize: 4, itemStyle: { color: '#60a5fa' },
      markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(96,165,250,0.5)', type: 'dashed', width: 1.5 }, data: [{ yAxis: 95, label: { formatter: '95%', color: 'rgba(96,165,250,0.7)', fontSize: 10 } }] }
    }]
  })
}

function initTempChart() {
  if (!tempChartRef.value) return
  tempChart = ec.init(tempChartRef.value)
  const { data, xKey } = getTempData(tempPeriod.value)
  tempChart.setOption({
    backgroundColor: chartBg,
    tooltip: mkTooltip(data, xKey, '°C', '#f97316'),
    grid: { ...gridBase },
    xAxis: { type: 'category', data: data.map(v => v[xKey]), boundaryGap: false, splitLine: { show: false }, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11 } },
    yAxis: { type: 'value', min: 35.5, max: 37.8, splitNumber: 3, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11, fontVariantNumeric: 'tabular-nums' } },
    series: [{
      data: data.map(v => v.value),
      type: 'line', smooth: 0.5,
      lineStyle: { color: '#f97316', width: 2.5 },
      areaStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(249,115,22,0.3)' }, { offset: 1, color: 'rgba(249,115,22,0)' }]) },
      symbol: 'circle', symbolSize: 4, itemStyle: { color: '#f97316' },
      markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(249,115,22,0.5)', type: 'dashed', width: 1.5 }, data: [
        { yAxis: 37.2, label: { formatter: '37.2°', color: 'rgba(249,115,22,0.7)', fontSize: 10 } },
        { yAxis: 36.1, label: { formatter: '36.1°', color: 'rgba(34,197,94,0.7)', fontSize: 10 } }
      ] }
    }]
  })
}

function initStepsChart() {
  if (!stepsChartRef.value) return
  stepsChart = ec.init(stepsChartRef.value)
  const { data, xKey } = getStepsData(stepsPeriod.value)
  stepsChart.setOption({
    backgroundColor: chartBg,
    tooltip: mkTooltip(data, xKey, ' 步', '#00d4aa'),
    grid: { ...gridBase, left: '2%', right: '4%' },
    xAxis: { type: 'category', data: data.map(v => v[xKey]), ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg, axisLabel: { color: AXIS_COLOR, fontSize: 11, fontVariantNumeric: 'tabular-nums' } },
    series: [{
      data: data.map(v => v.value),
      type: 'bar', barWidth: '55%',
      itemStyle: {
        color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#34d399' }, { offset: 1, color: 'rgba(52,211,153,0.3)' }]),
        borderRadius: [3, 3, 0, 0]
      },
      markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(0,212,170,0.5)', type: 'dashed', width: 1.5 }, data: [{ yAxis: 10000, label: { formatter: '目标 10000', color: 'rgba(0,212,170,0.7)', fontSize: 10 } }] }
    }]
  })
}

// ===== 更新函数 =====
function updateHeartChart() {
  if (!heartChart) return
  const { data, xKey } = getHeartData(heartPeriod.value)
  heartChart.setOption({
    xAxis: { data: data.map(v => v[xKey]) },
    series: [{ data: data.map(v => v.value) }],
    tooltip: mkTooltip(data, xKey, ' bpm', '#ff6b6b'),
  })
}
function updateBpChart() {
  if (!bpChart) return
  const d = getBpData(bpPeriod.value)
  bpChart.setOption({
    xAxis: { data: d.labels },
    series: [{ name: '收缩压', data: d.sysData }, { name: '舒张压', data: d.diaData }],
    tooltip: {
      ...tooltipCfg,
      formatter: (params) => {
        const p = params[0]
        const d = getBpData(bpPeriod.value)
        const idx = (bpPeriod.value === '日' || !d.labels.length) ? 0 : Math.min(p.dataIndex, d.labels.length - 1)
        const label = d.labels[idx] ?? '--'
        const sys = d.sysData[idx] !== undefined ? d.sysData[idx] : '--'
        const dia = d.diaData[idx] !== undefined ? d.diaData[idx] : '--'
        return `<div style="font-size:12px;line-height:1.8"><span style="color:${AXIS_COLOR}">${label}</span><br/><span style="color:#ff6b6b;font-variant-numeric:tabular-nums;font-weight:600">收缩压 ${sys} mmHg</span><br/><span style="color:#60a5fa;font-variant-numeric:tabular-nums;font-weight:600">舒张压 ${dia} mmHg</span></div>`
      }
    },
  })
}
function updateSpo2Chart() {
  if (!spo2Chart) return
  const { data, xKey } = getSpo2Data(spo2Period.value)
  spo2Chart.setOption({
    xAxis: { data: data.map(v => v[xKey]) },
    series: [{ data: data.map(v => v.value) }],
    tooltip: mkTooltip(data, xKey, '%', '#60a5fa'),
  })
}
function updateTempChart() {
  if (!tempChart) return
  const { data, xKey } = getTempData(tempPeriod.value)
  tempChart.setOption({
    xAxis: { data: data.map(v => v[xKey]) },
    series: [{ data: data.map(v => v.value) }],
    tooltip: mkTooltip(data, xKey, '°C', '#f97316'),
  })
}
function updateStepsChart() {
  if (!stepsChart) return
  const { data, xKey } = getStepsData(stepsPeriod.value)
  stepsChart.setOption({
    xAxis: { data: data.map(v => v[xKey]) },
    series: [{ data: data.map(v => v.value) }],
    tooltip: mkTooltip(data, xKey, ' 步', '#00d4aa'),
  })
}

// ============ 初始化与监听 ============
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

watch(() => props.visible, async (v) => {
  if (v) {
    await nextTick()
    if (!ec) {
      await initAllCharts()
    } else {
      resizeCharts()
    }
  }
}, { immediate: true })

watch(() => props.heartRateData, () => { if (ec && heartChart) nextTick(() => updateHeartChart()) }, { deep: true })
watch(() => props.spo2Trend, () => { if (ec && spo2Chart) nextTick(() => updateSpo2Chart()) }, { deep: true })
watch(() => props.tempTrend, () => { if (ec && tempChart) nextTick(() => updateTempChart()) }, { deep: true })
watch(() => props.stepsTrend, () => { if (ec && stepsChart) nextTick(() => updateStepsChart()) }, { deep: true })

watch(heartPeriod, () => nextTick(() => updateHeartChart()))
watch(bpPeriod, () => nextTick(() => updateBpChart()))
watch(spo2Period, () => nextTick(() => updateSpo2Chart()))
watch(tempPeriod, () => nextTick(() => updateTempChart()))
watch(stepsPeriod, () => nextTick(() => updateStepsChart()))

onMounted(async () => {
  window.addEventListener('resize', resizeCharts)
  if (props.visible && !ec) {
    await nextTick()
    await initAllCharts()
  }
})
</script>

<style scoped>
/* ===== 人物卡片 ===== */
.health-hero { margin-bottom: 18px; }
.health-hero-inner {
  display: flex; align-items: center; gap: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(0,212,170,0.08) 0%, rgba(96,165,250,0.06) 100%);
  border: 1px solid rgba(0,212,170,0.15); border-radius: 16px;
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
@keyframes pulse-ring { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.08); opacity: 0.3; } }
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
.hbadge-time { display: flex; align-items: center; gap: 5px; background: rgba(0,212,170,0.08); color: #00d4aa; border-color: rgba(0,212,170,0.15); }
.live-dot-sm { width: 6px; height: 6px; border-radius: 50%; background: #00d4aa; box-shadow: 0 0 6px #00d4aa; animation: pulse-dot 1.5s ease-in-out infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.health-hero-detail-row { display: flex; gap: 16px; font-size: 12px; color: var(--text-2); }
.hhdr-item { display: flex; align-items: center; gap: 5px; }
.hhdr-dot { width: 7px; height: 7px; border-radius: 50%; }

/* ===== 健康评分环 ===== */
.health-score-ring { text-align: center; flex-shrink: 0; }
.hsr-svg-wrap { position: relative; width: 90px; height: 90px; margin: 0 auto; }
.hsr-svg-wrap svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.hsr-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 7; }
.hsr-fill { fill: none; stroke: #00d4aa; stroke-width: 7; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50%; }
.hsr-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.hsr-val { font-size: 28px; font-weight: 800; color: #00d4aa; font-family: var(--font-mono); line-height: 1; }
.hsr-label { font-size: 10px; color: var(--text-3); margin-top: 2px; }
.hsr-sub { font-size: 11px; color: var(--text-3); margin-top: 4px; }

/* ===== 核心指标网格 ===== */
.health-metrics-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; margin-bottom: 18px;
}
.hmetric-card {
  padding: 14px 16px; background: var(--surface);
  border: 1px solid var(--border); border-radius: 12px;
  border-top: 2px solid; /* 由 :style="{ borderTopColor: item.color }" 设置 */
  transition: all var(--transition); cursor: pointer;
}
.hmetric-card:hover { background: var(--surface-hover); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.hmetric-top { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.hmetric-icon { font-size: 16px; }
.hmetric-label { font-size: 12px; color: var(--text-2); flex: 1; }
.hmetric-badge { font-size: 10px; padding: 2px 8px; border-radius: 20px; background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
.hmetric-badge.warning { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.2); }
.hmetric-badge.danger { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
.hmetric-value {
  font-size: 22px; font-weight: 800; /* color 由 :style 内联设置，与 env-detail-value 一致 */
  font-family: var(--font-mono); margin-bottom: 8px; line-height: 1;
}
.hmetric-value :deep(.num) { font-family: var(--font-mono); color: inherit; }
.hmetric-bar-wrap { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 6px; }
.hmetric-bar { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.hmetric-footer { display: flex; justify-content: space-between; align-items: center; }
.hmetric-range { font-size: 10px; color: var(--text-3); }
.hmetric-range :deep(.num) { font-family: var(--font-mono); font-size: 10px; }
.hmetric-trend { font-size: 11px; font-weight: 600; }
.hmetric-trend.up { color: #ef4444; }
.hmetric-trend.dn { color: #22c55e; }

/* ===== 图表行布局 ===== */
.health-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.hchart-meta-row { display: flex; gap: 16px; margin-bottom: 10px; }
.bp-meta { gap: 0; align-items: center; }
.hchart-meta-item { text-align: center; flex: 1; }
.hcm-label { display: block; font-size: 10px; color: var(--text-3); margin-bottom: 2px; }
.hcm-val { font-family: var(--font-mono); font-size: 20px; font-weight: 700; }
.hcm-unit { font-size: 10px; margin-left: 2px; }
.bp-divider { font-size: 28px; color: var(--text-3); font-weight: 300; margin: 0 8px; }
.hchart-area { width: 100%; height: 160px; }

/* ===== 步数 ===== */
.steps-overview-row { display: flex; gap: 20px; align-items: center; margin-bottom: 10px; }
.steps-progress-ring { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
.steps-progress-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.steps-ring-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 8; }
.steps-ring-fill { fill: none; stroke: #00d4aa; stroke-width: 8; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50%; transition: stroke-dasharray 0.8s ease; }
.steps-ring-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.steps-ring-pct { font-size: 18px; font-weight: 800; color: #00d4aa; font-family: var(--font-mono); line-height: 1; }
.steps-ring-goal { font-size: 9px; color: var(--text-3); margin-top: 2px; }
.steps-stats-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.steps-stat-row { display: flex; justify-content: space-between; align-items: center; }
.ssr-label { font-size: 11px; color: var(--text-2); }
.ssr-val { font-size: 12px; font-weight: 600; color: var(--text); font-family: var(--font-mono); }
.steps-chart-area { height: 120px; }

/* ===== 睡眠分析 ===== */
.xmsleep-header {
  display: flex; gap: 16px; align-items: center;
  padding: 12px 16px; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(155,89,182,0.15); border-radius: 12px; margin-bottom: 14px;
}
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

/* ===== 小米运动健康风格睡眠横向分段柱状图 ===== */
/* 结构: 顶部时间轴 + 4个阶段行(深睡/浅睡/REM/清醒) + 底部图例 */
/* 每行: 左侧阶段标签 + 8个时段柱(每柱由1色填充，高度=该阶段在该时段的分钟占比) */
.sl-row { display: flex; align-items: center; margin-bottom: 6px; }
.sl-header-row { margin-bottom: 3px; }
.sl-label-cell { width: 40px; font-size: 11px; font-weight: 700; flex-shrink: 0; text-align: right; padding-right: 8px; }
.sl-axis-lbl { flex: 1; font-size: 9px; color: var(--text-3); font-family: var(--font-mono); text-align: center; }
.sl-bar-row { flex: 1; display: flex; align-items: stretch; height: 26px; gap: 2px; }
.sl-seg-wrap { flex: 1; display: flex; align-items: flex-end; border-radius: 2px; overflow: hidden; min-width: 0; }
.sl-seg { width: 100%; border-radius: 2px; transition: height 0.4s ease; }
.sl-seg:hover { filter: brightness(1.2); }
/* 底部图例 */
.sl-legend { display: flex; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
.sl-legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.sl-legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.sl-legend-name { color: var(--text-2); }
.sl-legend-h { font-family: var(--font-mono); font-size: 11px; color: var(--text); }
.sl-legend-pct { color: var(--text-3); font-size: 10px; }

/* ===== 健康建议 ===== */
.health-tips-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.htip-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; transition: all var(--transition); }
.htip-card:hover { background: var(--surface-hover); }
.htip-icon { font-size: 22px; min-width: 28px; }
.htip-body { flex: 1; }
.htip-title { font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.htip-desc { font-size: 11px; color: var(--text-2); line-height: 1.5; }
.htip-tag { font-size: 10px; padding: 3px 8px; border-radius: 20px; align-self: flex-start; white-space: nowrap; border: 1px solid; }

/* ===== 通用面板元素 ===== */
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.panel-title { font-size: 14px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 6px; }
.panel-icon-txt { font-size: 16px; }
.panel-time { font-size: 11px; color: var(--text-3); }
.period-tabs { display: flex; gap: 4px; }
.ptab { padding: 3px 10px; font-size: 11px; font-weight: 600; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--text-3); border-radius: 20px; cursor: pointer; transition: all 0.2s; }
.ptab:hover { color: var(--text-2); border-color: rgba(255,255,255,0.2); }
.ptab.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); color: #818cf8; }

/* ===== 响应式 ===== */
@media (max-width: 1100px) {
  .health-metrics-grid { grid-template-columns: repeat(3, 1fr); }
  .health-charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .health-metrics-grid { grid-template-columns: 1fr 1fr; }
  .health-tips-grid { grid-template-columns: 1fr; }
  .health-hero-inner { flex-wrap: wrap; }
  .steps-overview-row { flex-direction: column; align-items: flex-start; }
}
</style>
