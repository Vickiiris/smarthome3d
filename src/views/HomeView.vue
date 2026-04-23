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
      <TopBar :currentTitle="currentTitle" :currentTime="currentTime" :currentDate="currentDate" />

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
          :dailyEnergy="(chartData?.energyLine || []).reduce((a, b) => a + b, 0).toFixed(2)"
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
const currentPage = ref('env')
const activeSceneMode = ref('')

// ========== Toast 图标映射 ==========
function toastIcon(type) {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '🚨' }
  return icons[type] || 'ℹ️'
}

// ========== 场景模式 ==========
const sceneModes = [
  {
    id: 'home',
    label: '回家模式',
    icon: '🏠',
    desc: '打开客厅灯、空调26°C、热水器',
    actions: [
      { name: '客厅灯开关', status: true, value: 100 },
      { name: '客厅空调', status: true, value: 26, mode: 'cool' },
      { name: '燃气热水器', status: true, value: 55 },
      { name: '空气质量传感器', status: true },
      { name: '门禁控制器', status: false },
    ],
  },
  {
    id: 'away',
    label: '离家模式',
    icon: '🔒',
    desc: '关闭所有灯、空调，锁定门禁',
    actions: [
      { name: '客厅灯开关', status: false },
      { name: '主卧灯开关', status: false },
      { name: '次卧灯开关', status: false },
      { name: '厨房灯开关', status: false },
      { name: '卫生间灯开关', status: false },
      { name: '阳台灯开关', status: false },
      { name: '客厅空调', status: false },
      { name: '主卧空调', status: false },
      { name: '次卧空调', status: false },
      { name: '客厅电视', status: false },
      { name: '智能音箱', status: false },
      { name: '燃气热水器', status: false },
      { name: '洗碗机', status: false },
      { name: '门禁控制器', status: true },
    ],
  },
  {
    id: 'sleep',
    label: '睡眠模式',
    icon: '🌙',
    desc: '关闭所有灯，空调26°C，客厅灯留夜灯',
    actions: [
      { name: '客厅灯开关', status: true, value: 10 },
      { name: '主卧灯开关', status: false },
      { name: '次卧灯开关', status: false },
      { name: '厨房灯开关', status: false },
      { name: '卫生间灯开关', status: false },
      { name: '阳台灯开关', status: false },
      { name: '客厅空调', status: true, value: 26, mode: 'cool' },
      { name: '主卧空调', status: true, value: 26, mode: 'cool' },
      { name: '次卧空调', status: false },
      { name: '客厅电视', status: false },
      { name: '智能音箱', status: false },
      { name: '燃气热水器', status: false },
    ],
  },
]

function applySceneMode(mode) {
  activeSceneMode.value = mode.id
  let changed = 0

  mode.actions.forEach(action => {
    const idx = deviceList.value.findIndex(d => d.name === action.name)
    if (idx !== -1) {
      const device = deviceList.value[idx]
      if (device.status !== action.status || (action.value !== undefined && device.value !== action.value)) {
        deviceList.value[idx] = {
          ...device,
          status: action.status,
          value: action.value ?? device.value,
          mode: action.mode ?? device.mode,
          online: GATEWAY_TYPES.has(device.type)
                    ? (device.online ?? true)
                    : action.status,
        }
        changed++
        // 灯光开关时同步 3D 场景灯光
        if (device.type === 'light') {
          const lightId = getLightIdForDevice(device.id)
          if (lightId) threeScene.setLightStatus(lightId, action.status, action.value ?? 100)
        }
      }
    }
  })

  homeStore.addToast({
    message: `${mode.icon} ${mode.label}已启用，共调整 ${changed} 个设备`,
    type: 'success',
  })
}

// 设备 ID → 3D 灯光 ID 映射
function getLightIdForDevice(deviceId) {
  const map = {
    'dev19': 'light-1', // 客厅灯
    'dev12': 'light-2', // 主卧灯
    'dev14': 'light-3', // 次卧灯
    'dev21': 'light-4', // 厨房灯
    'dev25': 'light-5', // 卫生间灯
    'dev26': 'light-6', // 阳台灯
  }
  return map[deviceId] || null
}
const deviceSearch = ref('')
const activeRoom = ref('all')
const isFullscreen = ref(false)

// 环境详情弹窗
const envDetailVisible = ref(false)
const envDetailLabel = ref('')

// 弹窗环境数据：从 envItems computed 实时计算，弹窗不存快照
const envDetailItem = computed(() => {
  if (!envDetailLabel.value) return null
  return envItems.value.find(i => i.label === envDetailLabel.value) || null
})

// 右侧控制面板（点击顶牌显示）
const showSlidePanel = ref(false)
const selectedHotspotDevice = ref(null)

const envDetailMap = {
  '室外温度': { desc: '室外大气温度，反映当前户外热环境。', standard: '国标 GB/T 18883：室内温度舒适范围 18~26°C（冬季 16~24°C，夏季 24~28°C）。', tips: '室外温度过高时建议减少户外活动，注意防暑。' },
  '室外湿度': { desc: '室外空气相对湿度，影响体感温度和舒适度。', standard: '国标 GB/T 18883：室内相对湿度舒适范围 30%~70%。', tips: '湿度过高易滋生霉菌，过低易引起呼吸道不适。' },
  '室内温度': { desc: '室内空气温度，直接影响居住舒适度和健康。', standard: '国标 GB/T 18883：夏季 24~28°C，冬季 18~24°C 为舒适范围。', tips: '建议保持室内温度稳定，避免与室外温差过大。' },
  '室内湿度': { desc: '室内空气相对湿度，影响人体舒适感和建筑材料。', standard: '国标 GB/T 18883：室内相对湿度 40%~70% 为舒适范围。', tips: '湿度低于 30% 时建议使用加湿器，高于 70% 时开启除湿。' },
  'CO₂浓度': { desc: '室内二氧化碳浓度，反映空气新鲜程度和通风状况。', standard: '国标 GB/T 18883：室内 CO₂ 浓度应 ≤1000ppm；>2000ppm 会引起头晕不适。', tips: '建议定期开窗通风，保持 CO₂ 浓度低于 1000ppm。' },
  'PM2.5':   { desc: '细颗粒物浓度，直径 ≤2.5μm，可深入肺部，影响呼吸健康。', standard: '国标 GB 3095：年均浓度 ≤35μg/m³（优良），日均 ≤75μg/m³。', tips: '室内 PM2.5 超标时建议开启空气净化器，减少室内燃烧活动。' },
  '光照':    { desc: '室内光照强度，影响视觉舒适度和生物节律。', standard: '国标 GB 50034：办公室照度 300~500lux，卧室 75~150lux，客厅 100~300lux。', tips: '光照不足时建议补充人工照明，避免长时间在昏暗环境中用眼。' },
  '空气质量': { desc: '综合空气质量指数（AQI），综合评估室内空气污染程度。', standard: '国标 HJ 633：AQI 0~50 优，51~100 良，101~150 轻度污染，>150 中度及以上污染。', tips: '空气质量差时建议关闭门窗，开启净化器，减少剧烈运动。' },
  '心率':     { desc: '心脏每分钟跳动的次数，反映心血管系统功能状态。', standard: '国标 WS/T 323：成人静息心率正常范围 60~100次/分；运动员可达 40~60次/分。', tips: '心率持续偏高需警惕心血管风险，建议减少咖啡因摄入，保持规律作息。' },
  '血压':     { desc: '血液对血管壁的侧压力，分为收缩压（高压）和舒张压（低压）。', standard: '国标 WS/T 324：正常血压收缩压 <120mmHg 且舒张压 <80mmHg；正常高值需关注生活方式。', tips: '血压偏高者建议减少盐分摄入，适量运动，保持充足睡眠，定期监测。' },
  '体温':     { desc: '人体核心体温，反映基础代谢和免疫状态。', standard: '国标 GBZ 189：正常人体温范围 36.0~37.2°C；超过 37.3°C 属发热。', tips: '体温异常需关注是否感染或过度劳累；建议规律作息，适度锻炼增强免疫。' },
  '血氧':     { desc: '血液中血红蛋白与氧气结合的比例，反映呼吸系统氧合能力。', standard: '国标 GB 9801：正常人血氧饱和度 ≥95%；低于 94% 需关注，低于 90% 属低氧血症。', tips: '血氧偏低建议增加室内通风，避免剧烈运动；持续偏低需就医排查呼吸系统问题。' },
  '睡眠':     { desc: '每日睡眠时长和质量，影响身体修复、记忆巩固和免疫功能。', standard: '国标 GB/T 18883：中国成人建议每日睡眠 7~9小时；儿童青少年需 8~10小时。', tips: '睡眠不足会影响认知和免疫力，建议固定作息时间，睡前减少电子设备使用。' },
}
const healthDetailMap = {
  '心率': { desc: '心脏每分钟跳动的次数，反映心血管系统功能状态。', standard: '国标 WS/T 323：成人静息心率正常范围 60~100次/分；运动员可达 40~60次/分。', tips: '心率持续偏高需警惕心血管风险，建议减少咖啡因摄入，保持规律作息。' },
  '血压': { desc: '血液对血管壁的侧压力，分为收缩压（高压）和舒张压（低压）。', standard: '国标 WS/T 324：正常血压收缩压 <120mmHg 且舒张压 <80mmHg；正常高值需关注生活方式。', tips: '血压偏高者建议减少盐分摄入，适量运动，保持充足睡眠，定期监测。' },
  '体温': { desc: '人体核心体温，反映基础代谢和免疫状态。', standard: '国标 GBZ 189：正常人体温范围 36.0~37.2°C；超过 37.3°C 属发热。', tips: '体温异常需关注是否感染或过度劳累；建议规律作息，适度锻炼增强免疫。' },
  '血氧': { desc: '血液中血红蛋白与氧气结合的比例，反映呼吸系统氧合能力。', standard: '国标 GB 9801：正常人血氧饱和度 ≥95%；低于 94% 需关注，低于 90% 属低氧血症。', tips: '血氧偏低建议增加室内通风，避免剧烈运动；持续偏低需就医排查呼吸系统问题。' },
  '睡眠': { desc: '每日睡眠时长和质量，影响身体修复、记忆巩固和免疫功能。', standard: '国标 GB/T 18883：中国成人建议每日睡眠 7~9小时；儿童青少年需 8~10小时。', tips: '睡眠不足会影响认知和免疫力，建议固定作息时间，睡前减少电子设备使用。' },
  '步数': { desc: '每日行走步数，反映身体日常活动水平和代谢消耗。', standard: '世界卫生组织（WHO）建议：成年人每日步行 6000~10000 步，可降低心血管疾病和糖尿病风险。', tips: '步数不足建议利用碎片时间步行，如上下班步行一段距离、餐后散步等，循序渐进提升日均步数。' },
}

function showEnvDetail(item) {
  envDetailLabel.value = item.label
  envDetailVisible.value = true
}

// 根据当前数值获取动态健康建议
function getHealthTips(label, value) {
  switch (label) {
    case '室外温度':
      if (value < 0) return '气温极低，请做好防寒保暖，避免长时间户外活动。'
      if (value < 15) return '气温较低，建议穿着厚重衣物，适度户外活动。'
      if (value <= 26) return '气温舒适，是户外活动的好时机。'
      if (value <= 32) return '气温较高，建议多喝水，避免长时间暴晒。'
      if (value <= 38) return '气温很高，请做好防暑降温，减少户外活动。'
      return '气温极高，请立即采取防暑措施，避免中暑。'
    case '室外湿度':
      if (value < 20) return '空气干燥，建议多喝水，使用加湿器。'
      if (value < 30) return '空气较干，可能引起皮肤干燥和呼吸道不适。'
      if (value <= 70) return '湿度舒适，空气质量良好。'
      if (value <= 85) return '空气潮湿，易滋生霉菌，建议开启除湿。'
      return '空气非常潮湿，请立即开启除湿设备。'
    case '室内温度':
      if (value < 16) return '室内过冷，建议调高温度，避免感冒。'
      if (value < 18) return '室内温度偏低，建议增加供暖。'
      if (value <= 26) return '室内温度舒适，保持当前设置。'
      if (value <= 30) return '室内温度偏高，建议开启空调降温。'
      return '室内温度过高，请立即开启空调。'
    case '室内湿度':
      if (value < 20) return '室内过干，建议开启加湿器，多喝水。'
      if (value < 30) return '室内较干，易引起呼吸道不适。'
      if (value <= 70) return '室内湿度舒适，保持当前环境。'
      if (value <= 85) return '室内较潮，建议开启除湿或通风。'
      return '室内过潮，请立即开启除湿设备。'
    case 'CO₂浓度':
      if (value <= 600) return '空气质量优秀，通风效果很好。'
      if (value <= 800) return '空气质量良好，可继续保持。'
      if (value <= 1000) return '空气质量一般，建议开窗通风。'
      if (value <= 1500) return '空气质量较差，请立即开窗通风。'
      return '空气质量很差，请立即打开所有窗户通风。'
    case 'PM2.5':
      if (value <= 35) return 'PM2.5 优秀，空气质量很好，可放心户外活动。'
      if (value <= 75) return 'PM2.5 良好，空气质量不错。'
      if (value <= 115) return 'PM2.5 轻度污染，敏感人群应减少户外活动。'
      if (value <= 150) return 'PM2.5 中度污染，建议开启空气净化器。'
      return 'PM2.5 重度污染，请立即开启净化器并关闭门窗。'
    case '光照':
      if (value < 50) return '光照不足，建议补充人工照明，保护视力。'
      if (value <= 100) return '光照较暗，建议增加照明。'
      if (value <= 300) return '光照舒适，保持当前照度。'
      if (value <= 500) return '光照充足，可适度降低照度。'
      return '光照过强，建议降低照度或关闭部分灯光。'
    case '空气质量':
      if (value <= 35) return '空气质量优秀，PM2.5=' + value + 'ug/m3，非常适合户外活动。'
      if (value <= 75) return '空气质量良好，PM2.5=' + value + 'ug/m3，可正常户外活动。'
      if (value <= 115) return '空气质量轻度污染，PM2.5=' + value + 'ug/m3，敏感人群应减少户外活动。'
      if (value <= 150) return '空气质量中度污染，PM2.5=' + value + 'ug/m3，建议减少户外活动。'
      return '空气质量重度污染，PM2.5=' + value + 'ug/m3，请避免户外活动。'
    case '心率':
      if (value < 60) return '心率偏低，如无不适可正常生活；运动员属正常范围。'
      if (value <= 100) return '心率正常，心血管状态良好，继续保持规律运动。'
      if (value <= 120) return '心率略高，建议休息放松，减少咖啡因摄入。'
      return '心率偏高，建议立即休息，如持续偏高请就医检查。'
    case '血压':
      if (value < 90) return '血压偏低，建议适量增加盐分和水分摄入。'
      if (value <= 120) return '血压理想，心血管健康，继续保持良好生活习惯。'
      if (value <= 139) return '血压正常偏高，建议减少盐分摄入，加强运动。'
      return '血压偏高，建议就医评估，必要时遵医嘱服药控制。'
    case '体温':
      if (value < 36.0) return '体温偏低，注意保暖，如持续偏低请就医检查。'
      if (value <= 37.2) return '体温正常，身体状态良好。'
      if (value <= 38.0) return '低热状态，建议多喝水休息，密切观察。'
      return '体温偏高，请及时就医检查是否感染。'
    case '血氧':
      if (value >= 98) return '血氧优秀，呼吸功能状态极佳。'
      if (value >= 95) return '血氧正常，呼吸系统功能良好。'
      if (value >= 90) return '血氧偏低，建议增加通风，避免剧烈运动。'
      return '血氧过低，请立即就医或吸氧治疗。'
    case '睡眠':
      if (value < 5) return '睡眠严重不足，建议调整作息，避免熬夜。'
      if (value < 7) return '睡眠不足，建议提前就寝，保证 7~9 小时睡眠。'
      if (value <= 9) return '睡眠充足，继续保持良好的作息习惯。'
      return '睡眠时间过长，可能与疲劳或健康问题有关，建议关注。'
    case '步数':
      if (value >= 10000) return '步数已达标，继续保持每天一万步的运动习惯。'
      if (value >= 6000) return '步数基本达标，建议每天坚持步行，逐步提升至一万步。'
      if (value >= 3000) return '步数偏少，建议增加日常步行，如饭后散步或短途步行通勤。'
      return '步数严重不足，久坐危害大，建议从每天 3000 步开始，逐步增加到一万步。'
    default:
      return '保持当前状态，定期监测健康指标。'
  }
}

function closeEnvDetail() {
  envDetailVisible.value = false
}

// 健康指标详情弹窗
const healthDetailVisible = ref(false)
const healthDetailLabel = ref('')

// 弹窗健康数据：从 healthItems ref 实时查找，不存快照
const healthDetailItem = computed(() => {
  if (!healthDetailLabel.value) return null
  return healthItems.value.find(i => i.label === healthDetailLabel.value) || null
})

function openHealthDetail(item) {
  healthDetailLabel.value = item.label
  healthDetailVisible.value = true
}

function closeHealthDetail() {
  healthDetailVisible.value = false
}

// 设备控制面板（弹窗 - 设备列表点击）
const showControlPanel = ref(false)
const selectedDevice = ref(null)

const canvasRef = ref(null)
const threeScene = useThreeScene(canvasRef)
const { flyToRoom, resetView, onHotspotClick, activeRoomId } = threeScene

// 顶牌切换房间时同步 activeRoom
watch(activeRoomId, (id) => {
  activeRoom.value = id
})

