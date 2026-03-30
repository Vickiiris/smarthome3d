<template>
  <Transition name="panel-slide">
    <div v-if="visible" class="device-panel">
      <!-- 头部 -->
      <div class="panel-header">
        <div class="panel-icon" :class="hotspot?.type">
          <span>{{ hotspot?.icon }}</span>
        </div>
        <div class="panel-title-wrap">
          <h3 class="panel-title">{{ hotspot?.name }}</h3>
          <span class="panel-type">{{ typeLabel }}</span>
        </div>
        <button class="panel-close" @click="$emit('close')">X</button>
      </div>

      <!-- 关联设备 -->
      <template v-if="device">
        <!-- 灯光 -->
        <template v-if="device.type === 'light'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">设备状态</span>
              <div class="status-toggle" :class="{ on: device.status }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ device.status ? '开启' : '关闭' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <div class="control-label">
              <span>亮度</span>
              <span class="control-value">{{ device.value ?? 100 }}%</span>
            </div>
            <div class="slider-wrap">
              <input type="range" min="0" max="100" :value="device.value ?? 100"
                @input="setBrightness(($event.target as HTMLInputElement).value)" class="slider" />
            </div>
          </div>
          <div class="panel-section quick-brightness">
            <button v-for="v in [25, 50, 75, 100]" :key="v"
              class="brightness-btn" :class="{ active: device.value === v }"
              @click="setBrightness(String(v))">{{ v }}%</button>
          </div>
        </template>

        <!-- 空调 -->
        <template v-if="device.type === 'ac'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">设备状态</span>
              <div class="status-toggle" :class="{ on: device.status }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ device.status ? '开启' : '关闭' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <div class="control-label">
              <span>目标温度</span>
              <span class="control-value">{{ device.value ?? 24 }}C</span>
            </div>
            <div class="temp-btns">
              <button class="temp-btn" @click="adjustTemp(-1)">-</button>
              <div class="temp-display">
                <span class="temp-num">{{ device.value ?? 24 }}</span>
                <span class="temp-unit">C</span>
              </div>
              <button class="temp-btn" @click="adjustTemp(1)">+</button>
            </div>
          </div>
          <div class="panel-section mode-btns">
            <button class="mode-btn" :class="{ active: acMode === 'cool' }" @click="acMode = 'cool'">COOL</button>
            <button class="mode-btn" :class="{ active: acMode === 'heat' }" @click="acMode = 'heat'">HEAT</button>
            <button class="mode-btn" :class="{ active: acMode === 'fan' }" @click="acMode = 'fan'">FAN</button>
          </div>
          <div class="panel-section">
            <div class="control-label"><span>风速</span></div>
            <div class="fan-speed">
              <button v-for="s in fanSpeeds" :key="s" class="fan-btn" :class="{ active: fanSpeed === s }" @click="fanSpeed = s">{{ s }}</button>
            </div>
          </div>
        </template>

        <!-- 窗帘 -->
        <template v-if="device.type === 'curtain'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">窗帘状态</span>
              <div class="status-toggle" :class="{ on: (device.value ?? 0) > 0 }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ (device.value ?? 0) > 0 ? '打开' : '关闭' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <div class="control-label">
              <span>开合度</span>
              <span class="control-value">{{ device.value ?? 0 }}%</span>
            </div>
            <div class="slider-wrap">
              <input type="range" min="0" max="100" :value="device.value ?? 0"
                @input="setCurtain(($event.target as HTMLInputElement).value)" class="slider" />
            </div>
          </div>
        </template>

        <!-- 电视 -->
        <template v-if="device.type === 'tv'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">设备状态</span>
              <div class="status-toggle" :class="{ on: device.status }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ device.status ? '开启' : '关闭' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section tv-channels">
            <button v-for="ch in channels" :key="ch.name"
              class="channel-btn" :class="{ active: currentChannel === ch.name }"
              @click="currentChannel = ch.name">{{ ch.icon }} {{ ch.name }}</button>
          </div>
          <div class="panel-section tv-controls">
            <button class="tv-btn" @click="tvVolUp">+</button>
            <button class="tv-btn power" @click="toggle">O</button>
            <button class="tv-btn" @click="tvVolDown">-</button>
          </div>
        </template>

        <!-- 音箱 -->
        <template v-if="device.type === 'speaker'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">设备状态</span>
              <div class="status-toggle" :class="{ on: device.status }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ device.status ? '开启' : '关闭' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <div class="control-label">
              <span>音量</span>
              <span class="control-value">{{ speakerVolume }}%</span>
            </div>
            <div class="slider-wrap">
              <input type="range" min="0" max="100" :value="speakerVolume"
                @input="speakerVolume = Number(($event.target as HTMLInputElement).value)" class="slider" />
            </div>
          </div>
          <div class="panel-section speaker-controls">
            <button class="speaker-btn">&lt;&lt;</button>
            <button class="speaker-btn play" @click="speakerPlaying = !speakerPlaying">
              {{ speakerPlaying ? '||' : '&gt;' }}
            </button>
            <button class="speaker-btn">&gt;&gt;</button>
          </div>
        </template>

        <!-- 安防 -->
        <template v-if="device.type === 'security'">
          <div class="panel-section security-status">
            <div class="security-icon">HOME</div>
            <div class="security-info">
              <span class="security-mode">{{ securityMode }}</span>
              <span class="security-desc">{{ securityDesc }}</span>
            </div>
          </div>
          <div class="panel-section security-btns">
            <button class="sec-btn" :class="{ active: securityMode === 'Home' }" @click="setSecurity('Home', 'Home mode')">HOME</button>
            <button class="sec-btn" :class="{ active: securityMode === 'Away' }" @click="setSecurity('Away', 'Away mode')">AWAY</button>
            <button class="sec-btn danger" :class="{ active: securityMode === 'Panic' }" @click="setSecurity('Panic', 'Panic mode')">PANIC</button>
          </div>
        </template>

        <!-- 传感器 -->
        <template v-if="device.type === 'sensor'">
          <div class="panel-section sensor-values">
            <div class="sensor-card">
              <span class="sensor-icon">TEMP</span>
              <span class="sensor-val">{{ sensorTemp }}C</span>
              <span class="sensor-label">Temperature</span>
            </div>
            <div class="sensor-card">
              <span class="sensor-icon">HUM</span>
              <span class="sensor-val">{{ sensorHumidity }}%</span>
              <span class="sensor-label">Humidity</span>
            </div>
          </div>
        </template>

        <!-- 通用信息 -->
        <div class="panel-section info-section">
          <div class="info-row">
            <span class="info-label">Type</span>
            <span class="info-value">{{ deviceTypeLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Room</span>
            <span class="info-value">{{ roomLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" :class="device.status ? 'running' : 'stopped'">
              {{ device.status ? 'ON' : 'OFF' }}
            </span>
          </div>
        </div>
      </template>

      <!-- 无设备 -->
      <template v-else>
        <div class="panel-section info-section">
          <div class="info-row">
            <span class="info-label">Type</span>
            <span class="info-value">{{ typeLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Position</span>
            <span class="info-value" style="font-size:11px">
              {{ hotspot?.position.x.toFixed(3) }}, {{ hotspot?.position.y.toFixed(3) }}, {{ hotspot?.position.z.toFixed(3) }}
            </span>
          </div>
          <p class="no-device-tip">No device bound</p>
        </div>
      </template>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHomeStore } from '@/stores/homeStore'
import type { HotspotDef } from '@/composables/useThreeScene'

const props = defineProps<{ visible: boolean; hotspot: HotspotDef | null }>()
const emit = defineEmits<{
  close: [];
  toggle: [deviceId: string];
  updateValue: [deviceId: string, value: number];
}>()

const homeStore = useHomeStore()

const device = computed(() =>
  props.hotspot?.deviceId
    ? homeStore.devices.find(d => d.id === props.hotspot!.deviceId) ?? null
    : null
)

const acMode = ref('cool')
const fanSpeed = ref('Auto')
const fanSpeeds = ['Low', 'Med', 'High', 'Auto']
const speakerVolume = ref(60)
const speakerPlaying = ref(false)
const securityMode = ref('Home')
const securityDesc = ref('Home mode')
const currentChannel = ref('CCTV')
const channels = [
  { name: 'CCTV', icon: 'TV' },
  { name: 'Movie', icon: 'MV' },
  { name: 'News', icon: 'N' },
  { name: 'Music', icon: 'M' },
]
const sensorTemp = ref(24)
const sensorHumidity = ref(65)

const typeLabel = computed(() => {
  const m: Record<string, string> = {
    security: 'Security', ac: 'AC', tv: 'TV', speaker: 'Speaker',
    sensor: 'Sensor', switch: 'Switch', curtain: 'Curtain', info: 'Info',
  }
  return m[props.hotspot?.type ?? ''] ?? 'Device'
})

const deviceTypeLabel = computed(() => {
  const m: Record<string, string> = {
    light: 'Light', ac: 'AC', curtain: 'Curtain', tv: 'TV',
    speaker: 'Speaker', security: 'Security', sensor: 'Sensor',
  }
  return m[device.value?.type ?? ''] ?? 'Unknown'
})

const roomLabel = computed(() => {
  const m: Record<string, string> = {
    'living-room': 'Living Room', 'bedroom': 'Master Bed',
    'bedroom2': 'Guest Bed', 'kitchen': 'Kitchen', 'bathroom': 'Bathroom',
  }
  return m[device.value?.room ?? ''] ?? '-'
})

function toggle() {
  if (device.value) emit('toggle', device.value.id)
}

function setBrightness(v: string) {
  if (device.value) emit('updateValue', device.value.id, Number(v))
}

function adjustTemp(delta: number) {
  if (!device.value) return
  const cur = device.value.value ?? 24
  const next = Math.min(30, Math.max(16, cur + delta))
  emit('updateValue', device.value.id, next)
}

function setCurtain(v: string) {
  if (device.value) emit('updateValue', device.value.id, Number(v))
}

function tvVolUp() { console.log('vol+') }
function tvVolDown() { console.log('vol-') }
function setSecurity(mode: string, desc: string) {
  securityMode.value = mode
  securityDesc.value = desc
}
</script>

<style lang="scss" scoped>
.device-panel {
  position: fixed;
  top: 88px;
  right: 24px;
  width: 320px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
  z-index: 200;
  border: 1px solid rgba(59,130,246,0.12);
  scrollbar-width: thin;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;

  .panel-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(59,130,246,0.1);
    flex-shrink: 0;

    &.security { background: rgba(239,68,68,0.1); }
    &.ac       { background: rgba(6,182,212,0.1); }
    &.tv       { background: rgba(139,92,246,0.1); }
    &.speaker  { background: rgba(16,185,129,0.1); }
    &.sensor   { background: rgba(245,158,11,0.1); }
    &.curtain  { background: rgba(139,92,246,0.1); }
  }

  .panel-title-wrap {
    flex: 1;
    .panel-title { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 2px; }
    .panel-type  { font-size: 12px; color: #9ca3af; }
  }

  .panel-close {
    width: 28px;
    height: 28px;
    border: none;
    background: #f3f4f6;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover { background: #e5e7eb; color: #1f2937; }
  }
}

.panel-section {
  padding: 14px 20px;
  border-bottom: 1px solid #f9fafb;

  &:last-child { border-bottom: none; }
}

.device-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .status-label { font-size: 14px; color: #6b7280; font-weight: 500; }

  .status-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .toggle-track {
      width: 48px;
      height: 26px;
      background: #e5e7eb;
      border-radius: 13px;
      padding: 3px;
      transition: background 0.3s;
    }

    .toggle-thumb {
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      transition: transform 0.3s;
    }

    .toggle-text { font-size: 13px; color: #9ca3af; font-weight: 500; }

    &.on {
      .toggle-track { background: #3b82f6; }
      .toggle-thumb { transform: translateX(22px); }
      .toggle-text  { color: #3b82f6; }
    }
  }
}

.control-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;

  .control-value { font-weight: 700; color: #1f2937; }
}

.slider-wrap .slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    border: 2px solid #3b82f6;
    box-shadow: 0 2px 6px rgba(59,130,246,0.3);
    cursor: pointer;
  }
}

.quick-brightness {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
}

.brightness-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  transition: all 0.2s;

  &:hover { border-color: #3b82f6; color: #3b82f6; }
  &.active { background: #3b82f6; border-color: #3b82f6; color: white; }
}

.temp-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.temp-btn {
  width: 44px;
  height: 44px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-weight: 700;
  transition: all 0.2s;

  &:hover { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
}

.temp-display {
  .temp-num { font-size: 36px; font-weight: 800; color: #1f2937; }
  .temp-unit { font-size: 16px; color: #9ca3af; }
}

.mode-btns,
.fan-speed {
  display: flex;
  gap: 8px;
}

.mode-btn,
.fan-btn {
  flex: 1;
  padding: 8px 4px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  transition: all 0.2s;

  &:hover { border-color: #3b82f6; color: #3b82f6; }
  &.active { background: #3b82f6; border-color: #3b82f6; color: white; }
}

.tv-channels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.channel-btn {
  padding: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  transition: all 0.2s;

  &:hover { border-color: #8b5cf6; color: #8b5cf6; }
  &.active { background: #8b5cf6; border-color: #8b5cf6; color: white; }
}

.tv-controls,
.speaker-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.tv-btn {
  width: 50px;
  height: 50px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover { border-color: #8b5cf6; background: rgba(139,92,246,0.05); }
  &.power { color: #ef4444; border-color: #ef4444; }
}

.speaker-btn {
  width: 50px;
  height: 50px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover { border-color: #10b981; }
  &.play { width: 60px; height: 60px; background: #10b981; border-color: #10b981; color: white; font-size: 24px; }
}

.security-status {
  display: flex;
  align-items: center;
  gap: 14px;
}

.security-icon {
  font-size: 40px;
  font-weight: 800;
  color: #3b82f6;
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.security-mode { font-size: 18px; font-weight: 700; color: #1f2937; }
.security-desc { font-size: 12px; color: #9ca3af; }

.security-btns {
  display: flex;
  gap: 8px;
}

.sec-btn {
  flex: 1;
  padding: 10px 4px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  transition: all 0.2s;

  &:hover { border-color: #10b981; color: #10b981; }
  &.active { background: #10b981; border-color: #10b981; color: white; }
  &.danger.active { background: #ef4444; border-color: #ef4444; }
}

.sensor-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sensor-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .sensor-icon { font-size: 14px; font-weight: 700; color: #3b82f6; }
  .sensor-val { font-size: 22px; font-weight: 800; color: #1f2937; }
  .sensor-label { font-size: 12px; color: #9ca3af; }
}

.info-section {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f9fafb;

    &:last-of-type { border-bottom: none; }

    .info-label { font-size: 13px; color: #9ca3af; }
    .info-value { font-size: 13px; font-weight: 600; color: #1f2937; }

    &.running .info-value { color: #10b981; }
    &.stopped .info-value { color: #9ca3af; }
  }

  .no-device-tip {
    margin-top: 12px;
    font-size: 13px;
    color: #d1d5db;
    text-align: center;
  }
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
