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
      <!-- 场景模式 -->
      <div class="scene-modes">
        <div class="scene-modes-title">场景模式</div>
        <button v-for="mode in sceneModes" :key="mode.id" class="scene-mode-btn" :class="{ active: activeSceneMode === mode.id }" @click="applySceneMode(mode)">
          <span class="sm-icon">{{ mode.icon }}</span>
          <span class="sm-label">{{ mode.label }}</span>
        </button>
      </div>
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

        <!-- ===== 环境总览 ===== -->
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
                  <button class="panel-tab" :class="{ active: activeDeviceTab === 'entertainment' }" @click="activeDeviceTab = 'entertainment'">🎮 娱乐</button>
                </div>
              </div>
              <!-- 照明/空调设备列表 -->
              <div class="device-list" v-if="activeDeviceTab !== 'entertainment'">
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
              <!-- 娱乐设备列表 -->
              <div class="device-list" v-if="activeDeviceTab === 'entertainment'">
                <div v-for="device in entertainmentDevices" :key="device.id" class="device-item" @click="flyToDeviceRoom(device)">
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
                <div v-if="entertainmentDevices.length === 0" class="device-empty">暂无娱乐设备</div>
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

          <!-- 第一行：核心指标卡片 -->
          <div class="energy-overview-row">
            <div class="energy-metric-card electric" @click="openEnergyDetail('today')">
              <div class="em-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div class="em-info">
                <div class="em-label">今日用电</div>
                <div class="em-value">{{ homeStore.stats.dailyEnergy ?? '8.5' }} <span class="em-unit">kWh</span></div>
                <div class="em-trend" :class="electricTrend.dir">{{ electricTrend.label }}</div>
              </div>
            </div>
            <div class="energy-metric-card water" @click="openEnergyDetail('water')">
              <div class="em-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </div>
              <div class="em-info">
                <div class="em-label">今日用水</div>
                <div class="em-value">{{ energyLiveData.waterToday.toFixed(2) }} <span class="em-unit">m³</span></div>
                <div class="em-trend" :class="waterTrend.dir">{{ waterTrend.label }}</div>
              </div>
            </div>
            <div class="energy-metric-card gas" @click="openEnergyDetail('gas')">
              <div class="em-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-3-4-.5 2-.5 4-1 6a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 22c4.97 0 9-4.03 9-9-4.5 0-9 4.5-9 9z"/><path d="M12 22c-4.97 0-9-4.03-9-9 4.5 0 9 4.5 9 9z"/></svg>
              </div>
              <div class="em-info">
                <div class="em-label">今日燃气</div>
                <div class="em-value">{{ energyLiveData.gasToday.toFixed(2) }} <span class="em-unit">m³</span></div>
                <div class="em-trend" :class="gasTrend.dir">{{ gasTrend.label }}</div>
              </div>
            </div>
            <div class="energy-metric-card cost" @click="openEnergyDetail('cost')">
              <div class="em-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div class="em-info">
                <div class="em-label">今日费用</div>
                <div class="em-value">¥{{ ((homeStore.stats.dailyEnergy ?? 8.5) * 0.6 + energyLiveData.waterToday * 3.5 + energyLiveData.gasToday * 2.8).toFixed(1) }}</div>
                <div class="em-trend" :class="costTrend.dir">{{ costTrend.label }}</div>
              </div>
            </div>
          </div>

          <!-- 第二行：趋势图表 -->
          <div class="charts-row">
            <div class="panel-card chart-lg">
              <div class="panel-header">
                <h3 class="panel-title">
                  <svg class="panel-icon electric" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  用电趋势
                </h3>
                <span>24小时</span>
              </div>
              <div ref="lineChartRef" class="chart-box"></div>
            </div>
            <div class="panel-card chart-sm">
              <div class="panel-header">
                <h3 class="panel-title">
                  <svg class="panel-icon electric" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  用电结构
                </h3>
              </div>
              <div ref="pieChartRef" class="chart-box"></div>
            </div>
          </div>

          <!-- 第三行：水气图表 -->
          <div class="charts-row">
            <div class="panel-card chart-lg">
              <div class="panel-header">
                <h3 class="panel-title">
                  <svg class="panel-icon water" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  用水趋势
                </h3>
                <span>24小时</span>
              </div>
              <div ref="waterChartRef" class="chart-box"></div>
            </div>
            <div class="panel-card chart-sm">
              <div class="panel-header">
                <h3 class="panel-title">
                  <svg class="panel-icon water" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  用水结构
                </h3>
              </div>
              <div ref="waterPieChartRef" class="chart-box"></div>
            </div>
          </div>

          <!-- 第四行：燃气图表 -->
          <div class="charts-row">
            <div class="panel-card chart-lg">
              <div class="panel-header">
                <h3 class="panel-title">
                  <svg class="panel-icon gas" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-3-4-.5 2-.5 4-1 6a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 22c4.97 0 9-4.03 9-9-4.5 0-9 4.5-9 9z"/><path d="M12 22c-4.97 0-9-4.03-9-9 4.5 0 9 4.5 9 9z"/></svg>
                  燃气趋势
                </h3>
                <span>24小时</span>
              </div>
              <div ref="gasChartRef" class="chart-box"></div>
            </div>
            <div class="panel-card chart-sm">
              <div class="panel-header">
                <h3 class="panel-title">
                  <svg class="panel-icon gas" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                  燃气结构
                </h3>
              </div>
              <div ref="gasPieChartRef" class="chart-box"></div>
            </div>
          </div>

          <!-- 第五行：费用明细 -->
          <div class="energy-cost-detail-row">
            <div class="cost-detail-card" @click="openEnergyDetail('cost')">
              <div class="cdc-header">
                <div class="cdc-icon electric">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div class="cdc-title">电费明细</div>
              </div>
              <div class="cdc-body">
                <div class="cdc-main">
                  <span class="cdc-value">¥{{ ((homeStore.stats.dailyEnergy ?? 8.5) * 0.6 * 30 + energyLiveData.waterToday * 3.5 * 30 + energyLiveData.gasToday * 2.8 * 30).toFixed(1) }}</span>
                  <span class="cdc-label">本月预估</span>
                </div>
                <div class="cdc-items">
                  <div class="cdc-item"><span>峰时用电</span><span>¥{{ ((homeStore.stats.dailyEnergy ?? 8.5) * 0.6 * 30 * 0.6).toFixed(1) }}</span></div>
                  <div class="cdc-item"><span>平时用电</span><span>¥{{ ((homeStore.stats.dailyEnergy ?? 8.5) * 0.6 * 30 * 0.3).toFixed(1) }}</span></div>
                  <div class="cdc-item"><span>谷时用电</span><span>¥{{ ((homeStore.stats.dailyEnergy ?? 8.5) * 0.6 * 30 * 0.1).toFixed(1) }}</span></div>
                </div>
              </div>
            </div>
            <div class="cost-detail-card" @click="openEnergyDetail('waterCost')">
              <div class="cdc-header">
                <div class="cdc-icon water">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                </div>
                <div class="cdc-title">水费明细</div>
              </div>
              <div class="cdc-body">
                <div class="cdc-main">
                  <span class="cdc-value">¥{{ (energyLiveData.waterToday * 30 * 3.5).toFixed(1) }}</span>
                  <span class="cdc-label">本月预估</span>
                </div>
                <div class="cdc-items">
                  <div class="cdc-item"><span>生活用水</span><span>¥{{ (energyLiveData.waterToday * 30 * 3.5 * 0.7).toFixed(1) }}</span></div>
                  <div class="cdc-item"><span>洗浴用水</span><span>¥{{ (energyLiveData.waterToday * 30 * 3.5 * 0.2).toFixed(1) }}</span></div>
                  <div class="cdc-item"><span>厨房用水</span><span>¥{{ (energyLiveData.waterToday * 30 * 3.5 * 0.1).toFixed(1) }}</span></div>
                </div>
              </div>
            </div>
            <div class="cost-detail-card" @click="openEnergyDetail('gasCost')">
              <div class="cdc-header">
                <div class="cdc-icon gas">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-3-4-.5 2-.5 4-1 6a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 22c4.97 0 9-4.03 9-9-4.5 0-9 4.5-9 9z"/><path d="M12 22c-4.97 0-9-4.03-9-9 4.5 0 9 4.5 9 9z"/></svg>
                </div>
                <div class="cdc-title">燃气费明细</div>
              </div>
              <div class="cdc-body">
                <div class="cdc-main">
                  <span class="cdc-value">¥{{ (energyLiveData.gasToday * 30 * 2.8).toFixed(1) }}</span>
                  <span class="cdc-label">本月预估</span>
                </div>
                <div class="cdc-items">
                  <div class="cdc-item"><span>热水器</span><span>¥{{ (energyLiveData.gasToday * 30 * 2.8 * 0.55).toFixed(1) }}</span></div>
                  <div class="cdc-item"><span>燃气灶</span><span>¥{{ (energyLiveData.gasToday * 30 * 2.8 * 0.35).toFixed(1) }}</span></div>
                  <div class="cdc-item"><span>壁挂炉</span><span>¥{{ (energyLiveData.gasToday * 30 * 2.8 * 0.1).toFixed(1) }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 第六行：设备能耗排行 + 环保贡献 -->
          <div class="energy-bottom-row">
            <div class="panel-card rank-card">
              <div class="panel-header"><h3 class="panel-title">能耗排行</h3><span>用电/用水/燃气</span></div>
              <div class="rank-tabs">
                <button class="rank-tab" :class="{ active: rankTab === 'electric' }" @click="rankTab = 'electric'">用电</button>
                <button class="rank-tab" :class="{ active: rankTab === 'water' }" @click="rankTab = 'water'">用水</button>
                <button class="rank-tab" :class="{ active: rankTab === 'gas' }" @click="rankTab = 'gas'">燃气</button>
              </div>
              <div class="rank-list">
                <div v-for="(item, i) in currentRankList" :key="item.name" class="rank-item" @click="openEnergyDetail(rankTab + '-rank', item)">
                  <div class="rank-num" :class="['g','s','b'][i] || ''">{{ i + 1 }}</div>
                  <div class="rank-icon">{{ item.icon }}</div>
                  <div class="rank-info">
                    <span class="rank-name">{{ item.name }}</span>
                    <div class="rank-bar-w"><div class="rank-bar" :style="{ width: item.pct + '%', background: item.color }"></div></div>
                  </div>
                  <span class="rank-val">{{ item.val }} {{ item.unit }}</span>
                </div>
              </div>
            </div>
            <div class="eco-contribute-card" @click="openEnergyDetail('carbon')">
              <div class="eco-header">
                <span class="eco-icon">🌱</span>
                <span class="eco-title">环保贡献</span>
                <span class="eco-badge-tag">本月</span>
              </div>
              <div class="eco-stats">
                <div class="eco-stat primary">
                  <div class="eco-value">{{ energyLiveData.carbonReduction }}</div>
                  <div class="eco-unit">kg</div>
                  <div class="eco-label">CO₂ 减排</div>
                </div>
                <div class="eco-divider"></div>
                <div class="eco-stat">
                  <div class="eco-value">{{ Math.floor(energyLiveData.carbonReduction / 5) }}</div>
                  <div class="eco-unit">棵</div>
                  <div class="eco-label">相当于植树</div>
                </div>
                <div class="eco-divider"></div>
                <div class="eco-stat">
                  <div class="eco-value">{{ (energyLiveData.carbonReduction * 8.3).toFixed(0) }}</div>
                  <div class="eco-unit">km</div>
                  <div class="eco-label">少开车</div>
                </div>
              </div>
              <div class="eco-progress-row">
                <div class="eco-progress-label">本月节能目标 <span class="eco-progress-pct">{{ energyLiveData.savingRate }}%</span></div>
                <div class="eco-progress-bar">
                  <div class="eco-progress-fill" :style="{ width: Math.min(energyLiveData.savingRate, 100) + '%' }"></div>
                </div>
                <div class="eco-progress-sub">距离 30% 目标还差 {{ Math.max(0, 30 - energyLiveData.savingRate) }}%</div>
              </div>
              <div class="eco-tips">
                <div class="eco-tip">
                  <span class="tip-icon">💡</span>
                  <span>节能率高于 {{ energyLiveData.savingRate }}% 的家庭</span>
                </div>
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
            <input class="filter-in" v-model="deviceSearch" placeholder="搜索设备名称…" @input="devicePage = 1" />
            <select class="filter-sel" v-model="deviceTypeFilter" @change="devicePage = 1">
              <option value="">全部类型</option>
              <option value="ac">空调/新风</option>
              <option value="light">照明/开关</option>
              <option value="outlet">插座</option>
              <option value="sensor">传感器/安防</option>
              <option value="appliance">家电</option>
            </select>
            <select class="filter-sel" v-model="deviceRoomFilter" @change="devicePage = 1">
              <option value="">全部位置</option>
              <option value="客厅">客厅</option>
              <option value="主卧">主卧</option>
              <option value="次卧">次卧</option>
              <option value="厨房">厨房</option>
              <option value="卫生间">卫生间</option>
              <option value="阳台">阳台</option>
              <option value="玄关">玄关</option>
              <option value="全屋">全屋</option>
            </select>
            <button class="btn btn-ghost" @click="deviceSearch = ''; deviceTypeFilter = ''; deviceRoomFilter = ''; devicePage = 1">重置</button>
            <button class="btn btn-accent" @click="openAddDevice">+ 新增</button>
          </div>
          <div class="panel-card" style="height: 740px; display: flex; flex-direction: column;">
            <div class="panel-header"><h3 class="panel-title">设备列表</h3><span class="panel-count">{{ filteredDevices.length }} 台</span></div>
            <div style="flex: 1; overflow-y: auto; min-height: 0;">
              <table class="data-table">
                <thead><tr><th>#</th><th>设备名</th><th>位置</th><th>厂商</th><th>IP</th><th>状态</th><th>操作</th></tr></thead>
                <tbody>
                  <tr v-for="(d, i) in pagedDevices" :key="d.id">
                    <td class="num">{{ (devicePage - 1) * DEVICE_PAGE_SIZE + i + 1 }}</td>
                    <td><span class="dot" :class="deviceOnline(d) ? 'on' : 'off'"></span> {{ d.name }}</td>
                    <td>{{ d.room }}</td>
                    <td>{{ d.vendor }}</td>
                    <td class="ip">{{ d.ip }}</td>
                    <td><span class="stag" :class="deviceOnline(d) ? 'on' : 'off'">{{ deviceOnline(d) ? '在线' : '离线' }}</span></td>
                    <td>
                      <button class="btn btn-sm btn-primary" @click="openDeviceControlFromTable(d)">控制</button>
                      <button class="btn btn-sm btn-ghost" @click="openDeviceDetail(d)">详情</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pagination">
              <button class="pg-btn" :disabled="devicePage <= 1" @click="devicePage--">&lt;</button>
              <button
                v-for="p in deviceTotalPages"
                :key="p"
                class="pg-btn"
                :class="{ active: devicePage === p }"
                @click="devicePage = p"
              >{{ p }}</button>
              <button class="pg-btn" :disabled="devicePage >= deviceTotalPages" @click="devicePage++">&gt;</button>
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
            <select class="filter-sel" v-model="productSubFilter" @change="productPage = 1">
              <option value="">全部产品</option>
              <option value="环境控制">环境控制</option>
              <option value="照明控制">照明控制</option>
              <option value="安防系统">安防系统</option>
              <option value="家电控制">家电控制</option>
              <option value="传感器">传感器</option>
              <option value="能源管理">能源管理</option>
            </select>
            <select class="filter-sel" v-model="productTagFilter" @change="productPage = 1">
              <option value="">全部状态</option>
              <option value="已接入">已接入</option>
              <option value="待接入">待接入</option>
              <option value="未接入">未接入</option>
            </select>
            <button class="btn btn-primary">查询</button>
            <button class="btn btn-ghost" @click="productSubFilter = ''; productTagFilter = ''; productPage = 1">重置</button>
          </div>
          <div class="product-grid">
            <div v-for="p in pagedProducts" :key="p.id" class="product-card">
              <div class="product-icon">{{ p.icon }}</div>
              <div class="product-info">
                <h4 class="product-name">{{ p.name }}</h4>
                <p class="product-meta">{{ p.sub }} · {{ p.vendor }}</p>
                <span class="product-tag" :class="{
                  'tag-connected': p.tag === '已接入',
                  'tag-pending': p.tag === '待接入',
                  'tag-offline': p.tag === '未接入'
                }">{{ p.tag }}</span>
              </div>
              <button class="btn btn-sm btn-ghost" @click="openProductDetail(p)">查看</button>
            </div>
          </div>
          <div class="pagination">
            <button class="pg-btn" :disabled="productPage <= 1" @click="productPage--">&lt;</button>
            <button
              v-for="p in productTotalPages"
              :key="p"
              class="pg-btn"
              :class="{ active: productPage === p }"
              @click="productPage = p"
            >{{ p }}</button>
            <button class="pg-btn" :disabled="productPage >= productTotalPages" @click="productPage++">&gt;</button>
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
    @update="onDeviceUpdate"
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
                      <span v-else class="scan-tag pending">未添加</span>
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
    <div v-if="showProductDetail" class="env-detail-overlay" @click.self="showProductDetail = false">
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
          <button class="env-detail-close" @click="showProductDetail = false">✕</button>
        </div>
        <div class="env-detail-body" v-if="productDetailItem">
          <!-- 基础信息 -->
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
          <!-- 根据接入状态显示不同描述 -->
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

  <!-- 右侧滑入控制面板 -->
  <DeviceControlPanel
    :visible="showSlidePanel"
    :device="selectedHotspotDevice"
    @close="showSlidePanel = false"
    @update="onDeviceUpdate"
  />

  <!-- Toast 通知容器 -->
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-fade">
        <div v-for="toast in homeStore.toasts" :key="toast.id" class="toast-item" :class="toast.type">
          <span class="toast-icon">{{ toastIcon(toast.type) }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" @click="homeStore.removeToast(toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useHomeStore } from '@/stores/homeStore'
import { useThreeScene } from '@/composables/useThreeScene'
import DeviceControlModal from '@/components/DeviceControlModal.vue'
import DeviceControlPanel from '@/components/DeviceControlPanel.vue'

const homeStore = useHomeStore()
const currentPage = ref('env')
const activeSceneMode = ref('')

// ========== Toast 图标映射 ==========
function toastIcon(type) {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '🚨' }
  return icons[type] || 'ℹ️'
}

