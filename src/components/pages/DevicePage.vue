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
      <input class="filter-in" :value="deviceSearch" @input="$emit('update:deviceSearch', $event.target.value)" placeholder="搜索设备名称…" />
      <select class="filter-sel" :value="deviceTypeFilter" @change="$emit('update:deviceTypeFilter', $event.target.value)">
        <option value="">全部类型</option>
        <option value="ac">空调/新风</option>
        <option value="light">照明/开关</option>
        <option value="outlet">插座</option>
        <option value="sensor">传感器/安防</option>
        <option value="appliance">家电</option>
      </select>
      <select class="filter-sel" :value="deviceRoomFilter" @change="$emit('update:deviceRoomFilter', $event.target.value)">
        <option value="">全部位置</option>
        <option value="客厅">客厅</option>
        <option value="主卧">主卧</option>
        <option value="次卧">次卧</option>
        <option value="厨房">厨房</option>
        <option value="卫生间">卫生间</option>
        <option value="阳台">阳台</option>
        <option value="玄关">玄关</option>
        <option value="全屋">全屋</option>
      </select>
      <button class="btn btn-ghost" @click="$emit('resetFilters')">重置</button>
      <button class="btn btn-accent" @click="$emit('openAddDevice')">+ 新增</button>
    </div>
    <div class="panel-card" style="height: 740px; display: flex; flex-direction: column;">
      <div class="panel-header"><h3 class="panel-title">设备列表</h3><span class="panel-count">{{ filteredDevices.length }} 台</span></div>
      <div style="flex: 1; overflow-y: auto; min-height: 0;">
        <table class="data-table">
          <thead><tr><th>#</th><th>设备名</th><th>位置</th><th>厂商</th><th>IP</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="(d, i) in pagedDevices" :key="d.id">
              <td class="num">{{ (devicePage - 1) * DEVICE_PAGE_SIZE + i + 1 }}</td>
              <td><span class="dot" :class="deviceOnline(d) ? 'on' : 'off'"></span> {{ d.name }}</td>
              <td>{{ d.room }}</td>
              <td>{{ d.vendor }}</td>
              <td class="ip">{{ d.ip }}</td>
              <td><span class="stag" :class="deviceOnline(d) ? 'on' : 'off'">{{ deviceOnline(d) ? '在线' : '离线' }}</span></td>
              <td>
                <button class="btn btn-sm btn-primary" @click="$emit('openDeviceControlFromTable', d)">控制</button>
                <button class="btn btn-sm btn-ghost" @click="$emit('openDeviceDetail', d)">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="pg-btn" :disabled="devicePage <= 1" @click="$emit('update:devicePage', devicePage - 1)">&lt;</button>
        <button
          v-for="p in deviceTotalPages"
          :key="p"
          class="pg-btn"
          :class="{ active: devicePage === p }"
          @click="$emit('update:devicePage', p)"
        >{{ p }}</button>
        <button class="pg-btn" :disabled="devicePage >= deviceTotalPages" @click="$emit('update:devicePage', devicePage + 1)">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const DEVICE_PAGE_SIZE = 10

const sceneCardRef = ref(null)

defineExpose({ sceneCardRef })

defineProps({
  visible: { type: Boolean, required: true },
  isFullscreen: { type: Boolean, required: true },
  activeRoom: { type: String, required: true },
  rooms: { type: Array, required: true },
  deviceSearch: { type: String, required: true },
  deviceTypeFilter: { type: String, required: true },
  deviceRoomFilter: { type: String, required: true },
  devicePage: { type: Number, required: true },
  deviceTotalPages: { type: Number, required: true },
  filteredDevices: { type: Array, required: true },
  pagedDevices: { type: Array, required: true },
  deviceOnline: { type: Function, required: true },
})

defineEmits([
  'switchRoom', 'toggleFullscreen',
  'update:deviceSearch', 'update:deviceTypeFilter', 'update:deviceRoomFilter',
  'update:devicePage', 'resetFilters', 'openAddDevice',
  'openDeviceControlFromTable', 'openDeviceDetail',
])
</script>
