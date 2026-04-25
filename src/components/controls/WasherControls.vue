<template>
  <div class="sensor-status">
    <div class="ss-item">
      <span class="ss-icon">🍽️</span>
      <span class="ss-val" :class="status ? 'ok' : ''">{{ status ? '运行中' : '待机' }}</span>
      <span class="ss-label">状态</span>
    </div>
    <div class="ss-item">
      <span class="ss-icon">⏱️</span>
      <span class="ss-val ok">45 min</span>
      <span class="ss-label">剩余时间</span>
    </div>
  </div>
  <div class="modes">
    <button v-for="m in ['标准洗', '快速洗', '强力洗', '消毒']" :key="m" class="mode-btn" :class="{ act: washerMode === m }" @click="washerMode = m">{{ m }}</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ status: Boolean, mode: String })
const emit = defineEmits(['update'])
const washerMode = ref(props.mode ?? '标准洗')
watch(() => props.mode, (v) => { if (v) washerMode.value = v })
watch(washerMode, (v) => emit('update', v))
</script>

<style scoped>
.sensor-status { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ss-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; text-align: center; }
.ss-icon { font-size: 18px; margin-bottom: 6px; display: block; }
.ss-val { font-size: 13px; font-weight: 600; color: var(--text-3); display: block; margin-bottom: 2px; }
.ss-val.ok { color: var(--success); }
.ss-label { font-size: 11px; color: var(--text-3); }
.modes { display: flex; gap: 6px; flex-wrap: wrap; }
.mode-btn { flex: 1; min-width: 60px; padding: 8px 0; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 12px; font-weight: 500; cursor: pointer; transition: all var(--transition); font-family: system-ui, sans-serif; text-align: center; }
.mode-btn:hover { background: var(--surface-hover); color: var(--text); }
.mode-btn.act { background: var(--secondary-dim); border-color: rgba(14,165,233,0.3); color: var(--secondary); }
</style>
