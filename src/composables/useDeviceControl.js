import { ref, computed } from 'vue'

export function useDeviceControl(deviceList, GATEWAY_TYPES) {
  const showControlPanel = ref(false)
  const selectedDevice = ref(null)
  const showSlidePanel = ref(false)
  const selectedHotspotDevice = ref(null)
  const showDeviceDetail = ref(false)
  const deviceDetailId = ref('')
  const deviceSearch = ref('')
  const activeDeviceTab = ref('light')

  const iconMap = {
    ac: '❄️', light: '💡', tv: '📺', speaker: '🔊',
    security: '🔒', ventil: '🌀', washer: '🍽️', heater: '🚿',
    sensor: '📡', outlet: '🔌',
  }

  function deviceOnline(device) {
    if (!device) return false
    if (GATEWAY_TYPES.has(device.type)) return true
    return device.status
  }

  function onDeviceUpdate(device) {
    const idx = deviceList.value.findIndex(d => d.name === device.name || d.id === device.id)
    if (idx !== -1) {
      deviceList.value[idx] = {
        ...deviceList.value[idx],
        status: device.status,
        value: device.value ?? deviceList.value[idx].value,
        mode: device.mode ?? deviceList.value[idx].mode,
        fanSpeed: device.fanSpeed ?? deviceList.value[idx].fanSpeed,
        online: GATEWAY_TYPES.has(deviceList.value[idx].type) ? (deviceList.value[idx].online ?? true) : device.status,
      }
      selectedHotspotDevice.value = deviceList.value[idx]
      selectedDevice.value = deviceList.value[idx]
    }
  }

  function toggleDevice(device) {
    const idx = deviceList.value.findIndex(d => d.id === device.id || d.name === device.name)
    if (idx !== -1) {
      const newStatus = !deviceList.value[idx].status
      deviceList.value[idx] = { ...deviceList.value[idx], status: newStatus, online: GATEWAY_TYPES.has(deviceList.value[idx].type) ? (deviceList.value[idx].online ?? true) : newStatus }
    }
  }

  function openDeviceControl(device) {
    const latest = deviceList.value.find(d => d.id === device.id || d.name === device.name) || device
    selectedDevice.value = { id: latest.id, name: latest.name, icon: device.icon, type: latest.type, status: latest.status, value: latest.value, mode: latest.mode ?? 'cool', fanSpeed: latest.fanSpeed ?? 'auto', room: latest.room, vendor: latest.vendor, ip: latest.ip, online: deviceOnline(latest) }
    showControlPanel.value = true
  }

  function openDeviceControlFromTable(device) {
    const latest = deviceList.value.find(d => d.id === device.id) || device
    selectedDevice.value = { id: latest.id, name: latest.name, icon: iconMap[latest.type] || '📱', type: latest.type, status: latest.status, value: latest.value, mode: latest.mode ?? 'cool', fanSpeed: latest.fanSpeed ?? 'auto', room: latest.room, vendor: latest.vendor, ip: latest.ip, online: deviceOnline(latest) }
    showControlPanel.value = true
  }

  function openSecurityControl(item) {
    const sensorIds = item.sensorIds || []
    const linkedSensors = deviceList.value.filter(d => sensorIds.includes(d.id))
    if (linkedSensors.length > 0) {
      const sensor = linkedSensors[0]
      selectedDevice.value = { id: sensor.id, name: item.label + '控制', icon: item.icon, type: 'sensor', status: sensor.status, value: sensor.value, room: sensor.room }
      showControlPanel.value = true
    }
  }

  function toggleSelectedDevice() {
    if (!selectedDevice.value) return
    const newStatus = !selectedDevice.value.status
    selectedDevice.value.status = newStatus
    onDeviceUpdate({ ...selectedDevice.value, status: newStatus })
  }

  function openDeviceDetail(device) { deviceDetailId.value = device.id; showDeviceDetail.value = true }
  function closeDeviceDetail() { showDeviceDetail.value = false }

  const deviceDetailItem = computed(() => {
    if (!deviceDetailId.value) return null
    const d = deviceList.value.find(d => d.id === deviceDetailId.value || d.name === deviceDetailId.value)
    return d ? { ...d, icon: iconMap[d.type] || '📱' } : null
  })

  // 设备筛选
  const deviceRoomFilter = ref('')
  const deviceTypeFilter = ref('')
  const devicePage = ref(1)
  const DEVICE_PAGE_SIZE = 10

  const allDevices = computed(() => deviceList.value)
  const envDevices = computed(() => deviceList.value.filter(d => d.type === activeDeviceTab.value))
  const entertainmentDevices = computed(() => deviceList.value.filter(d => ['tv', 'speaker'].includes(d.type)))

  const filteredDevices = computed(() => {
    const typeGroupMap = { ac: ['ac', 'ventil'], light: ['light'], outlet: ['outlet'], sensor: ['sensor', 'security'], appliance: ['tv', 'speaker', 'washer', 'heater'] }
    let list = deviceList.value.filter(d => {
      const matchSearch = !deviceSearch.value || d.name.includes(deviceSearch.value)
      const matchRoom = !deviceRoomFilter.value || d.room === deviceRoomFilter.value
      const matchType = !deviceTypeFilter.value || (typeGroupMap[deviceTypeFilter.value] || []).includes(d.type)
      return matchSearch && matchRoom && matchType
    })
    const roomOrder = { '客厅': 1, '主卧': 2, '次卧': 3, '厨房': 4, '卫生间': 5, '阳台': 6, '玄关': 7, '全屋': 8 }
    list.sort((a, b) => (roomOrder[a.room] || 9) - (roomOrder[b.room] || 9))
    return list
  })

  const deviceTotalPages = computed(() => Math.max(1, Math.ceil(filteredDevices.value.length / DEVICE_PAGE_SIZE)))
  const pagedDevices = computed(() => {
    if (devicePage.value > deviceTotalPages.value) devicePage.value = 1
    return filteredDevices.value.slice((devicePage.value - 1) * DEVICE_PAGE_SIZE, devicePage.value * DEVICE_PAGE_SIZE)
  })

  function getDeviceColor(device) {
    const typeColors = { light: 'rgba(255, 213, 79, 0.15)', ac: 'rgba(79, 195, 247, 0.15)', sensor: 'rgba(34, 197, 94, 0.15)' }
    const roomColors = { '客厅': 'rgba(79, 195, 247, 0.25)', '主卧': 'rgba(167, 139, 250, 0.25)', '次卧': 'rgba(251, 146, 60, 0.25)', '厨房': 'rgba(239, 68, 68, 0.25)', '卫生间': 'rgba(6, 182, 212, 0.25)', '阳台': 'rgba(253, 224, 71, 0.25)', '玄关': 'rgba(251, 113, 133, 0.25)', '全屋': 'rgba(34, 197, 94, 0.25)' }
    if (device.status) return `linear-gradient(135deg, ${typeColors[device.type] || 'rgba(255,255,255,0.04)'}, ${roomColors[device.room] || 'rgba(255,255,255,0.08)'})`
    return 'rgba(255,255,255,0.04)'
  }

  function deviceTypeLabel(type) { return { ac: '空调', light: '照明', tv: '电视', speaker: '音箱', security: '安防', ventil: '新风系统', washer: '洗碗机', heater: '热水器' }[type] || '智能设备' }
  function deviceTypeDesc(type) { return { ac: '变频空调，支持制冷/制热/送风多种模式。', light: '智能照明设备，支持亮度调节与场景联动。', tv: '智能电视，支持 4K 超高清显示。', speaker: '智能音箱，支持语音控制全屋设备。', security: '安防设备，实时监测门窗状态。', ventil: '新风系统，持续引入室外新鲜空气。', washer: '智能洗碗机，支持多种洗涤程序。', heater: '燃气热水器，即开即热。' }[type] || '智能家居设备。' }
  function deviceTypeTips(type) { return { ac: '建议夏季设定 26°C，冬季 20°C。', light: '建议根据时段设置不同亮度场景。', tv: '建议开启护眼模式。', speaker: '可设置唤醒词快速控制设备。', security: '建议定期检查设备电量。', ventil: '建议全天候开启低速模式。', washer: '建议使用专用洗碗机洗涤剂。', heater: '建议设定 50-55°C。' }[type] || '定期检查设备状态。' }

  function deviceUsageTime(device) { if (!device) return '0小时'; const seed = device.id?.charCodeAt(device.id.length - 1) || 0; const hours = (seed % 500) + 50; const days = Math.floor(hours / 24); return days > 0 ? `${days}天 ${hours % 24}小时` : `${hours}小时` }
  function devicePowerStats(device) { if (!device) return { day: 0, week: 0, month: 0 }; const seed = device.id?.charCodeAt(device.id.length - 1) || 0; const mult = { ac: 3.5, outlet: 0.8, light: 0.3, tv: 1.2, sensor: 0.05, security: 0.1, ventil: 1.5, speaker: 0.2, washer: 2.0, heater: 4.0 }[device.type] || 0.5; const base = (seed % 10) + 1; return { day: (base * mult * 0.1).toFixed(2), week: (base * mult * 0.7).toFixed(2), month: (base * mult * 3).toFixed(2) } }

  // 新增设备
  const addDeviceVisible = ref(false)
  const addStep = ref('choose')
  const addFormError = ref('')
  const successMsg = ref('')
  const roomOptions = ['客厅', '主卧', '次卧', '厨房', '卫生间', '阳台', '玄关', '全屋']
  const deviceTypeOptions = [{ value: 'ac', label: '空调' }, { value: 'light', label: '照明' }, { value: 'tv', label: '电视' }, { value: 'speaker', label: '音箱' }, { value: 'ventil', label: '新风系统' }, { value: 'washer', label: '洗碗机' }, { value: 'heater', label: '热水器' }, { value: 'security', label: '安防设备' }]
  const newDevice = ref({ name: '', room: '', vendor: '', type: '', ip: '', status: false })

  function openAddDevice() { addStep.value = 'choose'; addFormError.value = ''; newDevice.value = { name: '', room: '', vendor: '', type: '', ip: '', status: false }; addDeviceVisible.value = true }
  function closeAddDevice() { addDeviceVisible.value = false }

  function submitManualAdd() {
    if (!newDevice.value.name.trim()) { addFormError.value = '请填写设备名称'; return }
    if (!newDevice.value.room) { addFormError.value = '请选择安装位置'; return }
    if (!newDevice.value.type) { addFormError.value = '请选择设备类型'; return }
    addFormError.value = ''
    const nextId = 'dev' + (deviceList.value.length + 100)
    const ips = deviceList.value.map(d => parseInt(d.ip?.split('.').pop() || '0'))
    const nextIp = newDevice.value.ip.trim() || `192.168.1.${Math.max(...ips, 10) + 1}`
    deviceList.value.push({ id: nextId, name: newDevice.value.name.trim(), room: newDevice.value.room, vendor: newDevice.value.vendor.trim() || '未知', ip: nextIp, online: true, status: newDevice.value.status, type: newDevice.value.type, value: 0 })
    successMsg.value = `「${newDevice.value.name}」已成功添加到设备列表`
    addStep.value = 'success'
  }

  // 扫描
  const scanning = ref(false)
  const scanProgress = ref(0)
  const scanStatus = ref('准备扫描')
  const scanResults = ref([])
  const scanSelected = ref([])
  let scanTimer = null
  const mockScanDevices = [{ ip: '192.168.1.102', name: '智能门锁 Pro', vendor: '德施曼', icon: '🔒', type: 'security' }, { ip: '192.168.1.137', name: '卧室照明', vendor: '飞利浦', icon: '💡', type: 'light' }, { ip: '192.168.1.184', name: '扫地机器人', vendor: '石头', icon: '🤖', type: 'sensor' }, { ip: '192.168.1.219', name: '智能窗帘', vendor: '欧瑞博', icon: '🪟', type: 'ventil' }, { ip: '192.168.1.253', name: '厨房烟机', vendor: '方太', icon: '💨', type: 'ventil' }, { ip: '192.168.1.161', name: '浴室暖风机', vendor: '奥普', icon: '🌡️', type: 'heater' }]

  function startScan() {
    addStep.value = 'scan'; scanning.value = true; scanProgress.value = 0; scanStatus.value = '正在扫描网络…'; scanResults.value = []; scanSelected.value = []
    clearInterval(scanTimer)
    scanTimer = setInterval(() => {
      scanProgress.value = Math.min(scanProgress.value + Math.random() * 12 + 4, 100)
      if (scanProgress.value >= 100) { clearInterval(scanTimer); scanning.value = false; scanStatus.value = '扫描完成'; scanResults.value = mockScanDevices.map(d => ({ ...d, alreadyAdded: false })) }
    }, 200)
  }

  function toggleScanSelect(ip) { const idx = scanSelected.value.indexOf(ip); if (idx === -1) scanSelected.value.push(ip); else scanSelected.value.splice(idx, 1) }
  function submitScanAdd() { scanResults.value.filter(d => scanSelected.value.includes(d.ip)).forEach(d => { deviceList.value.push({ id: 'dev' + (deviceList.value.length + 100), name: d.name, room: '未分配', vendor: d.vendor, ip: d.ip, online: true, status: false, type: d.type, value: 0 }) }); successMsg.value = `已成功添加 ${scanSelected.value.length} 台设备`; addStep.value = 'success' }

  return {
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
  }
}
