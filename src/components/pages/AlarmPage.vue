<template>
  <div v-show="visible" class="page alarm-page">
    <!-- 页面顶部：Tab + 搜索 + 筛选 -->
    <div class="alarm-topbar">
      <div class="alarm-tabs">
        <button class="alarm-tab" :class="{ active: alarmTab === 'device' }" @click="$emit('switchAlarmTab', 'device')">
          <span class="tab-icon">📱</span> 设备告警
          <span class="tab-badge" v-if="deviceAlarmPendingCount">
            {{ deviceAlarmPendingCount }}
          </span>
        </button>
        <button class="alarm-tab" :class="{ active: alarmTab === 'health' }" @click="$emit('switchAlarmTab', 'health')">
          <span class="tab-icon">❤</span> 健康告警
          <span class="tab-badge" v-if="healthAlarmPendingCount">
            {{ healthAlarmPendingCount }}
          </span>
        </button>
        <button class="alarm-tab" :class="{ active: alarmTab === 'strategy' }" @click="$emit('switchAlarmTab', 'strategy')">
          <span class="tab-icon">⚙️</span> 执行策略
        </button>
      </div>
      <div class="alarm-controls">
        <input class="filter-in" :value="alarmSearch" @input="$emit('update:alarmSearch', $event.target.value)" placeholder="搜索告警内容…" />
        <select class="filter-sel" :value="alarmLevelFilter" @change="$emit('update:alarmLevelFilter', $event.target.value)">
          <option value="">全部级别</option>
          <option value="danger">严重</option>
          <option value="warn">警告</option>
          <option value="info">提示</option>
        </select>
        <select class="filter-sel" :value="alarmStatusFilter" @change="$emit('update:alarmStatusFilter', $event.target.value)">
          <option value="">全部状态</option>
          <option value="pending">未处理</option>
          <option value="done">已处理</option>
        </select>
      </div>
    </div>

    <!-- 设备告警 & 健康告警 列表 -->
    <template v-if="alarmTab === 'device' || alarmTab === 'health'">
      <!-- 统计概览 -->
      <div class="alarm-stats-row">
        <div class="panel-card alarm-stat-card danger" @click="$emit('update:alarmLevelFilter', 'danger'); $emit('update:alarmStatusFilter', '')">
          <div class="asc-icon">🚨</div>
          <div class="asc-num">{{ dangerCount }}</div>
          <div class="asc-label">严重告警</div>
        </div>
        <div class="panel-card alarm-stat-card warn" @click="$emit('update:alarmLevelFilter', 'warn'); $emit('update:alarmStatusFilter', '')">
          <div class="asc-icon">⚠️</div>
          <div class="asc-num">{{ warnCount }}</div>
          <div class="asc-label">警告</div>
        </div>
        <div class="panel-card alarm-stat-card info" @click="$emit('update:alarmLevelFilter', 'info'); $emit('update:alarmStatusFilter', '')">
          <div class="asc-icon">ℹ️</div>
          <div class="asc-num">{{ infoCount }}</div>
          <div class="asc-label">提示</div>
        </div>
        <div class="panel-card alarm-stat-card pending" @click="$emit('update:alarmStatusFilter', 'pending'); $emit('update:alarmLevelFilter', '')">
          <div class="asc-icon">⏳</div>
          <div class="asc-num">{{ pendingCount }}</div>
          <div class="asc-label">待处理</div>
        </div>
        <div class="panel-card alarm-stat-card done" @click="$emit('update:alarmStatusFilter', 'done'); $emit('update:alarmLevelFilter', '')">
          <div class="asc-icon">✅</div>
          <div class="asc-num">{{ doneCount }}</div>
          <div class="asc-label">已处理</div>
        </div>
      </div>

      <!-- 告警列表 -->
      <div class="panel-card alarm-list-panel">
        <div class="alarm-list-header">
          <h3 class="panel-title">
            {{ alarmTab === 'device' ? '设备告警记录' : '健康告警记录' }}
            <span class="panel-subtitle">共 {{ filteredAlarms.length }} 条</span>
          </h3>
          <div class="alarm-list-actions">
            <button class="btn btn-sm btn-ghost" @click="$emit('markAllAlarmsDone')" v-if="filteredAlarms.some(a => a.status === 'pending')">全部标记已处理</button>
            <button class="btn btn-sm btn-danger-outline" @click="$emit('clearDoneAlarms')">清空已处理</button>
          </div>
        </div>
        <div v-if="paginatedAlarms.length === 0" class="alarm-empty">
          <div class="alarm-empty-icon">🎉</div>
          <div class="alarm-empty-text">{{ filteredAlarms.length === 0 ? '暂无符合条件的告警' : '当前筛选条件下无告警' }}</div>
        </div>
        <div v-else class="alarm-items">
          <div
            v-for="a in paginatedAlarms"
            :key="a.id"
            class="alarm-item"
            :class="[a.level, { done: a.status === 'done' }]"
          >
            <div class="alarm-item-left">
              <div class="alarm-level-bar" :class="a.level"></div>
              <div class="alarm-item-icon-wrap" :class="a.level">
                <span>{{ a.level === 'danger' ? '🚨' : a.level === 'warn' ? '⚠️' : 'ℹ️' }}</span>
              </div>
              <div class="alarm-item-body">
                <div class="alarm-item-top">
                  <span class="alarm-item-source">
                    <span class="source-icon">{{ a.icon }}</span>
                    {{ a.source }}
                  </span>
                  <span class="alarm-item-tag" :class="a.level">{{ a.levelText }}</span>
                  <span class="alarm-item-status" :class="a.status">{{ a.statusText }}</span>
                </div>
                <div class="alarm-item-content">{{ a.content }}</div>
                <div class="alarm-item-meta">
                  <span class="alarm-item-time">📅 {{ a.time }}</span>
                  <span v-if="a.suggestion" class="alarm-item-suggestion">💡 {{ a.suggestion }}</span>
                </div>
              </div>
            </div>
            <div class="alarm-item-right">
              <button v-if="a.status === 'pending'" class="btn btn-sm btn-primary" @click="$emit('resolveAlarm', a)">处理</button>
              <span v-else class="alarm-resolved-label">✓ 已处理</span>
            </div>
          </div>
        </div>
        <!-- 分页 -->
        <div v-if="alarmTotalPages > 1" class="pagination">
          <button class="page-btn" :disabled="alarmPage === 1" @click="$emit('update:alarmPage', alarmPage - 1)">&lt;</button>
          <button
            v-for="p in visiblePages"
            :key="p"
            class="page-btn"
            :class="{ active: p === alarmPage, ellipsis: p === '…' }"
            :disabled="p === '…'"
            @click="p !== '…' && $emit('update:alarmPage', p)"
          >{{ p }}</button>
          <button class="page-btn" :disabled="alarmPage === alarmTotalPages" @click="$emit('update:alarmPage', alarmPage + 1)">&gt;</button>
          <span class="page-info">第 {{ alarmPage }} / {{ alarmTotalPages }} 页</span>
        </div>
      </div>
    </template>

    <!-- 执行策略 -->
    <template v-if="alarmTab === 'strategy'">
      <div class="strategy-intro">
        <div class="strategy-intro-icon">⚙️</div>
        <div class="strategy-intro-text">系统共配置了 <strong>{{ strategies.length }}</strong> 条自动化策略，当前 <strong>{{ activeStrategyCount }}</strong> 条处于激活状态。策略按触发条件自动执行，无需人工干预。</div>
      </div>
      <div class="strategy-list">
        <div
          v-for="s in paginatedStrategies"
          :key="s.id"
          class="panel-card strategy-card"
          :class="{ inactive: !s.active }"
          @click="$emit('openStrategyDetail', s)"
        >
          <div class="strategy-card-header">
            <div class="strategy-icon-wrap" :class="s.type">
              <span>{{ s.type === 'auto' ? '🤖' : s.type === 'timer' ? '⏰' : s.type === 'threshold' ? '📊' : '🔗' }}</span>
            </div>
            <div class="strategy-info">
              <div class="strategy-name">{{ s.name }}</div>
              <div class="strategy-type-badge" :class="s.type">{{ s.typeText }}</div>
            </div>
            <div class="strategy-toggle">
              <button class="toggle-btn" :class="{ active: s.active }" @click.stop="$emit('toggleStrategy', s)">
                <span class="toggle-knob"></span>
              </button>
              <span class="toggle-label">{{ s.active ? '已启用' : '已禁用' }}</span>
            </div>
          </div>
          <div class="strategy-desc">{{ s.description }}</div>
          <div class="strategy-footer">
            <div class="strategy-trigger">
              <span class="st-icon">🔔</span>
              <span>{{ s.trigger }}</span>
            </div>
            <div class="strategy-exec">
              <span class="st-icon">⚡</span>
              <span>{{ s.action }}</span>
            </div>
          </div>
          <div class="strategy-stats">
            <div class="ss-item">
              <span class="ss-num">{{ s.execCount }}</span>
              <span class="ss-label">执行次数</span>
            </div>
            <div class="ss-item">
              <span class="ss-num success">{{ s.successRate }}%</span>
              <span class="ss-label">成功率</span>
            </div>
            <div class="ss-item">
              <span class="ss-time">{{ s.lastExec }}</span>
              <span class="ss-label">上次执行</span>
            </div>
            <div class="ss-item">
              <span class="ss-status" :class="s.status === 'normal' ? 'success' : 'warn'">{{ s.statusText }}</span>
              <span class="ss-label">状态</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 策略分页 -->
      <div v-if="strategyTotalPages > 1" class="pagination">
        <button class="page-btn" :disabled="strategyPage === 1" @click="$emit('update:strategyPage', strategyPage - 1)">&lt;</button>
        <button v-for="p in visibleStrategyPages" :key="p" class="page-btn" :class="{ active: p === strategyPage, ellipsis: p === '…' }" :disabled="p === '…'" @click="p !== '…' && $emit('update:strategyPage', p)">{{ p }}</button>
        <button class="page-btn" :disabled="strategyPage === strategyTotalPages" @click="$emit('update:strategyPage', strategyPage + 1)">&gt;</button>
        <span class="page-info">第 {{ strategyPage }} / {{ strategyTotalPages }} 页</span>
      </div>
    </template>

    <!-- 策略详情弹窗 -->
    <div v-if="strategyDetailVisible" class="env-detail-overlay" @click.self="$emit('closeStrategyDetail')">
      <div class="env-detail-panel strategy-detail-panel">
        <div class="env-detail-header">
          <div class="detail-title-row">
            <div class="strategy-icon-wrap large" :class="selectedStrategy?.type">
              <span>{{ selectedStrategy?.type === 'auto' ? '🤖' : selectedStrategy?.type === 'timer' ? '⏰' : selectedStrategy?.type === 'threshold' ? '📊' : '🔗' }}</span>
            </div>
            <div>
              <h2 class="detail-title">{{ selectedStrategy?.name }}</h2>
              <span class="strategy-type-badge" :class="selectedStrategy?.type">{{ selectedStrategy?.typeText }}</span>
            </div>
          </div>
          <button class="env-detail-close" @click="$emit('closeStrategyDetail')">✕</button>
        </div>
        <div class="env-detail-body">
          <div class="detail-section">
            <h4 class="detail-section-title">策略描述</h4>
            <p class="detail-text">{{ selectedStrategy?.description }}</p>
          </div>
          <div class="detail-section">
            <h4 class="detail-section-title">触发条件</h4>
            <div class="detail-row">
              <span class="detail-label">类型</span>
              <span class="detail-value">{{ selectedStrategy?.triggerTypeText }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">条件</span>
              <span class="detail-value">{{ selectedStrategy?.trigger }}</span>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="detail-section-title">执行动作</h4>
            <div class="detail-row">
              <span class="detail-label">设备</span>
              <span class="detail-value">{{ selectedStrategy?.targetDevice }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">动作</span>
              <span class="detail-value">{{ selectedStrategy?.action }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">延迟</span>
              <span class="detail-value">{{ selectedStrategy?.delay }} 秒后执行</span>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="detail-section-title">运行统计</h4>
            <div class="detail-row">
              <span class="detail-label">执行次数</span>
              <span class="detail-value">{{ selectedStrategy?.execCount }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">成功率</span>
              <span class="detail-value success">{{ selectedStrategy?.successRate }}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">上次执行</span>
              <span class="detail-value">{{ selectedStrategy?.lastExec }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">当前状态</span>
              <span class="detail-value" :class="selectedStrategy?.status === 'normal' ? 'success' : 'warn'">{{ selectedStrategy?.statusText }}</span>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="detail-section-title">启用 / 禁用</h4>
            <div class="detail-row">
              <span class="detail-label">状态</span>
              <div class="detail-value">
                <button class="toggle-btn" :class="{ active: selectedStrategy?.active }" @click="$emit('toggleStrategy', selectedStrategy)">
                  <span class="toggle-knob"></span>
                </button>
                <span class="toggle-label" style="margin-left:8px">{{ selectedStrategy?.active ? '已启用' : '已禁用' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
  alarmTab: { type: String, required: true },
  alarmSearch: { type: String, required: true },
  alarmLevelFilter: { type: String, required: true },
  alarmStatusFilter: { type: String, required: true },
  alarmPage: { type: Number, required: true },
  strategyPage: { type: Number, required: true },
  strategyDetailVisible: { type: Boolean, required: true },
  selectedStrategy: { type: Object, default: null },
  allAlarms: { type: Array, required: true },
  strategies: { type: Array, required: true },
  filteredAlarms: { type: Array, required: true },
  paginatedAlarms: { type: Array, required: true },
  alarmTotalPages: { type: Number, required: true },
  visiblePages: { type: Array, required: true },
  paginatedStrategies: { type: Array, required: true },
  strategyTotalPages: { type: Number, required: true },
  visibleStrategyPages: { type: Array, required: true },
})

defineEmits([
  'switchAlarmTab', 'update:alarmSearch', 'update:alarmLevelFilter', 'update:alarmStatusFilter',
  'update:alarmPage', 'update:strategyPage', 'resolveAlarm', 'markAllAlarmsDone', 'clearDoneAlarms',
  'openStrategyDetail', 'closeStrategyDetail', 'toggleStrategy',
])

const deviceAlarmPendingCount = computed(() => props.allAlarms.filter(a => a.type === 'device' && a.status === 'pending').length)
const healthAlarmPendingCount = computed(() => props.allAlarms.filter(a => a.type === 'health' && a.status === 'pending').length)
const dangerCount = computed(() => props.allAlarms.filter(a => a.type === props.alarmTab && a.level === 'danger').length)
const warnCount = computed(() => props.allAlarms.filter(a => a.type === props.alarmTab && a.level === 'warn').length)
const infoCount = computed(() => props.allAlarms.filter(a => a.type === props.alarmTab && a.level === 'info').length)
const pendingCount = computed(() => props.allAlarms.filter(a => a.type === props.alarmTab && a.status === 'pending').length)
const doneCount = computed(() => props.allAlarms.filter(a => a.type === props.alarmTab && a.status === 'done').length)
const activeStrategyCount = computed(() => props.strategies.filter(s => s.active).length)
</script>
