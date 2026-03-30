<template>
  <Transition name="panel-slide">
    <div v-if="visible" class="device-panel">
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

      <template v-if="device">
        <template v-if="device.type === 'light'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">Device Status</span>
              <div class="status-toggle" :class="{ on: device.status }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ device.status ? 'ON' : 'OFF' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <div class="control-label">
              <span>Brightness</span>
              <span class="control-value">{{ device.value ?? 100 }}%</span>
            </div>
            <div class="slider-wrap">
              <input type="range" min="0" max="100" :value="device.value ?? 100"
                @input="setBrightness($event.target.value)" class="slider" />
            </div>
          </div>
          <div class="panel-section quick-brightness">
            <button v-for="v in [25, 50, 75, 100]" :key="v"
              class="brightness-btn" :class="{ active: device.value === v }"
              @click="setBrightness(String(v))">{{ v }}%</button>
          </div>
        </template>

        <template v-if="device.type === 'ac'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">Device Status</span>
              <div class="status-toggle" :class="{ on: device.status }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ device.status ? 'ON' : 'OFF' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <div class="control-label">
              <span>Target Temp</span>
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
            <div class="control-label"><span>Fan Speed</span></div>
            <div class="fan-speed">
              <button v-for="s in fanSpeeds" :key="s" class="fan-btn" :class="{ active: fanSpeed === s }" @click="fanSpeed = s">{{ s }}</button>
            </div>
          </div>
        </template>

        <template v-if="device.type === 'curtain'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">Curtain</span>
              <div class="status-toggle" :class="{ on: (device.value ?? 0) > 0 }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ (device.value ?? 0) > 0 ? 'Open' : 'Closed' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <div class="control-label">
              <span>Position</span>
              <span class="control-value">{{ device.value ?? 0 }}%</span>
            </div>
            <div class="slider-wrap">
              <input type="range" min="0" max="100" :value="device.value ?? 0"
                @input="setCurtain($event.target.value)" class="slider" />
            </div>
          </div>
        </template>

        <template v-if="device.type === 'tv'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">Device Status</span>
              <div class="status-toggle" :class="{ on: device.status }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ device.status ? 'ON' : 'OFF' }}</span>
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

        <template v-if="device.type === 'speaker'">
          <div class="panel-section">
            <div class="device-status-row">
              <span class="status-label">Device Status</span>
              <div class="status-toggle" :class="{ on: device.status }" @click="toggle">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="toggle-text">{{ device.status ? 'ON' : 'OFF' }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <div class="control-label">
              <span>Volume</span>
              <span class="control-value">{{ speakerVolume }}%</span>
            </div>
            <div class="slider-wrap">
              <input type="range" min="0" max="100" :value="speakerVolume"
                @input="speakerVolume = Number($event.target.value)" class="slider" />
            </div>
          </div>
          <div class="panel-section speaker-controls">
            <button class="speaker-btn">&lt;&lt;</button>
            <button class="speaker-btn play" @click="speakerPlaying = !speakerPlaying">
              {{ speakerPlaying ? '||' : '>' }}
            </button>
            <button class="speaker-btn">&gt;&gt;</button>
          </div>
        </template>

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

      <template v-else>
        <div class="panel-section info-section">
          <div class="info-row">
            <span class="info-label">Type</span>
            <span class="info-value">{{ typeLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Position</span>
            <span class="info-value" style="font-size:11px">
              {{ hotspot?.position?.x?.toFixed(3) }}, {{ hotspot?.position?.y?.toFixed(3) }}, {{ hotspot?.position?.z?.toFixed(3) }}
            </span>
          </div>
          <p class="no-device-tip">No device bound</p>
        </div>
      </template>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHomeStore } from '@/stores/homeStore'

const props = defineProps({
  visible: Boolean,
  hotspot: Object
})

const emit = defineEmits(['close', 'toggle', 'updateValue'])

const homeStore = useHomeStore()

const device = computed(() =>
  props.hotspot?.deviceId
    ? homeStore.devices.find(d => d.id === props.hotspot.deviceId) ?? null
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
  const m = {
    security: 'Security', ac: 'AC', tv: 'TV', speaker: 'Speaker',
    sensor: 'Sensor', switch: 'Switch', curtain: 'Curtain', info: 'Info',
  }
  return m[props.hotspot?.type ?? ''] ?? 'Device'
})

const deviceTypeLabel = computed(() => {
  if (!device.value) return '-'
  const m = {
    light: 'Light', ac: 'AC', curtain: 'Curtain', tv: 'TV',
    speaker: 'Speaker', security: 'Security', sensor: 'Sensor',
  }
  return m[device.value.type ?? ''] ?? 'Unknown'
})

const roomLabel = computed(() => {
  if (!device.value) return '-'
  const m = {
    'living-room': 'Living Room', 'bedroom': 'Master Bed',
    'bedroom2': 'Guest Bed', 'kitchen': 'Kitchen', 'bathroom': 'Bathroom',
  }
  return m[device.value.room ?? ''] ?? '-'
})

function toggle() {
  if (device.value) emit('toggle', device.value.id)
}

function setBrightness(v) {
  if (device.value) emit('updateValue', device.value.id, Number(v))
}

function adjustTemp(delta) {
  if (!device.value) return
  const cur = device.value.value ?? 24
  const next = Math.min(30, Math.max(16, cur + delta))
  emit('updateValue', device.value.id, next)
}

function setCurtain(v) {
  if (device.value) emit('updateValue', device.value.id, Number(v))
}

function tvVolUp() { console.log('vol+') }
function tvVolDown() { console.log('vol-') }
function setSecurity(mode, desc) {
  securityMode.value = mode
  securityDesc.value = desc
}
</script>

<style scoped>
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
}

