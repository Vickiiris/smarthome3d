<template>
  <div class="sensor-status">
    <div class="ss-item">
      <span class="ss-icon">📡</span>
      <span class="ss-val" :class="status ? 'ok' : ''">{{ status ? '在线' : '离线' }}</span>
      <span class="ss-label">状态</span>
    </div>
    <div class="ss-item">
      <span class="ss-icon">🔔</span>
      <span class="ss-val" :class="status ? 'ok' : ''">{{ status ? '正常' : '已禁用' }}</span>
      <span class="ss-label">告警</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ status: Boolean })
</script>

<style scoped>
.sensor-status { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ss-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; text-align: center; }
.ss-icon { font-size: 18px; margin-bottom: 6px; display: block; }
.ss-val { font-size: 13px; font-weight: 600; color: var(--text-3); display: block; margin-bottom: 2px; }
.ss-val.ok { color: var(--success); }
.ss-label { font-size: 11px; color: var(--text-3); }
</style>
