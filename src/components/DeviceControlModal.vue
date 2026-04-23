<template>
  <Teleport to="body">
    <Transition name="modal-anim">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="ctrl-modal">
          <div class="modal-top" :style="{ background: iconBg }">
            <div class="m-icon">{{ device?.icon }}</div>
            <div class="m-info">
              <h3 class="m-name">{{ device?.name }}</h3>
              <p class="m-meta">{{ device?.room }}</p>
            </div>
            <button class="m-close" @click="$emit('close')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 电源开关（能源详情不需要） -->
            <div class="ms" v-if="device?.type !== 'energy'">
              <span class="ml">电源</span>
              <div class="btoggle" :class="{ on: localStatus }" @click="toggleStatus">
                <div class="bt"><div class="bt-dot"></div></div>
              </div>
              <span class="mv" :class="{ active: localStatus }">{{ localStatus ? '开启' : '关闭' }}</span>
            </div>

            <template v-if="device?.type === 'light'">
              <div class="ms">
                <span class="ml">亮度</span>
                <span class="mv active">{{ brightness }}%</span>
              </div>
              <div class="prog-wrap">
                <div class="prog-bar">
                  <div class="prog-fill" :style="{ width: brightness + '%' }"></div>
                </div>
                <input type="range" min="0" max="100" v-model="brightness" />
              </div>
              <div class="qb">
                <button v-for="v in [25, 50, 75, 100]" :key="v" class="qb-btn" :class="{ act: brightness === v }" @click="brightness = v">{{ v }}%</button>
              </div>
            </template>

            <template v-if="device?.type === 'ac'">
              <div class="tctrl">
                <button class="tbtn" @click="temperature = Math.max(16, temperature - 1)">−</button>
                <div class="tcenter">
                  <span class="tn">{{ temperature }}</span>
                  <span class="tu">°C</span>
                </div>
                <button class="tbtn" @click="temperature = Math.min(30, temperature + 1)">+</button>
              </div>
              <div class="prog-wrap">
                <div class="prog-bar ac">
                  <div class="prog-fill" :style="{ width: ((temperature - 16) / 14 * 100) + '%' }"></div>
                </div>
                <input type="range" min="16" max="30" v-model="temperature" />
              </div>
              <div class="modes">
                <button v-for="m in ['制冷', '制热', '送风', '自动']" :key="m" class="mode-btn" :class="{ act: acMode === m }" @click="acMode = m">{{ m }}</button>
              </div>
              <div class="ms" style="margin-top:12px">
                <span class="ml">风速</span>
              </div>
              <div class="modes">
                <button v-for="s in ['自动', '低速', '中速', '高速']" :key="s" class="mode-btn" :class="{ act: acFanSpeed === s }" @click="acFanSpeed = s">{{ s }}</button>
              </div>
            </template>

            <template v-if="device?.type === 'sensor'">
              <div class="sensor-status">
                <div class="ss-item">
                  <span class="ss-icon">📡</span>
                  <span class="ss-val" :class="localStatus ? 'ok' : ''">{{ localStatus ? '在线' : '离线' }}</span>
                  <span class="ss-label">状态</span>
                </div>
                <div class="ss-item">
                  <span class="ss-icon">🔔</span>
                  <span class="ss-val" :class="localStatus ? 'ok' : ''">{{ localStatus ? '正常' : '已禁用' }}</span>
                  <span class="ss-label">告警</span>
                </div>
              </div>
            </template>

            <!-- 电视 -->
            <template v-if="device?.type === 'tv'">
              <div class="ms">
                <span class="ml">音量</span>
                <span class="mv active">{{ tvVolume }}%</span>
              </div>
              <div class="prog-wrap">
                <div class="prog-bar">
                  <div class="prog-fill tv" :style="{ width: tvVolume + '%' }"></div>
                </div>
                <input type="range" min="0" max="100" v-model="tvVolume" />
              </div>
              <div class="qb">
                <button v-for="v in [25, 50, 75, 100]" :key="v" class="qb-btn" :class="{ act: tvVolume === v }" @click="tvVolume = v">{{ v }}%</button>
              </div>
              <div class="modes">
                <button v-for="m in ['标准', '电影', '游戏', '运动']" :key="m" class="mode-btn" :class="{ act: tvMode === m }" @click="tvMode = m">{{ m }}</button>
              </div>
            </template>

            <!-- 音箱 -->
            <template v-if="device?.type === 'speaker'">
              <div class="ms">
                <span class="ml">音量</span>
                <span class="mv active">{{ speakerVolume }}%</span>
              </div>
              <div class="prog-wrap">
                <div class="prog-bar">
                  <div class="prog-fill speaker" :style="{ width: speakerVolume + '%' }"></div>
                </div>
                <input type="range" min="0" max="100" v-model="speakerVolume" />
              </div>
              <div class="qb">
                <button v-for="v in [25, 50, 75, 100]" :key="v" class="qb-btn" :class="{ act: speakerVolume === v }" @click="speakerVolume = v">{{ v }}%</button>
              </div>
            </template>

            <!-- 新风系统 -->
            <template v-if="device?.type === 'ventil'">
              <div class="ms">
                <span class="ml">风速</span>
                <span class="mv active">{{ ventilSpeed }}%</span>
              </div>
              <div class="prog-wrap">
                <div class="prog-bar">
                  <div class="prog-fill ventil" :style="{ width: ventilSpeed + '%' }"></div>
                </div>
                <input type="range" min="0" max="100" v-model="ventilSpeed" />
              </div>
              <div class="modes">
                <button v-for="m in ['自动', '低速', '中速', '高速']" :key="m" class="mode-btn" :class="{ act: ventilMode === m }" @click="ventilMode = m">{{ m }}</button>
              </div>
            </template>

            <!-- 洗碗机 -->
            <template v-if="device?.type === 'washer'">
              <div class="sensor-status">
                <div class="ss-item">
                  <span class="ss-icon">🍽️</span>
                  <span class="ss-val" :class="localStatus ? 'ok' : ''">{{ localStatus ? '运行中' : '待机' }}</span>
                  <span class="ss-label">状态</span>
                </div>
                <div class="ss-item">
                  <span class="ss-icon">⏱️</span>
                  <span class="ss-val ok">45 min</span>
                  <span class="ss-label">剩余时间</span>
                </div>
              </div>
              <div class="modes">
                <button v-for="m in ['标准洗', '快速洗', '强力洗', '消毒']" :key="m" class="mode-btn" :class="{ act: washerMode === m }" @click="washerMode = m">{{ m }}</button>
              </div>
            </template>

            <!-- 热水器 -->
            <template v-if="device?.type === 'heater'">
              <div class="tctrl">
                <button class="tbtn" @click="heaterTemp = Math.max(35, heaterTemp - 1)">−</button>
                <div class="tcenter">
                  <span class="tn" style="color:#ff9800">{{ heaterTemp }}</span>
                  <span class="tu">°C</span>
                </div>
                <button class="tbtn" @click="heaterTemp = Math.min(75, heaterTemp + 1)">+</button>
              </div>
              <div class="prog-wrap">
                <div class="prog-bar">
                  <div class="prog-fill heater" :style="{ width: ((heaterTemp - 35) / 40 * 100) + '%' }"></div>
                </div>
                <input type="range" min="35" max="75" v-model="heaterTemp" />
              </div>
              <div class="modes">
                <button v-for="m in ['速热', '保温', '预约', '节能']" :key="m" class="mode-btn" :class="{ act: heaterMode === m }" @click="heaterMode = m">{{ m }}</button>
              </div>
            </template>

            <!-- 能源详情 -->
            <template v-if="device?.type === 'energy'">
              <div class="energy-detail">
                <div class="ed-big">
                  <span class="ed-val">{{ device.value }}</span>
                  <span class="ed-unit">{{ device.id === 'energy-cost' || device.id?.includes('Cost') ? '元' : device.unit }}</span>
                  <span v-if="device.trend" class="ed-trend" :class="device.trend.includes('+') ? 'up' : 'down'">{{ device.trend }}</span>
                </div>
                <p class="ed-desc">{{ device.desc }}</p>
                
                <!-- 各电器明细 -->
                <div class="ed-devices" v-if="device.id?.includes('today') || device.id?.includes('power')">
                  <div class="ed-section-title">🔌 各电器用电明细</div>
                  <div class="ed-device-list">
                    <div v-for="(item, idx) in device._rankList" :key="item.name" class="ed-device-item">
                      <span class="ed-device-name">{{ item.icon }} {{ item.name }}</span>
                      <div class="ed-device-bar"><div class="ed-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                      <span class="ed-device-val">{{ item.val }} {{ item.unit }}</span>
                    </div>
                  </div>
                </div>

                <!-- 用水明细（能耗排行不需要） -->
                <div class="ed-devices" v-if="device.id?.includes('water') && !device.id?.includes('Cost') && !device.id?.includes('rank')">
                  <div class="ed-section-title">🚿 用水明细</div>
                  <div class="ed-device-list">
                    <div v-for="(item, idx) in device._rankList" :key="item.name" class="ed-device-item">
                      <span class="ed-device-name">{{ item.icon }} {{ item.name }}</span>
                      <div class="ed-device-bar"><div class="ed-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                      <span class="ed-device-val">{{ item.val }} {{ item.unit }}</span>
                    </div>
                  </div>
                </div>

                <!-- 燃气明细（能耗排行不需要） -->
                <div class="ed-devices" v-if="device.id?.includes('gas') && !device.id?.includes('Cost') && !device.id?.includes('rank')">
                  <div class="ed-section-title">🔥 燃气使用明细</div>
                  <div class="ed-device-list">
                    <div v-for="(item, idx) in device._rankList" :key="item.name" class="ed-device-item">
                      <span class="ed-device-name">{{ item.icon }} {{ item.name }}</span>
                      <div class="ed-device-bar"><div class="ed-device-fill" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                      <span class="ed-device-val">{{ item.val }} {{ item.unit }}</span>
                    </div>
                  </div>
                </div>

                <!-- 分时段耗能明细 -->
                <div class="ed-periods" v-if="device.periods">
                  <div class="ed-section-title">⏰ 今日分时段耗能</div>
                  <div class="ed-period-list">
                    <div v-for="p in device.periods" :key="p.label" class="ed-period-item">
                      <div class="ed-period-label">{{ p.label }}</div>
                      <div class="ed-period-bar">
                        <div class="ed-period-fill" :style="{ width: p.pct + '%', background: p.color }"></div>
                      </div>
                      <div class="ed-period-val">{{ p.value }} {{ device.unit }}</div>
                    </div>
                  </div>
                </div>

                <!-- 费用明细 -->
                <div class="ed-cost-detail" v-if="device.id?.includes('Cost') || device.id === 'energy-cost'">
                  <div class="ed-section-title">💰 费用明细</div>
                  <div class="ed-cost-list">
                    <!-- 总费用明细：展示电/水/气各项费用 -->
                    <div class="ed-cost-item" v-if="device.id === 'energy-cost'">
                      <div class="ed-cost-row"><span>⚡ 电费 (0.558元/kWh)</span><span>¥{{ liveElectricCost }}</span></div>
                      <div class="ed-cost-row"><span>💧 水费 (2.47元/m³)</span><span>¥{{ liveWaterCost }}</span></div>
                      <div class="ed-cost-row"><span>🔥 燃气费 (2.53元/m³)</span><span>¥{{ liveGasCost }}</span></div>
                      <div class="ed-cost-row total"><span>合计</span><span>¥{{ liveTotalCost }}</span></div>
                    </div>
                    <!-- 电费明细：按电器实际用量比例 -->
                    <div class="ed-cost-item" v-if="device.id?.includes('electric') || (device.id?.endsWith('cost') && !device.id?.includes('water') && !device.id?.includes('gas') && device.id !== 'energy-cost')">
                      <div v-for="item in device._rankList" :key="item.name" class="ed-cost-row">
                        <span>{{ item.icon }} {{ item.name }}</span>
                        <span>¥{{ (item.val * 0.558).toFixed(2) }}</span>
                      </div>
                      <div class="ed-cost-row total"><span>合计</span><span>¥{{ device.value }}</span></div>
                    </div>
                    <!-- 水费明细：按用水实际用量比例 -->
                    <div class="ed-cost-item" v-if="device.id?.includes('waterCost')">
                      <div v-for="item in device._rankList" :key="item.name" class="ed-cost-row">
                        <span>{{ item.icon }} {{ item.name }}</span>
                        <span>¥{{ (item.val * 2.47).toFixed(2) }}</span>
                      </div>
                      <div class="ed-cost-row total"><span>合计</span><span>¥{{ device.value }}</span></div>
                    </div>
                    <!-- 燃气费明细：按燃气实际用量比例 -->
                    <div class="ed-cost-item" v-if="device.id?.includes('gasCost')">
                      <div v-for="item in device._rankList" :key="item.name" class="ed-cost-row">
                        <span>{{ item.icon }} {{ item.name }}</span>
                        <span>¥{{ (item.val * 2.53).toFixed(2) }}</span>
                      </div>
                      <div class="ed-cost-row total"><span>合计</span><span>¥{{ device.value }}</span></div>
                    </div>
                  </div>
                </div>

                <!-- 环保贡献详情 -->
                <div class="ed-carbon-detail" v-if="device.id === 'energy-carbon'">
                  <div class="ed-section-title">🌿 环保贡献明细</div>
                  <div class="ed-carbon-grid">
                    <div class="ed-carbon-item">
                      <div class="ed-carbon-icon">🏭</div>
                      <div class="ed-carbon-val">{{ device.value }}<span class="ed-carbon-unit">kg</span></div>
                      <div class="ed-carbon-label">CO₂ 减排量</div>
                    </div>
                    <div class="ed-carbon-item">
                      <div class="ed-carbon-icon">🌳</div>
                      <div class="ed-carbon-val">{{ Math.floor(device.value / 5) }}<span class="ed-carbon-unit">棵</span></div>
                      <div class="ed-carbon-label">等效植树</div>
                    </div>
                    <div class="ed-carbon-item">
                      <div class="ed-carbon-icon">🚗</div>
                      <div class="ed-carbon-val">{{ (device.value * 8.3).toFixed(0) }}<span class="ed-carbon-unit">km</span></div>
                      <div class="ed-carbon-label">少开车</div>
                    </div>
                    <div class="ed-carbon-item">
                      <div class="ed-carbon-icon">💡</div>
                      <div class="ed-carbon-val">{{ (device.value * 1.5).toFixed(1) }}<span class="ed-carbon-unit">kWh</span></div>
                      <div class="ed-carbon-label">节约电能</div>
                    </div>
                    <div class="ed-carbon-item">
                      <div class="ed-carbon-icon">💧</div>
                      <div class="ed-carbon-val">{{ (device.value * 0.12).toFixed(1) }}<span class="ed-carbon-unit">m³</span></div>
                      <div class="ed-carbon-label">节约用水</div>
                    </div>
                    <div class="ed-carbon-item">
                      <div class="ed-carbon-icon">🔥</div>
                      <div class="ed-carbon-val">{{ (device.value * 0.08).toFixed(1) }}<span class="ed-carbon-unit">m³</span></div>
                      <div class="ed-carbon-label">节约燃气</div>
                    </div>
                  </div>
                  <div class="ed-carbon-summary">
                    <div class="ed-carbon-summary-title">📊 本月节能表现</div>
                    <div class="ed-carbon-summary-row"><span>节能率</span><span class="highlight">{{ device._savingRate ?? 18 }}%</span></div>
                    <div class="ed-carbon-summary-row"><span>月度目标</span><span>30%</span></div>
                    <div class="ed-carbon-summary-row"><span>超越家庭比例</span><span class="highlight">72%</span></div>
                    <div class="ed-carbon-summary-row"><span>连续节能</span><span>14 天</span></div>
                    <div class="ed-carbon-progress">
                      <div class="ed-carbon-progress-bar">
                        <div class="ed-carbon-progress-fill" :style="{ width: Math.min(device._savingRate ?? 18, 100) + '%' }"></div>
                      </div>
                      <div class="ed-carbon-progress-label">距离 30% 目标还差 {{ Math.max(0, 30 - (device._savingRate ?? 18)) }}%</div>
                    </div>
                  </div>
                </div>
                <!-- 历史对比 -->
                <div class="ed-chart">
                  <div class="ed-chart-title">📈 用能趋势对比</div>
                  <div class="ed-bars">
                    <div v-for="(item, index) in historyStats" :key="index" class="ed-bar-item">
                      <div class="ed-bar-label">{{ item.label }}</div>
                      <div class="ed-bar-wrap">
                        <div class="ed-bar" :style="{ width: item.width + '%', background: item.color }"></div>
                      </div>
                      <div class="ed-bar-val">{{ item.value }}{{ device.unit }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, readonly } from 'vue'

