import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHomeStore = defineStore('home', () => {
  const stats = ref({
    // 能源
    dailyEnergy: 8.5,
    energyUsage: 2.3,
    totalEnergy: 235,
    savingRate: 18,
    carbonReduction: 12.5,
    // 环境
    temperature: 24,
    humidity: 50,
    outdoorTemp: 32,
    outdoorHumidity: 65,
    co2: 450,
    pm25: 12,
    light: 320,
    // 月度趋势（12个月）
    monthlyEnergy: [42, 38, 45, 51, 47, 53, 49, 55, 48, 52, 46, 50],
    // 房间用电分布
    roomEnergy: [
      { name: '客厅', value: 35, color: '#00d4aa' },
      { name: '主卧', value: 25, color: '#0ea5e9' },
      { name: '次卧', value: 15, color: '#8b5cf6' },
      { name: '厨房', value: 18, color: '#f59e0b' },
      { name: '其他', value: 7,  color: '#6b7280' },
    ]
  })

  return { stats }
})
