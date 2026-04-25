<template>
  <div class="dcp-section">
    <div class="dcp-section-title">📊 {{ device.name }}</div>
    <div class="dcp-grid">
      <div class="dcp-dd-item">
        <span class="dcp-dd-label">当前数值</span>
        <span class="dcp-dd-value" style="font-size: 1.5em; color: var(--primary)">{{ device.value }}<small>{{ device.unit }}</small></span>
      </div>
      <div class="dcp-dd-item" v-if="device.trend">
        <span class="dcp-dd-label">变化趋势</span>
        <span class="dcp-dd-value">{{ device.trend }}</span>
      </div>
      <div class="dcp-dd-item">
        <span class="dcp-dd-label">说明</span>
        <span class="dcp-dd-value">{{ device.desc }}</span>
      </div>
    </div>
  </div>
  <div class="dcp-section">
    <div class="dcp-section-title">📈 历史数据</div>
    <div class="dcp-grid">
      <div class="dcp-dd-item"><span class="dcp-dd-label">昨日</span><span class="dcp-dd-value">{{ (device.value * 0.95).toFixed(1) }}{{ device.unit }}</span></div>
      <div class="dcp-dd-item"><span class="dcp-dd-label">上周同期</span><span class="dcp-dd-value">{{ (device.value * 1.1).toFixed(1) }}{{ device.unit }}</span></div>
      <div class="dcp-dd-item"><span class="dcp-dd-label">上月同期</span><span class="dcp-dd-value">{{ (device.value * 0.85).toFixed(1) }}{{ device.unit }}</span></div>
      <div class="dcp-dd-item"><span class="dcp-dd-label">年均</span><span class="dcp-dd-value">{{ (device.value * 1.05).toFixed(1) }}{{ device.unit }}</span></div>
    </div>
  </div>
</template>
<script setup>
defineProps({ device: Object })
</script>
<style scoped>
.dcp-section { padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; }
.dcp-section-title { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dcp-dd-item { padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; display: flex; flex-direction: column; gap: 6px; }
.dcp-dd-label { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-dd-value { font-size: 12px; color: var(--text-2, #e2e8f0); line-height: 1.5; }
</style>
