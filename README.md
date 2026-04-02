# 🏠 Smart Home 3D Dashboard

基于 Vue 3 + Three.js 的智能家居可视化管理平台，支持 3D 场景漫游、设备实时控制、环境监测与能源管理。

![版本](https://img.shields.io/badge/version-0.1.0-blue)
![Vue](https://img.shields.io/badge/Vue-3.4+-green)
![Three.js](https://img.shields.io/badge/Three.js-0.162-orange)

---

## ✨ 核心功能

### 🎮 3D 场景漫游
- **全屋可视化**：基于 GLB 模型的 3D 房屋场景
- **房间切换**：支持客厅、主卧、次卧、厨房、卫生间等房间独立视角
- **设备顶牌**：悬浮显示设备状态，点击可控制
- **相机动画**：平滑过渡的房间切换动画（GSAP）
- **全屏模式**：支持全屏沉浸式体验

### 🌡️ 环境总览
- **实时监测**：室内外温湿度、CO₂浓度、PM2.5、光照等 8 项指标
- **设备控制**：
  - 照明：亮度调节、色温控制
  - 空调：温度调节、模式切换、风速控制
  - 娱乐：电视/音箱音量、画面模式
  - 安防：门锁、摄像头、传感器状态
- **安防监控**：实时状态显示，异常告警

### ⚡ 能源管理
- **核心指标**：今日用电/用水/燃气/费用
- **趋势图表**：
  - 用电：面积图（渐变填充）
  - 用水：柱状图
  - 燃气：虚线折线图
- **结构分析**：
  - 用电：环形图
  - 用水：横向条形图
  - 燃气：玫瑰图（南丁格尔图）
- **费用明细**：电费/水费/燃气费分时段明细
- **能耗排行**：设备用电/用水/燃气排行，点击显示分时段耗能
- **节能建议**：智能节能提示
- **环保贡献**：CO₂减排量、相当于植树数量

### 📱 设备管理
- **设备列表**：支持按类型/状态筛选、搜索、分页
- **控制面板**：
  - 通用：电源开关、设备信息
  - 空调：温度、模式、风速
  - 电视：音量、画面模式
  - 音箱：音量控制
  - 抽油烟机：档位调节
  - 洗碗机：洗涤模式
  - 热水器：水温设置
  - 安防：解锁开关、视频对讲
- **新增设备**：支持扫码添加、手动添加

### 🏪 产品中心
- **产品目录**：按类别展示智能家居产品
- **接入状态**：已接入 / 待接入 / 未接入
- **产品详情**：规格参数、协议信息、信号强度

### 💓 健康监测
- **心率趋势**：24小时心率波形图
- **血压分布**：周血压统计（收缩压/舒张压）
- **健康建议**：个性化健康提示
- **告警记录**：心率异常、久坐提醒等

---

## 🛠 技术栈

| 类别 | 技术 |
|-----|------|
| **前端框架** | Vue 3 (Composition API) |
| **构建工具** | Vite 5 |
| **3D 引擎** | Three.js |
| **状态管理** | Pinia |
| **路由** | Vue Router 4 |
| **动画** | GSAP |
| **图表** | ECharts 6 |
| **UI 组件** | Element Plus |
| **样式** | 原生 CSS（CSS 变量主题） |

---

## 📁 项目结构

```
smart-home-3d-converted/
├── public/
│   ├── models/              # 3D 模型文件（Room_01.glb）
│   ├── texture/             # 环境贴图（HDR）
│   └── draco/               # DRACO 压缩解码器
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css     # 全局样式、CSS 变量
│   ├── components/
│   │   ├── DeviceControlModal.vue   # 设备控制弹窗（模态）
│   │   └── DeviceControlPanel.vue   # 3D 场景右侧控制面板（滑入）
│   ├── composables/
│   │   └── useThreeScene.js         # Three.js 场景逻辑封装
│   ├── router/
│   │   └── index.js                 # 路由配置
│   ├── stores/
│   │   └── homeStore.js             # 全局状态（能源数据等）
│   └── views/
│       └── HomeView.vue             # 主视图（所有页面）
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎨 设计规范

### 色彩系统
| 变量 | 值 | 用途 |
|-----|----|------|
| `--primary` | `#00d4aa` | 主色调（青绿） |
| `--bg` | `#050d18` | 深色背景 |
| `--surface` | `rgba(255,255,255,0.04)` | 卡片背景 |
| `--border` | `rgba(255,255,255,0.08)` | 边框 |
| `--text-1` | `#e2e8f0` | 主文字 |
| `--text-2` | `#94a3b8` | 次要文字 |
| `--text-3` | `#64748b` | 辅助文字 |

### 能源颜色
| 能源类型 | 颜色 | 用途 |
|---------|------|------|
| 用电 | `#00d4aa` | 绿色系 |
| 用水 | `#4fc3f7` | 蓝色系 |
| 燃气 | `#ff7043` | 橙红色系 |

---

## 📦 设备类型说明

### 网关设备（始终在线）
开关不影响 `online` 状态
- `sensor` - 传感器
- `security` - 安防设备
- `ventil` - 抽油烟机
- `light` - 照明
- `outlet` - 插座

### Mesh 设备（断电离线）
`status=false` 时 `online=false`
- `ac` - 空调
- `tv` - 电视
- `speaker` - 音箱
- `washer` - 洗碗机
- `heater` - 热水器

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

---

## 📊 能源数据结构

```javascript
// 能耗排行数据
const energyRank = [
  { name: '空调', val: 3.2, pct: 100, color: '#4fc3f7', icon: '❄️', unit: 'kWh' },
  { name: '冰箱', val: 1.8, pct: 56,  color: '#81c784', icon: '🧊', unit: 'kWh' },
  ...
]

// 分时段耗能（点击排行显示）
const periods = [
  { label: '凌晨 00:00-06:00', value: '0.48', pct: 15, color: '#81c784' },
  { label: '早晨 06:00-09:00', value: '0.58', pct: 18, color: '#4fc3f7' },
  ...
]
```

---

## 🔧 配置说明

### 3D 场景配置
```javascript
// useThreeScene.js
const INITIAL_CAMERA = {
  pos: new THREE.Vector3(0, 3.84, 6),    // 相机位置
  target: new THREE.Vector3(0, -0.16, 0) // 观察目标
}

// HDR 环境贴图路径
const HDR_PATH = '/texture/skybox_box.hdr'

// DRACO 解码器路径
const DRACO_PATH = '/draco/'
```

### 灯光配置
```javascript
const LIGHT_CONFIG = {
  ambientIntensity: 0.03,      // 环境光
  hemisphereIntensity: 0.05,   // 半球光
  directionalIntensity: 0.35,  // 主光源（投射阴影）
  fillIntensity: 0.05,         // 补光
  pointIntensity: [0.05, 0.12], // 点光源范围
  envIntensity: 0.05           // HDR 环境强度
}
```

---

## 📝 更新日志

### 2026-04-02
- ✅ 能源管理页面全面重构
- ✅ 新增用水/燃气图表（柱状图、玫瑰图）
- ✅ 能耗排行支持分时段耗能明细
- ✅ 费用明细卡片（电费/水费/燃气费）
- ✅ 节能建议与环保贡献模块

### 2026-04-01
- ✅ 设备控制面板完善（电视/音箱/洗碗机/热水器）
- ✅ 3D 场景顶牌位置优化
- ✅ 灯光系统调优

---

## 📄 License

MIT License

---

**Made with ❤️ by zy**
