<template>
  <div class="app">
    <AppSidebar
      :navItems="navItems"
      :currentPage="currentPage"
      :sceneModes="sceneModes"
      :activeSceneMode="activeSceneMode"
      @switchPage="switchPage"
      @applySceneMode="applySceneMode"
    />

    <main class="main">
      <TopBar :currentTitle="currentTitle" :currentTime="currentTime" :currentDate="currentDate" :allAlarms="allAlarms" @navigateToAlarm="navigateToAlarm" />

      <div class="content">

        <!-- 共享 3D Canvas（由 mountCanvas 在页面间移动） -->
        <canvas ref="canvasRef" class="three-canvas" style="display:none"></canvas>

        <!-- ===== 策略告警 ===== -->
        <AlarmPage
          :visible="currentPage === 'alarm'"
          :alarmTab="alarmTab"
          :alarmSearch="alarmSearch"
          :alarmLevelFilter="alarmLevelFilter"
          :alarmStatusFilter="alarmStatusFilter"
          :alarmPage="alarmPage"
          :strategyPage="strategyPage"
          :strategyDetailVisible="strategyDetailVisible"
          :selectedStrategy="selectedStrategy"
          :allAlarms="allAlarms"
          :strategies="strategies"
          :filteredAlarms="filteredAlarms"
          :paginatedAlarms="paginatedAlarms"
          :alarmTotalPages="alarmTotalPages"
          :visiblePages="visiblePages"
          :paginatedStrategies="paginatedStrategies"
          :strategyTotalPages="strategyTotalPages"
          :visibleStrategyPages="visibleStrategyPages"
          @switchAlarmTab="switchAlarmTab"
          @update:alarmSearch="(v) => { alarmSearch = v; alarmPage = 1 }"
          @update:alarmLevelFilter="(v) => { alarmLevelFilter = v; alarmPage = 1 }"
          @update:alarmStatusFilter="(v) => { alarmStatusFilter = v; alarmPage = 1 }"
          @update:alarmPage="(v) => alarmPage = v"
          @update:strategyPage="(v) => strategyPage = v"
          @resolveAlarm="resolveAlarm"
          @markAllAlarmsDone="markAllAlarmsDone"
          @clearDoneAlarms="clearDoneAlarms"
          @openStrategyDetail="openStrategyDetail"
          @closeStrategyDetail="strategyDetailVisible = false"
          @toggleStrategy="(s) => s.active = !s.active"
        />

        <!-- ===== 环境总览 ===== -->
        <EnvPage
          ref="envPageRef"
          :visible="currentPage === 'env'"
          :isFullscreen="isFullscreen"
          :activeRoom="activeRoom"
          :rooms="rooms"
          :envItems="envItems"
          :activeDeviceTab="activeDeviceTab"
          :envDevices="envDevices"
          :entertainmentDevices="entertainmentDevices"
          :linkedSecurityItems="linkedSecurityItems"
          :formatMetricValue="formatMetricValue"
          :getDeviceColor="getDeviceColor"
          @switchRoom="switchRoom"
          @toggleFullscreen="toggleFullscreen"
          @showEnvDetail="showEnvDetail"
          @update:activeDeviceTab="(v) => activeDeviceTab = v"
          @flyToDeviceRoom="flyToDeviceRoom"
          @toggleDevice="toggleDevice"
          @openDeviceControl="openDeviceControl"
          @openSecurityControl="openSecurityControl"
        />

        <!-- ===== 能源管理 ===== -->
        <EnergyPage
          ref="energyPageRef"
          :visible="currentPage === 'energy'"
          :isFullscreen="isFullscreen"
          :activeRoom="activeRoom"
          :rooms="rooms"
          :dailyEnergy="(chartData?.energyLine || []).reduce((a, b) => a + b, 0)"
          :waterToday="energyLiveData.waterToday"
          :gasToday="energyLiveData.gasToday"
          :electricTrend="electricTrend"
          :waterTrend="waterTrend"
          :gasTrend="gasTrend"
          :costTrend="costTrend"
          :rankTab="rankTab"
          :currentRankList="currentRankList"
          :carbonReduction="energyLiveData.carbonReduction"
          :savingRate="energyLiveData.savingRate"
          :electricPeriod="electricPeriod"
          :waterPeriod="waterPeriod"
          :gasPeriod="gasPeriod"
          :electricPiePeriod="electricPiePeriod"
          :waterPiePeriod="waterPiePeriod"
          :gasPiePeriod="gasPiePeriod"
          @switchRoom="switchRoom"
          @toggleFullscreen="toggleFullscreen"
          @openEnergyDetail="openEnergyDetail"
          @openCostTotal="openCostTotalDetail"
          @update:rankTab="(v) => rankTab = v"
          @update:electricPeriod="(v) => { electricPeriod = v; updateEnergyChart('electric') }"
          @update:waterPeriod="(v) => { waterPeriod = v; updateEnergyChart('water') }"
          @update:gasPeriod="(v) => { gasPeriod = v; updateEnergyChart('gas') }"
          @update:electricPiePeriod="(v) => { electricPiePeriod = v; updatePieChart('electric') }"
          @update:waterPiePeriod="(v) => { waterPiePeriod = v; updatePieChart('water') }"
          @update:gasPiePeriod="(v) => { gasPiePeriod = v; updatePieChart('gas') }"
        />

        <!-- ===== 健康监测 ===== -->
        <HealthPage
          :visible="currentPage === 'health'"
          :healthItems="healthItems"
          :heartRateData="heartRateData"
          :bpWeekData="bpWeekData"
          :spo2Trend="spo2TrendData"
          :tempTrend="temperatureTrendData"
          :stepsTrend="stepsTrendData"
          :sleepData="sleepData"
          :formatMetricValue="formatMetricValue"
          :getHeartStatus="getHeartStatus"
          :getBpStatus="getBpStatus"
          :getSpo2Status="getSpo2Status"
          :getTempStatus="getTempStatus"
          :getStepsStatus="getStepsStatus"
          @openHealthDetail="openHealthDetail"
        />

        <!-- ===== 设备管理 ===== -->
        <DevicePage
          ref="devicePageRef"
          :visible="currentPage === 'device'"
          :isFullscreen="isFullscreen"
          :activeRoom="activeRoom"
          :rooms="rooms"
          :deviceSearch="deviceSearch"
          :deviceTypeFilter="deviceTypeFilter"
          :deviceRoomFilter="deviceRoomFilter"
          :devicePage="devicePage"
          :deviceTotalPages="deviceTotalPages"
          :filteredDevices="filteredDevices"
          :pagedDevices="pagedDevices"
          :deviceOnline="deviceOnline"
          @switchRoom="switchRoom"
          @toggleFullscreen="toggleFullscreen"
          @update:deviceSearch="(v) => { deviceSearch = v; devicePage = 1 }"
          @update:deviceTypeFilter="(v) => { deviceTypeFilter = v; devicePage = 1 }"
          @update:deviceRoomFilter="(v) => { deviceRoomFilter = v; devicePage = 1 }"
          @update:devicePage="(v) => devicePage = v"
          @resetFilters="() => { deviceSearch = ''; deviceTypeFilter = ''; deviceRoomFilter = ''; devicePage = 1 }"
          @openAddDevice="openAddDevice"
          @openDeviceControlFromTable="openDeviceControlFromTable"
          @openDeviceDetail="openDeviceDetail"
        />

        <!-- ===== 产品中心 ===== -->
        <ProductPage
          ref="productPageRef"
          :visible="currentPage === 'product'"
          :isFullscreen="isFullscreen"
          :activeRoom="activeRoom"
          :rooms="rooms"
          :productSubFilter="productSubFilter"
          :productTagFilter="productTagFilter"
          :productPage="productPage"
          :productTotalPages="productTotalPages"
          :pagedProducts="pagedProducts"
          @switchRoom="switchRoom"
          @toggleFullscreen="toggleFullscreen"
          @update:productSubFilter="(v) => { productSubFilter = v; productPage = 1 }"
          @update:productTagFilter="(v) => { productTagFilter = v; productPage = 1 }"
          @update:productPage="(v) => productPage = v"
          @resetProductFilters="() => { productSubFilter = ''; productTagFilter = ''; productPage = 1 }"
          @openProductDetail="openProductDetail"
        />

      </div>
    </main>
  </div>

  <!-- 所有弹窗 -->
  <HomeModals
    :envDetailVisible="envDetailVisible"
    :envDetailItem="envDetailItem"
    :envDetailMap="envDetailMap"
    :getHealthTips="getHealthTips"
    :formatMetricValue="formatMetricValue"
    :healthDetailVisible="healthDetailVisible"
    :healthDetailItem="healthDetailItem"
    :healthDetailMap="healthDetailMap"
    :showDeviceDetail="showDeviceDetail"
    :deviceDetailItem="deviceDetailItem"
    :showProductDetail="showProductDetail"
    :productDetailItem="productDetailItem"
    :addDeviceVisible="addDeviceVisible"
    :addStep="addStep"
    :addFormError="addFormError"
    :successMsg="successMsg"
    :newDevice="newDevice"
    :roomOptions="roomOptions"
    :deviceTypeOptions="deviceTypeOptions"
    :scanning="scanning"
    :scanProgress="scanProgress"
    :scanStatus="scanStatus"
    :scanResults="scanResults"
    :scanSelected="scanSelected"
    @closeEnvDetail="envDetailVisible = false"
    @closeHealthDetail="healthDetailVisible = false"
    @closeDeviceDetail="showDeviceDetail = false"
    @closeProductDetail="showProductDetail = false"
    @closeAddDevice="closeAddDevice"
    @setAddStep="(v) => addStep = v"
    @startScan="startScan"
    @updateNewDevice="(k, v) => newDevice[k] = v"
    @submitManualAdd="submitManualAdd"
    @toggleScanSelect="toggleScanSelect"
    @submitScanAdd="submitScanAdd"
  />

  <!-- 设备控制弹窗 -->
  <DeviceControlModal
    :visible="showControlPanel"
    :device="selectedDevice"
    :chartData="chartData"
    :energyLiveData="energyLiveData"
    @close="showControlPanel = false"
    @toggle="toggleSelectedDevice"
    @update="onDeviceUpdate"
  />

  <!-- 右侧滑入控制面板 -->
  <DeviceControlPanel
    :visible="showSlidePanel"
    :device="selectedHotspotDevice"
    @close="showSlidePanel = false"
    @update="onDeviceUpdate"
  />

  <!-- Toast 通知 -->
  <ToastContainer :toasts="homeStore.toasts" @removeToast="homeStore.removeToast" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useHomeStore } from '@/stores/homeStore'
