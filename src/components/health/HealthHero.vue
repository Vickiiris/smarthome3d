<template>
  <div class="health-hero">
    <div class="health-hero-inner">
      <div class="health-avatar-wrap">
        <div class="health-avatar">李</div>
        <div class="health-avatar-glow"></div>
      </div>
      <div class="health-hero-info">
        <div class="health-hero-name">李小溪 <span class="health-hero-age">29岁 · 女</span></div>
        <div class="health-hero-badges">
          <span class="hbadge hbadge-ok">健康良好</span>
          <span class="hbadge">绑定设备 3 台</span>
          <span class="hbadge hbadge-time"><span class="live-dot-sm"></span>实时监测</span>
        </div>
        <div class="health-hero-detail-row">
          <span class="hhdr-item"><span class="hhdr-dot" style="background:#ff6b6b"></span>心率 {{ heartRate }}次/分</span>
          <span class="hhdr-item"><span class="hhdr-dot" style="background:#60a5fa"></span>血氧 {{ spo2 }}%</span>
          <span class="hhdr-item"><span class="hhdr-dot" style="background:#f97316"></span>体温 {{ temp }}°C</span>
        </div>
      </div>
      <div class="health-score-ring">
        <div class="hsr-svg-wrap">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" class="hsr-bg"/>
            <circle cx="60" cy="60" r="52" class="hsr-fill" :stroke-dasharray="`${(score/100)*327} 327`"/>
          </svg>
          <div class="hsr-inner">
            <div class="hsr-val">{{ score }}</div>
            <div class="hsr-label">健康分</div>
          </div>
        </div>
        <div class="hsr-sub">本周稳定 ↑</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  heartRate: { type: [Number, String], default: 72 },
  spo2: { type: [Number, String], default: 98 },
  temp: { type: [Number, String], default: 36.6 },
  score: { type: Number, default: 92 },
})
</script>

<style scoped>
.health-hero { margin-bottom: 18px; }
.health-hero-inner {
  display: flex; align-items: center; gap: 20px; padding: 20px 24px;
  background: linear-gradient(135deg, rgba(0,212,170,0.08) 0%, rgba(96,165,250,0.06) 100%);
  border: 1px solid rgba(0,212,170,0.15); border-radius: 16px;
}
.health-avatar-wrap { position: relative; flex-shrink: 0; }
.health-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #00d4aa, #0ea5e9);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700; color: #fff; position: relative; z-index: 1;
}
.health-avatar-glow {
  position: absolute; inset: -4px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(0,212,170,0.3), rgba(14,165,233,0.3));
  animation: pulse-ring 2.5s ease-in-out infinite;
}
@keyframes pulse-ring { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.08); opacity: 0.3; } }
.health-hero-info { flex: 1; }
.health-hero-name { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.health-hero-age { font-size: 13px; color: var(--text-2); font-weight: 400; margin-left: 8px; }
.health-hero-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.hbadge { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.06); color: var(--text-2); border: 1px solid rgba(255,255,255,0.08); }
.hbadge-ok { background: rgba(34,197,94,0.1); color: #22c55e; border-color: rgba(34,197,94,0.2); }
.hbadge-time { display: flex; align-items: center; gap: 5px; background: rgba(0,212,170,0.08); color: #00d4aa; border-color: rgba(0,212,170,0.15); }
.live-dot-sm { width: 6px; height: 6px; border-radius: 50%; background: #00d4aa; box-shadow: 0 0 6px #00d4aa; animation: pulse-dot 1.5s ease-in-out infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.health-hero-detail-row { display: flex; gap: 16px; font-size: 12px; color: var(--text-2); }
.hhdr-item { display: flex; align-items: center; gap: 5px; }
.hhdr-dot { width: 7px; height: 7px; border-radius: 50%; }
.health-score-ring { text-align: center; flex-shrink: 0; }
.hsr-svg-wrap { position: relative; width: 90px; height: 90px; margin: 0 auto; }
.hsr-svg-wrap svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.hsr-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 7; }
.hsr-fill { fill: none; stroke: #00d4aa; stroke-width: 7; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50%; }
.hsr-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.hsr-val { font-size: 28px; font-weight: 800; color: #00d4aa; font-family: var(--font-mono); line-height: 1; }
.hsr-label { font-size: 10px; color: var(--text-3); margin-top: 2px; }
.hsr-sub { font-size: 11px; color: var(--text-3); margin-top: 4px; }
</style>