const props = defineProps({
  visible: Boolean,
  device: Object,
  chartData: Object,
  energyLiveData: Object
})

const emit = defineEmits(['close', 'toggle', 'update'])

const localStatus = ref(true)
const brightness = ref(80)
const temperature = ref(24)
const acMode = ref('制冷')
const acFanSpeed = ref('自动')
const tvVolume = ref(30)
const tvMode = ref('标准')
const speakerVolume = ref(60)
const ventilSpeed = ref(50)
const ventilMode = ref('自动')
const washerMode = ref('标准洗')
const heaterTemp = ref(55)
const heaterMode = ref('速热')

watch(() => props.device, (d) => {
  if (d) {
    localStatus.value = d.status
    brightness.value = d.value ?? 80
    temperature.value = d.type === 'ac' ? (d.value ?? 24) : 24
    acMode.value = d.mode ?? '制冷'
    acFanSpeed.value = d.fanSpeed ?? '自动'
    tvVolume.value = d.type === 'tv' ? (d.value ?? 30) : 30
    speakerVolume.value = d.type === 'speaker' ? (d.value ?? 60) : 60
    ventilSpeed.value = d.type === 'ventil' ? (d.value ?? 50) : 50
    heaterTemp.value = d.type === 'heater' ? (d.value ?? 55) : 55
  }
}, { immediate: true })

