import { ref, computed, watch, onMounted, nextTick } from 'vue'

const AXIS_COLOR = '#94a3b8'
const tooltipCfg = {
  trigger: 'axis',
  backgroundColor: 'rgba(5,13,24,0.97)',
  borderColor: 'rgba(255,255,255,0.12)',
  textStyle: { color: '#e2e8f0', fontSize: 12 },
  axisPointer: { type: 'cross', crossStyle: { color: 'rgba(255,255,255,0.1)' } }
}
const gridBase = { left: '3%', right: '4%', top: '8%', bottom: '8%', containLabel: true }
const axisCfg = {
  axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
  axisTick: { show: false },
  axisLabel: { color: AXIS_COLOR, fontSize: 11 }
}

// 固定数据
const SPO2_W = [97, 98, 96, 97, 98, 97, 98]
const SPO2_M = Array.from({ length: 30 }, (_, i) => 96 + [1,0,2,1,0,1,2,0,1,2,1,0,2,1,0,2,1,0,1,2,0,1,2,0,1,0,2,1,0,2][i])
const TEMP_W = [36.4, 36.3, 36.2, 36.5, 36.3, 36.4, 36.3]
const TEMP_M = Array.from({ length: 30 }, (_, i) => {
  const offsets = [0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2,0.0,0.3,0.1,0.2]
  return parseFloat((36.3 + offsets[i % offsets.length]).toFixed(1))
})
const STEPS_WEEK_FIXED = [7234, 8156, 6890, 9032, 7521, 10234, 6543]
const STEPS_MONTH_FIXED = Array.from({ length: 30 }, () => Math.round(10000 * (0.9 + Math.random() * 0.2)))

