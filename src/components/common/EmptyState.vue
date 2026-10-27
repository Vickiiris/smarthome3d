<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.6-3.6" />
        <path d="M8.5 11h5" />
      </svg>
    </div>
    <div class="empty-title">{{ title }}</div>
    <div v-if="hint" class="empty-hint">{{ hint }}</div>
    <button v-if="actionText" class="btn btn-ghost empty-action" @click="$emit('action')">{{ actionText }}</button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '没有找到相关内容' },
  hint: { type: String, default: '' },
  actionText: { type: String, default: '' },
})
defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 46px 20px;
  color: var(--text-3);
  text-align: center;
}
.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 170, 0.06);
  border: 1px solid rgba(0, 212, 170, 0.18);
  color: rgba(0, 212, 170, 0.65);
  margin-bottom: 4px;
}
.empty-title { font-size: 14px; color: var(--text-2); }
.empty-hint { font-size: 12.5px; color: var(--text-3); max-width: 320px; line-height: 1.6; }
.empty-action { margin-top: 10px; }
</style>
