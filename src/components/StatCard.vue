<template>
  <div class="stat-card">
    <div class="stat-icon" :style="{ background: iconBg }">
      <span class="icon">{{ icon }}</span>
    </div>
    <div class="stat-content">
      <div class="stat-value">
        <span class="value">{{ value }}</span>
        <span v-if="unit" class="unit">{{ unit }}</span>
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
    <div v-if="trend" class="stat-trend" :class="trend > 0 ? 'up' : 'down'">
      {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  iconBg?: string
  value: string | number
  unit?: string
  label: string
  trend?: number
}>()
</script>

<style lang="scss" scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-card-hover);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  
  .icon {
    font-size: 22px;
  }
}

.stat-content {
  flex: 1;
  
  .stat-value {
    display: flex;
    align-items: baseline;
    gap: 4px;
    
    .value {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .unit {
      font-size: 12px;
      color: var(--text-muted);
    }
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
}

.stat-trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  
  &.up {
    background: rgba(16, 185, 129, 0.2);
    color: var(--success-color);
  }
  
  &.down {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger-color);
  }
}
</style>