export function useHealthCharts(props) {
  const currentHour = () => new Date().getHours()
  const filteredHeartRate = computed(() => props.heartRateData.slice(0, currentHour() + 1))
  const filteredSpo2 = computed(() => props.spo2Trend.slice(0, currentHour() + 1))
  const filteredTemp = computed(() => props.tempTrend.slice(0, currentHour() + 1))

  const periods = ['日', '周', '月']
  const heartPeriod = ref('日')
  const bpPeriod = ref('周')
  const spo2Period = ref('日')
  const tempPeriod = ref('日')
  const stepsPeriod = ref('日')

  // 心率统计
  const currentHeartStats = computed(() => {
    if (heartPeriod.value === '日') {
      const d = filteredHeartRate.value
      if (!d.length) return { avg: 72, min: 58, max: 88 }
      return { avg: Math.round(d.reduce((s, v) => s + v.value, 0) / d.length), min: Math.min(...d.map(v => v.value)), max: Math.max(...d.map(v => v.value)) }
    }
    if (heartPeriod.value === '周') return { avg: 68, min: 55, max: 88 }
    return { avg: 70, min: 52, max: 92 }
  })

  // 血压统计
  const currentBpStats = computed(() => {
    if (bpPeriod.value === '周') {
      const w = props.bpWeekData
      return { sys: w.length ? Math.round(w.reduce((s, v) => s + v.sys, 0) / w.length) : 118, dia: w.length ? Math.round(w.reduce((s, v) => s + v.dia, 0) / w.length) : 76 }
    }
    if (bpPeriod.value === '日') {
      const d = props.bpWeekData; const today = d.length ? d[d.length - 1] : { sys: 118, dia: 76 }
      return { sys: today.sys, dia: today.dia }
    }
    return { sys: 120, dia: 77 }
  })

  // SPO2 统计
  const currentSpo2Stats = computed(() => {
    if (spo2Period.value === '日') {
      const d = filteredSpo2.value
      return { current: d.length ? d[d.length - 1].value : 98, min: d.length ? Math.min(...d.map(v => v.value)) : 96 }
    }
    if (spo2Period.value === '周') return { current: SPO2_W[SPO2_W.length - 1], min: Math.min(...SPO2_W) }
    return { current: SPO2_M[SPO2_M.length - 1], min: Math.min(...SPO2_M) }
  })

  // 体温统计
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
    if (stepsPeriod.value === '日') {
      const today = arr.length ? arr[arr.length - 1] : null
      const hourData = today?.hourData || []
      const totalSteps = today?.value || 0
      const avg = hourData.length ? Math.round(totalSteps / hourData.length) : 0
      return { summary: avg.toLocaleString() + ' 步/时段' }
    }
    if (stepsPeriod.value === '周') {
      const avg = arr.length ? Math.round(arr.reduce((s, v) => s + v.value, 0) / arr.length) : 0
      return { summary: avg.toLocaleString() + ' steps/day' }
    }
    const monthAvg = Math.round(STEPS_MONTH_FIXED.reduce((s, v) => s + v, 0) / STEPS_MONTH_FIXED.length)
    return { summary: monthAvg.toLocaleString() + ' steps/day' }
  })

  // 图表引用
  const heartChartRef = ref(null)
  const bpChartRef = ref(null)
  const spo2ChartRef = ref(null)
  const tempChartRef = ref(null)
  const stepsChartRef = ref(null)

  let ec = null, heartChart = null, bpChart = null, spo2Chart = null, tempChart = null, stepsChart = null

  function mkTooltip(chartData, xKey, unit, color) {
    return {
      ...tooltipCfg,
      formatter: (params) => {
        const p = params[0]; const raw = chartData[p.dataIndex]
        const t = raw?.[xKey] ?? p.axisValueLabel ?? p.name
        return `<div style="font-size:12px;line-height:1.8"><span style="color:${AXIS_COLOR}">${t}</span><br/><span style="color:${color};font-variant-numeric:tabular-nums;font-weight:600">${p.value}${unit}</span></div>`
      }
    }
  }

  function getHeartData(period) {
    if (period === '日') return { data: filteredHeartRate.value, xKey: 'time' }
    if (period === '周') return { data: [{ time: '周一', value: 68 },{ time: '周二', value: 72 },{ time: '周三', value: 65 },{ time: '周四', value: 70 },{ time: '周五', value: 73 },{ time: '周六', value: 69 },{ time: '周日', value: 71 }], xKey: 'time' }
    return { data: Array.from({ length: 30 }, (_, i) => ({ time: (i+1)+'日', value: 62 + [5,8,3,10,6,9,4,7,11,2,8,5,3,9,6,4,10,7,2,8,5,3,9,6,4,10,7,2,5,8][i] })), xKey: 'time' }
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
    if (period === '月') return { data: STEPS_MONTH_FIXED.map((v, i) => ({ time: (i + 1) + '日', value: v })), xKey: 'time' }
    return { data: ['周一','周二','周三','周四','周五','周六','周日'].map((d, i) => ({ time: d, value: STEPS_WEEK_FIXED[i] })), xKey: 'time' }
  }
  function getBpData(period) {
    if (period === '日') { const w = props.bpWeekData; const t = w.length ? w[w.length - 1] : { sys: 118, dia: 76 }; return { labels: ['今日'], sysData: [t.sys], diaData: [t.dia] } }
    if (period === '月') return { labels: ['1日','5日','10日','15日','20日','25日','30日'], sysData: [118,122,115,120,117,123,116], diaData: [76,80,74,78,75,82,77] }
    return { labels: ['周一','周二','周三','周四','周五','周六','周日'], sysData: props.bpWeekData.map(v => v.sys), diaData: props.bpWeekData.map(v => v.dia) }
  }

  function initChart(chartRef, initFn) { if (chartRef) initFn() }

  function initHeartChart() {
    if (!heartChartRef.value) return; heartChart = ec.init(heartChartRef.value)
    const { data, xKey } = getHeartData(heartPeriod.value)
    heartChart.setOption({ backgroundColor: 'transparent', tooltip: mkTooltip(data, xKey, ' bpm', '#ff6b6b'), grid: { ...gridBase }, xAxis: { type: 'category', data: data.map(v => v[xKey]), boundaryGap: false, splitLine: { show: false }, ...axisCfg }, yAxis: { type: 'value', min: 50, max: 110, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg }, series: [{ data: data.map(v => v.value), type: 'line', smooth: 0.4, lineStyle: { color: '#ff6b6b', width: 2.5 }, areaStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,107,0.3)' }, { offset: 1, color: 'rgba(255,107,107,0)' }]) }, symbol: 'circle', symbolSize: 5, itemStyle: { color: '#ff6b6b' }, markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(255,107,107,0.4)', type: 'dashed', width: 1 }, data: [{ yAxis: 100, label: { formatter: '上限 100', color: 'rgba(255,107,107,0.6)', fontSize: 10 } }] } }] })
  }
  function initBpChart() {
    if (!bpChartRef.value) return; bpChart = ec.init(bpChartRef.value)
    const d = getBpData(bpPeriod.value)
    bpChart.setOption({ backgroundColor: 'transparent', tooltip: { ...tooltipCfg, formatter: (params) => { const p = params[0]; const dd = getBpData(bpPeriod.value); const idx = (bpPeriod.value === '日' || !dd.labels.length) ? 0 : Math.min(p.dataIndex, dd.labels.length - 1); return `<div style="font-size:12px;line-height:1.8"><span style="color:${AXIS_COLOR}">${dd.labels[idx]}</span><br/><span style="color:#ff6b6b;font-weight:600">收缩压 ${dd.sysData[idx]} mmHg</span><br/><span style="color:#60a5fa;font-weight:600">舒张压 ${dd.diaData[idx]} mmHg</span></div>` } }, grid: { ...gridBase }, legend: { data: ['收缩压','舒张压'], top: 0, right: 10, textStyle: { color: AXIS_COLOR, fontSize: 11 }, itemWidth: 12, itemHeight: 8 }, xAxis: { type: 'category', data: d.labels, ...axisCfg }, yAxis: { type: 'value', min: 60, max: 160, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg }, series: [{ name: '收缩压', data: d.sysData, type: 'bar', barWidth: '35%', itemStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ff6b6b' }, { offset: 1, color: 'rgba(255,107,107,0.3)' }]), borderRadius: [4,4,0,0] } }, { name: '舒张压', data: d.diaData, type: 'bar', barWidth: '35%', itemStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: 'rgba(96,165,250,0.3)' }]), borderRadius: [4,4,0,0] } }] })
  }
  function initSpo2Chart() {
    if (!spo2ChartRef.value) return; spo2Chart = ec.init(spo2ChartRef.value)
    const { data, xKey } = getSpo2Data(spo2Period.value)
    spo2Chart.setOption({ backgroundColor: 'transparent', tooltip: mkTooltip(data, xKey, '%', '#60a5fa'), grid: { ...gridBase }, xAxis: { type: 'category', data: data.map(v => v[xKey]), boundaryGap: false, splitLine: { show: false }, ...axisCfg }, yAxis: { type: 'value', min: 90, max: 100, splitNumber: 4, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg }, series: [{ data: data.map(v => v.value), type: 'line', smooth: 0.5, lineStyle: { color: '#60a5fa', width: 2.5 }, areaStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(96,165,250,0.3)' }, { offset: 1, color: 'rgba(96,165,250,0)' }]) }, symbol: 'circle', symbolSize: 4, itemStyle: { color: '#60a5fa' }, markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(96,165,250,0.5)', type: 'dashed', width: 1.5 }, data: [{ yAxis: 95, label: { formatter: '95%', color: 'rgba(96,165,250,0.7)', fontSize: 10 } }] } }] })
  }
  function initTempChart() {
    if (!tempChartRef.value) return; tempChart = ec.init(tempChartRef.value)
    const { data, xKey } = getTempData(tempPeriod.value)
    tempChart.setOption({ backgroundColor: 'transparent', tooltip: mkTooltip(data, xKey, '°C', '#f97316'), grid: { ...gridBase }, xAxis: { type: 'category', data: data.map(v => v[xKey]), boundaryGap: false, splitLine: { show: false }, ...axisCfg }, yAxis: { type: 'value', min: 35.5, max: 37.8, splitNumber: 3, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg }, series: [{ data: data.map(v => v.value), type: 'line', smooth: 0.5, lineStyle: { color: '#f97316', width: 2.5 }, areaStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(249,115,22,0.3)' }, { offset: 1, color: 'rgba(249,115,22,0)' }]) }, symbol: 'circle', symbolSize: 4, itemStyle: { color: '#f97316' }, markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(249,115,22,0.5)', type: 'dashed', width: 1.5 }, data: [{ yAxis: 37.2, label: { formatter: '37.2°', color: 'rgba(249,115,22,0.7)', fontSize: 10 } }, { yAxis: 36.1, label: { formatter: '36.1°', color: 'rgba(34,197,94,0.7)', fontSize: 10 } }] } }] })
  }
  function initStepsChart() {
    if (!stepsChartRef.value) return; stepsChart = ec.init(stepsChartRef.value)
    const { data, xKey } = getStepsData(stepsPeriod.value)
    stepsChart.setOption({ backgroundColor: 'transparent', tooltip: mkTooltip(data, xKey, ' 步', '#00d4aa'), grid: { ...gridBase, left: '2%', right: '4%' }, xAxis: { type: 'category', data: data.map(v => v[xKey]), ...axisCfg }, yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, ...axisCfg }, series: [{ data: data.map(v => v.value), type: 'bar', barWidth: '55%', itemStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#34d399' }, { offset: 1, color: 'rgba(52,211,153,0.3)' }]), borderRadius: [3,3,0,0] }, markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(0,212,170,0.5)', type: 'dashed', width: 1.5 }, data: [{ yAxis: 10000, label: { formatter: '目标 10000', color: 'rgba(0,212,170,0.7)', fontSize: 10 } }] } }] })
  }

  function updateChart(chart, getData, period, extra) {
    if (!chart) return
    const { data, xKey } = getData(period)
    chart.setOption({ xAxis: { data: data.map(v => v[xKey]) }, series: [{ data: data.map(v => v.value), ...extra }], tooltip: mkTooltip(data, xKey, extra?._unit || '', extra?._color || '#fff') })
  }

  function updateHeartChart() { if (heartChart) { const { data, xKey } = getHeartData(heartPeriod.value); heartChart.setOption({ xAxis: { data: data.map(v => v[xKey]) }, series: [{ data: data.map(v => v.value) }], tooltip: mkTooltip(data, xKey, ' bpm', '#ff6b6b') }) } }
  function updateBpChart() {
    if (!bpChart) return; const d = getBpData(bpPeriod.value)
    bpChart.setOption({ xAxis: { data: d.labels }, series: [{ name: '收缩压', data: d.sysData }, { name: '舒张压', data: d.diaData }], tooltip: { ...tooltipCfg, formatter: (params) => { const p = params[0]; const dd = getBpData(bpPeriod.value); const idx = (bpPeriod.value === '日' || !dd.labels.length) ? 0 : Math.min(p.dataIndex, dd.labels.length - 1); return `<div style="font-size:12px;line-height:1.8"><span style="color:${AXIS_COLOR}">${dd.labels[idx]}</span><br/><span style="color:#ff6b6b;font-weight:600">收缩压 ${dd.sysData[idx]} mmHg</span><br/><span style="color:#60a5fa;font-weight:600">舒张压 ${dd.diaData[idx]} mmHg</span></div>` } } })
  }
  function updateSpo2Chart() { if (spo2Chart) { const { data, xKey } = getSpo2Data(spo2Period.value); spo2Chart.setOption({ xAxis: { data: data.map(v => v[xKey]) }, series: [{ data: data.map(v => v.value) }], tooltip: mkTooltip(data, xKey, '%', '#60a5fa') }) } }
  function updateTempChart() { if (tempChart) { const { data, xKey } = getTempData(tempPeriod.value); tempChart.setOption({ xAxis: { data: data.map(v => v[xKey]) }, series: [{ data: data.map(v => v.value) }], tooltip: mkTooltip(data, xKey, '°C', '#f97316') }) } }
  function updateStepsChart() {
    if (!stepsChart) return; const { data, xKey } = getStepsData(stepsPeriod.value)
    stepsChart.setOption({ xAxis: { data: data.map(v => v[xKey]) }, series: [{ data: data.map(v => v.value), type: 'bar', barWidth: '55%', itemStyle: { color: new ec.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#34d399' }, { offset: 1, color: 'rgba(52,211,153,0.3)' }]), borderRadius: [3,3,0,0] }, markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(0,212,170,0.5)', type: 'dashed', width: 1.5 }, data: [{ yAxis: 10000, label: { formatter: '目标 10000', color: 'rgba(0,212,170,0.7)', fontSize: 10 } }] } }], tooltip: mkTooltip(data, xKey, ' 步', '#00d4aa') })
  }

  async function initAllCharts() {
    if (!props.visible) return
    ec = await import('echarts')
    await nextTick()
    initHeartChart(); initBpChart(); initSpo2Chart(); initTempChart(); initStepsChart()
  }

  function resizeCharts() { heartChart?.resize(); bpChart?.resize(); spo2Chart?.resize(); tempChart?.resize(); stepsChart?.resize() }

  watch(() => props.visible, async (v) => { if (v) { await nextTick(); if (!ec) await initAllCharts(); else resizeCharts() } }, { immediate: true })
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
    if (props.visible && !ec) { await nextTick(); await initAllCharts() }
  })

  return {
    periods, heartPeriod, bpPeriod, spo2Period, tempPeriod, stepsPeriod,
    currentHeartStats, currentBpStats, currentSpo2Stats, currentTempStats,
    todaySteps, currentStepsStats,
    heartChartRef, bpChartRef, spo2ChartRef, tempChartRef, stepsChartRef,
  }
}