import { useThreeScene } from '@/composables/useThreeScene'
import { useAppData } from '@/composables/useAppData'
import { useEnvDetail } from '@/composables/useEnvDetail'
import { useDeviceControl } from '@/composables/useDeviceControl'
import { useEnergyChart } from '@/composables/useEnergyChart'
import { useSceneModes } from '@/composables/useSceneModes'
import { useAlarm } from '@/composables/useAlarm'
import { initStepsSimulation, simulateStepsPerTick, stepsSim } from '@/composables/useStepsSim'
import DeviceControlModal from '@/components/DeviceControlModal.vue'
import DeviceControlPanel from '@/components/DeviceControlPanel.vue'
import AppSidebar from '@/components/pages/AppSidebar.vue'
import TopBar from '@/components/pages/TopBar.vue'
import ToastContainer from '@/components/pages/ToastContainer.vue'
import AlarmPage from '@/components/pages/AlarmPage.vue'
import EnvPage from '@/components/pages/EnvPage.vue'
import EnergyPage from '@/components/pages/EnergyPage.vue'
import HealthPage from '@/components/pages/HealthPage.vue'
import DevicePage from '@/components/pages/DevicePage.vue'
import ProductPage from '@/components/pages/ProductPage.vue'
import HomeModals from '@/components/pages/HomeModals.vue'