// 设置热点点击回调 - 只有全屏时才弹出控制面板
onHotspotClick.value = (hotspot) => {
  // 非全屏状态不弹出控制面板
  if (!isFullscreen.value) {
    return
  }
  const matched = deviceList.value.find(d => d.name === hotspot.name)
  selectedHotspotDevice.value = {
    id: hotspot.id,
    name: hotspot.name,
    type: hotspot.type || 'ac',
    room: hotspot.room || '主卧',
    status:   matched?.status   ?? true,
    value:    matched?.value    ?? (hotspot.type === 'ac' ? 24 : hotspot.type === 'light' ? 80 : 50),
    mode:     matched?.mode     ?? 'cool',
    fanSpeed: matched?.fanSpeed ?? 'auto',
    ip:       matched?.ip       ?? null,
    vendor:   matched?.vendor   ?? '未知',
    online:   matched ? deviceOnline(matched) : true,
    icon:     matched?.icon     ?? null,
  }
  showSlidePanel.value = true
}

// 设备分类：
// 网关设备（断电不离线）：传感器、新风、门禁、开关(light)、插座(outlet)
// Mesh设备（断电即离线）：灯具、空调、电视、热水器、洗碗机、音箱
const GATEWAY_TYPES = new Set(['sensor', 'security', 'light', 'outlet'])

// 在线状态计算：网关类设备始终在线，Mesh设备跟随 status
function deviceOnline(device) {
  if (!device) return false
  if (GATEWAY_TYPES.has(device.type)) return true
  return device.status
}

// 设备更新回调 - 统一更新 deviceList，所有页面共享状态
function onDeviceUpdate(device) {
  const idx = deviceList.value.findIndex(d => d.name === device.name || d.id === device.id)
  if (idx !== -1) {
    // 更新 deviceList（创建新引用，触发所有使用处响应式更新）
    deviceList.value[idx] = {
      ...deviceList.value[idx],
      status:   device.status,
      value:    device.value    ?? deviceList.value[idx].value,
      mode:     device.mode     ?? deviceList.value[idx].mode,
      fanSpeed: device.fanSpeed ?? deviceList.value[idx].fanSpeed,
      // Mesh 设备：开关状态决定在线状态
      online:   GATEWAY_TYPES.has(deviceList.value[idx].type)
                  ? (deviceList.value[idx].online ?? true)
                  : device.status,
    }
    // 同步更新当前打开的控制面板引用，使其指向 deviceList 中的最新对象
    selectedHotspotDevice.value = deviceList.value[idx]
    selectedDevice.value = deviceList.value[idx]
  }
}

let canvasPage = '' // Start empty so first mountCanvas call will actually move the canvas

// 子组件模板 ref（用于获取 scene-card 容器）
const envPageRef     = ref(null)
const energyPageRef  = ref(null)
const devicePageRef  = ref(null)
const productPageRef = ref(null)

// 把 canvas 移入指定页面的 scene-card
function mountCanvas(targetPage) {
  if (targetPage === canvasPage) {
    // Even if same page, try to initialize if not done yet
    if (!canvasRef.value?.parentElement) {
      const canvas = canvasRef.value
      if (!canvas) return
      const targets= {
        env: envPageRef.value?.sceneCardRef, energy: energyPageRef.value?.sceneCardRef,
        device: devicePageRef.value?.sceneCardRef, product: productPageRef.value?.sceneCardRef,
      }
      const target = targets[targetPage]
      if (!target) return
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas)
      target.appendChild(canvas)
      canvas.style.display = ''
      canvasPage = targetPage
    }
    return
  }
  const canvas = canvasRef.value
  if (!canvas) return
  const targets= {
    env: envPageRef.value?.sceneCardRef, energy: energyPageRef.value?.sceneCardRef,
    device: devicePageRef.value?.sceneCardRef, product: productPageRef.value?.sceneCardRef,
  }
  const target = targets[targetPage]
  if (!target) {
    setTimeout(() => mountCanvas(targetPage), 100)
    return
  }
  if (canvas.parentElement) canvas.parentElement.removeChild(canvas)
  target.appendChild(canvas)
  canvas.style.display = ''
  canvasPage = targetPage
  // Delay initialization to ensure canvas is laid out
  setTimeout(() => {
    threeScene.initScene()
    window.dispatchEvent(new Event('resize'))
  }, 50)
}

const currentTime = ref('')
const currentDate = ref('')
let timeTimer, envTimer, healthTimer, energyTimer, stepsTimer
function updateTime() {
  const n = new Date()
  currentTime.value = n.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  currentDate.value = n.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
}

const navItems = [
  { id: 'env',     name: '环境总览', icon: '🌤' },
  { id: 'energy',  name: '能源管理', icon: '⚡' },
  { id: 'device',  name: '设备管理', icon: '📱' },
  { id: 'product', name: '产品中心', icon: '📦' },
  { id: 'health',  name: '健康监测', icon: '❤' },
  { id: 'alarm',   name: '策略告警', icon: '🔔' },
]
const currentTitle = computed(() => navItems.find(n => n.id === currentPage.value)?.name ?? '')

function switchPage(id) {
  // 全屏时或非全景视图时切换页面，自动退出全屏并恢复全景
  if (isFullscreen.value || activeRoom.value !== 'all') {
    isFullscreen.value = false
    closeAllPanels()
    resetView()
    activeRoom.value = 'all'
    activeRoomId.value = 'all'
    // 延迟 resize 确保 DOM 更新后再调整 canvas 大小
    setTimeout(() => {
      threeScene.resize()
    }, 150)
  }
  currentPage.value = id
  if (id !== 'health') nextTick(() => mountCanvas(id))
  // energy 页面需要等 v-show 生效、DOM 可见后再初始化图表
  if (id === 'energy') setTimeout(() => initCharts(), 100)
}

// 关闭所有弹窗/面板
function closeAllPanels() {
  showSlidePanel.value = false
  showControlPanel.value = false
  showDeviceDetail.value = false
  envDetailVisible.value = false
  healthDetailVisible.value = false
  addDeviceVisible.value = false
}

const rooms = [
  { id: 'living-room', name: '客厅' },
  { id: 'bedroom',    name: '主卧' },
  { id: 'bedroom2',   name: '次卧' },
  { id: 'kitchen',    name: '厨房' },
  { id: 'bathroom',   name: '卫生间' },
]

function switchRoom(roomId) {
  activeRoom.value = roomId
  activeRoomId.value = roomId
  if (roomId === 'all') resetView()
  else flyToRoom(roomId)
}

function flyToDeviceRoom(device) {
  const map= {
    '客厅': 'living-room', '主卧': 'bedroom', '次卧': 'bedroom2',
    '厨房': 'kitchen', '卫生间': 'bathroom',
  }
  const id = map[device.room]
  if (id) switchRoom(id)
}

function toggleFullscreen() {
  const wasFullscreen = isFullscreen.value
  isFullscreen.value = !isFullscreen.value
  // 退出全屏时关闭所有窗口并恢复全景
  if (wasFullscreen) {
    closeAllPanels()
    resetView()
    activeRoom.value = 'all'
    activeRoomId.value = 'all'
  }
  // 延迟 resize 确保 DOM 更新完成
  setTimeout(() => {
    threeScene.resize()
  }, 200)
}

// 环境参数颜色计算
function getEnvColor(label, value) {
  switch (label) {
    case '室外温度':
      if (value < 15) return '#4fc3f7'
      if (value < 20) return '#26c6da'
      if (value <= 26) return '#00d4aa'
      if (value <= 32) return '#ffd54f'
      if (value <= 38) return '#ff9800'
      return '#ff6b6b'
    case '室外湿度':
      if (value < 30) return '#ff6b6b'
      if (value <= 70) return '#00d4aa'
      return '#4fc3f7'
    case '室内温度':
      if (value < 16) return '#4fc3f7'
      if (value < 18) return '#26c6da'
      if (value <= 26) return '#00d4aa'
      if (value <= 30) return '#ffd54f'
      return '#ff6b6b'
    case '室内湿度':
      if (value < 30) return '#ff6b6b'
      if (value <= 70) return '#00d4aa'
      return '#4fc3f7'
    case 'CO₂浓度':
      if (value <= 600) return '#4cd964'
      if (value <= 800) return '#00d4aa'
      if (value <= 1000) return '#ffd54f'
      if (value <= 1500) return '#ff9800'
      return '#ff6b6b'
    case 'PM2.5':
      if (value <= 35) return '#4cd964'
      if (value <= 75) return '#00d4aa'
      if (value <= 115) return '#ffd54f'
      if (value <= 150) return '#ff9800'
      return '#ff6b6b'
    case '光照':
      if (value < 50) return '#ff9800'
      if (value <= 300) return '#00d4aa'
      if (value <= 500) return '#ffd54f'
      return '#ff9800'
    case '空气质量':
      if (value <= 35) return '#4cd964'
      if (value <= 75) return '#00d4aa'
      if (value <= 115) return '#ffd54f'
      return '#ff6b6b'
    default:
      return '#00d4aa'
  }
}

const envItems = computed(() => {
  const v = homeStore.stats
  return [
    { icon: '🌡', label: '室外温度',   value: `${v.outdoorTemp ?? 38}°C`,  pct: Math.min(100, Math.max(0, v.outdoorTemp ?? 38)),  color: getEnvColor('室外温度', v.outdoorTemp ?? 38),   raw: v.outdoorTemp ?? 38 },
    { icon: '💧', label: '室外湿度', value: `${v.outdoorHumidity ?? 40}%`, pct: Math.min(100, Math.max(0, v.outdoorHumidity ?? 40)), color: getEnvColor('室外湿度', v.outdoorHumidity ?? 40), raw: v.outdoorHumidity ?? 40 },
    { icon: '🏠', label: '室内温度', value: `${v.temperature ?? 24}°C`,   pct: Math.min(100, Math.max(0, v.temperature ?? 24)),   color: getEnvColor('室内温度', v.temperature ?? 24),  raw: v.temperature ?? 24 },
    { icon: '🌫', label: '室内湿度', value: `${v.humidity ?? 50}%`,       pct: Math.min(100, Math.max(0, v.humidity ?? 50)),    color: getEnvColor('室内湿度', v.humidity ?? 50),    raw: v.humidity ?? 50 },
    { icon: '🫁', label: 'CO₂浓度', value: `${v.co2 ?? 450}ppm`,        pct: Math.min(100, Math.max(0, (v.co2 ?? 450) / 20)), color: getEnvColor('CO₂浓度', v.co2 ?? 450),   raw: v.co2 ?? 450 },
    { icon: '🌿', label: 'PM2.5',   value: `${v.pm25 ?? 12}μg/m³`,      pct: Math.min(100, Math.max(0, (v.pm25 ?? 12) * 2)), color: getEnvColor('PM2.5', v.pm25 ?? 12),    raw: v.pm25 ?? 12 },
    { icon: '☀️', label: '光照',     value: `${v.light ?? 320}lux`,       pct: Math.min(100, Math.max(0, (v.light ?? 320) / 5)), color: getEnvColor('光照', v.light ?? 320),       raw: v.light ?? 320 },
    { icon: '💨', label: '空气质量', value: (v.pm25 ?? 12) <= 35 ? '优' : (v.pm25 ?? 12) <= 75 ? '良' : (v.pm25 ?? 12) <= 115 ? '轻度' : '中度', pct: (v.pm25 ?? 12) <= 35 ? 90 : (v.pm25 ?? 12) <= 75 ? 70 : (v.pm25 ?? 12) <= 115 ? 50 : 30, color: (v.pm25 ?? 12) <= 35 ? '#4cd964' : (v.pm25 ?? 12) <= 75 ? '#00d4aa' : (v.pm25 ?? 12) <= 115 ? '#ffd54f' : '#ff6b6b', raw: v.pm25 ?? 12 },
  ]
})

