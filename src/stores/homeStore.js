import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHomeStore = defineStore('home', () => {
  const currentRoom = ref('living-room')

  const pointers = ref([
    { id: 'pointer-001', name: '开关1', position: { x: 0.28, y: 0.02, z: -1.18 }, type: 'switch' },
    { id: 'pointer-002', name: '开关2', position: { x: 0.70, y: 0.02, z: -1.18 }, type: 'switch' },
    { id: 'pointer-005', name: '开关3', position: { x: 0.34, y: 0.02, z: 0.03 }, type: 'switch' },
    { id: 'pointer-006', name: '开关4', position: { x: 0.34, y: 0.02, z: 0.25 }, type: 'switch' },
    { id: 'pointer-009', name: '电视开关', position: { x: -0.40, y: 0.02, z: 0.03 }, type: 'switch', deviceId: 'tv-1' },
    { id: 'pointer-007', name: '卧室开关1', position: { x: -0.04, y: 0.02, z: -0.97 }, type: 'switch' },
    { id: 'pointer-008', name: '卧室开关2', position: { x: -0.04, y: 0.02, z: -0.73 }, type: 'switch' },
    { id: 'pointer-011', name: '床头开关', position: { x: -0.89, y: 0.02, z: 0.06 }, type: 'switch' },
    { id: 'pointer-012', name: '传感器', position: { x: -0.95, y: 0.02, z: 0.41 }, type: 'sensor' },
    { id: 'pointer-018', name: '音箱', position: { x: -0.95, y: 0.02, z: 0.80 }, type: 'speaker', deviceId: 'speaker-1' },
    { id: 'pointer-010', name: '厨房入口', position: { x: -0.03, y: 0.02, z: 1.42 }, type: 'switch' },
    { id: 'pointer-013', name: '厨房开关', position: { x: 0.43, y: 0.02, z: 1.42 }, type: 'switch' },
    { id: 'pointer-014', name: '传感器', position: { x: 0.79, y: 0.02, z: 0.61 }, type: 'sensor' },
    { id: 'pointer-015', name: '插座', position: { x: 0.91, y: 0.02, z: 0.75 }, type: 'socket' },
    { id: 'pointer-016', name: '厨房设备', position: { x: 0.79, y: 0.02, z: 0.04 }, type: 'switch' },
    { id: 'pointer-003', name: '空调开关', position: { x: 0.93, y: 0.02, z: -0.97 }, type: 'ac', deviceId: 'ac-1' },
    { id: 'pointer-004', name: '空调控制', position: { x: 0.93, y: 0.02, z: -0.73 }, type: 'ac', deviceId: 'ac-2' },
    { id: 'pointer-017', name: '入口', position: { x: 0.17, y: -0.09, z: 1.58 }, type: 'switch' },
  ])

  const devices = ref([
    { id: 'light-1', name: '客厅主灯', type: 'light', status: true, value: 80, room: 'living-room' },
    { id: 'light-2', name: '客厅灯带', type: 'light', status: true, value: 60, room: 'living-room' },
    { id: 'ac-1', name: '客厅空调', type: 'ac', status: true, value: 24, room: 'living-room', modelId: 'air-conditioner_001' },
    { id: 'tv-1', name: '客厅电视', type: 'tv', status: false, room: 'living-room', modelId: 'Tv' },
    { id: 'speaker-1', name: '智能音箱', type: 'speaker', status: false, room: 'living-room', modelId: 'Speaker' },
    { id: 'light-3', name: '主卧主灯', type: 'light', status: false, value: 50, room: 'bedroom' },
    { id: 'light-4', name: '主卧氛围灯', type: 'light', status: true, value: 30, room: 'bedroom' },
    { id: 'ac-2', name: '主卧空调', type: 'ac', status: false, value: 26, room: 'bedroom', modelId: 'air-conditioner_002' },
    { id: 'light-7', name: '次卧主灯', type: 'light', status: false, value: 50, room: 'bedroom2' },
    { id: 'light-8', name: '次卧氛围灯', type: 'light', status: false, value: 30, room: 'bedroom2' },
    { id: 'ac-3', name: '次卧空调', type: 'ac', status: false, value: 26, room: 'bedroom2', modelId: 'air-conditioner_001' },
    { id: 'light-5', name: '厨房顶灯', type: 'light', status: true, value: 100, room: 'kitchen' },
    { id: 'sensor-1', name: '烟雾传感器', type: 'sensor', status: true, room: 'kitchen', modelId: 'Sensor_002' },
    { id: 'light-6', name: '卫生间灯', type: 'light', status: false, value: 70, room: 'bathroom' },
    { id: 'sensor-temp', name: '温度传感器', type: 'sensor', status: true, room: 'living-room', modelId: 'Sensor_001' },
    { id: 'sensor-motion', name: '人体传感器', type: 'sensor', status: true, room: 'living-room', modelId: 'Sensor_003' },
  ])

  const scenes = ref([
    {
      id: 'home', name: '回家模式', icon: '🏠',
      description: '开启客厅灯光，空调调至舒适温度',
      devices: [
        { id: 'light-1', status: true, value: 80 },
        { id: 'light-2', status: true, value: 60 },
        { id: 'ac-1', status: true, value: 24 },
      ]
    },
    {
      id: 'sleep', name: '睡眠模式', icon: '🌙',
      description: '关闭所有灯光，卧室空调开启',
      devices: [
        { id: 'light-1', status: false },
        { id: 'light-2', status: false },
        { id: 'light-3', status: false },
        { id: 'light-4', status: true, value: 20 },
        { id: 'ac-2', status: true, value: 26 },
      ]
    },
    {
      id: 'movie', name: '影院模式', icon: '🎬',
      description: '调暗灯光，开启电视',
      devices: [
        { id: 'light-1', status: true, value: 10 },
        { id: 'light-2', status: false },
        { id: 'tv-1', status: true },
        { id: 'speaker-1', status: true },
      ]
    },
    {
      id: 'away', name: '离家模式', icon: '🚪',
      description: '关闭所有设备，开启安防',
      devices: [
        { id: 'light-1', status: false },
        { id: 'light-2', status: false },
        { id: 'light-3', status: false },
        { id: 'light-4', status: false },
        { id: 'light-5', status: false },
        { id: 'light-6', status: false },
        { id: 'ac-1', status: false },
        { id: 'ac-2', status: false },
        { id: 'tv-1', status: false },
      ]
    },
  ])

  const currentRoomDevices = computed(() =>
    devices.value.filter(d => d.room === currentRoom.value)
  )

  const rooms = [
    { id: 'living-room', name: '客厅', icon: '🛋️' },
    { id: 'bedroom', name: '主卧', icon: '🛏️' },
    { id: 'bedroom2', name: '次卧', icon: '🛏️' },
    { id: 'kitchen', name: '厨房', icon: '🍳' },
    { id: 'bathroom', name: '卫生间', icon: '🚿' },
  ]

  const stats = ref({
    totalDevices: devices.value.length,
    activeDevices: devices.value.filter(d => d.status).length,
    energyUsage: devices.value
      .filter(d => d.status)
      .reduce((acc, d) => acc + (d.type === 'ac' ? 1.5 : d.type === 'light' ? 0.1 : 0.05), 0),
    temperature: 26,
    humidity: 45,
    outdoorTemp: 38,
    outdoorHumidity: 40,
    co2: 450,
    pm25: 12,
    light: 320,
    dailyEnergy: 8.5,
    totalEnergy: 235,
    savingRate: 18,
    carbonReduction: 12.5,
    treeEquiv: 2,
  })

  function toggleDevice(deviceId) {
    const device = devices.value.find(d => d.id === deviceId)
    if (device) {
      device.status = !device.status
    }
  }

  function updateDeviceValue(deviceId, value) {
    const device = devices.value.find(d => d.id === deviceId)
    if (device) {
      device.value = value
    }
  }

  function applyScene(sceneId) {
    const scene = scenes.value.find(s => s.id === sceneId)
    if (!scene) return
    scene.devices.forEach(sceneDevice => {
      const device = devices.value.find(d => d.id === sceneDevice.id)
      if (device) {
        device.status = sceneDevice.status
        if (sceneDevice.value !== undefined) {
          device.value = sceneDevice.value
        }
      }
    })
  }

  function toggleByPointer(pointerId) {
    const pointer = pointers.value.find(p => p.id === pointerId)
    if (pointer?.deviceId) {
      toggleDevice(pointer.deviceId)
    }
  }

  return {
    currentRoom,
    devices,
    scenes,
    rooms,
    pointers,
    currentRoomDevices,
    stats,
    toggleDevice,
    updateDeviceValue,
    applyScene,
    toggleByPointer,
  }
})
