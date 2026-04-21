<template>
  <div v-show="visible" class="page health-page">
    <div class="health-hero">
      <div class="person-card-lg">
        <div class="person-avatar-lg">
          <span>李</span>
          <div class="avatar-ring"></div>
        </div>
        <div class="person-info-lg">
          <h3 class="person-name-lg">李小溪</h3>
          <p class="person-meta-lg">29岁 · 女 · 户主</p>
          <div class="person-tags">
            <span class="ptag ok">健康良好</span>
            <span class="ptag">已绑定设备 3 台</span>
          </div>
        </div>
        <div class="person-score">
          <div class="score-ring">
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" class="bg"/><circle cx="50" cy="50" r="45" class="fill"/></svg>
            <div class="score-val">92</div>
          </div>
          <span class="score-label">健康评分</span>
        </div>
      </div>
    </div>

    <div class="section-header">
      <h3 class="section-title">核心指标</h3>
      <span class="section-tag live"><span class="live-dot"></span>实时监测</span>
    </div>
    <div class="health-metrics">
      <div v-for="item in healthItems" :key="item.label" class="metric-card" :style="{ '--accent': item.color }" @click="$emit('openHealthDetail', item)">
        <div class="metric-header">
          <span class="metric-icon">{{ item.icon }}</span>
          <span class="metric-label">{{ item.label }}</span>
        </div>
        <div class="metric-body">
          <span class="metric-value" v-html="formatMetricValue(item.value)"></span>
          <span class="metric-trend" :class="item.trend >= 0 ? 'up' : 'dn'">{{ item.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}</span>
        </div>
        <div class="metric-bar">
          <div class="metric-bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
        </div>
        <div class="metric-range" v-html="formatMetricValue(item.range)"></div>
      </div>
    </div>

    <div class="health-charts-2col">
      <!-- 心率趋势 -->
      <div class="panel-card">
        <div class="panel-header"><h3 class="panel-title">心率趋势</h3><span class="time-range">最近 24 小时</span></div>
        <div class="heart-trend">
          <div class="heart-main">
            <div class="heart-data-row">
              <div class="heart-stat">
                <span class="stat-value" style="color:#ff6b6b">72 <span class="stat-unit">次/分</span></span>
                <span class="stat-label">平均心率</span>
              </div>
              <div class="heart-stat">
                <span class="stat-value" style="color:#22c55e">65 <span class="stat-unit">次/分</span></span>
                <span class="stat-label">最低</span>
              </div>
              <div class="heart-stat">
                <span class="stat-value" style="color:#f59e0b">98 <span class="stat-unit">次/分</span></span>
                <span class="stat-label">最高</span>
              </div>
            </div>
            <div class="heart-status">
              <span class="status-badge normal">正常</span>
              <span class="heart-compare">较昨日 +2</span>
            </div>
          </div>
          <div class="heart-wave">
            <div class="wave-header">
              <div class="wave-icon-wrap">
                <span class="wave-icon">💓</span>
              </div>
              <div class="wave-label">
                <span class="trend-tag">最近 24 小时趋势</span>
              </div>
            </div>
            <div class="wave-bars">
              <div 
                class="wave-bar" 
                v-for="(h, i) in heartRateData" 
                :key="i" 
                :style="{ height: h.value / 100 * 60 + 'px', animationDelay: i * 0.1 + 's' }"
                @mouseenter="$emit('showHeartTooltip', $event, h, i)"
                @mouseleave="$emit('hideHeartTooltip')"
              ></div>
            </div>
            <!-- 心率 Tooltip -->
            <div v-if="heartTooltip.visible" class="chart-tooltip heart-tooltip" :style="{ left: heartTooltip.x + 'px', top: heartTooltip.y + 'px' }">
              <div class="tooltip-time">{{ heartTooltip.time }}</div>
              <div class="tooltip-value"><span class="tooltip-icon">💓</span> 心率: <strong>{{ heartTooltip.value }}</strong> 次/分</div>
              <div class="tooltip-status" :class="getHeartStatus(heartTooltip.value).class">{{ getHeartStatus(heartTooltip.value).text }}</div>
            </div>
            <div class="heart-time">
              <span>0时</span><span>6时</span><span>12时</span><span>18时</span><span>24时</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 血压分布 -->
      <div class="panel-card">
        <div class="panel-header"><h3 class="panel-title">血压分布</h3><span class="time-range">本周</span></div>
        <div class="bp-display">
          <div class="bp-main">
            <div class="bp-value-group">
              <div class="bp-value sys">
                <span class="bp-num" style="font-size:24px">118</span>
                <span class="bp-unit">mmHg</span>
                <span class="bp-label">收缩压</span>
              </div>
              <span class="bp-slash">/</span>
              <div class="bp-value dia">
                <span class="bp-num" style="font-size:24px">78</span>
                <span class="bp-unit">mmHg</span>
                <span class="bp-label">舒张压</span>
              </div>
            </div>
            <div class="bp-status">
              <span class="status-badge normal">正常</span>
              <span class="bp-compare">较上周 -2</span>
            </div>
          </div>
          <div class="bp-trend">
            <div class="wave-header">
              <div class="wave-icon-wrap bp-icon">
                <span class="wave-icon">🩺</span>
              </div>
              <div class="wave-label">
                <span class="trend-tag">本周趋势</span>
              </div>
            </div>
            <div class="trend-bars">
              <div 
                v-for="(v, i) in bpWeekData" 
                :key="i" 
                class="trend-bar-wrap"
                @mouseenter="$emit('showBpTooltip', $event, v, i)"
                @mouseleave="$emit('hideBpTooltip')"
              >
                <div class="trend-bar-pair">
                  <div class="trend-bar sys" :style="{ height: v.sys / 140 * 70 + 'px' }"></div>
                  <div class="trend-bar dia" :style="{ height: v.dia / 100 * 70 + 'px' }"></div>
                </div>
                <span class="bp-day">{{ ['一','二','三','四','五','六','日'][i] }}</span>
              </div>
            </div>
            <!-- 血压 Tooltip -->
            <div v-if="bpTooltip.visible" class="chart-tooltip bp-tooltip" :style="{ left: bpTooltip.x + 'px', top: bpTooltip.y + 'px' }">
              <div class="tooltip-time">周{{ ['一','二','三','四','五','六','日'][bpTooltip.dayIndex] }}</div>
              <div class="tooltip-row"><span class="tooltip-dot sys"></span> 收缩压: <strong>{{ bpTooltip.sys }}</strong> mmHg</div>
              <div class="tooltip-row"><span class="tooltip-dot dia"></span> 舒张压: <strong>{{ bpTooltip.dia }}</strong> mmHg</div>
              <div class="tooltip-status" :class="getBpStatus(bpTooltip.sys, bpTooltip.dia).class">{{ getBpStatus(bpTooltip.sys, bpTooltip.dia).text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header"><h3 class="panel-title">健康建议</h3></div>
      <div class="health-tips">
        <div class="tip-card"><div class="tip-icon">🏃</div><div class="tip-content"><h4>运动建议</h4><p>今日步数偏少，建议晚饭后散步 30 分钟</p></div></div>
        <div class="tip-card"><div class="tip-icon">😴</div><div class="tip-content"><h4>睡眠建议</h4><p>近期睡眠质量良好，建议保持 22:30 前入睡</p></div></div>
        <div class="tip-card"><div class="tip-icon">💧</div><div class="tip-content"><h4>饮水提醒</h4><p>今日饮水量 1200ml，建议再补充 800ml</p></div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  healthItems: { type: Array, required: true },
  heartRateData: { type: Array, required: true },
  bpWeekData: { type: Array, required: true },
  heartTooltip: { type: Object, required: true },
  bpTooltip: { type: Object, required: true },
  formatMetricValue: { type: Function, required: true },
  getHeartStatus: { type: Function, required: true },
  getBpStatus: { type: Function, required: true },
})

defineEmits(['openHealthDetail', 'showHeartTooltip', 'hideHeartTooltip', 'showBpTooltip', 'hideBpTooltip'])
</script>