const homeStore = useHomeStore()

// ===== Composables =====
const {
  deviceList, GATEWAY_TYPES,
  healthItems, heartRateData, bpWeekData, spo2TrendData, temperatureTrendData, stepsTrendData, sleepData,
  allAlarms, strategies, products,
  navItems, rooms,
} = useAppData()

const {
  envDetailVisible, envDetailLabel, envDetailItem, envDetailMap,
  envItems, getEnvColor, showEnvDetail, closeEnvDetail,
  healthDetailVisible, healthDetailLabel, healthDetailItem, healthDetailMap,
  openHealthDetail, closeHealthDetail, getHealthTips,
} = useEnvDetail(homeStore)

const {
  showControlPanel, selectedDevice, showSlidePanel, selectedHotspotDevice,
  showDeviceDetail, deviceDetailId, deviceDetailItem, iconMap,
  deviceSearch, activeDeviceTab, deviceRoomFilter, deviceTypeFilter, devicePage, DEVICE_PAGE_SIZE,
  allDevices, envDevices, entertainmentDevices, filteredDevices, deviceTotalPages, pagedDevices,
  deviceOnline, onDeviceUpdate, toggleDevice, openDeviceControl, openDeviceControlFromTable,
  openSecurityControl, toggleSelectedDevice, openDeviceDetail, closeDeviceDetail,
  getDeviceColor, deviceTypeLabel, deviceTypeDesc, deviceTypeTips, deviceUsageTime, devicePowerStats,
  addDeviceVisible, addStep, addFormError, successMsg, roomOptions, deviceTypeOptions, newDevice,
  openAddDevice, closeAddDevice, submitManualAdd,
  scanning, scanProgress, scanStatus, scanResults, scanSelected,
  startScan, toggleScanSelect, submitScanAdd,
} = useDeviceControl(deviceList, GATEWAY_TYPES)

const {
  chartData, energyLiveData,
  electricTrend, waterTrend, gasTrend, costTrend,
  electricPeriod, waterPeriod, gasPeriod, electricPiePeriod, waterPiePeriod, gasPiePeriod,
  energyWeekData, energyMonthData, energyYearData,
  waterWeekData, waterMonthData, waterYearData,
  gasWeekData, gasMonthData, gasYearData,
  energyPieWeekData, energyPieMonthData, energyPieYearData,
  waterPieWeekData, waterPieMonthData, waterPieYearData,
  gasPieWeekData, gasPieMonthData, gasPieYearData,
  energyRank, waterRank, gasRank, rankTab, currentRankList,
  hourLabels, DAILY_BASE_ELECTRIC, DAILY_BASE_WATER, DAILY_BASE_GAS,
  ENERGY_KH, WATER_KH, GAS_KH,
  calcEnergyAt, getCurrentHour, computeRankPeriods, calculateTrends, makeTrend,
  dailyR1_Electric: dailyR1_Electric_fn, dailyR1_Water: dailyR1_Water_fn, dailyR1_Gas: dailyR1_Gas_fn,
  hourlyR2_Electric: hourlyR2_Electric_fn, hourlyR2_Water: hourlyR2_Water_fn, hourlyR2_Gas: hourlyR2_Gas_fn,
  resetDailyR1, resetHourlyR2,
} = useEnergyChart(deviceList)

const {
  activeSceneMode, sceneModes, applySceneMode, getLightIdForDevice,
} = useSceneModes(deviceList, null, homeStore) // threeScene set below

const {
  alarmTab, alarmSearch, alarmLevelFilter, alarmStatusFilter,
  alarmPage, strategyPage, PAGE_SIZE, STRATEGY_PAGE_SIZE,
  strategyDetailVisible, selectedStrategy,
  switchAlarmTab, resolveAlarm, markAllAlarmsDone, clearDoneAlarms, openStrategyDetail,
  filteredAlarms, paginatedAlarms, alarmTotalPages, visiblePages,
  paginatedStrategies, strategyTotalPages, visibleStrategyPages,
} = useAlarm(allAlarms, strategies)

// ===== Navigation & UI =====
const currentPage = ref('env')
const isFullscreen = ref(false)
const activeRoom = ref('all')
const canvasRef = ref(null)
const threeScene = useThreeScene(canvasRef)
const { flyToRoom, resetView, onHotspotClick, activeRoomId } = threeScene

// Patch sceneModes with real threeScene
const sceneModesData = useSceneModes(deviceList, threeScene, homeStore)

watch(activeRoomId, (id) => { activeRoom.value = id })