// 统一从 chartData 计算所有数据（与卡片完全同源）
const cd = computed(() => props.chartData?.value || props.chartData || {})

const liveElectricCost = computed(() => {
  const dailyE = (cd.value.energyLine || []).reduce((a, b) => a + b, 0)
  return (dailyE * 0.558).toFixed(2)
})
const liveWaterCost = computed(() => {
  const dailyW = (cd.value.waterBar || []).reduce((a, b) => a + b, 0)
  return (dailyW * 2.47).toFixed(2)
})
const liveGasCost = computed(() => {
  const dailyG = (cd.value.gasLine || []).reduce((a, b) => a + b, 0)
  return (dailyG * 2.53).toFixed(2)
})
const liveTotalCost = computed(() => {
  return (parseFloat(liveElectricCost.value) + parseFloat(liveWaterCost.value) + parseFloat(liveGasCost.value)).toFixed(1)
})

// 历史对比数据（模拟数据，实际应从后端获取）
const historyStats = computed(() => {
  const val = props.device?.value || 0
  // 以最大值为基准计算宽度，确保图表比例合理
  const maxVal = Math.max(val * 0.95, val * 1.1, val * 0.85, val * 1.05)
  
  return [
    { 
      label: '昨日总耗', 
      value: (val * 0.95).toFixed(1),
      width: ((val * 0.95) / maxVal * 100).toFixed(1),
      color: '#4fc3f7' 
    },
    { 
      label: '七日同比', 
      value: (val * 1.1).toFixed(1),
      width: ((val * 1.1) / maxVal * 100).toFixed(1),
      color: '#81c784' 
    },
    { 
      label: '月度同比', 
      value: (val * 0.85).toFixed(1),
      width: ((val * 0.85) / maxVal * 100).toFixed(1),
      color: '#ffd54f' 
    },
    { 
      label: '去年同比', 
      value: (val * 1.05).toFixed(1),
      width: ((val * 1.05) / maxVal * 100).toFixed(1),
      color: '#ce93d8' 
    }
  ]
})

