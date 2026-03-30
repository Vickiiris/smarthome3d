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

<script setup>
defineProps({
  icon: String,
  iconBg: String,
  value: [String, Number],
  unit: String,
  label: String,
  trend: Number
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-icon .icon {
  font-size: 22px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-value .value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.stat-value .unit {
  font-size: 12px;
  color: #9ca3af;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.stat-trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
}

.stat-trend.up {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.stat-trend.down {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}
</style>
