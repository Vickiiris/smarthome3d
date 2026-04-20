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

  // ========== Toast 通知系统 ==========
  const toasts = ref([])
  let toastIdCounter = 0

  /**
   * 添加一条 Toast 通知
   * @param {{ message: string, type: 'info'|'success'|'warning'|'danger', duration?: number }} opts
   */
  function addToast(opts) {
    const id = ++toastIdCounter
    const toast = { id, message: opts.message, type: opts.type || 'info', duration: opts.duration ?? 3500 }
    toasts.value.push(toast)
    if (toast.duration > 0) {
      setTimeout(() => removeToast(id), toast.duration)
    }
    return id
  }

  function removeToast(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  // ========== 环境数据实时模拟 ==========
  /**
   * 环境数据实时模拟 —— 随机波动，让数据"活起来"
   * @param {number} strength  波动强度倍数（默认 1）
   * @returns {{ alerts: Array }} 返回触发的告警列表
   */
  function simulateEnvData(strength = 1) {
    const s = stats.value
    const alerts = []

    // 室内温度：围绕 24°C 波动 ±0.3
    s.temperature = Math.round((s.temperature + (Math.random() - 0.5) * 0.6 * strength) * 10) / 10
    s.temperature = Math.max(18, Math.min(35, s.temperature))

    // 室外温度：围绕当前值缓慢漂移
    s.outdoorTemp = Math.round((s.outdoorTemp + (Math.random() - 0.5) * 0.4 * strength) * 10) / 10
    s.outdoorTemp = Math.max(10, Math.min(45, s.outdoorTemp))

    // 湿度
    s.humidity = Math.round(s.humidity + (Math.random() - 0.5) * 2 * strength)
    s.humidity = Math.max(20, Math.min(90, s.humidity))

    s.outdoorHumidity = Math.round(s.outdoorHumidity + (Math.random() - 0.5) * 1.5 * strength)
    s.outdoorHumidity = Math.max(15, Math.min(95, s.outdoorHumidity))

    // CO₂
    s.co2 = Math.round(s.co2 + (Math.random() - 0.5) * 20 * strength)
    s.co2 = Math.max(350, Math.min(2000, s.co2))

    // PM2.5
    s.pm25 = Math.round(s.pm25 + (Math.random() - 0.5) * 3 * strength)
    s.pm25 = Math.max(1, Math.min(300, s.pm25))

    // 光照：白天高、夜间低，模拟日照变化
    const hour = new Date().getHours()
    const baseLight = (hour >= 6 && hour <= 18) ? 350 : 80
    s.light = Math.round(s.light + (Math.random() - 0.5) * 15 * strength + (baseLight - s.light) * 0.02)
    s.light = Math.max(0, Math.min(800, s.light))

    // 能耗缓慢累加
    s.dailyEnergy = Math.round((s.dailyEnergy + Math.random() * 0.05 * strength) * 100) / 100

    // 告警检测
    if (s.temperature > 30) alerts.push({ msg: `室内温度 ${s.temperature}°C，请注意降温`, type: 'warning' })
    if (s.temperature > 32) alerts.push({ msg: `室内温度过高 ${s.temperature}°C`, type: 'danger' })
    if (s.humidity > 75) alerts.push({ msg: `室内湿度 ${s.humidity}%，建议除湿`, type: 'warning' })
    if (s.co2 > 1000) alerts.push({ msg: `CO₂ 浓度 ${s.co2}ppm，建议通风`, type: 'warning' })
    if (s.co2 > 1500) alerts.push({ msg: `CO₂ 浓度严重超标 ${s.co2}ppm`, type: 'danger' })
    if (s.pm25 > 75) alerts.push({ msg: `PM2.5 轻度污染 ${s.pm25}μg/m³`, type: 'warning' })
    if (s.pm25 > 115) alerts.push({ msg: `PM2.5 中度污染 ${s.pm25}μg/m³`, type: 'danger' })

    return { alerts }
  }

  return { stats, toasts, addToast, removeToast, simulateEnvData }
})
