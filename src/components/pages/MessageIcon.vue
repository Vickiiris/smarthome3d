<template>
  <div class="message-icon-wrapper" @click="handleClick" @mouseenter="showPreview = true" @mouseleave="showPreview = false">
    <div class="message-icon" :class="{ 'has-unread': unreadCount > 0 }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </div>

    <!-- Hover Preview -->
    <Transition name="preview-fade">
      <div v-if="showPreview && previewAlarms.length > 0" class="alarm-preview">
        <div class="preview-header">
          <span class="preview-title">告警预览</span>
          <span class="preview-count">{{ unreadCount }} 条未处理</span>
        </div>
        <div class="preview-list">
          <div
            v-for="alarm in previewAlarms"
            :key="alarm.id"
            class="preview-item"
            :class="'level-' + alarm.level"
          >
            <span class="level-bar"></span>
            <span class="preview-icon">{{ alarm.icon }}</span>
            <div class="preview-content">
              <div class="preview-text">{{ alarm.content }}</div>
              <div class="preview-meta">
                <span class="preview-source">{{ alarm.source }}</span>
                <span class="level-tag" :class="'tag-' + alarm.level">{{ alarm.levelText || alarm.level }}</span>
                <span class="preview-time">{{ alarm.time }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="preview-footer" @click.stop="handleClick">
          <span>查看全部告警</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </div>
      </div>

      <!-- 无告警时显示提示 -->
      <div v-else-if="showPreview && unreadCount === 0" class="alarm-preview empty-preview">
        <div class="empty-icon">✅</div>
        <div class="empty-text">暂无未处理告警</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  allAlarms: { type: Array, default: () => [] },
})

const emit = defineEmits(['navigate'])

const showPreview = ref(false)

// 所有未处理的告警
const pendingAlarms = computed(() => {
  return props.allAlarms.filter(a => a.status === 'pending')
})

// 总数量
const unreadCount = computed(() => pendingAlarms.value.length)

// 预览：按严重程度排序（danger > warn > info），取最紧急的5条
const previewAlarms = computed(() => {
  // 明确的优先级映射
  const getPriority = (level) => {
    if (level === 'danger') return 0
    if (level === 'warn') return 1
    if (level === 'info') return 2
    return 99 // 未知级别排最后
  }
  const sorted = pendingAlarms.value.slice().sort((a, b) => {
    return getPriority(a.level) - getPriority(b.level)
  })
  return sorted.slice(0, 5)
})

function handleClick() {
  showPreview.value = false
  emit('navigate')
}
</script>

<style scoped>
.message-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.message-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-2);
}

.message-icon:hover {
  background: var(--surface-hover);
  color: var(--text);
  border-color: rgba(0, 212, 170, 0.3);
}

.message-icon.has-unread {
  color: var(--primary);
}

.message-icon svg {
  width: 20px;
  height: 20px;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Preview Popup */
.alarm-preview {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  background: rgba(10, 20, 38, 0.98);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(0, 212, 170, 0.08);
  border-bottom: 1px solid var(--border);
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.preview-count {
  font-size: 11px;
  color: var(--primary);
}

.preview-list {
  max-height: 280px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  padding-left: 10px;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
  position: relative;
}

.preview-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.preview-item:last-child {
  border-bottom: none;
}

/* 左侧颜色条 */
.level-bar {
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 2px;
  flex-shrink: 0;
}

.level-danger .level-bar { background: #ef4444; }
.level-warn .level-bar { background: #f59e0b; }
.level-info .level-bar { background: #3b82f6; }

/* 文字颜色区分 */
.level-danger .preview-text { color: #fca5a5; font-weight: 500; }
.level-warn .preview-text { color: #fcd34d; }
.level-info .preview-text { color: #93c5fd; }

.preview-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border-radius: 6px;
  font-size: 14px;
  flex-shrink: 0;
}

.preview-item.level-danger .preview-icon {
  background: rgba(239, 68, 68, 0.15);
}

.preview-item.level-warn .preview-icon {
  background: rgba(245, 158, 11, 0.15);
}

.preview-item.level-info .preview-icon {
  background: rgba(59, 130, 246, 0.15);
}

.preview-content {
  flex: 1;
  min-width: 0;
}

.preview-text {
  font-size: 12px;
  color: var(--text);
  line-height: 1.4;
  margin-bottom: 4px;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: var(--text-3);
}

.preview-source {
  color: var(--primary);
}

/* 级别标签 */
.level-tag {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-danger { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.tag-warn { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.tag-info { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: rgba(0, 212, 170, 0.05);
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
  transition: background var(--transition);
}

.preview-footer:hover {
  background: rgba(0, 212, 170, 0.1);
}

.preview-footer svg {
  width: 14px;
  height: 14px;
}

/* Empty State */
.empty-preview {
  padding: 24px;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 13px;
  color: var(--text-3);
}

/* Transition */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: all 0.2s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