const securityItems = [
  { icon: '🚪', label: '门禁',     value: '已锁', cls: 'ok', color: '#22c55e', sensorIds: ['dev18'] },
  { icon: '💨', label: '烟雾',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev23'] },
  { icon: '🔥', label: '燃气',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev23'] },
  { icon: '📹', label: '摄像头',   value: '运行', cls: 'ok', color: '#22c55e', sensorIds: ['dev17'] },
  { icon: '🚨', label: '安防状态', value: '在家', cls: 'ok', color: '#22c55e', sensorIds: [] },
  { icon: '💧', label: '漏水',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev24'] },
]

// 根据传感器状态更新安防监控
const linkedSecurityItems = computed(() => {
  return securityItems.map(item => {
    if (item.sensorIds && item.sensorIds.length > 0) {
      const sensors = allDevices.value.filter(d => item.sensorIds.includes(d.id))
      const allOffline = sensors.length > 0 && sensors.every(s => !s.status)
      if (allOffline) {
        return { ...item, value: '离线', cls: 'offline', color: '#6b7280' }
      }
    }
    return item
  })
})

// 传感器类型图标
const activeDeviceTab = ref('light')

// 所有设备列表（照明 + 空调 + 监控）
// 环境总览页设备列表 - 直接从 deviceList 派生，统一数据源
const allDevices = computed(() => deviceList.value)

// 根据Tab筛选设备（环境总览页面）
const envDevices = computed(() => {
  const tabType = activeDeviceTab.value  // 'light' | 'ac'
  return deviceList.value.filter(d => d.type === tabType)
})

// 娱乐设备：电视、音箱
const entertainmentDevices = computed(() => {
  return deviceList.value.filter(d => ['tv', 'speaker'].includes(d.type))
})

// 根据设备区域和状态获取图标样式
function getDeviceColor(device) {
  const typeColors= {
    light: 'rgba(255, 213, 79, 0.15)',
    ac: 'rgba(79, 195, 247, 0.15)',
    sensor: 'rgba(34, 197, 94, 0.15)',
  }
  const roomColors= {
    '客厅': 'rgba(79, 195, 247, 0.25)',
    '主卧': 'rgba(167, 139, 250, 0.25)',
    '次卧': 'rgba(251, 146, 60, 0.25)',
    '厨房': 'rgba(239, 68, 68, 0.25)',
    '卫生间': 'rgba(6, 182, 212, 0.25)',
    '阳台': 'rgba(253, 224, 71, 0.25)',
    '玄关': 'rgba(251, 113, 133, 0.25)',
    '全屋': 'rgba(34, 197, 94, 0.25)',
  }
  const baseColor = typeColors[device.type] || 'rgba(255,255,255,0.04)'
  const roomColor = roomColors[device.room] || 'rgba(255,255,255,0.08)'
  if (device.status) return `linear-gradient(135deg, ${baseColor}, ${roomColor})`
  return 'rgba(255,255,255,0.04)'
}

function toggleDevice(device) {
  const idx = deviceList.value.findIndex(d => d.id === device.id || d.name === device.name)
  if (idx !== -1) {
    const newStatus = !deviceList.value[idx].status
    deviceList.value[idx] = {
      ...deviceList.value[idx],
      status: newStatus,
      // Mesh 设备：开关状态决定在线状态
      online: GATEWAY_TYPES.has(deviceList.value[idx].type)
                ? (deviceList.value[idx].online ?? true)
                : newStatus,
    }
  }
}

// 打开设备详细控制面板
function openDeviceControl(device) {
  // 从 deviceList 读取最新状态
  const latest = deviceList.value.find(d => d.id === device.id || d.name === device.name) || device
  selectedDevice.value = {
    id: latest.id,
    name: latest.name,
    icon: device.icon,
    type: latest.type,
    status:   latest.status,
    value:    latest.value,
    mode:     latest.mode     ?? 'cool',
    fanSpeed: latest.fanSpeed ?? 'auto',
    room:     latest.room,
    vendor:   latest.vendor,
    ip:       latest.ip,
    online:   deviceOnline(latest),
  }
  showControlPanel.value = true
}

// 打开安防监控控制面板
function openSecurityControl(item) {
  // 找到关联的传感器
  const sensorIds = item.sensorIds || []
  const linkedSensors = allDevices.value.filter(d => sensorIds.includes(d.id))
  
  if (linkedSensors.length > 0) {
    // 如果有传感器，显示第一个传感器的控制面板
    const sensor = linkedSensors[0]
    selectedDevice.value = {
      id: sensor.id,
      name: item.label + '控制',
      icon: item.icon,
      type: 'sensor',
      status: sensor.status,
      value: sensor.value,
      room: sensor.room,
    }
    showControlPanel.value = true
  }
}

// 打开能源详情弹窗
// 计算排行分时段数据（每次调用都用最新的 item.val）
function computeRankPeriods(rankType, itemVal) {
  const defs = {
    electric: [
      { label: '凌晨 00:00-06:00', factor: 0.15, pct: 15, color: '#81c784' },
      { label: '早晨 06:00-09:00', factor: 0.18, pct: 18, color: '#4fc3f7' },
      { label: '上午 09:00-12:00', factor: 0.12, pct: 12, color: '#00d4aa' },
      { label: '中午 12:00-14:00', factor: 0.08, pct: 8,  color: '#ffd54f' },
      { label: '下午 14:00-18:00', factor: 0.15, pct: 15, color: '#ce93d8' },
      { label: '傍晚 18:00-21:00', factor: 0.22, pct: 22, color: '#ff7043' },
      { label: '夜间 21:00-24:00', factor: 0.10, pct: 10, color: '#607d8b' },
    ],
    water: [
      { label: '凌晨 00:00-06:00', factor: 0.05, pct: 5,  color: '#607d8b' },
      { label: '早晨 06:00-09:00', factor: 0.20, pct: 20, color: '#4fc3f7' },
      { label: '上午 09:00-12:00', factor: 0.10, pct: 10, color: '#00d4aa' },
      { label: '中午 12:00-14:00', factor: 0.25, pct: 25, color: '#ffd54f' },
      { label: '下午 14:00-18:00', factor: 0.05, pct: 5,  color: '#ce93d8' },
      { label: '傍晚 18:00-21:00', factor: 0.30, pct: 30, color: '#ff7043' },
      { label: '夜间 21:00-24:00', factor: 0.05, pct: 5,  color: '#81c784' },
    ],
    gas: [
      { label: '凌晨 00:00-06:00', factor: 0.02, pct: 2,  color: '#607d8b' },
      { label: '早晨 06:00-09:00', factor: 0.15, pct: 15, color: '#ffa726' },
      { label: '上午 09:00-12:00', factor: 0.08, pct: 8,  color: '#ffcc80' },
      { label: '中午 12:00-14:00', factor: 0.10, pct: 10, color: '#ffd54f' },
      { label: '下午 14:00-18:00', factor: 0.05, pct: 5,  color: '#ce93d8' },
      { label: '傍晚 18:00-21:00', factor: 0.55, pct: 55, color: '#ff7043' },
      { label: '夜间 21:00-24:00', factor: 0.05, pct: 5,  color: '#81c784' },
    ],
  }
  const decimals = rankType === 'electric' ? 2 : 3
  return (defs[rankType] || []).map(d => ({
    label: d.label, value: (itemVal * d.factor).toFixed(decimals), pct: d.pct, color: d.color
  }))
}

function openEnergyDetail(type, item = null) {
  // 能耗排行点击：显示分时段耗能明细
  if (type.endsWith('-rank') && item) {
    const rankType = type.replace('-rank', '')
    const units = { electric: 'kWh', water: 'm\u00b3', gas: 'm\u00b3' }
    const rankSrc = rankType === 'water' ? waterRank.value : rankType === 'gas' ? gasRank.value : energyRank.value
    const rankItem = rankSrc.find(r => r.name === item.name) || item
    selectedDevice.value = {
      id: type,
      name: item.name + ' 分时段耗能',
      icon: item.icon,
      type: 'energy',
      title: item.name + ' 分时段耗能',
      unit: units[rankType],
      value: rankItem.val,
      periods: computeRankPeriods(rankType, rankItem.val),
      _rankType: rankType,
      _rankItemName: item.name,
      desc: '今日各时段能耗明细',
    }
    showControlPanel.value = true
    return
  }

  const dailyE = (chartData.value?.energyLine || []).reduce((a, b) => a + b, 0)
  const dailyW = energyLiveData.value.waterToday
  const dailyG = energyLiveData.value.gasToday
  // 电费 0.5580 元/度，水费 2.47 元/吨，燃气费 2.53 元/立方米
  const electricCost = (dailyE * 0.558).toFixed(2)
  const waterCost = (dailyW * 2.47).toFixed(2)
  const gasCost = (dailyG * 2.53).toFixed(2)
  const energyData = {
    today: { title: '今日用电详情', unit: 'kWh', value: dailyE.toFixed(2), trend: electricTrend.value.label, desc: '今日累计用电量', rankList: energyRank.value },
    power: { title: '实时功率', unit: 'kW', value: homeStore.stats.energyUsage.toFixed(1), trend: '', desc: '当前用电功率' },
    total: { title: '累计用电', unit: 'kWh', value: energyLiveData.value.totalEnergy, trend: '', desc: '本月累计用电' },
    saving: { title: '节能率', unit: '%', value: energyLiveData.value.savingRate, trend: '', desc: '相比历史平均节能比例' },
        carbon: { title: '碳减排量', unit: 'kg', value: energyLiveData.value.carbonReduction, trend: '', desc: '相当于减少的二氧化碳排放', savingRate: energyLiveData.value.savingRate },
    water: { title: '今日用水详情', unit: 'm³', value: dailyW.toFixed(3), trend: waterTrend.value.label, desc: '今日累计用水量', rankList: waterRank.value },
    gas: { title: '今日燃气详情', unit: 'm³', value: dailyG.toFixed(3), trend: gasTrend.value.label, desc: '今日累计燃气用量', rankList: gasRank.value },
    cost: { title: '今日费用详情', unit: '元', value: (parseFloat(electricCost) + parseFloat(waterCost) + parseFloat(gasCost)).toFixed(1), trend: costTrend.value.label, desc: '今日电费+水费+燃气费', _electricCost: electricCost, _waterCost: waterCost, _gasCost: gasCost },
    electricCost: { title: '今日电费详情', unit: '元', value: electricCost, trend: electricTrend.value.label, desc: '今日电费支出', rankList: energyRank.value, _rate: '0.558元/kWh' },
    waterCost: { title: '今日水费详情', unit: '元', value: waterCost, trend: waterTrend.value.label, desc: '今日水费支出', rankList: waterRank.value },
    gasCost: { title: '今日燃气费详情', unit: '元', value: gasCost, trend: gasTrend.value.label, desc: '今日燃气费支出', rankList: gasRank.value },
  }
  const data = energyData[type] || energyData.today
  const iconMap = { water: '💧', gas: '🔥', waterCost: '💧', gasCost: '🔥', cost: '💰' }
  selectedDevice.value = {
    id: 'energy-' + type,
    name: data.title,
    icon: iconMap[type] || '⚡',
    type: 'energy',
    status: true,
    value: data.value,
    unit: data.unit,
    trend: data.trend,
    desc: data.desc,
    room: '全屋',
    // 存储类型标签，弹窗通过 computed 读取实时数据，不冻结快照
    energyType: type,
    _savingRate: data.savingRate || energyLiveData.value.savingRate,
    _rankList: data.rankList || [],
    _electricCost: data._electricCost || electricCost,
    _waterCost: data._waterCost || waterCost,
    _gasCost: data._gasCost || gasCost,
  }
  showControlPanel.value = true
}

// 切换选中设备状态
function toggleSelectedDevice() {
  if (!selectedDevice.value) return
  const newStatus = !selectedDevice.value.status
  selectedDevice.value.status = newStatus
  onDeviceUpdate({ ...selectedDevice.value, status: newStatus })
}

// ===== 新增设备 =====
const addDeviceVisible = ref(false)
const addStep = ref('choose') // choose | manual | scan | success
const addFormError = ref('')
const successMsg = ref('')

const roomOptions = ['客厅', '主卧', '次卧', '厨房', '卫生间', '阳台', '玄关', '全屋']
const deviceTypeOptions = [
  { value: 'ac',       label: '空调' },
  { value: 'light',    label: '照明' },
  { value: 'tv',       label: '电视' },
  { value: 'speaker',  label: '音箱' },
  { value: 'ventil',   label: '新风系统' },
  { value: 'washer',   label: '洗碗机' },
  { value: 'heater',   label: '热水器' },
  { value: 'security', label: '安防设备' },
]

const newDevice = ref({ name: '', room: '', vendor: '', type: '', ip: '', status: false })

function openAddDevice() {
  addStep.value = 'choose'
  addFormError.value = ''
  newDevice.value = { name: '', room: '', vendor: '', type: '', ip: '', status: false }
  addDeviceVisible.value = true
}

function closeAddDevice() {
  addDeviceVisible.value = false
}

function submitManualAdd() {
  if (!newDevice.value.name.trim()) { addFormError.value = '请填写设备名称'; return }
  if (!newDevice.value.room) { addFormError.value = '请选择安装位置'; return }
  if (!newDevice.value.type) { addFormError.value = '请选择设备类型'; return }
  addFormError.value = ''
  const nextId = 'dev' + (deviceList.value.length + 100)
  const nextIp = newDevice.value.ip.trim() || autoNextIp()
  const iconMap = { ac:'❄️', light:'💡', tv:'📺', speaker:'🔊', security:'🔒', ventil:'🌀', washer:'🍽️', heater:'🚿' }
  deviceList.value.push({
    id: nextId,
    name: newDevice.value.name.trim(),
    room: newDevice.value.room,
    vendor: newDevice.value.vendor.trim() || '未知',
    ip: nextIp,
    online: true,
    status: newDevice.value.status,
    type: newDevice.value.type,
    value: 0,
  })
  successMsg.value = `「${newDevice.value.name}」已成功添加到设备列表`
  addStep.value = 'success'
}

function autoNextIp() {
  const ips = deviceList.value.map(d => parseInt(d.ip?.split('.').pop() || '0'))
  const max = Math.max(...ips, 10)
  return `192.168.1.${max + 1}`
}

// 扫描网络
const scanning = ref(false)
const scanProgress = ref(0)
const scanStatus = ref('准备扫描')
const scanResults = ref([])
const scanSelected = ref([])
let scanTimer = null

const mockScanDevices = [
  { ip: '192.168.1.102', name: '智能门锁 Pro', vendor: '德施曼', icon: '🔒', type: 'security' },
  { ip: '192.168.1.137', name: '卧室照明',     vendor: '飞利浦', icon: '💡', type: 'light'    },
  { ip: '192.168.1.184', name: '扫地机器人',   vendor: '石头',   icon: '🤖', type: 'sensor'   },
  { ip: '192.168.1.219', name: '智能窗帘',     vendor: '欧瑞博', icon: '🪟', type: 'ventil'   },
  { ip: '192.168.1.253', name: '厨房烟机',     vendor: '方太',   icon: '💨', type: 'ventil'   },
  { ip: '192.168.1.161', name: '浴室暖风机',   vendor: '奥普',   icon: '🌡️', type: 'heater'   },
]

function startScan() {
  addStep.value = 'scan'
  scanning.value = true
  scanProgress.value = 0
  scanStatus.value = '正在扫描网络…'
  scanResults.value = []
  scanSelected.value = []
  clearInterval(scanTimer)
  scanTimer = setInterval(() => {
    scanProgress.value = Math.min(scanProgress.value + Math.random() * 12 + 4, 100)
    if (scanProgress.value >= 100) {
      clearInterval(scanTimer)
      scanning.value = false
      scanStatus.value = '扫描完成'
      const existingIps = new Set(deviceList.value.map(d => d.ip))
      scanResults.value = mockScanDevices.map(d => ({
        ...d,
        alreadyAdded: false,
      }))
    }
  }, 200)
}

function toggleScanSelect(ip) {
  const idx = scanSelected.value.indexOf(ip)
  if (idx === -1) scanSelected.value.push(ip)
  else scanSelected.value.splice(idx, 1)
}

function submitScanAdd() {
  const toAdd = scanResults.value.filter(d => scanSelected.value.includes(d.ip))
  toAdd.forEach(d => {
    deviceList.value.push({
      id: 'dev' + (deviceList.value.length + 100),
      name: d.name,
      room: '未分配',
      vendor: d.vendor,
      ip: d.ip,
      online: true,
      status: false,
      type: d.type,
      value: 0,
    })
  })
  successMsg.value = `已成功添加 ${toAdd.length} 台设备`
  addStep.value = 'success'
}
function openDeviceControlFromTable(device) {
  const iconMap = {
    ac: '❄️', light: '💡', tv: '📺', speaker: '🔊',
    security: '🔒', ventil: '🌀', washer: '🍽️', heater: '🚿',
  }
  // 从 deviceList 读取最新状态
  const latest = deviceList.value.find(d => d.id === device.id) || device
  selectedDevice.value = {
    id: latest.id,
    name: latest.name,
    icon: iconMap[latest.type] || '📱',
    type: latest.type,
    status:   latest.status,
    value:    latest.value,
    mode:     latest.mode     ?? 'cool',
    fanSpeed: latest.fanSpeed ?? 'auto',
    room:     latest.room,
    vendor:   latest.vendor,
    ip:       latest.ip,
    online:   deviceOnline(latest),
  }
  showControlPanel.value = true
}

// 设备详情弹窗
const showDeviceDetail = ref(false)
const deviceDetailId = ref('')

const iconMap = {
  ac: '❄️', light: '💡', tv: '📺', speaker: '🔊',
  security: '🔒', ventil: '🌀', washer: '🍽️', heater: '🚿',
  sensor: '📡', outlet: '🔌',
}

// 弹窗设备数据：从 deviceList 实时查找，不存快照
const deviceDetailItem = computed(() => {
  if (!deviceDetailId.value) return null
  const d = deviceList.value.find(d => d.id === deviceDetailId.value || d.name === deviceDetailId.value)
  return d ? { ...d, icon: iconMap[d.type] || '📱' } : null
})

function openDeviceDetail(device) {
  deviceDetailId.value = device.id
  showDeviceDetail.value = true
}

function closeDeviceDetail() {
  showDeviceDetail.value = false
}

// 产品详情弹窗
const showProductDetail = ref(false)
const productDetailId = ref(0)

const productDetailItem = computed(() => {
  if (!productDetailId.value) return null
  return products.value.find(p => p.id === productDetailId.value) || null
})

function openProductDetail(product) {
  productDetailId.value = product.id
  showProductDetail.value = true
}

function productStatusColor(tag) {
  if (tag === '已接入') return '#00d4aa'
  if (tag === '待接入') return '#0ea5e9'
  if (tag === '未接入') return '#ef4444'
  return 'var(--text-2)'
}

// 设备使用时长（根据设备ID生成固定值）
function deviceUsageTime(device) {
  if (!device) return '0小时'
  const seed = device.id?.charCodeAt(device.id.length - 1) || 0
  const hours = (seed % 500) + 50
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  if (days > 0) {
    return `${days}天 ${remainingHours}小时`
  }
  return `${hours}小时`
}

// 设备用电统计（根据设备类型和ID生成固定值）
function devicePowerStats(device) {
  if (!device) return { day: 0, week: 0, month: 0 }
  const seed = device.id?.charCodeAt(device.id.length - 1) || 0
  const typeMultiplier = {
    ac: 3.5, outlet: 0.8, light: 0.3, tv: 1.2,
    sensor: 0.05, security: 0.1, ventil: 1.5,
    speaker: 0.2, washer: 2.0, heater: 4.0
  }
  const mult = typeMultiplier[device.type] || 0.5
  const base = (seed % 10) + 1
  return {
    day: (base * mult * 0.1).toFixed(2),
    week: (base * mult * 0.7).toFixed(2),
    month: (base * mult * 3).toFixed(2),
  }
}

function deviceTypeLabel(type) {
  const map = {
    ac: '空调', light: '照明', tv: '电视', speaker: '音箱',
    security: '安防', ventil: '新风系统', washer: '洗碗机', heater: '热水器',
  }
  return map[type] || '智能设备'
}

function deviceTypeDesc(type) {
  const map = {
    ac:       '变频空调，支持制冷/制热/送风多种模式，可精确调节室内温度，配合新风系统使用效果更佳。',
    light:    '智能照明设备，支持亮度调节与场景联动，可通过语音或 App 远程控制。',
    tv:       '智能电视，支持 4K 超高清显示，内置流媒体应用，可与音箱联动实现家庭影院效果。',
    speaker:  '智能音箱，支持语音控制全屋设备，内置高品质扬声器，可播放音乐和接收通知。',
    security: '安防设备，实时监测门窗状态，异常时自动推送告警通知，保障家庭安全。',
    ventil:   '新风系统，持续引入室外新鲜空气并过滤 PM2.5，保持室内空气清新健康。',
    washer:   '智能洗碗机，支持多种洗涤程序，高温消毒杀菌，节水节能，保护餐具。',
    heater:   '燃气热水器，即开即热，恒温出水，支持预约和远程控制，安全节能。',
  }
  return map[type] || '智能家居设备，支持远程控制与状态监测。'
}

function deviceTypeTips(type) {
  const map = {
    ac:       '建议夏季设定 26°C，冬季 20°C，配合定时功能节省电费；定期清洗滤网保持制冷效果。',
    light:    '建议根据时段设置不同亮度场景，睡前调低亮度有助于改善睡眠质量。',
    tv:       '建议开启护眼模式，观看时间不宜过长；定期清理缓存保持系统流畅。',
    speaker:  '可设置唤醒词快速控制设备；建议定期更新固件以获取最新功能。',
    security: '建议定期检查设备电量，确保传感器正常工作；异常告警请及时处理。',
    ventil:   '建议全天候开启低速模式保持空气流通；每季度清洗过滤网一次。',
    washer:   '建议使用专用洗碗机洗涤剂；定期清洁过滤网和喷臂，保持洗涤效果。',
    heater:   '建议设定 50-55°C 兼顾舒适与节能；定期除垢延长使用寿命。',
  }
  return map[type] || '定期检查设备状态，如有异常请及时联系售后服务。'
}

const deviceList = ref([
  // 原有设备
  { id: 'dev1',  name: '客厅空调',           icon: '❄️',  room: '客厅',   vendor: '三星',    ip: '192.168.1.47', online: true,  status: true,  type: 'ac',       value: 24 },
  { id: 'dev3',  name: '新风系统',           icon: '🌀',  room: '全屋',   vendor: '海尔',    ip: '192.168.1.83', online: true,  status: true,  type: 'ventil',   value: 50 },
  { id: 'dev4',  name: '客厅电视',           icon: '📺',  room: '客厅',   vendor: '三星',    ip: '192.168.1.156',online: true,  status: false, type: 'tv',       value: 30 },
  { id: 'dev5',  name: '智能音箱',           icon: '🔊',  room: '客厅',   vendor: '米歇尔',    ip: '192.168.1.29', online: true,  status: true,  type: 'speaker',  value: 60 },
  { id: 'dev6',  name: '门禁系统',           icon: '🔒',  room: '玄关',   vendor: '德施曼',  ip: '192.168.1.112',online: true,  status: false, type: 'security', value: 0  },
  { id: 'dev7',  name: '主卧空调',           icon: '🌬️', room: '主卧',   vendor: '三星',    ip: '192.168.1.64', online: true,  status: false, type: 'ac',       value: 26 },
  { id: 'dev8',  name: '次卧空调',           icon: '🌡️', room: '次卧',   vendor: '三星',    ip: '192.168.1.91', online: true,  status: false, type: 'ac',       value: 26 },
  { id: 'dev9',  name: '洗碗机',             icon: '🍽️', room: '厨房',   vendor: '西门子',  ip: '192.168.1.178',online: true,  status: false, type: 'washer',   value: 0  },
  { id: 'dev10', name: '燃气热水器',         icon: '🚿',  room: '厨房',   vendor: '阿里斯顿',    ip: '192.168.1.203',online: true,  status: false, type: 'heater',   value: 55 },
  // 顶牌设备（3D场景中的设备）
  { id: 'dev11', name: '空调插座A',           icon: '🔌',  room: '主卧',   vendor: '小米',    ip: '192.168.1.38', online: true,  status: true,  type: 'outlet',   value: 0  },
  { id: 'dev12', name: '主卧灯开关',         icon: '🛏️', room: '主卧',   vendor: '小米',    ip: '192.168.1.55', online: true,  status: true,  type: 'light',    value: 80 },
  { id: 'dev13', name: '空调插座B',           icon: '🔌',  room: '次卧',   vendor: '小米',    ip: '192.168.1.72', online: true,  status: false, type: 'outlet',   value: 0  },
  { id: 'dev14', name: '次卧灯开关',         icon: '🌙',  room: '次卧',   vendor: '小米',    ip: '192.168.1.99', online: true,  status: false, type: 'light',    value: 0  },
  { id: 'dev16', name: '客厅插座A',           icon: '🔌',  room: '客厅',   vendor: '小米',    ip: '192.168.1.134',online: true,  status: true,  type: 'outlet',   value: 0  },
  { id: 'dev17', name: '空气质量传感器',     icon: '🌫️', room: '客厅',   vendor: '霍尼韦尔',ip: '192.168.1.167',online: true,  status: true,  type: 'sensor',   value: 0  },
  { id: 'dev18', name: '门禁控制器',         icon: '🚪',  room: '玄关',   vendor: '德施曼',  ip: '192.168.1.118',online: true,  status: true,  type: 'security', value: 0  },
  { id: 'dev19', name: '客厅灯开关',         icon: '🏠',  room: '客厅',   vendor: '小米',    ip: '192.168.1.143',online: true,  status: true,  type: 'light',    value: 100 },
  { id: 'dev20', name: '客厅插座B',           icon: '🔌',  room: '客厅',   vendor: '小米',    ip: '192.168.1.189',online: true,  status: true,  type: 'outlet',   value: 0  },
  { id: 'dev21', name: '厨房灯开关',         icon: '🍳',  room: '厨房',   vendor: '小米',    ip: '192.168.1.214',online: true,  status: true,  type: 'light',    value: 100 },
  { id: 'dev22', name: '厨房插座',           icon: '🔌',  room: '厨房',   vendor: '小米',    ip: '192.168.1.231',online: true,  status: false, type: 'outlet',   value: 0  },
  { id: 'dev23', name: '烟雾/燃气传感器',   icon: '🔥',  room: '厨房',   vendor: '海曼',    ip: '192.168.1.245',online: true,  status: true,  type: 'sensor',   value: 0  },
  { id: 'dev24', name: '水浸传感器',         icon: '💧',  room: '卫生间', vendor: '小米',    ip: '192.168.1.17', online: true,  status: true,  type: 'sensor',   value: 0  },
  { id: 'dev25', name: '卫生间灯开关',       icon: '🚿',  room: '卫生间', vendor: '小米',    ip: '192.168.1.33', online: true,  status: false, type: 'light',    value: 0  },
  { id: 'dev26', name: '阳台灯开关',         icon: '🌿',  room: '阳台',   vendor: '小米',    ip: '192.168.1.58', online: true,  status: false, type: 'light',    value: 0  },
  { id: 'dev27', name: '温湿度/光照传感器', icon: '🌡️', room: '阳台',   vendor: '小米',    ip: '192.168.1.76', online: true,  status: true,  type: 'sensor',   value: 0  },
  // 顶牌新增设备
  { id: 'dev28', name: '抽油烟机',          icon: '🌀',  room: '厨房',   vendor: '欧派',    ip: '192.168.1.142',online: true,  status: false, type: 'ventil',   value: 0  },
])

// 设备列表筛选
const deviceRoomFilter = ref('')
const deviceTypeFilter = ref('')
const devicePage = ref(1)
const DEVICE_PAGE_SIZE = 10

const filteredDevices = computed(() => {
  // 合并类型映射
  const typeGroupMap = {
    'ac':       ['ac', 'ventil'],
    'light':    ['light'],
    'outlet':   ['outlet'],
    'sensor':   ['sensor', 'security'],
    'appliance':['tv', 'speaker', 'washer', 'heater'],
  }
  let list = deviceList.value.filter(d => {
    const matchSearch = !deviceSearch.value || d.name.includes(deviceSearch.value)
    const matchRoom   = !deviceRoomFilter.value || d.room === deviceRoomFilter.value
    const matchType   = !deviceTypeFilter.value ||
      (typeGroupMap[deviceTypeFilter.value] || []).includes(d.type)
    return matchSearch && matchRoom && matchType
  })
  // 按房间排序
  const roomOrder = { '客厅': 1, '主卧': 2, '次卧': 3, '厨房': 4, '卫生间': 5, '阳台': 6, '玄关': 7, '全屋': 8 }
  list.sort((a, b) => (roomOrder[a.room] || 9) - (roomOrder[b.room] || 9))
  return list
})

const deviceTotalPages = computed(() => Math.max(1, Math.ceil(filteredDevices.value.length / DEVICE_PAGE_SIZE)))

const pagedDevices = computed(() => {
  if (devicePage.value > deviceTotalPages.value) devicePage.value = 1
  const start = (devicePage.value - 1) * DEVICE_PAGE_SIZE
  return filteredDevices.value.slice(start, start + DEVICE_PAGE_SIZE)
})

const healthItems = ref([
  { icon: '❤',  label: '心率',   value: '72次/分',   trend: 2,   color: '#ff6b6b', range: '正常: 60-100次/分',   pct: 72,  raw: 72 },
  { icon: '🩸', label: '血压',   value: '118/75mmHg', trend: 0,   color: '#8b5cf6', range: '正常: 90-139/60-89', pct: 85,  raw: 118 },
  { icon: '🌡', label: '体温',   value: '36.5°C',     trend: 0.1, color: '#ff9800', range: '正常: 36.0-37.2°C',  pct: 50,  raw: 36.5 },
  { icon: '🫁', label: '血氧',   value: '98%',        trend: 1,   color: '#4fc3f7', range: '正常: 95-100%',      pct: 98,  raw: 98 },
  { icon: '😴', label: '睡眠',   value: '7.8小时',    trend: 0,   color: '#4cd964', range: '正常: 7-9小时',      pct: 83,  raw: 7.8 },
  { icon: '👟', label: '步数',   value: '3542步',     trend: 0,   color: '#00d4aa', range: '目标: 10000步',      pct: 35,  raw: 3542 },
])

// 心率趋势数据 (24小时)
const heartRateData = ref([
  { time: '00:00', value: 65 }, { time: '01:00', value: 62 }, { time: '02:00', value: 58 },
  { time: '03:00', value: 55 }, { time: '04:00', value: 58 }, { time: '05:00', value: 62 },
  { time: '06:00', value: 72 }, { time: '07:00', value: 68 }, { time: '08:00', value: 75 },
  { time: '09:00', value: 70 }, { time: '10:00', value: 78 }, { time: '11:00', value: 72 },
  { time: '12:00', value: 80 }, { time: '13:00', value: 74 }, { time: '14:00', value: 82 },
  { time: '15:00', value: 76 }, { time: '16:00', value: 72 }, { time: '17:00', value: 68 },
  { time: '18:00', value: 75 }, { time: '19:00', value: 71 }, { time: '20:00', value: 78 },
  { time: '21:00', value: 73 }, { time: '22:00', value: 80 }, { time: '23:00', value: 75 },
])

// 血压周数据
const bpWeekData = ref([
  { sys: 115, dia: 75 }, { sys: 120, dia: 78 }, { sys: 118, dia: 76 },
  { sys: 122, dia: 80 }, { sys: 116, dia: 74 }, { sys: 119, dia: 77 },
  { sys: 118, dia: 78 },
])

// 血氧趋势数据 (24小时)
const spo2TrendData = ref([
  { time: '00:00', value: 98 }, { time: '01:00', value: 97 }, { time: '02:00', value: 97 },
  { time: '03:00', value: 96 }, { time: '04:00', value: 97 }, { time: '05:00', value: 98 },
  { time: '06:00', value: 98 }, { time: '07:00', value: 97 }, { time: '08:00', value: 98 },
  { time: '09:00', value: 99 }, { time: '10:00', value: 98 }, { time: '11:00', value: 97 },
  { time: '12:00', value: 98 }, { time: '13:00', value: 97 }, { time: '14:00', value: 98 },
  { time: '15:00', value: 99 }, { time: '16:00', value: 98 }, { time: '17:00', value: 98 },
  { time: '18:00', value: 97 }, { time: '19:00', value: 98 }, { time: '20:00', value: 99 },
  { time: '21:00', value: 98 }, { time: '22:00', value: 97 }, { time: '23:00', value: 98 },
])

// 体温趋势数据 (24小时)
const temperatureTrendData = ref([
  { time: '00:00', value: 36.2 }, { time: '01:00', value: 36.1 }, { time: '02:00', value: 36.0 },
  { time: '03:00', value: 36.0 }, { time: '04:00', value: 36.1 }, { time: '05:00', value: 36.2 },
  { time: '06:00', value: 36.3 }, { time: '07:00', value: 36.4 }, { time: '08:00', value: 36.5 },
  { time: '09:00', value: 36.6 }, { time: '10:00', value: 36.7 }, { time: '11:00', value: 36.8 },
  { time: '12:00', value: 36.9 }, { time: '13:00', value: 37.0 }, { time: '14:00', value: 36.9 },
  { time: '15:00', value: 36.8 }, { time: '16:00', value: 36.7 }, { time: '17:00', value: 36.6 },
  { time: '18:00', value: 36.5 }, { time: '19:00', value: 36.4 }, { time: '20:00', value: 36.3 },
  { time: '21:00', value: 36.2 }, { time: '22:00', value: 36.1 }, { time: '23:00', value: 36.0 },
])

// 步数趋势数据 (近7天)，今天(最后一项)含 hourData 用于日视图柱状图
const stepsTrendData = ref([
  { day: '周一', value: 8234 },
  { day: '周二', value: 10521 },
  { day: '周三', value: 6542 },
  { day: '周四', value: 7896 },
  { day: '周五', value: 11230 },
  { day: '周六', value: 9876 },
  { day: '周日', value: 8547, hourData: [] },
])

// ========== 步数实时模拟系统 ==========
// 目标: 每日 9000~11000 步(目标90%-110%)，小时分布合理，20点前落后则追赶，到达目标后缓慢增长

const STEP_TARGET_BASE = 10000   // 基础目标
const STEP_TARGET_MIN  = 9000    // 90%
const STEP_TARGET_MAX  = 11000   // 110%

// 合理的小时分布比例（从8:00开始，24小时归一化，和=1）
// 早高峰通勤、中午/下午低、傍晚高、晚间递减
const STEP_HOUR_WEIGHTS = [
  0, 0, 0, 0, 0, 0, 0, 0,    // 0-7点: 0（睡眠/未开始）
  0.12,                       // 8点  早高峰通勤
  0.07, 0.06, 0.05,           // 9-11 工作时段
  0.06, 0.05,                 // 12-13 午休
  0.05, 0.05, 0.05, 0.05,    // 14-17 下午
  0.08,                       // 18点 傍晚
  0.12,                       // 19点 晚饭后高峰
  0.10,                       // 20点 晚间散步
  0.06, 0.05, 0.04,           // 21-23 递减
]

// 每天的步数模拟状态（持久化，不随 Vue 响应式）
const stepsSim = {
  dailyTarget: STEP_TARGET_BASE,       // 今日目标
  accumulated: 0,                       // 累计步数（今日已走）
  catchUpMode: false,                  // 是否处于追赶模式
  lastHour: -1,                        // 上次模拟的小时（用于整点重置）
}

function initStepsSimulation() {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()

  // 每日目标：基础值 ±10% 随机 (9000~11000)
  stepsSim.dailyTarget = Math.round(STEP_TARGET_BASE * (0.9 + Math.random() * 0.2))
  stepsSim.catchUpMode = false
  stepsSim.lastHour = hour

  // 计算当前时间应该已经完成的步数（按小时分布累加）
  const totalHourWeight = STEP_HOUR_WEIGHTS.slice(8, 24).reduce((a, b) => a + b, 0)
  let expectedSteps = 0
  const hourData = []

  // 生成 8:00 到当前小时的完整 hourData（存储每个时段的步数增量）
  for (let h = 8; h <= hour; h++) {
    const weight = STEP_HOUR_WEIGHTS[h] || 0
    const hourTarget = stepsSim.dailyTarget * (weight / totalHourWeight)
    // 已过去的小时：完整步数；当前小时：按分钟比例
    const isCurrentHour = h === hour
    const fraction = isCurrentHour ? (minute / 60) : 1
    
    // 计算该时段的目标步数（基于小时权重和比例）
    const targetHourSteps = Math.round(hourTarget * fraction)
    // 添加小随机波动（±15%），但保证至少为0
    const randomFactor = 0.85 + Math.random() * 0.3 // 0.85 ~ 1.15
    const hourIncrement = Math.max(0, Math.round(targetHourSteps * randomFactor))
    
    expectedSteps += hourIncrement
    
    // 每个整点记录时段增量
    hourData.push({ hour: String(h).padStart(2, '0') + ':00', value: hourIncrement })
  }

  stepsSim.accumulated = expectedSteps

  // 判断是否处于追赶模式（当前步数 < 期望的 90% 且未到 20 点）
  const idealProgress = stepsSim.dailyTarget * (STEP_HOUR_WEIGHTS.slice(0, hour + 1).reduce((a, b) => a + b, 0))
  stepsSim.catchUpMode = hour < 20 && expectedSteps < idealProgress * 0.9

  // 初始化 healthItems 步数
  const stepsItem = healthItems.value[5]
  stepsItem.raw = expectedSteps
  stepsItem.value = expectedSteps.toLocaleString() + '步'
  stepsItem.pct = Math.min(100, Math.round((expectedSteps / 10000) * 100))
  stepsItem.trend = 0

  // 初始化 stepsTrendData 今天的值和 hourData
  const stepsIdx = stepsTrendData.value.length - 1
  stepsTrendData.value = stepsTrendData.value.map((item, i) =>
    i === stepsIdx ? { ...item, value: expectedSteps, hourData: [...hourData] } : item
  )
}

function simulateStepsPerTick() {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const second = now.getSeconds()

  // 每小时整点检查是否需要重置追赶状态
  if (minute === 0 && hour !== stepsSim.lastHour) {
    stepsSim.lastHour = hour
    // 每小时开始时重新判断是否需要追赶
    const expected = stepsSim.dailyTarget * (STEP_HOUR_WEIGHTS.slice(0, hour + 1).reduce((a, b) => a + b, 0))
    const behind = stepsSim.accumulated < expected * 0.95 // 落后超过5%则追赶
    stepsSim.catchUpMode = hour < 20 && behind && stepsSim.accumulated < stepsSim.dailyTarget
  }

  const totalHourWeight = STEP_HOUR_WEIGHTS.slice(8, 24).reduce((a, b) => a + b, 0)
  const currentHourWeight = STEP_HOUR_WEIGHTS[hour] || 0

  // 计算本小时应该有的步数（4秒一次，一小时900个tick）
  const hourTarget = stepsSim.dailyTarget * (currentHourWeight / totalHourWeight)
  const ticksPerHour = 900 // 3600秒 / 4秒 = 900 ticks

  // 基准步数（按小时分布的自然步数，每4秒一次）
  let addSteps = Math.max(0, Math.round(currentHourWeight > 0
    ? (hourTarget / ticksPerHour) * (0.85 + Math.random() * 0.3)
    : 0))

  // 追赶模式：加速追赶
  if (stepsSim.catchUpMode) {
    const deficit = stepsSim.dailyTarget * 0.9 - stepsSim.accumulated
    const remainingTicks = ((20 - hour) * 60 - minute) * 15 - Math.floor(second / 4) // 剩余4秒tick数
    if (deficit > 0 && remainingTicks > 0) {
      addSteps += Math.max(0, Math.round(deficit / remainingTicks * 1.5))
    }
  }

  // 达到目标后：极缓慢增长（每4秒 0-1 步）
  if (!stepsSim.catchUpMode && stepsSim.accumulated >= stepsSim.dailyTarget * 0.9) {
    addSteps = Math.random() > 0.7 ? 1 : 0 // 30%概率增加1步
  }

  // 封顶：最多不超过目标的 120%
  const prevAccumulated = stepsSim.accumulated
  stepsSim.accumulated = Math.min(Math.round(stepsSim.dailyTarget * 1.2), stepsSim.accumulated + addSteps)
  const actualAddSteps = stepsSim.accumulated - prevAccumulated

  // 更新 healthItems[5]（步数卡片指标）
  const stepsItem = healthItems.value[5]
  stepsItem.raw = stepsSim.accumulated
  stepsItem.value = stepsSim.accumulated.toLocaleString() + '步'
  stepsItem.pct = Math.min(100, Math.round((stepsSim.accumulated / 10000) * 100))
  stepsItem.trend = actualAddSteps

  // 更新当前小时的 hourData（存储时段增量，而非累计值）
  const hourLabel = String(hour).padStart(2, '0') + ':00'
  const today = stepsTrendData.value[stepsTrendData.value.length - 1]
  const existingHourIdx = today.hourData.findIndex(h => h.hour === hourLabel)
  if (existingHourIdx >= 0) {
    // 累加到当前时段
    today.hourData[existingHourIdx].value += actualAddSteps
  } else {
    today.hourData.push({ hour: hourLabel, value: actualAddSteps })
  }

  // 同步更新 stepsTrendData 最后一项的总 value
  const stepsIdx = stepsTrendData.value.length - 1
  stepsTrendData.value = stepsTrendData.value.map((item, i) =>
    i === stepsIdx ? { ...item, value: stepsSim.accumulated, hourData: [...today.hourData] } : item
  )
}

// 睡眠数据
const sleepData = ref({
  total: 7.8,
  score: 88,
  deep: 102,    // 深睡 分钟 (~1h42min)
  light: 186,   // 浅睡 分钟 (~3h06min)
  rem: 72,      // REM 分钟 (~1h12min)
  awakeMin: 18, // 清醒总时长 分钟 (~18min)
  awakeCount: 2,// 清醒次数
})


// 心率 Tooltip
const heartTooltip = ref({ visible: false, x: 0, y: 0, time: '', value: 0 })

function showHeartTooltip(event, data, index) {
  const rect = event.target.getBoundingClientRect()
  const parentRect = event.target.closest('.heart-wave').getBoundingClientRect()
  heartTooltip.value = {
    visible: true,
    x: rect.left - parentRect.left + rect.width / 2,
    y: rect.top - parentRect.top - 70,
    time: data.time,
    value: data.value,
  }
}

function hideHeartTooltip() {
  heartTooltip.value.visible = false
}

function getHeartStatus(value) {
  if (value < 60) return { text: '偏低', class: 'warning' }
  if (value <= 100) return { text: '正常', class: 'normal' }
  if (value <= 120) return { text: '略高', class: 'warning' }
  return { text: '偏高', class: 'danger' }
}

// 血压 Tooltip
const bpTooltip = ref({ visible: false, x: 0, y: 0, dayIndex: 0, sys: 0, dia: 0 })

function showBpTooltip(event, data, index) {
  const rect = event.target.getBoundingClientRect()
  const parentRect = event.target.closest('.bp-trend').getBoundingClientRect()
  bpTooltip.value = {
    visible: true,
    x: rect.left - parentRect.left + rect.width / 2,
    y: rect.top - parentRect.top - 90,
    dayIndex: index,
    sys: data.sys,
    dia: data.dia,
  }
}

function hideBpTooltip() {
  bpTooltip.value.visible = false
}

function getBpStatus(sys, dia) {
  if (sys < 90 || dia < 60) return { text: '偏低', class: 'warning' }
  if (sys <= 120 && dia <= 80) return { text: '理想', class: 'normal' }
  if (sys <= 139 || dia <= 89) return { text: '正常高值', class: 'warning' }
  return { text: '偏高', class: 'danger' }
}

function getSpo2Status(value) {
  if (value >= 95) return { text: '正常', class: 'normal' }
  if (value >= 90) return { text: '偏低', class: 'warning' }
  return { text: '危险', class: 'danger' }
}

function getTempStatus(value) {
  if (value < 36.1) return { text: '偏低', class: 'warning' }
  if (value <= 37.2) return { text: '正常', class: 'normal' }
  if (value <= 38.0) return { text: '低热', class: 'warning' }
  return { text: '发烧', class: 'danger' }
}

function getStepsStatus(value) {
  if (value >= 10000) return { text: '已达标', class: 'normal' }
  if (value >= 6000) return { text: '进行中', class: 'warning' }
  return { text: '不足', class: 'danger' }
}

// 格式化指标值：数字+英文单位用 mono 粗体，中文单位用默认字体
function formatMetricValue(str) {
  if (!str) return ''
  // 数字和英文用 num 类（mono 字体），中文单位不加 span（继承 body 默认字体）
  return str.replace(/([a-zA-Z0-9.,%°]+)/g, '<span class="num">$1</span>')
}

// ========== 策略告警页面 ==========
const alarmTab = ref('device')
const alarmSearch = ref('')
const alarmLevelFilter = ref('')
const alarmStatusFilter = ref('')
const alarmPage = ref(1)
const strategyPage = ref(1)
const PAGE_SIZE = 8
const STRATEGY_PAGE_SIZE = 8
const strategyDetailVisible = ref(false)
const selectedStrategy = ref(null)

function switchAlarmTab(tab) {
  alarmTab.value = tab
  alarmPage.value = 1
  strategyPage.value = 1
  // 切换标签时重置筛选条件，显示全部告警
  alarmSearch.value = ''
  alarmLevelFilter.value = ''
  alarmStatusFilter.value = ''
}
function resolveAlarm(alarm) { alarm.status = 'done'; alarm.statusText = '已处理' }
function markAllAlarmsDone() { filteredAlarms.value.forEach(a => { a.status = 'done'; a.statusText = '已处理' }) }
function clearDoneAlarms() { allAlarms.value = allAlarms.value.filter(a => a.status === 'pending'); alarmPage.value = 1 }
function openStrategyDetail(s) { selectedStrategy.value = s; strategyDetailVisible.value = true }

// 合并所有告警（设备 + 健康）
const allAlarms = ref([
  { id: 201, time: '15:20', type: 'device', source: '客厅空调', icon: '❄️', content: '温度传感器异常，读数偏差超过 5°C，请检查传感器或联系售后', level: 'danger', levelText: '严重', status: 'pending', statusText: '未处理', suggestion: '建议立即联系售后检修' },
  { id: 202, time: '14:05', type: 'device', source: '厨房烟雾传感器', icon: '💨', content: '电池电量低于 10%，需及时更换电池', level: 'warn', levelText: '警告', status: 'pending', statusText: '未处理', suggestion: '请更换电池' },
  { id: 203, time: '13:30', type: 'device', source: '主卧智能门锁', icon: '🔐', content: '连续 3 次密码输入错误，已临时锁定', level: 'danger', levelText: '严重', status: 'done', statusText: '已处理', suggestion: null },
  { id: 204, time: '12:15', type: 'device', source: '阳台摄像头', icon: '📹', content: '设备离线超过 30 分钟，网络连接异常', level: 'warn', levelText: '警告', status: 'pending', statusText: '未处理', suggestion: '检查网络和电源' },
  { id: 205, time: '11:00', type: 'device', source: '客厅扫地机器人', icon: '🤖', content: '尘盒已满，请清理后再使用', level: 'info', levelText: '提示', status: 'done', statusText: '已处理', suggestion: null },
  { id: 206, time: '10:30', type: 'device', source: '热水器', icon: '🚿', content: '固件更新可用（v3.2.1），建议更新以获取最新功能', level: 'info', levelText: '提示', status: 'pending', statusText: '未处理', suggestion: null },
  { id: 207, time: '昨日',  type: 'device', source: '玄关人体传感器', icon: '📡', content: '感应灵敏度下降，检测范围缩小', level: 'warn', levelText: '警告', status: 'done', statusText: '已处理', suggestion: null },
  { id: 208, time: '前日',  type: 'device', source: '书房智能插座', icon: '🔌', content: '功率超载保护触发（> 2200W），插座已自动断电', level: 'danger', levelText: '严重', status: 'done', statusText: '已处理', suggestion: '减少插座上的设备' },
  { id: 209, time: '09:45', type: 'device', source: '厨房净水器', icon: '💧', content: '滤芯寿命剩余 10%，建议 3 天内更换', level: 'warn', levelText: '警告', status: 'pending', statusText: '未处理', suggestion: '更换滤芯' },
  { id: 210, time: '08:30', type: 'device', source: '主卧空调', icon: '❄️', content: '运行超时提醒：已连续运行 8 小时', level: 'info', levelText: '提示', status: 'done', statusText: '已处理', suggestion: null },
  { id: 211, time: '昨日',  type: 'device', source: '客厅窗帘电机', icon: '🪟', content: '行程校准数据丢失，需重新设置行程', level: 'warn', levelText: '警告', status: 'pending', statusText: '未处理', suggestion: '重新校准窗帘行程' },
  { id: 212, time: '前日',  type: 'device', source: '车库门传感器', icon: '🚪', content: '开门响应延迟 > 3 秒，传感器可能老化', level: 'info', levelText: '提示', status: 'done', statusText: '已处理', suggestion: null },
  { id: 101, time: '08:30', type: 'health', source: '健康监测', icon: '❤️', content: '心率持续偏高（> 100bpm 超过 10 分钟），请注意休息', level: 'warn', levelText: '警告', status: 'done', statusText: '已处理', suggestion: '建议适当休息，减少咖啡因摄入' },
  { id: 102, time: '14:15', type: 'health', source: '健康监测', icon: '❤️', content: '久坐提醒：已连续坐着超过 2 小时', level: 'info', levelText: '提示', status: 'pending', statusText: '未处理', suggestion: '站起来活动一下' },
  { id: 103, time: '昨日',  type: 'health', source: '健康监测', icon: '❤️', content: '睡眠时长不足：实际睡眠 5.2 小时，低于推荐 7 小时', level: 'warn', levelText: '警告', status: 'done', statusText: '已处理', suggestion: '建议提前入睡时间' },
  { id: 104, time: '前日',  type: 'health', source: '健康监测', icon: '❤️', content: '饮水提醒：今日饮水量仅 0.8L，未达到 2L 目标', level: 'info', levelText: '提示', status: 'done', statusText: '已处理', suggestion: '多喝水' },
  { id: 105, time: '07:50', type: 'health', source: '健康监测', icon: '❤️', content: '血压偏高：收缩压 142mmHg，建议复测', level: 'warn', levelText: '警告', status: 'pending', statusText: '未处理', suggestion: '静坐后复测血压' },
  { id: 106, time: '21:00', type: 'health', source: '健康监测', icon: '❤️', content: '血氧偏低：SpO2 91%，低于正常范围（95-100%）', level: 'danger', levelText: '严重', status: 'pending', statusText: '未处理', suggestion: '建议深呼吸，如持续请就医' },
  { id: 107, time: '18:30', type: 'health', source: '健康监测', icon: '❤️', content: '体温正常：36.5°C，今日无异常', level: 'info', levelText: '提示', status: 'done', statusText: '已处理', suggestion: null },
  { id: 108, time: '昨日',  type: 'health', source: '健康监测', icon: '❤️', content: '体重变化提醒：较上周增加 1.2kg，建议关注饮食', level: 'info', levelText: '提示', status: 'done', statusText: '已处理', suggestion: '注意饮食和运动' },
  { id: 109, time: '昨日',  type: 'health', source: '健康监测', icon: '❤️', content: '紫外线强度偏高，外出请注意防晒', level: 'info', levelText: '提示', status: 'done', statusText: '已处理', suggestion: '外出使用防晒霜' },
  { id: 110, time: '前日',  type: 'health', source: '健康监测', icon: '❤️', content: '空气质量提醒：室内 PM2.5 超标（78μg/m³）', level: 'warn', levelText: '警告', status: 'done', statusText: '已处理', suggestion: '开启空气净化器' },
])

const strategies = ref([
  { id: 1, name: '空调节能模式', type: 'auto', typeText: '自动控制', description: '当室内温度达到设定目标后，自动将空调切换至节能模式，减少能耗 25-30%', trigger: '温度 > 26°C 持续 15 分钟', triggerTypeText: '温控触发', targetDevice: '客厅空调', action: '切换到节能模式（低风速，26°C）', delay: 0, execCount: 847, successRate: 99, lastExec: '今日 14:20', status: 'normal', statusText: '正常', active: true },
  { id: 2, name: '离家模式', type: 'auto', typeText: '自动控制', description: '所有家庭成员都离开家后，自动关闭所有灯、空调和待机设备', trigger: '所有人员定位均不在家内', triggerTypeText: '离家触发', targetDevice: '全屋设备', action: '关闭全部灯、空调、电视、音响', delay: 5, execCount: 312, successRate: 98, lastExec: '昨日 18:05', status: 'normal', statusText: '正常', active: true },
  { id: 3, name: '夜间低功耗', type: 'timer', typeText: '定时策略', description: '每天 23:00 自动关闭不必要的设备，进入低功耗睡眠模式', trigger: '每日 23:00', triggerTypeText: '定时触发', targetDevice: '客厅/书房设备', action: '关闭电视、音响、台灯，仅保留卧室设备', delay: 0, execCount: 1204, successRate: 100, lastExec: '今日 23:00', status: 'normal', statusText: '正常', active: true },
  { id: 4, name: 'PM2.5 超标告警', type: 'threshold', typeText: '阈值告警', description: '当室内 PM2.5 超过 75μg/m³ 时，自动开启空气净化器', trigger: 'PM2.5 > 75μg/m³', triggerTypeText: '阈值触发', targetDevice: '全屋空气净化器', action: '开启空气净化器最高档', delay: 0, execCount: 89, successRate: 100, lastExec: '前日 10:30', status: 'normal', statusText: '正常', active: true },
  { id: 5, name: '智能灯光感应', type: 'auto', typeText: '自动控制', description: '光照强度低于 100lux 且有人移动时，自动开启区域灯光', trigger: '光照 < 100lux + 人体感应有人', triggerTypeText: '复合触发', targetDevice: '对应区域灯光', action: '开启对应区域灯光至 60% 亮度', delay: 3, execCount: 2341, successRate: 97, lastExec: '今日 07:15', status: 'normal', statusText: '正常', active: true },
  { id: 6, name: '暴雨防汛模式', type: 'threshold', typeText: '阈值告警', description: '当检测到室外暴雨天气时，自动关闭窗户、开启除湿机', trigger: '室外天气 = 暴雨', triggerTypeText: '天气触发', targetDevice: '窗户电机 + 除湿机', action: '关闭所有窗户，开启除湿机', delay: 0, execCount: 12, successRate: 100, lastExec: '上周三 08:20', status: 'normal', statusText: '正常', active: true },
  { id: 7, name: '健康饮水提醒', type: 'timer', typeText: '定时策略', description: '白天每 2 小时提醒一次饮水，帮助养成健康饮水习惯', trigger: '每日 09:00-18:00 每 2 小时', triggerTypeText: '定时触发', targetDevice: '手机 App 推送', action: '发送饮水提醒通知', delay: 0, execCount: 523, successRate: 100, lastExec: '今日 15:00', status: 'normal', statusText: '正常', active: false },
  { id: 8, name: '热水器定时加热', type: 'timer', typeText: '定时策略', description: '每天 06:30 和 21:00 自动加热热水器，其余时间保温模式', trigger: '每日 06:30 / 21:00', triggerTypeText: '定时触发', targetDevice: '热水器', action: '切换到加热模式（60°C）', delay: 0, execCount: 980, successRate: 99, lastExec: '今日 06:30', status: 'normal', statusText: '正常', active: true },
  { id: 9, name: '烟雾告警联动', type: 'auto', typeText: '自动控制', description: '烟雾传感器检测到异常烟雾时，立刻打开所有窗户并推送告警', trigger: '烟雾传感器触发报警', triggerTypeText: '安防触发', targetDevice: '窗户电机 + 告警系统', action: '打开所有窗户 + 推送告警 + 拨打紧急联系人', delay: 0, execCount: 3, successRate: 100, lastExec: '上月 15 日 03:10', status: 'normal', statusText: '正常', active: true },
  { id: 10, name: '回家模式', type: 'auto', typeText: '自动控制', description: '第一位家庭成员到家时，自动打开玄关灯、客厅灯和空调至舒适温度', trigger: '任一人员回家（定位进入家内）', triggerTypeText: '回家触发', targetDevice: '玄关灯 + 客厅灯 + 空调', action: '开玄关灯 30%、客厅灯 80%、空调 24°C', delay: 0, execCount: 845, successRate: 99, lastExec: '今日 18:30', status: 'normal', statusText: '正常', active: true },
  { id: 11, name: '睡眠模式', type: 'auto', typeText: '自动控制', description: '夜间睡眠时段自动关闭客厅灯、调暗卧室灯、关闭窗帘、降低空调温度', trigger: '每日 22:00 自动触发', triggerTypeText: '定时触发', targetDevice: '客厅灯 + 卧室灯 + 窗帘 + 空调', action: '关客厅灯、卧室灯 10%、关窗帘、空调 20°C', delay: 0, execCount: 320, successRate: 98, lastExec: '昨日 22:00', status: 'normal', statusText: '正常', active: true },
  { id: 12, name: '电费超支告警', type: 'threshold', typeText: '阈值告警', description: '当本月电费超过月度预算 80% 时发送告警，超过 100% 时关闭高耗能设备', trigger: '月度电费 > 预算 80% / 100%', triggerTypeText: '阈值触发', targetDevice: '全部 / 高耗能设备', action: '80%: 推送告警 / 100%: 关闭非必要高耗能设备', delay: 0, execCount: 24, successRate: 100, lastExec: '本月 5 日 09:00', status: 'normal', statusText: '正常', active: true },
])

const filteredAlarms = computed(() => {
  let list = allAlarms.value.filter(a => a.type === alarmTab.value)
  if (alarmSearch.value) { const q = alarmSearch.value.toLowerCase(); list = list.filter(a => a.content.toLowerCase().includes(q) || a.source.toLowerCase().includes(q)) }
  if (alarmLevelFilter.value) list = list.filter(a => a.level === alarmLevelFilter.value)
  if (alarmStatusFilter.value) list = list.filter(a => a.status === alarmStatusFilter.value)
  return list
})
const paginatedAlarms = computed(() => filteredAlarms.value.slice((alarmPage.value - 1) * PAGE_SIZE, alarmPage.value * PAGE_SIZE))
const alarmTotalPages = computed(() => Math.max(1, Math.ceil(filteredAlarms.value.length / PAGE_SIZE)))
const visiblePages = computed(() => {
  const tp = alarmTotalPages.value, cp = alarmPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages = [1]
  if (cp > 3) pages.push('…')
  for (let p = Math.max(2, cp - 1); p <= Math.min(tp - 1, cp + 1); p++) pages.push(p)
  if (cp < tp - 2) pages.push('…')
  pages.push(tp)
  return pages
})
const paginatedStrategies = computed(() => strategies.value.slice((strategyPage.value - 1) * STRATEGY_PAGE_SIZE, strategyPage.value * STRATEGY_PAGE_SIZE))
const strategyTotalPages = computed(() => Math.max(1, Math.ceil(strategies.value.length / STRATEGY_PAGE_SIZE)))
const visibleStrategyPages = computed(() => {
  const tp = strategyTotalPages.value, cp = strategyPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages = [1]
  if (cp > 3) pages.push('…')
  for (let p = Math.max(2, cp - 1); p <= Math.min(tp - 1, cp + 1); p++) pages.push(p)
  if (cp < tp - 2) pages.push('…')
  pages.push(tp)
  return pages
})
watch([alarmSearch, alarmLevelFilter, alarmStatusFilter], () => { alarmPage.value = 1 })

// 能耗排行数据（按日常家用标准：日电5-6度，日水0.5-0.8m³，日气0.3-0.5m³）
// 能源排行 - 基于实际用量动态计算（与饼图数据联动）
const energyRank = computed(() => {
  const total = chartData.value.energyPie.reduce((a, b) => a + b.value, 0) || 1
  const items = [
    { name: '空调', color: '#4fc3f7', icon: '❄️', unit: 'kWh' },
    { name: '冰箱', color: '#81c784', icon: '🧊', unit: 'kWh' },
    { name: '照明', color: '#ffd54f', icon: '💡', unit: 'kWh' },
    { name: '其他', color: '#ce93d8', icon: '📺', unit: 'kWh' },
  ]
  const dailyTotal = chartData.value.energyLine.reduce((a, b) => a + b, 0)
  return items.map((item, i) => {
    const pieValue = chartData.value.energyPie[i]?.value || 0
    const ratio = pieValue / total
    const val = Math.round(dailyTotal * ratio * 100) / 100
    return { ...item, val, pct: Math.round(ratio * 100) }
  }).sort((a, b) => b.val - a.val)
})
const waterRank = computed(() => {
  const total = chartData.value.waterPie.reduce((a, b) => a + b.value, 0) || 1
  const items = [
    { name: '淋浴', color: '#4fc3f7', icon: '🚿', unit: 'm³' },
    { name: '洗衣', color: '#81c784', icon: '🧺', unit: 'm³' },
    { name: '厨房', color: '#ffd54f', icon: '🍳', unit: 'm³' },
    { name: '其他', color: '#ce93d8', icon: '🚰', unit: 'm³' },
  ]
  const dailyTotal = chartData.value.waterBar.reduce((a, b) => a + b, 0)
  return items.map((item, i) => {
    const pieValue = chartData.value.waterPie[i]?.value || 0
    const ratio = pieValue / total
    const val = Math.round(dailyTotal * ratio * 1000) / 1000
    return { ...item, val, pct: Math.round(ratio * 100) }
  }).sort((a, b) => b.val - a.val)
})
const gasRank = computed(() => {
  const total = chartData.value.gasPie.reduce((a, b) => a + b.value, 0) || 1
  const items = [
    { name: '热水器', color: '#ff7043', icon: '🚿', unit: 'm³' },
    { name: '燃气灶', color: '#ffa726', icon: '🔥', unit: 'm³' },
    { name: '壁挂炉', color: '#ffcc80', icon: '🏠', unit: 'm³' },
  ]
  const dailyTotal = chartData.value.gasLine.reduce((a, b) => a + b, 0)
  return items.map((item, i) => {
    const pieValue = chartData.value.gasPie[i]?.value || 0
    const ratio = pieValue / total
    const val = Math.round(dailyTotal * ratio * 1000) / 1000
    return { ...item, val, pct: Math.round(ratio * 100) }
  }).sort((a, b) => b.val - a.val)
})
const rankTab = ref('electric')
const currentRankList = computed(() => {
  if (rankTab.value === 'water') return waterRank.value
  if (rankTab.value === 'gas') return gasRank.value
  return energyRank.value
})

// 能源图表周期
const electricPeriod = ref('日')
const waterPeriod = ref('日')
const gasPeriod = ref('日')
const electricPiePeriod = ref('日')
const waterPiePeriod = ref('日')
const gasPiePeriod = ref('日')

// 能源图表周/月固定数据（按日常家用标准：日电5-6度，日水0.5-0.8m³，日气0.3-0.5m³）
const energyWeekData = {
  labels: ['周一','周二','周三','周四','周五','周六','周日'],
  values: [5.2, 5.8, 5.5, 6.2, 5.9, 6.5, 5.6]
}
const energyMonthData = {
  labels: Array.from({length:30}, (_,i) => `${i+1}日`),
  values: Array.from({length:30}, () => Math.round((4.5 + Math.random() * 2.5) * 10) / 10)
}
const waterWeekData = {
  labels: ['周一','周二','周三','周四','周五','周六','周日'],
  values: [0.55, 0.72, 0.58, 0.80, 0.65, 0.85, 0.62]
}
const waterMonthData = {
  labels: Array.from({length:30}, (_,i) => `${i+1}日`),
  values: Array.from({length:30}, () => Math.round((0.4 + Math.random() * 0.5) * 100) / 100)
}
const gasWeekData = {
  labels: ['周一','周二','周三','周四','周五','周六','周日'],
  values: [0.32, 0.45, 0.35, 0.48, 0.38, 0.50, 0.42]
}
const gasMonthData = {
  labels: Array.from({length:30}, (_,i) => `${i+1}日`),
  values: Array.from({length:30}, () => Math.round((0.25 + Math.random() * 0.3) * 100) / 100)
}

// 结构图周/月固定数据
const energyPieWeekData = [
  { value: 42, name: '空调', itemStyle: { color: '#4fc3f7' } },
  { value: 28, name: '冰箱', itemStyle: { color: '#81c784' } },
  { value: 18, name: '照明', itemStyle: { color: '#ffd54f' } },
  { value: 12, name: '其他', itemStyle: { color: '#ce93d8' } },
]
const energyPieMonthData = [
  { value: 40, name: '空调', itemStyle: { color: '#4fc3f7' } },
  { value: 30, name: '冰箱', itemStyle: { color: '#81c784' } },
  { value: 20, name: '照明', itemStyle: { color: '#ffd54f' } },
  { value: 10, name: '其他', itemStyle: { color: '#ce93d8' } },
]
const waterPieWeekData = [
  { value: 48, name: '淋浴', itemStyle: { color: '#4fc3f7', borderRadius: [0, 4, 4, 0] } },
  { value: 22, name: '洗衣', itemStyle: { color: '#81c784', borderRadius: [0, 4, 4, 0] } },
  { value: 18, name: '厨房', itemStyle: { color: '#ffd54f', borderRadius: [0, 4, 4, 0] } },
  { value: 12, name: '其他', itemStyle: { color: '#ce93d8', borderRadius: [0, 4, 4, 0] } },
]
const waterPieMonthData = [
  { value: 50, name: '淋浴', itemStyle: { color: '#4fc3f7', borderRadius: [0, 4, 4, 0] } },
  { value: 20, name: '洗衣', itemStyle: { color: '#81c784', borderRadius: [0, 4, 4, 0] } },
  { value: 18, name: '厨房', itemStyle: { color: '#ffd54f', borderRadius: [0, 4, 4, 0] } },
  { value: 12, name: '其他', itemStyle: { color: '#ce93d8', borderRadius: [0, 4, 4, 0] } },
]
const gasPieWeekData = [
  { value: 52, name: '热水器', itemStyle: { color: '#ff7043' } },
  { value: 38, name: '燃气灶', itemStyle: { color: '#ffa726' } },
  { value: 10, name: '壁挂炉', itemStyle: { color: '#ffcc80' } },
]
const gasPieMonthData = [
  { value: 50, name: '热水器', itemStyle: { color: '#ff7043' } },
  { value: 40, name: '燃气灶', itemStyle: { color: '#ffa726' } },
  { value: 10, name: '壁挂炉', itemStyle: { color: '#ffcc80' } },
]

const products = ref([
  // 环境控制
  { id: 1,  icon: '❄️', name: '变频空调 KFR-35',    sub: '环境控制', vendor: '美的',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.2.1', connectedAt: '2024-06-10', signal: '强 (-38dBm)' },
  { id: 2,  icon: '🌀', name: '新风系统 FX-200',     sub: '环境控制', vendor: '海尔',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.0.8', connectedAt: '2024-07-22', signal: '中 (-65dBm)' },
  { id: 3,  icon: '🌡', name: '温湿度传感器 TH-01', sub: '环境控制', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v1.4.2', connectedAt: '2024-08-05', signal: '强 (-44dBm)' },
  { id: 4,  icon: '🌡', name: '空气净化器 KJ-500',  sub: '环境控制', vendor: '飞利浦',   tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
  { id: 5,  icon: '💨', name: '除湿机 D1-10L',      sub: '环境控制', vendor: '德业',     tag: '未接入', protocol: 'Wi-Fi', power: '220V AC' },
  // 照明控制
  { id: 6,  icon: '💡', name: '智能照明套件',        sub: '照明控制', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.1.4', connectedAt: '2024-08-15', signal: '强 (-42dBm)' },
  { id: 7,  icon: '🌈', name: 'RGB 智能灯泡',        sub: '照明控制', vendor: 'Yeelight', tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v1.9.3', connectedAt: '2024-09-01', signal: '强 (-40dBm)' },
  { id: 8,  icon: '🔲', name: '智能开关面板',        sub: '照明控制', vendor: '公牛',     tag: '待接入', protocol: 'Zigbee 3.0', power: '220V AC' },
  // 安防系统
  { id: 9,  icon: '🔒', name: '智能门锁 S1',         sub: '安防系统', vendor: '德施曼',   tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v4.0.1', connectedAt: '2024-05-20', signal: '强 (-36dBm)' },
  { id: 10, icon: '📹', name: '智能摄像头 C3W',      sub: '安防系统', vendor: '萤石',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.1.0', connectedAt: '2024-06-30', signal: '强 (-41dBm)' },
  { id: 11, icon: '🔔', name: '智能门铃 D1',         sub: '安防系统', vendor: '叮零',     tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
  // 传感器
  { id: 12, icon: '🔥', name: '烟雾/燃气传感器',    sub: '传感器',   vendor: '海曼',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v2.3.0', connectedAt: '2024-07-10', signal: '中 (-58dBm)' },
  { id: 13, icon: '💧', name: '水浸传感器',          sub: '传感器',   vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v1.2.1', connectedAt: '2024-08-20', signal: '强 (-45dBm)' },
  { id: 14, icon: '📶', name: '空气质量传感器',      sub: '传感器',   vendor: '霍尼韦尔', tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v1.8.5', connectedAt: '2024-09-12', signal: '强 (-39dBm)' },
  { id: 15, icon: '🚪', name: '门磁感应器',          sub: '传感器',   vendor: '小米',     tag: '待接入', protocol: 'Zigbee 3.0', power: '电池' },
  { id: 16, icon: '👤', name: '人体存在传感器',      sub: '传感器',   vendor: '领普',     tag: '未接入', protocol: 'Zigbee 3.0', power: '电池' },
  // 家电控制
  { id: 17, icon: '📺', name: '智能电视 65Q7',       sub: '家电控制', vendor: '三星',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v5.0.2', connectedAt: '2024-07-05', signal: '强 (-37dBm)' },
  { id: 18, icon: '🔊', name: '智能音箱 Pro',        sub: '家电控制', vendor: '米歇尔',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.4.1', connectedAt: '2024-08-01', signal: '强 (-43dBm)' },
  { id: 19, icon: '🍽️', name: '智能洗碗机',          sub: '家电控制', vendor: '西门子',   tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
  { id: 20, icon: '🚿', name: '燃气热水器',          sub: '家电控制', vendor: '阿里斯顿',     tag: '待接入', protocol: 'Wi-Fi', power: '燃气' },
  { id: 21, icon: '🧹', name: '扫地机器人 S1',       sub: '家电控制', vendor: '石头',     tag: '未接入', protocol: 'Wi-Fi', power: '充电' },
  // 能源管理
  { id: 22, icon: '🔌', name: '智能插座',            sub: '能源管理', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.0.3', connectedAt: '2024-09-18', signal: '强 (-46dBm)' },
  { id: 23, icon: '⚡', name: '智能电表',             sub: '能源管理', vendor: '正泰',     tag: '待接入', protocol: 'RS-485', power: '220V AC' },
])

// 产品筛选 & 分页
const productSubFilter = ref('')
const productTagFilter = ref('')
const productPage = ref(1)
const PRODUCT_PAGE_SIZE = 12

const filteredProducts = computed(() => {
  let list = products.value.filter(p => {
    const matchSub = !productSubFilter.value || p.sub === productSubFilter.value
    const matchTag = !productTagFilter.value || p.tag === productTagFilter.value
    return matchSub && matchTag
  })
  // 按接入状态排序：已接入 > 待接入 > 未接入
  const statusOrder = { '已接入': 1, '待接入': 2, '未接入': 3 }
  list.sort((a, b) => (statusOrder[a.tag] || 4) - (statusOrder[b.tag] || 4))
  return list
})

const productTotalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / PRODUCT_PAGE_SIZE)))

const pagedProducts = computed(() => {
  if (productPage.value > productTotalPages.value) productPage.value = 1
  const start = (productPage.value - 1) * PRODUCT_PAGE_SIZE
  return filteredProducts.value.slice(start, start + PRODUCT_PAGE_SIZE)
})

// Chart refs are now accessed via energyPageRef
let lineChart = null, pieChart = null, waterChart = null, gasChart = null, waterPieChart = null, gasPieChart = null

  // 能源图表数据源（ref，便于实时更新）
  // 日视图：24小时数据，每小时一个点
  // ============================================================
  // 家用24小时用电趋势 —— 完整公式实现（来自Excel建模）
  // ============================================================
  // 公式体系：
  // 1. 日总量: W_day = W̄ × (1 + 0.2×R₁)    W̄=7.0度, R₁∈[-1,1]
  // 2. 小时基准: W_h0 = W_day × K_h          K_h = 24h占比系数(和=1)
  // 3. 小时实际: W_h = W_h0 × (1 + 0.2×R₂)   R₂∈[-1,1],每小时独立
  // 4. 分钟瞬时: W_t = W_h × (t/60)          t=0~60分钟,线性增长
  // ============================================================
  
  // 基准日用量——按照图片公式设定
  const DAILY_BASE_ELECTRIC = 7.0   // 度/天，家用平均7度
  const DAILY_BASE_WATER = 0.65     // m³/天，均值0.65吨
  const DAILY_BASE_GAS = 0.30       // m³/天，均值0.30立方
  
  // 24小时用电占比系数 K_h（添加午高峰，和=1）
  // 早高峰: 0.08, 午高峰: 0.06, 晚高峰: 0.12-0.15
  const ENERGY_KH = [
    0.02, 0.02, 0.02, 0.02, 0.02, 0.02,  // 00-06 夜间低功耗
    0.03, 0.08, 0.06, 0.04, 0.03, 0.03,  // 06-12 早高峰(0.08) + 午高峰开始
    0.06, 0.05, 0.04, 0.03, 0.03, 0.03,  // 12-18 午高峰(0.06)延续 + 下午
    0.12, 0.15, 0.14, 0.11, 0.08, 0.03   // 18-24 晚间高峰
  ]
  
  // 用水占比系数 K_h（添加午高峰）
  // 早高峰: 0.12, 午高峰: 0.08, 晚高峰: 0.18-0.22
  const WATER_KH = [
    0.02, 0.02, 0.02, 0.02, 0.02, 0.02,  // 00-06
    0.08, 0.12, 0.08, 0.05, 0.03, 0.03,  // 06-12 早高峰(0.12)
    0.08, 0.06, 0.04, 0.03, 0.03, 0.03,  // 12-18 午高峰(0.08)
    0.18, 0.22, 0.15, 0.10, 0.08, 0.04   // 18-24 晚高峰
  ]
  
  // 燃气占比系数 K_h（添加午高峰-午餐）
  // 早餐: 0.08, 午餐: 0.10, 晚餐: 0.25-0.28
  const GAS_KH = [
    0.01, 0.01, 0.01, 0.01, 0.01, 0.01,  // 00-06
    0.05, 0.08, 0.05, 0.02, 0.02, 0.10,  // 06-12 早餐(0.08) + 午餐准备
    0.10, 0.05, 0.02, 0.02, 0.05, 0.12,  // 12-18 午餐(0.10) + 晚餐准备
    0.25, 0.28, 0.18, 0.10, 0.04, 0.005  // 18-24 晚餐高峰
  ]
  
  // 每日全局随机因子 R₁（[-1,1]），每天变化一次
  let dailyR1_Electric = (Math.random() * 2 - 1)
  let dailyR1_Water = (Math.random() * 2 - 1)
  let dailyR1_Gas = (Math.random() * 2 - 1)
  
  // 每小时独立随机因子 R₂（[-1,1]），24小时预生成
  function generateHourlyR2() {
    return Array.from({length: 24}, () => Math.random() * 2 - 1)
  }
  let hourlyR2_Electric = generateHourlyR2()
  let hourlyR2_Water = generateHourlyR2()
  let hourlyR2_Gas = generateHourlyR2()
  
  // 根据完整公式计算某小时某分钟的用电量
  // W(h,t) = W̄ × (1 + 0.2×R₁) × Kₕ × (1 + 0.2×R₂) × (t/60)
  function calcEnergyAt(base, r1, kh, r2, minute) {
    const W_day = base * (1 + 0.2 * r1)           // 当日实际总用量
    const Wh0 = W_day * kh                         // 该小时基准用量
    const Wh = Wh0 * (1 + 0.2 * r2)               // 该小时实际用量（含小时浮动）
    const Wt = Wh * (minute / 60)                  // 第t分钟瞬时用量（0→满负荷）
    return Wt
  }
  
  // 生成初始数据：根据当前时间，生成从0点到当前小时的累计数据
  function generateInitialData() {
    const hour = getCurrentHour()
    const now = new Date()
    const minute = now.getMinutes() + now.getSeconds() / 60 // 0~60，含秒的小数
    
    // 用电 - 保留4位小数
    const energyLine = Array.from({length: 24}, (_, i) => {
      if (i > hour) return 0
      if (i < hour) {
        // 已完成小时：显示满负荷值（minute=60）
        return Math.round(calcEnergyAt(DAILY_BASE_ELECTRIC, dailyR1_Electric, ENERGY_KH[i], hourlyR2_Electric[i], 60) * 10000) / 10000
      }
      // 当前小时：线性增长到当前分钟
      return Math.round(calcEnergyAt(DAILY_BASE_ELECTRIC, dailyR1_Electric, ENERGY_KH[i], hourlyR2_Electric[i], minute) * 10000) / 10000
    })
    
    // 用水 - 保留4位小数
    const waterBar = Array.from({length: 24}, (_, i) => {
      if (i > hour) return 0
      if (i < hour) {
        return Math.round(calcEnergyAt(DAILY_BASE_WATER, dailyR1_Water, WATER_KH[i], hourlyR2_Water[i], 60) * 10000) / 10000
      }
      return Math.round(calcEnergyAt(DAILY_BASE_WATER, dailyR1_Water, WATER_KH[i], hourlyR2_Water[i], minute) * 10000) / 10000
    })
    
    // 燃气 - 保留4位小数
    const gasLine = Array.from({length: 24}, (_, i) => {
      if (i > hour) return 0
      if (i < hour) {
        return Math.round(calcEnergyAt(DAILY_BASE_GAS, dailyR1_Gas, GAS_KH[i], hourlyR2_Gas[i], 60) * 10000) / 10000
      }
      return Math.round(calcEnergyAt(DAILY_BASE_GAS, dailyR1_Gas, GAS_KH[i], hourlyR2_Gas[i], minute) * 10000) / 10000
    })
    
    return { energyLine, waterBar, gasLine }
  }
  
  const initialData = generateInitialData()
  
  const chartData = ref({
    energyLine: initialData.energyLine,
    energyPie: [
      { value: 40, name: '空调', itemStyle: { color: '#4fc3f7' } },
      { value: 30, name: '冰箱', itemStyle: { color: '#81c784' } },
      { value: 18, name: '照明', itemStyle: { color: '#ffd54f' } },
      { value: 12, name: '其他', itemStyle: { color: '#ce93d8' } },
    ],
    waterBar: initialData.waterBar,
    waterPie: [
      { value: 48, name: '淋浴', itemStyle: { color: '#4fc3f7', borderRadius: [0, 4, 4, 0] } },
      { value: 22, name: '洗衣', itemStyle: { color: '#81c784', borderRadius: [0, 4, 4, 0] } },
      { value: 20, name: '厨房', itemStyle: { color: '#ffd54f', borderRadius: [0, 4, 4, 0] } },
      { value: 10, name: '其他', itemStyle: { color: '#ce93d8', borderRadius: [0, 4, 4, 0] } },
    ],
    gasLine: initialData.gasLine,
    gasPie: [
      { value: 55, name: '热水器', itemStyle: { color: '#ff7043' } },
      { value: 35, name: '燃气灶', itemStyle: { color: '#ffa726' } },
      { value: 10, name: '壁挂炉', itemStyle: { color: '#ffcc80' } },
    ],
  })

  // 能源弹窗实时数据源（今日用量从小时数据累加）
  const energyLiveData = ref({
    get waterToday() { return chartData.value.waterBar.reduce((a, b) => a + b, 0) },
    get gasToday() { return chartData.value.gasLine.reduce((a, b) => a + b, 0) },
    savingRate: 18,
    totalEnergy: 235,
    carbonReduction: 12.5,
  })

  // 昨日同时段数据（用于趋势计算）
  const yesterdayEnergy = [0.15,0.12,0.10,0.08,0.12,0.25,0.35,0.42,0.38,0.32,0.28,0.28,0.28,0.28,0.28,0.32,0.38,0.48,0.55,0.52,0.45,0.35,0.25,0.18]
  const yesterdayWater = [0.02,0.01,0.01,0.01,0.02,0.04,0.08,0.10,0.06,0.04,0.03,0.03,0.03,0.03,0.03,0.04,0.06,0.09,0.12,0.10,0.07,0.04,0.02,0.01]
  const yesterdayGas = [0.01,0.01,0.01,0.01,0.01,0.03,0.04,0.05,0.04,0.03,0.02,0.02,0.02,0.02,0.02,0.03,0.04,0.05,0.06,0.06,0.05,0.03,0.02,0.01]
  
  // 计算趋势值的辅助函数
  function calculateTrends(currentHour) {
    const cd = chartData.value
    
    // 计算当前累计到当前小时
    const currentEnergyTotal = cd.energyLine.slice(0, currentHour + 1).reduce((a, b) => a + b, 0)
    const currentWaterTotal = cd.waterBar.slice(0, currentHour + 1).reduce((a, b) => a + b, 0)
    const currentGasTotal = cd.gasLine.slice(0, currentHour + 1).reduce((a, b) => a + b, 0)
    
    // 昨日同时段累计
    const yesterdayEnergyTotal = yesterdayEnergy.slice(0, currentHour + 1).reduce((a, b) => a + b, 0)
    const yesterdayWaterTotal = yesterdayWater.slice(0, currentHour + 1).reduce((a, b) => a + b, 0)
    const yesterdayGasTotal = yesterdayGas.slice(0, currentHour + 1).reduce((a, b) => a + b, 0)
    
    // 计算趋势（保留1位小数）
    const eTrend = yesterdayEnergyTotal > 0 ? Math.round((currentEnergyTotal - yesterdayEnergyTotal) / yesterdayEnergyTotal * 1000) / 10 : 0
    const wTrend = yesterdayWaterTotal > 0 ? Math.round((currentWaterTotal - yesterdayWaterTotal) / yesterdayWaterTotal * 1000) / 10 : 0
    const gTrend = yesterdayGasTotal > 0 ? Math.round((currentGasTotal - yesterdayGasTotal) / yesterdayGasTotal * 1000) / 10 : 0
    
    // 费用趋势
    const currentCost = currentEnergyTotal * 0.558 + currentWaterTotal * 2.47 + currentGasTotal * 2.53
    const yesterdayCost = yesterdayEnergyTotal * 0.558 + yesterdayWaterTotal * 2.47 + yesterdayGasTotal * 2.53
    const cTrend = yesterdayCost > 0 ? Math.round((currentCost - yesterdayCost) / yesterdayCost * 1000) / 10 : 0
    
    return {
      electric: makeTrend(eTrend),
      water: makeTrend(wTrend),
      gas: makeTrend(gTrend),
      cost: makeTrend(cTrend)
    }
  }
  
  // 初始化趋势值（基于当前实际数据计算）
  const initialTrends = calculateTrends(getCurrentHour())
  const electricTrend = ref(initialTrends.electric)
  const waterTrend = ref(initialTrends.water)
  const gasTrend = ref(initialTrends.gas)
  const costTrend = ref(initialTrends.cost)




  // 辅助：根据趋势值生成新的 trend 对象（不可变，保证 Vue 响应式）
  function makeTrend(newVal) {
    return { dir: newVal >= 0 ? 'up' : 'down', label: (newVal >= 0 ? '↑ ' : '↓ ') + Math.abs(newVal).toFixed(1) + '%', raw: newVal }
  }


// 获取当前小时（0-23）
function getCurrentHour() {
  return new Date().getHours()
}

// 生成24小时标签
const hourLabels = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`)

// 更新结构图（饼图/玫瑰图）
function updatePieChart(type) {
  if (type === 'electric' || type === 'all') {
    const period = electricPiePeriod.value
    let data
    if (period === '日') data = chartData.value.energyPie
    else if (period === '周') data = energyPieWeekData
    else data = energyPieMonthData
    pieChart?.setOption({ series: [{ data }] })
  }
  if (type === 'water' || type === 'all') {
    const period = waterPiePeriod.value
    let data
    if (period === '日') data = chartData.value.waterPie
    else if (period === '周') data = waterPieWeekData
    else data = waterPieMonthData
    waterPieChart?.setOption({ series: [{ data }] })
  }
  if (type === 'gas' || type === 'all') {
    const period = gasPiePeriod.value
    let data
    if (period === '日') data = chartData.value.gasPie
    else if (period === '周') data = gasPieWeekData
    else data = gasPieMonthData
    gasPieChart?.setOption({ series: [{ data }] })
  }
}

// 更新能源图表（周期切换时调用）
function updateEnergyChart(type) {
  if (!lineChart && !waterChart && !gasChart && !pieChart && !waterPieChart && !gasPieChart) return
  const hour = getCurrentHour()
  if (type === 'electric' || type === 'all') {
    const period = electricPeriod.value
    let labels, values
    if (period === '日') {
      labels = hourLabels.slice(0, hour + 1)
      values = chartData.value.energyLine.slice(0, hour + 1)
    } else if (period === '周') {
      labels = energyWeekData.labels
      values = energyWeekData.values
    } else {
      labels = energyMonthData.labels
      values = energyMonthData.values
    }
    lineChart?.setOption({ xAxis: { data: labels }, series: [{ data: values }] })
  }
  if (type === 'water' || type === 'all') {
    const period = waterPeriod.value
    let labels, values
    if (period === '日') {
      labels = hourLabels.slice(0, hour + 1)
      values = chartData.value.waterBar.slice(0, hour + 1)
    } else if (period === '周') {
      labels = waterWeekData.labels
      values = waterWeekData.values
    } else {
      labels = waterMonthData.labels
      values = waterMonthData.values
    }
    waterChart?.setOption({ xAxis: { data: labels }, series: [{ data: values }] })
  }
  if (type === 'gas' || type === 'all') {
    const period = gasPeriod.value
    let labels, values
    if (period === '日') {
      labels = hourLabels.slice(0, hour + 1)
      values = chartData.value.gasLine.slice(0, hour + 1)
    } else if (period === '周') {
      labels = gasWeekData.labels
      values = gasWeekData.values
    } else {
      labels = gasMonthData.labels
      values = gasMonthData.values
    }
    gasChart?.setOption({ xAxis: { data: labels }, series: [{ data: values }] })
  }
}

async function initCharts() {
  const ec = await import('echarts')
  // Get DOM refs from energyPageRef
  const refs = energyPageRef.value || {}
  const { lineChartRef, pieChartRef, waterChartRef, gasChartRef, waterPieChartRef, gasPieChartRef } = refs
  const hour = getCurrentHour()
  if (lineChartRef && !lineChart) {
    lineChart = ec.init(lineChartRef)
    lineChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 }, formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>${p.marker} 用电: ${Number(p.value).toFixed(4)} kWh`
      }},
      grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: hourLabels.slice(0, hour + 1), axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ data: chartData.value.energyLine.slice(0, hour + 1), type: 'line', smooth: true, lineStyle: { color: '#00d4aa', width: 3 }, areaStyle: { color: new ec.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,212,170,0.25)'},{offset:1,color:'rgba(0,212,170,0)'}]) }, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#00d4aa' } }]
    })
  }
  if (pieChartRef && !pieChart) {
    pieChart = ec.init(pieChartRef)
    pieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      series: [{ type: 'pie', radius: ['50%','75%'], center: ['50%','50%'], data: chartData.value.energyPie, label: { color: '#94a3b8', fontSize: 12 }, labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } }]
    })
  }
  // 用水趋势图（柱状图）
  if (waterChartRef && !waterChart) {
    waterChart = ec.init(waterChartRef)
    waterChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 }, formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>${p.marker} 用水: ${Number(p.value).toFixed(4)} m³`
      }},
      grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true },
      xAxis: { type: 'category', data: hourLabels.slice(0, hour + 1), axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ 
        data: chartData.value.waterBar.slice(0, hour + 1), 
        type: 'bar', 
        barWidth: '50%',
        itemStyle: { 
          color: new ec.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#4fc3f7'},{offset:1,color:'rgba(79,195,247,0.3)'}]),
          borderRadius: [4, 4, 0, 0]
        }
      }]
    })
  }
  // 燃气使用图（虚线折线图）
  if (gasChartRef && !gasChart) {
    gasChart = ec.init(gasChartRef)
    gasChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 }, formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>${p.marker} 燃气: ${Number(p.value).toFixed(4)} m³`
      }},
      grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: hourLabels.slice(0, hour + 1), axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ 
        data: chartData.value.gasLine.slice(0, hour + 1), 
        type: 'line', 
        smooth: true, 
        lineStyle: { color: '#ff7043', width: 3, type: 'dashed' }, 
        symbol: 'triangle', 
        symbolSize: 8, 
        itemStyle: { color: '#ff7043' }
      }]
    })
  }
  // 用水结构图（横向条形图）
  if (waterPieChartRef && !waterPieChart) {
    waterPieChart = ec.init(waterPieChartRef)
    waterPieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      grid: { left: '3%', right: '15%', top: '5%', bottom: '5%', containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: ['其他', '厨房', '洗衣', '淋浴'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ 
        type: 'bar', 
        barWidth: '50%',
        data: chartData.value.waterPie,
        label: { show: true, position: 'right', color: '#94a3b8', fontSize: 11, formatter: '{c}%' }
      }]
    })
  }
  // 燃气结构图（玫瑰图/南丁格尔图）
  if (gasPieChartRef && !gasPieChart) {
    gasPieChart = ec.init(gasPieChartRef)
    gasPieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      series: [{ 
        type: 'pie', 
        radius: [20, 70],
        center: ['50%','50%'],
        roseType: 'radius',
        itemStyle: { borderRadius: 5 },
        data: chartData.value.gasPie,
        label: { color: '#94a3b8', fontSize: 12 }, 
        labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } 
      }]
    })
  }
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  nextTick(() => mountCanvas('env'))
  window.addEventListener('resize', () => { lineChart?.resize(); pieChart?.resize(); waterChart?.resize(); gasChart?.resize(); waterPieChart?.resize(); gasPieChart?.resize() })

  // 初始化步数模拟系统（每日目标90%-110%，追赶机制，合理小时分布）
  initStepsSimulation()
  stepsTimer = setInterval(() => simulateStepsPerTick(), 4000) // 每4秒更新一次步数

  // 环境数据实时模拟：每 3 秒波动一次
  envTimer = setInterval(() => {
    const { alerts } = homeStore.simulateEnvData(1)
    // 只弹出 danger 级别告警（避免 warning 过于频繁打扰）
    alerts.forEach(a => {
      if (a.type === 'danger') {
        homeStore.addToast({ message: a.msg, type: a.type, duration: 5000 })
      }
    })
  }, 3000)

  // 健康数据实时模拟：每 4 秒波动一次
  let _prevHeart = 72, _prevSpo2 = 98, _prevTemp = 36.5
  healthTimer = setInterval(() => {
    const items = healthItems.value
    const hour = new Date().getHours()

    // 心率：68-82 波动
    const hr = Math.round(items[0].raw + (Math.random() - 0.5) * 6)
    items[0].raw = Math.max(55, Math.min(110, hr))
    items[0].value = items[0].raw + '次/分'
    items[0].pct = Math.min(100, Math.max(0, ((items[0].raw - 40) / 80) * 100))
    items[0].trend = items[0].raw - _prevHeart
    _prevHeart = items[0].raw

    // 血压：收缩压 110-130，舒张压 68-85
    const sys = Math.round(items[1].raw + (Math.random() - 0.5) * 6)
    const dia = Math.round(sys * 0.64 + (Math.random() - 0.5) * 4)
    items[1].raw = Math.max(90, Math.min(145, sys))
    const diaVal = Math.max(55, Math.min(95, dia))
    items[1].value = items[1].raw + '/' + diaVal + 'mmHg'
    items[1].pct = Math.min(100, Math.max(0, ((items[1].raw - 80) / 80) * 100))
    items[1].trend = 0

    // 体温：36.0-37.2 微小波动
    const temp = Math.round((items[2].raw + (Math.random() - 0.5) * 0.2) * 10) / 10
    items[2].raw = Math.max(35.5, Math.min(38.0, temp))
    items[2].value = items[2].raw + '°C'
    items[2].pct = Math.min(100, Math.max(0, ((items[2].raw - 35) / 4) * 100))
    items[2].trend = Math.round((items[2].raw - _prevTemp) * 10) / 10
    _prevTemp = items[2].raw

    // 血氧：96-100
    const spo2 = Math.round(items[3].raw + (Math.random() - 0.5) * 2)
    items[3].raw = Math.max(92, Math.min(100, spo2))
    items[3].value = items[3].raw + '%'
    items[3].pct = items[3].raw
    items[3].trend = items[3].raw - _prevSpo2
    _prevSpo2 = items[3].raw

    // 步数趋势：整体替换数组触发响应式更新（步数由 stepsTimer 统一管理）
    const stepsIdx = stepsTrendData.value.length - 1
    stepsTrendData.value = stepsTrendData.value.map((item, i) =>
      i === stepsIdx ? { ...item, value: stepsSim.accumulated } : item
    )
  }, 4000)

  // 能源排行实时模拟：每 8 秒微调一次（排行现在是computed，基于chartData自动计算，这里只需更新饼图数据）
  energyTimer = setInterval(() => {
    // 排行数据现在通过computed自动从chartData计算，无需手动更新
    // 只需微调饼图数据让排行有动态变化效果

    // 能源图表实时更新（仅日视图，且只有当前小时增加）
    const cd = chartData.value
    const hour = getCurrentHour()
    const now = new Date()
    
    // 检查是否跨天（00:00 重置为0，重新生成每日随机因子）
    if (hour === 0 && cd.energyLine[23] > 0) {
      // 重置所有小时数据为0
      cd.energyLine = Array.from({length: 24}, () => 0)
      cd.waterBar = Array.from({length: 24}, () => 0)
      cd.gasLine = Array.from({length: 24}, () => 0)
      // 重新生成每日随机因子 R₁
      dailyR1_Electric = (Math.random() * 2 - 1)
      dailyR1_Water = (Math.random() * 2 - 1)
      dailyR1_Gas = (Math.random() * 2 - 1)
      // 重新生成每小时随机因子 R₂
      hourlyR2_Electric = generateHourlyR2()
      hourlyR2_Water = generateHourlyR2()
      hourlyR2_Gas = generateHourlyR2()
      // 重新初始化图表
      initCharts()
    }
    
    // 电能趋势：严格按照公式 W(h,t) = W̄ × (1+0.2R₁) × Kₕ × (1+0.2R₂) × (t/60)
    if (electricPeriod.value === '日') {
      const minute = now.getMinutes() + now.getSeconds() / 60 // 0~60
      cd.energyLine[hour] = Math.round(calcEnergyAt(DAILY_BASE_ELECTRIC, dailyR1_Electric, ENERGY_KH[hour], hourlyR2_Electric[hour], minute) * 10000) / 10000
      lineChart?.setOption({ xAxis: { data: hourLabels.slice(0, hour + 1) }, series: [{ data: cd.energyLine.slice(0, hour + 1) }] })
    }

    // 电能占比饼图：每5秒变动一次，让页面富有变化
    if (electricPeriod.value === '日' && now.getSeconds() % 5 === 0) {
      const acOn = deviceList.value.filter(d => (d.type === 'ac') && d.status).length
      const lightOn = deviceList.value.filter(d => d.type === 'light' && d.status).length
      const totalOn = acOn + lightOn + deviceList.value.filter(d => d.type === 'socket' && d.status).length
      // 基础比例 + 随机波动（±2%）+ 设备影响
      const baseAC = 35, baseLight = 25, baseAppliance = 20, baseOther = 10
      const randomShift = () => (Math.random() - 0.5) * 4 // ±2%随机波动
      cd.energyPie[0].value = Math.max(20, Math.min(50, baseAC + acOn * 6 + randomShift()))
      cd.energyPie[1].value = Math.max(15, Math.min(40, baseLight + lightOn * 4 + randomShift()))
      cd.energyPie[2].value = Math.max(10, Math.min(35, baseAppliance + Math.min(8, totalOn) * 2 + randomShift()))
      cd.energyPie[3].value = Math.max(5, Math.min(20, baseOther + randomShift()))
      // 归一化到100%
      const sum = cd.energyPie.reduce((a, b) => a + b.value, 0)
      cd.energyPie.forEach(item => item.value = Math.round(item.value / sum * 100))
      pieChart?.setOption({ series: [{ data: cd.energyPie }] })
    }

    // 用水柱状图：严格按照公式 W(h,t) = W̄ × (1+0.2R₁) × Kₕ × (1+0.2R₂) × (t/60)
    if (waterPeriod.value === '日') {
      const minute = now.getMinutes() + now.getSeconds() / 60
      cd.waterBar[hour] = Math.round(calcEnergyAt(DAILY_BASE_WATER, dailyR1_Water, WATER_KH[hour], hourlyR2_Water[hour], minute) * 10000) / 10000
      waterChart?.setOption({ xAxis: { data: hourLabels.slice(0, hour + 1) }, series: [{ data: cd.waterBar.slice(0, hour + 1) }] })
    }

    // 用水结构：每5秒变动一次
    if (waterPeriod.value === '日' && now.getSeconds() % 5 === 0) {
      const baseShower = 40, baseLaundry = 25, baseKitchen = 20, baseOther = 10
      const randomShift = () => (Math.random() - 0.5) * 4 // ±2%随机波动
      cd.waterPie[0].value = Math.max(25, Math.min(55, baseShower + randomShift())) // 淋浴
      cd.waterPie[1].value = Math.max(15, Math.min(35, baseLaundry + randomShift())) // 洗衣
      cd.waterPie[2].value = Math.max(10, Math.min(30, baseKitchen + randomShift())) // 厨房
      cd.waterPie[3].value = Math.max(5, Math.min(20, baseOther + randomShift())) // 其他
      // 归一化
      const sum = cd.waterPie.reduce((a, b) => a + b.value, 0)
      cd.waterPie.forEach(item => item.value = Math.round(item.value / sum * 100))
      waterPieChart?.setOption({ series: [{ data: cd.waterPie }] })
    }

    // 燃气虚线折线图：严格按照公式 W(h,t) = W̄ × (1+0.2R₁) × Kₕ × (1+0.2R₂) × (t/60)
    if (gasPeriod.value === '日') {
      const minute = now.getMinutes() + now.getSeconds() / 60
      cd.gasLine[hour] = Math.round(calcEnergyAt(DAILY_BASE_GAS, dailyR1_Gas, GAS_KH[hour], hourlyR2_Gas[hour], minute) * 10000) / 10000
      gasChart?.setOption({ xAxis: { data: hourLabels.slice(0, hour + 1) }, series: [{ data: cd.gasLine.slice(0, hour + 1) }] })
    }

    // 燃气结构：每5秒变动一次
    if (gasPeriod.value === '日' && now.getSeconds() % 5 === 0) {
      const baseHeater = 50, baseStove = 35, baseWall = 10, baseOther = 5
      const randomShift = () => (Math.random() - 0.5) * 4 // ±2%随机波动
      cd.gasPie[0].value = Math.max(35, Math.min(65, baseHeater + randomShift())) // 热水器
      cd.gasPie[1].value = Math.max(20, Math.min(45, baseStove + randomShift())) // 燃气灶
      cd.gasPie[2].value = Math.max(5, Math.min(20, baseWall + randomShift())) // 壁挂炉
      // 归一化
      const sum = cd.gasPie.reduce((a, b) => a + b.value, 0)
      cd.gasPie.forEach(item => item.value = Math.round(item.value / sum * 100))
      gasPieChart?.setOption({ series: [{ data: cd.gasPie }] })
    }

    // 能源弹窗数据实时更新（从小时数据累加）
    const eld = energyLiveData.value
    // waterToday 和 gasToday 通过 getter 自动从 chartData 计算
    // 只需要更新其他字段
    eld.savingRate = Math.max(10, Math.min(28, eld.savingRate + Math.round((Math.random() - 0.45) * 3)))
    eld.totalEnergy = Math.round(eld.totalEnergy + (Math.random() - 0.3) * 0.5)
    eld.totalEnergy = Math.max(100, eld.totalEnergy)
    eld.carbonReduction = Math.round((eld.carbonReduction + (Math.random() - 0.4) * 0.3) * 10) / 10
    eld.carbonReduction = Math.max(5, eld.carbonReduction)

    // 实时更新趋势指标（基于实际数据计算，每小时更新一次）
    // 趋势 = (当前累计 - 昨日同时段累计) / 昨日同时段累计 * 100%
    if (now.getSeconds() === 0) {
      const trends = calculateTrends(hour)
      electricTrend.value = trends.electric
      waterTrend.value = trends.water
      gasTrend.value = trends.gas
      costTrend.value = trends.cost
    }

    // 排行弹窗打开中：用最新 item.val 重新计算分时段数据
    if (showControlPanel.value && selectedDevice.value?._rankType) {
      const rt = selectedDevice.value._rankType
      const rn = selectedDevice.value._rankItemName
      const src = rt === 'water' ? waterRank.value : rt === 'gas' ? gasRank.value : energyRank.value
      const ri = src.find(r => r.name === rn)
      if (ri) {
        selectedDevice.value = { ...selectedDevice.value, value: ri.val, periods: computeRankPeriods(rt, ri.val) }
      }
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timeTimer)
  clearInterval(envTimer)
  clearInterval(healthTimer)
  clearInterval(energyTimer)
  clearInterval(stepsTimer)
  lineChart?.dispose()
  pieChart?.dispose()
  waterChart?.dispose()
  gasChart?.dispose()
  waterPieChart?.dispose()
  gasPieChart?.dispose()
})
</script>