onHotspotClick.value = (hotspot) => {
  if (!isFullscreen.value) return
  const matched = deviceList.value.find(d => d.name === hotspot.name)
  selectedHotspotDevice.value = {
    id: hotspot.id, name: hotspot.name, type: hotspot.type || 'ac', room: hotspot.room || '主卧',
    status: matched?.status ?? true, value: matched?.value ?? (hotspot.type === 'ac' ? 24 : hotspot.type === 'light' ? 80 : 50),
    mode: matched?.mode ?? 'cool', fanSpeed: matched?.fanSpeed ?? 'auto',
    ip: matched?.ip ?? null, vendor: matched?.vendor ?? '未知',
    online: matched ? deviceOnline(matched) : true, icon: matched?.icon ?? null,
  }
  showSlidePanel.value = true
}

const envPageRef = ref(null), energyPageRef = ref(null), devicePageRef = ref(null), productPageRef = ref(null)
let canvasPage = ''

function mountCanvas(targetPage) {
  if (targetPage === canvasPage) {
    if (!canvasRef.value?.parentElement) {
      const canvas = canvasRef.value; if (!canvas) return
      const targets = { env: envPageRef.value?.sceneCardRef, energy: energyPageRef.value?.sceneCardRef, device: devicePageRef.value?.sceneCardRef, product: productPageRef.value?.sceneCardRef }
      const target = targets[targetPage]; if (!target) return
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas)
      target.appendChild(canvas); canvas.style.display = ''; canvasPage = targetPage
    }
    return
  }
  const canvas = canvasRef.value; if (!canvas) return
  const targets = { env: envPageRef.value?.sceneCardRef, energy: energyPageRef.value?.sceneCardRef, device: devicePageRef.value?.sceneCardRef, product: productPageRef.value?.sceneCardRef }
  const target = targets[targetPage]
  if (!target) { setTimeout(() => mountCanvas(targetPage), 100); return }
  if (canvas.parentElement) canvas.parentElement.removeChild(canvas)
  target.appendChild(canvas); canvas.style.display = ''; canvasPage = targetPage
  setTimeout(() => { threeScene.initScene(); window.dispatchEvent(new Event('resize')) }, 50)
}

const currentTime = ref(''), currentDate = ref('')
let timeTimer, envTimer, healthTimer, energyTimer, stepsTimer
function updateTime() { const n = new Date(); currentTime.value = n.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }); currentDate.value = n.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }) }

const currentTitle = computed(() => navItems.find(n => n.id === currentPage.value)?.name ?? '')

function switchPage(id) {
  if (isFullscreen.value || activeRoom.value !== 'all') {
    isFullscreen.value = false; closeAllPanels(); resetView(); activeRoom.value = 'all'; activeRoomId.value = 'all'
    setTimeout(() => threeScene.resize(), 150)
  }
  currentPage.value = id
  if (id !== 'health') nextTick(() => mountCanvas(id))
  if (id === 'energy') setTimeout(() => initCharts(), 100)
}

function navigateToAlarm() {
  switchPage('alarm')
}

function closeAllPanels() {
  showSlidePanel.value = false; showControlPanel.value = false; showDeviceDetail.value = false
  envDetailVisible.value = false; healthDetailVisible.value = false; addDeviceVisible.value = false
}

function switchRoom(roomId) { activeRoom.value = roomId; activeRoomId.value = roomId; if (roomId === 'all') resetView(); else flyToRoom(roomId) }
function flyToDeviceRoom(device) { const map = { '客厅': 'living-room', '主卧': 'bedroom', '次卧': 'bedroom2', '厨房': 'kitchen', '卫生间': 'bathroom' }; const id = map[device.room]; if (id) switchRoom(id) }
function toggleFullscreen() {
  const was = isFullscreen.value; isFullscreen.value = !isFullscreen.value
  if (was) { closeAllPanels(); resetView(); activeRoom.value = 'all'; activeRoomId.value = 'all' }
  setTimeout(() => threeScene.resize(), 200)
}

function toastIcon(type) { return { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '🚨' }[type] || 'ℹ️' }

