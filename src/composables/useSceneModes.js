import { ref } from 'vue'

export function useSceneModes(deviceList, threeScene, homeStore) {
  const activeSceneMode = ref('')

  const sceneModes = [
    { id: 'bright', label: '明亮模式', icon: '☀️', desc: '全屋 6 盏灯全开、亮度 100%，适合打扫、待客、看书', actions: [
      { name: '客厅灯开关', status: true, value: 100 }, { name: '主卧灯开关', status: true, value: 100 },
      { name: '次卧灯开关', status: true, value: 100 }, { name: '厨房灯开关', status: true, value: 100 },
      { name: '卫生间灯开关', status: true, value: 100 }, { name: '阳台灯开关', status: true, value: 100 },
    ]},
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

  // ===== 设备灯光 → 3D 场景联动 =====
  // 缓存上一次下发给场景的状态，避免「值没变也重放一次 tween」
  const lightStateCache = new Map()

  /**
   * 把一盏灯具的开关/亮度同步到 3D 场景里对应的点光源
   * @param {{id:string,type:string,status:boolean,value?:number,online?:boolean}} device
   */
  function syncDeviceLight(device) {
    if (!device || device.type !== 'light') return
    const lightId = getLightIdForDevice(device.id)
    if (!lightId) return
    // 亮度 0 就是 0（关到底），不要在这里补满：
    // 「开灯时初始亮度为 0」由 useDeviceControl 在状态切换那一下补成 100
    const value = Math.max(0, Math.min(100, Number(device.value) || 0))
    const on = !!device.status && (device.online ?? true) && value > 0
    const prev = lightStateCache.get(lightId)
    if (prev && prev.on === on && prev.value === value) return
    lightStateCache.set(lightId, { on, value })
    threeScene?.setLightStatus?.(lightId, on, value)
  }

  /** 全量同步（首屏初始化 / 设备列表任意变更时调用） */
  function syncAllLights() {
    deviceList.value.forEach(syncDeviceLight)
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
          // 灯光联动统一交给 syncAllLights（由 HomeView 的 deviceList watcher 触发），
          // 这里不再单独调用，保证「手动开关」和「场景模式」走同一条链路
        }
      }
    })
    syncAllLights()
    // 明亮模式的文案针对性更强：用户关心的是「灯是不是全亮了」
    const message = mode.id === 'bright'
      ? (changed > 0 ? `☀️ 明亮模式已启用，全屋 ${mode.actions.length} 盏灯已点亮` : '☀️ 全屋灯光已经是全亮状态')
      : `${mode.icon} ${mode.label}已启用，共调整 ${changed} 个设备`
    homeStore.addToast({ message, type: 'success' })
  }

  return { activeSceneMode, sceneModes, applySceneMode, getLightIdForDevice, syncDeviceLight, syncAllLights }
}