// ========== 场景模式 ==========
const sceneModes = [
  {
    id: 'home',
    label: '回家模式',
    icon: '🏠',
    desc: '打开客厅灯、空调26°C、热水器',
    actions: [
      { name: '客厅灯开关', status: true, value: 100 },
      { name: '客厅空调', status: true, value: 26, mode: 'cool' },
      { name: '燃气热水器', status: true, value: 55 },
      { name: '空气质量传感器', status: true },
      { name: '门禁控制器', status: false },
    ],
  },
  {
    id: 'away',
    label: '离家模式',
    icon: '🔒',
    desc: '关闭所有灯、空调，锁定门禁',
    actions: [
      { name: '客厅灯开关', status: false },
      { name: '主卧灯开关', status: false },
      { name: '次卧灯开关', status: false },
      { name: '厨房灯开关', status: false },
      { name: '卫生间灯开关', status: false },
      { name: '阳台灯开关', status: false },
      { name: '客厅空调', status: false },
      { name: '主卧空调', status: false },
      { name: '次卧空调', status: false },
      { name: '客厅电视', status: false },
      { name: '智能音箱', status: false },
      { name: '燃气热水器', status: false },
      { name: '洗碗机', status: false },
      { name: '门禁控制器', status: true },
    ],
  },
  {
    id: 'sleep',
    label: '睡眠模式',
    icon: '🌙',
    desc: '关闭所有灯，空调26°C，客厅灯留夜灯',
    actions: [
      { name: '客厅灯开关', status: true, value: 10 },
      { name: '主卧灯开关', status: false },
      { name: '次卧灯开关', status: false },
      { name: '厨房灯开关', status: false },
      { name: '卫生间灯开关', status: false },
      { name: '阳台灯开关', status: false },
      { name: '客厅空调', status: true, value: 26, mode: 'cool' },
      { name: '主卧空调', status: true, value: 26, mode: 'cool' },
      { name: '次卧空调', status: false },
      { name: '客厅电视', status: false },
      { name: '智能音箱', status: false },
      { name: '燃气热水器', status: false },
    ],
  },
]