// ===== Security items =====
const securityItems = [
  { icon: '🚪', label: '门禁', value: '已锁', cls: 'ok', color: '#22c55e', sensorIds: ['dev18'] },
  { icon: '💨', label: '烟雾', value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev23'] },
  { icon: '🔥', label: '燃气', value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev23'] },
  { icon: '📹', label: '摄像头', value: '运行', cls: 'ok', color: '#22c55e', sensorIds: ['dev17'] },
  { icon: '🚨', label: '安防状态', value: '在家', cls: 'ok', color: '#22c55e', sensorIds: [] },
  { icon: '💧', label: '漏水', value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev24'] },
]
const linkedSecurityItems = computed(() => securityItems.map(item => {
  if (item.sensorIds?.length > 0) {
    const sensors = allDevices.value.filter(d => item.sensorIds.includes(d.id))
    if (sensors.length > 0 && sensors.every(s => !s.status)) return { ...item, value: '离线', cls: 'offline', color: '#6b7280' }
  }
  return item
}))

// ===== Health status helpers =====
function getHeartStatus(value) { if (value < 60) return { text: '偏低', class: 'warning' }; if (value <= 100) return { text: '正常', class: 'normal' }; if (value <= 120) return { text: '略高', class: 'warning' }; return { text: '偏高', class: 'danger' } }
function getBpStatus(sys, dia) { if (sys < 90 || dia < 60) return { text: '偏低', class: 'warning' }; if (sys <= 120 && dia <= 80) return { text: '理想', class: 'normal' }; if (sys <= 139 || dia <= 89) return { text: '正常高值', class: 'warning' }; return { text: '偏高', class: 'danger' } }
function getSpo2Status(value) { if (value >= 95) return { text: '正常', class: 'normal' }; if (value >= 90) return { text: '偏低', class: 'warning' }; return { text: '危险', class: 'danger' } }
function getTempStatus(value) { if (value < 36.1) return { text: '偏低', class: 'warning' }; if (value <= 37.2) return { text: '正常', class: 'normal' }; if (value <= 38.0) return { text: '低热', class: 'warning' }; return { text: '发烧', class: 'danger' } }
function getStepsStatus(value) { if (value >= 10000) return { text: '已达标', class: 'normal' }; if (value >= 6000) return { text: '进行中', class: 'warning' }; return { text: '不足', class: 'danger' } }
function formatMetricValue(str) { return str ? str.replace(/([a-zA-Z0-9.,%°]+)/g, '<span class="num">$1</span>') : '' }

// ===== Product helpers =====
const showProductDetail = ref(false), productDetailId = ref(0)
const productDetailItem = computed(() => productDetailId.value ? products.value.find(p => p.id === productDetailId.value) || null : null)
function openProductDetail(product) { productDetailId.value = product.id; showProductDetail.value = true }
function productStatusColor(tag) { return { '已接入': '#00d4aa', '待接入': '#0ea5e9', '未接入': '#ef4444' }[tag] || 'var(--text-2)' }

const productSubFilter = ref(''), productTagFilter = ref(''), productPage = ref(1)
const PRODUCT_PAGE_SIZE = 12
const filteredProducts = computed(() => {
  let list = products.value.filter(p => (!productSubFilter.value || p.sub === productSubFilter.value) && (!productTagFilter.value || p.tag === productTagFilter.value))
  const order = { '已接入': 1, '待接入': 2, '未接入': 3 }; list.sort((a, b) => (order[a.tag] || 4) - (order[b.tag] || 4)); return list
})
const productTotalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / PRODUCT_PAGE_SIZE)))
const pagedProducts = computed(() => { if (productPage.value > productTotalPages.value) productPage.value = 1; return filteredProducts.value.slice((productPage.value - 1) * PRODUCT_PAGE_SIZE, productPage.value * PRODUCT_PAGE_SIZE) })

// ===== Energy chart instances & init =====
let lineChart=null, pieChart=null, waterChart=null, gasChart=null, waterPieChart=null, gasPieChart=null

async function initCharts() {
  const ec = await import('echarts')
  const refs = energyPageRef.value || {}
  const { lineChartRef, pieChartRef, waterChartRef, gasChartRef, waterPieChartRef, gasPieChartRef } = refs
  const hour = getCurrentHour()
  if (lineChartRef && !lineChart) {
    lineChart = ec.init(lineChartRef)
    lineChart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 }, formatter: (params) => { const p = params[0]; return `${p.name}<br/>${p.marker} 用电: ${Number(p.value).toFixed(4)} kWh` } }, grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true }, xAxis: { type: 'category', boundaryGap: false, data: hourLabels.slice(0, hour + 1), axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } }, yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } }, series: [{ data: chartData.value.energyLine.slice(0, hour + 1), type: 'line', smooth: true, lineStyle: { color: '#00d4aa', width: 3 }, areaStyle: { color: new ec.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,212,170,0.25)'},{offset:1,color:'rgba(0,212,170,0)'}]) }, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#00d4aa' } }] })
  }
  if (pieChartRef && !pieChart) { pieChart = ec.init(pieChartRef); pieChart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'item', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } }, series: [{ type: 'pie', radius: ['50%','75%'], center: ['50%','50%'], data: chartData.value.energyPie, label: { color: '#94a3b8', fontSize: 12 }, labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } }] }) }
  if (waterChartRef && !waterChart) { waterChart = ec.init(waterChartRef); waterChart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 }, formatter: (params) => { const p = params[0]; return `${p.name}<br/>${p.marker} 用水: ${Number(p.value).toFixed(4)} m³` } }, grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true }, xAxis: { type: 'category', data: hourLabels.slice(0, hour + 1), axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } }, yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } }, series: [{ data: chartData.value.waterBar.slice(0, hour + 1), type: 'bar', barWidth: '50%', itemStyle: { color: new ec.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#4fc3f7'},{offset:1,color:'rgba(79,195,247,0.3)'}]), borderRadius: [4,4,0,0] } }] }) }
  if (gasChartRef && !gasChart) { gasChart = ec.init(gasChartRef); gasChart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 }, formatter: (params) => { const p = params[0]; return `${p.name}<br/>${p.marker} 燃气: ${Number(p.value).toFixed(4)} m³` } }, grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true }, xAxis: { type: 'category', boundaryGap: false, data: hourLabels.slice(0, hour + 1), axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } }, yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } }, series: [{ data: chartData.value.gasLine.slice(0, hour + 1), type: 'line', smooth: true, lineStyle: { color: '#ff7043', width: 3, type: 'dashed' }, symbol: 'triangle', symbolSize: 8, itemStyle: { color: '#ff7043' } }] }) }
  if (waterPieChartRef && !waterPieChart) { waterPieChart = ec.init(waterPieChartRef); waterPieChart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } }, grid: { left: '3%', right: '15%', top: '5%', bottom: '5%', containLabel: true }, xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: ['其他', '厨房', '洗衣', '淋浴'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#94a3b8', fontSize: 11 } }, series: [{ type: 'bar', barWidth: '50%', data: chartData.value.waterPie, label: { show: true, position: 'right', color: '#94a3b8', fontSize: 11, formatter: '{c}%' } }] }) }
  if (gasPieChartRef && !gasPieChart) { gasPieChart = ec.init(gasPieChartRef); gasPieChart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'item', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } }, series: [{ type: 'pie', radius: [20, 70], center: ['50%','50%'], roseType: 'radius', itemStyle: { borderRadius: 5 }, data: chartData.value.gasPie, label: { color: '#94a3b8', fontSize: 12 }, labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } }] }) }
}

