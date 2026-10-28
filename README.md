# 🏠 SmartHome3D — 智能家居 3D 可视化平台

在浏览器里漫游一套 3D 户型：点热点开灯、调空调温度、看环境与能耗数据。全部基于前端模拟数据，**无需后端即可完整运行**。

线上演示：<https://home3d.site/>

![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vuedotjs)
![Three.js](https://img.shields.io/badge/Three.js-0.162-black?logo=threedotjs)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-2-FFC0CB)
![ECharts](https://img.shields.io/badge/ECharts-6-AA344D)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm)

---

## ✨ 功能一览

| 模块 | 能力 |
|------|------|
| 🌤 **环境总览** | 3D 户型漫游、6 个房间视角切换、8 项环境指标、设备热点、全屏沉浸模式 |
| ⚡ **能源管理** | 电/水/气 24h 趋势、能源结构饼图、设备能耗排行、费用计算、环保贡献 |
| 📱 **设备管理** | 27 台设备 / 11 种类型，筛选搜索分页、详情、手动添加与网络扫描 |
| ❤️ **健康监测** | 6 项指标、心率/血压/血氧图表、步数实时模拟、睡眠分析、健康评分 |
| 🔔 **策略告警** | 设备/健康双分类、级别与状态筛选、12 条自动化策略、执行统计 |
| 🏠 **场景模式** | 明亮 / 回家 / 离家 / 睡眠，一键切换并联动 3D 灯光 |
| 🎬 **电器动效** | 空调冷风热风、油烟机抽风、电视开机画面、音响音符、洗衣机与洗碗机开门 |
| 🔌 **供电联动** | 插座断电则受电设备禁止开机、关插座级联断电、场景模式自动接通 |

---

## 🛠 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） | 3.4 |
| 构建 | Vite | 5 |
| 3D | Three.js（GLTFLoader / DRACOLoader / CSS2DRenderer / OrbitControls） | 0.162 |
| 状态 | Pinia | 2 |
| 路由 | Vue Router（单页应用，一个路由） | 4 |
| 动画 | GSAP（相机补间） | 3 |
| 图表 | ECharts | 6 |
| 图标 | Emoji（统一走 `AppIcon` 组件渲染） | — |
| 样式 | 原生 CSS，分区维护 + CSS 变量主题 | — |
| 包管理 | pnpm | 10 |

> 3D 部分直接用 Three.js 原生 API 封装（`useThreeScene.js`），没有引入 TresJS 等封装层。

---

## 🚀 快速开始

```bash
git clone https://github.com/Vickiiris/smarthome3d.git
cd smarthome3d
pnpm install

pnpm dev       # 开发服务器 http://localhost:3000
pnpm build     # 生产构建 → dist/
pnpm preview   # 本地预览构建产物
```

要求 Node.js ≥ 18、pnpm ≥ 8。首次打开需要下载 5.9MB 的 GLB 模型，加载页会显示进度。

---

## 📁 项目结构

```
smarthome3d/
├── index.html                  # 入口（内联加载动画 + OG 分享卡片）
├── vite.config.js              # 自动导入、@ 别名、base './'
├── tools/                      # 资源处理脚本（GLB 贴图重编码、HDR 压缩）
├── public/
│   ├── models/model.glb        # 3D 户型（DRACO 压缩，5.9MB）
│   ├── texture/                # HDR 环境贴图、热区图标
│   ├── draco/                  # DRACO 解码器
│   ├── fonts/                  # JetBrains Mono + Orbitron
│   ├── _headers                # 静态托管缓存策略
│   └── og-cover.png
└── src/
    ├── main.js / App.vue
    ├── router/index.js
    ├── stores/homeStore.js     # 环境数据模拟、告警队列、Toast
    ├── views/HomeView.vue      # 主视图：页面调度、composable 装配、定时器
    ├── assets/styles/
    │   ├── main.css            # 入口，按序 @import 分区
    │   └── partitions/         # 01-base … 13-responsive（13 个分区）
    ├── composables/            # 逻辑层（11 个）
    │   ├── useThreeScene.js    # 场景/相机/灯光/热点/特效挂载
    │   ├── useModelEffects.js  # 电器动效（空调雾气、抽风、音符、开门…）
    │   ├── useAppData.js       # 设备/健康/告警/策略/产品数据 + POWER_MAP
    │   ├── useDeviceControl.js # 设备开关、供电守卫、筛选分页
    │   ├── useSceneModes.js    # 场景模式动作 + 3D 灯光同步
    │   ├── useEnvDetail.js     # 环境详情、颜色分级、健康建议
    │   ├── useEnergyChart.js   # 能源 24h 曲线（公式模型）
    │   ├── useEnergyDetail.js  # 费用计算与月度估算
    │   ├── useHealthCharts.js  # 健康图表
    │   ├── useStepsSim.js      # 步数模拟（小时权重 + 追赶）
    │   └── useAlarm.js         # 告警筛选与分页
    └── components/
        ├── common/             # AppIcon（emoji）、EmptyState
        ├── pages/              # 6 个页面 + 侧栏/顶栏/通知/Toast/弹窗集合
        ├── health/             # 健康页三段式（人物卡 / 指标 / 建议）
        ├── controls/           # 设备管理页的控制组件（9 个）
        ├── panel/              # 3D 热点面板里的控制组件（10 个）
        ├── DeviceControlModal.vue  # 设备管理页弹窗
        └── DeviceControlPanel.vue  # 3D 热点抽屉
```

---

## 🎯 模块详解

### 🌤 环境总览

- GLB 户型渲染，相机按包围盒自适应取景，6 个房间（全景/客厅/主卧/次卧/厨房/卫生间/阳台）平滑切换
- 设备热点以 CSS2D 标签跟随 3D 坐标，按距离自动收缩为紧凑图标
- 点击热点：相机推近 + 打开右侧控制面板
- 8 项指标：室内外温湿度、CO₂、PM2.5、光照、空气质量，每 3 秒波动并触发告警
- 全屏模式：桌面从顶栏下方铺满，手机端覆盖底部导航

### ⚡ 能源管理

- 24h 曲线不是静态数据，而是按公式实时生成：日总量 `W = 7.0 × (1 + 0.2R₁)`，小时值再按占比系数分配
- 结构饼图支持日/周/月/年切换
- 费用弹窗：电 0.558 元/kWh、水 2.47 元/m³、燃气 2.53 元/m³，含月度估算
- 设备能耗排行、分时段明细、历史对比、碳减排与等效植树

### 📱 设备管理

- 27 台设备、11 种类型：`ac / light / outlet / sensor / security / tv / speaker / ventil / washer / washing / heater`
- 房间 × 类型 × 状态筛选 + 关键词搜索 + 分页
- 网关类（sensor/security/light/outlet）常在线；Mesh 类（空调/电视/音箱等）关机即离线
- 新增设备：手动录入或"网络扫描"模拟发现

### ❤️ 健康监测

- 心率/血压/血氧/体温/步数/睡眠 6 项，图表随定时器更新
- 步数模拟：24h 小时权重分布；20 点前落后超 5% 自动 1.5 倍追赶；达标后封顶目标 120%
- 睡眠分期条、健康评分环、健康建议卡片

### 🔔 策略告警

- 设备告警与健康告警双 Tab，级别（严重/警告/提示）+ 状态（未处理/已处理）筛选
- 12 条自动化策略（温控、离家、定时、阈值、复合触发），展示触发次数与执行统计

### 🏠 场景模式

| 模式 | 动作 |
|------|------|
| ☀️ 明亮 | 全屋 6 盏灯全开、亮度 100% |
| 🏠 回家 | 客厅灯 + 空调 26°C + 热水器 |
| 🔒 离家 | 关闭所有灯/空调/家电，锁定门禁 |
| 🌙 睡眠 | 关灯、空调 26°C、客厅留 10% 夜灯 |

桌面在左侧栏触发；手机（≤900px）侧栏变底部导航后，改为家居总览页顶部的场景条。

### 🎬 电器动效

| 设备 | 效果 |
|------|------|
| 空调（主卧/次卧） | 制冷蓝白冷雾下沉、制热暖雾上浮、送风近无色 |
| 抽油烟机 | 风粒子沿油烟口流动 |
| 电视 | 开机播放动态画面，关机切灰屏并熄屏 |
| 蓝牙音响 | 音符上浮摆动 |
| 洗衣机 / 洗碗机 | 舱门绕铰链开启，洗碗机含内腔贴图 |

动效全部由 `useModelEffects.js` 在渲染循环里驱动，`HomeView` 只下发开关状态。

---

## 🔌 插座供电联动

只有客厅/卧室的两路空调插座参与供电建模，其余为总线直连：

| 插座 | 受电设备 |
|------|----------|
| 空调插座A（主卧） | 主卧空调 |
| 空调插座B（次卧） | 次卧空调 |

联动规则：

1. 插座断电 → 设备禁止开机（开关弹回 + 提示"请先接通插座"），弹窗内显示断电警告
2. 插座断电 → 受电设备视为离线
3. 关闭插座 → 级联关闭正在运行的受电设备
4. 场景模式需要开机时，**自动先接通插座**（手动操作拦截，自动化放行）

---

## 📱 响应式设计

| 断点 | 变化 |
|------|------|
| ≤1180px | 底部两栏合并为单栏，图表区单列 |
| ≤900px | 侧栏 → 底部导航；热点面板 → 底部卡片；设备/添加弹窗 → 底部抽屉 |
| ≤760px | 指标卡 2 列；设备表隐藏厂商/IP；产品与能源卡 2 列；热点面板变半高悬浮卡片（46%，四周留白） |
| ≤380px | 健康建议卡改单列 |
| 横屏（高度 ≤520px） | 回到桌面布局：左侧竖栏 + 右侧内容，指标 4 列、设备与安防并排，热点为右侧浮动卡片 |

触摸交互：

- **竖向滑动** → 滚动页面（3D 画布同样生效，不会"抢"走手势）
- **横向拖动** → 旋转模型
- **双指** → 缩放

---

## 🎨 设计系统

| 变量 | 值 | 用途 |
|------|-----|------|
| `--primary` | `#00d4aa` | 主色（青绿） |
| `--bg` | `#050d18` | 页面底色 |
| `--surface` | `rgba(255,255,255,.04)` | 卡片背景 |
| `--border` | `rgba(255,255,255,.08)` | 描边 |
| `--text` / `--text-2` / `--text-3` | `#e2e8f0` / `#94a3b8` / `#475569` | 三档文字 |
| `--warning` / `--danger` / `--success` | `#f59e0b` / `#ef4444` / `#22c55e` | 状态色 |

能源配色：电 `#00d4aa`、水 `#4fc3f7`、燃气 `#ff7043`、费用 `#ffd54f`。

字体：数值用 JetBrains Mono，标题用 Orbitron。

---

## 🏗 架构

```
HomeView.vue
 ├── useThreeScene()      3D 场景、相机、灯光、热点、特效
 ├── useModelEffects()    电器动效
 ├── useAppData()         数据定义（设备 / 健康 / 告警 / 策略 / 产品 / POWER_MAP）
 ├── useDeviceControl()   开关、供电守卫、筛选分页
 ├── useSceneModes()      场景动作 + 灯光同步
 ├── useEnvDetail / useEnergyChart / useEnergyDetail / useHealthCharts / useStepsSim / useAlarm
 │
 ▼
homeStore（Pinia：环境模拟、告警队列、Toast）
 │
 ▼
页面组件 + 弹窗/抽屉组件
```

定时器（均在 `HomeView` 统一创建与清理）：

| 定时器 | 间隔 | 作用 |
|--------|------|------|
| 时钟 | 1s | 顶栏时间 |
| 环境模拟 | 3s | 8 项指标波动 + 危险告警 Toast |
| 健康数据 | 4s | 心率/血压/血氧/体温波动 |
| 步数模拟 | 4s | 按小时权重累加 |
| 能源 | 1s | 推进数据模型，仅能源页可见时重绘图表 |

---

## 🧊 3D 资产管线

`public/models/model.glb` 由原始模型经以下步骤产出（需要 `@gltf-transform/cli`）：

```bash
gltf-transform weld  model.original.glb w.glb    # 焊接顶点
gltf-transform join  w.glb j.glb                 # 合并同材质 primitive，降 draw call
gltf-transform draco j.glb d.glb \
  --quantize-position 13 --quantize-normal 10 --quantize-texcoord 12
python tools/optimize-glb.py d.glb public/models/model.glb
```

> ⚠️ **不要对整体几何做 `simplify`**：墙体接缝会压塌成黑缝、薄壳物体（灯罩/纱帘）会翻面消失。
> 这也是模型保持 5.9MB 的原因——体积换正确性。

---

## 🔧 开发约定

- **自动导入**：`unplugin-auto-import` 已接管 `vue` / `vue-router` / `pinia`，无需手写 `import { ref }`。
- **图标**：统一用 emoji，经 `AppIcon` 渲染（控制字号与基线）。注意 🌫 / 🌡 / ⚠ 这类"文本呈现"emoji 要补变体选择符 `\uFE0F`，否则 Windows 下会渲染成黑白方块。
- **样式分区**：全局样式在 `partitions/` 下按模块拆分，`13-responsive.css` 最后加载，同权重可覆盖前面分区；但**组件内 `scoped` 样式优先级更高**，跨组件覆盖移动端布局时需要 `!important` 或在组件自己的媒体查询里改。
- **数值格式**：卡片 `toFixed(2)`，弹窗明细 `toFixed(3)`。

---

## 🚢 部署

构建产物为纯静态文件（`base: './'`），可直接托管到任意静态服务器。
线上使用 Cloudflare Pages：仓库 `main` 分支更新后自动构建发布，`public/_headers` 控制缓存策略。

```bash
pnpm build      # 产物在 dist/
```

---

## 📄 License

MIT