function applySceneMode(mode) {
  activeSceneMode.value = mode.id
  let changed = 0

  mode.actions.forEach(action => {
    const idx = deviceList.value.findIndex(d => d.name === action.name)
    if (idx !== -1) {
      const device = deviceList.value[idx]
      if (device.status !== action.status || (action.value !== undefined && device.value !== action.value)) {
        deviceList.value[idx] = {
          ...device,
          status: action.status,
          value: action.value ?? device.value,
          mode: action.mode ?? device.mode,
          online: GATEWAY_TYPES.has(device.type)
                    ? (device.online ?? true)
                    : action.status,
        }
        changed++
        // 灯光开关时同步 3D 场景灯光
        if (device.type === 'light') {
          const lightId = getLightIdForDevice(device.id)
          if (lightId) threeScene.setLightStatus(lightId, action.status, action.value ?? 100)
        }
      }
    }
  })

  homeStore.addToast({
    message: `${mode.icon} ${mode.label}已启用，共调整 ${changed} 个设备`,
    type: 'success',
  })
}

// 设备 ID → 3D 灯光 ID 映射
function getLightIdForDevice(deviceId) {
  const map = {
    'dev19': 'light-1', // 客厅灯
    'dev12': 'light-2', // 主卧灯
    'dev14': 'light-3', // 次卧灯
    'dev21': 'light-4', // 厨房灯
    'dev25': 'light-5', // 卫生间灯
    'dev26': 'light-6', // 阳台灯
  }
  return map[deviceId] || null
}
const deviceSearch = ref('')
const activeRoom = ref('all')
const isFullscreen = ref(false)

// 环境详情弹窗
const envDetailVisible = ref(false)
const envDetailLabel = ref('')

// 弹窗环境数据：从 envItems computed 实时计算，弹窗不存快照
const envDetailItem = computed(() => {
  if (!envDetailLabel.value) return null
  return envItems.value.find(i => i.label === envDetailLabel.value) || null
})

// 右侧控制面板（点击顶牌显示）
const showSlidePanel = ref(false)
const selectedHotspotDevice = ref(null)

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
  envDetailLabel.value = item.label
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
const healthDetailLabel = ref('')

// 弹窗健康数据：从 healthItems ref 实时查找，不存快照
const healthDetailItem = computed(() => {
  if (!healthDetailLabel.value) return null
  return healthItems.value.find(i => i.label === healthDetailLabel.value) || null
})

function openHealthDetail(item) {
  healthDetailLabel.value = item.label
  healthDetailVisible.value = true
}

function closeHealthDetail() {
  healthDetailVisible.value = false
}

// 设备控制面板（弹窗 - 设备列表点击）
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
const { flyToRoom, resetView, onHotspotClick, activeRoomId } = threeScene

// 顶牌切换房间时同步 activeRoom
watch(activeRoomId, (id) => {
  activeRoom.value = id
})

// 设置热点点击回调 - 只有全屏时才弹出控制面板
onHotspotClick.value = (hotspot) => {
  // 非全屏状态不弹出控制面板
  if (!isFullscreen.value) {
    return
  }
  const matched = deviceList.value.find(d => d.name === hotspot.name)
  selectedHotspotDevice.value = {
    id: hotspot.id,
    name: hotspot.name,
    type: hotspot.type || 'ac',
    room: hotspot.room || '主卧',
    status:   matched?.status   ?? true,
    value:    matched?.value    ?? (hotspot.type === 'ac' ? 24 : hotspot.type === 'light' ? 80 : 50),
    mode:     matched?.mode     ?? 'cool',
    fanSpeed: matched?.fanSpeed ?? 'auto',
    ip:       matched?.ip       ?? null,
    vendor:   matched?.vendor   ?? '未知',
    online:   matched ? deviceOnline(matched) : true,
    icon:     matched?.icon     ?? null,
  }
  showSlidePanel.value = true
}

// 设备分类：
// 网关设备（断电不离线）：传感器、新风、门禁、开关(light)、插座(outlet)
// Mesh设备（断电即离线）：灯具、空调、电视、热水器、洗碗机、音箱
const GATEWAY_TYPES = new Set(['sensor', 'security', 'light', 'outlet'])

// 在线状态计算：网关类设备始终在线，Mesh设备跟随 status
function deviceOnline(device) {
  if (!device) return false
  if (GATEWAY_TYPES.has(device.type)) return true
  return device.status
}

// 设备更新回调 - 统一更新 deviceList，所有页面共享状态
function onDeviceUpdate(device) {
  const idx = deviceList.value.findIndex(d => d.name === device.name || d.id === device.id)
  if (idx !== -1) {
    // 更新 deviceList（创建新引用，触发所有使用处响应式更新）
    deviceList.value[idx] = {
      ...deviceList.value[idx],
      status:   device.status,
      value:    device.value    ?? deviceList.value[idx].value,
      mode:     device.mode     ?? deviceList.value[idx].mode,
      fanSpeed: device.fanSpeed ?? deviceList.value[idx].fanSpeed,
      // Mesh 设备：开关状态决定在线状态
      online:   GATEWAY_TYPES.has(deviceList.value[idx].type)
                  ? (deviceList.value[idx].online ?? true)
                  : device.status,
    }
    // 同步更新当前打开的控制面板引用，使其指向 deviceList 中的最新对象
    selectedHotspotDevice.value = deviceList.value[idx]
    selectedDevice.value = deviceList.value[idx]
  }
}

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
let timeTimer, envTimer, healthTimer, energyTimer
function updateTime() {
  const n = new Date()
  currentTime.value = n.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  currentDate.value = n.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
}

const navItems = [
  { id: 'env',     name: '环境总览', icon: '🌤' },
  { id: 'energy',  name: '能源管理', icon: '⚡' },
  { id: 'health',  name: '健康监测', icon: '❤' },
  { id: 'device',  name: '设备管理', icon: '📱' },
  { id: 'product', name: '产品中心', icon: '📦' },
]
const currentTitle = computed(() => navItems.find(n => n.id === currentPage.value)?.name ?? '')

function switchPage(id) {
  // 全屏时切换页面，自动退出全屏并恢复全景
  if (isFullscreen.value) {
    isFullscreen.value = false
    closeAllPanels()
    resetView()
    activeRoom.value = 'all'
    activeRoomId.value = 'all'
    // 延迟 resize 确保 DOM 更新后再调整 canvas 大小
    setTimeout(() => {
      threeScene.resize()
    }, 150)
  }
  currentPage.value = id
  if (id !== 'health') nextTick(() => mountCanvas(id))
  // energy 页面需要等 v-show 生效、DOM 可见后再初始化图表
  if (id === 'energy') setTimeout(() => initCharts(), 100)
}

