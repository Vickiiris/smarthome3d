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

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { Device } from '@/stores/homeStore'

const props = defineProps<{
  device: Device
}>()

const emit = defineEmits<{
  toggle: [deviceId: string]
}>()

const setLightStatus = inject<(lightId: string, status: boolean, intensity?: number) => void>('setLightStatus')

const deviceIcon = computed(() => {
  const icons: Record<string, string> = {
    light: props.device.status ? '💡' : '💡',
    ac: props.device.status ? '❄️' : '🌡️',
    curtain: '🪟',
    tv: '📺',
    speaker: props.device.status ? '🔊' : '🔇',
    security: props.device.status ? '🔒' : '🔓',
    sensor: '📡',
  }
  return icons[props.device.type] || '🔌'
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

<style lang="scss" scoped>
.device-card{
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--bg-color);
  border: 2px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover{
    background: white;
    border-color: var(--primary-light);
    box-shadow: var(--shadow-sm);
  }
  
  &.active{
    background: white;
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    
    .device-icon{
      background: var(--primary-gradient);
      color: white;
    }
  }
}

.device-icon{
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
  
  &.light{
    background: rgba(245, 158, 11, 0.1);
  }
  
  &.ac{
    background: rgba(59, 130, 246, 0.1);
  }
  
  &.curtain{
    background: rgba(139, 92, 246, 0.1);
  }
}

.device-info{
  flex: 1;
  min-width: 0;
  
  .device-name{
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .device-status{
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.device-toggle{
  flex-shrink: 0;
  
  .toggle-track{
    width: 44px;
    height: 24px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 2px;
    transition: all 0.3s ease;
  }
  
  .toggle-thumb{
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }
  
  &.on{
    .toggle-track{
      background: var(--primary-color);
    }
    
    .toggle-thumb{
      transform: translateX(20px);
    }
  }
}
</style>
