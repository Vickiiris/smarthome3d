import { ref, computed } from 'vue'

export function useEnvDetail(homeStore) {
  const envDetailVisible = ref(false)
  const envDetailLabel = ref('')

  function getEnvColor(label, value) {
    switch (label) {
      case '室外温度': if (value < 15) return '#4fc3f7'; if (value < 20) return '#26c6da'; if (value <= 26) return '#00d4aa'; if (value <= 32) return '#ffd54f'; if (value <= 38) return '#ff9800'; return '#ff6b6b'
      case '室外湿度': if (value < 30) return '#ff6b6b'; if (value <= 70) return '#00d4aa'; return '#4fc3f7'
      case '室内温度': if (value < 16) return '#4fc3f7'; if (value < 18) return '#26c6da'; if (value <= 26) return '#00d4aa'; if (value <= 30) return '#ffd54f'; return '#ff6b6b'
      case '室内湿度': if (value < 30) return '#ff6b6b'; if (value <= 70) return '#00d4aa'; return '#4fc3f7'
      case 'CO₂浓度': if (value <= 600) return '#4cd964'; if (value <= 800) return '#00d4aa'; if (value <= 1000) return '#ffd54f'; if (value <= 1500) return '#ff9800'; return '#ff6b6b'
      case 'PM2.5': if (value <= 35) return '#4cd964'; if (value <= 75) return '#00d4aa'; if (value <= 115) return '#ffd54f'; if (value <= 150) return '#ff9800'; return '#ff6b6b'
      case '光照': if (value < 50) return '#ff9800'; if (value <= 300) return '#00d4aa'; if (value <= 500) return '#ffd54f'; return '#ff9800'
      case '空气质量': if (value <= 35) return '#4cd964'; if (value <= 75) return '#00d4aa'; if (value <= 115) return '#ffd54f'; return '#ff6b6b'
      default: return '#00d4aa'
    }
  }

  const envItems = computed(() => {
    const v = homeStore.stats
    return [
      { icon: '🌡', label: '室外温度', value: `${v.outdoorTemp ?? 38}°C`, pct: Math.min(100, Math.max(0, v.outdoorTemp ?? 38)), color: getEnvColor('室外温度', v.outdoorTemp ?? 38), raw: v.outdoorTemp ?? 38 },
      { icon: '💧', label: '室外湿度', value: `${v.outdoorHumidity ?? 40}%`, pct: Math.min(100, Math.max(0, v.outdoorHumidity ?? 40)), color: getEnvColor('室外湿度', v.outdoorHumidity ?? 40), raw: v.outdoorHumidity ?? 40 },
      { icon: '🏠', label: '室内温度', value: `${v.temperature ?? 24}°C`, pct: Math.min(100, Math.max(0, v.temperature ?? 24)), color: getEnvColor('室内温度', v.temperature ?? 24), raw: v.temperature ?? 24 },
      { icon: '🌫', label: '室内湿度', value: `${v.humidity ?? 50}%`, pct: Math.min(100, Math.max(0, v.humidity ?? 50)), color: getEnvColor('室内湿度', v.humidity ?? 50), raw: v.humidity ?? 50 },
      { icon: '🫁', label: 'CO₂浓度', value: `${v.co2 ?? 450}ppm`, pct: Math.min(100, Math.max(0, (v.co2 ?? 450) / 20)), color: getEnvColor('CO₂浓度', v.co2 ?? 450), raw: v.co2 ?? 450 },
      { icon: '🌿', label: 'PM2.5', value: `${v.pm25 ?? 12}μg/m³`, pct: Math.min(100, Math.max(0, (v.pm25 ?? 12) * 2)), color: getEnvColor('PM2.5', v.pm25 ?? 12), raw: v.pm25 ?? 12 },
      { icon: '☀️', label: '光照', value: `${v.light ?? 320}lux`, pct: Math.min(100, Math.max(0, (v.light ?? 320) / 5)), color: getEnvColor('光照', v.light ?? 320), raw: v.light ?? 320 },
      { icon: '💨', label: '空气质量', value: (v.pm25 ?? 12) <= 35 ? '优' : (v.pm25 ?? 12) <= 75 ? '良' : (v.pm25 ?? 12) <= 115 ? '轻度' : '中度', pct: (v.pm25 ?? 12) <= 35 ? 90 : (v.pm25 ?? 12) <= 75 ? 70 : (v.pm25 ?? 12) <= 115 ? 50 : 30, color: (v.pm25 ?? 12) <= 35 ? '#4cd964' : (v.pm25 ?? 12) <= 75 ? '#00d4aa' : (v.pm25 ?? 12) <= 115 ? '#ffd54f' : '#ff6b6b', raw: v.pm25 ?? 12 },
    ]
  })

  const envDetailItem = computed(() => {
    if (!envDetailLabel.value) return null
    return envItems.value.find(i => i.label === envDetailLabel.value) || null
  })

  const envDetailMap = {
    '室外温度': { desc: '室外大气温度，反映当前户外热环境。', standard: '国标 GB/T 18883：室内温度舒适范围 18~26°C（冬季 16~24°C，夏季 24~28°C）。', tips: '室外温度过高时建议减少户外活动，注意防暑。' },
    '室外湿度': { desc: '室外空气相对湿度，影响体感温度和舒适度。', standard: '国标 GB/T 18883：室内相对湿度舒适范围 30%~70%。', tips: '湿度过高易滋生霉菌，过低易引起呼吸道不适。' },
    '室内温度': { desc: '室内空气温度，直接影响居住舒适度和健康。', standard: '国标 GB/T 18883：夏季 24~28°C，冬季 18~24°C 为舒适范围。', tips: '建议保持室内温度稳定，避免与室外温差过大。' },
    '室内湿度': { desc: '室内空气相对湿度，影响人体舒适感和建筑材料。', standard: '国标 GB/T 18883：室内相对湿度 40%~70% 为舒适范围。', tips: '湿度低于 30% 时建议使用加湿器，高于 70% 时开启除湿。' },
    'CO₂浓度': { desc: '室内二氧化碳浓度，反映空气新鲜程度和通风状况。', standard: '国标 GB/T 18883：室内 CO₂ 浓度应 ≤1000ppm；>2000ppm 会引起头晕不适。', tips: '建议定期开窗通风，保持 CO₂ 浓度低于 1000ppm。' },
    'PM2.5': { desc: '细颗粒物浓度，直径 ≤2.5μm，可深入肺部，影响呼吸健康。', standard: '国标 GB 3095：年均浓度 ≤35μg/m³（优良），日均 ≤75μg/m³。', tips: '室内 PM2.5 超标时建议开启空气净化器，减少室内燃烧活动。' },
    '光照': { desc: '室内光照强度，影响视觉舒适度和生物节律。', standard: '国标 GB 50034：办公室照度 300~500lux，卧室 75~150lux，客厅 100~300lux。', tips: '光照不足时建议补充人工照明，避免长时间在昏暗环境中用眼。' },
    '空气质量': { desc: '综合空气质量指数（AQI），综合评估室内空气污染程度。', standard: '国标 HJ 633：AQI 0~50 优，51~100 良，101~150 轻度污染，>150 中度及以上污染。', tips: '空气质量差时建议关闭门窗，开启净化器，减少剧烈运动。' },
    '心率': { desc: '心脏每分钟跳动的次数，反映心血管系统功能状态。', standard: '国标 WS/T 323：成人静息心率正常范围 60~100次/分；运动员可达 40~60次/分。', tips: '心率持续偏高需警惕心血管风险，建议减少咖啡因摄入，保持规律作息。' },
    '血压': { desc: '血液对血管壁的侧压力，分为收缩压（高压）和舒张压（低压）。', standard: '国标 WS/T 324：正常血压收缩压 <120mmHg 且舒张压 <80mmHg；正常高值需关注生活方式。', tips: '血压偏高者建议减少盐分摄入，适量运动，保持充足睡眠，定期监测。' },
    '体温': { desc: '人体核心体温，反映基础代谢和免疫状态。', standard: '国标 GBZ 189：正常人体温范围 36.0~37.2°C；超过 37.3°C 属发热。', tips: '体温异常需关注是否感染或过度劳累；建议规律作息，适度锻炼增强免疫。' },
    '血氧': { desc: '血液中血红蛋白与氧气结合的比例，反映呼吸系统氧合能力。', standard: '国标 GB 9801：正常人血氧饱和度 ≥95%；低于 94% 需关注，低于 90% 属低氧血症。', tips: '血氧偏低建议增加室内通风，避免剧烈运动；持续偏低需就医排查呼吸系统问题。' },
    '睡眠': { desc: '每日睡眠时长和质量，影响身体修复、记忆巩固和免疫功能。', standard: '国标 GB/T 18883：中国成人建议每日睡眠 7~9小时；儿童青少年需 8~10小时。', tips: '睡眠不足会影响认知和免疫力，建议固定作息时间，睡前减少电子设备使用。' },
  }

  const healthDetailMap = {
    '心率': envDetailMap['心率'], '血压': envDetailMap['血压'], '体温': envDetailMap['体温'],
    '血氧': envDetailMap['血氧'], '睡眠': envDetailMap['睡眠'],
    '步数': { desc: '每日行走步数，反映身体日常活动水平和代谢消耗。', standard: '世界卫生组织（WHO）建议：成年人每日步行 6000~10000 步，可降低心血管疾病和糖尿病风险。', tips: '步数不足建议利用碎片时间步行，如上下班步行一段距离、餐后散步等，循序渐进提升日均步数。' },
  }

  const healthDetailVisible = ref(false)
  const healthDetailLabel = ref('')

  function showEnvDetail(item) { envDetailLabel.value = item.label; envDetailVisible.value = true }
  function closeEnvDetail() { envDetailVisible.value = false }
  function openHealthDetail(item) { healthDetailLabel.value = item.label; healthDetailVisible.value = true }
  function closeHealthDetail() { healthDetailVisible.value = false }

  function getHealthTips(label, value) {
    switch (label) {
      case '室外温度': if (value < 0) return '气温极低，请做好防寒保暖，避免长时间户外活动。'; if (value < 15) return '气温较低，建议穿着厚重衣物，适度户外活动。'; if (value <= 26) return '气温舒适，是户外活动的好时机。'; if (value <= 32) return '气温较高，建议多喝水，避免长时间暴晒。'; if (value <= 38) return '气温很高，请做好防暑降温，减少户外活动。'; return '气温极高，请立即采取防暑措施，避免中暑。'
      case '室外湿度': if (value < 20) return '空气干燥，建议多喝水，使用加湿器。'; if (value < 30) return '空气较干，可能引起皮肤干燥和呼吸道不适。'; if (value <= 70) return '湿度舒适，空气质量良好。'; if (value <= 85) return '空气潮湿，易滋生霉菌，建议开启除湿。'; return '空气非常潮湿，请立即开启除湿设备。'
      case '室内温度': if (value < 16) return '室内过冷，建议调高温度，避免感冒。'; if (value < 18) return '室内温度偏低，建议增加供暖。'; if (value <= 26) return '室内温度舒适，保持当前设置。'; if (value <= 30) return '室内温度偏高，建议开启空调降温。'; return '室内温度过高，请立即开启空调。'
      case '室内湿度': if (value < 20) return '室内过干，建议开启加湿器，多喝水。'; if (value < 30) return '室内较干，易引起呼吸道不适。'; if (value <= 70) return '室内湿度舒适，保持当前环境。'; if (value <= 85) return '室内较潮，建议开启除湿或通风。'; return '室内过潮，请立即开启除湿设备。'
      case 'CO₂浓度': if (value <= 600) return '空气质量优秀，通风效果很好。'; if (value <= 800) return '空气质量良好，可继续保持。'; if (value <= 1000) return '空气质量一般，建议开窗通风。'; if (value <= 1500) return '空气质量较差，请立即开窗通风。'; return '空气质量很差，请立即打开所有窗户通风。'
      case 'PM2.5': if (value <= 35) return 'PM2.5 优秀，空气质量很好，可放心户外活动。'; if (value <= 75) return 'PM2.5 良好，空气质量不错。'; if (value <= 115) return 'PM2.5 轻度污染，敏感人群应减少户外活动。'; if (value <= 150) return 'PM2.5 中度污染，建议开启空气净化器。'; return 'PM2.5 重度污染，请立即开启净化器并关闭门窗。'
      case '光照': if (value < 50) return '光照不足，建议补充人工照明，保护视力。'; if (value <= 100) return '光照较暗，建议增加照明。'; if (value <= 300) return '光照舒适，保持当前照度。'; if (value <= 500) return '光照充足，可适度降低照度。'; return '光照过强，建议降低照度或关闭部分灯光。'
      case '空气质量': if (value <= 35) return '空气质量优秀，PM2.5=' + value + 'ug/m3，非常适合户外活动。'; if (value <= 75) return '空气质量良好，PM2.5=' + value + 'ug/m3，可正常户外活动。'; if (value <= 115) return '空气质量轻度污染，PM2.5=' + value + 'ug/m3，敏感人群应减少户外活动。'; if (value <= 150) return '空气质量中度污染，PM2.5=' + value + 'ug/m3，建议减少户外活动。'; return '空气质量重度污染，PM2.5=' + value + 'ug/m3，请避免户外活动。'
      case '心率': if (value < 60) return '心率偏低，如无不适可正常生活；运动员属正常范围。'; if (value <= 100) return '心率正常，心血管状态良好，继续保持规律运动。'; if (value <= 120) return '心率略高，建议休息放松，减少咖啡因摄入。'; return '心率偏高，建议立即休息，如持续偏高请就医检查。'
      case '血压': if (value < 90) return '血压偏低，建议适量增加盐分和水分摄入。'; if (value <= 120) return '血压理想，心血管健康，继续保持良好生活习惯。'; if (value <= 139) return '血压正常偏高，建议减少盐分摄入，加强运动。'; return '血压偏高，建议就医评估，必要时遵医嘱服药控制。'
      case '体温': if (value < 36.0) return '体温偏低，注意保暖，如持续偏低请就医检查。'; if (value <= 37.2) return '体温正常，身体状态良好。'; if (value <= 38.0) return '低热状态，建议多喝水休息，密切观察。'; return '体温偏高，请及时就医检查是否感染。'
      case '血氧': if (value >= 98) return '血氧优秀，呼吸功能状态极佳。'; if (value >= 95) return '血氧正常，呼吸系统功能良好。'; if (value >= 90) return '血氧偏低，建议增加通风，避免剧烈运动。'; return '血氧过低，请立即就医或吸氧治疗。'
      case '睡眠': if (value < 5) return '睡眠严重不足，建议调整作息，避免熬夜。'; if (value < 7) return '睡眠不足，建议提前就寝，保证 7~9 小时睡眠。'; if (value <= 9) return '睡眠充足，继续保持良好的作息习惯。'; return '睡眠时间过长，可能与疲劳或健康问题有关，建议关注。'
      case '步数': if (value >= 10000) return '步数已达标，继续保持每天一万步的运动习惯。'; if (value >= 6000) return '步数基本达标，建议每天坚持步行，逐步提升至一万步。'; if (value >= 3000) return '步数偏少，建议增加日常步行，如饭后散步或短途步行通勤。'; return '步数严重不足，久坐危害大，建议从每天 3000 步开始，逐步增加到一万步。'
      default: return '保持当前状态，定期监测健康指标。'
    }
  }

  return {
    envDetailVisible, envDetailLabel, envDetailItem, envDetailMap,
    envItems, getEnvColor, showEnvDetail, closeEnvDetail,
    healthDetailVisible, healthDetailLabel, healthDetailMap,
    openHealthDetail, closeHealthDetail, getHealthTips,
  }
}
