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
          <span class="panel-time">24h · 平均 {{ avgHeartRate }} 次/分</span>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item">
              <span class="hcm-label">最低</span>
              <span class="hcm-val" style="color:#22c55e">{{ minHeartRate }}</span>
              <span class="hcm-unit">次/分</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">平均</span>
              <span class="hcm-val" style="color:#ff6b6b">{{ avgHeartRate }}</span>
              <span class="hcm-unit">次/分</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">最高</span>
              <span class="hcm-val" style="color:#f59e0b">{{ maxHeartRate }}</span>
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
          <span class="panel-time">本周 · {{ latestBp.sys }}/{{ latestBp.dia }} mmHg</span>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row bp-meta">
            <div class="hchart-meta-item">
              <span class="hcm-label">收缩压</span>
              <span class="hcm-val" style="color:#ff6b6b">{{ latestBp.sys }}</span>
              <span class="hcm-unit">mmHg</span>
            </div>
            <div class="bp-divider">/</div>
            <div class="hchart-meta-item">
              <span class="hcm-label">舒张压</span>
              <span class="hcm-val" style="color:#60a5fa">{{ latestBp.dia }}</span>
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
          <span class="panel-time">24h · 最新 {{ latestSpo2 }}%</span>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item">
              <span class="hcm-label">当前</span>
              <span class="hcm-val" style="color:#60a5fa">{{ latestSpo2 }}</span>
              <span class="hcm-unit">%</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">最低</span>
              <span class="hcm-val" style="color:#94a3b8">{{ minSpo2 }}</span>
              <span class="hcm-unit">%</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">状态</span>
              <span class="hcm-val" :style="{ color: latestSpo2 >= 95 ? '#22c55e' : '#f59e0b' }">{{ latestSpo2 >= 95 ? '正常' : '偏低' }}</span>
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
          <span class="panel-time">24h · 当前 {{ latestTemp }}°C</span>
        </div>
        <div class="hchart-body">
          <div class="hchart-meta-row">
            <div class="hchart-meta-item">
              <span class="hcm-label">当前</span>
              <span class="hcm-val" style="color:#f97316">{{ latestTemp }}</span>
              <span class="hcm-unit">°C</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">最低</span>
              <span class="hcm-val" style="color:#22c55e">{{ minTemp }}</span>
              <span class="hcm-unit">°C</span>
            </div>
            <div class="hchart-meta-item">
              <span class="hcm-label">最高</span>
              <span class="hcm-val" style="color:#f59e0b">{{ maxTemp }}</span>
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
          <span class="panel-time">近 7 天</span>
        </div>
        <div class="hchart-body">
          <div class="steps-overview-row">
            <div class="steps-progress-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" class="steps-ring-bg"/>
                <circle cx="50" cy="50" r="42" class="steps-ring-fill"
                  :stroke-dasharray="`${Math.min(100,(latestSteps/10000)*100)*264/100} 264`"/>
              </svg>
              <div class="steps-ring-inner">
                <div class="steps-ring-pct">{{ Math.round((latestSteps/10000)*100) }}%</div>
                <div class="steps-ring-goal">目标 10000</div>
              </div>
            </div>
            <div class="steps-stats-col">
              <div class="steps-stat-row">
                <span class="ssr-label">今日步数</span>
                <span class="ssr-val">{{ latestSteps.toLocaleString() }}</span>
              </div>
              <div class="steps-stat-row">
                <span class="ssr-label">距目标</span>
                <span class="ssr-val" :style="{ color: latestSteps >= 10000 ? '#00d4aa' : '#f59e0b' }">
                  {{ latestSteps >= 10000 ? '已达标 ✓' : (10000 - latestSteps).toLocaleString() + ' 步' }}
                </span>
              </div>
              <div class="steps-stat-row">
                <span class="ssr-label">消耗热量</span>
                <span class="ssr-val">{{ Math.round(latestSteps * 0.04) }} kcal</span>
              </div>
              <div class="steps-stat-row">
                <span class="ssr-label">行走距离</span>
                <span class="ssr-val">{{ (latestSteps * 0.7 / 1000).toFixed(1) }} km</span>
              </div>
              <div class="steps-stat-row">
                <span class="ssr-label">本周合计</span>
                <span class="ssr-val">{{ (weekTotal / 10000).toFixed(1) }}万步</span>
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
          <span class="panel-time">昨夜 · {{ sleepData.total }}h · 评分 {{ sleepData.score }}</span>
        </div>
        <div class="hchart-body">
          <!-- 睡眠结构：时间轴分段 -->
          <div class="sleep-struct">
            <div class="sleep-struct-header">
              <span class="ss-time">{{ sleepTimeline.start }}</span>
              <span class="ss-label">睡眠结构</span>
              <span class="ss-time">{{ sleepTimeline.end }}</span>
            </div>
            <div class="sleep-struct-track">
              <div class="sleep-struct-seg" v-for="(seg, idx) in sleepTimeline.segments" :key="idx"
                :style="{ width: seg.pct + '%', background: seg.color }"
                :title="seg.name + ' ' + seg.duration">
              </div>
            </div>
            <div class="sleep-struct-legend">
              <div class="ssl-item" v-for="s in sleepStages" :key="s.name">
                <span class="ssl-dot" :style="{ background: s.color }"></span>
                <span class="ssl-name">{{ s.name }}</span>
                <span class="ssl-val">{{ s.h }}h</span>
                <span class="ssl-pct">{{ s.pct }}%</span>
              </div>
            </div>
          </div>
          <!-- 睡眠分析：关键指标 -->
          <div class="sleep-analysis">
            <div class="sa-item" v-for="m in sleepMetrics" :key="m.label">
              <div class="sa-icon" :style="{ color: m.color }">{{ m.icon }}</div>
              <div class="sa-info">
                <div class="sa-label">{{ m.label }}</div>
                <div class="sa-value" :style="{ color: m.color }">{{ m.value }}</div>
              </div>
              <div class="sa-badge" :style="{ background: m.badgeBg, color: m.badgeColor }">{{ m.badge }}</div>
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
  if (!props.heartRateData.length) return 72
  return Math.round(props.heartRateData.reduce((s, v) => s + v.value, 0) / props.heartRateData.length)
})
const minHeartRate = computed(() => props.heartRateData.length ? Math.min(...props.heartRateData.map(v => v.value)) : 58)
const maxHeartRate = computed(() => props.heartRateData.length ? Math.max(...props.heartRateData.map(v => v.value)) : 88)
const minSpo2 = computed(() => props.spo2Trend.length ? Math.min(...props.spo2Trend.map(v => v.value)) : 96)
const minTemp = computed(() => props.tempTrend.length ? Math.min(...props.tempTrend.map(v => v.value)) : 36.0)
const maxTemp = computed(() => props.tempTrend.length ? Math.max(...props.tempTrend.map(v => v.value)) : 36.8)

