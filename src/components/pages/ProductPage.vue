<template>
  <div v-show="visible" class="page">
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
    <div v-if="!pagedProducts.length" class="panel-card">
      <EmptyState
        title="没有匹配的产品"
        hint="换个分类或标签试试，也可以点「重置」清空筛选条件。"
        action-text="重置筛选"
        @action="$emit('resetProductFilters')"
      />
    </div>
    <div v-else class="product-grid">
      <div v-for="p in pagedProducts" :key="p.id" class="product-card">
        <div class="product-icon"><AppIcon :icon="p.icon" :size="26" /></div>
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
import EmptyState from '@/components/common/EmptyState.vue'




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
