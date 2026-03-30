<template>
  <Teleport to="body">
    <Transition name="modal-anim">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="ctrl-modal">
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
            <div class="ms">
              <span class="ml">电源</span>
              <div class="btoggle" :class="{ on: localStatus }" @click="toggleStatus">
                <div class="bt"><div class="bt-dot"></div></div>
              </div>
              <span class="mv" :class="{ active: localStatus }">{{ localStatus ? '开启' : '关闭' }}</span>
            </div>

            <template v-if="device?.type === 'light'">
              <div class="ms">
                <span class="ml">亮度</span>
                <span class="mv active">{{ brightness }}%</span>
              </div>
              <div class="prog-wrap">
                <div class="prog-bar">
                  <div class="prog-fill" :style="{ width: brightness + '%' }"></div>
                </div>
                <input type="range" min="0" max="100" v-model="brightness" />
              </div>
              <div class="qb">
                <button v-for="v in [25, 50, 75, 100]" :key="v" class="qb-btn" :class="{ act: brightness === v }" @click="brightness = v">{{ v }}%</button>
              </div>
            </template>

            <template v-if="device?.type === 'ac'">
              <div class="tctrl">
                <button class="tbtn" @click="temperature = Math.max(16, temperature - 1)">−</button>
                <div class="tcenter">
                  <span class="tn">{{ temperature }}</span>
                  <span class="tu">°C</span>
                </div>
                <button class="tbtn" @click="temperature = Math.min(30, temperature + 1)">+</button>
              </div>
              <div class="prog-wrap">
                <div class="prog-bar ac">
                  <div class="prog-fill" :style="{ width: ((temperature - 16) / 14 * 100) + '%' }"></div>
                </div>
                <input type="range" min="16" max="30" v-model="temperature" />
              </div>
              <div class="modes">
                <button v-for="m in ['制冷', '制热', '送风']" :key="m" class="mode-btn" :class="{ act: acMode === m }" @click="acMode = m">{{ m }}</button>
              </div>
            </template>

            <template v-if="device?.type === 'sensor'">
              <div class="sensor-status">
                <div class="ss-item">
                  <span class="ss-icon">📡</span>
                  <span class="ss-val" :class="localStatus ? 'ok' : ''">{{ localStatus ? '在线' : '离线' }}</span>
                  <span class="ss-label">状态</span>
                </div>
                <div class="ss-item">
                  <span class="ss-icon">🔔</span>
                  <span class="ss-val" :class="localStatus ? 'ok' : ''">{{ localStatus ? '正常' : '已禁用' }}</span>
                  <span class="ss-label">告警</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  device: Object
})

const emit = defineEmits(['close', 'toggle'])

const localStatus = ref(true)
const brightness = ref(80)
const temperature = ref(24)
const acMode = ref('制冷')

watch(() => props.device, (d) => {
  if (d) {
    localStatus.value = d.status
    brightness.value = d.value ?? 80
    temperature.value = d.value ?? 24
  }
}, { immediate: true })

const iconBg = computed(() => {
  const map = {
    light: 'rgba(255, 213, 79, 0.12)',
    ac: 'rgba(79, 195, 247, 0.12)',
    sensor: 'rgba(34, 197, 94, 0.12)',
  }
  return map[props.device?.type] || 'var(--primary-dim)'
})

function toggleStatus() {
  localStatus.value = !localStatus.value
  emit('toggle')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 5, 12, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.ctrl-modal {
  width: 100%;
  max-width: 360px;
  background: rgba(10, 20, 38, 0.95);
  border: 1px solid var(--border-bright);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
}

.modal-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 16px;
}

.m-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.m-info {
  flex: 1;
  min-width: 0;
}

.m-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.m-meta {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
}

.m-close {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  color: var(--text-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}

.m-close:hover {
  background: var(--danger-dim);
  color: var(--danger);
  border-color: rgba(239,68,68,0.3);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ms {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ml {
  font-size: 13px;
  color: var(--text-2);
  flex: 1;
}

.mv {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-3);
  font-family: var(--font-mono);
}

.mv.active {
  color: var(--primary);
}

.btoggle {
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
}

.btoggle.on {
  background: var(--primary-dim);
  border-color: rgba(0,212,170,0.4);
  box-shadow: 0 0 14px var(--primary-glow);
}

.bt {
  width: 100%;
  height: 100%;
  position: relative;
}

.bt-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-3);
  transition: all var(--transition);
  box-shadow: 0 1px 4px rgba(0,0,0,0.5);
}

.btoggle.on .bt-dot {
  left: calc(100% - 21px);
  background: var(--primary);
  box-shadow: 0 0 10px var(--primary-glow);
}

.prog-wrap {
  position: relative;
  height: 20px;
}

.prog-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
  pointer-events: none;
}

.prog-bar.ac .prog-fill {
  background: linear-gradient(90deg, #4fc3f7, #00d4aa);
}

.prog-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #ffd54f, #ff9800);
  transition: width 0.3s ease;
  box-shadow: 0 0 8px var(--primary-glow);
}

input[type=range] {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  width: 100%;
  opacity: 0;
  height: 20px;
  cursor: pointer;
  margin: 0;
}

.qb {
  display: flex;
  gap: 6px;
}

.qb-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  font-family: system-ui, sans-serif;
}

.qb-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.qb-btn.act {
  background: var(--primary-dim);
  border-color: rgba(0,212,170,0.3);
  color: var(--primary);
}

.tctrl {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: center;
  padding: 8px 0;
}

.tbtn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--border-bright);
  background: var(--surface);
  color: var(--text);
  font-size: 22px;
  cursor: pointer;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
}

.tbtn:hover {
  background: var(--primary-dim);
  color: var(--primary);
  border-color: rgba(0,212,170,0.3);
}

.tcenter {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.tn {
  font-family: var(--font-mono);
  font-size: 38px;
  font-weight: 700;
  color: var(--primary);
  text-shadow: 0 0 20px var(--primary-glow);
}

.tu {
  font-family: var(--font-mono);
  font-size: 18px;
  color: var(--text-2);
}

.modes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mode-btn {
  flex: 1;
  min-width: 60px;
  padding: 8px 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  font-family: system-ui, sans-serif;
  text-align: center;
}

.mode-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.mode-btn.act {
  background: var(--secondary-dim);
  border-color: rgba(14,165,233,0.3);
  color: var(--secondary);
}

.sensor-status {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ss-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px;
  text-align: center;
}

.ss-icon {
  font-size: 18px;
  margin-bottom: 6px;
  display: block;
}

.ss-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-3);
  display: block;
  margin-bottom: 2px;
}

.ss-val.ok {
  color: var(--success);
}

.ss-label {
  font-size: 11px;
  color: var(--text-3);
}

.modal-anim-enter-active {
  animation: fadeIn 0.22s ease;
}

.modal-anim-leave-active {
  animation: fadeIn 0.18s ease reverse;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
