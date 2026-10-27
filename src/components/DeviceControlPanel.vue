<template>
  <Teleport to="body">
    <Transition name="slide-panel">
      <div v-if="visible" class="dcp-wrap">
        <div class="dcp-panel" @click.stop>

          <!-- 头部 -->
          <div class="dcp-header">
            <div class="dcp-header-icon">{{ deviceIcon }}</div>
            <div class="dcp-header-info">
              <h3 class="dcp-name">{{ device?.name }}</h3>
              <span class="dcp-online" :style="{ color: device?.online !== false ? '#22c55e' : '#94a3b8' }">
                ● {{ device?.online !== false ? '在线' : '离线' }}
              </span>
            </div>
            <button class="dcp-close" @click="close">✕</button>
          </div>

          <!-- 基础信息 -->
          <div class="dcp-body" v-if="device?.type !== 'energy'">
            <div class="dcp-grid dcp-info-grid">
              <div class="dcp-dd-item"><span class="dcp-dd-label">安装位置</span><span class="dcp-dd-value">{{ device?.room || '—' }}</span></div>
              <div class="dcp-dd-item"><span class="dcp-dd-label">设备厂商</span><span class="dcp-dd-value">{{ device?.vendor || '—' }}</span></div>
              <div class="dcp-dd-item"><span class="dcp-dd-label">设备类型</span><span class="dcp-dd-value">{{ deviceTypeLabel }}</span></div>
              <div class="dcp-dd-item"><span class="dcp-dd-label">IP 地址</span><span class="dcp-dd-value mono">{{ device?.ip || '—' }}</span></div>
            </div>

            <!-- 主开关 -->
            <div class="dcp-section">
              <div class="dcp-section-title">⚡ 电源控制</div>
              <div class="dcp-switch-row">
                <span class="dcp-switch-label">{{ localStatus ? '设备已开启' : '设备已关闭' }}</span>
                <div class="dcp-toggle" @click="togglePower">
                  <div class="dcp-toggle-track" :class="{ on: !!localStatus }"><div class="dcp-toggle-thumb"></div></div>
                </div>
              </div>
              <!-- 供电插座断电提示：插座不开，设备开不了机 -->
              <div class="dcp-power-warn" v-if="power && power.kind === 'device' && !power.outletOn">
                ⚠️ 供电插座「{{ power.outletName }}」未通电，请先接通插座再开机
              </div>
            </div>

            <!-- 供电设备：插座专用，展示这台插座给哪些设备供电 -->
            <div class="dcp-section" v-if="device?.type === 'outlet' && power?.kind === 'outlet'">
              <div class="dcp-section-title">🔌 供电设备</div>
              <div class="dcp-powered-list">
                <div class="dcp-powered-item" v-for="d in power.powered" :key="d.name">
                  <span class="dcp-powered-icon">{{ d.icon }}</span>
                  <span class="dcp-powered-name">{{ d.name }}</span>
                  <span class="dcp-powered-state" :class="{ on: d.on }">● {{ d.on ? '运行中' : '已关闭' }}</span>
                </div>
              </div>
              <p class="dcp-desc">关闭本插座将联动关闭以上设备。</p>
            </div>

            <!-- 门：洗衣机 / 洗碗机 -->
            <div class="dcp-section" v-if="device?.type === 'washer' || device?.type === 'washing'">
              <div class="dcp-section-title">🚪 门</div>
              <div class="dcp-switch-row">
                <span class="dcp-switch-label">{{ localDoor ? '舱门已打开' : '舱门已关闭' }}</span>
                <button class="dcp-door-btn" :class="{ on: localDoor }" @click="toggleDoor">{{ localDoor ? '关门' : '开门' }}</button>
              </div>
            </div>

            <!-- 设备类型控制（子组件） -->
            <PanelAcControls v-if="device?.type === 'ac' && !!localStatus" :value="localValue" :mode="localMode" :fanSpeed="localFanSpeed" @update:value="v => { localValue = v; emitUpdate() }" @update:mode="v => { localMode = v; emitUpdate() }" @update:fanSpeed="v => { localFanSpeed = v; emitUpdate() }" />
            <PanelLightControls v-else-if="device?.type === 'light' && !!localStatus" :value="localValue" @update:value="v => { localValue = v; emitUpdate() }" @update:status="v => { localStatus = v; emitUpdate() }" />
            <PanelOutletControls v-else-if="device?.type === 'outlet' && localStatus" :deviceId="device?.id" />
            <PanelTvControls v-else-if="device?.type === 'tv' && !!localStatus" :value="localValue" :mode="localMode" @update:value="v => { localValue = v; emitUpdate() }" @update:mode="v => { localMode = v; emitUpdate() }" />
            <PanelSpeakerControls v-else-if="device?.type === 'speaker' && !!localStatus" :value="localValue" @update:value="v => { localValue = v; emitUpdate() }" />
            <PanelVentilControls v-else-if="device?.type === 'ventil' && !!localStatus" :value="localValue" @update:value="v => { localValue = v; emitUpdate() }" />
            <PanelWasherControls v-else-if="(device?.type === 'washer' || device?.type === 'washing') && !!localStatus" :kind="device?.type === 'washing' ? 'laundry' : 'dish'" :mode="localMode" @update:mode="v => { localMode = v; emitUpdate() }" />
            <PanelHeaterControls v-else-if="device?.type === 'heater' && !!localStatus" :value="localValue" @update:value="v => { localValue = v; emitUpdate() }" />
            <PanelSecurityControls v-else-if="device?.type === 'security' && !!localStatus" :value="localValue" @update:value="v => { localValue = v; emitUpdate() }" />

            <!-- 设备说明 -->
            <div class="dcp-section">
              <div class="dcp-section-title">📋 设备说明</div>
              <p class="dcp-desc">{{ deviceDesc }}</p>
            </div>
            <div class="dcp-section dcp-tips">
              <div class="dcp-section-title">💡 使用建议</div>
              <p class="dcp-desc">{{ deviceTips }}</p>
            </div>
          </div>

          <!-- 能源详情 -->
          <div class="dcp-body" v-else-if="device?.type === 'energy'">
            <PanelEnergyContent :device="device" />
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, readonly } from 'vue'
import PanelAcControls from './panel/PanelAcControls.vue'
import PanelLightControls from './panel/PanelLightControls.vue'
import PanelOutletControls from './panel/PanelOutletControls.vue'
import PanelTvControls from './panel/PanelTvControls.vue'
import PanelSpeakerControls from './panel/PanelSpeakerControls.vue'
import PanelVentilControls from './panel/PanelVentilControls.vue'
import PanelWasherControls from './panel/PanelWasherControls.vue'
import PanelHeaterControls from './panel/PanelHeaterControls.vue'
import PanelSecurityControls from './panel/PanelSecurityControls.vue'
import PanelEnergyContent from './panel/PanelEnergyContent.vue'

