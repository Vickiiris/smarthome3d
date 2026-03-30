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
                <span class="env-value">{{ item.value }}</span>
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
                  <button class="panel-tab" :class="{ active: activeDeviceTab === 'sensor' }" @click="activeDeviceTab = 'sensor'">📡 传感器</button>
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
                <div v-for="item in linkedSecurityItems" :key="item.label" class="security-item" :style="{ '--accent': item.color }">
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
            <div v-for="item in healthItems" :key="item.label" class="metric-card" :style="{ '--accent': item.color }">
              <div class="metric-header">
                <span class="metric-icon">{{ item.icon }}</span>
                <span class="metric-label">{{ item.label }}</span>
              </div>
              <div class="metric-body">
                <span class="metric-value">{{ item.value }}</span>
                <span class="metric-trend" :class="item.trend >= 0 ? 'up' : 'dn'">{{ item.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}</span>
              </div>
              <div class="metric-bar">
                <div class="metric-bar-fill" :style="{ width: '70%', background: item.color }"></div>
              </div>
              <div class="metric-range">{{ item.range }}</div>
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
                    <div class="wave-bar" v-for="(h, i) in [65,72,68,75,70,78,72,80,74,82,76,72,68,75,71,78,73,80,75,72]" :key="i" :style="{ height: h / 100 * 60 + 'px', animationDelay: i * 0.1 + 's' }"></div>
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
                    <div v-for="(v, i) in [115,120,118,122,116,119,118]" :key="i" class="trend-bar-wrap">
                      <div class="trend-bar-pair">
                        <div class="trend-bar sys" :style="{ height: v / 130 * 60 + 'px' }"></div>
                        <div class="trend-bar dia" :style="{ height: (v - 40) / 90 * 60 + 'px' }"></div>
                      </div>
                      <span class="bp-day">{{ ['一','二','三','四','五','六','日'][i] }}</span>
                    </div>
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
            <button class="btn btn-accent">+ 新增</button>
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
                    <button class="btn btn-sm btn-ghost">详情</button>
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
            <span class="env-detail-value" :style="{ color: envDetailItem?.color }">{{ envDetailItem?.value }}</span>
          </div>
          <button class="env-detail-close" @click="closeEnvDetail">✕</button>
        </div>
        <div class="env-detail-body" v-if="envDetailItem && envDetailMap[envDetailItem.label]">
          <div class="env-detail-section">
            <div class="env-detail-section-title">📖 参数说明</div>
            <p>{{ envDetailMap[envDetailItem.label].desc }}</p>
          </div>
          <div class="env-detail-section">
            <div class="env-detail-section-title">📋 国家标准</div>
            <p>{{ envDetailMap[envDetailItem.label].standard }}</p>
          </div>
          <div class="env-detail-section tips">
            <div class="env-detail-section-title">💡 健康建议</div>
            <p>{{ envDetailMap[envDetailItem.label].tips }}</p>
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

  <!-- 设备控制弹窗 -->
  <DeviceControlModal
    :visible="showControlPanel"
    :device="selectedDevice"
    @close="showControlPanel = false"
    @toggle="toggleSelectedDevice"
  />
</template>

<script setup lang="ts">
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
const envDetailItem = ref<any>(null)

const envDetailMap: Record<string, { desc: string; standard: string; tips: string }> = {
  '室外温度': { desc: '室外大气温度，反映当前户外热环境。', standard: '国标 GB/T 18883：室内温度舒适范围 18~26°C（冬季 16~24°C，夏季 24~28°C）。', tips: '室外温度过高时建议减少户外活动，注意防暑。' },
  '室外湿度': { desc: '室外空气相对湿度，影响体感温度和舒适度。', standard: '国标 GB/T 18883：室内相对湿度舒适范围 30%~70%。', tips: '湿度过高易滋生霉菌，过低易引起呼吸道不适。' },
  '室内温度': { desc: '室内空气温度，直接影响居住舒适度和健康。', standard: '国标 GB/T 18883：夏季 24~28°C，冬季 18~24°C 为舒适范围。', tips: '建议保持室内温度稳定，避免与室外温差过大。' },
  '室内湿度': { desc: '室内空气相对湿度，影响人体舒适感和建筑材料。', standard: '国标 GB/T 18883：室内相对湿度 40%~70% 为舒适范围。', tips: '湿度低于 30% 时建议使用加湿器，高于 70% 时开启除湿。' },
  'CO₂浓度': { desc: '室内二氧化碳浓度，反映空气新鲜程度和通风状况。', standard: '国标 GB/T 18883：室内 CO₂ 浓度应 ≤1000ppm；>2000ppm 会引起头晕不适。', tips: '建议定期开窗通风，保持 CO₂ 浓度低于 1000ppm。' },
  'PM2.5':   { desc: '细颗粒物浓度，直径 ≤2.5μm，可深入肺部，影响呼吸健康。', standard: '国标 GB 3095：年均浓度 ≤35μg/m³（优良），日均 ≤75μg/m³。', tips: '室内 PM2.5 超标时建议开启空气净化器，减少室内燃烧活动。' },
  '光照':    { desc: '室内光照强度，影响视觉舒适度和生物节律。', standard: '国标 GB 50034：办公室照度 300~500lux，卧室 75~150lux，客厅 100~300lux。', tips: '光照不足时建议补充人工照明，避免长时间在昏暗环境中用眼。' },
  '空气质量': { desc: '综合空气质量指数（AQI），综合评估室内空气污染程度。', standard: '国标 HJ 633：AQI 0~50 优，51~100 良，101~150 轻度污染，>150 中度及以上污染。', tips: '空气质量差时建议关闭门窗，开启净化器，减少剧烈运动。' },
}

function showEnvDetail(item: any) {
  envDetailItem.value = item
  envDetailVisible.value = true
}
function closeEnvDetail() {
  envDetailVisible.value = false
}

// 设备控制面板
const showControlPanel = ref(false)
const selectedDevice = ref<any>(null)

// 场景容器 ref
const envScene     = ref<HTMLDivElement | null>(null)
const energyScene  = ref<HTMLDivElement | null>(null)
const deviceScene  = ref<HTMLDivElement | null>(null)
const productScene = ref<HTMLDivElement | null>(null)

// 主 canvas ref
const canvasRef = ref<HTMLCanvasElement | null>(null)
const threeScene = useThreeScene(canvasRef)
const { flyToRoom, resetView } = threeScene

let canvasPage = 'env'

// 把 canvas 移入指定页面的 scene-card
function mountCanvas(targetPage: string) {
  if (targetPage === canvasPage) return
  const canvas = canvasRef.value
  if (!canvas) return
  const targets: Record<string, HTMLDivElement | null> = {
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
let timeTimer: ReturnType<typeof setInterval>
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

function switchPage(id: string) {
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

function switchRoom(roomId: string) {
  activeRoom.value = roomId
  if (roomId === 'all') resetView()
  else flyToRoom(roomId)
}

function flyToDeviceRoom(device: any) {
  const map: Record<string, string> = {
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
function getEnvColor(label: string, value: number): string {
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
      if (value <= 50) return '#4cd964'
      if (value <= 100) return '#00d4aa'
      if (value <= 150) return '#ffd54f'
      if (value <= 200) return '#ff9800'
      return '#ff6b6b'
    default:
      return '#00d4aa'
  }
}

const envItems = computed(() => {
  const v = homeStore.stats
  return [
    { icon: '🌡', label: '室外温度', value: `${v.outdoorTemp ?? 38}°C`,    pct: Math.min(100, Math.max(0, v.outdoorTemp ?? 38)), color: getEnvColor('室外温度', v.outdoorTemp ?? 38) },
    { icon: '💧', label: '室外湿度', value: `${v.outdoorHumidity ?? 40}%`, pct: Math.min(100, Math.max(0, v.outdoorHumidity ?? 40)), color: getEnvColor('室外湿度', v.outdoorHumidity ?? 40) },
    { icon: '🏠', label: '室内温度', value: `${v.temperature ?? 24}°C`,     pct: Math.min(100, Math.max(0, v.temperature ?? 24)), color: getEnvColor('室内温度', v.temperature ?? 24) },
    { icon: '🌫', label: '室内湿度', value: `${v.humidity ?? 50}%`,         pct: Math.min(100, Math.max(0, v.humidity ?? 50)), color: getEnvColor('室内湿度', v.humidity ?? 50) },
    { icon: '🫁', label: 'CO₂浓度',  value: `${v.co2 ?? 450}ppm`,          pct: Math.min(100, Math.max(0, (v.co2 ?? 450) / 20)), color: getEnvColor('CO₂浓度', v.co2 ?? 450) },
    { icon: '🌿', label: 'PM2.5',    value: `${v.pm25 ?? 12}μg/m³`,        pct: Math.min(100, Math.max(0, (v.pm25 ?? 12) * 2)), color: getEnvColor('PM2.5', v.pm25 ?? 12) },
    { icon: '☀️', label: '光照',     value: `${v.light ?? 320}lux`,         pct: Math.min(100, Math.max(0, (v.light ?? 320) / 5)), color: getEnvColor('光照', v.light ?? 320) },
    { icon: '💨', label: '空气质量', value: '优', pct: 90, color: '#4cd964' },
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
function getDeviceColor(device: any): string {
  const typeColors: Record<string, string> = {
    light: 'rgba(255, 213, 79, 0.15)',
    ac: 'rgba(79, 195, 247, 0.15)',
    sensor: 'rgba(34, 197, 94, 0.15)',
  }
  const roomColors: Record<string, string> = {
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

function toggleDevice(device: any) {
  device.status = !device.status
}

// 打开设备详细控制面板
function openDeviceControl(device: any) {
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

// 设备管理表格 - 打开设备控制面板
function openDeviceControlFromTable(device: any) {
  const typeMap: Record<string, string> = {
    ac: 'ac',
    light: 'light',
    curtain: 'ac',
    tv: 'ac',
    speaker: 'light',
    security: 'sensor',
  }
  selectedDevice.value = {
    id: device.id,
    name: device.name,
    icon: device.type === 'ac' ? '❄️' : device.type === 'light' ? '💡' : device.type === 'security' ? '🔒' : '📺',
    type: typeMap[device.type] || 'sensor',
    status: device.status,
    value: device.value,
    room: device.room,
  }
  showControlPanel.value = true
}

const deviceList = ref<any[]>([
  { id: 'dev1', name: '客厅空调',   room: '客厅',  vendor: '美的',   ip: '192.168.1.11', online: true,  status: true,  type: 'ac',      value: 24 },
  { id: 'dev2', name: '主卧照明',   room: '主卧',  vendor: '小米',   ip: '192.168.1.12', online: true,  status: false, type: 'light',   value: 80 },
  { id: 'dev3', name: '新风系统',   room: '全屋',  vendor: '海尔',   ip: '192.168.1.13', online: true,  status: true,  type: 'curtain', value: 50 },
  { id: 'dev4', name: '次卧电视',   room: '次卧',  vendor: 'TCL',    ip: '192.168.1.14', online: true,  status: false, type: 'tv',      value: 30 },
  { id: 'dev5', name: '智能音箱',   room: '客厅',  vendor: '小米',   ip: '192.168.1.15', online: true,  status: true,  type: 'speaker', value: 60 },
  { id: 'dev6', name: '门禁系统',   room: '玄关',  vendor: '德施曼', ip: '192.168.1.16', online: false, status: false, type: 'security',value: 0   },
])

const filteredDevices = computed(() =>
  deviceSearch.value ? deviceList.value.filter(d => d.name.includes(deviceSearch.value)) : deviceList.value
)

const healthItems = [
  { icon: '❤',  label: '心率',   value: '72次/分',    trend: 2,   color: '#ff6b6b', range: '正常: 60-100次/分' },
  { icon: '🩸', label: '血压',   value: '118/75mmHg', trend: 0,   color: '#8b5cf6', range: '正常: 90-139/60-89' },
  { icon: '🌡', label: '体温',   value: '36.5°C',     trend: 0.1, color: '#ff9800', range: '正常: 36.0-37.2°C' },
  { icon: '🫁', label: '血氧',   value: '98%',         trend: 1,   color: '#4fc3f7', range: '正常: 95-100%' },
  { icon: '😴', label: '睡眠',   value: '7.5小时',     trend: 0,   color: '#4cd964', range: '正常: 7-9小时' },
]

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

const lineChartRef = ref<HTMLDivElement | null>(null)
const pieChartRef  = ref<HTMLDivElement | null>(null)
let lineChart: any = null, pieChart: any = null

async function initCharts() {
  const ec = (await import('echarts')) as any
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

<style lang="scss" scoped>
.app { animation: fadeIn 0.4s ease; }

// 全屏模式 - 填满 sidebar 右侧和 topbar 下方的整个区域
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

  .three-canvas {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
  }

  .scene-overlay {
    z-index: 41;
    background: linear-gradient(180deg, rgba(5,13,24,0.85) 0%, transparent 50%);
  }
}

// 非全屏时恢复原样式
.scene-card:not(.fullscreen) {
  height: 380px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}
</style>
