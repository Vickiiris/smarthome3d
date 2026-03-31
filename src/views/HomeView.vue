<template>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 3L3 10v10l11 7 11-7V10L14 3z" stroke="white" stroke-width="2" fill="none"/>
            <circle cx="14" cy="14" r="4" fill="white" opacity="0.8"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-name">SMARTHOME3D</span>
          <span class="logo-sub">智能家居</span>
        </div>
      </div>
      <nav class="nav-list">
        <div v-for="item in navItems" :key="item.id" class="nav-item" :class="{ active: currentPage === item.id }" @click="switchPage(item.id)">
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.name }}</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">Z</div>
          <div class="user-text">
            <span class="user-name">Zy</span>
            <span class="user-role">管理员</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="main">
      <header class="top-bar">
        <div class="topbar-left">
          <h2 class="page-title">{{ currentTitle }}</h2>
        </div>
        <div class="topbar-right">
          <div class="time-display">
            <div class="time-main">{{ currentTime }}</div>
            <div class="time-sub">{{ currentDate }}</div>
          </div>
        </div>
      </header>

      <div class="content">

        <!-- ===== 环境监控 ===== -->
        <div v-show="currentPage === 'env'" class="page">
          <div ref="envScene" class="scene-card" :class="{ fullscreen: isFullscreen }">
            <canvas ref="canvasRef" class="three-canvas"></canvas>
            <div class="scene-overlay">
              <div class="room-tabs">
                <button class="room-tab" :class="{ active: activeRoom === 'all' }" @click="switchRoom('all')">全景</button>
                <button v-for="room in rooms" :key="room.id" class="room-tab" :class="{ active: activeRoom === room.id }" @click="switchRoom(room.id)">{{ room.name }}</button>
              </div>
              <div class="overlay-right">
                <button v-if="isFullscreen" class="fullscreen-btn" @click="toggleFullscreen" title="退出全屏">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                </button>
                <button v-else class="fullscreen-btn" @click="toggleFullscreen" title="全屏">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="section-header">
            <h3 class="section-title">室内外环境</h3>
            <span class="section-tag live"><span class="live-dot"></span>实时监测</span>
          </div>
          <div class="env-grid">
            <div v-for="item in envItems" :key="item.label" class="env-card" :style="{ '--accent': item.color }" @click="showEnvDetail(item)">
              <div class="env-icon">{{ item.icon }}</div>
              <div class="env-info">
                <span class="env-value" v-html="formatMetricValue(item.value)"></span>
                <span class="env-label">{{ item.label }}</span>
              </div>
              <div class="env-bar"><div class="env-bar-fill" :style="{ width: item.pct + '%' }"></div></div>
            </div>
          </div>

          <div class="bottom-grid">
            <!-- 设备控制 -->
            <div class="panel-card">
              <div class="panel-header">
                <h3 class="panel-title">设备控制</h3>
                <div class="panel-tabs">
                  <button class="panel-tab" :class="{ active: activeDeviceTab === 'light' }" @click="activeDeviceTab = 'light'">💡 照明</button>
                  <button class="panel-tab" :class="{ active: activeDeviceTab === 'ac' }" @click="activeDeviceTab = 'ac'">❄️ 空调</button>
                </div>
              </div>
              <div class="device-list">
                <div v-for="device in envDevices" :key="device.id" class="device-item" @click="flyToDeviceRoom(device)">
                  <div class="device-icon" :style="{ background: getDeviceColor(device) }" :class="{ 'is-on': device.status }">{{ device.icon }}</div>
                  <div class="device-info">
                    <span class="d-name">{{ device.name }}</span>
                    <span class="d-room">{{ device.room }}</span>
                  </div>
                  <div class="device-right">
                    <div class="toggle" :class="{ on: device.status }" @click.stop="toggleDevice(device)">
                      <div class="toggle-track"><div class="toggle-thumb"></div></div>
                    </div>
                    <button class="ctrl-btn" @click.stop="openDeviceControl(device)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- 安防监控 -->
            <div class="panel-card">
              <div class="panel-header">
                <h3 class="panel-title">安防监控</h3>
                <span class="section-tag ok"><span class="ok-dot"></span>全部正常</span>
              </div>
              <div class="security-grid">
                <div v-for="item in linkedSecurityItems" :key="item.label" class="security-item" :style="{ '--accent': item.color }" @click="openSecurityControl(item)">
                  <div class="s-icon" :style="{ color: item.color }">{{ item.icon }}</div>
                  <div class="s-info">
                    <span class="s-label">{{ item.label }}</span>
                    <span class="s-val" :style="{ color: item.color }">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 能源管理 ===== -->
        <div v-show="currentPage === 'energy'" class="page">
          <div ref="energyScene" class="scene-card" :class="{ fullscreen: isFullscreen }">
            <div class="scene-overlay">
              <div class="room-tabs">
                <button class="room-tab" :class="{ active: activeRoom === 'all' }" @click="switchRoom('all')">全景</button>
                <button v-for="room in rooms" :key="room.id" class="room-tab" :class="{ active: activeRoom === room.id }" @click="switchRoom(room.id)">{{ room.name }}</button>
              </div>
              <div class="overlay-right">
                <button v-if="isFullscreen" class="fullscreen-btn" @click="toggleFullscreen" title="退出全屏">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                </button>
                <button v-else class="fullscreen-btn" @click="toggleFullscreen" title="全屏">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="energy-hero">
            <div class="e-big">
              <div class="e-big-label">今日用电</div>
              <div class="e-big-val">{{ homeStore.stats.dailyEnergy ?? '8.5' }} <span class="e-unit">kWh</span></div>
              <div class="e-compare">较昨日 <span class="up">↑ 5.2%</span></div>
            </div>
            <div class="e-sub-grid">
              <div class="e-sub"><span class="e-sub-l">实时功率</span><span class="e-sub-v">{{ homeStore.stats.energyUsage.toFixed(1) }} kW</span></div>
              <div class="e-sub"><span class="e-sub-l">累计用电</span><span class="e-sub-v">{{ homeStore.stats.totalEnergy ?? 235 }} kWh</span></div>
              <div class="e-sub"><span class="e-sub-l">节能率</span><span class="e-sub-v green">{{ homeStore.stats.savingRate ?? 18 }}%</span></div>
              <div class="e-sub"><span class="e-sub-l">碳减排</span><span class="e-sub-v">{{ homeStore.stats.carbonReduction ?? 12.5 }} kg</span></div>
            </div>
          </div>
          <div class="charts-row">
            <div class="panel-card">
              <div class="panel-header"><h3 class="panel-title">用电趋势</h3><span>24小时</span></div>
              <div ref="lineChartRef" class="chart-box"></div>
            </div>
            <div class="panel-card">
              <div class="panel-header"><h3 class="panel-title">用电结构</h3></div>
              <div ref="pieChartRef" class="chart-box"></div>
            </div>
          </div>
          <div class="panel-card">
            <div class="panel-header"><h3 class="panel-title">设备能耗排行</h3></div>
            <div class="rank-list">
              <div v-for="(item, i) in energyRank" :key="item.name" class="rank-item">
                <div class="rank-num" :class="['g','s','b'][i] || ''">{{ i + 1 }}</div>
                <div class="rank-info">
                  <span class="rank-name">{{ item.name }}</span>
                  <div class="rank-bar-w"><div class="rank-bar" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                </div>
                <span class="rank-val">{{ item.val }} kWh</span>
              </div>
            </div>
          </div>
        </div>
        <!-- ===== 健康监测 ===== -->
        <div v-show="currentPage === 'health'" class="page health-page">
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
            <div v-for="item in healthItems" :key="item.label" class="metric-card" :style="{ '--accent': item.color }" @click="openHealthDetail(item)">
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
                      @mouseenter="showHeartTooltip($event, h, i)"
                      @mouseleave="hideHeartTooltip"
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
                      @mouseenter="showBpTooltip($event, v, i)"
                      @mouseleave="hideBpTooltip"
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

          <div class="panel-card">
            <div class="panel-header"><h3 class="panel-title">健康告警</h3><span class="panel-count">{{ alarms.length }} 条</span></div>
            <div class="alarm-list">
              <div v-for="a in alarms" :key="a.time" class="alarm-item">
                <span class="alarm-time">{{ a.time }}</span>
                <span class="alarm-content">{{ a.content }}</span>
                <span class="alarm-tag" :class="a.level">{{ a.levelText }}</span>
                <span class="alarm-status" :class="a.status">{{ a.statusText }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 设备管理 ===== -->
        <div v-show="currentPage === 'device'" class="page">
          <div ref="deviceScene" class="scene-card" :class="{ fullscreen: isFullscreen }">
            <div class="scene-overlay">
              <div class="room-tabs">
                <button class="room-tab" :class="{ active: activeRoom === 'all' }" @click="switchRoom('all')">全景</button>
                <button v-for="room in rooms" :key="room.id" class="room-tab" :class="{ active: activeRoom === room.id }" @click="switchRoom(room.id)">{{ room.name }}</button>
              </div>
              <div class="overlay-right">
                <button v-if="isFullscreen" class="fullscreen-btn" @click="toggleFullscreen" title="退出全屏">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                </button>
                <button v-else class="fullscreen-btn" @click="toggleFullscreen" title="全屏">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="filter-bar">
            <select class="filter-sel"><option>全部系统</option></select>
            <input class="filter-in" placeholder="搜索设备..." v-model="deviceSearch" />
            <button class="btn btn-primary">查询</button>
            <button class="btn btn-ghost" @click="deviceSearch = ''">重置</button>
            <button class="btn btn-accent" @click="openAddDevice">+ 新增</button>
          </div>
          <div class="panel-card">
            <div class="panel-header"><h3 class="panel-title">设备列表</h3><span class="panel-count">{{ filteredDevices.length }} 台</span></div>
            <table class="data-table">
              <thead><tr><th>#</th><th>设备名</th><th>位置</th><th>厂商</th><th>IP</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="(d, i) in filteredDevices" :key="d.id">
                  <td class="num">{{ i + 1 }}</td>
                  <td><span class="dot" :class="d.online ? 'on' : 'off'"></span> {{ d.name }}</td>
                  <td>{{ d.room }}</td>
                  <td>{{ d.vendor }}</td>
                  <td class="ip">{{ d.ip }}</td>
                  <td><span class="stag" :class="d.online ? 'on' : 'off'">{{ d.online ? '在线' : '离线' }}</span></td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="openDeviceControlFromTable(d)">控制</button>
                    <button class="btn btn-sm btn-ghost" @click="openDeviceDetail(d)">详情</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="pagination">
              <button class="pg-btn" disabled>&lt;</button>
              <button class="pg-btn active">1</button>
              <button class="pg-btn">2</button>
              <button class="pg-btn">&gt;</button>
            </div>
          </div>
        </div>

        <!-- ===== 产品中心 ===== -->
        <div v-show="currentPage === 'product'" class="page">
          <div ref="productScene" class="scene-card" :class="{ fullscreen: isFullscreen }">
            <div class="scene-overlay">
              <div class="room-tabs">
                <button class="room-tab" :class="{ active: activeRoom === 'all' }" @click="switchRoom('all')">全景</button>
                <button v-for="room in rooms" :key="room.id" class="room-tab" :class="{ active: activeRoom === room.id }" @click="switchRoom(room.id)">{{ room.name }}</button>
              </div>
              <div class="overlay-right">
                <button v-if="isFullscreen" class="fullscreen-btn" @click="toggleFullscreen" title="退出全屏">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                </button>
                <button v-else class="fullscreen-btn" @click="toggleFullscreen" title="全屏">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="filter-bar">
            <select class="filter-sel"><option>全部产品</option></select>
            <button class="btn btn-primary">查询</button>
            <button class="btn btn-ghost">重置</button>
          </div>
          <div class="product-grid">
            <div v-for="p in products" :key="p.id" class="product-card">
              <div class="product-icon">{{ p.icon }}</div>
              <div class="product-info">
                <h4 class="product-name">{{ p.name }}</h4>
                <p class="product-meta">{{ p.sub }} · {{ p.vendor }}</p>
                <span class="product-tag">{{ p.tag }}</span>
              </div>
              <button class="btn btn-sm btn-ghost">查看</button>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- 环境详情弹窗 -->
  <Teleport to="body">
    <div v-if="envDetailVisible" class="env-detail-overlay" @click.self="closeEnvDetail">
      <div class="env-detail-modal">
        <div class="env-detail-header">
          <div class="env-detail-icon">{{ envDetailItem?.icon }}</div>
          <div class="env-detail-title">
            <h3>{{ envDetailItem?.label }}</h3>
            <span class="env-detail-value" :style="{ color: envDetailItem?.color }" v-html="formatMetricValue(envDetailItem?.value)"></span>
          </div>
          <button class="env-detail-close" @click="closeEnvDetail">✕</button>
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
    <div v-if="healthDetailVisible" class="env-detail-overlay" @click.self="closeHealthDetail">
      <div class="env-detail-modal">
        <div class="env-detail-header">
          <div class="env-detail-icon">{{ healthDetailItem?.icon }}</div>
          <div class="env-detail-title">
            <h3>{{ healthDetailItem?.label }}</h3>
            <span class="env-detail-value" :style="{ color: healthDetailItem?.color }" v-html="formatMetricValue(healthDetailItem?.value)"></span>
          </div>
          <button class="env-detail-close" @click="closeHealthDetail">✕</button>
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

  <!-- 设备控制弹窗 -->
  <DeviceControlModal
    :visible="showControlPanel"
    :device="selectedDevice"
    @close="showControlPanel = false"
    @toggle="toggleSelectedDevice"
  />

  <!-- ===== 新增设备弹窗 ===== -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="addDeviceVisible" class="env-detail-overlay" @click.self="closeAddDevice">
        <div class="add-device-modal">

          <!-- 方式选择页 -->
          <template v-if="addStep === 'choose'">
            <div class="env-detail-header">
              <div class="env-detail-icon">📱</div>
              <div class="env-detail-title">
                <h3>新增设备</h3>
                <span style="font-size:12px;color:var(--text-3)">选择添加方式</span>
              </div>
              <button class="env-detail-close" @click="closeAddDevice">✕</button>
            </div>
            <div class="add-choose-body">
              <div class="add-method-card" @click="addStep = 'manual'">
                <div class="amc-icon">✏️</div>
                <div class="amc-info">
                  <h4>自定义添加</h4>
                  <p>手动填写设备名称、位置、厂商等信息</p>
                </div>
                <span class="amc-arrow">›</span>
              </div>
              <div class="add-method-card" @click="startScan">
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
              <button class="add-back-btn" @click="addStep = 'choose'">‹</button>
              <div class="env-detail-icon">✏️</div>
              <div class="env-detail-title">
                <h3>自定义添加</h3>
                <span style="font-size:12px;color:var(--text-3)">填写设备信息</span>
              </div>
              <button class="env-detail-close" @click="closeAddDevice">✕</button>
            </div>
            <div class="add-form-body">
              <div class="add-form-grid">
                <div class="add-form-item">
                  <label class="add-form-label">设备名称 <span class="required">*</span></label>
                  <input class="add-form-input" v-model="newDevice.name" placeholder="如：客厅空调" />
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">安装位置 <span class="required">*</span></label>
                  <select class="add-form-input" v-model="newDevice.room">
                    <option value="">请选择</option>
                    <option v-for="r in roomOptions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">设备厂商</label>
                  <input class="add-form-input" v-model="newDevice.vendor" placeholder="如：小米" />
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">设备类型 <span class="required">*</span></label>
                  <select class="add-form-input" v-model="newDevice.type">
                    <option value="">请选择</option>
                    <option v-for="t in deviceTypeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
                  </select>
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">IP 地址</label>
                  <input class="add-form-input mono" v-model="newDevice.ip" placeholder="192.168.1.x" />
                </div>
                <div class="add-form-item">
                  <label class="add-form-label">初始状态</label>
                  <div class="add-toggle-row">
                    <div class="toggle" :class="{ on: newDevice.status }" @click="newDevice.status = !newDevice.status">
                      <div class="toggle-track"><div class="toggle-thumb"></div></div>
                    </div>
                    <span style="font-size:12px;color:var(--text-2)">{{ newDevice.status ? '开启' : '关闭' }}</span>
                  </div>
                </div>
              </div>
              <div v-if="addFormError" class="add-form-error">{{ addFormError }}</div>
              <div class="add-form-actions">
                <button class="btn btn-ghost" @click="addStep = 'choose'">取消</button>
                <button class="btn btn-primary" @click="submitManualAdd">确认添加</button>
              </div>
            </div>
          </template>

          <!-- 扫描网络 -->
          <template v-if="addStep === 'scan'">
            <div class="env-detail-header">
              <button class="add-back-btn" @click="addStep = 'choose'">‹</button>
              <div class="env-detail-icon">📡</div>
              <div class="env-detail-title">
                <h3>扫描当前网络</h3>
                <span style="font-size:12px;color:var(--text-3)">{{ scanStatus }}</span>
              </div>
              <button class="env-detail-close" @click="closeAddDevice">✕</button>
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
                  <button class="btn btn-ghost btn-sm" @click="startScan">重新扫描</button>
                </div>
                <div class="scan-list">
                  <div
                    v-for="d in scanResults"
                    :key="d.ip"
                    class="scan-item"
                    :class="{ selected: scanSelected.includes(d.ip), added: d.alreadyAdded }"
                    @click="!d.alreadyAdded && toggleScanSelect(d.ip)"
                  >
                    <div class="scan-item-icon">{{ d.icon }}</div>
                    <div class="scan-item-info">
                      <span class="scan-item-name">{{ d.name }}</span>
                      <span class="scan-item-meta">{{ d.ip }} · {{ d.vendor }}</span>
                    </div>
                    <div class="scan-item-right">
                      <span v-if="d.alreadyAdded" class="scan-tag added">已添加</span>
                      <div v-else class="scan-checkbox" :class="{ checked: scanSelected.includes(d.ip) }">
                        <span v-if="scanSelected.includes(d.ip)">✓</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="add-form-actions">
                  <button class="btn btn-ghost" @click="closeAddDevice">取消</button>
                  <button
                    class="btn btn-primary"
                    :disabled="scanSelected.length === 0"
                    @click="submitScanAdd"
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
              <button class="btn btn-primary" style="margin-top:16px" @click="closeAddDevice">完成</button>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 设备详情弹窗 -->
  <Teleport to="body">
    <div v-if="showDeviceDetail" class="env-detail-overlay" @click.self="closeDeviceDetail">
      <div class="env-detail-modal device-detail-modal">
        <div class="env-detail-header">
          <div class="env-detail-icon">{{ deviceDetailItem?.icon }}</div>
          <div class="env-detail-title">
            <h3>{{ deviceDetailItem?.name }}</h3>
            <span class="env-detail-value dd-online-status" :style="{ color: deviceDetailItem?.online ? '#22c55e' : '#6b7280' }">
              {{ deviceDetailItem?.online ? '● 在线' : '● 离线' }}
            </span>
          </div>
          <button class="env-detail-close" @click="closeDeviceDetail">✕</button>
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
            <div class="env-detail-section-title">📋 设备说明</div>
            <p>{{ deviceTypeDesc(deviceDetailItem.type) }}</p>
          </div>
          <div class="env-detail-section tips">
            <div class="env-detail-section-title">💡 使用建议</div>
            <p>{{ deviceTypeTips(deviceDetailItem.type) }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useHomeStore } from '@/stores/homeStore'
import { useThreeScene } from '@/composables/useThreeScene'
import DeviceControlModal from '@/components/DeviceControlModal.vue'

const homeStore = useHomeStore()
const currentPage = ref('env')
const deviceSearch = ref('')
const activeRoom = ref('all')
const isFullscreen = ref(false)

// 环境详情弹窗
const envDetailVisible = ref(false)
const envDetailItem = ref(null)

const envDetailMap = {
  '室外温度': { desc: '室外大气温度，反映当前户外热环境。', standard: '国标 GB/T 18883：室内温度舒适范围 18~26°C（冬季 16~24°C，夏季 24~28°C）。', tips: '室外温度过高时建议减少户外活动，注意防暑。' },
  '室外湿度': { desc: '室外空气相对湿度，影响体感温度和舒适度。', standard: '国标 GB/T 18883：室内相对湿度舒适范围 30%~70%。', tips: '湿度过高易滋生霉菌，过低易引起呼吸道不适。' },
  '室内温度': { desc: '室内空气温度，直接影响居住舒适度和健康。', standard: '国标 GB/T 18883：夏季 24~28°C，冬季 18~24°C 为舒适范围。', tips: '建议保持室内温度稳定，避免与室外温差过大。' },
  '室内湿度': { desc: '室内空气相对湿度，影响人体舒适感和建筑材料。', standard: '国标 GB/T 18883：室内相对湿度 40%~70% 为舒适范围。', tips: '湿度低于 30% 时建议使用加湿器，高于 70% 时开启除湿。' },
  'CO₂浓度': { desc: '室内二氧化碳浓度，反映空气新鲜程度和通风状况。', standard: '国标 GB/T 18883：室内 CO₂ 浓度应 ≤1000ppm；>2000ppm 会引起头晕不适。', tips: '建议定期开窗通风，保持 CO₂ 浓度低于 1000ppm。' },
  'PM2.5':   { desc: '细颗粒物浓度，直径 ≤2.5μm，可深入肺部，影响呼吸健康。', standard: '国标 GB 3095：年均浓度 ≤35μg/m³（优良），日均 ≤75μg/m³。', tips: '室内 PM2.5 超标时建议开启空气净化器，减少室内燃烧活动。' },
  '光照':    { desc: '室内光照强度，影响视觉舒适度和生物节律。', standard: '国标 GB 50034：办公室照度 300~500lux，卧室 75~150lux，客厅 100~300lux。', tips: '光照不足时建议补充人工照明，避免长时间在昏暗环境中用眼。' },
  '空气质量': { desc: '综合空气质量指数（AQI），综合评估室内空气污染程度。', standard: '国标 HJ 633：AQI 0~50 优，51~100 良，101~150 轻度污染，>150 中度及以上污染。', tips: '空气质量差时建议关闭门窗，开启净化器，减少剧烈运动。' },
  '心率':     { desc: '心脏每分钟跳动的次数，反映心血管系统功能状态。', standard: '国标 WS/T 323：成人静息心率正常范围 60~100次/分；运动员可达 40~60次/分。', tips: '心率持续偏高需警惕心血管风险，建议减少咖啡因摄入，保持规律作息。' },
  '血压':     { desc: '血液对血管壁的侧压力，分为收缩压（高压）和舒张压（低压）。', standard: '国标 WS/T 324：正常血压收缩压 <120mmHg 且舒张压 <80mmHg；正常高值需关注生活方式。', tips: '血压偏高者建议减少盐分摄入，适量运动，保持充足睡眠，定期监测。' },
  '体温':     { desc: '人体核心体温，反映基础代谢和免疫状态。', standard: '国标 GBZ 189：正常人体温范围 36.0~37.2°C；超过 37.3°C 属发热。', tips: '体温异常需关注是否感染或过度劳累；建议规律作息，适度锻炼增强免疫。' },
  '血氧':     { desc: '血液中血红蛋白与氧气结合的比例，反映呼吸系统氧合能力。', standard: '国标 GB 9801：正常人血氧饱和度 ≥95%；低于 94% 需关注，低于 90% 属低氧血症。', tips: '血氧偏低建议增加室内通风，避免剧烈运动；持续偏低需就医排查呼吸系统问题。' },
  '睡眠':     { desc: '每日睡眠时长和质量，影响身体修复、记忆巩固和免疫功能。', standard: '国标 GB/T 18883：中国成人建议每日睡眠 7~9小时；儿童青少年需 8~10小时。', tips: '睡眠不足会影响认知和免疫力，建议固定作息时间，睡前减少电子设备使用。' },
}
const healthDetailMap = {
  '心率': { desc: '心脏每分钟跳动的次数，反映心血管系统功能状态。', standard: '国标 WS/T 323：成人静息心率正常范围 60~100次/分；运动员可达 40~60次/分。', tips: '心率持续偏高需警惕心血管风险，建议减少咖啡因摄入，保持规律作息。' },
  '血压': { desc: '血液对血管壁的侧压力，分为收缩压（高压）和舒张压（低压）。', standard: '国标 WS/T 324：正常血压收缩压 <120mmHg 且舒张压 <80mmHg；正常高值需关注生活方式。', tips: '血压偏高者建议减少盐分摄入，适量运动，保持充足睡眠，定期监测。' },
  '体温': { desc: '人体核心体温，反映基础代谢和免疫状态。', standard: '国标 GBZ 189：正常人体温范围 36.0~37.2°C；超过 37.3°C 属发热。', tips: '体温异常需关注是否感染或过度劳累；建议规律作息，适度锻炼增强免疫。' },
  '血氧': { desc: '血液中血红蛋白与氧气结合的比例，反映呼吸系统氧合能力。', standard: '国标 GB 9801：正常人血氧饱和度 ≥95%；低于 94% 需关注，低于 90% 属低氧血症。', tips: '血氧偏低建议增加室内通风，避免剧烈运动；持续偏低需就医排查呼吸系统问题。' },
  '睡眠': { desc: '每日睡眠时长和质量，影响身体修复、记忆巩固和免疫功能。', standard: '国标 GB/T 18883：中国成人建议每日睡眠 7~9小时；儿童青少年需 8~10小时。', tips: '睡眠不足会影响认知和免疫力，建议固定作息时间，睡前减少电子设备使用。' },
}

function showEnvDetail(item) {
  envDetailItem.value = item
  envDetailVisible.value = true
}

// 根据当前数值获取动态健康建议
function getHealthTips(label, value) {
  switch (label) {
    case '室外温度':
      if (value < 0) return '气温极低，请做好防寒保暖，避免长时间户外活动。'
      if (value < 15) return '气温较低，建议穿着厚重衣物，适度户外活动。'
      if (value <= 26) return '气温舒适，是户外活动的好时机。'
      if (value <= 32) return '气温较高，建议多喝水，避免长时间暴晒。'
      if (value <= 38) return '气温很高，请做好防暑降温，减少户外活动。'
      return '气温极高，请立即采取防暑措施，避免中暑。'
    case '室外湿度':
      if (value < 20) return '空气干燥，建议多喝水，使用加湿器。'
      if (value < 30) return '空气较干，可能引起皮肤干燥和呼吸道不适。'
      if (value <= 70) return '湿度舒适，空气质量良好。'
      if (value <= 85) return '空气潮湿，易滋生霉菌，建议开启除湿。'
      return '空气非常潮湿，请立即开启除湿设备。'
    case '室内温度':
      if (value < 16) return '室内过冷，建议调高温度，避免感冒。'
      if (value < 18) return '室内温度偏低，建议增加供暖。'
      if (value <= 26) return '室内温度舒适，保持当前设置。'
      if (value <= 30) return '室内温度偏高，建议开启空调降温。'
      return '室内温度过高，请立即开启空调。'
    case '室内湿度':
      if (value < 20) return '室内过干，建议开启加湿器，多喝水。'
      if (value < 30) return '室内较干，易引起呼吸道不适。'
      if (value <= 70) return '室内湿度舒适，保持当前环境。'
      if (value <= 85) return '室内较潮，建议开启除湿或通风。'
      return '室内过潮，请立即开启除湿设备。'
    case 'CO₂浓度':
      if (value <= 600) return '空气质量优秀，通风效果很好。'
      if (value <= 800) return '空气质量良好，可继续保持。'
      if (value <= 1000) return '空气质量一般，建议开窗通风。'
      if (value <= 1500) return '空气质量较差，请立即开窗通风。'
      return '空气质量很差，请立即打开所有窗户通风。'
    case 'PM2.5':
      if (value <= 35) return 'PM2.5 优秀，空气质量很好，可放心户外活动。'
      if (value <= 75) return 'PM2.5 良好，空气质量不错。'
      if (value <= 115) return 'PM2.5 轻度污染，敏感人群应减少户外活动。'
      if (value <= 150) return 'PM2.5 中度污染，建议开启空气净化器。'
      return 'PM2.5 重度污染，请立即开启净化器并关闭门窗。'
    case '光照':
      if (value < 50) return '光照不足，建议补充人工照明，保护视力。'
      if (value <= 100) return '光照较暗，建议增加照明。'
      if (value <= 300) return '光照舒适，保持当前照度。'
      if (value <= 500) return '光照充足，可适度降低照度。'
      return '光照过强，建议降低照度或关闭部分灯光。'
    case '空气质量':
      if (value <= 35) return '空气质量优秀，PM2.5=' + value + 'ug/m3，非常适合户外活动。'
      if (value <= 75) return '空气质量良好，PM2.5=' + value + 'ug/m3，可正常户外活动。'
      if (value <= 115) return '空气质量轻度污染，PM2.5=' + value + 'ug/m3，敏感人群应减少户外活动。'
      if (value <= 150) return '空气质量中度污染，PM2.5=' + value + 'ug/m3，建议减少户外活动。'
      return '空气质量重度污染，PM2.5=' + value + 'ug/m3，请避免户外活动。'
    case '心率':
      if (value < 60) return '心率偏低，如无不适可正常生活；运动员属正常范围。'
      if (value <= 100) return '心率正常，心血管状态良好，继续保持规律运动。'
      if (value <= 120) return '心率略高，建议休息放松，减少咖啡因摄入。'
      return '心率偏高，建议立即休息，如持续偏高请就医检查。'
    case '血压':
      if (value < 90) return '血压偏低，建议适量增加盐分和水分摄入。'
      if (value <= 120) return '血压理想，心血管健康，继续保持良好生活习惯。'
      if (value <= 139) return '血压正常偏高，建议减少盐分摄入，加强运动。'
      return '血压偏高，建议就医评估，必要时遵医嘱服药控制。'
    case '体温':
      if (value < 36.0) return '体温偏低，注意保暖，如持续偏低请就医检查。'
      if (value <= 37.2) return '体温正常，身体状态良好。'
      if (value <= 38.0) return '低热状态，建议多喝水休息，密切观察。'
      return '体温偏高，请及时就医检查是否感染。'
    case '血氧':
      if (value >= 98) return '血氧优秀，呼吸功能状态极佳。'
      if (value >= 95) return '血氧正常，呼吸系统功能良好。'
      if (value >= 90) return '血氧偏低，建议增加通风，避免剧烈运动。'
      return '血氧过低，请立即就医或吸氧治疗。'
    case '睡眠':
      if (value < 5) return '睡眠严重不足，建议调整作息，避免熬夜。'
      if (value < 7) return '睡眠不足，建议提前就寝，保证 7~9 小时睡眠。'
      if (value <= 9) return '睡眠充足，继续保持良好的作息习惯。'
      return '睡眠时间过长，可能与疲劳或健康问题有关，建议关注。'
    default:
      return '保持当前状态，定期监测健康指标。'
  }
}

function closeEnvDetail() {
  envDetailVisible.value = false
}

// 健康指标详情弹窗
const healthDetailVisible = ref(false)
const healthDetailItem = ref(null)

function openHealthDetail(item) {
  healthDetailItem.value = item
  healthDetailVisible.value = true
}

function closeHealthDetail() {
  healthDetailVisible.value = false
}

// 设备控制面板
const showControlPanel = ref(false)
const selectedDevice = ref(null)

// 场景容器 ref
const envScene     = ref(null)
const energyScene  = ref(null)
const deviceScene  = ref(null)
const productScene = ref(null)

// 主 canvas ref
const canvasRef = ref(null)
const threeScene = useThreeScene(canvasRef)
const { flyToRoom, resetView } = threeScene

let canvasPage = 'env'

// 把 canvas 移入指定页面的 scene-card
function mountCanvas(targetPage) {
  if (targetPage === canvasPage) return
  const canvas = canvasRef.value
  if (!canvas) return
  const targets= {
    env: envScene.value, energy: energyScene.value,
    device: deviceScene.value, product: productScene.value,
  }
  const target = targets[targetPage]
  if (!target) return
  if (canvas.parentElement) canvas.parentElement.removeChild(canvas)
  target.appendChild(canvas)
  canvasPage = targetPage
  nextTick(() => window.dispatchEvent(new Event('resize')))
}

const currentTime = ref('')
const currentDate = ref('')
let timeTimer
function updateTime() {
  const n = new Date()
  currentTime.value = n.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  currentDate.value = n.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
}

const navItems = [
  { id: 'env',     name: '环境监控', icon: '🌤' },
  { id: 'energy',  name: '能源管理', icon: '⚡' },
  { id: 'health',  name: '健康监测', icon: '❤' },
  { id: 'device',  name: '设备管理', icon: '📱' },
  { id: 'product', name: '产品中心', icon: '📦' },
]
const currentTitle = computed(() => navItems.find(n => n.id === currentPage.value)?.name ?? '')

function switchPage(id) {
  currentPage.value = id
  if (id === 'energy') nextTick(() => initCharts())
  if (id !== 'health') nextTick(() => mountCanvas(id))
}

const rooms = [
  { id: 'living-room', name: '客厅' },
  { id: 'bedroom',    name: '主卧' },
  { id: 'bedroom2',   name: '次卧' },
  { id: 'kitchen',    name: '厨房' },
  { id: 'bathroom',   name: '卫生间' },
]

function switchRoom(roomId) {
  activeRoom.value = roomId
  if (roomId === 'all') resetView()
  else flyToRoom(roomId)
}

function flyToDeviceRoom(device) {
  const map= {
    '客厅': 'living-room', '主卧': 'bedroom', '次卧': 'bedroom2',
    '厨房': 'kitchen', '卫生间': 'bathroom',
  }
  const id = map[device.room]
  if (id) switchRoom(id)
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  setTimeout(() => {
    threeScene.resize()
  }, 100)
}

// 环境参数颜色计算
function getEnvColor(label, value) {
  switch (label) {
    case '室外温度':
      if (value < 15) return '#4fc3f7'
      if (value < 20) return '#26c6da'
      if (value <= 26) return '#00d4aa'
      if (value <= 32) return '#ffd54f'
      if (value <= 38) return '#ff9800'
      return '#ff6b6b'
    case '室外湿度':
      if (value < 30) return '#ff6b6b'
      if (value <= 70) return '#00d4aa'
      return '#4fc3f7'
    case '室内温度':
      if (value < 16) return '#4fc3f7'
      if (value < 18) return '#26c6da'
      if (value <= 26) return '#00d4aa'
      if (value <= 30) return '#ffd54f'
      return '#ff6b6b'
    case '室内湿度':
      if (value < 30) return '#ff6b6b'
      if (value <= 70) return '#00d4aa'
      return '#4fc3f7'
    case 'CO₂浓度':
      if (value <= 600) return '#4cd964'
      if (value <= 800) return '#00d4aa'
      if (value <= 1000) return '#ffd54f'
      if (value <= 1500) return '#ff9800'
      return '#ff6b6b'
    case 'PM2.5':
      if (value <= 35) return '#4cd964'
      if (value <= 75) return '#00d4aa'
      if (value <= 115) return '#ffd54f'
      if (value <= 150) return '#ff9800'
      return '#ff6b6b'
    case '光照':
      if (value < 50) return '#ff9800'
      if (value <= 300) return '#00d4aa'
      if (value <= 500) return '#ffd54f'
      return '#ff9800'
    case '空气质量':
      if (value <= 35) return '#4cd964'
      if (value <= 75) return '#00d4aa'
      if (value <= 115) return '#ffd54f'
      return '#ff6b6b'
    default:
      return '#00d4aa'
  }
}

const envItems = computed(() => {
  const v = homeStore.stats
  return [
    { icon: '🌡', label: '室外温度',   value: `${v.outdoorTemp ?? 38}°C`,  pct: Math.min(100, Math.max(0, v.outdoorTemp ?? 38)),  color: getEnvColor('室外温度', v.outdoorTemp ?? 38),   raw: v.outdoorTemp ?? 38 },
    { icon: '💧', label: '室外湿度', value: `${v.outdoorHumidity ?? 40}%`, pct: Math.min(100, Math.max(0, v.outdoorHumidity ?? 40)), color: getEnvColor('室外湿度', v.outdoorHumidity ?? 40), raw: v.outdoorHumidity ?? 40 },
    { icon: '🏠', label: '室内温度', value: `${v.temperature ?? 24}°C`,   pct: Math.min(100, Math.max(0, v.temperature ?? 24)),   color: getEnvColor('室内温度', v.temperature ?? 24),  raw: v.temperature ?? 24 },
    { icon: '🌫', label: '室内湿度', value: `${v.humidity ?? 50}%`,       pct: Math.min(100, Math.max(0, v.humidity ?? 50)),    color: getEnvColor('室内湿度', v.humidity ?? 50),    raw: v.humidity ?? 50 },
    { icon: '🫁', label: 'CO₂浓度', value: `${v.co2 ?? 450}ppm`,        pct: Math.min(100, Math.max(0, (v.co2 ?? 450) / 20)), color: getEnvColor('CO₂浓度', v.co2 ?? 450),   raw: v.co2 ?? 450 },
    { icon: '🌿', label: 'PM2.5',   value: `${v.pm25 ?? 12}μg/m³`,      pct: Math.min(100, Math.max(0, (v.pm25 ?? 12) * 2)), color: getEnvColor('PM2.5', v.pm25 ?? 12),    raw: v.pm25 ?? 12 },
    { icon: '☀️', label: '光照',     value: `${v.light ?? 320}lux`,       pct: Math.min(100, Math.max(0, (v.light ?? 320) / 5)), color: getEnvColor('光照', v.light ?? 320),       raw: v.light ?? 320 },
    { icon: '💨', label: '空气质量', value: (v.pm25 ?? 12) <= 35 ? '优' : (v.pm25 ?? 12) <= 75 ? '良' : (v.pm25 ?? 12) <= 115 ? '轻度' : '中度', pct: (v.pm25 ?? 12) <= 35 ? 90 : (v.pm25 ?? 12) <= 75 ? 70 : (v.pm25 ?? 12) <= 115 ? 50 : 30, color: (v.pm25 ?? 12) <= 35 ? '#4cd964' : (v.pm25 ?? 12) <= 75 ? '#00d4aa' : (v.pm25 ?? 12) <= 115 ? '#ffd54f' : '#ff6b6b', raw: v.pm25 ?? 12 },
  ]
})

const securityItems = [
  { icon: '🚪', label: '门禁',     value: '已锁', cls: 'ok', color: '#22c55e', sensorIds: ['sensor-2'] },
  { icon: '💨', label: '烟雾',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['sensor-3'] },
  { icon: '🔥', label: '燃气',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['sensor-3'] },
  { icon: '📹', label: '摄像头',   value: '运行', cls: 'ok', color: '#22c55e', sensorIds: ['sensor-1'] },
  { icon: '🚨', label: '安防状态', value: '在家', cls: 'ok', color: '#22c55e', sensorIds: [] },
  { icon: '💧', label: '漏水',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['sensor-4'] },
]

// 根据传感器状态更新安防监控
const linkedSecurityItems = computed(() => {
  return securityItems.map(item => {
    if (item.sensorIds && item.sensorIds.length > 0) {
      const sensors = allDevices.value.filter(d => item.sensorIds.includes(d.id))
      const allOffline = sensors.length > 0 && sensors.every(s => !s.status)
      if (allOffline) {
        return { ...item, value: '离线', cls: 'offline', color: '#6b7280' }
      }
    }
    return item
  })
})

// 传感器类型图标
const activeDeviceTab = ref('light')

// 所有设备列表（照明 + 空调 + 监控）
const allDevices = ref([
  // 照明设备
  { id: 'light-1', name: '客厅灯开关', icon: '💡', type: 'light', status: true, room: '客厅' },
  { id: 'light-2', name: '主卧灯开关', icon: '🛋️', type: 'light', status: false, room: '主卧' },
  { id: 'light-3', name: '次卧灯开关', icon: '🌙', type: 'light', status: false, room: '次卧' },
  { id: 'light-4', name: '厨房灯开关', icon: '🍳', type: 'light', status: true, room: '厨房' },
  { id: 'light-5', name: '卫生间灯开关', icon: '🚿', type: 'light', status: false, room: '卫生间' },
  { id: 'light-6', name: '阳台灯开关', icon: '☀️', type: 'light', status: false, room: '阳台' },
  // 空调设备
  { id: 'ac-1', name: '客厅空调', icon: '❄️', type: 'ac', status: true, value: 24, room: '客厅' },
  { id: 'ac-2', name: '主卧空调', icon: '🌬️', type: 'ac', status: false, value: 26, room: '主卧' },
  { id: 'ac-3', name: '次卧空调', icon: '🌡️', type: 'ac', status: false, value: 26, room: '次卧' },
  { id: 'ac-4', name: '新风系统', icon: '🌀', type: 'ac', status: true, room: '全屋' },
  // 传感器设备
  { id: 'sensor-1', name: '人体存在感应器', icon: '👤', type: 'sensor', status: true, room: '客厅', linkedSecurity: '摄像头' },
  { id: 'sensor-2', name: '门磁感应器', icon: '🚪', type: 'sensor', status: true, room: '玄关', linkedSecurity: '门禁' },
  { id: 'sensor-3', name: '烟雾/燃气传感器', icon: '🔥', type: 'sensor', status: true, room: '厨房', linkedSecurity: '烟雾' },
  { id: 'sensor-4', name: '水淹传感器', icon: '💧', type: 'sensor', status: true, room: '卫生间', linkedSecurity: '漏水' },
])

// 根据Tab筛选设备（环境监控页面）
const envDevices = computed(() => {
  return allDevices.value.filter(d => d.type === activeDeviceTab.value)
})

// 根据设备区域和状态获取图标样式
function getDeviceColor(device) {
  const typeColors= {
    light: 'rgba(255, 213, 79, 0.15)',
    ac: 'rgba(79, 195, 247, 0.15)',
    sensor: 'rgba(34, 197, 94, 0.15)',
  }
  const roomColors= {
    '客厅': 'rgba(79, 195, 247, 0.25)',
    '主卧': 'rgba(167, 139, 250, 0.25)',
    '次卧': 'rgba(251, 146, 60, 0.25)',
    '厨房': 'rgba(239, 68, 68, 0.25)',
    '卫生间': 'rgba(6, 182, 212, 0.25)',
    '阳台': 'rgba(253, 224, 71, 0.25)',
    '玄关': 'rgba(251, 113, 133, 0.25)',
    '全屋': 'rgba(34, 197, 94, 0.25)',
  }
  const baseColor = typeColors[device.type] || 'rgba(255,255,255,0.04)'
  const roomColor = roomColors[device.room] || 'rgba(255,255,255,0.08)'
  if (device.status) return `linear-gradient(135deg, ${baseColor}, ${roomColor})`
  return 'rgba(255,255,255,0.04)'
}

function toggleDevice(device) {
  device.status = !device.status
}

// 打开设备详细控制面板
function openDeviceControl(device) {
  selectedDevice.value = {
    id: device.id,
    name: device.name,
    icon: device.icon,
    type: device.type,
    status: device.status,
    value: device.value,
    room: device.room,
  }
  showControlPanel.value = true
}

// 打开安防监控控制面板
function openSecurityControl(item) {
  // 找到关联的传感器
  const sensorIds = item.sensorIds || []
  const linkedSensors = allDevices.value.filter(d => sensorIds.includes(d.id))
  
  if (linkedSensors.length > 0) {
    // 如果有传感器，显示第一个传感器的控制面板
    const sensor = linkedSensors[0]
    selectedDevice.value = {
      id: sensor.id,
      name: item.label + '控制',
      icon: item.icon,
      type: 'sensor',
      status: sensor.status,
      value: sensor.value,
      room: sensor.room,
    }
    showControlPanel.value = true
  }
}

// 切换选中设备状态
function toggleSelectedDevice() {
  if (selectedDevice.value) {
    // 找到原设备并切换状态
    const device = allDevices.value.find(d => d.id === selectedDevice.value.id)
    if (device) {
      device.status = !device.status
      selectedDevice.value.status = device.status
    }
  }
}

// ===== 新增设备 =====
const addDeviceVisible = ref(false)
const addStep = ref('choose') // choose | manual | scan | success
const addFormError = ref('')
const successMsg = ref('')

const roomOptions = ['客厅', '主卧', '次卧', '厨房', '卫生间', '阳台', '玄关', '全屋']
const deviceTypeOptions = [
  { value: 'ac',       label: '空调' },
  { value: 'light',    label: '照明' },
  { value: 'tv',       label: '电视' },
  { value: 'speaker',  label: '音箱' },
  { value: 'ventil',   label: '新风系统' },
  { value: 'washer',   label: '洗碗机' },
  { value: 'heater',   label: '热水器' },
  { value: 'security', label: '安防设备' },
]

const newDevice = ref({ name: '', room: '', vendor: '', type: '', ip: '', status: false })

function openAddDevice() {
  addStep.value = 'choose'
  addFormError.value = ''
  newDevice.value = { name: '', room: '', vendor: '', type: '', ip: '', status: false }
  addDeviceVisible.value = true
}

function closeAddDevice() {
  addDeviceVisible.value = false
}

function submitManualAdd() {
  if (!newDevice.value.name.trim()) { addFormError.value = '请填写设备名称'; return }
  if (!newDevice.value.room) { addFormError.value = '请选择安装位置'; return }
  if (!newDevice.value.type) { addFormError.value = '请选择设备类型'; return }
  addFormError.value = ''
  const nextId = 'dev' + (deviceList.value.length + 100)
  const nextIp = newDevice.value.ip.trim() || autoNextIp()
  const iconMap = { ac:'❄️', light:'💡', tv:'📺', speaker:'🔊', security:'🔒', ventil:'🌀', washer:'🍽️', heater:'🚿' }
  deviceList.value.push({
    id: nextId,
    name: newDevice.value.name.trim(),
    room: newDevice.value.room,
    vendor: newDevice.value.vendor.trim() || '未知',
    ip: nextIp,
    online: true,
    status: newDevice.value.status,
    type: newDevice.value.type,
    value: 0,
  })
  successMsg.value = `「${newDevice.value.name}」已成功添加到设备列表`
  addStep.value = 'success'
}

function autoNextIp() {
  const ips = deviceList.value.map(d => parseInt(d.ip?.split('.').pop() || '0'))
  const max = Math.max(...ips, 10)
  return `192.168.1.${max + 1}`
}

// 扫描网络
const scanning = ref(false)
const scanProgress = ref(0)
const scanStatus = ref('准备扫描')
const scanResults = ref([])
const scanSelected = ref([])
let scanTimer = null

const mockScanDevices = [
  { ip: '192.168.1.20', name: '智能门锁 Pro', vendor: '德施曼', icon: '🔒', type: 'security' },
  { ip: '192.168.1.21', name: '卧室照明',     vendor: '飞利浦', icon: '💡', type: 'light'    },
  { ip: '192.168.1.22', name: '扫地机器人',   vendor: '石头',   icon: '🤖', type: 'sensor'   },
  { ip: '192.168.1.23', name: '智能窗帘',     vendor: '欧瑞博', icon: '🪟', type: 'ventil'   },
  { ip: '192.168.1.24', name: '厨房烟机',     vendor: '方太',   icon: '💨', type: 'ventil'   },
  { ip: '192.168.1.25', name: '浴室暖风机',   vendor: '奥普',   icon: '🌡️', type: 'heater'   },
]

function startScan() {
  addStep.value = 'scan'
  scanning.value = true
  scanProgress.value = 0
  scanStatus.value = '正在扫描网络…'
  scanResults.value = []
  scanSelected.value = []
  clearInterval(scanTimer)
  scanTimer = setInterval(() => {
    scanProgress.value = Math.min(scanProgress.value + Math.random() * 12 + 4, 100)
    if (scanProgress.value >= 100) {
      clearInterval(scanTimer)
      scanning.value = false
      scanStatus.value = '扫描完成'
      const existingIps = new Set(deviceList.value.map(d => d.ip))
      scanResults.value = mockScanDevices.map(d => ({
        ...d,
        alreadyAdded: existingIps.has(d.ip),
      }))
    }
  }, 200)
}

function toggleScanSelect(ip) {
  const idx = scanSelected.value.indexOf(ip)
  if (idx === -1) scanSelected.value.push(ip)
  else scanSelected.value.splice(idx, 1)
}

function submitScanAdd() {
  const toAdd = scanResults.value.filter(d => scanSelected.value.includes(d.ip))
  toAdd.forEach(d => {
    deviceList.value.push({
      id: 'dev' + (deviceList.value.length + 100),
      name: d.name,
      room: '未分配',
      vendor: d.vendor,
      ip: d.ip,
      online: true,
      status: false,
      type: d.type,
      value: 0,
    })
  })
  successMsg.value = `已成功添加 ${toAdd.length} 台设备`
  addStep.value = 'success'
}
function openDeviceControlFromTable(device) {
  const iconMap = {
    ac: '❄️', light: '💡', tv: '📺', speaker: '🔊',
    security: '🔒', ventil: '🌀', washer: '🍽️', heater: '🚿',
  }
  const typeMap = {
    ac: 'ac', light: 'light', tv: 'tv', speaker: 'speaker',
    security: 'sensor', ventil: 'ventil', washer: 'washer', heater: 'heater',
  }
  selectedDevice.value = {
    id: device.id,
    name: device.name,
    icon: iconMap[device.type] || '📱',
    type: typeMap[device.type] || 'sensor',
    status: device.status,
    value: device.value,
    room: device.room,
    vendor: device.vendor,
    ip: device.ip,
    online: device.online,
  }
  showControlPanel.value = true
}

// 设备详情弹窗
const showDeviceDetail = ref(false)
const deviceDetailItem = ref(null)

function openDeviceDetail(device) {
  const iconMap = {
    ac: '❄️', light: '💡', tv: '📺', speaker: '🔊',
    security: '🔒', ventil: '🌀', washer: '🍽️', heater: '🚿',
  }
  deviceDetailItem.value = {
    ...device,
    icon: iconMap[device.type] || '📱',
  }
  showDeviceDetail.value = true
}

function closeDeviceDetail() {
  showDeviceDetail.value = false
}

function deviceTypeLabel(type) {
  const map = {
    ac: '空调', light: '照明', tv: '电视', speaker: '音箱',
    security: '安防', ventil: '新风系统', washer: '洗碗机', heater: '热水器',
  }
  return map[type] || '智能设备'
}

function deviceTypeDesc(type) {
  const map = {
    ac:       '变频空调，支持制冷/制热/送风多种模式，可精确调节室内温度，配合新风系统使用效果更佳。',
    light:    '智能照明设备，支持亮度调节与场景联动，可通过语音或 App 远程控制。',
    tv:       '智能电视，支持 4K 超高清显示，内置流媒体应用，可与音箱联动实现家庭影院效果。',
    speaker:  '智能音箱，支持语音控制全屋设备，内置高品质扬声器，可播放音乐和接收通知。',
    security: '安防设备，实时监测门窗状态，异常时自动推送告警通知，保障家庭安全。',
    ventil:   '新风系统，持续引入室外新鲜空气并过滤 PM2.5，保持室内空气清新健康。',
    washer:   '智能洗碗机，支持多种洗涤程序，高温消毒杀菌，节水节能，保护餐具。',
    heater:   '燃气热水器，即开即热，恒温出水，支持预约和远程控制，安全节能。',
  }
  return map[type] || '智能家居设备，支持远程控制与状态监测。'
}

function deviceTypeTips(type) {
  const map = {
    ac:       '建议夏季设定 26°C，冬季 20°C，配合定时功能节省电费；定期清洗滤网保持制冷效果。',
    light:    '建议根据时段设置不同亮度场景，睡前调低亮度有助于改善睡眠质量。',
    tv:       '建议开启护眼模式，观看时间不宜过长；定期清理缓存保持系统流畅。',
    speaker:  '可设置唤醒词快速控制设备；建议定期更新固件以获取最新功能。',
    security: '建议定期检查设备电量，确保传感器正常工作；异常告警请及时处理。',
    ventil:   '建议全天候开启低速模式保持空气流通；每季度清洗过滤网一次。',
    washer:   '建议使用专用洗碗机洗涤剂；定期清洁过滤网和喷臂，保持洗涤效果。',
    heater:   '建议设定 50-55°C 兼顾舒适与节能；定期除垢延长使用寿命。',
  }
  return map[type] || '定期检查设备状态，如有异常请及时联系售后服务。'
}

const deviceList = ref([
  { id: 'dev1', name: '客厅空调',   room: '客厅',  vendor: '三星',   ip: '192.168.1.11', online: true,  status: true,  type: 'ac',       value: 24 },
  { id: 'dev3', name: '新风系统',   room: '全屋',  vendor: '海尔',   ip: '192.168.1.12', online: true,  status: true,  type: 'ventil',   value: 50 },
  { id: 'dev4', name: '客厅电视',   room: '客厅',  vendor: 'SONY',   ip: '192.168.1.13', online: true,  status: false, type: 'tv',       value: 30 },
  { id: 'dev5', name: '智能音箱',   room: '客厅',  vendor: '小米',   ip: '192.168.1.14', online: true,  status: true,  type: 'speaker',  value: 60 },
  { id: 'dev6', name: '门禁系统',   room: '玄关',  vendor: '德施曼', ip: '192.168.1.15', online: false, status: false, type: 'security', value: 0  },
  { id: 'dev7', name: '主卧空调',   room: '主卧',  vendor: '三星',   ip: '192.168.1.16', online: true,  status: false, type: 'ac',       value: 26 },
  { id: 'dev8', name: '次卧空调',   room: '次卧',  vendor: '三星',   ip: '192.168.1.17', online: true,  status: false, type: 'ac',       value: 26 },
  { id: 'dev9', name: '洗碗机',     room: '厨房',  vendor: '西门子', ip: '192.168.1.18', online: true,  status: false, type: 'washer',   value: 0  },
  { id: 'dev10',name: '热水器',     room: '厨房',  vendor: '林内',   ip: '192.168.1.19', online: true,  status: false, type: 'heater',   value: 55 },
])

const filteredDevices = computed(() =>
  deviceSearch.value ? deviceList.value.filter(d => d.name.includes(deviceSearch.value)) : deviceList.value
)

const healthItems = [
  { icon: '❤',  label: '心率',   value: '72次/分',   trend: 2,   color: '#ff6b6b', range: '正常: 60-100次/分',   pct: 72,  raw: 72 },
  { icon: '🩸', label: '血压',   value: '118/75mmHg', trend: 0,   color: '#8b5cf6', range: '正常: 90-139/60-89', pct: 85,  raw: 118 },
  { icon: '🌡', label: '体温',   value: '36.5°C',     trend: 0.1, color: '#ff9800', range: '正常: 36.0-37.2°C',  pct: 50,  raw: 36.5 },
  { icon: '🫁', label: '血氧',   value: '98%',        trend: 1,   color: '#4fc3f7', range: '正常: 95-100%',      pct: 98,  raw: 98 },
  { icon: '😴', label: '睡眠',   value: '7.5小时',    trend: 0,   color: '#4cd964', range: '正常: 7-9小时',      pct: 83,  raw: 7.5 },
]

// 心率趋势数据 (24小时)
const heartRateData = [
  { time: '00:00', value: 65 }, { time: '01:00', value: 62 }, { time: '02:00', value: 58 },
  { time: '03:00', value: 55 }, { time: '04:00', value: 58 }, { time: '05:00', value: 62 },
  { time: '06:00', value: 72 }, { time: '07:00', value: 68 }, { time: '08:00', value: 75 },
  { time: '09:00', value: 70 }, { time: '10:00', value: 78 }, { time: '11:00', value: 72 },
  { time: '12:00', value: 80 }, { time: '13:00', value: 74 }, { time: '14:00', value: 82 },
  { time: '15:00', value: 76 }, { time: '16:00', value: 72 }, { time: '17:00', value: 68 },
  { time: '18:00', value: 75 }, { time: '19:00', value: 71 }, { time: '20:00', value: 78 },
  { time: '21:00', value: 73 }, { time: '22:00', value: 80 }, { time: '23:00', value: 75 },
]

// 血压周数据
const bpWeekData = [
  { sys: 115, dia: 75 }, { sys: 120, dia: 78 }, { sys: 118, dia: 76 },
  { sys: 122, dia: 80 }, { sys: 116, dia: 74 }, { sys: 119, dia: 77 },
  { sys: 118, dia: 78 },
]

// 心率 Tooltip
const heartTooltip = ref({ visible: false, x: 0, y: 0, time: '', value: 0 })

function showHeartTooltip(event, data, index) {
  const rect = event.target.getBoundingClientRect()
  const parentRect = event.target.closest('.heart-wave').getBoundingClientRect()
  heartTooltip.value = {
    visible: true,
    x: rect.left - parentRect.left + rect.width / 2,
    y: rect.top - parentRect.top - 70,
    time: data.time,
    value: data.value,
  }
}

function hideHeartTooltip() {
  heartTooltip.value.visible = false
}

function getHeartStatus(value) {
  if (value < 60) return { text: '偏低', class: 'warning' }
  if (value <= 100) return { text: '正常', class: 'normal' }
  if (value <= 120) return { text: '略高', class: 'warning' }
  return { text: '偏高', class: 'danger' }
}

// 血压 Tooltip
const bpTooltip = ref({ visible: false, x: 0, y: 0, dayIndex: 0, sys: 0, dia: 0 })

function showBpTooltip(event, data, index) {
  const rect = event.target.getBoundingClientRect()
  const parentRect = event.target.closest('.bp-trend').getBoundingClientRect()
  bpTooltip.value = {
    visible: true,
    x: rect.left - parentRect.left + rect.width / 2,
    y: rect.top - parentRect.top - 90,
    dayIndex: index,
    sys: data.sys,
    dia: data.dia,
  }
}

function hideBpTooltip() {
  bpTooltip.value.visible = false
}

function getBpStatus(sys, dia) {
  if (sys < 90 || dia < 60) return { text: '偏低', class: 'warning' }
  if (sys <= 120 && dia <= 80) return { text: '理想', class: 'normal' }
  if (sys <= 139 || dia <= 89) return { text: '正常高值', class: 'warning' }
  return { text: '偏高', class: 'danger' }
}

// 格式化指标值：数字+英文单位用 mono 粗体，中文用默认字体
function formatMetricValue(str) {
  if (!str) return ''
  // 按中文字符分割，非中文部分（数字+英文单位）用 mono 字体
  return str.replace(/([^\u4e00-\u9fa5\u3000-\u303f]+)/g, '<span class="num">$1</span>')
}

const alarms = [
  { time: '08:30', content: '心率偏高提醒', level: 'warn', levelText: '警告', status: 'done',    statusText: '已处理' },
  { time: '14:15', content: '久坐提醒',     level: 'info', levelText: '提示', status: 'pending', statusText: '未处理' },
  { time: '昨日',  content: '睡眠时间不足', level: 'warn', levelText: '警告', status: 'done',    statusText: '已处理' },
  { time: '前日',  content: '饮水提醒',    level: 'info', levelText: '提示', status: 'done',    statusText: '已处理' },
]

const energyRank = [
  { name: '空调', val: 3.2, pct: 100, color: '#4fc3f7' },
  { name: '冰箱', val: 1.8, pct: 56,  color: '#81c784' },
  { name: '照明', val: 0.9, pct: 28,  color: '#ffd54f' },
  { name: '电视', val: 0.5, pct: 16,  color: '#ce93d8' },
]

const products = [
  { id: 1, icon: '❄️', name: '变频空调 KFR-35', sub: '环境控制', vendor: '美的',   tag: '一级能效' },
  { id: 2, icon: '💡', name: '智能照明套件',     sub: '照明控制', vendor: '小米',   tag: '已接入'   },
  { id: 3, icon: '🌀', name: '新风系统 FX-200',  sub: '环境控制', vendor: '海尔',   tag: '已接入'   },
  { id: 4, icon: '🔒', name: '智能门锁 S1',      sub: '安防系统', vendor: '德施曼', tag: '已接入'   },
]

const lineChartRef = ref(null)
const pieChartRef  = ref(null)
let lineChart = null, pieChart = null

async function initCharts() {
  const ec = await import('echarts')
  if (lineChartRef.value && !lineChart) {
    lineChart = ec.init(lineChartRef.value)
    lineChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['00h','04h','08h','12h','16h','20h','24h'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ data: [2.2,1.8,2.5,5.3,4.1,6.8,3.0], type: 'line', smooth: true, lineStyle: { color: '#00d4aa', width: 3 }, areaStyle: { color: new ec.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,212,170,0.25)'},{offset:1,color:'rgba(0,212,170,0)'}]) }, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#00d4aa' } }]
    })
  }
  if (pieChartRef.value && !pieChart) {
    pieChart = ec.init(pieChartRef.value)
    pieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      series: [{ type: 'pie', radius: ['50%','75%'], center: ['50%','50%'], data: [
        { value: 45, name: '空调', itemStyle: { color: '#4fc3f7' } },
        { value: 25, name: '冰箱', itemStyle: { color: '#81c784' } },
        { value: 15, name: '照明', itemStyle: { color: '#ffd54f' } },
        { value: 15, name: '其他', itemStyle: { color: '#ce93d8' } },
      ], label: { color: '#94a3b8', fontSize: 12 }, labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } }]
    })
  }
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  nextTick(() => mountCanvas('env'))
  window.addEventListener('resize', () => { lineChart?.resize(); pieChart?.resize() })
})

onUnmounted(() => {
  clearInterval(timeTimer)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.app {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.scene-card.fullscreen {
  position: fixed !important;
  top: 56px !important;
  left: 260px !important;
  width: calc(100vw - 260px) !important;
  height: calc(100vh - 56px) !important;
  z-index: 40 !important;
  border-radius: 0 !important;
  margin: 0 !important;
  border: none !important;
}

.scene-card.fullscreen .three-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}

.scene-card.fullscreen .scene-overlay {
  z-index: 41;
  background: linear-gradient(180deg, rgba(5,13,24,0.85) 0%, transparent 50%);
}

.scene-card:not(.fullscreen) {
  height: 380px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}
</style>