const props = defineProps({ visible: Boolean, device: Object, power: Object })
const emit = defineEmits(['close', 'update'])

const localValue = ref(null)
const localStatus = ref(null)
const localMode = ref(null)
const localFanSpeed = ref(null)
const localDoor = ref(false)

watch(() => props.device, (d) => {
  if (!d) return
  localValue.value = d.value ?? (d.type === 'ac' ? 24 : 80)
  localStatus.value = d.status ?? false
  localMode.value = d.mode ?? 'cool'
  localFanSpeed.value = d.fanSpeed ?? 'auto'
  localDoor.value = !!d.doorOpen
}, { immediate: true, deep: true })

const deviceIcon = computed(() => ({ ac:'❄️', light:'💡', tv:'📺', outlet:'🔌', sensor:'📡', security:'🔒', ventil:'🌀', washer:'🍽️', washing:'🧺', speaker:'🔊', heater:'🚿' }[props.device?.type] || '📱'))
const deviceTypeLabel = computed(() => ({ ac:'空调', light:'照明', tv:'电视', outlet:'插座', sensor:'传感器', security:'安防', ventil:'抽油烟机', washer:'洗碗机', washing:'洗衣机', speaker:'音箱', heater:'热水器' }[props.device?.type] || '智能设备'))

const deviceDesc = computed(() => ({
  ac: '变频空调，支持制冷/制热/送风多种模式，可精确调节室内温度。',
  light: '智能照明设备，支持亮度调节与场景联动。',
  outlet: '智能插座，支持远程开关控制与实时用电计量。',
  tv: '智能电视，支持 4K 超高清显示。',
  sensor: '智能传感器设备，支持实时状态监测和异常告警。',
  ventil: '抽油烟机，支持多档位调节。',
  washer: '智能洗碗机，支持多种洗涤模式。',
  washing: '滚筒洗衣机，支持标准/快洗/羊毛/脱水等程序。',
  speaker: '智能音箱，支持语音控制、蓝牙连接。',
  heater: '燃气热水器，支持精确水温调节。',
  security: '门禁控制器，支持指纹、密码、卡片多种开锁方式。',
}[props.device?.type] || '智能家居设备，支持远程控制与状态监测。'))

const deviceTips = computed(() => ({
  ac: '建议夏季设定 26°C，冬季 20°C；定期清洗滤网。',
  light: '建议根据时段设置不同亮度场景。',
  outlet: '建议定期查看用电数据，发现异常功率及时排查。',
  tv: '建议开启护眼模式，观看时间不宜过长。',
  sensor: '建议定期检查设备电量，确保传感器正常工作。',
  ventil: '建议每次烹饪后保持运行 3-5 分钟。',
  washer: '建议根据餐具数量选择合适模式。',
  washing: '建议按面料选择程序；羊毛、真丝用冷水，避免高温缩水。',
  speaker: '建议避免长时间高音量播放。',
  heater: '建议设定温度 50-55°C 既舒适又节能。',
  security: '建议定期更换密码；保持电量充足。',
}[props.device?.type] || '定期检查设备状态，如有异常请及时联系售后服务。'))