// 关闭所有弹窗/面板
function closeAllPanels() {
  showSlidePanel.value = false
  showControlPanel.value = false
  showDeviceDetail.value = false
  envDetailVisible.value = false
  healthDetailVisible.value = false
  addDeviceVisible.value = false
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
  activeRoomId.value = roomId
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
  const wasFullscreen = isFullscreen.value
  isFullscreen.value = !isFullscreen.value
  // 退出全屏时关闭所有窗口并恢复全景
  if (wasFullscreen) {
    closeAllPanels()
    resetView()
    activeRoom.value = 'all'
    activeRoomId.value = 'all'
  }
  // 延迟 resize 确保 DOM 更新完成
  setTimeout(() => {
    threeScene.resize()
  }, 200)
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
  { icon: '🚪', label: '门禁',     value: '已锁', cls: 'ok', color: '#22c55e', sensorIds: ['dev18'] },
  { icon: '💨', label: '烟雾',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev23'] },
  { icon: '🔥', label: '燃气',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev23'] },
  { icon: '📹', label: '摄像头',   value: '运行', cls: 'ok', color: '#22c55e', sensorIds: ['dev17'] },
  { icon: '🚨', label: '安防状态', value: '在家', cls: 'ok', color: '#22c55e', sensorIds: [] },
  { icon: '💧', label: '漏水',     value: '正常', cls: 'ok', color: '#22c55e', sensorIds: ['dev24'] },
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
// 环境总览页设备列表 - 直接从 deviceList 派生，统一数据源
const allDevices = computed(() => deviceList.value)

// 根据Tab筛选设备（环境总览页面）
const envDevices = computed(() => {
  const tabType = activeDeviceTab.value  // 'light' | 'ac'
  return deviceList.value.filter(d => d.type === tabType)
})

// 娱乐设备：电视、音箱
const entertainmentDevices = computed(() => {
  return deviceList.value.filter(d => ['tv', 'speaker'].includes(d.type))
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
  const idx = deviceList.value.findIndex(d => d.id === device.id || d.name === device.name)
  if (idx !== -1) {
    const newStatus = !deviceList.value[idx].status
    deviceList.value[idx] = {
      ...deviceList.value[idx],
      status: newStatus,
      // Mesh 设备：开关状态决定在线状态
      online: GATEWAY_TYPES.has(deviceList.value[idx].type)
                ? (deviceList.value[idx].online ?? true)
                : newStatus,
    }
  }
}

// 打开设备详细控制面板
function openDeviceControl(device) {
  // 从 deviceList 读取最新状态
  const latest = deviceList.value.find(d => d.id === device.id || d.name === device.name) || device
  selectedDevice.value = {
    id: latest.id,
    name: latest.name,
    icon: device.icon,
    type: latest.type,
    status:   latest.status,
    value:    latest.value,
    mode:     latest.mode     ?? 'cool',
    fanSpeed: latest.fanSpeed ?? 'auto',
    room:     latest.room,
    vendor:   latest.vendor,
    ip:       latest.ip,
    online:   deviceOnline(latest),
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

// 打开能源详情弹窗
// 计算排行分时段数据（每次调用都用最新的 item.val）
function computeRankPeriods(rankType, itemVal) {
  const defs = {
    electric: [
      { label: '凌晨 00:00-06:00', factor: 0.15, pct: 15, color: '#81c784' },
      { label: '早晨 06:00-09:00', factor: 0.18, pct: 18, color: '#4fc3f7' },
      { label: '上午 09:00-12:00', factor: 0.12, pct: 12, color: '#00d4aa' },
      { label: '中午 12:00-14:00', factor: 0.08, pct: 8,  color: '#ffd54f' },
      { label: '下午 14:00-18:00', factor: 0.15, pct: 15, color: '#ce93d8' },
      { label: '傍晚 18:00-21:00', factor: 0.22, pct: 22, color: '#ff7043' },
      { label: '夜间 21:00-24:00', factor: 0.10, pct: 10, color: '#607d8b' },
    ],
    water: [
      { label: '凌晨 00:00-06:00', factor: 0.05, pct: 5,  color: '#607d8b' },
      { label: '早晨 06:00-09:00', factor: 0.20, pct: 20, color: '#4fc3f7' },
      { label: '上午 09:00-12:00', factor: 0.10, pct: 10, color: '#00d4aa' },
      { label: '中午 12:00-14:00', factor: 0.25, pct: 25, color: '#ffd54f' },
      { label: '下午 14:00-18:00', factor: 0.05, pct: 5,  color: '#ce93d8' },
      { label: '傍晚 18:00-21:00', factor: 0.30, pct: 30, color: '#ff7043' },
      { label: '夜间 21:00-24:00', factor: 0.05, pct: 5,  color: '#81c784' },
    ],
    gas: [
      { label: '凌晨 00:00-06:00', factor: 0.02, pct: 2,  color: '#607d8b' },
      { label: '早晨 06:00-09:00', factor: 0.15, pct: 15, color: '#ffa726' },
      { label: '上午 09:00-12:00', factor: 0.08, pct: 8,  color: '#ffcc80' },
      { label: '中午 12:00-14:00', factor: 0.10, pct: 10, color: '#ffd54f' },
      { label: '下午 14:00-18:00', factor: 0.05, pct: 5,  color: '#ce93d8' },
      { label: '傍晚 18:00-21:00', factor: 0.55, pct: 55, color: '#ff7043' },
      { label: '夜间 21:00-24:00', factor: 0.05, pct: 5,  color: '#81c784' },
    ],
  }
  const decimals = rankType === 'electric' ? 2 : 3
  return (defs[rankType] || []).map(d => ({
    label: d.label, value: (itemVal * d.factor).toFixed(decimals), pct: d.pct, color: d.color
  }))
}

function openEnergyDetail(type, item = null) {
  // 能耗排行点击：显示分时段耗能明细
  if (type.endsWith('-rank') && item) {
    const rankType = type.replace('-rank', '')
    const units = { electric: 'kWh', water: 'm\u00b3', gas: 'm\u00b3' }
    const rankSrc = rankType === 'water' ? waterRank.value : rankType === 'gas' ? gasRank.value : energyRank.value
    const rankItem = rankSrc.find(r => r.name === item.name) || item
    selectedDevice.value = {
      id: type,
      name: item.name + ' 分时段耗能',
      icon: item.icon,
      type: 'energy',
      title: item.name + ' 分时段耗能',
      unit: units[rankType],
      value: rankItem.val,
      periods: computeRankPeriods(rankType, rankItem.val),
      _rankType: rankType,
      _rankItemName: item.name,
      desc: '今日各时段能耗明细',
    }
    showControlPanel.value = true
    return
  }

  const energyData = {
    today: { title: '今日用电详情', unit: 'kWh', value: homeStore.stats.dailyEnergy ?? 8.5, trend: '+5.2%', desc: '今日累计用电量' },
    power: { title: '实时功率', unit: 'kW', value: homeStore.stats.energyUsage.toFixed(1), trend: '', desc: '当前用电功率' },
    total: { title: '累计用电', unit: 'kWh', value: energyLiveData.value.totalEnergy, trend: '', desc: '本月累计用电' },
    saving: { title: '节能率', unit: '%', value: energyLiveData.value.savingRate, trend: '', desc: '相比历史平均节能比例' },
        carbon: { title: '碳减排量', unit: 'kg', value: energyLiveData.value.carbonReduction, trend: '', desc: '相当于减少的二氧化碳排放', savingRate: energyLiveData.value.savingRate },
    water: { title: '今日用水详情', unit: 'm³', value: energyLiveData.value.waterToday, trend: '-3.2%', desc: '今日累计用水量' },
    gas: { title: '今日燃气详情', unit: 'm³', value: energyLiveData.value.gasToday, trend: '+2.1%', desc: '今日累计燃气用量' },
    cost: { title: '今日费用详情', unit: '元', value: ((homeStore.stats.dailyEnergy ?? 8.5) * 0.6 + energyLiveData.value.waterToday * 3.5 + energyLiveData.value.gasToday * 2.8).toFixed(1), trend: '-2.8%', desc: '今日电费+水费+燃气费' },
    waterCost: { title: '今日水费详情', unit: '元', value: (energyLiveData.value.waterToday * 3.5).toFixed(1), trend: '+1.5%', desc: '今日水费支出' },
    gasCost: { title: '今日燃气费详情', unit: '元', value: (energyLiveData.value.gasToday * 2.8).toFixed(1), trend: '-5.8%', desc: '今日燃气费支出' },
  }
  const data = energyData[type] || energyData.today
  const iconMap = { water: '💧', gas: '🔥', waterCost: '💧', gasCost: '🔥', cost: '💰' }
  selectedDevice.value = {
    id: 'energy-' + type,
    name: data.title,
    icon: iconMap[type] || '⚡',
    type: 'energy',
    status: true,
    value: data.value,
    unit: data.unit,
    trend: data.trend,
    desc: data.desc,
    room: '全屋',
    // 存储类型标签，弹窗通过 computed 读取实时数据，不冻结快照
    energyType: type,
    _savingRate: data.savingRate || energyLiveData.value.savingRate,
  }
  showControlPanel.value = true
}

// 切换选中设备状态
function toggleSelectedDevice() {
  if (!selectedDevice.value) return
  const newStatus = !selectedDevice.value.status
  selectedDevice.value.status = newStatus
  onDeviceUpdate({ ...selectedDevice.value, status: newStatus })
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
  { ip: '192.168.1.102', name: '智能门锁 Pro', vendor: '德施曼', icon: '🔒', type: 'security' },
  { ip: '192.168.1.137', name: '卧室照明',     vendor: '飞利浦', icon: '💡', type: 'light'    },
  { ip: '192.168.1.184', name: '扫地机器人',   vendor: '石头',   icon: '🤖', type: 'sensor'   },
  { ip: '192.168.1.219', name: '智能窗帘',     vendor: '欧瑞博', icon: '🪟', type: 'ventil'   },
  { ip: '192.168.1.253', name: '厨房烟机',     vendor: '方太',   icon: '💨', type: 'ventil'   },
  { ip: '192.168.1.161', name: '浴室暖风机',   vendor: '奥普',   icon: '🌡️', type: 'heater'   },
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
        alreadyAdded: false,
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
  // 从 deviceList 读取最新状态
  const latest = deviceList.value.find(d => d.id === device.id) || device
  selectedDevice.value = {
    id: latest.id,
    name: latest.name,
    icon: iconMap[latest.type] || '📱',
    type: latest.type,
    status:   latest.status,
    value:    latest.value,
    mode:     latest.mode     ?? 'cool',
    fanSpeed: latest.fanSpeed ?? 'auto',
    room:     latest.room,
    vendor:   latest.vendor,
    ip:       latest.ip,
    online:   deviceOnline(latest),
  }
  showControlPanel.value = true
}

// 设备详情弹窗
const showDeviceDetail = ref(false)
const deviceDetailId = ref('')

const iconMap = {
  ac: '❄️', light: '💡', tv: '📺', speaker: '🔊',
  security: '🔒', ventil: '🌀', washer: '🍽️', heater: '🚿',
  sensor: '📡', outlet: '🔌',
}

// 弹窗设备数据：从 deviceList 实时查找，不存快照
const deviceDetailItem = computed(() => {
  if (!deviceDetailId.value) return null
  const d = deviceList.value.find(d => d.id === deviceDetailId.value || d.name === deviceDetailId.value)
  return d ? { ...d, icon: iconMap[d.type] || '📱' } : null
})

function openDeviceDetail(device) {
  deviceDetailId.value = device.id
  showDeviceDetail.value = true
}

function closeDeviceDetail() {
  showDeviceDetail.value = false
}

// 产品详情弹窗
const showProductDetail = ref(false)
const productDetailId = ref(0)

const productDetailItem = computed(() => {
  if (!productDetailId.value) return null
  return products.value.find(p => p.id === productDetailId.value) || null
})

function openProductDetail(product) {
  productDetailId.value = product.id
  showProductDetail.value = true
}

function productStatusColor(tag) {
  if (tag === '已接入') return '#00d4aa'
  if (tag === '待接入') return '#0ea5e9'
  if (tag === '未接入') return '#ef4444'
  return 'var(--text-2)'
}

// 设备使用时长（根据设备ID生成固定值）
function deviceUsageTime(device) {
  if (!device) return '0小时'
  const seed = device.id?.charCodeAt(device.id.length - 1) || 0
  const hours = (seed % 500) + 50
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  if (days > 0) {
    return `${days}天 ${remainingHours}小时`
  }
  return `${hours}小时`
}

// 设备用电统计（根据设备类型和ID生成固定值）
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
  // 原有设备
  { id: 'dev1',  name: '客厅空调',           icon: '❄️',  room: '客厅',   vendor: '三星',    ip: '192.168.1.47', online: true,  status: true,  type: 'ac',       value: 24 },
  { id: 'dev3',  name: '新风系统',           icon: '🌀',  room: '全屋',   vendor: '海尔',    ip: '192.168.1.83', online: true,  status: true,  type: 'ventil',   value: 50 },
  { id: 'dev4',  name: '客厅电视',           icon: '📺',  room: '客厅',   vendor: '三星',    ip: '192.168.1.156',online: true,  status: false, type: 'tv',       value: 30 },
  { id: 'dev5',  name: '智能音箱',           icon: '🔊',  room: '客厅',   vendor: '米歇尔',    ip: '192.168.1.29', online: true,  status: true,  type: 'speaker',  value: 60 },
  { id: 'dev6',  name: '门禁系统',           icon: '🔒',  room: '玄关',   vendor: '德施曼',  ip: '192.168.1.112',online: true,  status: false, type: 'security', value: 0  },
  { id: 'dev7',  name: '主卧空调',           icon: '🌬️', room: '主卧',   vendor: '三星',    ip: '192.168.1.64', online: true,  status: false, type: 'ac',       value: 26 },
  { id: 'dev8',  name: '次卧空调',           icon: '🌡️', room: '次卧',   vendor: '三星',    ip: '192.168.1.91', online: true,  status: false, type: 'ac',       value: 26 },
  { id: 'dev9',  name: '洗碗机',             icon: '🍽️', room: '厨房',   vendor: '西门子',  ip: '192.168.1.178',online: true,  status: false, type: 'washer',   value: 0  },
  { id: 'dev10', name: '燃气热水器',         icon: '🚿',  room: '厨房',   vendor: '阿里斯顿',    ip: '192.168.1.203',online: true,  status: false, type: 'heater',   value: 55 },
  // 顶牌设备（3D场景中的设备）
  { id: 'dev11', name: '空调插座A',           icon: '🔌',  room: '主卧',   vendor: '小米',    ip: '192.168.1.38', online: true,  status: true,  type: 'outlet',   value: 0  },
  { id: 'dev12', name: '主卧灯开关',         icon: '🛏️', room: '主卧',   vendor: '小米',    ip: '192.168.1.55', online: true,  status: true,  type: 'light',    value: 80 },
  { id: 'dev13', name: '空调插座B',           icon: '🔌',  room: '次卧',   vendor: '小米',    ip: '192.168.1.72', online: true,  status: false, type: 'outlet',   value: 0  },
  { id: 'dev14', name: '次卧灯开关',         icon: '🌙',  room: '次卧',   vendor: '小米',    ip: '192.168.1.99', online: true,  status: false, type: 'light',    value: 0  },
  { id: 'dev16', name: '客厅插座A',           icon: '🔌',  room: '客厅',   vendor: '小米',    ip: '192.168.1.134',online: true,  status: true,  type: 'outlet',   value: 0  },
  { id: 'dev17', name: '空气质量传感器',     icon: '🌫️', room: '客厅',   vendor: '霍尼韦尔',ip: '192.168.1.167',online: true,  status: true,  type: 'sensor',   value: 0  },
  { id: 'dev18', name: '门禁控制器',         icon: '🚪',  room: '玄关',   vendor: '德施曼',  ip: '192.168.1.118',online: true,  status: true,  type: 'security', value: 0  },
  { id: 'dev19', name: '客厅灯开关',         icon: '🏠',  room: '客厅',   vendor: '小米',    ip: '192.168.1.143',online: true,  status: true,  type: 'light',    value: 100 },
  { id: 'dev20', name: '客厅插座B',           icon: '🔌',  room: '客厅',   vendor: '小米',    ip: '192.168.1.189',online: true,  status: true,  type: 'outlet',   value: 0  },
  { id: 'dev21', name: '厨房灯开关',         icon: '🍳',  room: '厨房',   vendor: '小米',    ip: '192.168.1.214',online: true,  status: true,  type: 'light',    value: 100 },
  { id: 'dev22', name: '厨房插座',           icon: '🔌',  room: '厨房',   vendor: '小米',    ip: '192.168.1.231',online: true,  status: false, type: 'outlet',   value: 0  },
  { id: 'dev23', name: '烟雾/燃气传感器',   icon: '🔥',  room: '厨房',   vendor: '海曼',    ip: '192.168.1.245',online: true,  status: true,  type: 'sensor',   value: 0  },
  { id: 'dev24', name: '水浸传感器',         icon: '💧',  room: '卫生间', vendor: '小米',    ip: '192.168.1.17', online: true,  status: true,  type: 'sensor',   value: 0  },
  { id: 'dev25', name: '卫生间灯开关',       icon: '🚿',  room: '卫生间', vendor: '小米',    ip: '192.168.1.33', online: true,  status: false, type: 'light',    value: 0  },
  { id: 'dev26', name: '阳台灯开关',         icon: '🌿',  room: '阳台',   vendor: '小米',    ip: '192.168.1.58', online: true,  status: false, type: 'light',    value: 0  },
  { id: 'dev27', name: '温湿度/光照传感器', icon: '🌡️', room: '阳台',   vendor: '小米',    ip: '192.168.1.76', online: true,  status: true,  type: 'sensor',   value: 0  },
  // 顶牌新增设备
  { id: 'dev28', name: '抽油烟机',          icon: '🌀',  room: '厨房',   vendor: '欧派',    ip: '192.168.1.142',online: true,  status: false, type: 'ventil',   value: 0  },
])

// 设备列表筛选
const deviceRoomFilter = ref('')
const deviceTypeFilter = ref('')
const devicePage = ref(1)
const DEVICE_PAGE_SIZE = 10

const filteredDevices = computed(() => {
  // 合并类型映射
  const typeGroupMap = {
    'ac':       ['ac', 'ventil'],
    'light':    ['light'],
    'outlet':   ['outlet'],
    'sensor':   ['sensor', 'security'],
    'appliance':['tv', 'speaker', 'washer', 'heater'],
  }
  let list = deviceList.value.filter(d => {
    const matchSearch = !deviceSearch.value || d.name.includes(deviceSearch.value)
    const matchRoom   = !deviceRoomFilter.value || d.room === deviceRoomFilter.value
    const matchType   = !deviceTypeFilter.value ||
      (typeGroupMap[deviceTypeFilter.value] || []).includes(d.type)
    return matchSearch && matchRoom && matchType
  })
  // 按房间排序
  const roomOrder = { '客厅': 1, '主卧': 2, '次卧': 3, '厨房': 4, '卫生间': 5, '阳台': 6, '玄关': 7, '全屋': 8 }
  list.sort((a, b) => (roomOrder[a.room] || 9) - (roomOrder[b.room] || 9))
  return list
})

const deviceTotalPages = computed(() => Math.max(1, Math.ceil(filteredDevices.value.length / DEVICE_PAGE_SIZE)))

const pagedDevices = computed(() => {
  if (devicePage.value > deviceTotalPages.value) devicePage.value = 1
  const start = (devicePage.value - 1) * DEVICE_PAGE_SIZE
  return filteredDevices.value.slice(start, start + DEVICE_PAGE_SIZE)
})

const healthItems = ref([
  { icon: '❤',  label: '心率',   value: '72次/分',   trend: 2,   color: '#ff6b6b', range: '正常: 60-100次/分',   pct: 72,  raw: 72 },
  { icon: '🩸', label: '血压',   value: '118/75mmHg', trend: 0,   color: '#8b5cf6', range: '正常: 90-139/60-89', pct: 85,  raw: 118 },
  { icon: '🌡', label: '体温',   value: '36.5°C',     trend: 0.1, color: '#ff9800', range: '正常: 36.0-37.2°C',  pct: 50,  raw: 36.5 },
  { icon: '🫁', label: '血氧',   value: '98%',        trend: 1,   color: '#4fc3f7', range: '正常: 95-100%',      pct: 98,  raw: 98 },
  { icon: '😴', label: '睡眠',   value: '7.5小时',    trend: 0,   color: '#4cd964', range: '正常: 7-9小时',      pct: 83,  raw: 7.5 },
])

// 心率趋势数据 (24小时)
const heartRateData = ref([
  { time: '00:00', value: 65 }, { time: '01:00', value: 62 }, { time: '02:00', value: 58 },
  { time: '03:00', value: 55 }, { time: '04:00', value: 58 }, { time: '05:00', value: 62 },
  { time: '06:00', value: 72 }, { time: '07:00', value: 68 }, { time: '08:00', value: 75 },
  { time: '09:00', value: 70 }, { time: '10:00', value: 78 }, { time: '11:00', value: 72 },
  { time: '12:00', value: 80 }, { time: '13:00', value: 74 }, { time: '14:00', value: 82 },
  { time: '15:00', value: 76 }, { time: '16:00', value: 72 }, { time: '17:00', value: 68 },
  { time: '18:00', value: 75 }, { time: '19:00', value: 71 }, { time: '20:00', value: 78 },
  { time: '21:00', value: 73 }, { time: '22:00', value: 80 }, { time: '23:00', value: 75 },
])

// 血压周数据
const bpWeekData = ref([
  { sys: 115, dia: 75 }, { sys: 120, dia: 78 }, { sys: 118, dia: 76 },
  { sys: 122, dia: 80 }, { sys: 116, dia: 74 }, { sys: 119, dia: 77 },
  { sys: 118, dia: 78 },
])


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

const alarms = ref([
  { time: '08:30', content: '心率偏高提醒', level: 'warn', levelText: '警告', status: 'done',    statusText: '已处理' },
  { time: '14:15', content: '久坐提醒',     level: 'info', levelText: '提示', status: 'pending', statusText: '未处理' },
  { time: '昨日',  content: '睡眠时间不足', level: 'warn', levelText: '警告', status: 'done',    statusText: '已处理' },
  { time: '前日',  content: '饮水提醒',    level: 'info', levelText: '提示', status: 'done',    statusText: '已处理' },
])

// 能耗排行数据
const energyRank = ref([
  { name: '空调', val: 3.2, pct: 100, color: '#4fc3f7', icon: '❄️', unit: 'kWh' },
  { name: '冰箱', val: 1.8, pct: 56,  color: '#81c784', icon: '🧊', unit: 'kWh' },
  { name: '照明', val: 0.9, pct: 28,  color: '#ffd54f', icon: '💡', unit: 'kWh' },
  { name: '电视', val: 0.5, pct: 16,  color: '#ce93d8', icon: '📺', unit: 'kWh' },
])
const waterRank = ref([
  { name: '淋浴', val: 0.35, pct: 100, color: '#4fc3f7', icon: '🚿', unit: 'm³' },
  { name: '洗衣机', val: 0.18, pct: 51,  color: '#81c784', icon: '🧺', unit: 'm³' },
  { name: '厨房', val: 0.12, pct: 34,  color: '#ffd54f', icon: '🍳', unit: 'm³' },
  { name: '洗手台', val: 0.08, pct: 23,  color: '#ce93d8', icon: '🚰', unit: 'm³' },
])
const gasRank = ref([
  { name: '热水器', val: 0.25, pct: 100, color: '#ff7043', icon: '🚿', unit: 'm³' },
  { name: '燃气灶', val: 0.15, pct: 60,  color: '#ffa726', icon: '🔥', unit: 'm³' },
  { name: '壁挂炉', val: 0.05, pct: 20,  color: '#ffcc80', icon: '🏠', unit: 'm³' },
])
const rankTab = ref('electric')
const currentRankList = computed(() => {
  if (rankTab.value === 'water') return waterRank.value
  if (rankTab.value === 'gas') return gasRank.value
  return energyRank.value
})

const products = ref([
  // 环境控制
  { id: 1,  icon: '❄️', name: '变频空调 KFR-35',    sub: '环境控制', vendor: '美的',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.2.1', connectedAt: '2024-06-10', signal: '强 (-38dBm)' },
  { id: 2,  icon: '🌀', name: '新风系统 FX-200',     sub: '环境控制', vendor: '海尔',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.0.8', connectedAt: '2024-07-22', signal: '中 (-65dBm)' },
  { id: 3,  icon: '🌡', name: '温湿度传感器 TH-01', sub: '环境控制', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v1.4.2', connectedAt: '2024-08-05', signal: '强 (-44dBm)' },
  { id: 4,  icon: '🌡', name: '空气净化器 KJ-500',  sub: '环境控制', vendor: '飞利浦',   tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
  { id: 5,  icon: '💨', name: '除湿机 D1-10L',      sub: '环境控制', vendor: '德业',     tag: '未接入', protocol: 'Wi-Fi', power: '220V AC' },
  // 照明控制
  { id: 6,  icon: '💡', name: '智能照明套件',        sub: '照明控制', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.1.4', connectedAt: '2024-08-15', signal: '强 (-42dBm)' },
  { id: 7,  icon: '🌈', name: 'RGB 智能灯泡',        sub: '照明控制', vendor: 'Yeelight', tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v1.9.3', connectedAt: '2024-09-01', signal: '强 (-40dBm)' },
  { id: 8,  icon: '🔲', name: '智能开关面板',        sub: '照明控制', vendor: '公牛',     tag: '待接入', protocol: 'Zigbee 3.0', power: '220V AC' },
  // 安防系统
  { id: 9,  icon: '🔒', name: '智能门锁 S1',         sub: '安防系统', vendor: '德施曼',   tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v4.0.1', connectedAt: '2024-05-20', signal: '强 (-36dBm)' },
  { id: 10, icon: '📹', name: '智能摄像头 C3W',      sub: '安防系统', vendor: '萤石',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.1.0', connectedAt: '2024-06-30', signal: '强 (-41dBm)' },
  { id: 11, icon: '🔔', name: '智能门铃 D1',         sub: '安防系统', vendor: '叮零',     tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
  // 传感器
  { id: 12, icon: '🔥', name: '烟雾/燃气传感器',    sub: '传感器',   vendor: '海曼',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v2.3.0', connectedAt: '2024-07-10', signal: '中 (-58dBm)' },
  { id: 13, icon: '💧', name: '水浸传感器',          sub: '传感器',   vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '电池', firmware: 'v1.2.1', connectedAt: '2024-08-20', signal: '强 (-45dBm)' },
  { id: 14, icon: '📶', name: '空气质量传感器',      sub: '传感器',   vendor: '霍尼韦尔', tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v1.8.5', connectedAt: '2024-09-12', signal: '强 (-39dBm)' },
  { id: 15, icon: '🚪', name: '门磁感应器',          sub: '传感器',   vendor: '小米',     tag: '待接入', protocol: 'Zigbee 3.0', power: '电池' },
  { id: 16, icon: '👤', name: '人体存在传感器',      sub: '传感器',   vendor: '领普',     tag: '未接入', protocol: 'Zigbee 3.0', power: '电池' },
  // 家电控制
  { id: 17, icon: '📺', name: '智能电视 65Q7',       sub: '家电控制', vendor: '三星',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v5.0.2', connectedAt: '2024-07-05', signal: '强 (-37dBm)' },
  { id: 18, icon: '🔊', name: '智能音箱 Pro',        sub: '家电控制', vendor: '米歇尔',     tag: '已接入', protocol: 'Wi-Fi', power: '220V AC', firmware: 'v3.4.1', connectedAt: '2024-08-01', signal: '强 (-43dBm)' },
  { id: 19, icon: '🍽️', name: '智能洗碗机',          sub: '家电控制', vendor: '西门子',   tag: '待接入', protocol: 'Wi-Fi', power: '220V AC' },
  { id: 20, icon: '🚿', name: '燃气热水器',          sub: '家电控制', vendor: '阿里斯顿',     tag: '待接入', protocol: 'Wi-Fi', power: '燃气' },
  { id: 21, icon: '🧹', name: '扫地机器人 S1',       sub: '家电控制', vendor: '石头',     tag: '未接入', protocol: 'Wi-Fi', power: '充电' },
  // 能源管理
  { id: 22, icon: '🔌', name: '智能插座',            sub: '能源管理', vendor: '小米',     tag: '已接入', protocol: 'Zigbee 3.0', power: '220V AC', firmware: 'v2.0.3', connectedAt: '2024-09-18', signal: '强 (-46dBm)' },
  { id: 23, icon: '⚡', name: '智能电表',             sub: '能源管理', vendor: '正泰',     tag: '待接入', protocol: 'RS-485', power: '220V AC' },
])

// 产品筛选 & 分页
const productSubFilter = ref('')
const productTagFilter = ref('')
const productPage = ref(1)
const PRODUCT_PAGE_SIZE = 12

const filteredProducts = computed(() => {
  let list = products.value.filter(p => {
    const matchSub = !productSubFilter.value || p.sub === productSubFilter.value
    const matchTag = !productTagFilter.value || p.tag === productTagFilter.value
    return matchSub && matchTag
  })
  // 按接入状态排序：已接入 > 待接入 > 未接入
  const statusOrder = { '已接入': 1, '待接入': 2, '未接入': 3 }
  list.sort((a, b) => (statusOrder[a.tag] || 4) - (statusOrder[b.tag] || 4))
  return list
})

const productTotalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / PRODUCT_PAGE_SIZE)))

const pagedProducts = computed(() => {
  if (productPage.value > productTotalPages.value) productPage.value = 1
  const start = (productPage.value - 1) * PRODUCT_PAGE_SIZE
  return filteredProducts.value.slice(start, start + PRODUCT_PAGE_SIZE)
})

const lineChartRef = ref(null)
const pieChartRef  = ref(null)
const waterChartRef = ref(null)
const gasChartRef = ref(null)
const waterPieChartRef = ref(null)
const gasPieChartRef = ref(null)
let lineChart = null, pieChart = null, waterChart = null, gasChart = null, waterPieChart = null, gasPieChart = null

  // 能源图表数据源（ref，便于实时更新）
  const chartData = ref({
    energyLine: [1.8, 1.2, 2.0, 4.5, 3.8, 5.5, 2.8],
    energyPie: [
      { value: 45, name: '空调', itemStyle: { color: '#4fc3f7' } },
      { value: 25, name: '冰箱', itemStyle: { color: '#81c784' } },
      { value: 15, name: '照明', itemStyle: { color: '#ffd54f' } },
      { value: 15, name: '其他', itemStyle: { color: '#ce93d8' } },
    ],
    waterBar: [0.02, 0.01, 0.06, 0.18, 0.08, 0.22, 0.12],
    waterPie: [
      { value: 45, name: '淋浴', itemStyle: { color: '#4fc3f7', borderRadius: [0, 4, 4, 0] } },
      { value: 25, name: '洗衣', itemStyle: { color: '#81c784', borderRadius: [0, 4, 4, 0] } },
      { value: 20, name: '厨房', itemStyle: { color: '#ffd54f', borderRadius: [0, 4, 4, 0] } },
      { value: 10, name: '其他', itemStyle: { color: '#ce93d8', borderRadius: [0, 4, 4, 0] } },
    ],
    gasLine: [0.01, 0.01, 0.03, 0.05, 0.04, 0.20, 0.11],
    gasPie: [
      { value: 55, name: '热水器', itemStyle: { color: '#ff7043' } },
      { value: 35, name: '燃气灶', itemStyle: { color: '#ffa726' } },
      { value: 10, name: '壁挂炉', itemStyle: { color: '#ffcc80' } },
    ],
  })

  // 能源弹窗实时数据源
  const energyLiveData = ref({
    waterToday: 0.80,
    gasToday: 0.45,
    savingRate: 18,
    totalEnergy: 235,
    carbonReduction: 12.5,
  })

  // 能源趋势数据（实时更新）
  const electricTrend = ref({ dir: 'up', label: '↑ 5.2%', raw: 5.2 })
  const waterTrend = ref({ dir: 'down', label: '↓ 3.2%', raw: 3.2 })
  const gasTrend = ref({ dir: 'up', label: '↑ 2.1%', raw: 2.1 })
  const costTrend = ref({ dir: 'down', label: '↓ 2.8%', raw: 2.8 })




  // 辅助：根据趋势值生成新的 trend 对象（不可变，保证 Vue 响应式）
  function makeTrend(newVal) {
    return { dir: newVal >= 0 ? 'up' : 'down', label: (newVal >= 0 ? '↑ ' : '↓ ') + Math.abs(newVal).toFixed(1) + '%', raw: newVal }
  }


async function initCharts() {
  const ec = await import('echarts')
  console.log('[initCharts] refs:', { lineChartRef: !!lineChartRef.value, pieChartRef: !!pieChartRef.value, waterChartRef: !!waterChartRef.value, gasChartRef: !!gasChartRef.value, existingLineChart: !!lineChart })
  if (lineChartRef.value && !lineChart) {
    lineChart = ec.init(lineChartRef.value)
    lineChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['00h','04h','08h','12h','16h','20h','24h'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ data: chartData.value.energyLine, type: 'line', smooth: true, lineStyle: { color: '#00d4aa', width: 3 }, areaStyle: { color: new ec.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,212,170,0.25)'},{offset:1,color:'rgba(0,212,170,0)'}]) }, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#00d4aa' } }]
    })
  }
  if (pieChartRef.value && !pieChart) {
    pieChart = ec.init(pieChartRef.value)
    pieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      series: [{ type: 'pie', radius: ['50%','75%'], center: ['50%','50%'], data: chartData.value.energyPie, label: { color: '#94a3b8', fontSize: 12 }, labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } }]
    })
  }
  // 用水趋势图（柱状图）
  if (waterChartRef.value && !waterChart) {
    waterChart = ec.init(waterChartRef.value)
    waterChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true },
      xAxis: { type: 'category', data: ['00h','04h','08h','12h','16h','20h','24h'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ 
        data: chartData.value.waterBar, 
        type: 'bar', 
        barWidth: '50%',
        itemStyle: { 
          color: new ec.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#4fc3f7'},{offset:1,color:'rgba(79,195,247,0.3)'}]),
          borderRadius: [4, 4, 0, 0]
        }
      }]
    })
  }
  // 燃气使用图（虚线折线图）
  if (gasChartRef.value && !gasChart) {
    gasChart = ec.init(gasChartRef.value)
    gasChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['00h','04h','08h','12h','16h','20h','24h'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ 
        data: chartData.value.gasLine, 
        type: 'line', 
        smooth: true, 
        lineStyle: { color: '#ff7043', width: 3, type: 'dashed' }, 
        symbol: 'triangle', 
        symbolSize: 8, 
        itemStyle: { color: '#ff7043' }
      }]
    })
  }
  // 用水结构图（横向条形图）
  if (waterPieChartRef.value && !waterPieChart) {
    waterPieChart = ec.init(waterPieChartRef.value)
    waterPieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      grid: { left: '3%', right: '15%', top: '5%', bottom: '5%', containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: ['其他', '厨房', '洗衣', '淋浴'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [{ 
        type: 'bar', 
        barWidth: '50%',
        data: chartData.value.waterPie,
        label: { show: true, position: 'right', color: '#94a3b8', fontSize: 11, formatter: '{c}%' }
      }]
    })
  }
  // 燃气结构图（玫瑰图/南丁格尔图）
  if (gasPieChartRef.value && !gasPieChart) {
    gasPieChart = ec.init(gasPieChartRef.value)
    gasPieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(10,20,38,0.95)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      series: [{ 
        type: 'pie', 
        radius: [20, 70],
        center: ['50%','50%'],
        roseType: 'radius',
        itemStyle: { borderRadius: 5 },
        data: chartData.value.gasPie,
        label: { color: '#94a3b8', fontSize: 12 }, 
        labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } 
      }]
    })
  }
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  nextTick(() => mountCanvas('env'))
  window.addEventListener('resize', () => { lineChart?.resize(); pieChart?.resize(); waterChart?.resize(); gasChart?.resize(); waterPieChart?.resize(); gasPieChart?.resize() })

  // 环境数据实时模拟：每 3 秒波动一次
  envTimer = setInterval(() => {
    const { alerts } = homeStore.simulateEnvData(1)
    // 只弹出 danger 级别告警（避免 warning 过于频繁打扰）
    alerts.forEach(a => {
      if (a.type === 'danger') {
        homeStore.addToast({ message: a.msg, type: a.type, duration: 5000 })
      }
    })
  }, 3000)

  // 健康数据实时模拟：每 4 秒波动一次
  healthTimer = setInterval(() => {
    const items = healthItems.value
    // 心率：68-82 波动
    const hr = Math.round(items[0].raw + (Math.random() - 0.5) * 6)
    items[0].raw = Math.max(55, Math.min(110, hr))
    items[0].value = items[0].raw + '次/分'
    items[0].pct = Math.min(100, Math.max(0, ((items[0].raw - 40) / 80) * 100))
    items[0].trend = Math.round((Math.random() - 0.5) * 6)

    // 血压：收缩压 110-130，舒张压 68-85
    const sys = Math.round(items[1].raw + (Math.random() - 0.5) * 6)
    const dia = Math.round(sys * 0.64 + (Math.random() - 0.5) * 4)
    items[1].raw = Math.max(90, Math.min(145, sys))
    const diaVal = Math.max(55, Math.min(95, dia))
    items[1].value = items[1].raw + '/' + diaVal + 'mmHg'
    items[1].pct = Math.min(100, Math.max(0, ((items[1].raw - 80) / 80) * 100))
    items[1].trend = Math.round((Math.random() - 0.5) * 4)

    // 体温：36.0-37.2 微小波动
    const temp = Math.round((items[2].raw + (Math.random() - 0.5) * 0.2) * 10) / 10
    items[2].raw = Math.max(35.5, Math.min(38.0, temp))
    items[2].value = items[2].raw + '°C'
    items[2].pct = Math.min(100, Math.max(0, ((items[2].raw - 35) / 4) * 100))
    items[2].trend = Math.round((Math.random() - 0.5) * 0.4 * 10) / 10

    // 血氧：96-100
    const spo2 = Math.round(items[3].raw + (Math.random() - 0.5) * 2)
    items[3].raw = Math.max(92, Math.min(100, spo2))
    items[3].value = items[3].raw + '%'
    items[3].pct = items[3].raw
    items[3].trend = Math.round((Math.random() - 0.5) * 3)

    // 心率趋势数据：更新最后一个小时的数据点
    const hour = new Date().getHours()
    const lastIdx = heartRateData.value.length - 1
    heartRateData.value[lastIdx].value = Math.max(50, Math.min(100, items[0].raw + Math.round((Math.random() - 0.5) * 4)))
    heartRateData.value[lastIdx].time = String(hour).padStart(2, '0') + ':00'
  }, 4000)

  // 能源排行实时模拟：每 8 秒微调一次
  energyTimer = setInterval(() => {
    console.log('[energyTimer] tick', Date.now())
    // 电能排行
    energyRank.value.forEach(item => {
    item.val = Math.round((item.val + Math.random() * 0.05) * 100) / 100
      item.val = Math.max(0.1, item.val)
      item.pct = Math.round((item.val / 4) * 100)
    })
    // 水排行
    waterRank.value.forEach(item => {
    item.val = Math.round((item.val + Math.random() * 0.005) * 1000) / 1000
      item.val = Math.max(0.01, item.val)
      item.pct = Math.round((item.val / 0.4) * 100)
    })
    // 燃气排行
    gasRank.value.forEach(item => {
    item.val = Math.round((item.val + Math.random() * 0.003) * 1000) / 1000
      item.val = Math.max(0.01, item.val)
      item.pct = Math.round((item.val / 0.3) * 100)
    })

    // 能源图表实时更新
    const cd = chartData.value
    // 电能趋势折线：模拟最后一个时段变化
    cd.energyLine = cd.energyLine.map(v => Math.max(0.5, Math.round((v + (Math.random() - 0.5) * 0.4) * 100) / 100))
    lineChart?.setOption({ series: [{ data: [...cd.energyLine] }] })


    // 电能占比饼图：根据设备状态微调
    const acOn = deviceList.value.filter(d => (d.type === 'ac') && d.status).length
    cd.energyPie[0].value = Math.max(20, 45 + acOn * 10 + Math.round((Math.random() - 0.5) * 5))
    cd.energyPie[1].value = Math.max(10, 25 + Math.round((Math.random() - 0.5) * 3))
    cd.energyPie[2].value = Math.max(5, 15 + Math.round((Math.random() - 0.5) * 3))
    cd.energyPie[3].value = Math.max(3, 15 + Math.round((Math.random() - 0.5) * 3))
    pieChart?.setOption({ series: [{ data: cd.energyPie }] })

    // 用水柱状图：最后一个时段波动
    cd.waterBar = cd.waterBar.map(v => Math.max(0.01, Math.round((v + (Math.random() - 0.5) * 0.03) * 100) / 100))
    waterChart?.setOption({ series: [{ data: [...cd.waterBar] }] })


    // 用水结构横向条形图
    cd.waterPie.forEach(d => { d.value = Math.max(3, d.value + Math.round((Math.random() - 0.5) * 2)) })
    waterPieChart?.setOption({ series: [{ data: cd.waterPie }] })

    // 燃气虚线折线图
    cd.gasLine = cd.gasLine.map(v => Math.max(0.005, Math.round((v + (Math.random() - 0.5) * 0.015) * 100) / 100))
    gasChart?.setOption({ series: [{ data: [...cd.gasLine] }] })


    // 燃气结构玫瑰图
    cd.gasPie.forEach(d => { d.value = Math.max(2, d.value + Math.round((Math.random() - 0.5) * 2)) })
    gasPieChart?.setOption({ series: [{ data: cd.gasPie }] })

    // 能源弹窗数据实时更新
    const eld = energyLiveData.value
      eld.waterToday = Math.round((eld.waterToday + Math.random() * 0.03) * 100) / 100
      // Water/gas only accumulate, never decrease
      eld.gasToday = Math.round((eld.gasToday + Math.random() * 0.015) * 100) / 100

    eld.savingRate = Math.round(15 + Math.random() * 10)
    eld.totalEnergy = Math.round(eld.totalEnergy + (Math.random() - 0.3) * 0.5)
    eld.totalEnergy = Math.max(100, eld.totalEnergy)
    eld.carbonReduction = Math.round((eld.carbonReduction + (Math.random() - 0.4) * 0.3) * 10) / 10
    eld.carbonReduction = Math.max(5, eld.carbonReduction)

    // 实时更新趋势指标
    electricTrend.value = makeTrend(Math.round((Math.random() - 0.4) * 8 * 10) / 10)
    waterTrend.value = makeTrend(Math.round((Math.random() - 0.5) * 6 * 10) / 10)
    gasTrend.value = makeTrend(Math.round((Math.random() - 0.4) * 5 * 10) / 10)
    costTrend.value = makeTrend(Math.round((Math.random() - 0.5) * 7 * 10) / 10)

    // 如果能源弹窗打开中，实时刷新弹窗数值
    if (showControlPanel.value && selectedDevice.value?.id?.startsWith('energy-')) {
      const etype = selectedDevice.value.id.replace('energy-', '')
      const energyData = {
        today: { title: '今日用电详情', unit: 'kWh', value: homeStore.stats.dailyEnergy ?? 8.5, trend: electricTrend.value.label, desc: '今日累计用电量' },
        water: { title: '今日用水详情', unit: 'm³', value: energyLiveData.value.waterToday, trend: waterTrend.value.label, desc: '今日累计用水量' },
        gas: { title: '今日燃气详情', unit: 'm³', value: energyLiveData.value.gasToday, trend: gasTrend.value.label, desc: '今日累计燃气用量' },
        cost: { title: '今日费用详情', unit: '元', value: ((homeStore.stats.dailyEnergy ?? 8.5) * 0.6 + energyLiveData.value.waterToday * 3.5 + energyLiveData.value.gasToday * 2.8).toFixed(1), trend: costTrend.value.label, desc: '今日电费+水费+燃气费' },
        waterCost: { title: '今日水费详情', unit: '元', value: (energyLiveData.value.waterToday * 3.5).toFixed(1), trend: waterTrend.value.label, desc: '今日水费支出' },
        gasCost: { title: '今日燃气费详情', unit: '元', value: (energyLiveData.value.gasToday * 2.8).toFixed(1), trend: gasTrend.value.label, desc: '今日燃气费支出' },
        carbon: { title: '碳减排量', unit: 'kg', value: energyLiveData.value.carbonReduction, trend: '', desc: '相当于减少的二氧化碳排放', savingRate: energyLiveData.value.savingRate },
      }
      const data = energyData[etype]
      if (data) {
        selectedDevice.value = { ...selectedDevice.value, value: data.value, trend: data.trend, desc: data.desc, _savingRate: data.savingRate || selectedDevice.value._savingRate }
      }
    }
    // 排行弹窗打开中：用最新 item.val 重新计算分时段数据
    if (showControlPanel.value && selectedDevice.value?._rankType) {
      const rt = selectedDevice.value._rankType
      const rn = selectedDevice.value._rankItemName
      const src = rt === 'water' ? waterRank.value : rt === 'gas' ? gasRank.value : energyRank.value
      const ri = src.find(r => r.name === rn)
      if (ri) {
        selectedDevice.value = { ...selectedDevice.value, value: ri.val, periods: computeRankPeriods(rt, ri.val) }
      }
    }
  }, 8000)
})