<style>
.app {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.scene-card.fullscreen {
  position: fixed !important;
  top: 56px !important;
  left: 260px !important;
  width: calc(100vw - 260px) !important;
  height: calc(100vh - 56px) !important;
  z-index: 40 !important;
  border-radius: 0 !important;
  margin: 0 !important;
  border: none !important;
}

.scene-card.fullscreen .three-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}

.scene-card.fullscreen .scene-overlay {
  z-index: 41;
  background: linear-gradient(180deg, rgba(5,13,24,0.85) 0%, transparent 50%);
}

.scene-card:not(.fullscreen) {
  height: 380px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

/* 图表标题图标 */
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-icon {
  flex-shrink: 0;
}
.panel-icon.electric { color: #00d4aa; }
.panel-icon.water { color: #4fc3f7; }
.panel-icon.gas { color: #ff7043; }

/* 能源费用卡片 */
.energy-cost-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.cost-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cost-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.cost-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0,212,170,0.15);
  color: #00d4aa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.cost-info {
  flex: 1;
}
.cost-label {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 4px;
}
.cost-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 4px;
}
.cost-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}
.cost-trend.up {
  background: rgba(239,68,68,0.15);
  color: #ef4444;
}
.cost-trend.down {
  background: rgba(34,197,94,0.15);
  color: #22c55e;
}

