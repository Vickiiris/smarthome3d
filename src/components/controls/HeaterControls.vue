<template>
  <div class="tctrl">
    <button class="tbtn" @click="heaterTemp = Math.max(35, heaterTemp - 1)">−</button>
    <div class="tcenter">
      <span class="tn" style="color:#ff9800">{{ heaterTemp }}</span>
      <span class="tu">°C</span>
    </div>
    <button class="tbtn" @click="heaterTemp = Math.min(75, heaterTemp + 1)">+</button>
  </div>
  <div class="prog-wrap">
    <div class="prog-bar">
      <div class="prog-fill heater" :style="{ width: ((heaterTemp - 35) / 40 * 100) + '%' }"></div>
    </div>
    <input type="range" min="35" max="75" v-model="heaterTemp" />
  </div>
  <div class="modes">
    <button v-for="m in ['速热', '保温', '预约', '节能']" :key="m" class="mode-btn" :class="{ act: heaterMode === m }" @click="heaterMode = m">{{ m }}</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ value: Number, mode: String })
const emit = defineEmits(['update'])
const heaterTemp = ref(props.value ?? 55)
const heaterMode = ref(props.mode ?? '速热')
watch(() => props.value, (v) => { if (v != null) heaterTemp.value = v })
watch([heaterTemp, heaterMode], () => emit('update', { value: heaterTemp.value, mode: heaterMode.value }))
</script>

<style scoped>
.tctrl { display: flex; align-items: center; gap: 14px; justify-content: center; padding: 8px 0; }
.tbtn { width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--border-bright); background: var(--surface); color: var(--text); font-size: 22px; cursor: pointer; transition: all var(--transition); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); }
.tbtn:hover { background: var(--primary-dim); color: var(--primary); border-color: rgba(0,212,170,0.3); }
.tcenter { display: flex; align-items: baseline; gap: 2px; }
.tn { font-family: var(--font-mono); font-size: 38px; font-weight: 700; color: var(--primary); text-shadow: 0 0 20px var(--primary-glow); }
.tu { font-family: var(--font-mono); font-size: 18px; color: var(--text-2); }
.prog-wrap { position: relative; height: 20px; }
.prog-bar { position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; pointer-events: none; }
.prog-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
.prog-fill.heater { background: linear-gradient(90deg, #ff9800, #ef4444); }
input[type=range] { position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; width: 100%; opacity: 0; height: 20px; cursor: pointer; margin: 0; }
.modes { display: flex; gap: 6px; flex-wrap: wrap; }
.mode-btn { flex: 1; min-width: 60px; padding: 8px 0; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 12px; font-weight: 500; cursor: pointer; transition: all var(--transition); font-family: system-ui, sans-serif; text-align: center; }
.mode-btn:hover { background: var(--surface-hover); color: var(--text); }
.mode-btn.act { background: var(--secondary-dim); border-color: rgba(14,165,233,0.3); color: var(--secondary); }
</style>
