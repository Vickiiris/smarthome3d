<template>
  <button class="scene-card" :class="{ active: isActive }" @click="applyScene">
    <div class="scene-icon">{{ scene.icon }}</div>
    <div class="scene-content">
      <h4 class="scene-name">{{ scene.name }}</h4>
      <p class="scene-desc">{{ scene.description }}</p>
    </div>
    <div v-if="isActive" class="scene-indicator"></div>
  </button>
</template>

<script setup lang="ts">
import type { Scene } from '@/stores/homeStore'

const props = defineProps<{
  scene: Scene
  isActive?: boolean
}>()

const emit = defineEmits<{
  activate: [sceneId: string]
}>()

function applyScene() {
  emit('activate', props.scene.id)
}
</script>

<style lang="scss" scoped>
.scene-card{
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--bg-color);
  border: 2px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  min-width: 200px;
  position: relative;
  overflow: hidden;
  
  &:hover{
    background: white;
    border-color: var(--primary-light);
    box-shadow: var(--shadow-sm);
    transform: translateY(-2px);
  }
  
  &.active{
    background: white;
    border-color: var(--primary-color);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
    
    .scene-icon{
      animation: bounce 0.5s ease;
    }
  }
}

.scene-icon{
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  border-radius: 14px;
  font-size: 24px;
  flex-shrink: 0;
}

.scene-content{
  flex: 1;
  min-width: 0;
  
  .scene-name{
    font-size: 15px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 4px;
  }
  
  .scene-desc{
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.scene-indicator{
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes bounce{
  0%, 100%{ transform: scale(1); }
  50%{ transform: scale(1.1); }
}

@keyframes pulse{
  0%, 100%{ opacity: 1; }
  50%{ opacity: 0.5; }
}
</style>
