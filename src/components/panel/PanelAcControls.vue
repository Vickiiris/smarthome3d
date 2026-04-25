<template>
  <div class="dcp-section">
    <div class="dcp-section-title">🌡 温度设置</div>
    <div class="dcp-temp-row">
      <button class="dcp-temp-btn" @click="adjustTemp(-1)">−</button>
      <div class="dcp-temp-display">
        <span class="dcp-temp-val">{{ value }}</span>
        <span class="dcp-temp-unit">°C</span>
      </div>
      <button class="dcp-temp-btn" @click="adjustTemp(1)">+</button>
    </div>
  </div>
  <div class="dcp-section">
    <div class="dcp-section-title">🔄 运行模式</div>
    <div class="dcp-mode-grid">
      <button v-for="m in modes" :key="m.value" class="dcp-mode-btn" :class="{ active: mode === m.value }" @click="$emit('update:mode', m.value)">
        <span>{{ m.icon }}</span><span>{{ m.label }}</span>
      </button>
    </div>
  </div>
  <div class="dcp-section">
    <div class="dcp-section-title">💨 风速调节</div>
    <div class="dcp-fan-row">
      <button v-for="s in fanSpeeds" :key="s.value" class="dcp-fan-btn" :class="{ active: fanSpeed === s.value }" @click="$emit('update:fanSpeed', s.value)">{{ s.label }}</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ value: Number, mode: String, fanSpeed: String })
const emit = defineEmits(['update:value', 'update:mode', 'update:fanSpeed'])
const modes = [{ value: 'cool', label: '制冷', icon: '❄️' }, { value: 'heat', label: '制热', icon: '🔥' }, { value: 'auto', label: '自动', icon: '🔄' }, { value: 'fan', label: '送风', icon: '💨' }]
const fanSpeeds = [{ value: 'low', label: '低速' }, { value: 'medium', label: '中速' }, { value: 'high', label: '高速' }, { value: 'auto', label: '自动' }]
function adjustTemp(d) { emit('update:value', Math.max(16, Math.min(30, props.value + d))) }
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
.dcp-mode-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.dcp-mode-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; color: #94a3b8; font-size: 11px; cursor: pointer; transition: all 0.2s; }
.dcp-mode-btn:hover { background: rgba(255,255,255,0.05); }
.dcp-mode-btn.active { background: rgba(0,212,170,0.1); border-color: rgba(0,212,170,0.3); color: #00d4aa; }
.dcp-fan-row { display: flex; gap: 8px; }
.dcp-fan-btn { flex: 1; padding: 10px 4px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; color: #94a3b8; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.dcp-fan-btn:hover { background: rgba(255,255,255,0.05); }
.dcp-fan-btn.active { background: rgba(0,212,170,0.1); border-color: rgba(0,212,170,0.3); color: #00d4aa; }
</style>
