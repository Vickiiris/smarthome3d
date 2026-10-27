import * as THREE from 'three'

/**
 * 模型内的「可动部件 / 特效」控制器
 *
 * 背景：为了压体积，模型被 weld → join 成一个大 mesh（106 个 primitive），
 * 节点名和层级都丢了（全是 网格.xxx）。所以这里不靠名字，而是靠
 * 「材质名 + 包围盒落在某个锚点附近」来定位可动部件；纯特效（气流、音符）则直接
 * 用锚点坐标建粒子，不依赖几何。
 *
 * 现有能力：
 *   1. 电视 —— 开机播放动态画面 / 关机灰色屏幕
 *   2. 抽油烟机 —— 灶台上方向上收拢的气流
 *   3. 空调（主卧 / 次卧）—— 出风口向下前方飘散的冷气雾
 *   4. 智能音箱 —— 向上飘动的音符
 *   5. 洗衣机开门 —— 门体（玻璃盘 + 门圈）挂到铰链 pivot 上旋转
 *   6. 洗碗机开门 —— 门板与橱柜焊在一起，改用「合成门 + 内腔」方案
 *
 * 坐标说明：全部使用「归一化后的场景坐标」（与 useThreeScene 的 HOTSPOTS 同一空间）。
 */

// 锚点（归一化场景坐标）
const ANCHOR = {
  tvScreen: new THREE.Vector3(-1.143, -0.216, 0.335),   // 电视屏幕正中
  washerDoor: new THREE.Vector3(1.471, -0.295, -2.547), // 洗衣机门中心
  hoodMouth: new THREE.Vector3(1.661, 0.095, 1.868),    // 油烟机吸风口（机身底面）
  cooktop: new THREE.Vector3(1.661, -0.105, 1.868),     // 灶台面
  speaker: new THREE.Vector3(-1.236, -0.205, 2.077),    // 客厅音箱顶部
}

// 两台壁挂空调的出风口（机身底面靠前的那条横缝），机身宽沿 z、出风朝 -x
const AC_UNITS = [
  { key: 'acMain', pos: new THREE.Vector3(1.646, -0.090, -1.610), halfWidth: 0.30 },
  { key: 'acSecond', pos: new THREE.Vector3(-0.145, -0.090, -1.607), halfWidth: 0.30 },
]
const AC_DIR = new THREE.Vector3(-1, -0.45, 0).normalize()

// 洗碗机门（实测反算）：正面朝 -x，门板平面 x≈1.4436，宽 0.41（沿 z）、高 0.385（沿 y）
const DW_DOOR = {
  x: 1.4436,
  centerY: -0.3285,
  centerZ: 2.357,
  w: 0.414,
  h: 0.388,
  thickness: 0.008,
  cavityX: 1.4425,   // 内腔面片：贴着原门面（比门面凸 2mm），把手已单独切掉
}

const DOOR_OPEN_ANGLE = THREE.MathUtils.degToRad(105)
const DW_OPEN_ANGLE = THREE.MathUtils.degToRad(88)

