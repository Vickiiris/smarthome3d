<template>
  <div class="dcp-section">
    <div class="dcp-section-title">🔊 音量调节</div>
    <input type="range" class="dcp-slider" :value="value" @input="$emit('update:value', +$event.target.value)" min="0" max="100" />
    <div class="dcp-slider-labels"><span>0%</span><span class="dcp-slider-cur">{{ value }}%</span><span>100%</span></div>
  </div>
</template>
<script setup>
defineProps({ value: Number })
defineEmits(['update:value'])
</script>
<style scoped>
.dcp-section { padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; }
.dcp-section-title { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-slider { width: 100%; height: 6px; appearance: none; background: rgba(255,255,255,0.1); border-radius: 3px; outline: none; margin-bottom: 8px; }
.dcp-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: #00d4aa; border-radius: 50%; cursor: pointer; box-shadow: 0 0 8px rgba(0,212,170,0.4); }
.dcp-slider-labels { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
.dcp-slider-cur { color: var(--text, #e2e8f0); font-weight: 600; }
</style>