const sleepStages = computed(() => {
  const { deep, light, rem, awake } = props.sleepData
  const total = deep + light + rem + awake
  return [
    { name: '深睡', h: (deep / 60).toFixed(1), pct: Math.round(deep / total * 100), color: '#7c3aed' },
    { name: '浅睡', h: (light / 60).toFixed(1), pct: Math.round(light / total * 100), color: '#a78bfa' },
    { name: 'REM', h: (rem / 60).toFixed(1), pct: Math.round(rem / total * 100), color: '#60a5fa' },
    { name: '清醒', h: (awake / 60).toFixed(1), pct: Math.round(awake / total * 100), color: '#fbbf24' },
  ]
})

// 睡眠时间轴：模拟从23:00到06:48的睡眠结构
const sleepTimeline = computed(() => {
  const { deep, light, rem, awake } = props.sleepData
  const totalMin = deep + light + rem + awake
  // 按真实睡眠顺序排列的片段（入睡前清醒→浅睡→深睡→浅睡→REM→浅睡→深睡→浅睡→REM→清醒）
  const segments = [
    { name: '清醒', duration: awake, color: '#fbbf24' },
    { name: '浅睡', duration: Math.round(light * 0.4), color: '#a78bfa' },
    { name: '深睡', duration: Math.round(deep * 0.5), color: '#7c3aed' },
    { name: '浅睡', duration: Math.round(light * 0.2), color: '#a78bfa' },
    { name: 'REM', duration: Math.round(rem * 0.5), color: '#60a5fa' },
    { name: '深睡', duration: Math.round(deep * 0.5), color: '#7c3aed' },
    { name: '浅睡', duration: Math.round(light * 0.4), color: '#a78bfa' },
    { name: 'REM', duration: Math.round(rem * 0.5), color: '#60a5fa' },
    { name: '清醒', duration: Math.round(awake * 0.3), color: '#fbbf24' },
  ]
  return {
    start: '23:00',
    end: '06:48',
    segments: segments.map(s => ({
      ...s,
      pct: totalMin > 0 ? Math.max(2, (s.duration / totalMin) * 100) : 0
    }))
  }
})

