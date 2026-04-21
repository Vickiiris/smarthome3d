# 🏠 Smart Home 3D Dashboard

基于 Vue 3 + Three.js 的智能家居可视化管理平台，支持 3D 场景漫游、设备实时控制、环境监测与能源管理。

![Vue](https://img.shields.io/badge/Vue-3.5-green)
![Three.js](https://img.shields.io/badge/Three.js-0.162-orange)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

---

## ✨ 功能一览

### 🎮 3D 场景漫游
- GLB 模型渲染，房间级视角切换（客厅 / 主卧 / 次卧 / 厨房 / 卫生间）
- 设备热区顶牌，悬浮显示状态，点击弹出控制面板
- GSAP 平滑相机动画，全屏沉浸模式

### 🌡️ 环境总览
- 温湿度、CO₂、PM2.5、光照等 8 项实时指标
- 照明调光 / 色温、空调温控 / 风速、电视 / 音箱音量、安防布防状态

### ⚡ 能源管理
- 用电 / 用水 / 燃气趋势图（面积图、柱状图、折线图）
- 能源结构环形图（用电 / 用水 / 燃气分项占比）
- 设备能耗排行 + 分时段耗能明细、费用统计

### 📱 设备管理
- 按类型 / 状态筛选搜索，支持扫码添加和手动录入
- 设备详情弹窗（型号 / IP / 协议 / 固件 / 信号强度）

### 🏪 产品中心
- 产品目录 + 接入状态（已接入 / 待接入 / 离线）

### 💓 健康监测
- 心率 24h 波形图、周血压趋势、健康评分

### 🔔 策略告警
- 告警等级分类（危险 / 警告 / 提示）、执行记录、自动化策略配置

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) + Vite 5 |
| 3D | Three.js + DRACO 解码器 |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 动画 | GSAP |
| 图表 | ECharts 6 |
| UI | Element Plus |
| 样式 | 原生 CSS（CSS 变量） |

---

## 📁 项目结构

```
smart-home-3d-converted/
├── index.html                  # 入口 HTML，加载动画逻辑内联于此
├── package.json
├── pnpm-lock.yaml
├── vite.config.js
├── public/
│   ├── favicon.svg
│   ├── models/model.glb        # 3D 房屋 GLB 模型
│   ├── texture/
│   │   ├── bg.png              # 热区背景图
│   │   ├── skybox_box.hdr       # HDR 环境贴图
│   │   └── ↓.png                # 热区箭头图标
│   └── draco/                  # DRACO 压缩模型解码器
└── src/
    ├── main.js
    ├── App.vue
    ├── assets/styles/main.css  # 全局样式 + CSS 变量 + 字体声明
    ├── router/index.js          # 路由（单路由：HomeView）
    ├── stores/homeStore.js     # 全局状态
    ├── composables/
    │   └── useThreeScene.js    # Three.js 场景封装
    ├── components/
    │   ├── DeviceControlModal.vue  # 设备详情 / 新增设备弹窗
    │   ├── DeviceControlPanel.vue  # 3D 场景右侧滑入控制面板
    │   └── pages/
    │       ├── AlarmPage.vue       # 告警策略
    │       ├── AppSidebar.vue       # 侧边导航栏
    │       ├── DevicePage.vue       # 设备管理
    │       ├── EnergyPage.vue       # 能源管理
    │       ├── EnvPage.vue         # 环境总览
    │       ├── HealthPage.vue       # 健康监测
    │       ├── HomeModals.vue       # 首页弹窗集合
    │       ├── ProductPage.vue       # 产品中心
    │       ├── ToastContainer.vue   # 通知提示
    │       └── TopBar.vue           # 顶栏
    └── views/
        └── HomeView.vue             # 主视图（所有页面组件挂载于此）
```

---

## 🎨 设计规范

### 色彩系统

| 变量 | 值 | 用途 |
|------|----|------|
| `--primary` | `#00d4aa` | 主色调（青绿） |
| `--bg` | `#050d18` | 深色背景 |
| `--surface` | `rgba(255,255,255,0.04)` | 卡片背景 |
| `--border` | `rgba(255,255,255,0.08)` | 边框 |
| `--text-1` | `#e2e8f0` | 主文字 |
| `--text-2` | `#94a3b8` | 次要文字 |
| `--text-3` | `#64748b` | 辅助文字 |

### 能源色系

| 类型 | 主色 | 图表色 |
|------|------|--------|
| 用电 | `#00d4aa` | 青绿渐变 |
| 用水 | `#4fc3f7` | 蓝色系 |
| 燃气 | `#ff7043` | 橙红色系 |

---

## 🚀 快速开始

```bash
# 安装依赖（项目使用 pnpm）
pnpm install

# 开发服务器
pnpm dev

# 生产构建
pnpm build

# 预览生产构建
pnpm preview
```

---

## ⚙️ 核心配置

### Three.js 场景参数

```javascript
// useThreeScene.js
const INITIAL_CAMERA = {
  pos: new THREE.Vector3(0, 3.84, 6),     // 相机初始位置
  target: new THREE.Vector3(0, -0.16, 0)  // 相机观察目标
}

const HDR_PATH = '/texture/skybox_box.hdr'   // HDR 环境贴图
const DRACO_PATH = '/draco/'                   // DRACO 解码器
```

### 灯光配置

```javascript
const LIGHT_CONFIG = {
  ambientIntensity: 0.03,      // 环境光
  hemisphereIntensity: 0.05,    // 半球光
  directionalIntensity: 0.35,   // 主光源（投射阴影）
  fillIntensity: 0.05,         // 补光
  pointIntensity: [0.05, 0.12], // 点光源
  envIntensity: 0.05           // HDR 环境强度
}
```

---

## 📄 License

MIT License

---

**Made with ❤️ by zy**
