<template>
  <Teleport to="body">
    <Transition name="slide-panel">
      <div v-if="visible" class="dcp-wrap">
        <div class="dcp-panel" @click.stop>

          <!-- 头部 -->
          <div class="dcp-header">
            <div class="dcp-header-icon">{{ deviceIcon }}</div>
            <div class="dcp-header-info">
              <h3 class="dcp-name">{{ device?.name }}</h3>
              <span class="dcp-online" :style="{ color: device?.online !== false ? '#22c55e' : '#94a3b8' }">
                ● {{ device?.online !== false ? '在线' : '离线' }}
              </span>
            </div>
            <button class="dcp-close" @click="close">✕</button>
          </div>

          <!-- 基础信息 grid -->
          <div class="dcp-body">
            <div class="dcp-grid dcp-info-grid">
              <div class="dcp-dd-item">
                <span class="dcp-dd-label">安装位置</span>
                <span class="dcp-dd-value">{{ device?.room || '—' }}</span>
              </div>
              <div class="dcp-dd-item">
                <span class="dcp-dd-label">设备厂商</span>
                <span class="dcp-dd-value">{{ device?.vendor || '—' }}</span>
              </div>
              <div class="dcp-dd-item">
                <span class="dcp-dd-label">设备类型</span>
                <span class="dcp-dd-value">{{ deviceTypeLabel }}</span>
              </div>
              <div class="dcp-dd-item">
                <span class="dcp-dd-label">IP 地址</span>
                <span class="dcp-dd-value mono">{{ device?.ip || '—' }}</span>
              </div>
            </div>

            <!-- 主开关 -->
            <div class="dcp-section">
              <div class="dcp-section-title">⚡ 电源控制</div>
              <div class="dcp-switch-row">
                <span class="dcp-switch-label">{{ localStatus ? '设备已开启' : '设备已关闭' }}</span>
                <div class="dcp-toggle" @click="togglePower">
                  <div class="dcp-toggle-track" :class="{ on: localStatus }">
                    <div class="dcp-toggle-thumb"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空调控制 -->
            <template v-if="device?.type === 'ac' && localStatus">
              <div class="dcp-section">
                <div class="dcp-section-title">🌡 温度设置</div>
                <div class="dcp-temp-row">
                  <button class="dcp-temp-btn" @click="adjustTemp(-1)">−</button>
                  <div class="dcp-temp-display">
                    <span class="dcp-temp-val">{{ localValue }}</span>
                    <span class="dcp-temp-unit">°C</span>
                  </div>
                  <button class="dcp-temp-btn" @click="adjustTemp(1)">+</button>
                </div>
              </div>
              <div class="dcp-section">
                <div class="dcp-section-title">🔄 运行模式</div>
                <div class="dcp-mode-grid">
                  <button
                    v-for="mode in acModes"
                    :key="mode.value"
                    class="dcp-mode-btn"
                    :class="{ active: localMode === mode.value }"
                    @click="setMode(mode.value)"
                  >
                    <span>{{ mode.icon }}</span>
                    <span>{{ mode.label }}</span>
                  </button>
                </div>
              </div>
              <div class="dcp-section">
                <div class="dcp-section-title">💨 风速调节</div>
                <div class="dcp-fan-row">
                  <button
                    v-for="speed in fanSpeeds"
                    :key="speed.value"
                    class="dcp-fan-btn"
                    :class="{ active: localFanSpeed === speed.value }"
                    @click="localFanSpeed = speed.value; emitUpdate()"
                  >{{ speed.label }}</button>
                </div>
              </div>
            </template>

            <!-- 灯光控制 -->
            <template v-else-if="device?.type === 'light' && localStatus">
              <div class="dcp-section">
                <div class="dcp-section-title">☀️ 亮度调节</div>
                <input
                  type="range"
                  class="dcp-slider"
                  v-model.number="localValue"
                  @input="emitUpdate"
                  min="0" max="100"
                />
                <div class="dcp-slider-labels">
                  <span>0%</span>
                  <span class="dcp-slider-cur">{{ localValue }}%</span>
                  <span>100%</span>
                </div>
              </div>
              <div class="dcp-section">
                <div class="dcp-section-title">🎬 快捷场景</div>
                <div class="dcp-scene-grid">
                  <button class="dcp-scene-btn" @click="setBrightness(100)">全亮</button>
                  <button class="dcp-scene-btn" @click="setBrightness(70)">日常</button>
                  <button class="dcp-scene-btn" @click="setBrightness(30)">夜灯</button>
                  <button class="dcp-scene-btn" @click="setBrightness(0)">关闭</button>
                </div>
              </div>
            </template>

            <!-- 插座控制 -->
            <template v-else-if="device?.type === 'outlet' && localStatus">
              <div class="dcp-section">
                <div class="dcp-section-title">📊 用电计量</div>
                <div class="dcp-grid">
                  <div class="dcp-dd-item">
                    <span class="dcp-dd-label">当前功率</span>
                    <span class="dcp-dd-value mono">{{ powerData.current }} W</span>
                  </div>
                  <div class="dcp-dd-item">
                    <span class="dcp-dd-label">今日用电</span>
                    <span class="dcp-dd-value mono">{{ powerData.today }} kWh</span>
                  </div>
                  <div class="dcp-dd-item">
                    <span class="dcp-dd-label">本月用电</span>
                    <span class="dcp-dd-value mono">{{ powerData.month }} kWh</span>
                  </div>
                  <div class="dcp-dd-item">
                    <span class="dcp-dd-label">累计用电</span>
                    <span class="dcp-dd-value mono">{{ powerData.total }} kWh</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 设备说明 -->
            <div class="dcp-section">
              <div class="dcp-section-title">📋 设备说明</div>
              <p class="dcp-desc">{{ deviceDesc }}</p>
            </div>

            <!-- 使用建议 -->
            <div class="dcp-section dcp-tips">
              <div class="dcp-section-title">💡 使用建议</div>
              <p class="dcp-desc">{{ deviceTips }}</p>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  device: Object,
})
const emit = defineEmits(['close', 'update'])

