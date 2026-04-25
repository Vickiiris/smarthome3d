// 所有静态数据定义：设备列表、健康数据、告警、策略、产品
import { ref, computed } from 'vue'

export function useAppData() {
  // ===== 设备列表 =====
  const deviceList = ref([
    { id: 'dev1',  name: '客厅空调',           icon: '❄️',  room: '客厅',   vendor: '三星',    ip: '192.168.1.47', online: true,  status: true,  type: 'ac',       value: 24 },
    { id: 'dev3',  name: '新风系统',           icon: '🌀',  room: '全屋',   vendor: '海尔',    ip: '192.168.1.83', online: true,  status: true,  type: 'ventil',   value: 50 },
    { id: 'dev4',  name: '客厅电视',           icon: '📺',  room: '客厅',   vendor: '三星',    ip: '192.168.1.156',online: true,  status: false, type: 'tv',       value: 30 },
    { id: 'dev5',  name: '智能音箱',           icon: '🔊',  room: '客厅',   vendor: '米歇尔',    ip: '192.168.1.29', online: true,  status: true,  type: 'speaker',  value: 60 },
    { id: 'dev6',  name: '门禁系统',           icon: '🔒',  room: '玄关',   vendor: '德施曼',  ip: '192.168.1.112',online: true,  status: false, type: 'security', value: 0  },
    { id: 'dev7',  name: '主卧空调',           icon: '🌬️', room: '主卧',   vendor: '三星',    ip: '192.168.1.64', online: true,  status: false, type: 'ac',       value: 26 },
    { id: 'dev8',  name: '次卧空调',           icon: '🌡️', room: '次卧',   vendor: '三星',    ip: '192.168.1.91', online: true,  status: false, type: 'ac',       value: 26 },
    { id: 'dev9',  name: '洗碗机',             icon: '🍽️', room: '厨房',   vendor: '西门子',  ip: '192.168.1.178',online: true,  status: false, type: 'washer',   value: 0  },
    { id: 'dev10', name: '燃气热水器',         icon: '🚿',  room: '厨房',   vendor: '阿里斯顿',    ip: '192.168.1.203',online: true,  status: false, type: 'heater',   value: 55 },
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
    { id: 'dev28', name: '抽油烟机',          icon: '🌀',  room: '厨房',   vendor: '欧派',    ip: '192.168.1.142',online: true,  status: false, type: 'ventil',   value: 0  },
  ])

  const GATEWAY_TYPES = new Set(['sensor', 'security', 'light', 'outlet'])

  // ===== 健康数据 =====
  const healthItems = ref([
    { icon: '❤',  label: '心率',   value: '72次/分',   trend: 2,   color: '#ff6b6b', range: '正常: 60-100次/分',   pct: 72,  raw: 72 },
    { icon: '🩸', label: '血压',   value: '118/75mmHg', trend: 0,   color: '#8b5cf6', range: '正常: 90-139/60-89', pct: 85,  raw: 118 },
    { icon: '🌡', label: '体温',   value: '36.5°C',     trend: 0.1, color: '#ff9800', range: '正常: 36.0-37.2°C',  pct: 50,  raw: 36.5 },
    { icon: '🫁', label: '血氧',   value: '98%',        trend: 1,   color: '#4fc3f7', range: '正常: 95-100%',      pct: 98,  raw: 98 },
    { icon: '😴', label: '睡眠',   value: '7.8小时',    trend: 0,   color: '#4cd964', range: '正常: 7-9小时',      pct: 83,  raw: 7.8 },
    { icon: '👟', label: '步数',   value: '3542步',     trend: 0,   color: '#00d4aa', range: '目标: 10000步',      pct: 35,  raw: 3542 },
  ])

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

  const bpWeekData = ref([
    { sys: 115, dia: 75 }, { sys: 120, dia: 78 }, { sys: 118, dia: 76 },
    { sys: 122, dia: 80 }, { sys: 116, dia: 74 }, { sys: 119, dia: 77 },
    { sys: 118, dia: 78 },
  ])

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

  const stepsTrendData = ref([
    { day: '周一', value: 8234 }, { day: '周二', value: 10521 }, { day: '周三', value: 6542 },
    { day: '周四', value: 7896 }, { day: '周五', value: 11230 }, { day: '周六', value: 9876 },
    { day: '周日', value: 8547, hourData: [] },
  ])

  const sleepData = ref({ total: 7.8, score: 88, deep: 102, light: 186, rem: 72, awakeMin: 18, awakeCount: 2 })

  // ===== 告警 & 策略 =====
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

  // ===== 产品目录 =====
  const products = ref([
    { id: 1,  icon: '❄️', name: '变频空调 KFR-35',    sub: '环境控制', vendor: '美的',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.2.1', connectedAt: '2024-06-10', signal: '强 (-38dBm)' },
    { id: 2,  icon: '🌀', name: '新风系统 FX-200',     sub: '环境控制', vendor: '海尔',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.0.8', connectedAt: '2024-07-22', signal: '中 (-65dBm)' },
    { id: 3,  icon: '🌡', name: '温湿度传感器 TH-01', sub: '环境控制', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v1.4.2', connectedAt: '2024-08-05', signal: '强 (-44dBm)' },
    { id: 4,  icon: '🌡', name: '空气净化器 KJ-500',  sub: '环境控制', vendor: '飞利浦',   tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
    { id: 5,  icon: '💨', name: '除湿机 D1-10L',      sub: '环境控制', vendor: '德业',     tag: '未接入', protocol: 'Wi-Fi', power: '220V AC' },
    { id: 6,  icon: '💡', name: '智能照明套件',        sub: '照明控制', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.1.4', connectedAt: '2024-08-15', signal: '强 (-42dBm)' },
    { id: 7,  icon: '🌈', name: 'RGB 智能灯泡',        sub: '照明控制', vendor: 'Yeelight', tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v1.9.3', connectedAt: '2024-09-01', signal: '强 (-40dBm)' },
    { id: 8,  icon: '🔲', name: '智能开关面板',        sub: '照明控制', vendor: '公牛',     tag: '待接入', protocol: 'Zigbee 3.0', power: '220V AC' },
    { id: 9,  icon: '🔒', name: '智能门锁 S1',         sub: '安防系统', vendor: '德施曼',   tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v4.0.1', connectedAt: '2024-05-20', signal: '强 (-36dBm)' },
    { id: 10, icon: '📹', name: '智能摄像头 C3W',      sub: '安防系统', vendor: '萤石',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.1.0', connectedAt: '2024-06-30', signal: '强 (-41dBm)' },
    { id: 11, icon: '🔔', name: '智能门铃 D1',         sub: '安防系统', vendor: '叮零',     tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
    { id: 12, icon: '🔥', name: '烟雾/燃气传感器',    sub: '传感器',   vendor: '海曼',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v2.3.0', connectedAt: '2024-07-10', signal: '中 (-58dBm)' },
    { id: 13, icon: '💧', name: '水浸传感器',          sub: '传感器',   vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v1.2.1', connectedAt: '2024-08-20', signal: '强 (-45dBm)' },
    { id: 14, icon: '📶', name: '空气质量传感器',      sub: '传感器',   vendor: '霍尼韦尔', tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v1.8.5', connectedAt: '2024-09-12', signal: '强 (-39dBm)' },
    { id: 15, icon: '🚪', name: '门磁感应器',          sub: '传感器',   vendor: '小米',     tag: '待接入', protocol: 'Zigbee 3.0', power: '电池' },
    { id: 16, icon: '👤', name: '人体存在传感器',      sub: '传感器',   vendor: '领普',     tag: '未接入', protocol: 'Zigbee 3.0', power: '电池' },
    { id: 17, icon: '📺', name: '智能电视 65Q7',       sub: '家电控制', vendor: '三星',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v5.0.2', connectedAt: '2024-07-05', signal: '强 (-37dBm)' },
    { id: 18, icon: '🔊', name: '智能音箱 Pro',        sub: '家电控制', vendor: '米歇尔',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.4.1', connectedAt: '2024-08-01', signal: '强 (-43dBm)' },
    { id: 19, icon: '🍽️', name: '智能洗碗机',          sub: '家电控制', vendor: '西门子',   tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
    { id: 20, icon: '🚿', name: '燃气热水器',          sub: '家电控制', vendor: '阿里斯顿',     tag: '待接入', protocol: 'Wi-Fi', power: '燃气' },
    { id: 21, icon: '🧹', name: '扫地机器人 S1',       sub: '家电控制', vendor: '石头',     tag: '未接入', protocol: 'Wi-Fi', power: '充电' },
    { id: 22, icon: '🔌', name: '智能插座',            sub: '能源管理', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.0.3', connectedAt: '2024-09-18', signal: '强 (-46dBm)' },
    { id: 23, icon: '⚡', name: '智能电表',             sub: '能源管理', vendor: '正泰',     tag: '待接入', protocol: 'RS-485', power: '220V AC' },
  ])

  // ===== 导航 & 房间 =====
  const navItems = [
    { id: 'env',     name: '环境总览', icon: '🌤' },
    { id: 'energy',  name: '能源管理', icon: '⚡' },
    { id: 'device',  name: '设备管理', icon: '📱' },
    { id: 'product', name: '产品中心', icon: '📦' },
    { id: 'health',  name: '健康监测', icon: '❤' },
    { id: 'alarm',   name: '策略告警', icon: '🔔' },
  ]

  const rooms = [
    { id: 'living-room', name: '客厅' },
    { id: 'bedroom',    name: '主卧' },
    { id: 'bedroom2',   name: '次卧' },
    { id: 'kitchen',    name: '厨房' },
    { id: 'bathroom',   name: '卫生间' },
  ]

  return {
    deviceList, GATEWAY_TYPES,
    healthItems, heartRateData, bpWeekData, spo2TrendData, temperatureTrendData, stepsTrendData, sleepData,
    allAlarms, strategies, products,
    navItems, rooms,
  }
}