// 睡眠分析指标
const sleepMetrics = computed(() => {
  const { deep, light, rem, awake, score, total } = props.sleepData
  const totalMin = deep + light + rem + awake
  const deepPct = totalMin > 0 ? Math.round(deep / totalMin * 100) : 0
  const remPct = totalMin > 0 ? Math.round(rem / totalMin * 100) : 0
  const efficiency = totalMin > 0 ? Math.round((totalMin - awake) / totalMin * 100) : 0
  return [
    { icon: '🕐', label: '入睡时间', value: '23:00', color: '#a78bfa', badge: '正常', badgeBg: 'rgba(167,139,250,0.12)', badgeColor: '#a78bfa' },
    { icon: '⏰', label: '醒来时间', value: '06:48', color: '#60a5fa', badge: '正常', badgeBg: 'rgba(96,165,250,0.12)', badgeColor: '#60a5fa' },
    { icon: '💤', label: '深睡比例', value: deepPct + '%', color: deepPct >= 20 ? '#7c3aed' : '#f59e0b', badge: deepPct >= 20 ? '达标' : '偏少', badgeBg: deepPct >= 20 ? 'rgba(124,58,237,0.12)' : 'rgba(245,158,11,0.12)', badgeColor: deepPct >= 20 ? '#7c3aed' : '#f59e0b' },
    { icon: '🧠', label: 'REM比例', value: remPct + '%', color: remPct >= 15 ? '#60a5fa' : '#f59e0b', badge: remPct >= 15 ? '达标' : '偏少', badgeBg: remPct >= 15 ? 'rgba(96,165,250,0.12)' : 'rgba(245,158,11,0.12)', badgeColor: remPct >= 15 ? '#60a5fa' : '#f59e0b' },
    { icon: '⚡', label: '睡眠效率', value: efficiency + '%', color: efficiency >= 85 ? '#00d4aa' : '#f59e0b', badge: efficiency >= 85 ? '良好' : '偏低', badgeBg: efficiency >= 85 ? 'rgba(0,212,170,0.12)' : 'rgba(245,158,11,0.12)', badgeColor: efficiency >= 85 ? '#00d4aa' : '#f59e0b' },
    { icon: '📊', label: '睡眠评分', value: score + '分', color: score >= 85 ? '#00d4aa' : score >= 70 ? '#f59e0b' : '#ef4444', badge: score >= 85 ? '优秀' : score >= 70 ? '一般' : '较差', badgeBg: score >= 85 ? 'rgba(0,212,170,0.12)' : score >= 70 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)', badgeColor: score >= 85 ? '#00d4aa' : score >= 70 ? '#f59e0b' : '#ef4444' },
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
    desc: props.sleepData.score >= 85 ? '近期睡眠质量良好，建议保持 22:30 前入睡' : '睡眠效率偏低，建议睡前减少电子设备使用',
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

function initHeartChart() {
  if (!heartChartRef.value) return
  heartChart = ec.init(heartChartRef.value)
  const times = props.heartRateData.map(v => v.time)
  const vals = props.heartRateData.map(v => v.value)
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

function initBpChart() {
  if (!bpChartRef.value) return
  bpChart = ec.init(bpChartRef.value)
  const days = ['一', '二', '三', '四', '五', '六', '日']
  bpChart.setOption({
    backgroundColor: chartBg,
    tooltip: {
      ...tooltipCfg,
      formatter: (p) => `周${days[p.axisIndex]}<br/><span style="color:#ff6b6b">收缩压 ${props.bpWeekData[p.axisIndex]?.sys ?? '-'} mmHg</span><br/><span style="color:#60a5fa">舒张压 ${props.bpWeekData[p.axisIndex]?.dia ?? '-'} mmHg</span>`
    },
    grid: { ...gridBase },
    legend: {
      data: ['收缩压', '舒张压'],
      top: 0, right: 10,
      textStyle: { color: '#94a3b8', fontSize: 11 },
      itemWidth: 12, itemHeight: 8
    },
    xAxis: { type: 'category', data: days.map(d => '周' + d), ...axisStyle },
    yAxis: { type: 'value', min: 60, max: 160, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisStyle },
    series: [
      {
        name: '收缩压', data: props.bpWeekData.map(v => v.sys), type: 'bar', barWidth: '35%',
        itemStyle: {
          color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ff6b6b' }, { offset: 1, color: 'rgba(255,107,107,0.3)' }]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '舒张压', data: props.bpWeekData.map(v => v.dia), type: 'bar', barWidth: '35%',
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
  const times = props.spo2Trend.map(v => v.time)
  const vals = props.spo2Trend.map(v => v.value)
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
  const times = props.tempTrend.map(v => v.time)
  const vals = props.tempTrend.map(v => v.value)
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
  heartChart.setOption({
    xAxis: { data: props.heartRateData.map(v => v.time) },
    series: [{ data: props.heartRateData.map(v => v.value) }]
  })
}, { deep: true })

watch(() => props.spo2Trend, () => {
  if (!ec || !spo2Chart) return
  spo2Chart.setOption({
    xAxis: { data: props.spo2Trend.map(v => v.time) },
    series: [{ data: props.spo2Trend.map(v => v.value) }]
  })
}, { deep: true })

watch(() => props.tempTrend, () => {
  if (!ec || !tempChart) return
  tempChart.setOption({
    xAxis: { data: props.tempTrend.map(v => v.time) },
    series: [{ data: props.tempTrend.map(v => v.value) }]
  })
}, { deep: true })

watch(() => props.stepsTrend, () => {
  if (!ec || !stepsChart) return
  stepsChart.setOption({
    xAxis: { data: props.stepsTrend.map(v => v.day) },
    series: [{ data: props.stepsTrend.map(v => v.value) }]
  })
}, { deep: true })

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
.ss-label { font-size: 11px; color: var(--text-2); font-weight: 600; }
.sleep-struct-track {
  display: flex; height: 28px; border-radius: 6px; overflow: hidden;
  background: rgba(255,255,255,0.04);
}
.sleep-struct-seg {
  height: 100%; min-width: 2px;
  transition: width 0.4s ease;
  position: relative;
}
.sleep-struct-seg:hover { filter: brightness(1.2); }
.sleep-struct-legend {
  display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap;
}
.ssl-item { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.ssl-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.ssl-name { color: var(--text-2); }
.ssl-val { font-family: var(--font-mono); font-weight: 600; color: var(--text); }
.ssl-pct { color: var(--text-3); margin-left: 1px; }

.sleep-analysis {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.sa-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  transition: background 0.2s;
}
.sa-item:hover { background: rgba(255,255,255,0.06); }
.sa-icon { font-size: 16px; min-width: 20px; text-align: center; }
.sa-info { flex: 1; min-width: 0; }
.sa-label { font-size: 10px; color: var(--text-3); line-height: 1; margin-bottom: 3px; }
.sa-value { font-size: 13px; font-weight: 700; font-family: var(--font-mono); line-height: 1; }
.sa-badge {
  font-size: 9px; padding: 2px 6px; border-radius: 10px;
  white-space: nowrap; font-weight: 600;
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

/* ===== 响应式 ===== */
@media (max-width: 1100px) {
  .health-metrics-grid { grid-template-columns: repeat(3, 1fr); }
  .health-charts-row { grid-template-columns: 1fr; }
  .sleep-analysis { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .health-metrics-grid { grid-template-columns: 1fr 1fr; }
  .health-tips-grid { grid-template-columns: 1fr; }
  .health-hero-inner { flex-wrap: wrap; }
  .steps-overview-row { flex-direction: column; align-items: flex-start; }
  .sleep-analysis { grid-template-columns: 1fr 1fr; }
}
</style>
