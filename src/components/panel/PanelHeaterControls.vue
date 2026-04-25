<template>
  <div class="dcp-section">
    <div class="dcp-section-title">🌡 水温设置</div>
    <div class="dcp-temp-row">
      <button class="dcp-temp-btn" @click="$emit('update:value', Math.max(35, value - 1))">−</button>
      <div class="dcp-temp-display"><span class="dcp-temp-val">{{ value }}</span><span class="dcp-temp-unit">°C</span></div>
      <button class="dcp-temp-btn" @click="$emit('update:value', Math.min(75, value + 1))">+</button>
    </div>
  </div>
</template>
<script setup>
defineProps({ value: Number })
defineEmits(['update:value'])
</script>
<style scoped>
.dcp-section { padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; }
.dcp-section-title { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-temp-row { display: flex; align-items: center; justify-content: center; gap: 20px; }
.dcp-temp-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(0,212,170,0.08); border: 1px solid rgba(0,212,170,0.2); border-radius: 50%; color: #00d4aa; font-size: 22px; font-weight: 300; cursor: pointer; transition: all 0.2s; }
.dcp-temp-btn:hover { background: rgba(0,212,170,0.18); transform: scale(1.05); }
.dcp-temp-display { display: flex; align-items: baseline; gap: 2px; }
.dcp-temp-val { font-size: 48px; font-weight: 600; color: var(--text, #e2e8f0); font-family: 'JetBrains Mono', monospace; line-height: 1; }
.dcp-temp-unit { font-size: 18px; color: #64748b; }
</style>
