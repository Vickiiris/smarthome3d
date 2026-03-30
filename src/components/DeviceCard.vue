<template>
  <div class="device-card" :class="{ active: device.status }" @click="toggleDevice">
    <div class="device-icon" :class="device.type">
      <span>{{ deviceIcon }}</span>
    </div>
    <div class="device-info">
      <h4 class="device-name">{{ device.name }}</h4>
      <p class="device-status">{{ statusText }}</p>
    </div>
    <div class="device-toggle" :class="{ on: device.status }">
      <div class="toggle-track">
        <div class="toggle-thumb"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  device: Object
})

const emit = defineEmits(['toggle'])

const setLightStatus = inject('setLightStatus')

const deviceIcon = computed(() => {
  const icons = {
    light: props.device.status ? '💡' : '💡',
    ac: props.device.status ? '❄️' : '🥶',
    curtain: '🧭',
    tv: '📺',
    speaker: props.device.status ? '🔊' : '🔉',
    security: props.device.status ? '🔒' : '🔓',
    sensor: '📡',
  }
  return icons[props.device.type] || '📱'
})

const statusText = computed(() => {
  if (props.device.type === 'light' && props.device.value !== undefined) {
    return props.device.status ? `亮度 ${props.device.value}%` : '已关闭'
  }
  if (props.device.type === 'ac' && props.device.value !== undefined) {
    return props.device.status ? `${props.device.value}°C` : '已关闭'
  }
  if (props.device.type === 'curtain') {
    return props.device.status ? '已打开' : '已关闭'
  }
  return props.device.status ? '运行中' : '已关闭'
})

function toggleDevice() {
  emit('toggle', props.device.id)
  if (setLightStatus && props.device.type === 'light') {
    setLightStatus(props.device.id, !props.device.status, props.device.value)
  }
}
</script>

<style scoped>
.device-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: white;
  border: 2px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.device-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.device-card.active {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.device-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  font-size: 22px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.device-card.active .device-icon {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.device-icon.light {
  background: rgba(245, 158, 11, 0.1);
}

.device-icon.ac {
  background: rgba(59, 130, 246, 0.1);
}

.device-icon.curtain {
  background: rgba(139, 92, 246, 0.1);
}

.device-info {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-status {
  font-size: 12px;
  color: #9ca3af;
}

.device-toggle {
  flex-shrink: 0;
}

.toggle-track {
  width: 44px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 2px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.device-toggle.on .toggle-track {
  background: #3b82f6;
}

.device-toggle.on .toggle-thumb {
  transform: translateX(20px);
}
</style>