function togglePower() { localStatus.value = !localStatus.value; emitUpdate() }
function toggleDoor() { localDoor.value = !localDoor.value; emitUpdate() }
function emitUpdate() { emit('update', { ...readonly(props.device), status: localStatus.value, value: localValue.value, mode: localMode.value, fanSpeed: localFanSpeed.value, doorOpen: localDoor.value }) }
function close() { emit('close') }
</script>

<style scoped>
.dcp-wrap { position: fixed; inset: 0; z-index: 9999; pointer-events: none; display: flex; align-items: center; justify-content: flex-end; padding-right: 20px; }
.dcp-panel { width: 320px; max-height: 80vh; background: rgba(10, 18, 35, 0.82); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; display: flex; flex-direction: column; box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04); pointer-events: auto; overflow: hidden; }
.dcp-header { display: flex; align-items: center; gap: 14px; padding: 20px; background: linear-gradient(135deg, rgba(5,13,24,0.9), rgba(10,18,35,0.8)); border-bottom: 1px solid var(--border, rgba(255,255,255,0.08)); flex-shrink: 0; }
.dcp-header-icon { font-size: 36px; }
.dcp-header-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.dcp-name { font-size: 14px; font-weight: 600; color: var(--text-2, #e2e8f0); }
.dcp-online { font-size: 13px; font-weight: 600; letter-spacing: 0.3px; }
.dcp-close { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 50%; color: var(--text-2, #e2e8f0); cursor: pointer; font-size: 12px; transition: all 0.2s; }
.dcp-close:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #ef4444; }
.dcp-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.dcp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dcp-dd-item { padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; display: flex; flex-direction: column; gap: 6px; }
.dcp-dd-label { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-dd-value { font-size: 12px; color: var(--text-2, #e2e8f0); line-height: 1.5; }
.dcp-dd-value.mono { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--text, #e2e8f0); }
.dcp-section { padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; }
.dcp-section-title { font-size: 11px; font-weight: 700; color: var(--primary, #00d4aa); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.dcp-tips { background: rgba(0,212,170,0.05); border-color: rgba(0,212,170,0.15); }
.dcp-desc { font-size: 12px; color: var(--text-2, #94a3b8); line-height: 1.7; margin: 0; }
.dcp-switch-row { display: flex; align-items: center; justify-content: space-between; }

/* 供电插座断电提示 */
.dcp-power-warn {
  margin-top: 10px; font-size: 12px; line-height: 1.6; color: #fbbf24;
  background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 8px; padding: 10px 12px;
}

/* 插座的供电设备清单 */
.dcp-powered-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.dcp-powered-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; }
.dcp-powered-icon { font-size: 14px; }
.dcp-powered-name { flex: 1; font-size: 12px; color: var(--text-2, #e2e8f0); }
.dcp-powered-state { font-size: 11px; font-weight: 700; color: #64748b; }
.dcp-powered-state.on { color: #22c55e; }
.dcp-switch-label { font-size: 13px; color: var(--text-2, #e2e8f0); }
.dcp-toggle { cursor: pointer; }
.dcp-toggle-track { width: 48px; height: 26px; background: rgba(255,255,255,0.1); border-radius: 13px; position: relative; transition: background 0.3s; }
.dcp-toggle-track.on { background: rgba(0,212,170,0.25); }
.dcp-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: #64748b; border-radius: 50%; transition: all 0.3s; }
.dcp-toggle-track.on .dcp-toggle-thumb { left: 25px; background: #00d4aa; box-shadow: 0 0 10px rgba(0,212,170,0.5); }
.dcp-door-btn { padding: 7px 18px; border-radius: 999px; border: 1px solid rgba(0,212,170,0.3); background: rgba(0,212,170,0.08); color: #00d4aa; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.dcp-door-btn:hover { background: rgba(0,212,170,0.16); }
.dcp-door-btn.on { background: rgba(251,146,60,0.12); border-color: rgba(251,146,60,0.35); color: #fb923c; }
.slide-panel-enter-active, .slide-panel-leave-active { transition: opacity 0.25s ease; }
.slide-panel-enter-active .dcp-panel, .slide-panel-leave-active .dcp-panel { transition: transform 0.25s ease; }
.slide-panel-enter-from, .slide-panel-leave-to { opacity: 0; }
.slide-panel-enter-from .dcp-panel, .slide-panel-leave-to .dcp-panel { transform: translateX(100%); }
</style>