/* 节能建议 */
.energy-tips-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.tips-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}
.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.tips-icon {
  font-size: 18px;
}
.tips-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
}
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.tip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.tip-text {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.5;
}

/* 环保卡片 */
.eco-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.eco-icon {
  font-size: 40px;
  margin-bottom: 8px;
}
.eco-title {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 8px;
}
.eco-value {
  font-size: 28px;
  font-weight: 700;
  color: #22c55e;
  margin-bottom: 4px;
}
.eco-desc {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 12px;
}
.eco-badge {
  font-size: 11px;
  color: #22c55e;
  background: rgba(34,197,94,0.15);
  padding: 4px 12px;
  border-radius: 12px;
}

/* 能源管理新样式 */
.energy-overview-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.energy-metric-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.energy-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.energy-metric-card.electric { border-left: 4px solid #00d4aa; }
.energy-metric-card.electric:hover { border-color: #00d4aa; }
.energy-metric-card.water { border-left: 4px solid #4fc3f7; }
.energy-metric-card.water:hover { border-color: #4fc3f7; }
.energy-metric-card.gas { border-left: 4px solid #ff7043; }
.energy-metric-card.gas:hover { border-color: #ff7043; }
.energy-metric-card.cost { border-left: 4px solid #ffd54f; }
.energy-metric-card.cost:hover { border-color: #ffd54f; }
.em-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.energy-metric-card.electric .em-icon { background: rgba(0,212,170,0.15); color: #00d4aa; }
.energy-metric-card.water .em-icon { background: rgba(79,195,247,0.15); color: #4fc3f7; }
.energy-metric-card.gas .em-icon { background: rgba(255,112,67,0.15); color: #ff7043; }
.energy-metric-card.cost .em-icon { background: rgba(255,213,79,0.15); color: #ffd54f; }
.em-info { flex: 1; }
.em-label { font-size: 12px; color: var(--text-3); margin-bottom: 4px; }
.em-value { font-size: 24px; font-weight: 700; color: var(--text-1); }
.em-unit { font-size: 13px; color: var(--text-3); font-weight: 400; }
.em-trend { font-size: 11px; font-weight: 600; margin-top: 4px; }
.em-trend.up { color: #ef4444; }
.em-trend.down { color: #22c55e; }

/* 图表布局 */
.chart-lg { flex: 1.5; }
.chart-sm { flex: 1; }

/* 费用明细卡片 - 四个一排 */
.energy-cost-detail-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.cost-detail-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cost-detail-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.cdc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.cdc-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cdc-icon.electric { background: rgba(0,212,170,0.15); color: #00d4aa; }
.cdc-icon.water { background: rgba(79,195,247,0.15); color: #4fc3f7; }
.cdc-icon.gas { background: rgba(255,112,67,0.15); color: #ff7043; }
.cdc-icon.total { background: linear-gradient(135deg, rgba(0,212,170,0.25) 0%, rgba(99,102,241,0.25) 100%); color: #00d4aa; }
.cost-detail-card.total { border-color: rgba(0,212,170,0.3); }
.cost-detail-card.total:hover { border-color: #00d4aa; }
.cdc-title { font-size: 15px; font-weight: 600; color: var(--text-1); }
.cdc-body { display: flex; flex-direction: column; gap: 12px; }
.cdc-main { display: flex; align-items: baseline; gap: 8px; }
.cdc-value { font-size: 28px; font-weight: 700; color: var(--text-1); }
.cdc-label { font-size: 12px; color: var(--text-3); }
.cdc-items { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid var(--border); }
.cdc-item { display: flex; justify-content: space-between; font-size: 12px; }
.cdc-item span:first-child { color: var(--text-3); }
.cdc-item span:last-child { color: var(--text-1); font-weight: 500; }

/* 底部排行和环保 */
.energy-bottom-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
}
.rank-card { flex: 1; }
.rank-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  border-bottom: 1px solid var(--border);
}
.rank-tab {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s;
}
.rank-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.rank-icon { font-size: 16px; margin-right: 8px; }
.eco-contribute-card {
  background: linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(16,185,129,0.06) 50%, rgba(34,197,94,0.03) 100%);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s ease;
}
.eco-contribute-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(34,197,94,0.12);
  border-color: rgba(34,197,94,0.35);
}
.eco-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.eco-header .eco-icon { font-size: 20px; }
.eco-header .eco-title { font-size: 15px; font-weight: 600; color: var(--text-1); flex: 1; }
.eco-badge-tag {
  font-size: 10px;
  color: #22c55e;
  background: rgba(34,197,94,0.15);
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}
.eco-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}
.eco-stat { text-align: center; }
.eco-stat.primary .eco-value { color: #22c55e; text-shadow: 0 0 20px rgba(34,197,94,0.3); }
.eco-stat .eco-value { font-size: 28px; font-weight: 700; color: #22c55e; margin-bottom: 2px; line-height: 1.1; }
.eco-stat .eco-unit { font-size: 12px; color: var(--text-3); }
.eco-stat .eco-label { font-size: 11px; color: var(--text-3); margin-top: 2px; }
.eco-divider { width: 1px; height: 40px; background: rgba(34,197,94,0.15); }
.eco-progress-row {
  background: rgba(255,255,255,0.03);
  border-radius: var(--radius-sm);
  padding: 12px;
  margin-bottom: 12px;
}
.eco-progress-label { font-size: 12px; color: var(--text-2); display: flex; justify-content: space-between; margin-bottom: 8px; }
.eco-progress-pct { color: #22c55e; font-weight: 600; }
.eco-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}
.eco-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  border-radius: 3px;
  transition: width 0.5s ease;
}
.eco-progress-sub { font-size: 11px; color: var(--text-3); margin-top: 6px; }
.eco-tips { margin-top: auto; }
.eco-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-2);
  background: rgba(255,255,255,0.03);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
}
.eco-tip .tip-icon { font-size: 14px; }

/* ===== 场景模式（侧边栏） ===== */
.scene-modes {
  padding: 12px 0;
  border-top: 1px solid var(--border);
  margin-top: 8px;
}
.scene-modes-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 12px;
  margin-bottom: 8px;
}
.scene-mode-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
  text-align: left;
}
.scene-mode-btn:hover {
  background: rgba(0, 212, 170, 0.08);
  border-color: var(--border);
  color: var(--text);
}
.scene-mode-btn.active {
  background: var(--primary-dim);
  border-color: rgba(0, 212, 170, 0.25);
  color: var(--primary);
  box-shadow: 0 0 12px rgba(0, 212, 170, 0.1);
}
.scene-mode-btn .sm-icon {
  font-size: 16px;
  min-width: 22px;
  text-align: center;
}
.scene-mode-btn .sm-label {
  font-size: 12px;
  font-weight: 500;
}

/* ===== Toast 通知系统 ===== */
.toast-container {
  position: fixed;
  top: 70px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: 400px;
}
.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(10, 20, 38, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 212, 170, 0.05);
  pointer-events: auto;
}
.toast-item.info { border-left: 4px solid var(--secondary); }
.toast-item.success { border-left: 4px solid var(--success); }
.toast-item.warning { border-left: 4px solid var(--warning); }
.toast-item.danger { border-left: 4px solid var(--danger); }
.toast-icon { font-size: 16px; flex-shrink: 0; }
.toast-msg {
  flex: 1;
  font-size: 13px;
  color: var(--text);
  line-height: 1.4;
}
.toast-close {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 50%;
  color: var(--text-3);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}
.toast-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text);
}
.toast-fade-enter-active { animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-fade-leave-active { animation: toastSlideOut 0.25s ease forwards; }
@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(40px) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes toastSlideOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(40px) scale(0.95); }
}
</style>