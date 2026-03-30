import { ref, onMounted, onUnmounted, shallowRef, type Ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import gsap from 'gsap'

const INITIAL_CAMERA = {
  pos: new THREE.Vector3(0, 4, 6),
  target: new THREE.Vector3(0, 0, 0),
}

export interface HotspotDef {
  id: string
  name: string
  icon: string
  position: THREE.Vector3
  type: 'switch' | 'ac' | 'tv' | 'speaker' | 'sensor' | 'security' | 'info'
  deviceId?: string
}

// ===== 顶牌数据 =====
const HOTSPOTS: HotspotDef[] = [
  // 门禁控制器已删除
]

export function useThreeScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  const scene = shallowRef<THREE.Scene | null>(null)
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
  const labelRenderer = shallowRef<CSS2DRenderer | null>(null)
  const controls = shallowRef<OrbitControls | null>(null)
  const model = shallowRef<THREE.Group | null>(null)
  const isLoading = ref(true)
  const loadProgress = ref(0)
  const animationId = ref<number>(0)
  const lightObjects = new Map<string, THREE.Light>()

  const hotspotSprites: { sprite: THREE.Sprite; def: HotspotDef }[] = []
  // 当前显示的3D控制浮层
  const activeControlWidget = shallowRef<CSS2DObject | null>(null)
  const activeHotspot = shallowRef<HotspotDef | null>(null)

  const onHotspotClick = ref<((hotspot: HotspotDef) => void) | null>(null)
  const onWidgetClose = ref<(() => void) | null>(null)
  const debugInfo = ref({ clickPos: '-', cameraPos: '-', cameraTarget: '-' })

  let bgTexture: THREE.Texture | null = null
  let arrowTexture: THREE.Texture | null = null

  function initScene() {
    if (!canvasRef.value) return
    const _scene = new THREE.Scene()
    _scene.background = new THREE.Color(0x070f1f) // 深色背景与 UI 协调
    scene.value = _scene

    const _camera = new THREE.PerspectiveCamera(60, canvasRef.value.clientWidth / canvasRef.value.clientHeight, 0.1, 100)
    _camera.position.copy(INITIAL_CAMERA.pos)
    _camera.lookAt(INITIAL_CAMERA.target)
    camera.value = _camera

    // 让 canvas 尺寸由 CSS 控制
    canvasRef.value.style.width = '100%'
    canvasRef.value.style.height = '100%'
    
    const _renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    _renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    _renderer.shadowMap.enabled = true
    _renderer.shadowMap.type = THREE.PCFSoftShadowMap
    _renderer.toneMapping = THREE.ACESFilmicToneMapping
    _renderer.toneMappingExposure = 2.0
    _renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.value = _renderer

    // CSS2DRenderer（用于3D场景内的HTML浮层）
    const _labelRenderer = new CSS2DRenderer()
    _labelRenderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
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
    _controls.target.copy(INITIAL_CAMERA.target)
    controls.value = _controls

    setupLights(_scene)
    loadModel(_scene)
    animate()
    window.addEventListener('resize', onResize)
    canvasRef.value.addEventListener('click', onCanvasClick)
  }

  // ===== 顶牌 Sprite 纹理 =====
  function createHotspotTexture(def: HotspotDef): THREE.Texture {
    const W = 222, BG_H = 75, ARR_H = 44, H = BG_H + ARR_H
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bgTexture!.image as HTMLImageElement, 0, 0, W, BG_H)
    ctx.drawImage(arrowTexture!.image as HTMLImageElement, W / 2 - 40.5, BG_H, 81, ARR_H)
    ctx.font = 'bold 28px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(def.icon, 36, BG_H * 0.5)
    ctx.font = 'bold 22px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText(def.name, W * 0.64, BG_H * 0.5)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }

  function createHotspots(_scene: THREE.Scene) {
    const texLoader = new THREE.TextureLoader()
    let loaded = 0
    const buildSprites = () => {
      HOTSPOTS.forEach((def) => {
        const tex = createHotspotTexture(def)
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, sizeAttenuation: true })
        const sprite = new THREE.Sprite(mat)
        sprite.scale.set(0.6, 0.32, 1)
        sprite.position.copy(def.position)
        sprite.position.y += 0.25
        sprite.name = `hotspot-${def.id}`
        _scene.add(sprite)
        hotspotSprites.push({ sprite, def })
      })
    }
    const onLoad = () => { if (++loaded >= 2) buildSprites() }
    texLoader.load('/textures/hotspot-bg.png', (t) => { bgTexture = t; onLoad() }, undefined, () => { bgTexture = null; onLoad() })
    texLoader.load('/textures/hotspot-arrow.png', (t) => { arrowTexture = t; onLoad() }, undefined, () => { arrowTexture = null; onLoad() })
  }

  // ===== 创建 3D 场景内的控制浮层 =====
  function showControlWidget(hotspot: HotspotDef) {
    if (!scene.value) return
    closeControlWidget()

    const div = document.createElement('div')
    div.className = `ctrl-widget ctrl-widget-${hotspot.type}`
    div.innerHTML = `
      <div class="ctrl-header">
        <span class="ctrl-icon">${hotspot.icon}</span>
        <span class="ctrl-name">${hotspot.name}</span>
        <button class="ctrl-close">✕</button>
      </div>
      <div class="ctrl-body" id="ctrl-body-${hotspot.id}">
        <div class="ctrl-loading">加载控制中...</div>
      </div>
    `
    div.style.pointerEvents = 'auto'

    const label = new CSS2DObject(div)
    label.position.copy(hotspot.position)
    label.position.y += 0.5
    label.name = `ctrl-widget-${hotspot.id}`
    scene.value.add(label)
    activeControlWidget.value = label
    activeHotspot.value = hotspot

    // 关闭按钮
    div.querySelector('.ctrl-close')?.addEventListener('click', (e) => {
      e.stopPropagation()
      closeControlWidget()
      onWidgetClose.value?.()
    })

    // 通知外部填充控制内容
    onHotspotClick.value?.(hotspot)
  }

  function closeControlWidget() {
    if (activeControlWidget.value && scene.value) {
      scene.value.remove(activeControlWidget.value)
      activeControlWidget.value = null
    }
    activeHotspot.value = null
  }

  function updateWidgetContent(html: string) {
    if (!activeControlWidget.value) return
    const div = activeControlWidget.value.element as HTMLElement
    const body = div.querySelector('.ctrl-body')
    if (body) body.innerHTML = html
  }

  function updateWidgetStatus(status: 'on' | 'off') {
    if (!activeControlWidget.value) return
    const div = activeControlWidget.value.element as HTMLElement
    div.dataset.status = status
  }

  // ===== 鼠标点击检测 =====
  function onCanvasClick(e: MouseEvent) {
    if (!camera.value || !controls.value) return
    const canvas = canvasRef.value!
    const rect = canvas.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera.value)

    // 优先检测顶牌 Sprite
    const hits = raycaster.intersectObjects(hotspotSprites.map(h => h.sprite), false)
    if (hits.length > 0) {
      const hit = hotspotSprites.find(h => h.sprite === hits[0].object)
      if (hit) {
        flyTo(
          new THREE.Vector3(hit.def.position.x + 0.8, hit.def.position.y + 0.8, hit.def.position.z + 0.8),
          hit.def.position.clone(), 1.0
        )
        showControlWidget(hit.def)
        return
      }
    }

    // 模型点击（调试）
    const modelHits = model.value ? raycaster.intersectObjects(model.value.children, true) : []
    const cam = camera.value, tgt = controls.value.target
    const cs = `(${cam.position.x.toFixed(3)}, ${cam.position.y.toFixed(3)}, ${cam.position.z.toFixed(3)})`
    const ts = `(${tgt.x.toFixed(3)}, ${tgt.y.toFixed(3)}, ${tgt.z.toFixed(3)})`
    if (modelHits.length > 0) {
      const hp = modelHits[0].point
      debugInfo.value = { clickPos: `(${hp.x.toFixed(3)}, ${hp.y.toFixed(3)}, ${hp.z.toFixed(3)})`, cameraPos: cs, cameraTarget: ts }
      console.log(`[点击] ${hp.x.toFixed(3)},${hp.y.toFixed(3)},${hp.z.toFixed(3)} | ${modelHits[0].object.name}`)
    } else {
      debugInfo.value = { clickPos: '未命中', cameraPos: cs, cameraTarget: ts }
    }
  }

  function setupLights(_scene: THREE.Scene) {
    _scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1.5)
    hemi.position.set(0, 20, 0)
    _scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 2.5)
    dir.position.set(5, 10, 5); dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.near = 0.5; dir.shadow.camera.far = 50
    dir.shadow.camera.left = -10; dir.shadow.camera.right = 10
    dir.shadow.camera.top = 10; dir.shadow.camera.bottom = -10
    dir.shadow.bias = -0.001; _scene.add(dir)
    const fill = new THREE.DirectionalLight(0xffffff, 1.5)
    fill.position.set(-5, 8, -5)
    _scene.add(fill)
    const pts: [string, number, number, number, number, number][] = [
      ['light-1', 0xfff5e0, 3, -0.5, 2, 1],
      ['light-2', 0xffa040, 2.5, -0.5, 1.5, 0],
      ['light-3', 0xfff0d0, 2.5, -0.65, 2, -0.56],
      ['light-4', 0xa78bfa, 2, 0.6, 1.5, -0.5],
      ['light-5', 0xf0f8ff, 3, 0.6, 2, 1.0],
      ['light-6', 0xffffff, 2.5, 0.72, 2, 0.15],
    ]
    pts.forEach(([id, color, intensity, x, y, z]) => {
      const light = new THREE.PointLight(color, intensity, 12)
      light.position.set(x, y, z); _scene.add(light)
      lightObjects.set(id, light)
    })
  }

  function loadModel(_scene: THREE.Scene) {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    loader.load('/models/Room_01.glb',
      (gltf) => {
        const _model = gltf.scene
        const box = new THREE.Box3().setFromObject(_model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const scale = 6 / Math.max(size.x, size.y, size.z)
        _model.scale.setScalar(scale)
        _model.position.sub(center.clone().multiplyScalar(scale))
        _model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true; child.receiveShadow = true
            if (child.material instanceof THREE.MeshStandardMaterial)
              child.material.envMapIntensity = 1.5
          }
        })
        _scene.add(_model)
        model.value = _model
        createHotspots(_scene)
        _model.scale.setScalar(0)
        gsap.to(_model.scale, { x: scale, y: scale, z: scale, duration: 1.2, ease: 'back.out(1.7)', onComplete: () => { isLoading.value = false } })
      },
      (p) => { if (p.total > 0) loadProgress.value = Math.round(p.loaded / p.total * 100) },
      (err) => { console.error(err); isLoading.value = false }
    )
  }

  function animate() {
    animationId.value = requestAnimationFrame(animate)
    controls.value?.update()
    renderer.value?.render(scene.value!, camera.value!)
    labelRenderer.value?.render(scene.value!, camera.value!)
  }

  function onResize() {
    if (!canvasRef.value || !camera.value || !renderer.value || !labelRenderer.value) return
    const w = canvasRef.value.clientWidth, h = canvasRef.value.clientHeight
    camera.value.aspect = w / h
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(w, h)
    labelRenderer.value.setSize(w, h)
  }

  // 手动触发 resize（退出全屏时调用）
  // 使用 CSS 控制尺寸，renderer 与 CSS 同步
  function resize() {
    if (!canvasRef.value || !camera.value || !renderer.value || !labelRenderer.value) return
    // 强制触发 CSS 重新计算
    canvasRef.value.style.width = '100%'
    canvasRef.value.style.height = '100%'
    // 等待下一帧让 CSS 生效
    requestAnimationFrame(() => {
      if (!canvasRef.value || !camera.value || !renderer.value || !labelRenderer.value) return
      const w = canvasRef.value.clientWidth
      const h = canvasRef.value.clientHeight
      camera.value.aspect = w / h
      camera.value.updateProjectionMatrix()
      renderer.value.setSize(w, h)
      labelRenderer.value.setSize(w, h)
    })
  }

  // 获取渲染器引用（供外部调用）
  function getRenderer() {
    return renderer.value
  }

  function setLightStatus(lightId: string, status: boolean, intensity?: number) {
    const light = lightObjects.get(lightId)
    if (!light) return
    const base = lightId === 'light-1' ? 3 : 2.5
    const target = status ? (intensity !== undefined ? (intensity / 100) * base : base) : 0
    gsap.to(light, { intensity: target, duration: 0.5, ease: 'power2.inOut' })
  }

  function flyTo(pos: THREE.Vector3, target: THREE.Vector3, duration = 1.5) {
    if (!camera.value || !controls.value) return
    gsap.killTweensOf(camera.value.position)
    gsap.killTweensOf(controls.value.target)
    gsap.to(camera.value.position, { x: pos.x, y: pos.y, z: pos.z, duration, ease: 'power3.inOut', onUpdate: () => { controls.value?.update() } })
    gsap.to(controls.value.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power3.inOut' })
  }

  function resetView() { flyTo(INITIAL_CAMERA.pos.clone(), INITIAL_CAMERA.target.clone()) }

  function flyToRoom(roomId: string) {
    const map: Record<string, [number, number, number, number, number, number]> = {
      'living-room': [-0.5, 2.5, 3.5, -0.48, 0, 1.06],
      'bedroom': [0.179, 0.646, 0.192, 0.730, -0.163, -0.601],
      'bedroom2': [-1.090, 0.923, 0.389, -1.096, -0.167, -0.709],
      'kitchen': [-0.216, 0.955, 1.856, 1.006, -0.248, 1.884],
      'bathroom': [0.497, 0.635, 1.253, 1.161, -0.122, 0.495],
    }
    const t = map[roomId]
    if (t) flyTo(new THREE.Vector3(t[0], t[1], t[2]), new THREE.Vector3(t[3], t[4], t[5]))
  }

  onMounted(() => { initScene() })
  onUnmounted(() => {
    cancelAnimationFrame(animationId.value)
    window.removeEventListener('resize', onResize)
    canvasRef.value?.removeEventListener('click', onCanvasClick)
    labelRenderer.value?.domElement.remove()
    renderer.value?.dispose()
    controls.value?.dispose()
  })

  return {
    scene, camera, renderer, controls, model,
    isLoading, loadProgress, lightObjects, debugInfo,
    activeHotspot,
    onHotspotClick, onWidgetClose,
    setLightStatus, flyToRoom, resetView, flyTo, closeControlWidget,
    updateWidgetContent, updateWidgetStatus,
    resize, getRenderer,
  }
}
