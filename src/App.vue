<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