.device-panel::-webkit-scrollbar { width: 4px; }
.device-panel::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }

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
}

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
}

.panel-icon.security { background: rgba(239,68,68,0.1); }
.panel-icon.ac { background: rgba(6,182,212,0.1); }
.panel-icon.tv { background: rgba(139,92,246,0.1); }
.panel-icon.speaker { background: rgba(16,185,129,0.1); }
.panel-icon.sensor { background: rgba(245,158,11,0.1); }
.panel-icon.curtain { background: rgba(139,92,246,0.1); }

.panel-title-wrap { flex: 1; }
.panel-title { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 2px; }
.panel-type { font-size: 12px; color: #9ca3af; }

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
}

.panel-close:hover { background: #e5e7eb; color: #1f2937; }

.panel-section {
  padding: 14px 20px;
  border-bottom: 1px solid #f9fafb;
}

.panel-section:last-child { border-bottom: none; }

.device-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-label { font-size: 14px; color: #6b7280; font-weight: 500; }

.status-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

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

.status-toggle.on .toggle-track { background: #3b82f6; }
.status-toggle.on .toggle-thumb { transform: translateX(22px); }
.status-toggle.on .toggle-text { color: #3b82f6; }

.control-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.control-value { font-weight: 700; color: #1f2937; }

.slider-wrap .slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider-wrap .slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  box-shadow: 0 2px 6px rgba(59,130,246,0.3);
  cursor: pointer;
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
}

.brightness-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.brightness-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }

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
}

.temp-btn:hover { border-color: #3b82f6; background: rgba(59,130,246,0.05); }

.temp-display .temp-num { font-size: 36px; font-weight: 800; color: #1f2937; }
.temp-display .temp-unit { font-size: 16px; color: #9ca3af; }

.mode-btns,
.fan-speed { display: flex; gap: 8px; }

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
}

.mode-btn:hover, .fan-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.mode-btn.active, .fan-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }

.tv-channels { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

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
}

.channel-btn:hover { border-color: #8b5cf6; color: #8b5cf6; }
.channel-btn.active { background: #8b5cf6; border-color: #8b5cf6; color: white; }

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
}

.tv-btn:hover { border-color: #8b5cf6; background: rgba(139,92,246,0.05); }
.tv-btn.power { color: #ef4444; border-color: #ef4444; }

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
}

.speaker-btn:hover { border-color: #10b981; }
.speaker-btn.play { width: 60px; height: 60px; background: #10b981; border-color: #10b981; color: white; font-size: 24px; }

.security-status { display: flex; align-items: center; gap: 14px; }
.security-icon { font-size: 40px; font-weight: 800; color: #3b82f6; }
.security-mode { font-size: 18px; font-weight: 700; color: #1f2937; display: block; }
.security-desc { font-size: 12px; color: #9ca3af; }

.security-btns { display: flex; gap: 8px; }

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
}

.sec-btn:hover { border-color: #10b981; color: #10b981; }
.sec-btn.active { background: #10b981; border-color: #10b981; color: white; }
.sec-btn.danger.active { background: #ef4444; border-color: #ef4444; }

.sensor-values { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.sensor-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.sensor-icon { font-size: 14px; font-weight: 700; color: #3b82f6; }
.sensor-val { font-size: 22px; font-weight: 800; color: #1f2937; }
.sensor-label { font-size: 12px; color: #9ca3af; }

.info-section .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f9fafb;
}

.info-section .info-row:last-of-type { border-bottom: none; }
.info-label { font-size: 13px; color: #9ca3af; }
.info-value { font-size: 13px; font-weight: 600; color: #1f2937; }
.info-row.running .info-value { color: #10b981; }
.info-row.stopped .info-value { color: #9ca3af; }
.no-device-tip { margin-top: 12px; font-size: 13px; color: #d1d5db; text-align: center; }

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
