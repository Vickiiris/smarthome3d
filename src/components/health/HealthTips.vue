<template>
  <div class="health-tips-grid">
    <div v-for="tip in tips" :key="tip.title" class="htip-card">
      <div class="htip-icon">{{ tip.icon }}</div>
      <div class="htip-body">
        <div class="htip-title">{{ tip.title }}</div>
        <div class="htip-desc">{{ tip.desc }}</div>
      </div>
      <span class="htip-tag" :style="{ color: tip.color, borderColor: tip.color, backgroundColor: tip.color + '18' }">{{ tip.tag }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ tips: { type: Array, default: () => [] } })
</script>

<style scoped>
.health-tips-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.htip-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; transition: all var(--transition); }
.htip-card:hover { background: var(--surface-hover); }
.htip-icon { font-size: 22px; min-width: 28px; }
.htip-body { flex: 1; }
.htip-title { font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.htip-desc { font-size: 11px; color: var(--text-2); line-height: 1.5; }
.htip-tag { font-size: 10px; padding: 3px 8px; border-radius: 20px; align-self: flex-start; white-space: nowrap; border: 1px solid; }
</style>