const iconBg = computed(() => {
  const map = {
    light:   'rgba(255, 213, 79, 0.12)',
    ac:      'rgba(79, 195, 247, 0.12)',
    sensor:  'rgba(34, 197, 94, 0.12)',
    tv:      'rgba(167, 139, 250, 0.12)',
    speaker: 'rgba(251, 146, 60, 0.12)',
    ventil:  'rgba(0, 212, 170, 0.12)',
    washer:  'rgba(14, 165, 233, 0.12)',
    heater:  'rgba(239, 68, 68, 0.12)',
  }
  return map[props.device?.type] || 'var(--primary-dim)'
})

function toggleStatus() {
  localStatus.value = !localStatus.value
  emit('toggle', localStatus.value)
  emit('update', {
    ...readonly(props.device),
    status:   localStatus.value,
    value:    props.device?.type === 'ac' ? temperature.value : brightness.value,
    mode:     acMode.value,
    fanSpeed: acFanSpeed.value,
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 5, 12, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.ctrl-modal {
  width: 100%;
  max-width: 360px;
  background: rgba(10, 20, 38, 0.95);
  border: 1px solid var(--border-bright);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
}

.modal-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 16px;
}

.m-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.m-info {
  flex: 1;
  min-width: 0;
}

.m-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.m-meta {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
}

.m-close {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  color: var(--text-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}

.m-close:hover {
  background: var(--danger-dim);
  color: var(--danger);
  border-color: rgba(239,68,68,0.3);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ms {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ml {
  font-size: 13px;
  color: var(--text-2);
  flex: 1;
}

.mv {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-3);
  font-family: var(--font-mono);
}

.mv.active {
  color: var(--primary);
}

.btoggle {
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
}

.btoggle.on {
  background: var(--primary-dim);
  border-color: rgba(0,212,170,0.4);
  box-shadow: 0 0 14px var(--primary-glow);
}

.bt {
  width: 100%;
  height: 100%;
  position: relative;
}

.bt-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-3);
  transition: all var(--transition);
  box-shadow: 0 1px 4px rgba(0,0,0,0.5);
}

.btoggle.on .bt-dot {
  left: calc(100% - 21px);
  background: var(--primary);
  box-shadow: 0 0 10px var(--primary-glow);
}

.prog-wrap {
  position: relative;
  height: 20px;
}

.prog-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
  pointer-events: none;
}

.prog-bar.ac .prog-fill {
  background: linear-gradient(90deg, #4fc3f7, #00d4aa);
}

.prog-fill.tv {
  background: linear-gradient(90deg, #a78bfa, #818cf8);
}

.prog-fill.speaker {
  background: linear-gradient(90deg, #fb923c, #f97316);
}

.prog-fill.ventil {
  background: linear-gradient(90deg, #00d4aa, #0ea5e9);
}

.prog-fill.heater {
  background: linear-gradient(90deg, #ff9800, #ef4444);
}

.prog-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #ffd54f, #ff9800);
  transition: width 0.3s ease;
  box-shadow: 0 0 8px var(--primary-glow);
}

input[type=range] {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  width: 100%;
  opacity: 0;
  height: 20px;
  cursor: pointer;
  margin: 0;
}

.qb {
  display: flex;
  gap: 6px;
}

.qb-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  font-family: system-ui, sans-serif;
}

.qb-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.qb-btn.act {
  background: var(--primary-dim);
  border-color: rgba(0,212,170,0.3);
  color: var(--primary);
}

.tctrl {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: center;
  padding: 8px 0;
}

.tbtn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--border-bright);
  background: var(--surface);
  color: var(--text);
  font-size: 22px;
  cursor: pointer;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
}

.tbtn:hover {
  background: var(--primary-dim);
  color: var(--primary);
  border-color: rgba(0,212,170,0.3);
}

.tcenter {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.tn {
  font-family: var(--font-mono);
  font-size: 38px;
  font-weight: 700;
  color: var(--primary);
  text-shadow: 0 0 20px var(--primary-glow);
}

.tu {
  font-family: var(--font-mono);
  font-size: 18px;
  color: var(--text-2);
}

.modes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mode-btn {
  flex: 1;
  min-width: 60px;
  padding: 8px 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  font-family: system-ui, sans-serif;
  text-align: center;
}

.mode-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.mode-btn.act {
  background: var(--secondary-dim);
  border-color: rgba(14,165,233,0.3);
  color: var(--secondary);
}

.sensor-status {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ss-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px;
  text-align: center;
}

.ss-icon {
  font-size: 18px;
  margin-bottom: 6px;
  display: block;
}

.ss-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-3);
  display: block;
  margin-bottom: 2px;
}

.ss-val.ok {
  color: var(--success);
}

.ss-label {
  font-size: 11px;
  color: var(--text-3);
}

/* 能源详情样式 */
.energy-detail {
  padding: 8px 0;
}
.ed-big {
  text-align: center;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 16px;
}
.ed-val {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1;
}
.ed-unit {
  font-size: 16px;
  color: var(--text-3);
  margin-left: 4px;
}
.ed-trend {
  display: inline-block;
  margin-left: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.ed-trend.up {
  background: rgba(239,68,68,0.15);
  color: #ef4444;
}
.ed-trend.down {
  background: rgba(34,197,94,0.15);
  color: #22c55e;
}
.ed-desc {
  font-size: 13px;
  color: var(--text-3);
  text-align: center;
  margin-bottom: 20px;
}

/* 环保贡献弹窗 */
.ed-carbon-detail {
  background: linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 100%);
  border: 1px solid rgba(34,197,94,0.15);
  border-radius: var(--radius);
  padding: 16px;
  margin-top: 12px;
}
.ed-carbon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}
.ed-carbon-item {
  text-align: center;
  padding: 12px 8px;
  background: rgba(255,255,255,0.03);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(34,197,94,0.1);
}
.ed-carbon-icon { font-size: 22px; margin-bottom: 6px; }
.ed-carbon-val {
  font-size: 20px;
  font-weight: 700;
  color: #22c55e;
  line-height: 1.2;
}
.ed-carbon-unit { font-size: 12px; font-weight: 400; color: var(--text-3); margin-left: 2px; }
.ed-carbon-label { font-size: 11px; color: var(--text-3); margin-top: 4px; }
.ed-carbon-summary {
  margin-top: 16px;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.ed-carbon-summary-title { font-size: 14px; font-weight: 600; color: var(--text-1); margin-bottom: 12px; }
.ed-carbon-summary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: var(--text-2);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ed-carbon-summary-row:last-child { border-bottom: none; }
.ed-carbon-summary-row .highlight { color: #22c55e; font-weight: 600; }
.ed-carbon-progress { margin-top: 12px; }
.ed-carbon-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}
.ed-carbon-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  border-radius: 4px;
  transition: width 0.5s ease;
}
.ed-carbon-progress-label { font-size: 11px; color: var(--text-3); margin-top: 6px; }