onUnmounted(() => {
  clearInterval(timeTimer)
  clearInterval(envTimer)
  clearInterval(healthTimer)
  clearInterval(energyTimer)
  lineChart?.dispose()
  pieChart?.dispose()
  waterChart?.dispose()
  gasChart?.dispose()
  waterPieChart?.dispose()
  gasPieChart?.dispose()
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

/* 图表标题图标 */
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-icon {
  flex-shrink: 0;
}
.panel-icon.electric { color: #00d4aa; }
.panel-icon.water { color: #4fc3f7; }
.panel-icon.gas { color: #ff7043; }

/* 能源费用卡片 */
.energy-cost-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.cost-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cost-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.cost-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0,212,170,0.15);
  color: #00d4aa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.cost-info {
  flex: 1;
}
.cost-label {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 4px;
}
.cost-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 4px;
}
.cost-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}
.cost-trend.up {
  background: rgba(239,68,68,0.15);
  color: #ef4444;
}
.cost-trend.down {
  background: rgba(34,197,94,0.15);
  color: #22c55e;
}

/* 节能建议 */
.energy-tips-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.tips-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}
.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.tips-icon {
  font-size: 18px;
}
.tips-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
}
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.tip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.tip-text {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.5;
}

/* 环保卡片 */
.eco-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.eco-icon {
  font-size: 40px;
  margin-bottom: 8px;
}
.eco-title {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 8px;
}
.eco-value {
  font-size: 28px;
  font-weight: 700;
  color: #22c55e;
  margin-bottom: 4px;
}
.eco-desc {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 12px;
}
.eco-badge {
  font-size: 11px;
  color: #22c55e;
  background: rgba(34,197,94,0.15);
  padding: 4px 12px;
  border-radius: 12px;
}

