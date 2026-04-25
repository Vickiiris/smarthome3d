<template>
  <div class="ms">
    <span class="ml">音量</span>
    <span class="mv active">{{ volume }}%</span>
  </div>
  <div class="prog-wrap">
    <div class="prog-bar"><div class="prog-fill tv" :style="{ width: volume + '%' }"></div></div>
    <input type="range" min="0" max="100" v-model="volume" />
  </div>
  <div class="qb">
    <button v-for="v in [25, 50, 75, 100]" :key="v" class="qb-btn" :class="{ act: volume === v }" @click="volume = v">{{ v }}%</button>
  </div>
  <div class="modes">
    <button v-for="m in ['标准', '电影', '游戏', '运动']" :key="m" class="mode-btn" :class="{ act: tvMode === m }" @click="tvMode = m">{{ m }}</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ value: Number, mode: String })
const emit = defineEmits(['update'])
const volume = ref(props.value ?? 30)
const tvMode = ref(props.mode ?? '标准')
watch(() => props.value, (v) => { if (v != null) volume.value = v })
watch([volume, tvMode], () => emit('update', { value: volume.value, mode: tvMode.value }))
</script>

<style scoped>
.ms { display: flex; align-items: center; gap: 10px; }
.ml { font-size: 13px; color: var(--text-2); flex: 1; }
.mv { font-size: 14px; font-weight: 600; color: var(--text-3); font-family: var(--font-mono); }
.mv.active { color: var(--primary); }
.prog-wrap { position: relative; height: 20px; }
.prog-bar { position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; pointer-events: none; }
.prog-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
.prog-fill.tv { background: linear-gradient(90deg, #a78bfa, #818cf8); }
input[type=range] { position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; width: 100%; opacity: 0; height: 20px; cursor: pointer; margin: 0; }
.qb { display: flex; gap: 6px; }
.qb-btn { flex: 1; padding: 7px 0; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; transition: all var(--transition); font-family: system-ui, sans-serif; }
.qb-btn:hover { background: var(--surface-hover); color: var(--text); }
.qb-btn.act { background: var(--primary-dim); border-color: rgba(0,212,170,0.3); color: var(--primary); }
.modes { display: flex; gap: 6px; flex-wrap: wrap; }
.mode-btn { flex: 1; min-width: 60px; padding: 8px 0; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 12px; font-weight: 500; cursor: pointer; transition: all var(--transition); font-family: system-ui, sans-serif; text-align: center; }
.mode-btn:hover { background: var(--surface-hover); color: var(--text); }
.mode-btn.act { background: var(--secondary-dim); border-color: rgba(14,165,233,0.3); color: var(--secondary); }
</style>
