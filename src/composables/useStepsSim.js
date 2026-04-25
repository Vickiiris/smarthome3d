// 步数实时模拟系统
const STEP_TARGET_BASE = 10000
const STEP_HOUR_WEIGHTS = [0,0,0,0,0,0,0,0,0.12,0.07,0.06,0.05,0.06,0.05,0.05,0.05,0.05,0.05,0.08,0.12,0.10,0.06,0.05,0.04]

const stepsSim = { dailyTarget: STEP_TARGET_BASE, accumulated: 0, catchUpMode: false, lastHour: -1 }

export function initStepsSimulation(healthItems, stepsTrendData) {
  const now = new Date(), hour = now.getHours(), minute = now.getMinutes()
  stepsSim.dailyTarget = Math.round(STEP_TARGET_BASE * (0.9 + Math.random() * 0.2))
  stepsSim.catchUpMode = false
  stepsSim.lastHour = hour

  const totalHourWeight = STEP_HOUR_WEIGHTS.slice(8, 24).reduce((a, b) => a + b, 0)
  let expectedSteps = 0
  const hourData = []
  for (let h = 8; h <= hour; h++) {
    const weight = STEP_HOUR_WEIGHTS[h] || 0
    const fraction = h === hour ? (minute / 60) : 1
    const targetHourSteps = Math.round(stepsSim.dailyTarget * (weight / totalHourWeight) * fraction)
    const hourIncrement = Math.max(0, Math.round(targetHourSteps * (0.85 + Math.random() * 0.3)))
    expectedSteps += hourIncrement
    hourData.push({ hour: String(h).padStart(2, '0') + ':00', value: hourIncrement })
  }
  stepsSim.accumulated = expectedSteps

  const stepsItem = healthItems.value[5]
  stepsItem.raw = expectedSteps
  stepsItem.value = expectedSteps.toLocaleString() + '步'
  stepsItem.pct = Math.min(100, Math.round((expectedSteps / 10000) * 100))
  stepsItem.trend = 0

  const stepsIdx = stepsTrendData.value.length - 1
  stepsTrendData.value = stepsTrendData.value.map((item, i) => i === stepsIdx ? { ...item, value: expectedSteps, hourData: [...hourData] } : item)
}

export function simulateStepsPerTick(healthItems, stepsTrendData) {
  const now = new Date(), hour = now.getHours(), minute = now.getMinutes(), second = now.getSeconds()

  if (hour === 0 && stepsSim.accumulated > 0 && stepsSim.lastHour >= 22) { initStepsSimulation(healthItems, stepsTrendData); return }

  if (minute === 0 && hour !== stepsSim.lastHour) {
    stepsSim.lastHour = hour
    const expected = stepsSim.dailyTarget * (STEP_HOUR_WEIGHTS.slice(0, hour + 1).reduce((a, b) => a + b, 0))
    stepsSim.catchUpMode = hour < 20 && stepsSim.accumulated < expected * 0.95 && stepsSim.accumulated < stepsSim.dailyTarget
  }

  const totalHourWeight = STEP_HOUR_WEIGHTS.slice(8, 24).reduce((a, b) => a + b, 0)
  const currentHourWeight = STEP_HOUR_WEIGHTS[hour] || 0
  const hourTarget = stepsSim.dailyTarget * (currentHourWeight / totalHourWeight)
  const ticksPerHour = 900
  let addSteps = Math.max(0, Math.round(currentHourWeight > 0 ? (hourTarget / ticksPerHour) * (0.85 + Math.random() * 0.3) : 0))

  if (stepsSim.catchUpMode) {
    const deficit = stepsSim.dailyTarget * 0.9 - stepsSim.accumulated
    const remainingTicks = ((20 - hour) * 60 - minute) * 15 - Math.floor(second / 4)
    if (deficit > 0 && remainingTicks > 0) addSteps += Math.max(0, Math.round(deficit / remainingTicks * 1.5))
  }

  if (!stepsSim.catchUpMode && stepsSim.accumulated >= stepsSim.dailyTarget * 0.9) addSteps = Math.random() > 0.7 ? 1 : 0

  const prev = stepsSim.accumulated
  stepsSim.accumulated = Math.min(Math.round(stepsSim.dailyTarget * 1.2), stepsSim.accumulated + addSteps)
  const actualAdd = stepsSim.accumulated - prev

  const stepsItem = healthItems.value[5]
  stepsItem.raw = stepsSim.accumulated
  stepsItem.value = stepsSim.accumulated.toLocaleString() + '步'
  stepsItem.pct = Math.min(100, Math.round((stepsSim.accumulated / 10000) * 100))
  stepsItem.trend = actualAdd

  const hourLabel = String(hour).padStart(2, '0') + ':00'
  const today = stepsTrendData.value[stepsTrendData.value.length - 1]
  const existingIdx = today.hourData.findIndex(h => h.hour === hourLabel)
  if (existingIdx >= 0) today.hourData[existingIdx].value += actualAdd
  else today.hourData.push({ hour: hourLabel, value: actualAdd })

  const stepsIdx = stepsTrendData.value.length - 1
  stepsTrendData.value = stepsTrendData.value.map((item, i) => i === stepsIdx ? { ...item, value: stepsSim.accumulated, hourData: [...today.hourData] } : item)
}
