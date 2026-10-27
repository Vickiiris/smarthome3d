<script setup>
/**
 * 图标组件
 *
 * 全站统一用 emoji（💡🔌❄️…）作为设备/功能图标：数据层（deviceList、navItems、
 * 健康指标…）里存的就是 emoji 字符，这里只负责按 size 控制字号、并保持基线对齐。
 * 保留成组件是为了让 20 多处调用点有个统一入口——将来若再换图标体系，改这一个文件即可。
 */
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, default: '' },
  size: { type: [Number, String], default: 16 },
})

const fontSize = computed(() => `${Number(props.size) * 0.95}px`)
</script>

<template>
  <span class="app-icon" :style="{ fontSize }" aria-hidden="true">{{ icon }}</span>
</template>

<style>
.app-icon {
  display: inline-block;
  flex: none;
  line-height: 1;
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI Symbol', sans-serif;
  font-style: normal;
  vertical-align: -0.1em;
  /* emoji 字形比线性图标宽，给个最小宽度避免挤压后面的文字 */
  min-width: 1.1em;
  text-align: center;
}
</style>