const localValue = ref(24)
const localStatus = ref(true)
const localMode = ref('cool')
const localFanSpeed = ref('auto')

const acModes = [
  { value: 'cool', label: '制冷', icon: '❄️' },
  { value: 'heat', label: '制热', icon: '🔥' },
  { value: 'auto', label: '自动', icon: '🔄' },
  { value: 'fan',  label: '送风', icon: '💨' },
]
const fanSpeeds = [
  { value: 'low',    label: '低速' },
  { value: 'medium', label: '中速' },
  { value: 'high',   label: '高速' },
  { value: 'auto',   label: '自动' },
]

const deviceIcon = computed(() => {
  const m = { ac:'❄️', light:'💡', tv:'📺', outlet:'🔌', sensor:'📡', security:'🔒', ventil:'🌀' }
  return m[props.device?.type] || '📱'
})

const deviceTypeLabel = computed(() => {
  const m = { ac:'空调', light:'照明', tv:'电视', outlet:'插座', sensor:'传感器', security:'安防', ventil:'新风' }
  return m[props.device?.type] || '智能设备'
})

const deviceDesc = computed(() => {
  const m = {
    ac:     '变频空调，支持制冷/制热/送风多种模式，可精确调节室内温度，配合新风系统使用效果更佳。',
    light:  '智能照明设备，支持亮度调节与场景联动，可通过语音或 App 远程控制。',
    outlet: '智能插座，支持远程开关控制与实时用电计量，可设置定时和过载保护。',
    tv:     '智能电视，支持 4K 超高清显示，内置流媒体应用，可与音箱联动实现家庭影院效果。',
    sensor: '智能传感器设备，支持实时状态监测和异常告警。',
  }
  return m[props.device?.type] || '智能家居设备，支持远程控制与状态监测。'
})

const deviceTips = computed(() => {
  const m = {
    ac:     '建议夏季设定 26°C，冬季 20°C，配合定时功能节省电费；定期清洗滤网保持制冷效果。',
    light:  '建议根据时段设置不同亮度场景，睡前调低亮度有助于改善睡眠质量。',
    outlet: '建议定期查看用电数据，发现异常功率及时排查；避免长期满负荷运行。',
    tv:     '建议开启护眼模式，观看时间不宜过长；定期清理缓存保持系统流畅。',
    sensor: '建议定期检查设备电量，确保传感器正常工作；异常告警请及时处理。',
  }
  return m[props.device?.type] || '定期检查设备状态，如有异常请及时联系售后服务。'
})

const powerData = computed(() => {
  const seed = props.device?.id === 'ac-outlet-a' ? 1 : props.device?.id === 'ac-outlet-b' ? 2 : 3
  return {
    current: (seed * 23 + 12).toFixed(0),
    today:   (seed * 0.4 + 0.3).toFixed(1),
    month:   (seed * 9.8 + 5.2).toFixed(1),
    total:   (seed * 42.6 + 18.3).toFixed(1),
  }
})

watch(() => props.device, (d) => {
  if (!d) return
  localValue.value    = d.value    ?? (d.type === 'ac' ? 24 : 80)
  localStatus.value   = d.status   ?? true
  localMode.value     = d.mode     ?? 'cool'
  localFanSpeed.value = d.fanSpeed ?? 'auto'
}, { immediate: true })

function adjustTemp(delta) {
  localValue.value = Math.max(16, Math.min(30, localValue.value + delta))
  emitUpdate()
}
function setMode(m) { localMode.value = m; emitUpdate() }
function setBrightness(v) {
  localValue.value = v
  if (v === 0) localStatus.value = false
  emitUpdate()
}
function togglePower() { localStatus.value = !localStatus.value; emitUpdate() }
function emitUpdate() {
  emit('update', { ...props.device, value: localValue.value, status: localStatus.value, mode: localMode.value, fanSpeed: localFanSpeed.value })
}
function close() { emit('close') }
</script>

