import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
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

  const hotspotSprites = []
  const debugInfo = ref({ clickPos: '-', cameraPos: '-', cameraTarget: '-' })

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
    '阳台': 'bedroom',
    '全屋': 'all',
  }

  // 根据当前 activeRoomId 更新顶牌可见性
  function updateHotspotVisibility() {
    hotspotSprites.forEach(({ sprite, def }) => {
      if (activeRoomId.value === 'all') {
        sprite.visible = true
      } else {
        const roomId = ROOM_MAP[def.room] || 'all'
        sprite.visible = roomId === activeRoomId.value
      }
    })
  }

  function initScene() {
    if (!canvasRef.value) return
    const _scene = new THREE.Scene()
    _scene.background = new THREE.Color(0x070f1f)
    scene.value = _scene

    const _camera = new THREE.PerspectiveCamera(60, canvasRef.value.clientWidth / canvasRef.value.clientHeight, 0.1, 100)
    _camera.position.copy(INITIAL_CAMERA.pos)
    _camera.lookAt(INITIAL_CAMERA.target)
    camera.value = _camera

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

  // 使用 texture 文件夹下的图片创建顶牌
  function createHotspotTexture(def, bgImg, arrowImg) {
    const scale = 2
    const showArrow = !def.noArrow
    const W = 160 * scale
    const bgH = 60 * scale  // 背景高度
    const arrowH = showArrow ? 40 * scale : 0
    const H = bgH + arrowH
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // 绘制背景图片（上方）
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, W, bgH)
    }

    // 绘制箭头图片（底部居中，与背景分开）
    if (showArrow && arrowImg) {
      const arrowW = 56 * scale  
      const arrowX = (W - arrowW) / 2
      const arrowY = bgH - 2 * scale  
      ctx.drawImage(arrowImg, arrowX, arrowY, arrowW, arrowH)
    }

    // 绘制文字（居中于背景区域）
    ctx.font = `500 ${16 * scale}px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#e2e8f0'
    ctx.fillText(def.name, W / 2, bgH / 2)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    return tex
  }

  function createHotspots(_scene) {
    const texLoader = new THREE.TextureLoader()
    let bgImg = null
    let arrowImg = null
    let loaded = 0
    const totalToLoad = 2

    const buildSprites = () => {
      HOTSPOTS.forEach((def) => {
        const tex = createHotspotTexture(def, bgImg, arrowImg)
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
          sizeAttenuation: true,
        })
        const sprite = new THREE.Sprite(mat)
        // noArrow 的顶牌只有背景高度，sprite 高度减半
        const spriteH = def.noArrow ? 0.11 : 0.175
        sprite.scale.set(0.28, spriteH, 1)
        sprite.position.set(def.position.x, def.position.y + 0.16, def.position.z)
        sprite.name = `hotspot-${def.id}`
        sprite.userData = def
        _scene.add(sprite)
        hotspotSprites.push({ sprite, def })
      })
    }

    texLoader.load('/texture/bg.png', (t) => { bgImg = t.image; if (++loaded >= totalToLoad) buildSprites() })
    texLoader.load('/texture/↓.png', (t) => { arrowImg = t.image; if (++loaded >= totalToLoad) buildSprites() })
  }

  function onCanvasClick(e) {
    if (!camera.value || !controls.value) return
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera.value)

    // 只检测可见的热点
    const visibleSprites = hotspotSprites.filter(h => h.sprite.visible).map(h => h.sprite)
    const hits = raycaster.intersectObjects(visibleSprites, false)
    if (hits.length > 0) {
      const hit = hotspotSprites.find(h => h.sprite === hits[0].object)
      if (hit) {
        if (hit.def.cameraPos) {
          flyTo(hit.def.cameraPos.clone(), hit.def.position.clone(), 1.0)
        }
        const newRoomId = ROOM_MAP[hit.def.room] || 'all'
        activeRoomId.value = newRoomId
        updateHotspotVisibility()
        onHotspotClick.value?.(hit.def)
        return
      }
    }
  }

  function setupLights(_scene) {
    _scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1.5)
    hemi.position.set(0, 20, 0)
    _scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 2.5)
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
    const fill = new THREE.DirectionalLight(0xffffff, 1.5)
    fill.position.set(-5, 8, -5)
    _scene.add(fill)
    const pts = [
      ['light-1', 0xfff5e0, 3, -0.5, 2, 1],
      ['light-2', 0xffa040, 2.5, -0.5, 1.5, 0],
      ['light-3', 0xfff0d0, 2.5, -0.65, 2, -0.56],
      ['light-4', 0xa78bfa, 2, 0.6, 1.5, -0.5],
      ['light-5', 0xf0f8ff, 3, 0.6, 2, 1.0],
      ['light-6', 0xffffff, 2.5, 0.72, 2, 0.15],
    ]
    pts.forEach(([id, color, intensity, x, y, z]) => {
      const light = new THREE.PointLight(color, intensity, 12)
      light.position.set(x, y, z)
      _scene.add(light)
      lightObjects.set(id, light)
    })
  }

  function loadModel(_scene) {
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
            child.castShadow = true
            child.receiveShadow = true
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
    renderer.value?.render(scene.value, camera.value)
    labelRenderer.value?.render(scene.value, camera.value)
  }

  function onResize() {
    if (!canvasRef.value || !camera.value || !renderer.value || !labelRenderer.value) return
    const w = canvasRef.value.clientWidth
    const h = canvasRef.value.clientHeight
    camera.value.aspect = w / h
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(w, h)
    labelRenderer.value.setSize(w, h)
  }

  function resize() {
    if (!canvasRef.value || !camera.value || !renderer.value || !labelRenderer.value) return
    canvasRef.value.style.width = '100%'
    canvasRef.value.style.height = '100%'
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

  function getRenderer() {
    return renderer.value
  }

  function setLightStatus(lightId, status, intensity) {
    const light = lightObjects.get(lightId)
    if (!light) return
    const base = lightId === 'light-1' ? 3 : 2.5
    const target = status ? (intensity !== undefined ? (intensity / 100) * base : base) : 0
    gsap.to(light, { intensity: target, duration: 0.5, ease: 'power2.inOut' })
  }

  function flyTo(pos, target, duration = 1.5) {
    if (!camera.value || !controls.value) return
    gsap.killTweensOf(camera.value.position)
    gsap.killTweensOf(controls.value.target)
    gsap.to(camera.value.position, { x: pos.x, y: pos.y, z: pos.z, duration, ease: 'power3.inOut', onUpdate: () => { controls.value?.update() } })
    gsap.to(controls.value.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power3.inOut' })
  }

  function resetView() { flyTo(INITIAL_CAMERA.pos.clone(), INITIAL_CAMERA.target.clone()) }

  function flyToRoom(roomId) {
    const map = {
      'living-room': [-0.394, 2.713, 4.115, -0.48, 0, 1.06],
      'bedroom': [-0.197, 1.744, 0.901, 0.730, -0.163, -0.601],
      'bedroom2': [-1.430, 1.726, 0.678, -1.096, -0.167, -0.709],
      'kitchen': [-0.636, 1.403, 1.985, 1.006, -0.248, 1.884],
      'bathroom': [0.420, 1.213, 1.488, 1.161, -0.122, 0.495],
    }
    const t = map[roomId]
    if (t) flyTo(new THREE.Vector3(t[0], t[1], t[2]), new THREE.Vector3(t[3], t[4], t[5]))
    activeRoomId.value = roomId
    updateHotspotVisibility()
  }

  function resetView() {
    flyTo(INITIAL_CAMERA.pos.clone(), INITIAL_CAMERA.target.clone())
    activeRoomId.value = 'all'
    updateHotspotVisibility()
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
    isLoading, loadProgress, lightObjects,
    onHotspotClick, activeRoomId,
    setLightStatus, flyToRoom, resetView, flyTo,
    resize, getRenderer,
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
    position: new THREE.Vector3(1.785, 0.244, -1.780),
    cameraPos: new THREE.Vector3(0.515, 0.609, -1.782),
  },
  {
    id: 'ac-outlet-a',
    name: '空调插座A',
    icon: '🔌',
    type: 'outlet',
    room: '主卧',
    position: new THREE.Vector3(1.795, 0.250, -1.338),
    cameraPos: new THREE.Vector3(0.506, 0.580, -1.183),
  },
  {
    id: 'bedroom-light',
    name: '主卧灯开关',
    icon: '💡',
    type: 'light',
    room: '主卧',
    position: new THREE.Vector3(0.719, 0.221, 0.153),
    cameraPos: new THREE.Vector3(0.672, 0.439, -1.153),
  },
  {
    id: 'bedroom2-ac',
    name: '次卧空调',
    icon: '❄️',
    type: 'ac',
    room: '次卧',
    position: new THREE.Vector3(-0.121, 0.215, -1.768),
    cameraPos: new THREE.Vector3(-1.198, 0.597, -1.682),
  },
  {
    id: 'ac-outlet-b',
    name: '空调插座B',
    icon: '🔌',
    type: 'outlet',
    room: '次卧',
    position: new THREE.Vector3(-0.042, 0.239, -1.341),
    cameraPos: new THREE.Vector3(-1.191, 0.606, -1.355),
  },
  {
    id: 'bedroom2-light',
    name: '次卧灯开关',
    icon: '💡',
    type: 'light',
    room: '次卧',
    position: new THREE.Vector3(-0.739, 0.212, 0.153),
    cameraPos: new THREE.Vector3(-0.781, 0.622, -0.905),
  },
  {
    id: 'living-tv',
    name: '客厅电视',
    icon: '📺',
    type: 'tv',
    room: '客厅',
    position: new THREE.Vector3(-1.199, 0.201, 0.230),
    cameraPos: new THREE.Vector3(-1.209, 0.565, 1.392),
  },
  {
    id: 'living-outlet-a',
    name: '客厅插座A',
    icon: '🔌',
    type: 'outlet',
    room: '客厅',
    position: new THREE.Vector3(-1.699, -0.176, 0.221),
    cameraPos: new THREE.Vector3(-1.634, 0.223, 1.086),
  },
  {
    id: 'air-sensor',
    name: '空气质量传感器',
    icon: '📡',
    type: 'sensor',
    room: '客厅',
    position: new THREE.Vector3(-1.814, 0.229, 0.940),
    cameraPos: new THREE.Vector3(-0.930, 0.476, 0.964),
  },
  {
    id: 'door-controller',
    name: '门禁控制器',
    icon: '🔒',
    type: 'security',
    room: '玄关',
    position: new THREE.Vector3(-1.814, 0.224, 1.646),
    cameraPos: new THREE.Vector3(-1.050, 0.503, 1.624),
  },
  {
    id: 'living-light',
    name: '客厅灯开关',
    icon: '💡',
    type: 'light',
    room: '客厅',
    position: new THREE.Vector3(0.016, 0.181, 2.886),
    cameraPos: new THREE.Vector3(-0.010, 0.474, 1.772),
  },
  {
    id: 'living-outlet-b',
    name: '客厅插座B',
    icon: '🔌',
    type: 'outlet',
    room: '客厅',
    noArrow: true,
    position: new THREE.Vector3(0.016, 0.341, 2.891),
    cameraPos: new THREE.Vector3(-0.010, 0.474, 1.772),
  },
  {
    id: 'kitchen-light',
    name: '厨房灯开关',
    icon: '💡',
    type: 'light',
    room: '厨房',
    position: new THREE.Vector3(0.846, 0.185, 2.886),
    cameraPos: new THREE.Vector3(0.796, 0.473, 1.753),
  },
  {
    id: 'kitchen-outlet',
    name: '厨房插座',
    icon: '🔌',
    type: 'outlet',
    room: '厨房',
    position: new THREE.Vector3(1.810, 0.244, 1.546),
    cameraPos: new THREE.Vector3(0.549, 0.412, 1.591),
  },
  {
    id: 'smoke-sensor',
    name: '烟雾/燃气传感器',
    icon: '🔥',
    type: 'sensor',
    room: '厨房',
    position: new THREE.Vector3(1.619, 0.234, 1.332),
    cameraPos: new THREE.Vector3(1.602, 0.639, 2.473),
  },
  {
    id: 'water-sensor',
    name: '水浸传感器',
    icon: '💧',
    type: 'sensor',
    room: '卫生间',
    position: new THREE.Vector3(1.618, 0.234, 0.244),
    cameraPos: new THREE.Vector3(1.607, 0.768, 1.414),
  },
  {
    id: 'bathroom-light',
    name: '卫生间灯开关',
    icon: '💡',
    type: 'light',
    room: '卫生间',
    position: new THREE.Vector3(0.679, 0.203, 0.580),
    cameraPos: new THREE.Vector3(1.847, 0.635, 0.589),
  },
  {
    id: 'balcony-light',
    name: '阳台灯开关',
    icon: '💡',
    type: 'light',
    room: '阳台',
    position: new THREE.Vector3(0.586, 0.234, -2.193),
    cameraPos: new THREE.Vector3(0.654, 0.627, -3.035),
  },
  {
    id: 'outdoor-air-sensor',
    name: '温湿度/光照传感器',
    icon: '🌡',
    type: 'sensor',
    room: '阳台',
    position: new THREE.Vector3(1.415, 0.215, -2.193),
    cameraPos: new THREE.Vector3(1.476, 0.646, -3.021),
  },
]
