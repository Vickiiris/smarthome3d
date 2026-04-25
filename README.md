# 🏠 Smart Home 3D — 智能家居 3D 可视化管理平台

基于 Vue 3 + Three.js 的智能家居 3D 可视化管理平台，支持 3D 场景漫游、设备实时控制、环境监测、能源管理、健康监测与策略告警。

![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs)
![Three.js](https://img.shields.io/badge/Three.js-0.162-black?logo=threedotjs)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-2-FFC0CB)
![ECharts](https://img.shields.io/badge/ECharts-6-AA344D)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm)

---

## ✨ 功能概览

| 模块 | 功能 |
|------|------|
| 🌤 **环境总览** | 3D 房屋漫游、房间级视角切换、8 项环境实时指标、热区交互 |
| ⚡ **能源管理** | 用电/水/气 24h 趋势图、结构饼图、设备能耗排行、费用统计、环保贡献 |
| 📱 **设备管理** | 26 台设备管控、9 类设备控制组件、扫码/手动添加、网关/Mesh 在线区分 |
| ❤️ **健康监测** | 6 项核心指标、实时步数模拟、心率/血压/血氧图表、睡眠分析、健康评分 |
| 🔔 **策略告警** | 设备/健康告警分级、12 条自动化策略、多维度筛选分页 |
| 🏠 **场景模式** | 回家/离家/睡眠一键切换、3D 灯光实时联动 |

---

## 🛠 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | 3.5 |
| 构建工具 | Vite | 5 |
| 3D 渲染 | Three.js + DRACO 解码器 | 0.162 |
| 3D 集成 | TresJS Core + Cientos | 4.x |
| 状态管理 | Pinia | 2 |
| 路由 | Vue Router | 4 |
| 动画 | GSAP | 3 |
| 图表 | ECharts | 6 |
| UI 组件 | Element Plus | 2 |
| 包管理 | pnpm | 10 |
| 样式 | 原生 CSS（CSS 变量主题系统） | — |
| 字体 | JetBrains Mono + Orbitron | — |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8（推荐 10.x）

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/Vickiiris/smarthome3d.git
cd smarthome3d

# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:3000）
pnpm dev

# 生产构建
pnpm build

# 预览生产构建
pnpm preview
```

> ⚠️ 项目使用 `shamefully-hoist=true`（`.npmrc`），因为 Vite + Element Plus 自动导入插件需要依赖提升。请勿删除此配置。

---

## 📁 项目结构

```
smarthome3d/
├── index.html                        # 入口 HTML（内联加载动画 + 进度条）
├── package.json
├── vite.config.js                    # Vite 配置（自动导入、路径别名）
├── .npmrc                            # pnpm 配置（shamefully-hoist）
├── public/
│   ├── models/model.glb              # 3D 房屋 GLB 模型（DRACO 压缩）
│   ├── texture/                      # HDR 环境贴图、热区图标
│   ├── draco/                        # DRACO 压缩模型解码器
│   ├── fonts/                        # JetBrains Mono + Orbitron 字体
│   └── favicon.svg
└── src/
    ├── main.js                       # 应用入口
    ├── App.vue                       # 根组件
    ├── assets/styles/
    │   ├── main.css                  # 全局样式 + CSS 变量主题
    │   └── partitions/              # 分区样式（12 个模块）
    ├── router/index.js               # 路由配置（单页面）
    ├── stores/homeStore.js           # Pinia 全局状态（环境模拟 + Toast）
    ├── views/
    │   └── HomeView.vue              # 主视图（页面调度 + Three.js 挂载 + 定时器）
    ├── composables/                  # 逻辑复用模块（10 个）
    │   ├── useThreeScene.js          # Three.js 场景封装（模型加载/热点/灯光/相机动画）
    │   ├── useHealthCharts.js        # 健康图表 ECharts 初始化与更新
    │   ├── useDeviceControl.js       # 设备管理/控制/筛选/新增
    │   ├── useAppData.js             # 数据定义：设备/健康/告警/策略/产品
    │   ├── useEnergyChart.js         # 能源图表数据生成（24h 公式模型）
    │   ├── useEnergyDetail.js        # 能源弹窗费用计算（费率常量 + 月度估算）
    │   ├── useEnvDetail.js           # 环境详情/颜色/健康建议
    │   ├── useStepsSim.js            # 步数实时模拟（追赶机制 + 小时分布权重）
    │   ├── useAlarm.js               # 告警/策略筛选分页
    │   └── useSceneModes.js          # 场景模式切换 + 3D 灯光同步
    └── components/
        ├── DeviceControlModal.vue    # 设备控制弹窗（能源详情双栏/单栏）
        ├── DeviceControlPanel.vue    # 3D 场景右侧滑入控制面板
        ├── controls/                 # 设备控制子组件（9 个）
        │   ├── LightControls.vue     # 灯光亮度
        │   ├── AcControls.vue        # 空调温度/模式/风速
        │   ├── SensorControls.vue    # 传感器状态
        │   ├── TvControls.vue        # 电视音量/模式
        │   ├── SpeakerControls.vue   # 音箱音量
        │   ├── VentilControls.vue    # 新风风速/模式
        │   ├── WasherControls.vue    # 洗碗机状态/模式
        │   ├── HeaterControls.vue    # 热水器温度/模式
        │   └── EnergyDetail.vue      # 能源详情面板
        ├── health/                   # 健康页面子组件（3 个）
        │   ├── HealthHero.vue        # 人物卡片 + 健康评分环
        │   ├── HealthMetrics.vue     # 核心指标网格
        │   └── HealthTips.vue        # 健康建议卡片
        └── pages/                    # 页面组件（10 个）
            ├── AppSidebar.vue        # 侧边导航栏
            ├── TopBar.vue            # 顶栏
            ├── ToastContainer.vue    # Toast 通知系统
            ├── EnvPage.vue           # 环境总览页
            ├── EnergyPage.vue        # 能源管理页
            ├── DevicePage.vue        # 设备管理页
            ├── ProductPage.vue       # 产品中心页
            ├── HealthPage.vue        # 健康监测页
            ├── AlarmPage.vue         # 策略告警页
            └── HomeModals.vue        # 首页弹窗集合
```

---

## 🎯 功能模块详解

### 🌤 环境总览

- GLB 模型渲染（DRACO 压缩），房间级视角切换（客厅/主卧/次卧/厨房/卫生间）
- 设备热区顶牌，悬浮显示状态，点击弹出控制面板
- GSAP 平滑相机动画，全屏沉浸模式
- 温湿度、CO₂、PM2.5、光照、空气质量等 8 项实时指标
- 环境数据实时模拟（随机波动 + 告警检测）

### ⚡ 能源管理

- 用电/用水/燃气 24h 趋势图（基于数学公式模型实时计算，非静态数据）
  - 日总量：`W_day = 7.0 × (1 + 0.2×R₁)`，R₁∈[-1,1]
  - 小时值：`W_h = W_h0 × (1 + 0.2×R₂)`，24h 占比系数求和 = 1
- 能源结构饼图（日/周/月/年周期切换）
- 设备能耗排行 + 分时段耗能明细
- 费用统计弹窗（双栏布局：今日 + 月度估算）
  - 电费 0.558 元/kWh | 水费 2.47 元/m³ | 燃气 2.53 元/m³
- 环保贡献（碳减排、等效植树）
- 历史对比（昨日/七日/月度/去年同比横向柱状图）

### 📱 设备管理

- 26 台设备，9 种类型（灯光/空调/传感器/电视/音箱/新风/洗碗机/热水器/插座/安防）
- 按房间/类型/状态筛选，关键词搜索，分页展示
- 设备详情弹窗（型号/IP/协议/固件/信号强度）
- 新增设备：手动录入 + 网络扫描模拟
- **网关设备**（sensor/security/light/outlet）始终在线；**Mesh 设备**（ac/tv/speaker 等）断电即离线
- 产品目录 + 接入状态管理

### ❤️ 健康监测

- 心率/血压/血氧/体温/步数/睡眠 6 项核心指标
- ECharts 图表：心率 24h 波形、血压周趋势、血氧/体温趋势
- **步数实时模拟系统**：
  - 24 小时分布权重（早 8 点至晚 11 点模拟活动）
  - 追赶模式（20 点前落后超 5% 自动 1.5 倍加速）
  - 达标后极缓慢增长，封顶目标 120%
  - 每 4 秒更新一次
- 睡眠分析（深睡/浅睡/REM 阶段时间条）
- 健康评分环 + 人物卡片

### 🔔 策略告警

- 设备告警 + 健康告警双分类
- 告警等级筛选（严重/警告/提示）+ 状态筛选
- 12 条自动化策略（温控/离家/定时/阈值/复合触发）
- 策略执行统计

### 🏠 场景模式

- 回家模式：打开客厅灯 + 空调 26°C + 热水器
- 离家模式：关闭所有灯/空调/家电，锁定门禁
- 睡眠模式：关灯 + 空调 26°C + 客厅留夜灯 10%
- 一键切换，自动调整设备状态
- 3D 场景灯光实时联动（6 盏灯独立控制）

---

## 🎨 设计系统

### CSS 变量

| 变量 | 值 | 用途 |
|------|------|------|
| `--primary` | `#00d4aa` | 主色调（青绿） |
| `--bg` | `#050d18` | 深色背景 |
| `--surface` | `rgba(255,255,255,0.04)` | 卡片背景 |
| `--border` | `rgba(255,255,255,0.08)` | 边框 |
| `--text-1` | `#e2e8f0` | 主文字 |
| `--text-2` | `#94a3b8` | 次要文字 |
| `--text-3` | `#64748b` | 辅助文字 |

### 能源配色

| 类型 | 主色 | 图表色 |
|------|------|--------|
| 用电 | `#00d4aa` | 青绿渐变 |
| 用水 | `#4fc3f7` | 蓝色系 |
| 燃气 | `#ff7043` | 橙红色系 |
| 费用 | `#ffd54f` | 金色系 |

---

## 🏗 架构设计

### 数据流

```
HomeView.vue (主视图)
  ├── useThreeScene()    ← Three.js 场景管理
  ├── useAppData()       ← 设备/健康/告警/策略/产品数据
  ├── useDeviceControl() ← 设备控制逻辑
  ├── useEnergyChart()   ← 能源图表数据生成
  ├── useEnergyDetail()  ← 能源费用计算
  ├── useStepsSim()      ← 步数模拟
  ├── useHealthCharts()  ← 健康图表
  ├── useSceneModes()    ← 场景模式
  └── useAlarm()         ← 告警筛选
        │
        ▼
  Pinia Store (homeStore)
        │
        ▼
  各页面组件 + 弹窗组件
```

### 弹窗架构

| 弹窗 ID | 宽度 | 布局 | 触发方式 |
|---------|------|------|---------|
| `energy-cost` | 360px | 单列 | 能源指标卡片点击 |
| `energy-cost-total` | 720px | 双栏（今日+月度） | 费用总计卡片点击 |
| `energy-electricCost` | 720px | 双栏（今日+月度） | 电费卡片点击 |
| `energy-waterCost` | 720px | 双栏（今日+月度） | 水费卡片点击 |
| `energy-gasCost` | 720px | 双栏（今日+月度） | 燃气费卡片点击 |
| 设备弹窗 | 360px | 单列 | 3D 热点/设备列表点击 |

### 定时器

| 定时器 | 间隔 | 功能 |
|--------|------|------|
| `envTimer` | 5s | 环境数据波动 + 告警检测 |
| `healthTimer` | 4s | 健康数据波动 + 步数模拟 |
| `energyTimer` | 5s | 能源图表数据更新 |

---

## 🔧 开发说明

### 换行符

项目源文件使用 **CRLF** 换行符（Windows 环境）。编辑文件时请保持一致，字符串替换操作需匹配 CRLF。

### 精度约定

- 卡片数值：`.toFixed(2)`
- 弹窗数值：`.toFixed(3)`

### 自动导入

项目配置了 `unplugin-auto-import` 和 `unplugin-vue-components`：

- Vue / Vue Router / Pinia API 自动导入，无需手动 `import { ref } from 'vue'`
- Element Plus 组件按需自动导入

---

## 📄 License

MIT License
