import { ref, shallowRef, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import gsap from 'gsap'

// 资源统一走 BASE_URL，兼容「根目录部署」与「子目录部署」（如 GitHub Pages 项目页）
const BASE = import.meta.env.BASE_URL || '/'
const MODEL_URL = `${BASE}models/model.glb`
const DRACO_PATH = `${BASE}draco/`
const HDR_URL = `${BASE}texture/skybox_box.hdr`

const MODEL_MAX_DIM = 6 // 模型归一化后的最长边

// 默认视角方向（目标点指向相机），与原始 (0, 4, 6) 保持一致
const VIEW_DIR = new THREE.Vector3(0, 4, 6).normalize()
const INITIAL_TARGET = new THREE.Vector3(0, 0, 0)

export function useThreeScene(canvasRef) {
  const scene = shallowRef(null)
  const camera = shallowRef(null)
  const renderer = shallowRef(null)
  const labelRenderer = shallowRef(null)
  const controls = shallowRef(null)
  const model = shallowRef(null)
  const isLoading = ref(true)
  const loadProgress = ref(0)
  const animationId = ref(0)
  const lightObjects = new Map()
  const isInitialized = ref(false)
  // 模型/渲染失败时置为字符串描述，供页面做降级提示
  const modelError = ref(null)

  const hotspotLabels = []
  let fallbackEl = null
  let userMovedCamera = false

  const onHotspotClick = ref(null)
  const activeRoomId = ref('all')

  // 房间名 → roomId 映射（阳台归主卧）
  const ROOM_MAP = {
    '客厅': 'living-room',
    '主卧': 'bedroom',
    '次卧': 'bedroom2',
    '厨房': 'kitchen',
    '卫生间': 'bathroom',
    '玄关': 'living-room',
    '阳台': 'balcony',
    '全屋': 'all',
  }

  // 根据当前 activeRoomId 更新顶牌可见性
  function updateHotspotVisibility() {
    hotspotLabels.forEach(({ obj, def }) => {
      if (activeRoomId.value === 'all') {
        obj.visible = true
      } else {
        const roomId = ROOM_MAP[def.room] || 'all'
        obj.visible = roomId === activeRoomId.value
      }
    })
  }

  // ---------- 尺寸测量 ----------
  // 注意：WebGLRenderer.setSize() 会把 canvas 的 style 写成固定像素，
  // 所以这里必须量「父容器」而不是 canvas 自己，否则 resize 后量到的永远是旧尺寸。
  function hostSize() {
    const el = canvasRef.value
    const host = el?.parentElement || el
    if (!host) return { w: 0, h: 0 }
    return { w: host.clientWidth, h: Math.max(1, host.clientHeight) }
  }

  // ---------- 能力检测 ----------
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
    } catch {
      return false
    }
  }

  // ---------- 降级面板 ----------
  function ensureFallbackEl() {
    if (fallbackEl) return fallbackEl
    const el = document.createElement('div')
    el.className = 'scene-fallback'
    el.innerHTML = `
      <div class="sf-inner">
        <div class="sf-icon">🧭</div>
        <div class="sf-title">3D 场景未能加载</div>
        <div class="sf-desc" data-role="desc"></div>
        <div class="sf-actions">
          <button type="button" class="sf-btn sf-retry">重新加载</button>
          <button type="button" class="sf-btn sf-ghost sf-dismiss">先用 2D 面板</button>
        </div>
      </div>`
    el.querySelector('.sf-retry').addEventListener('click', () => retryModel())
    el.querySelector('.sf-dismiss').addEventListener('click', () => el.classList.add('is-dismissed'))
    fallbackEl = el
    return el
  }

  function showFallback(message) {
    const parent = canvasRef.value?.parentElement
    if (!parent) return
    const el = ensureFallbackEl()
    el.querySelector('[data-role="desc"]').textContent = message
    el.classList.remove('is-dismissed')
    if (el.parentElement !== parent) parent.appendChild(el)
  }

  function hideFallback() {
    fallbackEl?.remove()
  }

  // 把 HTML 覆盖层（标签渲染器 / 降级面板）跟随 canvas 一起挂到当前容器
  function syncOverlayParent() {
    const parent = canvasRef.value?.parentElement
    if (!parent) return
    const labelDom = labelRenderer.value?.domElement
    if (labelDom && labelDom.parentElement !== parent) {
      parent.appendChild(labelDom)
    }
    if (fallbackEl && fallbackEl.parentElement && fallbackEl.parentElement !== parent) {
      parent.appendChild(fallbackEl)
    }
  }

  // 加载失败统一出口：让加载页放行，同时通知页面降级
  function failModel(message) {
    isLoading.value = false
    modelError.value = message
    showFallback(message)
    window.dispatchEvent(new Event('__modelLoaded'))
    window.dispatchEvent(new CustomEvent('__modelFailed', { detail: { message } }))
  }

  function retryModel() {
    if (!scene.value) {
      // 场景本身没建起来（如 WebGL 初始化失败），整页初始化重来更稳妥
      window.location.reload()
      return
    }
    hideFallback()
    modelError.value = null
    isLoading.value = true
    loadProgress.value = 0
    loadModel(scene.value)
  }

  function initScene() {
    if (!canvasRef.value || !canvasRef.value.parentElement) return
    if (isInitialized.value) {
      syncOverlayParent()
      return
    }

    if (!isWebGLAvailable()) {
      isInitialized.value = true
      failModel('当前浏览器或设备不支持 WebGL，无法渲染 3D 场景。可继续使用下方 2D 面板查看数据。')
      return
    }

    const _scene = new THREE.Scene()
    _scene.background = new THREE.Color(0x070f1f)
    scene.value = _scene

    const _camera = new THREE.PerspectiveCamera(60, hostSize().w / Math.max(1, hostSize().h), 0.1, 100)
    _camera.position.set(0, 4, 6)
    _camera.lookAt(INITIAL_TARGET)
    camera.value = _camera

    canvasRef.value.style.width = '100%'
    canvasRef.value.style.height = '100%'

    let _renderer
    try {
      _renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    } catch (err) {
      isInitialized.value = true
      failModel(`3D 渲染器初始化失败：${err?.message || '未知错误'}`)
      return
    }
    _renderer.setSize(hostSize().w, hostSize().h, false)
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    _renderer.shadowMap.enabled = true
    _renderer.shadowMap.type = THREE.PCFSoftShadowMap
    _renderer.toneMapping = THREE.ACESFilmicToneMapping
    _renderer.toneMappingExposure = 0.8
    _renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.value = _renderer

    const _labelRenderer = new CSS2DRenderer()
    _labelRenderer.setSize(hostSize().w, hostSize().h)
    _labelRenderer.domElement.className = 'scene-labels'
    _labelRenderer.domElement.style.position = 'absolute'
    _labelRenderer.domElement.style.top = '0'
    _labelRenderer.domElement.style.left = '0'
    _labelRenderer.domElement.style.pointerEvents = 'none'
    _labelRenderer.domElement.style.zIndex = '10'
    canvasRef.value.parentElement?.appendChild(_labelRenderer.domElement)
    labelRenderer.value = _labelRenderer

    const _controls = new OrbitControls(_camera, canvasRef.value)
    _controls.enableDamping = true
    _controls.dampingFactor = 0.05
    _controls.minDistance = 0.3
    _controls.maxDistance = 30
    _controls.maxPolarAngle = Math.PI / 1.8
    _controls.target.copy(INITIAL_TARGET)
    _controls.addEventListener('start', () => { userMovedCamera = true })
    controls.value = _controls

    setupLights(_scene, _renderer)
    loadModel(_scene)
    animate()
    window.addEventListener('resize', onResize)
    isInitialized.value = true
  }

  // ---------- 相机取景：让模型在任意宽高比下都填满画面 ----------
  function fitCameraToModel(object, { margin = 0.88, animate = false, duration = 1.1 } = {}) {
    if (!camera.value || !controls.value || !object) return
    const cam = camera.value

    const box = new THREE.Box3().setFromObject(object)
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    const dir = VIEW_DIR.clone()
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize()
    const up = new THREE.Vector3().crossVectors(dir, right).normalize()

    const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * margin
    const tanH = tanV * Math.max(0.2, cam.aspect)

    // 取包围盒 8 个角点，算出「刚好装下」所需的相机距离
    let dist = 0
    const half = size.clone().multiplyScalar(0.5)
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          const p = new THREE.Vector3(half.x * sx, half.y * sy, half.z * sz)
          const depthAlong = p.dot(dir)
          const needH = Math.abs(p.dot(right)) / tanH + depthAlong
          const needV = Math.abs(p.dot(up)) / tanV + depthAlong
          dist = Math.max(dist, needH, needV)
        }
      }
    }
    dist = THREE.MathUtils.clamp(dist, 1.5, 30)

    const targetPos = center.clone().addScaledVector(dir, dist)
    if (animate) {
      flyTo(targetPos, center, duration)
    } else {
      cam.position.copy(targetPos)
      controls.value.target.copy(center)
      cam.lookAt(center)
      controls.value.update()
    }
    userMovedCamera = false
  }

  // ---------- 热区标签（HTML 渲染，任意缩放下都清晰可读）----------
  function clearHotspots(_scene) {
    hotspotLabels.forEach(({ obj, el }) => {
      _scene.remove(obj)
      el.remove()
    })
    hotspotLabels.length = 0
  }

  function focusHotspot(def) {
    if (def.cameraPos) {
      flyTo(def.cameraPos.clone(), def.position.clone(), 1.0)
    }
    const newRoomId = ROOM_MAP[def.room] || 'all'
    activeRoomId.value = newRoomId
    updateHotspotVisibility()
    onHotspotClick.value?.(def)
  }

  function createHotspots(_scene) {
    clearHotspots(_scene)
    HOTSPOTS.forEach((def) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'hotspot-tag'
      el.dataset.room = ROOM_MAP[def.room] || 'all'
      el.innerHTML = `<span class="hs-ico">${def.icon || '•'}</span><span class="hs-name">${def.name}</span>`
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        focusHotspot(def)
      })

      const obj = new CSS2DObject(el)
      // 标签底边贴着设备点上方 0.10（原 0.32 约等于 0.6m，看着像飘在半空）
      obj.position.set(def.position.x, def.position.y + 0.10, def.position.z)
      obj.center.set(0.5, 1)
      obj.userData.def = def
      _scene.add(obj)
      hotspotLabels.push({ obj, def, el })
    })
    updateHotspotVisibility()
  }

  // 屏幕空间去重叠：越靠近相机的标签优先显示；重叠时先收起文字只留图标，再隐藏
  // 尺寸用估算值而非读取 offsetWidth，避免每帧强制同步布局
  const LABEL_H = 22
  const labelWidth = (def, compact) => (compact ? 30 : 26 + def.name.length * 12)

  let declutterTick = 0
  function updateLabelDeclutter() {
    if (!camera.value || !labelRenderer.value) return
    const { w, h } = hostSize()
    if (!w || !h) return

    const cam = camera.value
    const camPos = cam.position
    const items = []

    for (const item of hotspotLabels) {
      if (!item.obj.visible) continue
      const v = item.obj.position.clone().project(cam)
      if (v.z > 1) {
        item.el.style.opacity = '0'
        item.el.style.pointerEvents = 'none'
        continue
      }
      const x = (v.x * 0.5 + 0.5) * w
      const y = (-v.y * 0.5 + 0.5) * h
      if (x < -80 || x > w + 80 || y < -40 || y > h + 40) {
        item.el.style.opacity = '0'
        item.el.style.pointerEvents = 'none'
        continue
      }
      items.push({ item, x, y, depth: camPos.distanceToSquared(item.obj.position) })
    }

    items.sort((a, b) => a.depth - b.depth)
    const placed = []
    const overlaps = (r) => placed.some(p => !(r.r < p.l || r.l > p.r || r.b < p.t || r.t > p.b))

    for (const it of items) {
      const def = it.item.def
      const fullW = labelWidth(def, false)
      const fullRect = { l: it.x - fullW / 2, r: it.x + fullW / 2, t: it.y - LABEL_H, b: it.y }
      if (!overlaps(fullRect)) {
        it.item.el.classList.remove('is-compact')
        placed.push(fullRect)
        it.item.el.style.opacity = '1'
        it.item.el.style.pointerEvents = 'auto'
        continue
      }
      const compW = labelWidth(def, true)
      const compRect = { l: it.x - compW / 2, r: it.x + compW / 2, t: it.y - LABEL_H, b: it.y }
      if (!overlaps(compRect)) {
        it.item.el.classList.add('is-compact')
        placed.push(compRect)
        it.item.el.style.opacity = '1'
        it.item.el.style.pointerEvents = 'auto'
        continue
      }
      it.item.el.style.opacity = '0'
      it.item.el.style.pointerEvents = 'none'
    }
  }

  function setupLights(_scene, _renderer) {
    // 基础光只做「最低可见度」的托底，主力照明交给房间灯。
    // 之前 Ambient/Hemi/Dir 加起来远强于点光源，导致开关灯时画面几乎不变（差 <5%）。
    // 这里刻意偏冷：关灯时整体呈冷灰，开灯后是暖黄，靠色温差也能一眼看出灯态。
    _scene.add(new THREE.AmbientLight(0xcfe0ff, 0.08))
    const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x8fa4c0, 0.05)
    hemi.position.set(0, 20, 0)
    _scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xcfe0ff, 0.25)
    dir.position.set(5, 10, 5)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.near = 0.5
    dir.shadow.camera.far = 50
    dir.shadow.camera.left = -10
    dir.shadow.camera.right = 10
    dir.shadow.camera.top = 10
    dir.shadow.camera.bottom = -10
    dir.shadow.bias = -0.001
    _scene.add(dir)
    const fill = new THREE.DirectionalLight(0xcfe0ff, 0.15)
    fill.position.set(-5, 8, -5)
    _scene.add(fill)
    // 房间灯：位置取各房间中心的天花板高度（原先三盏灯的 y 是负数，埋在地板下面，
    // 所以开关灯在画面上几乎看不出变化）。id 与 device 的映射见 useSceneModes.getLightIdForDevice
    const pts = [
      ['light-1', 0xfff1d8, -0.48, 1.15, 1.06],   // 客厅
      ['light-2', 0xfff1d8, 0.73, 1.15, -0.60],   // 主卧
      ['light-3', 0xfff1d8, -1.10, 1.15, -0.71],  // 次卧
      ['light-4', 0xfff1d8, 1.01, 1.15, 1.88],    // 厨房
      ['light-5', 0xe8f2ff, 1.16, 1.15, 0.50],    // 卫生间
      ['light-6', 0xfff6e6, 0.64, 1.15, -2.40],   // 阳台
    ]
    pts.forEach(([id, color, x, y, z]) => {
      // distance 8 + decay 2：照度按 1/d² 衰减，灯下最亮、墙角自然变暗，形成看得见的光池
      const light = new THREE.PointLight(color, 0, 8, 2)
      light.position.set(x, y, z)
      _scene.add(light)
      lightObjects.set(id, light)

    })

    // 环境贴图：HDR 已压缩到 512px 级别，仅提供柔和的环境反射
    const pmremGenerator = new THREE.PMREMGenerator(_renderer)
    pmremGenerator.compileEquirectangularShader()
    new RGBELoader().load(
      HDR_URL,
      (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture)
        _scene.environment = envMap.texture
        _scene.environmentIntensity = 0.1
        texture.dispose()
        pmremGenerator.dispose()
      },
      undefined,
      () => {
        // HDR 失败不影响主流程，只是少了环境反射
        pmremGenerator.dispose()
        console.warn('[scene] environment map skipped')
      }
    )
  }

  function loadModel(_scene) {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(DRACO_PATH)
    dracoLoader.setDecoderConfig({ type: 'wasm' })
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      MODEL_URL,
      (gltf) => {
        const _model = gltf.scene
        const box = new THREE.Box3().setFromObject(_model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const scale = MODEL_MAX_DIM / Math.max(size.x, size.y, size.z)
        _model.scale.setScalar(scale)
        _model.position.sub(center.clone().multiplyScalar(scale))
        _model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material instanceof THREE.MeshStandardMaterial) child.material.envMapIntensity = 1
          }
        })
        _scene.add(_model)
        model.value = _model
        createHotspots(_scene)
        fitCameraToModel(_model)

        _model.scale.setScalar(0.001)
        gsap.to(_model.scale, {
          x: scale, y: scale, z: scale, duration: 1.2, ease: 'back.out(1.7)',
          onComplete: () => {
            isLoading.value = false
            modelError.value = null
            hideFallback()
            window.dispatchEvent(new Event('__modelLoaded'))
          },
        })
      },
      (p) => {
        if (p.total > 0) {
          const progress = Math.round((p.loaded / p.total) * 100)
          loadProgress.value = progress
          if (typeof window.__setLoaderProgress === 'function') window.__setLoaderProgress(progress)
        }
      },
      (err) => {
        console.error('[scene] model load failed', err)
        failModel('模型文件下载失败或解析失败，可能是网络不稳定。')
      }
    )
  }

  function animate() {
    animationId.value = requestAnimationFrame(animate)
    // canvas 被隐藏（切到无 3D 的页面）时不渲染，省 CPU/GPU
    if (hostSize().w === 0) return
    controls.value?.update()
    renderer.value?.render(scene.value, camera.value)
    labelRenderer.value?.render(scene.value, camera.value)
    if (++declutterTick % 8 === 0) updateLabelDeclutter()
  }

  function applySize() {
    if (!canvasRef.value || !camera.value || !renderer.value || !labelRenderer.value) return
    const { w, h } = hostSize()
    if (!w) return
    camera.value.aspect = w / h
    camera.value.updateProjectionMatrix()
    // updateStyle=false：让 canvas 保持 CSS 100%，尺寸完全交给容器，
    // 否则 setSize 会写入固定像素宽度，容器再缩小时 canvas 不跟随
    renderer.value.setSize(w, h, false)
    canvasRef.value.style.width = '100%'
    canvasRef.value.style.height = '100%'
    labelRenderer.value.setSize(w, h)
  }

  function onResize() {
    applySize()
    // 用户没手动调过视角时，跟随容器比例重新取景，始终保持房子占满画面
    if (!userMovedCamera && model.value) fitCameraToModel(model.value)
    syncOverlayParent()
  }

  function resize() {
    if (!canvasRef.value) return
    canvasRef.value.style.width = '100%'
    canvasRef.value.style.height = '100%'
    requestAnimationFrame(() => {
      applySize()
      syncOverlayParent()
      if (!userMovedCamera && model.value) fitCameraToModel(model.value)
    })
  }

  function getRenderer() {
    return renderer.value
  }

  // 100% 亮度对应的光强。点光源照度按 I/d² 衰减，灯高约 1.2m，
  // 18 在灯下约 12、房间边缘约 2 —— 能形成明显光斑，又不会把地板冲白（过曝像素约 0.1%）。
  // 之前用 22~40 远超基础光量级，整屋一起过曝，反而看不出开关灯。
  const LIGHT_MAX_INTENSITY = 18

  function setLightStatus(lightId, status, intensity) {
    const light = lightObjects.get(lightId)
    if (!light) return
    const pct = intensity === undefined ? 100 : Math.max(0, Math.min(100, intensity))
    // 0% 就是全灭；1% 以上保底 0.8，避免极低亮度看起来像没通电
    const target = status && pct > 0 ? Math.max(0.8, (pct / 100) * LIGHT_MAX_INTENSITY) : 0
    gsap.to(light, { intensity: target, duration: 0.45, ease: 'power2.inOut' })
  }

  function flyTo(pos, target, duration = 1.5) {
    if (!camera.value || !controls.value) return
    userMovedCamera = true
    gsap.killTweensOf(camera.value.position)
    gsap.killTweensOf(controls.value.target)
    gsap.to(camera.value.position, { x: pos.x, y: pos.y, z: pos.z, duration, ease: 'power3.inOut', onUpdate: () => { controls.value?.update() } })
    gsap.to(controls.value.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power3.inOut' })
  }

  function flyToRoom(roomId) {
    const map = {
      'living-room': [-0.394, 2.713, 4.115, -0.48, 0, 1.06],
      'bedroom': [-0.197, 1.744, 0.901, 0.730, -0.163, -0.601],
      'bedroom2': [-1.430, 1.726, 0.678, -1.096, -0.167, -0.709],
      'kitchen': [-0.636, 1.403, 1.985, 1.006, -0.248, 1.884],
      'bathroom': [0.420, 1.213, 1.488, 1.161, -0.122, 0.495],
      'balcony': [0.980, 1.760, 0.320, 0.600, 0.040, -2.100],
    }
    const t = map[roomId]
    if (t) flyTo(new THREE.Vector3(t[0], t[1], t[2]), new THREE.Vector3(t[3], t[4], t[5]))
    activeRoomId.value = roomId
    updateHotspotVisibility()
  }

  function resetView() {
    if (model.value) {
      fitCameraToModel(model.value, { animate: true })
    } else {
      flyTo(new THREE.Vector3(0, 4, 6), INITIAL_TARGET.clone())
    }
    activeRoomId.value = 'all'
    updateHotspotVisibility()
  }

  function disposeScene() {
    if (scene.value) {
      scene.value.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => {
            Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose() })
            m.dispose()
          })
        }
      })
    }
    clearHotspots(scene.value || new THREE.Object3D())
    lightObjects.clear()
    hideFallback()
    labelRenderer.value?.domElement.remove()
  }

  onUnmounted(() => {
    cancelAnimationFrame(animationId.value)
    window.removeEventListener('resize', onResize)
    disposeScene()
    renderer.value?.dispose()
    controls.value?.dispose()
  })

  return {
    scene, camera, renderer, controls, model,
    isLoading, loadProgress, lightObjects, modelError,
    onHotspotClick, activeRoomId,
    setLightStatus, flyToRoom, resetView, flyTo,
    resize, getRenderer, initScene, retryModel, fitCameraToModel,
  }
}