function updateEnergyChart(type) {
  const hour = getCurrentHour()
  if ((type === 'electric' || type === 'all') && lineChart) {
    const period = electricPeriod.value; let labels, values
    if (period === '日') { labels = hourLabels.slice(0, hour+1); values = chartData.value.energyLine.slice(0, hour+1) }
    else if (period === '周') { labels = energyWeekData.labels; values = energyWeekData.values }
    else if (period === '月') { labels = energyMonthData.labels; values = energyMonthData.values }
    else { labels = energyYearData.labels; values = energyYearData.values }
    lineChart.setOption({ xAxis: { data: labels }, series: [{ data: values }] })
  }
  if ((type === 'water' || type === 'all') && waterChart) {
    const period = waterPeriod.value; let labels, values
    if (period === '日') { labels = hourLabels.slice(0, hour+1); values = chartData.value.waterBar.slice(0, hour+1) }
    else if (period === '周') { labels = waterWeekData.labels; values = waterWeekData.values }
    else if (period === '月') { labels = waterMonthData.labels; values = waterMonthData.values }
    else { labels = waterYearData.labels; values = waterYearData.values }
    waterChart.setOption({ xAxis: { data: labels }, series: [{ data: values }] })
  }
  if ((type === 'gas' || type === 'all') && gasChart) {
    const period = gasPeriod.value; let labels, values
    if (period === '日') { labels = hourLabels.slice(0, hour+1); values = chartData.value.gasLine.slice(0, hour+1) }
    else if (period === '周') { labels = gasWeekData.labels; values = gasWeekData.values }
    else if (period === '月') { labels = gasMonthData.labels; values = gasMonthData.values }
    else { labels = gasYearData.labels; values = gasYearData.values }
    gasChart.setOption({ xAxis: { data: labels }, series: [{ data: values }] })
  }
}

function updatePieChart(type) {
  if ((type === 'electric' || type === 'all') && pieChart) { const p = electricPiePeriod.value; pieChart.setOption({ series: [{ data: p === '日' ? chartData.value.energyPie : p === '周' ? energyPieWeekData : p === '月' ? energyPieMonthData : energyPieYearData }] }) }
  if ((type === 'water' || type === 'all') && waterPieChart) { const p = waterPiePeriod.value; waterPieChart.setOption({ series: [{ data: p === '日' ? chartData.value.waterPie : p === '周' ? waterPieWeekData : p === '月' ? waterPieMonthData : waterPieYearData }] }) }
  if ((type === 'gas' || type === 'all') && gasPieChart) { const p = gasPiePeriod.value; gasPieChart.setOption({ series: [{ data: p === '日' ? chartData.value.gasPie : p === '周' ? gasPieWeekData : p === '月' ? gasPieMonthData : gasPieYearData }] }) }
}

// Energy detail (from device control - openEnergyDetail, openCostTotalDetail)
function openEnergyDetail(type, item = null) {
  if (type.endsWith('-rank') && item) {
    const rankType = type.replace('-rank', '')
    const units = { electric: 'kWh', water: 'm³', gas: 'm³' }
    const rankSrc = rankType === 'water' ? waterRank.value : rankType === 'gas' ? gasRank.value : energyRank.value
    const rankItem = rankSrc.find(r => r.name === item.name) || item
    selectedDevice.value = { id: type, name: item.name + ' 分时段耗能', icon: item.icon, type: 'energy', title: item.name + ' 分时段耗能', unit: units[rankType], value: rankItem.val, periods: computeRankPeriods(rankType, rankItem.val), _rankType: rankType, _rankItemName: item.name, desc: '今日各时段能耗明细' }
    showControlPanel.value = true; return
  }
  const dailyE = chartData.value.energyLine.reduce((a,b)=>a+b,0)
  const dailyW = energyLiveData.value.waterToday, dailyG = energyLiveData.value.gasToday
  const electricCost = (dailyE*0.558).toFixed(3), waterCost = (dailyW*2.47).toFixed(3), gasCost = (dailyG*2.53).toFixed(3)
  const energyData = {
    today: { title: '今日用电详情', unit: 'kWh', value: dailyE.toFixed(3), trend: electricTrend.value.label, desc: '今日累计用电量', rankList: energyRank.value },
    power: { title: '实时功率', unit: 'kW', value: homeStore.stats.energyUsage.toFixed(3), trend: '', desc: '当前用电功率' },
    total: { title: '累计用电', unit: 'kWh', value: energyLiveData.value.totalEnergy, trend: '', desc: '本月累计用电' },
    saving: { title: '节能率', unit: '%', value: energyLiveData.value.savingRate, trend: '', desc: '相比历史平均节能比例' },
    carbon: { title: '碳减排量', unit: 'kg', value: energyLiveData.value.carbonReduction, trend: '', desc: '相当于减少的二氧化碳排放', savingRate: energyLiveData.value.savingRate },
    water: { title: '今日用水详情', unit: 'm³', value: dailyW.toFixed(3), trend: waterTrend.value.label, desc: '今日累计用水量', rankList: waterRank.value },
    gas: { title: '今日燃气详情', unit: 'm³', value: dailyG.toFixed(3), trend: gasTrend.value.label, desc: '今日累计燃气用量', rankList: gasRank.value },
    cost: { title: '今日费用详情', unit: '元', value: (parseFloat(electricCost)+parseFloat(waterCost)+parseFloat(gasCost)).toFixed(3), trend: costTrend.value.label, desc: '今日电费+水费+燃气费', _electricCost: electricCost, _waterCost: waterCost, _gasCost: gasCost },
    electricCost: { title: '电费详情', unit: '元', value: electricCost, trend: electricTrend.value.label, desc: '今日电费支出', rankList: energyRank.value, _rate: '0.558元/kWh' },
    waterCost: { title: '水费详情', unit: '元', value: waterCost, trend: waterTrend.value.label, desc: '今日水费支出', rankList: waterRank.value },
    gasCost: { title: '燃气费详情', unit: '元', value: gasCost, trend: gasTrend.value.label, desc: '今日燃气费支出', rankList: gasRank.value },
  }
  const data = energyData[type] || energyData.today
  selectedDevice.value = { id: 'energy-'+type, name: data.title, icon: { water:'💧', gas:'🔥', waterCost:'💧', gasCost:'🔥', cost:'💰' }[type] || '⚡', type: 'energy', status: true, value: data.value, unit: data.unit, trend: data.trend, desc: data.desc, room: '全屋', energyType: type, _savingRate: data.savingRate || energyLiveData.value.savingRate, _rankList: data.rankList || [], _electricCost: data._electricCost || electricCost, _waterCost: data._waterCost || waterCost, _gasCost: data._gasCost || gasCost }
  showControlPanel.value = true
}