<style scoped>
/* 整体容器 - 透传点击到 3D 场景 */
.dcp-wrap {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 20px;
}

/* 面板本体 */
.dcp-panel {
  width: 320px;
  max-height: 80vh;
  background: rgba(10, 18, 35, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
  pointer-events: auto;
  overflow: hidden;
}

/* 头部 - 与 env-detail-header 一致 */
.dcp-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(5,13,24,0.9), rgba(10,18,35,0.8));
  border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
  flex-shrink: 0;
}

.dcp-header-icon { font-size: 36px; }

.dcp-header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dcp-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-2, #e2e8f0);
}

.dcp-online {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.dcp-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 50%;
  color: var(--text-2, #e2e8f0);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.dcp-close:hover {
  background: rgba(239,68,68,0.15);
  border-color: rgba(239,68,68,0.3);
  color: #ef4444;
}

/* 内容区 */
.dcp-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 信息 grid - 与 device-detail-grid 一致 */
.dcp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.dcp-dd-item {
  padding: 12px 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dcp-dd-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary, #00d4aa);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dcp-dd-value {
  font-size: 12px;
  color: var(--text-2, #e2e8f0);
  line-height: 1.5;
}

.dcp-dd-value.mono {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--text, #e2e8f0);
}

/* section - 与 env-detail-section 一致 */
.dcp-section {
  padding: 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 8px;
}

.dcp-section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary, #00d4aa);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dcp-tips {
  background: rgba(0,212,170,0.05);
  border-color: rgba(0,212,170,0.15);
}

.dcp-desc {
  font-size: 12px;
  color: var(--text-2, #94a3b8);
  line-height: 1.7;
  margin: 0;
}

/* 开关行 */
.dcp-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dcp-switch-label {
  font-size: 13px;
  color: var(--text-2, #e2e8f0);
}

.dcp-toggle { cursor: pointer; }

.dcp-toggle-track {
  width: 48px;
  height: 26px;
  background: rgba(255,255,255,0.1);
  border-radius: 13px;
  position: relative;
  transition: background 0.3s;
}
.dcp-toggle-track.on { background: rgba(0,212,170,0.25); }

.dcp-toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: #64748b;
  border-radius: 50%;
  transition: all 0.3s;
}
.dcp-toggle-track.on .dcp-toggle-thumb {
  left: 25px;
  background: #00d4aa;
  box-shadow: 0 0 10px rgba(0,212,170,0.5);
}

/* 温度控制 */
.dcp-temp-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.dcp-temp-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,212,170,0.08);
  border: 1px solid rgba(0,212,170,0.2);
  border-radius: 50%;
  color: #00d4aa;
  font-size: 22px;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s;
}
.dcp-temp-btn:hover {
  background: rgba(0,212,170,0.18);
  transform: scale(1.05);
}

.dcp-temp-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.dcp-temp-val {
  font-size: 48px;
  font-weight: 600;
  color: var(--text, #e2e8f0);
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.dcp-temp-unit {
  font-size: 18px;
  color: #64748b;
}

/* 模式 */
.dcp-mode-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.dcp-mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 8px;
  color: #94a3b8;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}
.dcp-mode-btn:hover { background: rgba(255,255,255,0.05); }
.dcp-mode-btn.active {
  background: rgba(0,212,170,0.1);
  border-color: rgba(0,212,170,0.3);
  color: #00d4aa;
}

/* 风速 */
.dcp-fan-row {
  display: flex;
  gap: 8px;
}

.dcp-fan-btn {
  flex: 1;
  padding: 10px 4px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 8px;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.dcp-fan-btn:hover { background: rgba(255,255,255,0.05); }
.dcp-fan-btn.active {
  background: rgba(0,212,170,0.1);
  border-color: rgba(0,212,170,0.3);
  color: #00d4aa;
}

/* 亮度滑条 */
.dcp-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  outline: none;
  margin-bottom: 8px;
}
.dcp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #00d4aa;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(0,212,170,0.4);
}

.dcp-slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
}

.dcp-slider-cur {
  color: var(--text, #e2e8f0);
  font-weight: 600;
}

/* 场景 */
.dcp-scene-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.dcp-scene-btn {
  padding: 10px 4px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 8px;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.dcp-scene-btn:hover {
  background: rgba(0,212,170,0.08);
  border-color: rgba(0,212,170,0.2);
  color: #00d4aa;
}

/* 动画 */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity 0.25s ease;
}
.slide-panel-enter-active .dcp-panel,
.slide-panel-leave-active .dcp-panel {
  transition: transform 0.25s ease;
}
.slide-panel-enter-from,
.slide-panel-leave-to { opacity: 0; }
.slide-panel-enter-from .dcp-panel,
.slide-panel-leave-to .dcp-panel { transform: translateX(100%); }
</style>
