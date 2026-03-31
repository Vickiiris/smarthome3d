# 🏠 Smart Home 3D Dashboard

基于 Vue 3 + Three.js 的智能家居可视化管理平台，支持 3D 场景漫游、设备实时控制、环境监测与能源管理。

---

## ✨ 功能概览

| 模块 | 功能 |
|------|------|
| **3D 场景** | 全屋漫游、房间切换、设备顶牌悬浮显示 |
| **环境总览** | 温湿度/空气质量实时监测、设备控制（照明/空调/娱乐）、安防状态 |
| **能源管理** | 实时用电、月度趋势、房间用电分布 |
| **设备管理** | 设备列表（筛选/搜索/分页）、控制面板、详情查看、新增设备 |
| **产品中心** | 产品目录（已接入/待接入/未接入）、产品详情 |
| **健康监测** | 心率趋势、血压分布、健康建议 |

---

## 🛠 技术栈

- **框架**：Vue 3 (Composition API)
- **构建**：Vite 5
- **3D 渲染**：Three.js
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **样式**：原生 CSS（CSS 变量主题）

---

## 📁 项目结构

```
smart-home-3d-converted/
├── public/
│   ├── models/          # 3D 模型文件（.glb）
│   └── texture/         # 顶牌贴图资源
├── src/
│   ├── assets/styles/   # 全局样式（main.css）
│   ├── components/
│   │   ├── DeviceControlModal.vue   # 设备控制弹窗
│   │   └── DeviceControlPanel.vue  # 3D 场景右侧控制面板
│   ├── composables/
│   │   └── useThreeScene.js        # Three.js 场景逻辑
│   ├── router/index.js             # 路由配置
│   ├── stores/homeStore.js         # 能源数据 Store
│   └── views/HomeView.vue          # 主视图（所有页面）
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎨 设计规范

| 变量 | 值 | 用途 |
|------|----|------|
| `--primary` | `#00d4aa` | 主色调（青绿） |
| `--bg` | `#050d18` | 背景色 |
| `--border` | `rgba(255,255,255,0.08)` | 边框 |
| `--text-1` | `#e2e8f0` | 主文字 |
| `--text-2` | `#94a3b8` | 次要文字 |

---

## 📦 设备类型说明

### 网关设备（始终在线）
`sensor` · `security` · `ventil` · `light` · `outlet`

### Mesh 设备（断电离线）
`ac` · `tv` · `speaker` · `washer` · `heater`

---

## 📄 License

MIT
