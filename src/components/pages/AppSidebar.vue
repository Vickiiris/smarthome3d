<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 3L3 10v10l11 7 11-7V10L14 3z" stroke="white" stroke-width="2" fill="none"/>
          <circle cx="14" cy="14" r="4" fill="white" opacity="0.8"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="logo-name">SMARTHOME3D</span>
        <span class="logo-sub">智能家居</span>
      </div>
    </div>
    <nav class="nav-list">
      <div v-for="item in navItems" :key="item.id" class="nav-item" :class="{ active: currentPage === item.id }" @click="$emit('switchPage', item.id)">
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.name }}</span>
      </div>
    </nav>
    <!-- 场景模式 -->
    <div class="scene-modes">
      <div class="scene-modes-title">场景模式</div>
      <button v-for="mode in sceneModes" :key="mode.id" class="scene-mode-btn" :class="{ active: activeSceneMode === mode.id }" @click="$emit('applySceneMode', mode)">
        <span class="sm-icon">{{ mode.icon }}</span>
        <span class="sm-label">{{ mode.label }}</span>
      </button>
    </div>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="avatar">Z</div>
        <div class="user-text">
          <span class="user-name">Zy</span>
          <span class="user-role">管理员</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  navItems: { type: Array, required: true },
  currentPage: { type: String, required: true },
  sceneModes: { type: Array, required: true },
  activeSceneMode: { type: String, required: true },
})

defineEmits(['switchPage', 'applySceneMode'])
</script>
