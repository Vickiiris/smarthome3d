<template>
  <div v-show="visible" class="page">
    <div ref="sceneCardRef" class="scene-card" :class="{ fullscreen: isFullscreen }">
      <div class="scene-overlay">
        <div class="room-tabs">
          <button class="room-tab" :class="{ active: activeRoom === 'all' }" @click="$emit('switchRoom', 'all')">全景</button>
          <button v-for="room in rooms" :key="room.id" class="room-tab" :class="{ active: activeRoom === room.id }" @click="$emit('switchRoom', room.id)">{{ room.name }}</button>
        </div>
        <div class="overlay-right">
          <button v-if="isFullscreen" class="fullscreen-btn" @click="$emit('toggleFullscreen')" title="退出全屏">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          </button>
          <button v-else class="fullscreen-btn" @click="$emit('toggleFullscreen')" title="全屏">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="section-header">
      <h3 class="section-title">室内外环境</h3>
      <span class="section-tag live"><span class="live-dot"></span>实时监测</span>
    </div>
    <div class="env-grid">
      <div v-for="item in envItems" :key="item.label" class="env-card" :style="{ '--accent': item.color }" @click="$emit('showEnvDetail', item)">
        <div class="env-icon">{{ item.icon }}</div>
        <div class="env-info">
          <span class="env-value" v-html="formatMetricValue(item.value)"></span>
          <span class="env-label">{{ item.label }}</span>
        </div>
        <div class="env-bar"><div class="env-bar-fill" :style="{ width: item.pct + '%' }"></div></div>
      </div>
    </div>

    <div class="bottom-grid">
      <!-- 设备控制 -->
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">设备控制</h3>
          <div class="panel-tabs">
            <button class="panel-tab" :class="{ active: activeDeviceTab === 'light' }" @click="$emit('update:activeDeviceTab', 'light')">💡 照明</button>
            <button class="panel-tab" :class="{ active: activeDeviceTab === 'ac' }" @click="$emit('update:activeDeviceTab', 'ac')">❄️ 空调</button>
            <button class="panel-tab" :class="{ active: activeDeviceTab === 'entertainment' }" @click="$emit('update:activeDeviceTab', 'entertainment')">🎮 娱乐</button>
          </div>
        </div>
        <!-- 照明/空调设备列表 -->
        <div class="device-list" v-if="activeDeviceTab !== 'entertainment'">
          <div v-for="device in envDevices" :key="device.id" class="device-item" @click="$emit('flyToDeviceRoom', device)">
            <div class="device-icon" :style="{ background: getDeviceColor(device) }" :class="{ 'is-on': device.status }">{{ device.icon }}</div>
            <div class="device-info">
              <span class="d-name">{{ device.name }}</span>
              <span class="d-room">{{ device.room }}</span>
            </div>
            <div class="device-right">
              <div class="toggle" :class="{ on: device.status }" @click.stop="$emit('toggleDevice', device)">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
              </div>
              <button class="ctrl-btn" @click.stop="$emit('openDeviceControl', device)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
          </div>
        </div>
        <!-- 娱乐设备列表 -->
        <div class="device-list" v-if="activeDeviceTab === 'entertainment'">
          <div v-for="device in entertainmentDevices" :key="device.id" class="device-item" @click="$emit('flyToDeviceRoom', device)">
            <div class="device-icon" :style="{ background: getDeviceColor(device) }" :class="{ 'is-on': device.status }">{{ device.icon }}</div>
            <div class="device-info">
              <span class="d-name">{{ device.name }}</span>
              <span class="d-room">{{ device.room }}</span>
            </div>
            <div class="device-right">
              <div class="toggle" :class="{ on: device.status }" @click.stop="$emit('toggleDevice', device)">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
              </div>
              <button class="ctrl-btn" @click.stop="$emit('openDeviceControl', device)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
          </div>
          <div v-if="entertainmentDevices.length === 0" class="device-empty">暂无娱乐设备</div>
        </div>
      </div>
      <!-- 安防监控 -->
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">安防监控</h3>
          <span class="section-tag ok"><span class="ok-dot"></span>全部正常</span>
        </div>
        <div class="security-grid">
          <div v-for="item in linkedSecurityItems" :key="item.label" class="security-item" :style="{ '--accent': item.color }" @click="$emit('openSecurityControl', item)">
            <div class="s-icon" :style="{ color: item.color }">{{ item.icon }}</div>
            <div class="s-info">
              <span class="s-label">{{ item.label }}</span>
              <span class="s-val" :style="{ color: item.color }">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sceneCardRef = ref(null)

defineExpose({ sceneCardRef })

defineProps({
  visible: { type: Boolean, required: true },
  isFullscreen: { type: Boolean, required: true },
  activeRoom: { type: String, required: true },
  rooms: { type: Array, required: true },
  envItems: { type: Array, required: true },
  activeDeviceTab: { type: String, required: true },
  envDevices: { type: Array, required: true },
  entertainmentDevices: { type: Array, required: true },
  linkedSecurityItems: { type: Array, required: true },
  formatMetricValue: { type: Function, required: true },
  getDeviceColor: { type: Function, required: true },
})

defineEmits([
  'switchRoom', 'toggleFullscreen', 'showEnvDetail',
  'update:activeDeviceTab', 'flyToDeviceRoom', 'toggleDevice',
  'openDeviceControl', 'openSecurityControl',
])
</script>
