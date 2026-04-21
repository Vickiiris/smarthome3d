<template>
  <div v-show="visible" class="page">
    <div ref="sceneCardRef" class="scene-card" :class="{ fullscreen: isFullscreen }">
      <div class="scene-overlay">
        <div class="room-tabs">
          <button class="room-tab" :class="{ active: activeRoom === 'all' }" @click="$emit('switchRoom', 'all')">全景</button>
          <button v-for="room in rooms" :key="room.id" class="room-tab" :class="{ active: activeRoom === room.id }" @click="$emit('switchRoom', room.id)">{{ room.name }}</button>
        </div>
        <div class="overlay-right">
          <button v-if="isFullscreen" class="fullscreen-btn" @click="$emit('toggleFullscreen')" title="退出全屏">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          </button>
          <button v-else class="fullscreen-btn" @click="$emit('toggleFullscreen')" title="全屏">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="filter-bar">
      <select class="filter-sel" :value="productSubFilter" @change="$emit('update:productSubFilter', $event.target.value)">
        <option value="">全部产品</option>
        <option value="环境控制">环境控制</option>
        <option value="照明控制">照明控制</option>
        <option value="安防系统">安防系统</option>
        <option value="家电控制">家电控制</option>
        <option value="传感器">传感器</option>
        <option value="能源管理">能源管理</option>
      </select>
      <select class="filter-sel" :value="productTagFilter" @change="$emit('update:productTagFilter', $event.target.value)">
        <option value="">全部状态</option>
        <option value="已接入">已接入</option>
        <option value="待接入">待接入</option>
        <option value="未接入">未接入</option>
      </select>
      <button class="btn btn-primary">查询</button>
      <button class="btn btn-ghost" @click="$emit('resetProductFilters')">重置</button>
    </div>
    <div class="product-grid">
      <div v-for="p in pagedProducts" :key="p.id" class="product-card">
        <div class="product-icon">{{ p.icon }}</div>
        <div class="product-info">
          <h4 class="product-name">{{ p.name }}</h4>
          <p class="product-meta">{{ p.sub }} · {{ p.vendor }}</p>
          <span class="product-tag" :class="{
            'tag-connected': p.tag === '已接入',
            'tag-pending': p.tag === '待接入',
            'tag-offline': p.tag === '未接入'
          }">{{ p.tag }}</span>
        </div>
        <button class="btn btn-sm btn-ghost" @click="$emit('openProductDetail', p)">查看</button>
      </div>
    </div>
    <div class="pagination">
      <button class="pg-btn" :disabled="productPage <= 1" @click="$emit('update:productPage', productPage - 1)">&lt;</button>
      <button
        v-for="p in productTotalPages"
        :key="p"
        class="pg-btn"
        :class="{ active: productPage === p }"
        @click="$emit('update:productPage', p)"
      >{{ p }}</button>
      <button class="pg-btn" :disabled="productPage >= productTotalPages" @click="$emit('update:productPage', productPage + 1)">&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sceneCardRef = ref(null)

defineExpose({ sceneCardRef })

defineProps({
  visible: { type: Boolean, required: true },
  isFullscreen: { type: Boolean, required: true },
  activeRoom: { type: String, required: true },
  rooms: { type: Array, required: true },
  productSubFilter: { type: String, required: true },
  productTagFilter: { type: String, required: true },
  productPage: { type: Number, required: true },
  productTotalPages: { type: Number, required: true },
  pagedProducts: { type: Array, required: true },
})

defineEmits([
  'switchRoom', 'toggleFullscreen',
  'update:productSubFilter', 'update:productTagFilter', 'update:productPage',
  'resetProductFilters', 'openProductDetail',
])
</script>
