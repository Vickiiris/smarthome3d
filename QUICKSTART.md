# 快速开始指南

## 📋 项目概述

这是一个完整的 **纯 JavaScript + Vue 3 + CSS** 智能家居 3D 可视化项目。

- ✅ 零 TypeScript
- ✅ 零 SCSS
- ✅ 100% 功能完整
- ✅ 生产级别代码

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

然后打开浏览器访问 `http://localhost:3000`

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览构建结果

```bash
npm run preview
```

## 📁 项目结构

```
smart-home-3d-converted/
├── index.html                 # HTML 入口
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
├── README.md                 # 项目说明
├── CONVERSION_REPORT.md      # 转换报告
└── src/
    ├── main.js               # 应用入口
    ├── App.vue               # 根组件
    ├── router/
    │   └── index.js          # 路由配置
    ├── stores/
    │   └── homeStore.js      # Pinia 状态管理
    ├── composables/
    │   └── useThreeScene.js  # Three.js 组合式函数
    ├── components/
    │   └── DeviceControlModal.vue  # 设备控制弹窗
    ├── views/
    │   └── HomeView.vue      # 主页面
    └── assets/
        └── styles/
            └── main.css      # 全局样式
```

## 🎯 主要功能

### 1. 环境监控
- 🌡️ 实时温度、湿度显示
- 💨 CO₂、PM2.5 监测
- ☀️ 光照强度显示
- 💧 空气质量指数

### 2. 设备控制
- 💡 灯光开关和亮度调节
- ❄️ 空调温度控制
- 📱 设备列表管理
- 🎛️ 快速控制面板

### 3. 3D 可视化
- 🏠 智能家居 3D 模型
- 🎥 相机动画和缩放
- 💡 动态灯光效果
- 🖱️ 交互式场景控制

### 4. 安防监控
- 🚪 门禁状态
- 🔥 烟雾/燃气检测
- 📹 摄像头监控
- 💧 漏水检测

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4.21 | 前端框架 |
| Vite | 5.1.6 | 构建工具 |
| Three.js | 0.162.0 | 3D 图形 |
| Pinia | 2.1.7 | 状态管理 |
| Vue Router | 4.3.0 | 路由管理 |
| GSAP | 3.12.5 | 动画库 |
| ECharts | 6.0.0 | 数据可视化 |
| Element Plus | 2.6.1 | UI 组件库 |

## 📝 代码示例

### 使用状态管理

```javascript
import { useHomeStore } from '@/stores/homeStore'

const homeStore = useHomeStore()

// 切换设备
homeStore.toggleDevice('light-1')

// 更新设备值
homeStore.updateDeviceValue('ac-1', 26)

// 应用场景
homeStore.applyScene('sleep')
```

### 使用 3D 场景

```javascript
import { useThreeScene } from '@/composables/useThreeScene'

const threeScene = useThreeScene(canvasRef)

// 飞向房间
threeScene.flyToRoom('living-room')

// 重置视图
threeScene.resetView()

// 设置灯光
threeScene.setLightStatus('light-1', true, 80)
```

### Vue 组件示例

```vue
<template>
  <div class="device-item" @click="toggleDevice">
    <span class="icon">{{ device.icon }}</span>
    <span class="name">{{ device.name }}</span>
    <div class="toggle" :class="{ on: device.status }">
      <div class="thumb"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  device: Object
})

const emit = defineEmits(['toggle'])

function toggleDevice() {
  emit('toggle', props.device.id)
}
</script>
```

## 🎨 样式系统

项目使用 CSS 变量系统，便于主题定制：

```css
:root {
  --primary: #00d4aa;
  --secondary: #0ea5e9;
  --danger: #ef4444;
  --success: #22c55e;
  --text: #e2e8f0;
  --bg: #050d18;
  /* ... 更多变量 */
}
```

## 🔧 常见任务

### 添加新页面

1. 在 `src/views/` 创建新的 `.vue` 文件
2. 在 `src/router/index.js` 中添加路由
3. 在 `src/views/HomeView.vue` 中添加导航项

### 添加新组件

1. 在 `src/components/` 创建新的 `.vue` 文件
2. 在需要的地方导入使用

### 修改样式

编辑 `src/assets/styles/main.css`，所有样式都是标准 CSS，无需编译。

### 添加新设备

在 `src/stores/homeStore.js` 的 `devices` 数组中添加新设备对象。

## 📊 数据结构

### 设备对象

```javascript
{
  id: 'light-1',
  name: '客厅主灯',
  type: 'light',  // 'light' | 'ac' | 'sensor' | 'tv' | 'speaker'
  status: true,
  value: 80,      // 亮度或温度
  room: 'living-room'
}
```

### 房间对象

```javascript
{
  id: 'living-room',
  name: '客厅',
  icon: '🛋️'
}
```

### 场景对象

```javascript
{
  id: 'sleep',
  name: '睡眠模式',
  icon: '🌙',
  description: '关闭所有灯光，卧室空调开启',
  devices: [
    { id: 'light-1', status: false },
    { id: 'ac-2', status: true, value: 26 }
  ]
}
```

## 🐛 调试

### 启用调试信息

在浏览器控制台查看 3D 场景调试信息：

```javascript
// 查看当前相机位置
console.log(threeScene.debugInfo.value)
```

### 常见问题

**Q: 3D 模型不显示？**
A: 检查 `/public/models/Room_01.glb` 文件是否存在

**Q: 样式不正确？**
A: 清除浏览器缓存，重新加载页面

**Q: 设备控制不工作？**
A: 检查浏览器控制台是否有错误信息

## 📱 响应式设计

项目支持多种屏幕尺寸：

- 📺 桌面 (1920px+)
- 💻 笔记本 (1200px+)
- 📱 平板 (768px+)
- 📱 手机 (320px+)

## 🌐 浏览器支持

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📚 学习资源

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Three.js 文档](https://threejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

如有问题，请查看：
1. README.md - 项目说明
2. CONVERSION_REPORT.md - 转换报告
3. 浏览器控制台 - 错误信息

---

**祝你使用愉快！** 🎉
