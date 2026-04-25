<template>
  <Teleport to="body">
    <Transition name="modal-anim">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="ctrl-modal" :class="{ 'ctrl-modal--wide': energy.isWideModal.value }">
          <div class="modal-top" :style="{ background: iconBg }">
            <div class="m-icon">{{ device?.icon }}</div>
            <div class="m-info">
              <h3 class="m-name">{{ device?.name }}</h3>
              <p class="m-meta">{{ device?.room }}</p>
            </div>
            <button class="m-close" @click="$emit('close')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 电源开关（能源详情不需要） -->
            <div class="ms" v-if="device?.type !== 'energy'">
              <span class="ml">电源</span>
              <div class="btoggle" :class="{ on: localStatus }" @click="toggleStatus">
                <div class="bt"><div class="bt-dot"></div></div>
              </div>
              <span class="mv" :class="{ active: localStatus }">{{ localStatus ? '开启' : '关闭' }}</span>
            </div>

            <LightControls v-if="device?.type === 'light'" :value="device?.value" @update="(v) => emit('update', { ...device, value: v })" />
            <AcControls v-if="device?.type === 'ac'" :value="device?.value" :mode="device?.mode" :fanSpeed="device?.fanSpeed" @update="(v) => emit('update', { ...device, ...v })" />
            <SensorControls v-if="device?.type === 'sensor'" :status="localStatus" />
            <TvControls v-if="device?.type === 'tv'" :value="device?.value" :mode="device?.mode" @update="(v) => emit('update', { ...device, ...v })" />
            <SpeakerControls v-if="device?.type === 'speaker'" :value="device?.value" @update="(v) => emit('update', { ...device, value: v })" />
            <VentilControls v-if="device?.type === 'ventil'" :value="device?.value" :mode="device?.mode" @update="(v) => emit('update', { ...device, ...v })" />
            <WasherControls v-if="device?.type === 'washer'" :status="localStatus" :mode="device?.mode" @update="(v) => emit('update', { ...device, mode: v })" />
            <HeaterControls v-if="device?.type === 'heater'" :value="device?.value" :mode="device?.mode" @update="(v) => emit('update', { ...device, ...v })" />
            <EnergyDetail v-if="device?.type === 'energy'" :device="device" :chartData="chartData" :energyLiveData="energyLiveData" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, readonly, toRef } from 'vue'
import { useEnergyDetail } from '../composables/useEnergyDetail.js'
import LightControls from './controls/LightControls.vue'
import AcControls from './controls/AcControls.vue'
import SensorControls from './controls/SensorControls.vue'
import TvControls from './controls/TvControls.vue'
import SpeakerControls from './controls/SpeakerControls.vue'
import VentilControls from './controls/VentilControls.vue'
import WasherControls from './controls/WasherControls.vue'
import HeaterControls from './controls/HeaterControls.vue'
import EnergyDetail from './controls/EnergyDetail.vue'

const props = defineProps({
  visible: Boolean,
  device: Object,
  chartData: Object,
  energyLiveData: Object
})

const emit = defineEmits(['close', 'toggle', 'update'])

const localStatus = ref(true)

watch(() => props.device, (d) => {
  if (d) localStatus.value = d.status
}, { immediate: true })

const deviceRef = toRef(props, 'device')
const chartDataRef = toRef(props, 'chartData')
const energyLiveDataRef = toRef(props, 'energyLiveData')
const energy = useEnergyDetail(deviceRef, chartDataRef, energyLiveDataRef)

const iconBg = computed(() => {
  const map = {
    light: 'rgba(255, 213, 79, 0.12)', ac: 'rgba(79, 195, 247, 0.12)',
    sensor: 'rgba(34, 197, 94, 0.12)', tv: 'rgba(167, 139, 250, 0.12)',
    speaker: 'rgba(251, 146, 60, 0.12)', ventil: 'rgba(0, 212, 170, 0.12)',
    washer: 'rgba(14, 165, 233, 0.12)', heater: 'rgba(239, 68, 68, 0.12)',
  }
  return map[props.device?.type] || 'var(--primary-dim)'
})

function toggleStatus() {
  localStatus.value = !localStatus.value
  emit('toggle', localStatus.value)
  emit('update', { ...readonly(props.device), status: localStatus.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(2, 5, 12, 0.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.ctrl-modal {
  width: 100%; max-width: 360px;
  background: rgba(10, 20, 38, 0.95);
  border: 1px solid var(--border-bright); border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
}
.ctrl-modal--wide { max-width: 720px; overflow-y: auto; max-height: 85vh; }
.modal-top { display: flex; align-items: center; gap: 14px; padding: 20px 20px 16px; }
.m-icon {
  width: 44px; height: 44px; border-radius: 10px;
  background: var(--surface); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.m-info { flex: 1; min-width: 0; }
.m-name { font-size: 15px; font-weight: 700; color: var(--text); }
.m-meta { font-size: 11px; color: var(--text-3); margin-top: 2px; }
.m-close {
  width: 30px; height: 30px; border-radius: 6px;
  background: var(--surface-hover); border: 1px solid var(--border);
  color: var(--text-3); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--transition); flex-shrink: 0;
}
.m-close:hover { background: var(--danger-dim); color: var(--danger); border-color: rgba(239,68,68,0.3); }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* 电源开关 */
.ms { display: flex; align-items: center; gap: 10px; }
.ml { font-size: 13px; color: var(--text-2); flex: 1; }
.mv { font-size: 14px; font-weight: 600; color: var(--text-3); font-family: var(--font-mono); }
.mv.active { color: var(--primary); }
.btoggle {
  width: 48px; height: 26px; border-radius: 13px;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer; transition: all var(--transition); position: relative;
}
.btoggle.on { background: var(--primary-dim); border-color: rgba(0,212,170,0.4); box-shadow: 0 0 14px var(--primary-glow); }
.bt { width: 100%; height: 100%; position: relative; }
.bt-dot {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--text-3); transition: all var(--transition);
  box-shadow: 0 1px 4px rgba(0,0,0,0.5);
}
.btoggle.on .bt-dot { left: calc(100% - 21px); background: var(--primary); box-shadow: 0 0 10px var(--primary-glow); }

/* 弹窗过渡动画 */
.modal-anim-enter-active { animation: fadeIn 0.22s ease; }
.modal-anim-leave-active { animation: fadeIn 0.18s ease reverse; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
