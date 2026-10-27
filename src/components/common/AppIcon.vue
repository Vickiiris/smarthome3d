<script setup>
/**
 * 统一图标组件
 *
 * 站点原来用 emoji 当图标（💡🔌❄️…），在 Windows / macOS / Android 上字形完全不同，
 * 有的还会渲染成黑白线框或方框。这里统一映射到 lucide 的线性图标，
 * 未收录的 emoji 仍按原样输出，避免出现「图标消失」。
 */
import {
  Zap, Snowflake, Heart, Lightbulb, Droplet, Droplets, Wind, Lock, Flame,
  Thermometer, Fan, DoorClosed, Tv, Volume2, Utensils, House, Video, Moon,
  MoonStar, Leaf, Bot, RadioTower, AppWindow, Bell, BedDouble, CloudFog,
  CloudSun, CookingPot, Footprints, KeyRound, Rainbow, Square, Wifi, User,
  Brush, Smartphone, Package, Sun, WashingMachine, PersonStanding, Apple,
  RefreshCw, Siren, Wallet, Play, Clock, TriangleAlert, Info, Hourglass, CircleCheck, Gauge, Signal, ShieldCheck, Power, Link,
} from 'lucide-vue-next'
import { computed } from 'vue'

const MAP = {
  '⚡': Zap,
  '❄️': Snowflake,
  '❤️': Heart,
  '❤': Heart,
  '💡': Lightbulb,
  '💧': Droplet,
  '🚿': Droplets,
  '💨': Wind,
  '🌬️': Wind,
  '🫁': Wind,
  '🔒': Lock,
  '🔐': KeyRound,
  '🔥': Flame,
  '🌡': Thermometer,
  '🌡️': Thermometer,
  '🌀': Fan,
  '🚪': DoorClosed,
  '📺': Tv,
  '🔊': Volume2,
  '🍽️': Utensils,
  '🏠': House,
  '📹': Video,
  '🌙': Moon,
  '😴': MoonStar,
  '🌿': Leaf,

  '🤖': Bot,
  '📡': RadioTower,
  '🪟': AppWindow,
  '🔔': Bell,
  '🛏️': BedDouble,
  '🌫️': CloudFog,
  '🌫': CloudFog,
  '🌤': CloudSun,
  '☀️': Sun,
  '🍳': CookingPot,
  '👟': Footprints,
  '🏃': PersonStanding,
  '🌈': Rainbow,
  '🔲': Square,
  '📶': Wifi,
  '👤': User,
  '🧹': Brush,
  '📱': Smartphone,
  '📦': Package,
  '🧺': WashingMachine,
  '🍎': Apple,
  '🔄': RefreshCw,
  '🚨': Siren,
  '💰': Wallet,
  '🩸': Droplet,
  '▶': Play,
  '⏰': Clock,
  '⚠️': TriangleAlert,
  'ℹ️': Info,
  '⏳': Hourglass,
  '✅': CircleCheck,
  '🛡️': ShieldCheck,
  '📊': Gauge,
  '🔗': Link,
  '🔗': Link,
  '🤖': Bot,
}

const props = defineProps({
  icon: { type: String, default: '' },
  size: { type: [Number, String], default: 16 },
  strokeWidth: { type: [Number, String], default: 1.8 },
})

const comp = computed(() => MAP[props.icon] || null)
</script>

<template>
  <component
    :is="comp"
    v-if="comp"
    class="app-icon"
    :size="size"
    :stroke-width="strokeWidth"
    aria-hidden="true"
  />
  <span v-else class="app-icon-emoji" :style="{ fontSize: Number(size) * 0.95 + 'px' }">{{ icon }}</span>
</template>

<style>
.app-icon {
  flex: none;
  vertical-align: -0.15em;
}
.app-icon-emoji {
  line-height: 1;
  vertical-align: -0.1em;
}
</style>