export function createModelEffects() {
  let scene = null
  let root = null
  const state = { tv: false, hood: false, washerDoor: false, dishwasherDoor: false, acMain: false, acSecond: false, speaker: false }

  // --- 电视 ---
  let tvMesh = null
  let tvCanvas = null
  let tvCtx = null
  let tvTex = null
  let tvOffTex = null
  let tvOrig = null
  let tvFrame = 0

  // --- 油烟机 ---
  let hoodPoints = null
  let hoodBase = null

  // --- 空调 ---
  const acStreams = []   // { parts, unit, key, mode }
  // 空调运行模式只影响观感（冷色 / 暖色），不影响开关；默认制冷
  const acModes = { acMain: 'cool', acSecond: 'cool' }
  const AC_COLOR = {
    cool: new THREE.Color(0x8ac6f2),   // 制冷：淡蓝
    heat: new THREE.Color(0xffab5e),   // 制热：暖橙
    fan: new THREE.Color(0xd5e2ec),    // 送风：不加温也不制冷，用中性冷白
  }

  // --- 音箱音符 ---
  const notes = []

  // --- 洗衣机门 ---
  let washerPivot = null
  let washerAngle = 0
  let washerTarget = 0

  // --- 洗碗机门 ---
  let dwPivot = null
  let dwAngle = 0
  let dwTarget = 0

  const disposables = []
  const meshes = []
  const failed = []

  const worldBox = (m) => new THREE.Box3().setFromObject(m)
  const matName = (m) => (m.material && !Array.isArray(m.material) ? m.material.name || '' : '')

  function findMeshes(matRe, near = null, radius = 0.12) {
    const out = []
    for (const m of meshes) {
      if (!matRe.test(matName(m))) continue
      if (near) {
        const c = worldBox(m).getCenter(new THREE.Vector3())
        if (c.distanceTo(near) > radius) continue
      }
      out.push(m)
    }
    return out
  }

  // 柔和圆点贴图（粒子公用）
  function dotTexture(inner = 'rgba(255,255,255,0.95)', mid = 'rgba(255,255,255,0.28)') {
    const cv = document.createElement('canvas')
    cv.width = cv.height = 64
    const c = cv.getContext('2d')
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, inner)
    g.addColorStop(0.45, mid)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    disposables.push(tex)
    return tex
  }

  // ---------------------------------------------------------------- 电视
  function buildTV() {
    const screens = findMeshes(/电视/)
    if (!screens.length) { failed.push('tv'); return }
    tvMesh = screens[0]
    const mat = tvMesh.material
    tvOrig = { map: mat.map, emissiveMap: mat.emissiveMap, emissive: mat.emissive.clone(), emissiveIntensity: mat.emissiveIntensity }

    tvCanvas = document.createElement('canvas')
    tvCanvas.width = 320
    tvCanvas.height = 180
    tvCtx = tvCanvas.getContext('2d')
    tvTex = new THREE.CanvasTexture(tvCanvas)
    tvTex.colorSpace = THREE.SRGBColorSpace
    // 这块屏幕的 UV 在 v 方向是反的（用红蓝辅助色块实测确认），关掉 flipY 抵消
    tvTex.flipY = false
    disposables.push(tvTex)

    // 关机：整块灰屏（偏冷的哑光灰，带一点环境反光）
    const off = document.createElement('canvas')
    off.width = 320
    off.height = 180
    const o = off.getContext('2d')
    const og = o.createLinearGradient(0, 0, 0, 180)
    og.addColorStop(0, '#4a5057')
    og.addColorStop(0.45, '#3a3f46')
    og.addColorStop(1, '#272b31')
    o.fillStyle = og
    o.fillRect(0, 0, 320, 180)
    const sheen = o.createLinearGradient(0, 0, 320, 180)
    sheen.addColorStop(0, 'rgba(255,255,255,0.10)')
    sheen.addColorStop(0.42, 'rgba(255,255,255,0.02)')
    sheen.addColorStop(1, 'rgba(255,255,255,0)')
    o.fillStyle = sheen
    o.fillRect(0, 0, 320, 180)
    tvOffTex = new THREE.CanvasTexture(off)
    tvOffTex.colorSpace = THREE.SRGBColorSpace
    tvOffTex.flipY = false
    disposables.push(tvOffTex)

    drawTVFrame(0)
    applyTVState()
  }

  function drawTVFrame(t) {
    const c = tvCtx
    const w = tvCanvas.width
    const h = tvCanvas.height
    if (!c) return
    c.setTransform(1, 0, 0, 1, 0, 0)
    // 底色：缓慢流动的冷暖渐变，像一段风景画面在动
    const g = c.createLinearGradient(0, 0, w, h)
    const p = 0.5 + 0.5 * Math.sin(t * 0.25)
    g.addColorStop(0, `rgb(${18 + 40 * p | 0}, ${44 + 60 * p | 0}, ${86 + 40 * p | 0})`)
    g.addColorStop(0.55, `rgb(${12 + 20 * p | 0}, ${30 + 30 * p | 0}, ${54 + 26 * p | 0})`)
    g.addColorStop(1, `rgb(${40 + 50 * (1 - p) | 0}, ${26 + 20 * p | 0}, ${40 + 10 * p | 0})`)
    c.fillStyle = g
    c.fillRect(0, 0, w, h)

    // 移动光带
    const sweep = ((t * 60) % (w + 160)) - 80
    const sg = c.createLinearGradient(sweep - 70, 0, sweep + 70, h)
    sg.addColorStop(0, 'rgba(255,255,255,0)')
    sg.addColorStop(0.5, 'rgba(150,220,255,0.18)')
    sg.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = sg
    c.fillRect(0, 0, w, h)

    // 几个柔和的光斑（模拟画面里的主体在移动）
    for (let i = 0; i < 3; i++) {
      const cx = (Math.sin(t * 0.3 + i * 2.1) * 0.32 + 0.5) * w
      const cy = (Math.cos(t * 0.22 + i * 1.7) * 0.22 + 0.52) * h
      const r = 26 + 16 * Math.sin(t * 0.5 + i)
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, r)
      rg.addColorStop(0, ['rgba(255,214,140,0.55)', 'rgba(120,220,255,0.45)', 'rgba(255,150,190,0.35)'][i])
      rg.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = rg
      c.beginPath()
      c.arc(cx, cy, r, 0, Math.PI * 2)
      c.fill()
    }

    // 底部进度条 + LIVE 角标
    c.fillStyle = 'rgba(0,0,0,0.35)'
    c.fillRect(0, h - 16, w, 16)
    c.fillStyle = 'rgba(0,212,170,0.85)'
    c.fillRect(0, h - 16, ((t * 0.06) % 1) * w, 3)
    c.fillStyle = 'rgba(255,90,90,0.9)'
    c.beginPath()
    c.arc(14, 12, 4, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = 'rgba(255,255,255,0.75)'
    c.font = 'bold 11px system-ui, sans-serif'
    c.fillText('LIVE', 22, 16)
  }

  function applyTVState() {
    if (!tvMesh) return
    const mat = tvMesh.material
    if (state.tv) {
      mat.map = tvTex
      mat.emissiveMap = tvTex
      mat.emissive.setHex(0xffffff)
      mat.emissiveIntensity = 1.15
    } else {
      // 关机：灰屏，不带自发光
      mat.map = tvOffTex || (tvOrig && tvOrig.map)
      mat.emissiveMap = null
      mat.emissive.setHex(0x000000)
      mat.emissiveIntensity = 0
    }
    mat.needsUpdate = true
  }

  // ---------------------------------------------------------------- 油烟机风
  function buildHood() {
    const COUNT = 110
    const pos = new Float32Array(COUNT * 3)
    const seed = new Float32Array(COUNT * 3)
    const top = ANCHOR.hoodMouth
    const bottom = ANCHOR.cooktop
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.05 + Math.random() * 0.07
      pos[i * 3] = top.x + Math.cos(a) * r
      pos[i * 3 + 1] = bottom.y + Math.random() * (top.y - bottom.y)
      pos[i * 3 + 2] = top.z + Math.sin(a) * r
      seed[i * 3] = a
      seed[i * 3 + 1] = 0.35 + Math.random() * 0.9   // 上升速度
      seed[i * 3 + 2] = r
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    disposables.push(geo)

    const mat = new THREE.PointsMaterial({
      map: dotTexture('rgba(190,235,255,0.95)', 'rgba(120,200,255,0.35)'),
      size: 0.034, transparent: true, opacity: 0.0,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    })
    disposables.push(mat)

    hoodPoints = new THREE.Points(geo, mat)
    hoodPoints.frustumCulled = false
    hoodPoints.visible = false
    hoodBase = { pos, seed, top, bottom, count: COUNT }
    scene.add(hoodPoints)
  }

  // ---------------------------------------------------------------- 空调冷气
  // 用一组大而柔的 Sprite 雾团代替粒子点：点阵在白墙上像噪点，雾团才像「吹出来的冷气」
  function buildAC(unit) {
    const COUNT = 28
    const tex = softCloudTexture()
    const parts = []
    for (let i = 0; i < COUNT; i++) {
      const mat = new THREE.SpriteMaterial({
        map: tex, transparent: true, depthWrite: false,
        opacity: 0, color: AC_COLOR[acModes[unit.key]].clone(), sizeAttenuation: true,
      })
      disposables.push(mat)
      const sp = new THREE.Sprite(mat)
      sp.visible = false
      scene.add(sp)
      parts.push({
        sprite: sp, mat,
        t: i / COUNT,
        speed: 0.5 + Math.random() * 0.25,
        spawn: randomSpawn(unit),
        sway: 0.6 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        size: 0.20 + Math.random() * 0.10,
      })
    }
    acStreams.push({ key: unit.key, parts, unit, mode: acModes[unit.key] })
  }

  function softCloudTexture() {
    const cv = document.createElement('canvas')
    cv.width = cv.height = 128
    const c = cv.getContext('2d')
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,0.72)')
    g.addColorStop(0.38, 'rgba(255,255,255,0.34)')
    g.addColorStop(0.72, 'rgba(255,255,255,0.09)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, 0, 128, 128)
    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    disposables.push(tex)
    return tex
  }

  function randomSpawn(unit) {
    // 出风口是沿 z 展开的一条横缝，贴着机身底面
    return {
      x: unit.pos.x + Math.random() * 0.02,
      y: unit.pos.y + (Math.random() - 0.5) * 0.010,
      z: unit.pos.z + (Math.random() - 0.5) * unit.halfWidth * 2,
    }
  }

  // ---------------------------------------------------------------- 音箱音符
  const NOTE_GLYPHS = ['♪', '♫', '♩', '♬']
  function noteTexture(glyph, color) {
    const cv = document.createElement('canvas')
    cv.width = cv.height = 128
    const c = cv.getContext('2d')
    c.clearRect(0, 0, 128, 128)
    c.font = 'bold 92px "Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols", system-ui, sans-serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    // 先描一圈暗边：客厅背景偏亮，纯色音符会糊掉
    c.lineWidth = 5
    c.strokeStyle = 'rgba(8,18,24,0.55)'
    c.strokeText(glyph, 64, 66)
    c.shadowColor = color
    c.shadowBlur = 10
    c.fillStyle = color
    c.fillText(glyph, 64, 66)
    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    disposables.push(tex)
    return tex
  }

  function buildSpeaker() {
    const colors = ['#7ef0d8', '#9fd0ff', '#ffe3a3', '#c9b4ff']
    const COUNT = 9
    for (let i = 0; i < COUNT; i++) {
      const tex = noteTexture(NOTE_GLYPHS[i % NOTE_GLYPHS.length], colors[i % colors.length])
      const mat = new THREE.SpriteMaterial({
        map: tex, transparent: true, depthWrite: false,
        opacity: 0, sizeAttenuation: true,
      })
      disposables.push(mat)
      const sp = new THREE.Sprite(mat)
      sp.scale.setScalar(0.10)
      sp.visible = false
      scene.add(sp)
      notes.push({ sprite: sp, mat, t: i / COUNT, speed: 0.28 + Math.random() * 0.14, sway: 0.5 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2, size: 0.095 + Math.random() * 0.05, rot: (Math.random() - 0.5) * 0.6 })
    }
  }

  // ---------------------------------------------------------------- 洗衣机门
  function buildWasherDoor() {
    const doors = findMeshes(/大凡2023-5-310(111|115)/, ANCHOR.washerDoor, 0.12)
    if (!doors.length) { failed.push('washerDoor'); return }
    const box = new THREE.Box3()
    doors.forEach(m => box.union(worldBox(m)))
    const c = box.getCenter(new THREE.Vector3())
    // 铰链放在门的左前竖边（前面朝向 -x）
    const hinge = new THREE.Vector3(box.min.x, c.y, box.max.z)
    washerPivot = new THREE.Group()
    washerPivot.position.copy(hinge)
    scene.add(washerPivot)
    doors.forEach(m => washerPivot.attach(m))
  }

  // ---------------------------------------------------------------- 洗碗机门（B 方案）
  // 洗碗机门板和整排橱柜焊在同一个 mesh 里，运行时切三角形切不干净。
  // B 方案：在门的位置合成一块等大的门板盖住原门 + 一块「内腔」贴图面片，
  // 开门时门板绕底边翻下，露出内腔。
  function dwFrontTexture() {
    const cv = document.createElement('canvas')
    cv.width = 256
    cv.height = 256
    const c = cv.getContext('2d')
    const g = c.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, '#101215')
    g.addColorStop(0.5, '#08090b')
    g.addColorStop(1, '#0c0e11')
    c.fillStyle = g
    c.fillRect(0, 0, 256, 256)
    // 顶部控制条
    c.fillStyle = 'rgba(30,34,40,0.85)'
    c.fillRect(10, 10, 236, 34)
    c.fillStyle = 'rgba(120,230,255,0.75)'
    c.font = 'bold 13px monospace'
    c.fillText('12:08', 150, 32)
    c.fillStyle = 'rgba(255,255,255,0.45)'
    for (let i = 0; i < 7; i++) c.fillRect(20 + i * 15, 24, 8, 6)
    // 拉手（模型自带的把手已被切掉，这里画回来）
    c.fillStyle = 'rgba(0,0,0,0.55)'
    c.fillRect(16, 60, 224, 22)
    const hg = c.createLinearGradient(0, 62, 0, 78)
    hg.addColorStop(0, '#e6ebf0')
    hg.addColorStop(0.35, '#b9c1c9')
    hg.addColorStop(0.6, '#8d959d')
    hg.addColorStop(1, '#5d656d')
    c.fillStyle = hg
    c.fillRect(20, 62, 216, 15)
    c.fillStyle = 'rgba(255,255,255,0.55)'
    c.fillRect(24, 63, 208, 2)
    // 玻璃反光
    const rg = c.createLinearGradient(0, 80, 256, 256)
    rg.addColorStop(0, 'rgba(255,255,255,0.05)')
    rg.addColorStop(0.5, 'rgba(255,255,255,0.01)')
    rg.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = rg
    c.fillRect(0, 80, 256, 176)
    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    disposables.push(tex)
    return tex
  }

  function dwCavityTexture() {
    const cv = document.createElement('canvas')
    cv.width = 320
    cv.height = 300
    const W = cv.width, H = cv.height
    const c = cv.getContext('2d')

    // 内腔底色：上浅下深，模拟从开口看进去的进深
    const g = c.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#1a2029')
    g.addColorStop(0.18, '#0e131a')
    g.addColorStop(0.62, '#0a0e13')
    g.addColorStop(1, '#05070a')
    c.fillStyle = g
    c.fillRect(0, 0, W, H)

    // 顶部一条冷光（机内灯的反光）
    const lg = c.createLinearGradient(0, 0, 0, 26)
    lg.addColorStop(0, 'rgba(120,200,255,0.20)')
    lg.addColorStop(1, 'rgba(120,200,255,0)')
    c.fillStyle = lg
    c.fillRect(0, 0, W, 26)

    // 上层碗篮：横杆 + 竖齿 + 立着的盘子
    const railY = 56
    c.strokeStyle = 'rgba(200,209,220,0.9)'
    c.lineWidth = 2.2
    c.beginPath(); c.moveTo(18, railY); c.lineTo(W - 18, railY); c.stroke()
    c.beginPath(); c.moveTo(18, railY + 34); c.lineTo(W - 18, railY + 34); c.stroke()
    c.lineWidth = 1.6
    c.strokeStyle = 'rgba(150,160,172,0.55)'
    for (let i = 0; i < 12; i++) {
      const x = 26 + i * 24
      c.beginPath(); c.moveTo(x, railY - 6); c.lineTo(x, railY + 34); c.stroke()
    }
    // 盘子
    for (let i = 0; i < 6; i++) {
      const x = 46 + i * 46
      const rg = c.createLinearGradient(x - 20, 0, x + 20, 0)
      rg.addColorStop(0, 'rgba(214,220,228,0.26)')
      rg.addColorStop(0.45, 'rgba(236,241,247,0.62)')
      rg.addColorStop(1, 'rgba(168,176,186,0.18)')
      c.fillStyle = rg
      c.beginPath()
      c.ellipse(x, railY + 2, 21, 30, 0, 0, Math.PI * 2)
      c.fill()
    }

    // 下层篮子：较矮的框架 + 几个碗
    c.strokeStyle = 'rgba(140,150,164,0.42)'
    c.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      const y = 196 + i * 22
      c.beginPath(); c.moveTo(16, y); c.lineTo(W - 16, y); c.stroke()
    }
    c.fillStyle = 'rgba(200,208,218,0.18)'
    for (let i = 0; i < 3; i++) {
      const x = 70 + i * 78
      c.beginPath()
      c.ellipse(x, 196, 26, 12, 0, Math.PI, 0)
      c.fill()
    }

    // 底部积水反光
    const wg = c.createLinearGradient(0, 246, 0, H)
    wg.addColorStop(0, 'rgba(80,170,210,0.06)')
    wg.addColorStop(1, 'rgba(80,170,210,0.22)')
    c.fillStyle = wg
    c.fillRect(0, 246, W, H - 246)

    // 门口密封条 + 四周压暗
    c.strokeStyle = 'rgba(10,12,15,0.9)'
    c.lineWidth = 10
    c.strokeRect(1, 1, W - 2, H - 2)
    const vg = c.createRadialGradient(W / 2, H * 0.45, 40, W / 2, H * 0.45, W * 0.75)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(0,0,0,0.75)')
    c.fillStyle = vg
    c.fillRect(0, 0, W, H)

    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    disposables.push(tex)
    return tex
  }

  // 洗碗机门把手是独立于门板的一块「不锈钢」凸起（和整排橱柜焊在同一个 mesh 里），
  // 凸出门面约 2cm，会穿过内腔面片。这里按三角形把这一小块削掉，其余几何不动。
  function carveHandle() {
    const box = new THREE.Box3(
      new THREE.Vector3(1.4060, -0.2900, 2.1200),
      new THREE.Vector3(1.4470, -0.1980, 2.5800)
    )
    const v = new THREE.Vector3()
    let cut = 0
    for (const m of meshes) {
      const wb = worldBox(m)
      if (!wb.intersectsBox(box)) continue
      const geo = m.geometry
      if (!geo || !geo.index) continue
      const pos = geo.attributes.position
      const idx = geo.index.array
      m.updateWorldMatrix(true, false)
      const mat = m.matrixWorld
      const keep = []
      for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i], b = idx[i + 1], c = idx[i + 2]
        v.fromBufferAttribute(pos, a).applyMatrix4(mat)
        const x0 = v.x, y0 = v.y, z0 = v.z
        v.fromBufferAttribute(pos, b).applyMatrix4(mat)
        const x1 = v.x, y1 = v.y, z1 = v.z
        v.fromBufferAttribute(pos, c).applyMatrix4(mat)
        const cx = (x0 + x1 + v.x) / 3, cy = (y0 + y1 + v.y) / 3, cz = (z0 + z1 + v.z) / 3
        if (box.containsPoint(new THREE.Vector3(cx, cy, cz))) { cut++; continue }
        keep.push(a, b, c)
      }
      if (keep.length !== idx.length) {
        const g = geo.clone()
        g.setIndex(keep)
        disposables.push(g)
        m.geometry = g
      }
    }
  }

  function buildDishwasherDoor() {
    carveHandle()
    const { x, centerY, centerZ, w, h, thickness } = DW_DOOR
    const { cavityX } = DW_DOOR
    const xFront = cavityX - thickness
    const y0 = centerY - h / 2

    // 1) 内腔面片：略在原门之前，开门后露出来
    const cavityGeo = new THREE.PlaneGeometry(w, h)
    cavityGeo.rotateY(-Math.PI / 2)   // 法线朝 -x
    disposables.push(cavityGeo)
    const cavityMat = new THREE.MeshBasicMaterial({ map: dwCavityTexture() })
    disposables.push(cavityMat)
    const cavity = new THREE.Mesh(cavityGeo, cavityMat)
    cavity.position.set(cavityX, centerY, centerZ)
    cavity.renderOrder = 1
    scene.add(cavity)

    // 2) 合成门板：盖住原门，铰链在底边
    const doorGeo = new THREE.BoxGeometry(thickness, h, w)
    doorGeo.translate(thickness / 2, h / 2, 0)
    disposables.push(doorGeo)
    const front = new THREE.MeshStandardMaterial({ map: dwFrontTexture(), roughness: 0.28, metalness: 0.45 })
    const inner = new THREE.MeshStandardMaterial({ color: 0x9aa2ab, roughness: 0.45, metalness: 0.7 })
    const edge = new THREE.MeshStandardMaterial({ color: 0x1b1f24, roughness: 0.6, metalness: 0.4 })
    disposables.push(front, inner, edge)
    // BoxGeometry 面序：px, nx, py, ny, pz, nz
    const door = new THREE.Mesh(doorGeo, [inner, front, edge, inner, edge, edge])

    dwPivot = new THREE.Group()
    dwPivot.position.set(xFront, y0, centerZ)
    scene.add(dwPivot)
    dwPivot.add(door)
  }

  function attach(_root, _scene) {
    root = _root
    scene = _scene
    meshes.length = 0
    root.traverse(o => { if (o.isMesh) meshes.push(o) })
    try { buildTV() } catch (e) { failed.push('tv'); console.warn('[effects] tv', e) }
    try { buildHood() } catch (e) { failed.push('hood'); console.warn('[effects] hood', e) }
    try { AC_UNITS.forEach(buildAC) } catch (e) { failed.push('ac'); console.warn('[effects] ac', e) }
    try { buildSpeaker() } catch (e) { failed.push('speaker'); console.warn('[effects] speaker', e) }
    try { buildWasherDoor() } catch (e) { failed.push('washerDoor'); console.warn('[effects] washerDoor', e) }
    try { buildDishwasherDoor() } catch (e) { failed.push('dishwasherDoor'); console.warn('[effects] dishwasherDoor', e) }
    // 模型是异步加载的，设备状态可能早就设过了 —— 部件就位后重新套用一遍
    Object.keys(state).forEach(k => { if (state[k]) apply(k) })
    if (failed.length) console.info('[effects] 未找到的部件:', failed.join(', '))
  }

  function apply(key) {
    const on = state[key]
    if (key === 'tv') applyTVState()
    if (key === 'hood' && hoodPoints) hoodPoints.visible = on
    if (key === 'washerDoor') washerTarget = on ? DOOR_OPEN_ANGLE : 0
    if (key === 'dishwasherDoor') dwTarget = on ? DW_OPEN_ANGLE : 0
    if (key === 'acMain' || key === 'acSecond') {
      const s = acStreams.find(s => s.key === key)
      if (s) s.parts.forEach(p => { p.sprite.visible = on })
    }
    if (key === 'speaker') notes.forEach(n => { n.sprite.visible = on })
  }

  function setState(key, on) {
    if (!(key in state)) return
    state[key] = !!on
    apply(key)
  }

  /** 空调模式（cool | heat | fan）：只换雾团颜色和上浮手感，开关仍走 setState */
  function setACMode(key, mode) {
    const m = mode === 'heat' || mode === 'fan' ? mode : 'cool'
    if (acModes[key] === m) return
    acModes[key] = m
    const s = acStreams.find(x => x.key === key)
    if (s) s.mode = m
  }

  let clock = 0
  function update(dt) {
    clock += dt

    // 电视：约 8fps 重绘
    if (state.tv && tvTex) {
      tvFrame += dt
      if (tvFrame > 0.12) { tvFrame = 0; drawTVFrame(clock); tvTex.needsUpdate = true }
    }

    // 油烟机气流
    if (state.hood && hoodPoints) {
      hoodPoints.material.opacity = Math.min(0.5, hoodPoints.material.opacity + dt * 2)
      const { pos, seed, top, bottom, count } = hoodBase
      const span = top.y - bottom.y
      for (let i = 0; i < count; i++) {
        const iy = i * 3 + 1
        pos[iy] += seed[i * 3 + 1] * dt * 0.45
        const k = Math.min(1, Math.max(0, (pos[iy] - bottom.y) / span))
        const r = seed[i * 3 + 2] * (1 - k * 0.75)
        pos[i * 3] = top.x + Math.cos(seed[i * 3]) * r
        pos[i * 3 + 2] = top.z + Math.sin(seed[i * 3]) * r
        if (pos[iy] > top.y + 0.02) {
          pos[iy] = bottom.y
          seed[i * 3] = Math.random() * Math.PI * 2
        }
      }
      hoodPoints.geometry.attributes.position.needsUpdate = true
    } else if (hoodPoints && hoodPoints.material.opacity > 0) {
      hoodPoints.material.opacity = Math.max(0, hoodPoints.material.opacity - dt * 3)
      if (hoodPoints.material.opacity === 0) hoodPoints.visible = false
    }

    // 空调冷气
    for (const s of acStreams) {
      const on = state[s.key]
      for (const p of s.parts) {
        if (!on) { p.sprite.visible = false; p.t = 0; p.mat.opacity = 0; p.spawn = randomSpawn(s.unit); continue }
        p.t += dt * p.speed
        if (p.t >= 1) { p.t -= 1; p.spawn = randomSpawn(s.unit) }
        const t = p.t
        const travel = t
        p.sprite.position.set(
          p.spawn.x + AC_DIR.x * travel * 0.5,
          p.spawn.y + AC_DIR.y * travel * 0.5 - (s.mode === 'heat' ? 0.07 : 0.18) * t * t,
          p.spawn.z + Math.sin(t * 4.2 + p.phase) * 0.07 * p.sway
        )
        const fade = Math.sin(Math.min(1, t * 1.05) * Math.PI)
        p.mat.opacity = fade * 0.78
        // 制冷/制热切换时颜色渐变过去，不要瞬间跳色
        p.mat.color.lerp(AC_COLOR[s.mode] || AC_COLOR.cool, Math.min(1, dt * 6))
        p.sprite.scale.setScalar(p.size * (0.75 + t * 0.9))
        p.sprite.visible = true
      }
    }

    // 音箱音符
    if (state.speaker) {
      for (const n of notes) {
        n.t += dt * n.speed
        if (n.t >= 1) n.t -= 1
        const t = n.t
        const p = ANCHOR.speaker
        n.sprite.position.set(
          p.x + Math.sin(t * 6.2 + n.phase) * 0.09 * n.sway,
          p.y + t * 0.5,
          p.z + Math.cos(t * 4.4 + n.phase) * 0.05 * n.sway
        )
        const fade = Math.sin(Math.min(1, t * 1.2) * Math.PI)
        n.mat.opacity = fade * 0.95
        const s = n.size * (0.7 + t * 0.85)
        n.sprite.scale.setScalar(s)
        n.mat.rotation = n.rot + Math.sin(t * 3 + n.phase) * 0.25
        n.sprite.visible = true
      }
    } else {
      for (const n of notes) n.sprite.visible = false
    }

    // 门：缓动靠拢目标角
    if (washerPivot) {
      washerAngle += (washerTarget - washerAngle) * Math.min(1, dt * 6)
      washerPivot.rotation.y = washerAngle
    }
    if (dwPivot) {
      dwAngle += (dwTarget - dwAngle) * Math.min(1, dt * 6)
      dwPivot.rotation.z = dwAngle
    }
  }

  function dispose() {
    disposables.forEach(d => { try { d.dispose?.() } catch {} })
    disposables.length = 0
    if (hoodPoints && hoodPoints.parent) hoodPoints.parent.remove(hoodPoints)
    if (washerPivot && washerPivot.parent) washerPivot.parent.remove(washerPivot)
    if (dwPivot && dwPivot.parent) dwPivot.parent.remove(dwPivot)
    acStreams.forEach(s => s.parts.forEach(p => { if (p.sprite.parent) p.sprite.parent.remove(p.sprite) }))
    notes.forEach(n => { if (n.sprite.parent) n.sprite.parent.remove(n.sprite) })
    acStreams.length = 0
    notes.length = 0
    hoodPoints = washerPivot = dwPivot = tvMesh = null
    tvTex = null
  }

  return { attach, setState, setACMode, update, dispose, state, failed }
}
