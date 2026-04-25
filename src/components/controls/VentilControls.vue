<template>
  <div class="ms">
    <span class="ml">风速</span>
    <span class="mv active">{{ speed }}%</span>
  </div>
  <div class="prog-wrap">
    <div class="prog-bar"><div class="prog-fill ventil" :style="{ width: speed + '%' }"></div></div>
    <input type="range" min="0" max="100" v-model="speed" />
  </div>
  <div class="modes">
    <button v-for="m in ['自动', '低速', '中速', '高速']" :key="m" class="mode-btn" :class="{ act: ventilMode === m }" @click="ventilMode = m">{{ m }}</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ value: Number, mode: String })
const emit = defineEmits(['update'])
const speed = ref(props.value ?? 50)
const ventilMode = ref(props.mode ?? '自动')
watch(() => props.value, (v) => { if (v != null) speed.value = v })
watch([speed, ventilMode], () => emit('update', { value: speed.value, mode: ventilMode.value }))
</script>

<style scoped>
.ms { display: flex; align-items: center; gap: 10px; }
.ml { font-size: 13px; color: var(--text-2); flex: 1; }
.mv { font-size: 14px; font-weight: 600; color: var(--text-3); font-family: var(--font-mono); }
.mv.active { color: var(--primary); }
.prog-wrap { position: relative; height: 20px; }
.prog-bar { position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; pointer-events: none; }
.prog-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
.prog-fill.ventil { background: linear-gradient(90deg, #00d4aa, #0ea5e9); }
input[type=range] { position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; width: 100%; opacity: 0; height: 20px; cursor: pointer; margin: 0; }
.modes { display: flex; gap: 6px; flex-wrap: wrap; }
.mode-btn { flex: 1; min-width: 60px; padding: 8px 0; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 12px; font-weight: 500; cursor: pointer; transition: all var(--transition); font-family: system-ui, sans-serif; text-align: center; }
.mode-btn:hover { background: var(--surface-hover); color: var(--text); }
.mode-btn.act { background: var(--secondary-dim); border-color: rgba(14,165,233,0.3); color: var(--secondary); }
</style>
