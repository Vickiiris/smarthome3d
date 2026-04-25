import { computed } from 'vue'

const ELECTRIC_RATE = 0.558
const WATER_RATE = 2.47
const GAS_RATE = 2.53

export function useEnergyDetail(device, chartData, energyLiveData) {
  const cd = computed(() => chartData?.value || {})
  const eld = computed(() => energyLiveData?.value || {})

  const dailyE = computed(() => (cd.value.energyLine || []).reduce((a, b) => a + b, 0))
  const dailyW = computed(() => eld.value.waterToday || (cd.value.waterBar || []).reduce((a, b) => a + b, 0))
  const dailyG = computed(() => eld.value.gasToday || (cd.value.gasLine || []).reduce((a, b) => a + b, 0))

  const liveElectricCost = computed(() => (dailyE.value * ELECTRIC_RATE).toFixed(3))
  const liveWaterCost = computed(() => (dailyW.value * WATER_RATE).toFixed(3))
  const liveGasCost = computed(() => (dailyG.value * GAS_RATE).toFixed(3))
  const liveTotalCost = computed(() =>
    (dailyE.value * ELECTRIC_RATE + dailyW.value * WATER_RATE + dailyG.value * GAS_RATE).toFixed(3)
  )

  const liveEnergyValue = computed(() => {
    const type = device.value?.energyType
    switch (type) {
      case 'today': return dailyE.value.toFixed(3)
      case 'water': return dailyW.value.toFixed(3)
      case 'gas': return dailyG.value.toFixed(3)
      case 'cost': return (dailyE.value * ELECTRIC_RATE + dailyW.value * WATER_RATE + dailyG.value * GAS_RATE).toFixed(3)
      case 'electricCost': return (dailyE.value * ELECTRIC_RATE).toFixed(3)
      case 'waterCost': return (dailyW.value * WATER_RATE).toFixed(3)
      case 'gasCost': return (dailyG.value * GAS_RATE).toFixed(3)
      default: return device.value?.value ?? '0'
    }
  })

  const monthElectricCost = computed(() => (dailyE.value * ELECTRIC_RATE * 30).toFixed(3))
  const monthWaterCost = computed(() => (dailyW.value * WATER_RATE * 30).toFixed(3))
  const monthGasCost = computed(() => (dailyG.value * GAS_RATE * 30).toFixed(3))
  const monthTotalCost = computed(() =>
    (dailyE.value * ELECTRIC_RATE * 30 + dailyW.value * WATER_RATE * 30 + dailyG.value * GAS_RATE * 30).toFixed(3)
  )

  const isWideModal = computed(() => {
    const id = device.value?.id
    return id === 'energy-cost-total' || id === 'energy-electricCost' || id === 'energy-waterCost' || id === 'energy-gasCost'
  })

  const isCostTypeDual = computed(() => {
    const t = device.value?.energyType
    return t === 'electricCost' || t === 'waterCost' || t === 'gasCost'
  })

  const costTypeTodayValue = computed(() => {
    const t = device.value?.energyType
    if (t === 'electricCost') return liveElectricCost.value
    if (t === 'waterCost') return liveWaterCost.value
    if (t === 'gasCost') return liveGasCost.value
    return '0'
  })

  const costTypeMonthValue = computed(() => {
    const t = device.value?.energyType
    if (t === 'electricCost') return monthElectricCost.value
    if (t === 'waterCost') return monthWaterCost.value
    if (t === 'gasCost') return monthGasCost.value
    return '0'
  })

  const costTypeUnit = computed(() => '元')

  const costTypeTrendUnit = computed(() => {
    const t = device.value?.energyType
    if (t === 'electricCost' || t === 'waterCost' || t === 'gasCost') return '元'
    return device.value?.unit || ''
  })

  const costTypeMonthHistory = computed(() => {
    const t = device.value?.energyType
    let monthVal = 0
    if (t === 'electricCost') monthVal = parseFloat(monthElectricCost.value) || 0
    else if (t === 'waterCost') monthVal = parseFloat(monthWaterCost.value) || 0
    else if (t === 'gasCost') monthVal = parseFloat(monthGasCost.value) || 0
    else monthVal = parseFloat(monthTotalCost.value) || 0
    const maxVal = Math.max(monthVal * 0.92, monthVal * 1.08, monthVal * 0.88, monthVal * 1.03)
    return [
      { label: '上月费用', value: (monthVal * 0.92).toFixed(3), width: ((monthVal * 0.92) / maxVal * 100).toFixed(3), color: '#4fc3f7' },
      { label: '三月均费', value: (monthVal * 1.08).toFixed(3), width: ((monthVal * 1.08) / maxVal * 100).toFixed(3), color: '#81c784' },
      { label: '去年同期', value: (monthVal * 0.88).toFixed(3), width: ((monthVal * 0.88) / maxVal * 100).toFixed(3), color: '#ffd54f' },
      { label: '年度均费', value: (monthVal * 1.03).toFixed(3), width: ((monthVal * 1.03) / maxVal * 100).toFixed(3), color: '#ce93d8' },
    ]
  })

  const historyStats = computed(() => {
    let val = device.value?.value || 0
    const t = device.value?.energyType
    if (t === 'cost') val = parseFloat(liveTotalCost.value) || 0
    else if (t === 'electricCost') val = parseFloat(liveElectricCost.value) || 0
    else if (t === 'waterCost') val = parseFloat(liveWaterCost.value) || 0
    else if (t === 'gasCost') val = parseFloat(liveGasCost.value) || 0
    const maxVal = Math.max(val * 0.95, val * 1.1, val * 0.85, val * 1.05)
    return [
      { label: '昨日总耗', value: (val * 0.95).toFixed(3), width: ((val * 0.95) / maxVal * 100).toFixed(3), color: '#4fc3f7' },
      { label: '七日同比', value: (val * 1.1).toFixed(3), width: ((val * 1.1) / maxVal * 100).toFixed(3), color: '#81c784' },
      { label: '月度同比', value: (val * 0.85).toFixed(3), width: ((val * 0.85) / maxVal * 100).toFixed(3), color: '#ffd54f' },
      { label: '去年同比', value: (val * 1.05).toFixed(3), width: ((val * 1.05) / maxVal * 100).toFixed(3), color: '#ce93d8' },
    ]
  })

  const monthHistoryStats = computed(() => {
    const monthVal = parseFloat(monthTotalCost.value) || 0
    const maxVal = Math.max(monthVal * 0.92, monthVal * 1.08, monthVal * 0.88, monthVal * 1.03)
    return [
      { label: '上月费用', value: (monthVal * 0.92).toFixed(3), width: ((monthVal * 0.92) / maxVal * 100).toFixed(3), color: '#4fc3f7' },
      { label: '三月均费', value: (monthVal * 1.08).toFixed(3), width: ((monthVal * 1.08) / maxVal * 100).toFixed(3), color: '#81c784' },
      { label: '去年同期', value: (monthVal * 0.88).toFixed(3), width: ((monthVal * 0.88) / maxVal * 100).toFixed(3), color: '#ffd54f' },
      { label: '年度均费', value: (monthVal * 1.03).toFixed(3), width: ((monthVal * 1.03) / maxVal * 100).toFixed(3), color: '#ce93d8' },
    ]
  })

  return {
    dailyE, dailyW, dailyG,
    liveElectricCost, liveWaterCost, liveGasCost, liveTotalCost,
    liveEnergyValue,
    monthElectricCost, monthWaterCost, monthGasCost, monthTotalCost,
    isWideModal, isCostTypeDual,
    costTypeTodayValue, costTypeMonthValue, costTypeUnit, costTypeTrendUnit,
    costTypeMonthHistory, historyStats, monthHistoryStats,
    ELECTRIC_RATE, WATER_RATE, GAS_RATE,
  }
}