.ed-chart {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}
.ed-chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 14px;
}
.ed-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ed-bar-item {
  display: grid;
  grid-template-columns: 50px 1fr 70px;
  align-items: center;
  gap: 12px;
}
.ed-bar-label {
  font-size: 12px;
  color: var(--text-3);
}
.ed-bar-wrap {
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}
.ed-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
.ed-bar-val {
  font-size: 12px;
  color: var(--text-2);
  text-align: right;
  font-weight: 500;
}

/* 设备明细样式 */
.ed-devices {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}
.ed-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 14px;
}
.ed-device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ed-device-item {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 12px;
}
.ed-device-name {
  font-size: 12px;
  color: var(--text-2);
}
.ed-device-bar {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}

/* 分时段耗能样式 */
.ed-periods {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}
.ed-period-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ed-period-item {
  display: grid;
  grid-template-columns: 110px 1fr 60px;
  align-items: center;
  gap: 12px;
}
.ed-period-label {
  font-size: 12px;
  color: var(--text-3);
}
.ed-period-bar {
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}
.ed-period-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
.ed-period-val {
  font-size: 12px;
  color: var(--text-1);
  text-align: right;
  font-weight: 500;
}
.ed-device-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.ed-device-val {
  font-size: 12px;
  color: var(--text-1);
  text-align: right;
  font-weight: 500;
}

/* 费用明细样式 */
.ed-cost-detail {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}
.ed-cost-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ed-cost-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ed-cost-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-2);
}
.ed-cost-row.total {
  padding-top: 10px;
  border-top: 1px solid var(--border);
  font-weight: 600;
  color: var(--text-1);
}
.ed-cost-row.total span:last-child {
  color: #00d4aa;
  font-size: 16px;
}

.modal-anim-enter-active {
  animation: fadeIn 0.22s ease;
}

.modal-anim-leave-active {
  animation: fadeIn 0.18s ease reverse;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>