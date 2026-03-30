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

<script setup>
const props = defineProps({
  scene: Object,
  isActive: Boolean
})

const emit = defineEmits(['activate'])

function applyScene() {
  emit('activate', props.scene.id)
}
</script>

<style scoped>
.scene-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: white;
  border: 2px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  min-width: 200px;
  position: relative;
  overflow: hidden;
}

.scene-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.scene-card.active {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
}

.scene-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 14px;
  font-size: 24px;
  flex-shrink: 0;
  transition: transform 0.5s ease;
}

.scene-card.active .scene-icon {
  animation: bounce 0.5s ease;
}

.scene-content {
  flex: 1;
  min-width: 0;
}

.scene-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.scene-desc {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scene-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
