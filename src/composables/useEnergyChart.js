import { ref, computed } from 'vue'

export function useEnergyChart(deviceList) {
  // 24小时占比系数
  const ENERGY_KH = [0.02,0.02,0.02,0.02,0.02,0.02,0.03,0.08,0.06,0.04,0.03,0.03,0.06,0.05,0.04,0.03,0.03,0.03,0.12,0.15,0.14,0.11,0.08,0.03]
  const WATER_KH = [0.02,0.02,0.02,0.02,0.02,0.02,0.08,0.12,0.08,0.05,0.03,0.03,0.08,0.06,0.04,0.03,0.03,0.03,0.18,0.22,0.15,0.10,0.08,0.04]
  const GAS_KH   = [0.01,0.01,0.01,0.01,0.01,0.01,0.05,0.08,0.05,0.02,0.02,0.10,0.10,0.05,0.02,0.02,0.05,0.12,0.25,0.28,0.18,0.10,0.04,0.005]
  const DAILY_BASE_ELECTRIC = 7.0
  const DAILY_BASE_WATER = 0.65
  const DAILY_BASE_GAS = 0.30

  let dailyR1_Electric = (Math.random() * 2 - 1), dailyR1_Water = (Math.random() * 2 - 1), dailyR1_Gas = (Math.random() * 2 - 1)
  const genR2 = () => Array.from({length: 24}, () => Math.random() * 2 - 1)
  let hourlyR2_Electric = genR2(), hourlyR2_Water = genR2(), hourlyR2_Gas = genR2()

  function calcEnergyAt(base, r1, kh, r2, minute) {
    return base * (1 + 0.2 * r1) * kh * (1 + 0.2 * r2) * (minute / 60)
  }
  function getCurrentHour() { return new Date().getHours() }
  const hourLabels = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`)

  function generateInitialData() {
    const hour = getCurrentHour(), minute = new Date().getMinutes() + new Date().getSeconds() / 60
    const gen = (base, r1, kh, r2) => Array.from({length: 24}, (_, i) => {
      if (i > hour) return 0
      const m = i < hour ? 60 : minute
      return Math.round(calcEnergyAt(base, r1, kh[i], r2[i], m) * 10000) / 10000
    })
    return { energyLine: gen(DAILY_BASE_ELECTRIC, dailyR1_Electric, ENERGY_KH, hourlyR2_Electric), waterBar: gen(DAILY_BASE_WATER, dailyR1_Water, WATER_KH, hourlyR2_Water), gasLine: gen(DAILY_BASE_GAS, dailyR1_Gas, GAS_KH, hourlyR2_Gas) }
  }

  const initialData = generateInitialData()

  const chartData = ref({
    energyLine: initialData.energyLine,
    energyPie: [{ value: 40, name: '空调', itemStyle: { color: '#4fc3f7' } }, { value: 30, name: '冰箱', itemStyle: { color: '#81c784' } }, { value: 18, name: '照明', itemStyle: { color: '#ffd54f' } }, { value: 12, name: '其他', itemStyle: { color: '#ce93d8' } }],
    waterBar: initialData.waterBar,
    waterPie: [{ value: 48, name: '淋浴', itemStyle: { color: '#4fc3f7', borderRadius: [0,4,4,0] } }, { value: 22, name: '洗衣', itemStyle: { color: '#81c784', borderRadius: [0,4,4,0] } }, { value: 20, name: '厨房', itemStyle: { color: '#ffd54f', borderRadius: [0,4,4,0] } }, { value: 10, name: '其他', itemStyle: { color: '#ce93d8', borderRadius: [0,4,4,0] } }],
    gasLine: initialData.gasLine,
    gasPie: [{ value: 55, name: '热水器', itemStyle: { color: '#ff7043' } }, { value: 35, name: '燃气灶', itemStyle: { color: '#ffa726' } }, { value: 10, name: '壁挂炉', itemStyle: { color: '#ffcc80' } }],
  })

  const energyLiveData = ref({
    get waterToday() { return chartData.value.waterBar.reduce((a, b) => a + b, 0) },
    get gasToday() { return chartData.value.gasLine.reduce((a, b) => a + b, 0) },
    savingRate: 18, totalEnergy: 235, carbonReduction: 12.5,
  })

  const yesterdayEnergy = [0.15,0.12,0.10,0.08,0.12,0.25,0.35,0.42,0.38,0.32,0.28,0.28,0.28,0.28,0.28,0.32,0.38,0.48,0.55,0.52,0.45,0.35,0.25,0.18]
  const yesterdayWater = [0.02,0.01,0.01,0.01,0.02,0.04,0.08,0.10,0.06,0.04,0.03,0.03,0.03,0.03,0.03,0.04,0.06,0.09,0.12,0.10,0.07,0.04,0.02,0.01]
  const yesterdayGas = [0.01,0.01,0.01,0.01,0.01,0.03,0.04,0.05,0.04,0.03,0.02,0.02,0.02,0.02,0.02,0.03,0.04,0.05,0.06,0.06,0.05,0.03,0.02,0.01]

  function makeTrend(v) { return { dir: v >= 0 ? 'up' : 'down', label: (v >= 0 ? '↑ ' : '↓ ') + Math.abs(v).toFixed(1) + '%', raw: v } }
  function calculateTrends(h) {
    const cd = chartData.value
    const ce = cd.energyLine.slice(0, h+1).reduce((a,b)=>a+b,0), cw = cd.waterBar.slice(0, h+1).reduce((a,b)=>a+b,0), cg = cd.gasLine.slice(0, h+1).reduce((a,b)=>a+b,0)
    const ye = yesterdayEnergy.slice(0, h+1).reduce((a,b)=>a+b,0), yw = yesterdayWater.slice(0, h+1).reduce((a,b)=>a+b,0), yg = yesterdayGas.slice(0, h+1).reduce((a,b)=>a+b,0)
    const eT = ye>0?Math.round((ce-ye)/ye*1000)/10:0, wT = yw>0?Math.round((cw-yw)/yw*1000)/10:0, gT = yg>0?Math.round((cg-yg)/yg*1000)/10:0
    const cc = ce*0.558+cw*2.47+cg*2.53, yc = ye*0.558+yw*2.47+yg*2.53, cT = yc>0?Math.round((cc-yc)/yc*1000)/10:0
    return { electric: makeTrend(eT), water: makeTrend(wT), gas: makeTrend(gT), cost: makeTrend(cT) }
  }

  const initialTrends = calculateTrends(getCurrentHour())
  const electricTrend = ref(initialTrends.electric)
  const waterTrend = ref(initialTrends.water)
  const gasTrend = ref(initialTrends.gas)
  const costTrend = ref(initialTrends.cost)

  // 周期
  const electricPeriod = ref('日'), waterPeriod = ref('日'), gasPeriod = ref('日')
  const electricPiePeriod = ref('日'), waterPiePeriod = ref('日'), gasPiePeriod = ref('日')

  // 周/月/年固定数据
  const energyWeekData = { labels: ['周一','周二','周三','周四','周五','周六','周日'], values: [5.2,5.8,5.5,6.2,5.9,6.5,5.6] }
  const energyMonthData = { labels: Array.from({length:30},(_,i)=>`${i+1}日`), values: Array.from({length:30},()=>Math.round((4.5+Math.random()*2.5)*10)/10) }
  const energyYearData = { labels: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], values: [165,158,172,168,175,195,210,225,198,182,170,178] }
  const waterWeekData = { labels: ['周一','周二','周三','周四','周五','周六','周日'], values: [0.55,0.72,0.58,0.80,0.65,0.85,0.62] }
  const waterMonthData = { labels: Array.from({length:30},(_,i)=>`${i+1}日`), values: Array.from({length:30},()=>Math.round((0.4+Math.random()*0.5)*100)/100) }
  const waterYearData = { labels: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], values: [18.5,16.8,19.2,17.5,20.1,22.8,25.5,24.2,21.6,19.8,17.5,18.2] }
  const gasWeekData = { labels: ['周一','周二','周三','周四','周五','周六','周日'], values: [0.32,0.45,0.35,0.48,0.38,0.50,0.42] }
  const gasMonthData = { labels: Array.from({length:30},(_,i)=>`${i+1}日`), values: Array.from({length:30},()=>Math.round((0.25+Math.random()*0.3)*100)/100) }
  const gasYearData = { labels: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], values: [8.5,9.2,7.8,6.5,5.2,4.8,4.2,4.0,4.5,5.8,7.5,8.8] }
  const energyPieWeekData = [{value:42,name:'空调',itemStyle:{color:'#4fc3f7'}},{value:28,name:'冰箱',itemStyle:{color:'#81c784'}},{value:18,name:'照明',itemStyle:{color:'#ffd54f'}},{value:12,name:'其他',itemStyle:{color:'#ce93d8'}}]
  const energyPieMonthData = [{value:40,name:'空调',itemStyle:{color:'#4fc3f7'}},{value:30,name:'冰箱',itemStyle:{color:'#81c784'}},{value:20,name:'照明',itemStyle:{color:'#ffd54f'}},{value:10,name:'其他',itemStyle:{color:'#ce93d8'}}]
  const energyPieYearData = [{value:38,name:'空调',itemStyle:{color:'#4fc3f7'}},{value:32,name:'冰箱',itemStyle:{color:'#81c784'}},{value:18,name:'照明',itemStyle:{color:'#ffd54f'}},{value:12,name:'其他',itemStyle:{color:'#ce93d8'}}]
  const waterPieWeekData = [{value:48,name:'淋浴',itemStyle:{color:'#4fc3f7'}},{value:22,name:'洗衣',itemStyle:{color:'#81c784'}},{value:18,name:'厨房',itemStyle:{color:'#ffd54f'}},{value:12,name:'其他',itemStyle:{color:'#ce93d8'}}]
  const waterPieMonthData = [{value:50,name:'淋浴',itemStyle:{color:'#4fc3f7'}},{value:20,name:'洗衣',itemStyle:{color:'#81c784'}},{value:18,name:'厨房',itemStyle:{color:'#ffd54f'}},{value:12,name:'其他',itemStyle:{color:'#ce93d8'}}]
  const waterPieYearData = [{value:52,name:'淋浴',itemStyle:{color:'#4fc3f7'}},{value:18,name:'洗衣',itemStyle:{color:'#81c784'}},{value:20,name:'厨房',itemStyle:{color:'#ffd54f'}},{value:10,name:'其他',itemStyle:{color:'#ce93d8'}}]
  const gasPieWeekData = [{value:52,name:'热水器',itemStyle:{color:'#ff7043'}},{value:38,name:'燃气灶',itemStyle:{color:'#ffa726'}},{value:10,name:'壁挂炉',itemStyle:{color:'#ffcc80'}}]
  const gasPieMonthData = [{value:50,name:'热水器',itemStyle:{color:'#ff7043'}},{value:40,name:'燃气灶',itemStyle:{color:'#ffa726'}},{value:10,name:'壁挂炉',itemStyle:{color:'#ffcc80'}}]
  const gasPieYearData = [{value:55,name:'热水器',itemStyle:{color:'#ff7043'}},{value:35,name:'燃气灶',itemStyle:{color:'#ffa726'}},{value:10,name:'壁挂炉',itemStyle:{color:'#ffcc80'}}]

  // 排行
  const energyRank = computed(() => {
    const total = chartData.value.energyPie.reduce((a,b)=>a+b.value,0) || 1
    const items = [{name:'空调',color:'#4fc3f7',icon:'❄️',unit:'kWh'},{name:'冰箱',color:'#81c784',icon:'🧊',unit:'kWh'},{name:'照明',color:'#ffd54f',icon:'💡',unit:'kWh'},{name:'其他',color:'#ce93d8',icon:'📺',unit:'kWh'}]
    const dailyTotal = chartData.value.energyLine.reduce((a,b)=>a+b,0)
    return items.map((item,i) => { const pv = chartData.value.energyPie[i]?.value||0; const r = pv/total; return {...item, val: Math.round(dailyTotal*r*100)/100, pct: Math.round(r*100)} }).sort((a,b)=>b.val-a.val)
  })
  const waterRank = computed(() => {
    const total = chartData.value.waterPie.reduce((a,b)=>a+b.value,0) || 1
    const items = [{name:'淋浴',color:'#4fc3f7',icon:'🚿',unit:'m³'},{name:'洗衣',color:'#81c784',icon:'🧺',unit:'m³'},{name:'厨房',color:'#ffd54f',icon:'🍳',unit:'m³'},{name:'其他',color:'#ce93d8',icon:'🚰',unit:'m³'}]
    const dailyTotal = chartData.value.waterBar.reduce((a,b)=>a+b,0)
    return items.map((item,i) => { const pv = chartData.value.waterPie[i]?.value||0; const r = pv/total; return {...item, val: Math.round(dailyTotal*r*1000)/1000, pct: Math.round(r*100)} }).sort((a,b)=>b.val-a.val)
  })
  const gasRank = computed(() => {
    const total = chartData.value.gasPie.reduce((a,b)=>a+b.value,0) || 1
    const items = [{name:'热水器',color:'#ff7043',icon:'🚿',unit:'m³'},{name:'燃气灶',color:'#ffa726',icon:'🔥',unit:'m³'},{name:'壁挂炉',color:'#ffcc80',icon:'🏠',unit:'m³'}]
    const dailyTotal = chartData.value.gasLine.reduce((a,b)=>a+b,0)
    return items.map((item,i) => { const pv = chartData.value.gasPie[i]?.value||0; const r = pv/total; return {...item, val: Math.round(dailyTotal*r*1000)/1000, pct: Math.round(r*100)} }).sort((a,b)=>b.val-a.val)
  })
  const rankTab = ref('electric')
  const currentRankList = computed(() => rankTab.value === 'water' ? waterRank.value : rankTab.value === 'gas' ? gasRank.value : energyRank.value)

  // 能源详情弹窗
  function computeRankPeriods(rankType, itemVal) {
    const defs = {
      electric: [{label:'凌晨',factor:0.15,pct:15,color:'#81c784'},{label:'早晨',factor:0.18,pct:18,color:'#4fc3f7'},{label:'上午',factor:0.12,pct:12,color:'#00d4aa'},{label:'中午',factor:0.08,pct:8,color:'#ffd54f'},{label:'下午',factor:0.15,pct:15,color:'#ce93d8'},{label:'傍晚',factor:0.22,pct:22,color:'#ff7043'},{label:'夜间',factor:0.10,pct:10,color:'#607d8b'}],
      water: [{label:'凌晨',factor:0.05,pct:5,color:'#607d8b'},{label:'早晨',factor:0.20,pct:20,color:'#4fc3f7'},{label:'上午',factor:0.10,pct:10,color:'#00d4aa'},{label:'中午',factor:0.25,pct:25,color:'#ffd54f'},{label:'下午',factor:0.05,pct:5,color:'#ce93d8'},{label:'傍晚',factor:0.30,pct:30,color:'#ff7043'},{label:'夜间',factor:0.05,pct:5,color:'#81c784'}],
      gas: [{label:'凌晨',factor:0.02,pct:2,color:'#607d8b'},{label:'早晨',factor:0.15,pct:15,color:'#ffa726'},{label:'上午',factor:0.08,pct:8,color:'#ffcc80'},{label:'中午',factor:0.10,pct:10,color:'#ffd54f'},{label:'下午',factor:0.05,pct:5,color:'#ce93d8'},{label:'傍晚',factor:0.55,pct:55,color:'#ff7043'},{label:'夜间',factor:0.05,pct:5,color:'#81c784'}],
    }
    const dec = rankType === 'electric' ? 2 : 3
    return (defs[rankType]||[]).map(d => ({label:d.label, value:(itemVal*d.factor).toFixed(dec), pct:d.pct, color:d.color}))
  }

  // 图表实例
  let lineChart=null, pieChart=null, waterChart=null, gasChart=null, waterPieChart=null, gasPieChart=null

  return {
    chartData, energyLiveData,
    electricTrend, waterTrend, gasTrend, costTrend,
    electricPeriod, waterPeriod, gasPeriod, electricPiePeriod, waterPiePeriod, gasPiePeriod,
    energyWeekData, energyMonthData, energyYearData,
    waterWeekData, waterMonthData, waterYearData,
    gasWeekData, gasMonthData, gasYearData,
    energyPieWeekData, energyPieMonthData, energyPieYearData,
    waterPieWeekData, waterPieMonthData, waterPieYearData,
    gasPieWeekData, gasPieMonthData, gasPieYearData,
    energyRank, waterRank, gasRank, rankTab, currentRankList,
    hourLabels, DAILY_BASE_ELECTRIC, DAILY_BASE_WATER, DAILY_BASE_GAS,
    ENERGY_KH, WATER_KH, GAS_KH,
    calcEnergyAt, getCurrentHour, computeRankPeriods, calculateTrends, makeTrend,
    lineChart, pieChart, waterChart, gasChart, waterPieChart, gasPieChart,
    dailyR1_Electric: () => dailyR1_Electric,
    dailyR1_Water: () => dailyR1_Water,
    dailyR1_Gas: () => dailyR1_Gas,
    hourlyR2_Electric: () => hourlyR2_Electric,
    hourlyR2_Water: () => hourlyR2_Water,
    hourlyR2_Gas: () => hourlyR2_Gas,
    resetDailyR1() { dailyR1_Electric = Math.random()*2-1; dailyR1_Water = Math.random()*2-1; dailyR1_Gas = Math.random()*2-1 },
    resetHourlyR2() { hourlyR2_Electric = genR2(); hourlyR2_Water = genR2(); hourlyR2_Gas = genR2() },
  }
}
