<template>
  <div v-show="visible" class="page">

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
      <div class="table-scroll" style="flex: 1; min-height: 0;">
        <table class="data-table">
          <thead><tr><th>#</th><th>设备名</th><th>位置</th><th class="col-vendor">厂商</th><th class="col-ip">IP</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="(d, i) in pagedDevices" :key="d.id">
              <td class="num">{{ (devicePage - 1) * DEVICE_PAGE_SIZE + i + 1 }}</td>
              <td><span class="dot" :class="deviceOnline(d) ? 'on' : 'off'"></span> {{ d.name }}</td>
              <td class="td-room">{{ d.room }}</td>
              <td class="col-vendor">{{ d.vendor }}</td>
              <td class="ip col-ip">{{ d.ip }}</td>
              <td class="td-status"><span class="stag" :class="deviceOnline(d) ? 'on' : 'off'">{{ deviceOnline(d) ? '在线' : '离线' }}</span></td>
              <td class="td-ops">
                <button class="btn btn-sm btn-primary" @click="$emit('openDeviceControlFromTable', d)">控制</button>
                <button class="btn btn-sm btn-ghost" @click="$emit('openDeviceDetail', d)">详情</button>
              </td>
            </tr>
            <tr v-if="!pagedDevices.length">
              <td colspan="7">
                <EmptyState
                  title="没有找到设备"
                  hint="试试其它关键词，或者清空类型 / 房间筛选。"
                  action-text="重置筛选"
                  @action="$emit('resetFilters')"
                />
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
import EmptyState from '@/components/common/EmptyState.vue'


const DEVICE_PAGE_SIZE = 10



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
