<template>
  <div class="dcp-section">
    <div class="dcp-section-title">📊 用电计量</div>
    <div class="dcp-grid">
      <div class="dcp-dd-item"><span class="dcp-dd-label">当前功率</span><span class="dcp-dd-value mono">{{ powerData.current }} W</span></div>
      <div class="dcp-dd-item"><span class="dcp-dd-label">今日用电</span><span class="dcp-dd-value mono">{{ powerData.today }} kWh</span></div>
      <div class="dcp-dd-item"><span class="dcp-dd-label">本月用电</span><span class="dcp-dd-value mono">{{ powerData.month }} kWh</span></div>
      <div class="dcp-dd-item"><span class="dcp-dd-label">累计用电</span><span class="dcp-dd-value mono">{{ powerData.total }} kWh</span></div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ deviceId: String })
const powerData = computed(() => {
  const seed = props.deviceId === 'ac-outlet-a' ? 1 : props.deviceId === 'ac-outlet-b' ? 2 : 3
  return { current: (seed*23+12).toFixed(0), today: (seed*0.4+0.3).toFixed(1), month: (seed*9.8+5.2).toFixed(1), total: (seed*42.6+18.3).toFixed(1) }
})
</script>
<style scoped>
.dcp-section { padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; }
.dcp-section-title { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dcp-dd-item { padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; display: flex; flex-direction: column; gap: 6px; }
.dcp-dd-label { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-dd-value { font-size: 12px; color: var(--text-2, #e2e8f0); line-height: 1.5; }
.dcp-dd-value.mono { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--text, #e2e8f0); }
</style>
