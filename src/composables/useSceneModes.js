import { ref } from 'vue'

export function useSceneModes(deviceList, threeScene, homeStore) {
  const activeSceneMode = ref('')

  const sceneModes = [
    { id: 'home', label: '回家模式', icon: '🏠', desc: '打开客厅灯、空调26°C、热水器', actions: [
      { name: '客厅灯开关', status: true, value: 100 }, { name: '客厅空调', status: true, value: 26, mode: 'cool' },
      { name: '燃气热水器', status: true, value: 55 }, { name: '空气质量传感器', status: true }, { name: '门禁控制器', status: false },
    ]},
    { id: 'away', label: '离家模式', icon: '🔒', desc: '关闭所有灯、空调，锁定门禁', actions: [
      { name: '客厅灯开关', status: false }, { name: '主卧灯开关', status: false }, { name: '次卧灯开关', status: false },
      { name: '厨房灯开关', status: false }, { name: '卫生间灯开关', status: false }, { name: '阳台灯开关', status: false },
      { name: '客厅空调', status: false }, { name: '主卧空调', status: false }, { name: '次卧空调', status: false },
      { name: '客厅电视', status: false }, { name: '智能音箱', status: false }, { name: '燃气热水器', status: false },
      { name: '洗碗机', status: false }, { name: '门禁控制器', status: true },
    ]},
    { id: 'sleep', label: '睡眠模式', icon: '🌙', desc: '关闭所有灯，空调26°C，客厅灯留夜灯', actions: [
      { name: '客厅灯开关', status: true, value: 10 }, { name: '主卧灯开关', status: false }, { name: '次卧灯开关', status: false },
      { name: '厨房灯开关', status: false }, { name: '卫生间灯开关', status: false }, { name: '阳台灯开关', status: false },
      { name: '客厅空调', status: true, value: 26, mode: 'cool' }, { name: '主卧空调', status: true, value: 26, mode: 'cool' },
      { name: '次卧空调', status: false }, { name: '客厅电视', status: false }, { name: '智能音箱', status: false }, { name: '燃气热水器', status: false },
    ]},
  ]

  const GATEWAY_TYPES = new Set(['sensor', 'security', 'light', 'outlet'])

  function getLightIdForDevice(deviceId) {
    return { 'dev19': 'light-1', 'dev12': 'light-2', 'dev14': 'light-3', 'dev21': 'light-4', 'dev25': 'light-5', 'dev26': 'light-6' }[deviceId] || null
  }

  function applySceneMode(mode) {
    activeSceneMode.value = mode.id
    let changed = 0
    mode.actions.forEach(action => {
      const idx = deviceList.value.findIndex(d => d.name === action.name)
      if (idx !== -1) {
        const device = deviceList.value[idx]
        if (device.status !== action.status || (action.value !== undefined && device.value !== action.value)) {
          deviceList.value[idx] = { ...device, status: action.status, value: action.value ?? device.value, mode: action.mode ?? device.mode, online: GATEWAY_TYPES.has(device.type) ? (device.online ?? true) : action.status }
          changed++
          if (device.type === 'light') {
            const lightId = getLightIdForDevice(device.id)
            if (lightId) threeScene.setLightStatus(lightId, action.status, action.value ?? 100)
          }
        }
      }
    })
    homeStore.addToast({ message: `${mode.icon} ${mode.label}已启用，共调整 ${changed} 个设备`, type: 'success' })
  }

  return { activeSceneMode, sceneModes, applySceneMode, getLightIdForDevice }
}
