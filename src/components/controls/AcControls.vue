<template>
  <div class="tctrl">
    <button class="tbtn" @click="temperature = Math.max(16, temperature - 1)">−</button>
    <div class="tcenter">
      <span class="tn">{{ temperature }}</span>
      <span class="tu">°C</span>
    </div>
    <button class="tbtn" @click="temperature = Math.min(30, temperature + 1)">+</button>
  </div>
  <div class="prog-wrap">
    <div class="prog-bar ac">
      <div class="prog-fill" :style="{ width: ((temperature - 16) / 14 * 100) + '%' }"></div>
    </div>
    <input type="range" min="16" max="30" v-model="temperature" />
  </div>
  <div class="modes">
    <button v-for="m in ['制冷', '制热', '送风', '自动']" :key="m" class="mode-btn" :class="{ act: acMode === m }" @click="acMode = m">{{ m }}</button>
  </div>
  <div class="ms" style="margin-top:12px">
    <span class="ml">风速</span>
  </div>
  <div class="modes">
    <button v-for="s in ['自动', '低速', '中速', '高速']" :key="s" class="mode-btn" :class="{ act: acFanSpeed === s }" @click="acFanSpeed = s">{{ s }}</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ value: Number, mode: String, fanSpeed: String })
const emit = defineEmits(['update'])
const temperature = ref(props.value ?? 24)
const acMode = ref(props.mode ?? '制冷')
const acFanSpeed = ref(props.fanSpeed ?? '自动')

watch(() => props.value, (v) => { if (v != null) temperature.value = v })
watch(() => props.mode, (v) => { if (v) acMode.value = v })
watch(() => props.fanSpeed, (v) => { if (v) acFanSpeed.value = v })
watch([temperature, acMode, acFanSpeed], () => {
  emit('update', { value: temperature.value, mode: acMode.value, fanSpeed: acFanSpeed.value })
})
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
.prog-bar.ac .prog-fill { background: linear-gradient(90deg, #4fc3f7, #00d4aa); }
.prog-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
input[type=range] { position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; width: 100%; opacity: 0; height: 20px; cursor: pointer; margin: 0; }
.modes { display: flex; gap: 6px; flex-wrap: wrap; }
.mode-btn { flex: 1; min-width: 60px; padding: 8px 0; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 12px; font-weight: 500; cursor: pointer; transition: all var(--transition); font-family: system-ui, sans-serif; text-align: center; }
.mode-btn:hover { background: var(--surface-hover); color: var(--text); }
.mode-btn.act { background: var(--secondary-dim); border-color: rgba(14,165,233,0.3); color: var(--secondary); }
.ms { display: flex; align-items: center; gap: 10px; }
.ml { font-size: 13px; color: var(--text-2); flex: 1; }
</style>
