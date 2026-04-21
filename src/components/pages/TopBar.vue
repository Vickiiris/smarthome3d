<template>
  <header class="top-bar">
    <div class="topbar-left">
      <h2 class="page-title">{{ currentTitle }}</h2>
    </div>
    <div class="topbar-right">
      <div class="time-display">
        <div class="time-main">{{ currentTime }}</div>
        <div class="time-sub">{{ currentDate }}</div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  currentTitle: { type: String, required: true },
  currentTime: { type: String, required: true },
  currentDate: { type: String, required: true },
})
</script>