// 顶牌数据 - 与 homeStore 中的 pointers 对应
const HOTSPOTS = [
  {
    id: 'bedroom-ac',
    name: '主卧空调',
    icon: '❄️',
    type: 'ac',
    room: '主卧',
    position: new THREE.Vector3(1.660, 0.026, -1.610),
    cameraPos: new THREE.Vector3(0.468, 0.171, -1.485),
  },
  {
    id: 'ac-outlet-a',
    name: '空调插座A',
    icon: '🔌',
    type: 'outlet',
    room: '主卧',
    position: new THREE.Vector3(1.745, 0.053, -1.201),
    cameraPos: new THREE.Vector3(0.496, 0.348, -1.132),
  },
  {
    id: 'bedroom-light',
    name: '主卧灯开关',
    icon: '💡',
    type: 'light',
    room: '主卧',
    position: new THREE.Vector3(0.696, -0.060, 0.242),
    cameraPos: new THREE.Vector3(0.662, 0.207, -1.102),
  },
  {
    id: 'bedroom2-ac',
    name: '次卧空调',
    icon: '❄️',
    type: 'ac',
    room: '次卧',
    position: new THREE.Vector3(-0.131, -0.017, -1.607),
    cameraPos: new THREE.Vector3(-1.208, 0.365, -1.631),
  },
  {
    id: 'ac-outlet-b',
    name: '空调插座B',
    icon: '🔌',
    type: 'outlet',
    room: '次卧',
    position: new THREE.Vector3(-0.033, 0.040, -1.193),
    cameraPos: new THREE.Vector3(-1.224, 0.316, -1.154),
  },
  {
    id: 'bedroom2-light',
    name: '次卧灯开关',
    icon: '💡',
    type: 'light',
    room: '次卧',
    position: new THREE.Vector3(-0.708, -0.057, 0.242),
    cameraPos: new THREE.Vector3(-0.791, 0.390, -0.854),
  },
  {
    id: 'living-tv',
    name: '客厅电视',
    icon: '📺',
    type: 'tv',
    room: '客厅',
    position: new THREE.Vector3(-1.209, -0.031, 0.281),
    cameraPos: new THREE.Vector3(-1.219, 0.333, 1.443),
  },
  {
    id: 'living-speaker',
    name: '智能音箱',
    icon: '🔊',
    type: 'speaker',
    room: '客厅',
    position: new THREE.Vector3(-1.212, -0.241, 2.053),
    cameraPos: new THREE.Vector3(-0.879, -0.120, 1.706),
  },
  {
    id: 'living-outlet-a',
    name: '客厅插座A',
    icon: '🔌',
    type: 'outlet',
    room: '客厅',
    position: new THREE.Vector3(-1.647, -0.358, 0.272),
    cameraPos: new THREE.Vector3(-1.584, 0.041, 1.137),
  },
  {
    id: 'air-sensor',
    name: '空气质量传感器',
    icon: '📡',
    type: 'sensor',
    room: '客厅',
    position: new THREE.Vector3(-1.824, -0.003, 0.991),
    cameraPos: new THREE.Vector3(-0.940, 0.244, 1.015),
  },
  {
    id: 'door-controller',
    name: '门禁控制器',
    icon: '🔒',
    type: 'security',
    room: '玄关',
    position: new THREE.Vector3(-1.824, -0.008, 1.697),
    cameraPos: new THREE.Vector3(-1.060, 0.271, 1.675),
  },
  {
    id: 'living-light',
    name: '客厅灯开关',
    icon: '💡',
    type: 'light',
    room: '客厅',
    position: new THREE.Vector3(0.006, -0.051, 2.937),
    cameraPos: new THREE.Vector3(-0.020, 0.242, 1.823),
  },
  {
    id: 'living-outlet-b',
    name: '客厅插座B',
    icon: '🔌',
    type: 'outlet',
    room: '客厅',
    noArrow: true,
    position: new THREE.Vector3(0.006, 0.109, 2.942),
    cameraPos: new THREE.Vector3(-0.020, 0.242, 1.823),
  },
  {
    id: 'kitchen-light',
    name: '厨房灯开关',
    icon: '💡',
    type: 'light',
    room: '厨房',
    position: new THREE.Vector3(0.819, -0.014, 2.890),
    cameraPos: new THREE.Vector3(0.802, 0.284, 1.850),
  },
  {
    id: 'kitchen-outlet',
    name: '厨房插座',
    icon: '🔌',
    type: 'outlet',
    room: '厨房',
    position: new THREE.Vector3(1.800, 0.012, 1.597),
    cameraPos: new THREE.Vector3(0.539, 0.180, 1.642),
  },
  {
    id: 'smoke-sensor',
    name: '烟雾/燃气传感器',
    icon: '🔥',
    type: 'sensor',
    room: '厨房',
    position: new THREE.Vector3(1.409, 0.028, 2.871),
    cameraPos: new THREE.Vector3(1.323, 0.327, 1.827),
  },
  {
    id: 'water-sensor',
    name: '水浸传感器',
    icon: '💧',
    type: 'sensor',
    room: '卫生间',
    position: new THREE.Vector3(1.728, -0.501, 0.889),
    cameraPos: new THREE.Vector3(0.721, 0.083, 0.913),
  },
  {
    id: 'bathroom-light',
    name: '卫生间灯开关',
    icon: '💡',
    type: 'light',
    room: '卫生间',
    position: new THREE.Vector3(0.661, -0.064, 0.804),
    cameraPos: new THREE.Vector3(1.685, 0.299, 0.790),
  },
  {
    id: 'balcony-light',
    name: '阳台灯开关',
    icon: '💡',
    type: 'light',
    room: '阳台',
    position: new THREE.Vector3(0.576, 0.002, -2.032),
    cameraPos: new THREE.Vector3(0.644, 0.395, -2.984),
  },
  {
    id: 'outdoor-air-sensor',
    name: '温湿度/光照传感器',
    icon: '🌡',
    type: 'sensor',
    room: '阳台',
    position: new THREE.Vector3(1.368, 0.008, -2.022),
    cameraPos: new THREE.Vector3(1.348, 0.382, -2.988),
  },
  {
    id: 'kitchen-heater',
    name: '燃气热水器',
    icon: '🚿',
    type: 'heater',
    room: '厨房',
    position: new THREE.Vector3(1.602, 0.404, 2.827),
    cameraPos: new THREE.Vector3(1.570, 0.470, 1.911),
  },
  {
    id: 'bedroom-washer',
    name: '洗衣机',
    icon: '🧺',
    type: 'washer',
    room: '主卧',
    position: new THREE.Vector3(1.469, -0.097, -2.541),
    cameraPos: new THREE.Vector3(0.281, 0.419, -2.563),
  },
  {
    id: 'kitchen-range-hood',
    name: '抽油烟机',
    icon: '🌀',
    type: 'ventil',
    room: '厨房',
    position: new THREE.Vector3(1.650, 0.490, 1.864),
    cameraPos: new THREE.Vector3(0.585, 0.479, 1.835),
  },
  {
    id: 'kitchen-dishwasher',
    name: '洗碗机',
    icon: '🍽️',
    type: 'washer',
    room: '厨房',
    position: new THREE.Vector3(1.445, -0.190, 2.358),
    cameraPos: new THREE.Vector3(0.679, -0.088, 2.337),
  },
]