function openCostTotalDetail() {
  const dailyE = chartData.value.energyLine.reduce((a,b)=>a+b,0)
  const dailyW = energyLiveData.value.waterToday, dailyG = energyLiveData.value.gasToday
  const electricCost = (dailyE*0.558).toFixed(3), waterCost = (dailyW*2.47).toFixed(3), gasCost = (dailyG*2.53).toFixed(3)
  selectedDevice.value = { id: 'energy-cost-total', name: '费用总计详情', icon: '💰', type: 'energy', status: true, value: (parseFloat(electricCost)+parseFloat(waterCost)+parseFloat(gasCost)).toFixed(3), unit: '元', trend: costTrend.value.label, desc: '今日电费+水费+燃气费', room: '全屋', energyType: 'cost', _electricCost: electricCost, _waterCost: waterCost, _gasCost: gasCost }
  showControlPanel.value = true
}

// ===== Timers =====
onMounted(() => {
  updateTime(); timeTimer = setInterval(updateTime, 1000)
  nextTick(() => mountCanvas('env'))
  window.addEventListener('resize', () => { lineChart?.resize(); pieChart?.resize(); waterChart?.resize(); gasChart?.resize(); waterPieChart?.resize(); gasPieChart?.resize() })

  initStepsSimulation(healthItems, stepsTrendData)
  stepsTimer = setInterval(() => simulateStepsPerTick(healthItems, stepsTrendData), 4000)

  envTimer = setInterval(() => { const { alerts } = homeStore.simulateEnvData(1); alerts.forEach(a => { if (a.type === 'danger') homeStore.addToast({ message: a.msg, type: a.type, duration: 5000 }) }) }, 3000)

  let _prevHeart = 72, _prevSpo2 = 98, _prevTemp = 36.5
  healthTimer = setInterval(() => {
    const items = healthItems.value
    const hr = Math.round(items[0].raw + (Math.random() - 0.5) * 6); items[0].raw = Math.max(55, Math.min(110, hr)); items[0].value = items[0].raw + '次/分'; items[0].pct = Math.min(100, Math.max(0, ((items[0].raw - 40) / 80) * 100)); items[0].trend = items[0].raw - _prevHeart; _prevHeart = items[0].raw
    const sys = Math.round(items[1].raw + (Math.random() - 0.5) * 6); const dia = Math.round(sys * 0.64 + (Math.random() - 0.5) * 4); items[1].raw = Math.max(90, Math.min(145, sys)); items[1].value = items[1].raw + '/' + Math.max(55, Math.min(95, dia)) + 'mmHg'; items[1].pct = Math.min(100, Math.max(0, ((items[1].raw - 80) / 80) * 100)); items[1].trend = 0
    const temp = Math.round((items[2].raw + (Math.random() - 0.5) * 0.2) * 10) / 10; items[2].raw = Math.max(35.5, Math.min(38.0, temp)); items[2].value = items[2].raw + '°C'; items[2].pct = Math.min(100, Math.max(0, ((items[2].raw - 35) / 4) * 100)); items[2].trend = Math.round((items[2].raw - _prevTemp) * 10) / 10; _prevTemp = items[2].raw
    const spo2 = Math.round(items[3].raw + (Math.random() - 0.5) * 2); items[3].raw = Math.max(92, Math.min(100, spo2)); items[3].value = items[3].raw + '%'; items[3].pct = items[3].raw; items[3].trend = items[3].raw - _prevSpo2; _prevSpo2 = items[3].raw
    const stepsIdx = stepsTrendData.value.length - 1; stepsTrendData.value = stepsTrendData.value.map((item, i) => i === stepsIdx ? { ...item, value: stepsSim.accumulated } : item)
  }, 4000)

  energyTimer = setInterval(() => {
    const cd = chartData.value; const hour = getCurrentHour(); const now = new Date()
    if (hour === 0 && cd.energyLine[23] > 0) { cd.energyLine = Array.from({length:24},()=>0); cd.waterBar = Array.from({length:24},()=>0); cd.gasLine = Array.from({length:24},()=>0); resetDailyR1(); resetHourlyR2(); initCharts() }
    if (electricPeriod.value === '日') { const m = now.getMinutes()+now.getSeconds()/60; const nl = [...cd.energyLine]; nl[hour] = Math.round(calcEnergyAt(DAILY_BASE_ELECTRIC, dailyR1_Electric_fn(), ENERGY_KH[hour], hourlyR2_Electric_fn()[hour], m)*10000)/10000; cd.energyLine = nl; lineChart?.setOption({xAxis:{data:hourLabels.slice(0,hour+1)},series:[{data:cd.energyLine.slice(0,hour+1)}]}) }
    if (electricPeriod.value === '日' && now.getSeconds()%5===0) { const acOn=deviceList.value.filter(d=>d.type==='ac'&&d.status).length; const lightOn=deviceList.value.filter(d=>d.type==='light'&&d.status).length; const rs=()=>(Math.random()-0.5)*4; const np=cd.energyPie.map((it,i)=>{if(i===0)return{...it,value:Math.max(20,Math.min(50,35+acOn*6+rs()))};if(i===1)return{...it,value:Math.max(15,Math.min(40,25+lightOn*4+rs()))};if(i===2)return{...it,value:Math.max(10,Math.min(35,20+Math.min(8,acOn+lightOn)*2+rs()))};return{...it,value:Math.max(5,Math.min(20,10+rs()))}});const s=np.reduce((a,b)=>a+b.value,0);cd.energyPie=np.map(it=>({...it,value:Math.round(it.value/s*100)}));pieChart?.setOption({series:[{data:cd.energyPie}]}) }
    if (waterPeriod.value === '日') { const m=now.getMinutes()+now.getSeconds()/60;const nl=[...cd.waterBar];nl[hour]=Math.round(calcEnergyAt(DAILY_BASE_WATER,dailyR1_Water_fn(),WATER_KH[hour],hourlyR2_Water_fn()[hour],m)*10000)/10000;cd.waterBar=nl;waterChart?.setOption({xAxis:{data:hourLabels.slice(0,hour+1)},series:[{data:cd.waterBar.slice(0,hour+1)}]}) }
    if (waterPeriod.value==='日'&&now.getSeconds()%5===0){const rs=()=>(Math.random()-0.5)*4;const np=cd.waterPie.map((it,i)=>{if(i===0)return{...it,value:Math.max(25,Math.min(55,40+rs()))};if(i===1)return{...it,value:Math.max(15,Math.min(35,25+rs()))};if(i===2)return{...it,value:Math.max(10,Math.min(30,20+rs()))};return{...it,value:Math.max(5,Math.min(20,10+rs()))}});const s=np.reduce((a,b)=>a+b.value,0);cd.waterPie=np.map(it=>({...it,value:Math.round(it.value/s*100)}));waterPieChart?.setOption({series:[{data:cd.waterPie}]}) }
    if (gasPeriod.value === '日') { const m=now.getMinutes()+now.getSeconds()/60;const nl=[...cd.gasLine];nl[hour]=Math.round(calcEnergyAt(DAILY_BASE_GAS,dailyR1_Gas_fn(),GAS_KH[hour],hourlyR2_Gas_fn()[hour],m)*10000)/10000;cd.gasLine=nl;gasChart?.setOption({xAxis:{data:hourLabels.slice(0,hour+1)},series:[{data:cd.gasLine.slice(0,hour+1)}]}) }
    if (gasPeriod.value==='日'&&now.getSeconds()%5===0){const rs=()=>(Math.random()-0.5)*4;const np=cd.gasPie.map((it,i)=>{if(i===0)return{...it,value:Math.max(35,Math.min(65,50+rs()))};if(i===1)return{...it,value:Math.max(20,Math.min(45,35+rs()))};return{...it,value:Math.max(5,Math.min(20,10+rs()))}});const s=np.reduce((a,b)=>a+b.value,0);cd.gasPie=np.map(it=>({...it,value:Math.round(it.value/s*100)}));gasPieChart?.setOption({series:[{data:cd.gasPie}]}) }
    const eld=energyLiveData.value;eld.savingRate=Math.max(10,Math.min(28,eld.savingRate+Math.round((Math.random()-0.45)*3)));eld.totalEnergy=Math.max(100,Math.round(eld.totalEnergy+(Math.random()-0.3)*0.5));eld.carbonReduction=Math.max(5,Math.round((eld.carbonReduction+(Math.random()-0.4)*0.3)*10)/10)
    if(now.getSeconds()===0){const t=calculateTrends(hour);electricTrend.value=t.electric;waterTrend.value=t.water;gasTrend.value=t.gas;costTrend.value=t.cost}
    if(showControlPanel.value&&selectedDevice.value?._rankType){const rt=selectedDevice.value._rankType;const rn=selectedDevice.value._rankItemName;const src=rt==='water'?waterRank.value:rt==='gas'?gasRank.value:energyRank.value;const ri=src.find(r=>r.name===rn);if(ri)selectedDevice.value={...selectedDevice.value,value:ri.val,periods:computeRankPeriods(rt,ri.val)}}
  }, 1000)
})

onUnmounted(() => { clearInterval(timeTimer);clearInterval(envTimer);clearInterval(healthTimer);clearInterval(energyTimer);clearInterval(stepsTimer);lineChart?.dispose();pieChart?.dispose();waterChart?.dispose();gasChart?.dispose();waterPieChart?.dispose();gasPieChart?.dispose() })

</script>
