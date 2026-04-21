<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-fade">
        <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="toast.type">
          <span class="toast-icon">{{ toastIcon(toast.type) }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" @click="$emit('removeToast', toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  toasts: { type: Array, required: true },
})

defineEmits(['removeToast'])

function toastIcon(type) {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '🚨' }
  return icons[type] || 'ℹ️'
}
</script>
