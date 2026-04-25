<template>
  <div class="dcp-section">
    <div class="dcp-section-title">🔓 解锁控制</div>
    <div class="dcp-switch-row">
      <span class="dcp-switch-label">{{ value > 0 ? '已锁定' : '已解锁' }}</span>
      <div class="dcp-toggle" @click="$emit('update:value', value > 0 ? 0 : 1)">
        <div class="dcp-toggle-track" :class="{ on: value === 0 }"><div class="dcp-toggle-thumb"></div></div>
      </div>
    </div>
  </div>
  <div class="dcp-section">
    <div class="dcp-section-title">📹 视频对讲</div>
    <div class="dcp-grid">
      <div class="dcp-dd-item"><span class="dcp-dd-label">实时画面</span><span class="dcp-dd-value" style="color: var(--primary)">点击查看</span></div>
      <div class="dcp-dd-item"><span class="dcp-dd-label">通话状态</span><span class="dcp-dd-value">空闲中</span></div>
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
.dcp-switch-row { display: flex; align-items: center; justify-content: space-between; }
.dcp-switch-label { font-size: 13px; color: var(--text-2, #e2e8f0); }
.dcp-toggle { cursor: pointer; }
.dcp-toggle-track { width: 48px; height: 26px; background: rgba(255,255,255,0.1); border-radius: 13px; position: relative; transition: background 0.3s; }
.dcp-toggle-track.on { background: rgba(0,212,170,0.25); }
.dcp-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: #64748b; border-radius: 50%; transition: all 0.3s; }
.dcp-toggle-track.on .dcp-toggle-thumb { left: 25px; background: #00d4aa; box-shadow: 0 0 10px rgba(0,212,170,0.5); }
.dcp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dcp-dd-item { padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; display: flex; flex-direction: column; gap: 6px; }
.dcp-dd-label { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-dd-value { font-size: 12px; color: var(--text-2, #e2e8f0); line-height: 1.5; }
</style>
