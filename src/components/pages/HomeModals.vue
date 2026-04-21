<template>
  <!-- 环境详情弹窗 -->
  <Teleport to="body">
    <div v-if="envDetailVisible" class="env-detail-overlay" @click.self="$emit('closeEnvDetail')">
      <div class="env-detail-modal">
        <div class="env-detail-header">
          <div class="env-detail-icon">{{ envDetailItem?.icon }}</div>
          <div class="env-detail-title">
            <h3>{{ envDetailItem?.label }}</h3>
            <span class="env-detail-value" :style="{ color: envDetailItem?.color }" v-html="formatMetricValue(envDetailItem?.value)"></span>
          </div>
          <button class="env-detail-close" @click="$emit('closeEnvDetail')">✕</button>
        </div>
        <div class="env-detail-body" v-if="envDetailItem">
          <div class="env-detail-section">
            <div class="env-detail-section-title">📖 参数说明</div>
            <p>{{ envDetailMap[envDetailItem.label]?.desc }}</p>
          </div>
          <div class="env-detail-section">
            <div class="env-detail-section-title">📋 国家标准</div>
            <p>{{ envDetailMap[envDetailItem.label]?.standard }}</p>
          </div>
          <div class="env-detail-section tips">
            <div class="env-detail-section-title">💡 健康建议</div>
            <p>{{ getHealthTips(envDetailItem.label, envDetailItem.raw ?? envDetailItem.value) }}</p>
          </div>
          <div class="env-detail-bar-wrap">
            <div class="env-detail-bar-label">
              <span>当前水平</span>
              <span :style="{ color: envDetailItem.color }">{{ envDetailItem.pct }}%</span>
            </div>
            <div class="env-detail-bar">
              <div class="env-detail-bar-fill" :style="{ width: envDetailItem.pct + '%', background: envDetailItem.color }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- 健康指标详情弹窗 -->
  <Teleport to="body">
    <div v-if="healthDetailVisible" class="env-detail-overlay" @click.self="$emit('closeHealthDetail')">
      <div class="env-detail-modal">
        <div class="env-detail-header">
          <div class="env-detail-icon">{{ healthDetailItem?.icon }}</div>
          <div class="env-detail-title">
            <h3>{{ healthDetailItem?.label }}</h3>
            <span class="env-detail-value" :style="{ color: healthDetailItem?.color }" v-html="formatMetricValue(healthDetailItem?.value)"></span>
          </div>
          <button class="env-detail-close" @click="$emit('closeHealthDetail')">✕</button>
        </div>
        <div class="env-detail-body" v-if="healthDetailItem">
          <div class="env-detail-section">
            <div class="env-detail-section-title">📖 参数说明</div>
            <p>{{ healthDetailMap[healthDetailItem.label]?.desc || '暂无说明' }}</p>
          </div>
          <div class="env-detail-section">
            <div class="env-detail-section-title">📋 国家标准</div>
            <p>{{ healthDetailMap[healthDetailItem.label]?.standard || '暂无标准' }}</p>
          </div>
          <div class="env-detail-section tips">
            <div class="env-detail-section-title">💡 健康建议</div>
            <p>{{ getHealthTips(healthDetailItem.label, healthDetailItem.raw ?? healthDetailItem.value) }}</p>
          </div>
          <div class="env-detail-bar-wrap">
            <div class="env-detail-bar-label">
              <span>当前水平</span>
              <span :style="{ color: healthDetailItem.color }">{{ healthDetailItem.pct ?? 70 }}%</span>
            </div>
            <div class="env-detail-bar">
              <div class="env-detail-bar-fill" :style="{ width: (healthDetailItem.pct ?? 70) + '%', background: healthDetailItem.color }"></div>
            </div>
            <div class="env-detail-range">{{ healthDetailItem.range }}</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- 设备详情弹窗 -->
  <Teleport to="body">
    <div v-if="showDeviceDetail" class="env-detail-overlay" @click.self="$emit('closeDeviceDetail')">
      <div class="env-detail-modal device-detail-modal">
        <div class="env-detail-header">
          <div class="env-detail-icon">{{ deviceDetailItem?.icon }}</div>
          <div class="env-detail-title">
            <h3>{{ deviceDetailItem?.name }}</h3>
            <span class="env-detail-value dd-online-status" :style="{ color: deviceDetailItem?.online ? '#22c55e' : '#6b7280' }">
              {{ deviceDetailItem?.online ? '● 在线' : '● 离线' }}
            </span>
          </div>
          <button class="env-detail-close" @click="$emit('closeDeviceDetail')">✕</button>
        </div>
        <div class="env-detail-body" v-if="deviceDetailItem">
          <div class="device-detail-grid">
            <div class="dd-item">
              <span class="dd-label">设备名称</span>
              <span class="dd-value">{{ deviceDetailItem.name }}</span>
            </div>
            <div class="dd-item">
              <span class="dd-label">安装位置</span>
              <span class="dd-value">{{ deviceDetailItem.room }}</span>
            </div>
            <div class="dd-item">
              <span class="dd-label">设备厂商</span>
              <span class="dd-value">{{ deviceDetailItem.vendor }}</span>
            </div>
            <div class="dd-item">
              <span class="dd-label">设备类型</span>
              <span class="dd-value">{{ deviceTypeLabel(deviceDetailItem.type) }}</span>
            </div>
            <div class="dd-item">
              <span class="dd-label">IP 地址</span>
              <span class="dd-value mono">{{ deviceDetailItem.ip }}</span>
            </div>
            <div class="dd-item">
              <span class="dd-label">运行状态</span>
              <span class="dd-value" :style="{ color: deviceDetailItem.status ? '#22c55e' : '#94a3b8' }">
                {{ deviceDetailItem.status ? '运行中' : '已关闭' }}
              </span>
            </div>
          </div>
          <div class="env-detail-section">
            <div class="env-detail-section-title">⏱ 累计使用时长</div>
            <div class="dd-item" style="margin-top: 10px;">
              <span class="dd-label">运行时长</span>
              <span class="dd-value mono">{{ deviceUsageTime(deviceDetailItem) }}</span>
            </div>
          </div>
          <div class="env-detail-section">
            <div class="env-detail-section-title">⚡ 用电统计</div>
            <div class="device-detail-grid" style="margin-top: 10px;">
              <div class="dd-item">
                <span class="dd-label">今日用电</span>
                <span class="dd-value mono">{{ devicePowerStats(deviceDetailItem).day }} kWh</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">本周用电</span>
                <span class="dd-value mono">{{ devicePowerStats(deviceDetailItem).week }} kWh</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">本月用电</span>
                <span class="dd-value mono">{{ devicePowerStats(deviceDetailItem).month }} kWh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- 产品详情弹窗 -->
  <Teleport to="body">
    <div v-if="showProductDetail" class="env-detail-overlay" @click.self="$emit('closeProductDetail')">
      <div class="env-detail-modal product-detail-modal">
        <div class="env-detail-header">
          <div class="env-detail-icon">{{ productDetailItem?.icon }}</div>
          <div class="env-detail-title">
            <h3>{{ productDetailItem?.name }}</h3>
            <span class="product-tag" :class="{
              'tag-connected': productDetailItem?.tag === '已接入',
              'tag-pending':   productDetailItem?.tag === '待接入',
              'tag-offline':   productDetailItem?.tag === '未接入'
            }">{{ productDetailItem?.tag }}</span>
          </div>
          <button class="env-detail-close" @click="$emit('closeProductDetail')">✕</button>
        </div>
        <div class="env-detail-body" v-if="productDetailItem">
          <div class="device-detail-grid">
            <div class="dd-item">
              <span class="dd-label">产品名称</span>
              <span class="dd-value">{{ productDetailItem.name }}</span>
            </div>
            <div class="dd-item">
              <span class="dd-label">产品分类</span>
              <span class="dd-value">{{ productDetailItem.sub }}</span>
            </div>
            <div class="dd-item">
              <span class="dd-label">厂商</span>
              <span class="dd-value">{{ productDetailItem.vendor }}</span>
            </div>
            <div class="dd-item">
              <span class="dd-label">接入状态</span>
              <span class="dd-value" :style="{ color: productStatusColor(productDetailItem.tag) }">{{ productDetailItem.tag }}</span>
            </div>
          </div>
          <div class="env-detail-section" v-if="productDetailItem.tag === '已接入'">
            <div class="env-detail-section-title">✅ 已接入</div>
            <p>该产品已成功接入智能家居系统，当前运行正常。您可以通过设备管理页面对其进行实时监控与控制，也可在3D场景中直接点击对应顶牌进行操作。</p>
          </div>
          <div class="env-detail-section" v-if="productDetailItem.tag === '已接入'">
            <div class="env-detail-section-title">📊 运行数据</div>
            <div class="device-detail-grid" style="margin-top:10px">
              <div class="dd-item">
                <span class="dd-label">接入时间</span>
                <span class="dd-value mono">{{ productDetailItem.connectedAt || '2024-08-15' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">固件版本</span>
                <span class="dd-value mono">{{ productDetailItem.firmware || 'v2.1.4' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">协议类型</span>
                <span class="dd-value">{{ productDetailItem.protocol || 'Zigbee 3.0' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">信号强度</span>
                <span class="dd-value" style="color:#22c55e">{{ productDetailItem.signal || '强 (-42dBm)' }}</span>
              </div>
            </div>
          </div>
          <div class="env-detail-section" v-if="productDetailItem.tag === '待接入'">
            <div class="env-detail-section-title">⏳ 待接入</div>
            <p>该产品已完成采购，正在等待配置接入。请按照以下步骤完成接入：</p>
            <ol style="margin-top:10px; padding-left:18px; color:var(--text-2); font-size:13px; line-height:2">
              <li>确保设备已通电并处于配网模式</li>
              <li>在设备管理页点击「新增设备」→「扫描网络」</li>
              <li>选中发现的设备并点击「添加选中」</li>
              <li>完成后在设备列表中确认设备在线状态</li>
            </ol>
          </div>
          <div class="env-detail-section" v-if="productDetailItem.tag === '待接入'">
            <div class="env-detail-section-title">📋 产品规格</div>
            <div class="device-detail-grid" style="margin-top:10px">
              <div class="dd-item">
                <span class="dd-label">通信协议</span>
                <span class="dd-value">{{ productDetailItem.protocol || 'Wi-Fi / Zigbee' }}</span>
              </div>
              <div class="dd-item">
                <span class="dd-label">供电方式</span>
                <span class="dd-value">{{ productDetailItem.power || '220V AC' }}</span>
              </div>
            </div>
          </div>
          <div class="env-detail-section" v-if="productDetailItem.tag === '未接入'">
            <div class="env-detail-section-title">❌ 未接入</div>
            <p>该产品当前未接入系统，可能原因如下：</p>
            <ul style="margin-top:10px; padding-left:18px; color:var(--text-2); font-size:13px; line-height:2">
              <li>设备未通电或已损坏</li>
              <li>网关信号覆盖不足，设备超出范围</li>
              <li>固件版本不兼容，需要升级</li>
              <li>设备已被手动移除或重置</li>
            </ul>
          </div>
          <div class="env-detail-section" v-if="productDetailItem.tag === '未接入'">
            <div class="env-detail-section-title">🔧 排查建议</div>
            <p style="color:var(--text-2); font-size:13px; line-height:1.8">检查设备电源和网络连接，尝试重置设备后重新配网。如问题持续，请联系厂商 <strong style="color:var(--primary)">{{ productDetailItem.vendor }}</strong> 技术支持获取帮助。</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- 新增设备弹窗 -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="addDeviceVisible" class="env-detail-overlay" @click.self="$emit('closeAddDevice')">
        <div class="add-device-modal">

          <!-- 方式选择页 -->
          <template v-if="addStep === 'choose'">
            <div class="env-detail-header">
              <div class="env-detail-icon">📱</div>
              <div class="env-detail-title">
                <h3>新增设备</h3>
                <span style="font-size:12px;color:var(--text-3)">选择添加方式</span>
              </div>
              <button class="env-detail-close" @click="$emit('closeAddDevice')">✕</button>
            </div>
            <div class="add-choose-body">
              <div class="add-method-card" @click="$emit('setAddStep', 'manual')">
                <div class="amc-icon">✏️</div>
                <div class="amc-info">
                  <h4>自定义添加</h4>
                  <p>手动填写设备名称、位置、厂商等信息</p>
                </div>
                <span class="amc-arrow">›</span>
              </div>
              <div class="add-method-card" @click="$emit('startScan')">
                <div class="amc-icon">📡</div>
                <div class="amc-info">
                  <h4>扫描当前网络</h4>
                  <p>自动发现局域网内的智能设备</p>
                </div>
                <span class="amc-arrow">›</span>
              </div>
            </div>
          </template>

          <!-- 自定义添加表单 -->
          <template v-if="addStep === 'manual'">
            <div class="env-detail-header">
              <button class="add-back-btn" @click="$emit('setAddStep', 'choose')">‹</button>
              <div class="env-detail-icon">✏️</div>
              <div class="env-detail-title">
                <h3>自定义添加</h3>
                <span style="font-size:12px;color:var(--text-3)">填写设备信息</span>
              </div>
              <button class="env-detail-close" @click="$emit('closeAddDevice')">✕</button>
            </div>
            <div class="add-form-body">
              <div class="add-form-grid">
                <div class="add-form-item">
                  <label class="add-form-label">设备名称 <span class="required">*</span></label>
                  <input class="add-form-input" :value="newDevice.name" @input="$emit('updateNewDevice', 'name', $event.target.value)" placeholder="如：客厅空调" />
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">安装位置 <span class="required">*</span></label>
                  <select class="add-form-input" :value="newDevice.room" @change="$emit('updateNewDevice', 'room', $event.target.value)">
                    <option value="">请选择</option>
                    <option v-for="r in roomOptions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">设备厂商</label>
                  <input class="add-form-input" :value="newDevice.vendor" @input="$emit('updateNewDevice', 'vendor', $event.target.value)" placeholder="如：小米" />
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">设备类型 <span class="required">*</span></label>
                  <select class="add-form-input" :value="newDevice.type" @change="$emit('updateNewDevice', 'type', $event.target.value)">
                    <option value="">请选择</option>
                    <option v-for="t in deviceTypeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
                  </select>
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">IP 地址</label>
                  <input class="add-form-input mono" :value="newDevice.ip" @input="$emit('updateNewDevice', 'ip', $event.target.value)" placeholder="192.168.1.x" />
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">初始状态</label>
                  <div class="add-toggle-row">
                    <div class="toggle" :class="{ on: newDevice.status }" @click="$emit('updateNewDevice', 'status', !newDevice.status)">
                      <div class="toggle-track"><div class="toggle-thumb"></div></div>
                    </div>
                    <span style="font-size:12px;color:var(--text-2)">{{ newDevice.status ? '开启' : '关闭' }}</span>
                  </div>
                </div>
              </div>
              <div v-if="addFormError" class="add-form-error">{{ addFormError }}</div>
              <div class="add-form-actions">
                <button class="btn btn-ghost" @click="$emit('setAddStep', 'choose')">取消</button>
                <button class="btn btn-primary" @click="$emit('submitManualAdd')">确认添加</button>
              </div>
            </div>
          </template>

          <!-- 扫描网络 -->
          <template v-if="addStep === 'scan'">
            <div class="env-detail-header">
              <button class="add-back-btn" @click="$emit('setAddStep', 'choose')">‹</button>
              <div class="env-detail-icon">📡</div>
              <div class="env-detail-title">
                <h3>扫描当前网络</h3>
                <span style="font-size:12px;color:var(--text-3)">{{ scanStatus }}</span>
              </div>
              <button class="env-detail-close" @click="$emit('closeAddDevice')">✕</button>
            </div>
            <div class="add-scan-body">
              <!-- 扫描动画 -->
              <div v-if="scanning" class="scan-anim-wrap">
                <div class="scan-ring">
                  <div class="scan-pulse"></div>
                  <div class="scan-icon">📡</div>
                </div>
                <p class="scan-tip">正在扫描 192.168.1.0/24 网段…</p>
                <div class="scan-progress">
                  <div class="scan-progress-fill" :style="{ width: scanProgress + '%' }"></div>
                </div>
                <span class="scan-pct">{{ scanProgress }}%</span>
              </div>
              <!-- 扫描结果 -->
              <div v-else>
                <div class="scan-result-header">
                  <span class="scan-found">发现 {{ scanResults.length }} 台设备</span>
                  <button class="btn btn-ghost btn-sm" @click="$emit('startScan')">重新扫描</button>
                </div>
                <div class="scan-list">
                  <div
                    v-for="d in scanResults"
                    :key="d.ip"
                    class="scan-item"
                    :class="{ selected: scanSelected.includes(d.ip), added: d.alreadyAdded }"
                    @click="!d.alreadyAdded && $emit('toggleScanSelect', d.ip)"
                  >
                    <div class="scan-item-icon">{{ d.icon }}</div>
                    <div class="scan-item-info">
                      <span class="scan-item-name">{{ d.name }}</span>
                      <span class="scan-item-meta">{{ d.ip }} · {{ d.vendor }}</span>
                    </div>
                    <div class="scan-item-right">
                      <span v-if="d.alreadyAdded" class="scan-tag added">已添加</span>
                      <span v-else class="scan-tag pending">未添加</span>
                    </div>
                  </div>
                </div>
                <div class="add-form-actions">
                  <button class="btn btn-ghost" @click="$emit('closeAddDevice')">取消</button>
                  <button
                    class="btn btn-primary"
                    :disabled="scanSelected.length === 0"
                    @click="$emit('submitScanAdd')"
                  >添加选中 ({{ scanSelected.length }})</button>
                </div>
              </div>
            </div>
          </template>

          <!-- 添加成功 -->
          <template v-if="addStep === 'success'">
            <div class="add-success-body">
              <div class="success-icon">✅</div>
              <h3 class="success-title">添加成功</h3>
              <p class="success-desc">{{ successMsg }}</p>
              <button class="btn btn-primary" style="margin-top:16px" @click="$emit('closeAddDevice')">完成</button>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  // 环境详情
  envDetailVisible: { type: Boolean, required: true },
  envDetailItem: { type: Object, default: null },
  envDetailMap: { type: Object, required: true },
  getHealthTips: { type: Function, required: true },
  formatMetricValue: { type: Function, required: true },
  // 健康详情
  healthDetailVisible: { type: Boolean, required: true },
  healthDetailItem: { type: Object, default: null },
  healthDetailMap: { type: Object, required: true },
  // 设备详情
  showDeviceDetail: { type: Boolean, required: true },
  deviceDetailItem: { type: Object, default: null },
  // 产品详情
  showProductDetail: { type: Boolean, required: true },
  productDetailItem: { type: Object, default: null },
  // 新增设备
  addDeviceVisible: { type: Boolean, required: true },
  addStep: { type: String, required: true },
  addFormError: { type: String, required: true },
  successMsg: { type: String, required: true },
  newDevice: { type: Object, required: true },
  roomOptions: { type: Array, required: true },
  deviceTypeOptions: { type: Array, required: true },
  scanning: { type: Boolean, required: true },
  scanProgress: { type: Number, required: true },
  scanStatus: { type: String, required: true },
  scanResults: { type: Array, required: true },
  scanSelected: { type: Array, required: true },
})

defineEmits([
  'closeEnvDetail', 'closeHealthDetail', 'closeDeviceDetail', 'closeProductDetail',
  'closeAddDevice', 'setAddStep', 'startScan', 'updateNewDevice',
  'submitManualAdd', 'toggleScanSelect', 'submitScanAdd',
])

// Helper functions
function deviceTypeLabel(type) {
  const map = {
    ac: '空调', light: '照明', tv: '电视', speaker: '音箱',
    security: '安防', ventil: '新风系统', washer: '洗碗机', heater: '热水器',
  }
  return map[type] || '智能设备'
}

function deviceUsageTime(device) {
  if (!device) return '0小时'
  const seed = device.id?.charCodeAt(device.id.length - 1) || 0
  const hours = (seed % 500) + 50
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  if (days > 0) return `${days}天 ${remainingHours}小时`
  return `${hours}小时`
}

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

function productStatusColor(tag) {
  if (tag === '已接入') return '#00d4aa'
  if (tag === '待接入') return '#0ea5e9'
  if (tag === '未接入') return '#ef4444'
  return 'var(--text-2)'
}
</script>
