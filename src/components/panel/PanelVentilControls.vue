<template>
  <div class="dcp-section">
    <div class="dcp-section-title">🌀 档位调节</div>
    <div class="dcp-mode-grid">
      <button v-for="s in speeds" :key="s.value" class="dcp-mode-btn" :class="{ active: value === s.value }" @click="$emit('update:value', s.value)">{{ s.label }}</button>
    </div>
  </div>
</template>
<script setup>
defineProps({ value: Number })
defineEmits(['update:value'])
const speeds = [{ value: 1, label: '低速' }, { value: 2, label: '中速' }, { value: 3, label: '高速' }]
</script>
<style scoped>
.dcp-section { padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; }
.dcp-section-title { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-mode-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.dcp-mode-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; color: #94a3b8; font-size: 11px; cursor: pointer; transition: all 0.2s; }
.dcp-mode-btn:hover { background: rgba(255,255,255,0.05); }
.dcp-mode-btn.active { background: rgba(0,212,170,0.1); border-color: rgba(0,212,170,0.3); color: #00d4aa; }
</style>