/* 能源管理新样式 */
.energy-overview-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.energy-metric-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.energy-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.energy-metric-card.electric { border-left: 4px solid #00d4aa; }
.energy-metric-card.electric:hover { border-color: #00d4aa; }
.energy-metric-card.water { border-left: 4px solid #4fc3f7; }
.energy-metric-card.water:hover { border-color: #4fc3f7; }
.energy-metric-card.gas { border-left: 4px solid #ff7043; }
.energy-metric-card.gas:hover { border-color: #ff7043; }
.energy-metric-card.cost { border-left: 4px solid #ffd54f; }
.energy-metric-card.cost:hover { border-color: #ffd54f; }
.em-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.energy-metric-card.electric .em-icon { background: rgba(0,212,170,0.15); color: #00d4aa; }
.energy-metric-card.water .em-icon { background: rgba(79,195,247,0.15); color: #4fc3f7; }
.energy-metric-card.gas .em-icon { background: rgba(255,112,67,0.15); color: #ff7043; }
.energy-metric-card.cost .em-icon { background: rgba(255,213,79,0.15); color: #ffd54f; }
.em-info { flex: 1; }
.em-label { font-size: 12px; color: var(--text-3); margin-bottom: 4px; }
.em-value { font-size: 24px; font-weight: 700; color: var(--text-1); }
.em-unit { font-size: 13px; color: var(--text-3); font-weight: 400; }
.em-trend { font-size: 11px; font-weight: 600; margin-top: 4px; }
.em-trend.up { color: #ef4444; }
.em-trend.down { color: #22c55e; }

/* 图表布局 */
.chart-lg { flex: 1.5; }
.chart-sm { flex: 1; }

/* 费用明细卡片 */
.energy-cost-detail-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.cost-detail-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cost-detail-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.cdc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.cdc-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cdc-icon.electric { background: rgba(0,212,170,0.15); color: #00d4aa; }
.cdc-icon.water { background: rgba(79,195,247,0.15); color: #4fc3f7; }
.cdc-icon.gas { background: rgba(255,112,67,0.15); color: #ff7043; }
.cdc-title { font-size: 15px; font-weight: 600; color: var(--text-1); }
.cdc-body { display: flex; flex-direction: column; gap: 12px; }
.cdc-main { display: flex; align-items: baseline; gap: 8px; }
.cdc-value { font-size: 28px; font-weight: 700; color: var(--text-1); }
.cdc-label { font-size: 12px; color: var(--text-3); }
.cdc-items { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid var(--border); }
.cdc-item { display: flex; justify-content: space-between; font-size: 12px; }
.cdc-item span:first-child { color: var(--text-3); }
.cdc-item span:last-child { color: var(--text-1); font-weight: 500; }

/* 底部排行和环保 */
.energy-bottom-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
}
.rank-card { flex: 1; }
.rank-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  border-bottom: 1px solid var(--border);
}
.rank-tab {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s;
}
.rank-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.rank-icon { font-size: 16px; margin-right: 8px; }
.eco-contribute-card {
  background: linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(16,185,129,0.06) 50%, rgba(34,197,94,0.03) 100%);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s ease;
}
.eco-contribute-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(34,197,94,0.12);
  border-color: rgba(34,197,94,0.35);
}
.eco-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.eco-header .eco-icon { font-size: 20px; }
.eco-header .eco-title { font-size: 15px; font-weight: 600; color: var(--text-1); flex: 1; }
.eco-badge-tag {
  font-size: 10px;
  color: #22c55e;
  background: rgba(34,197,94,0.15);
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}
.eco-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}
.eco-stat { text-align: center; }
.eco-stat.primary .eco-value { color: #22c55e; text-shadow: 0 0 20px rgba(34,197,94,0.3); }
.eco-stat .eco-value { font-size: 28px; font-weight: 700; color: #22c55e; margin-bottom: 2px; line-height: 1.1; }
.eco-stat .eco-unit { font-size: 12px; color: var(--text-3); }
.eco-stat .eco-label { font-size: 11px; color: var(--text-3); margin-top: 2px; }
.eco-divider { width: 1px; height: 40px; background: rgba(34,197,94,0.15); }
.eco-progress-row {
  background: rgba(255,255,255,0.03);
  border-radius: var(--radius-sm);
  padding: 12px;
  margin-bottom: 12px;
}
.eco-progress-label { font-size: 12px; color: var(--text-2); display: flex; justify-content: space-between; margin-bottom: 8px; }
.eco-progress-pct { color: #22c55e; font-weight: 600; }
.eco-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}
.eco-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  border-radius: 3px;
  transition: width 0.5s ease;
}
.eco-progress-sub { font-size: 11px; color: var(--text-3); margin-top: 6px; }
.eco-tips { margin-top: auto; }
.eco-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-2);
  background: rgba(255,255,255,0.03);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
}
.eco-tip .tip-icon { font-size: 14px; }

/* ===== 场景模式（侧边栏） ===== */
.scene-modes {
  padding: 12px 0;
  border-top: 1px solid var(--border);
  margin-top: 8px;
}
.scene-modes-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 12px;
  margin-bottom: 8px;
}
.scene-mode-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
  text-align: left;
}
.scene-mode-btn:hover {
  background: rgba(0, 212, 170, 0.08);
  border-color: var(--border);
  color: var(--text);
}
.scene-mode-btn.active {
  background: var(--primary-dim);
  border-color: rgba(0, 212, 170, 0.25);
  color: var(--primary);
  box-shadow: 0 0 12px rgba(0, 212, 170, 0.1);
}
.scene-mode-btn .sm-icon {
  font-size: 16px;
  min-width: 22px;
  text-align: center;
}
.scene-mode-btn .sm-label {
  font-size: 12px;
  font-weight: 500;
}

/* ===== Toast 通知系统 ===== */
.toast-container {
  position: fixed;
  top: 70px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: 400px;
}
.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(10, 20, 38, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 212, 170, 0.05);
  pointer-events: auto;
}
.toast-item.info { border-left: 4px solid var(--secondary); }
.toast-item.success { border-left: 4px solid var(--success); }
.toast-item.warning { border-left: 4px solid var(--warning); }
.toast-item.danger { border-left: 4px solid var(--danger); }
.toast-icon { font-size: 16px; flex-shrink: 0; }
.toast-msg {
  flex: 1;
  font-size: 13px;
  color: var(--text);
  line-height: 1.4;
}
.toast-close {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 50%;
  color: var(--text-3);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}
.toast-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text);
}
.toast-fade-enter-active { animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-fade-leave-active { animation: toastSlideOut 0.25s ease forwards; }
@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(40px) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes toastSlideOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(40px) scale(0.95); }
}
</style>
