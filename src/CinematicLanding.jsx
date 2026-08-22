import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import InpactLogo from './components/InpactLogo.jsx'
import './CinematicLanding.css'

const ALIEN = [
  '{', '}', '[', ']', '(', ')', '<', '>',
  'O', 'D', 'C', 'G', 'Q', 'U', 'Ø', '0',
  'Θ', 'Φ', 'Ω', 'Δ', 'Λ', 'Π', 'Σ', 'Ξ',
  '□', '○', '△', '◇', '☆', '▽', '◁', '▷',
  '◻', '◯', '▵', '▿', '◃', '▹', '◈', '⬡',
  '∅', '⊕', '⊗', '⊖', '⊙', '⊘', '∘', '∂',
  '╔', '╗', '╚', '╝', '╬', '┼', '╭', '╰',
  '/', '#', '≈', '∇', 'Ð', 'đ', 'ø', 'ℓ',
]

const GRID_VS = `
  attribute float aChar;
  attribute float aFlipSpeed;
  attribute float aFlipPhase;
  uniform float uTime;
  uniform float uAlpha;
  uniform float uSize;
  varying float vChar;
  varying float vCosFlip;
  varying float vAlpha;
  const float PI = 3.14159265;
  const float NC = 64.0;
  void main(){
    float angle  = uTime * aFlipSpeed + aFlipPhase;
    float cosF   = cos(angle);
    float hf     = floor(angle / PI);
    float front  = mod(aChar + hf * 7.0, NC);
    float back   = mod(aChar + (hf + 1.0) * 7.0, NC);
    vChar        = cosF >= 0.0 ? front : back;
    vCosFlip     = cosF;
    vAlpha       = uAlpha;
    gl_PointSize = max(1.0, floor(uSize + 0.5));
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`

const GRID_FS = `
  uniform sampler2D uAtlas;
  uniform vec3 uColor;
  varying float vChar;
  varying float vCosFlip;
  varying float vAlpha;
  void main(){
    float ci  = floor(vChar);
    float col = mod(ci, 8.0);
    float row = floor(ci / 8.0);
    vec2 uv   = gl_PointCoord;
    uv.y      = 1.0 - uv.y;
    float sq  = abs(vCosFlip);
    float u   = vCosFlip >= 0.0 ? uv.x : (1.0 - uv.x);
    float ru  = 0.5 + (u - 0.5) / max(sq, 0.025);
    if(ru < 0.0 || ru > 1.0) discard;
    vec2 auv  = (vec2(col,row) + vec2(ru,uv.y)) / vec2(8.0,8.0);
    vec4 tex  = texture2D(uAtlas, auv);
    if(tex.a < 0.08) discard;
    /* Narrower fade at flip so glyphs stay readable, not smeared */
    float vis = smoothstep(0.0, 0.05, sq);
    float a = tex.a * vAlpha * vis;
    gl_FragColor = vec4(uColor, a);
  }
`

function buildAtlas() {
  const COLS = 8
  const ROWS = 8
  const CW = 256
  const CH = 256
  const cv = document.createElement('canvas')
  cv.width = COLS * CW
  cv.height = ROWS * CH
  const ctx = cv.getContext('2d', { alpha: true })
  ctx.clearRect(0, 0, cv.width, cv.height)
  ctx.imageSmoothingEnabled = false
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ALIEN.forEach((ch, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const px = col * CW + CW / 2
    const py = row * CH + CH / 2
    const len = [...ch].length
    const fs = len > 2 ? 100 : len > 1 ? 120 : 140
    ctx.font = `bold ${fs}px "DM Mono","Courier New",monospace`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(ch, px, py)
  })
  const t = new THREE.CanvasTexture(cv)
  t.needsUpdate = true
  t.colorSpace = THREE.SRGBColorSpace
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.magFilter = THREE.LinearFilter
  t.generateMipmaps = true
  t.wrapS = THREE.ClampToEdgeWrapping
  t.wrapT = THREE.ClampToEdgeWrapping
  return t
}

const T = {
  TYPE_START: 2400,
}

const LINES = [
  { id: 'cin-L1', text: 'Think and react in React.' },
  { id: 'cin-L2', text: 'Type your future with TypeScript.' },
  { id: 'cin-L3', text: '' },
  { id: 'cin-L4', text: 'Start doing.  Stop watching.' },
]

export default function CinematicLanding({ onEnterEnterprise, onEnterLessons }) {
  const canvasRef = useRef(null)
  const curRef = useRef(null)
  const ringRef = useRef(null)
  const hintRef = useRef(null)
  const copyRef = useRef(null)
  const ctaWrapRef = useRef(null)

  const ctxRef = useRef(null)
  const typeTriggeredRef = useRef(false)
  const copyRunningRef = useRef(false)

  const startCopy = useCallback(async () => {
    if (copyRunningRef.current) return
    copyRunningRef.current = true
    const copyEl = copyRef.current
    if (copyEl) copyEl.classList.add('cin-copy-show')

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    for (let li = 0; li < LINES.length; li++) {
      const { id, text } = LINES[li]
      const el = document.getElementById(id)
      if (!el) continue
      const chars = [...text]
      let built = ''
      el.innerHTML = '<span class="cin-cursor-beam">_</span>'
      for (let ci = 0; ci < chars.length; ci++) {
        built += chars[ci]
        el.innerHTML = built + '<span class="cin-cursor-beam">_</span>'
        await sleep(38 + Math.random() * 36)
      }
      if (li < LINES.length - 1) {
        el.innerHTML = built
        await sleep(420)
      }
    }

    await sleep(600)
    const last = document.getElementById(LINES[LINES.length - 1].id)
    if (last) last.innerHTML = [...LINES[LINES.length - 1].text].join('')
    ctaWrapRef.current?.classList.add('cin-cta-show')
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let disposed = false

    const W = () => window.innerWidth
    const H = () => window.innerHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W(), H())
    renderer.setClearColor(0xffffff, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, W() / H(), 0.01, 50)
    camera.position.set(0, 0, 3.0)
    camera.lookAt(0, 0, 0)

    const atlas = buildAtlas()

    let gridPoints = null
    let gridMat = null

    function buildGrid() {
      const fovR = (camera.fov * Math.PI) / 180
      const halfH = Math.tan(fovR / 2) * camera.position.z
      const halfW = halfH * camera.aspect
      const pxSpacing = Math.sqrt((W() * H()) / 1000)
      const spacing = (pxSpacing * (halfH * 2)) / H()

      const pos = []
      const chars = []
      const speeds = []
      const phases = []
      for (let x = -halfW * 1.12; x <= halfW * 1.12; x += spacing) {
        for (let y = -halfH * 1.12; y <= halfH * 1.12; y += spacing) {
          pos.push(x, y, 0.0)
          chars.push(Math.floor(Math.random() * 64))
          speeds.push(1.4 + Math.random() * 3.6)
          phases.push(Math.random() * Math.PI * 2)
        }
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(pos), 3))
      geo.setAttribute('aChar', new THREE.Float32BufferAttribute(new Float32Array(chars), 1))
      geo.setAttribute('aFlipSpeed', new THREE.Float32BufferAttribute(new Float32Array(speeds), 1))
      geo.setAttribute('aFlipPhase', new THREE.Float32BufferAttribute(new Float32Array(phases), 1))

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pointSize = Math.max(18, Math.round(pxSpacing * 0.42 * dpr))
      gridMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 1 },
          uSize: { value: pointSize },
          uAtlas: { value: atlas },
          uColor: { value: new THREE.Vector3(0.034, 0.569, 0.698) },
        },
        vertexShader: GRID_VS,
        fragmentShader: GRID_FS,
        transparent: true,
        depthTest: false,
        blending: THREE.NormalBlending,
      })

      gridPoints = new THREE.Points(geo, gridMat)
      scene.add(gridPoints)
    }

    buildGrid()

    let startTs = null
    let lastTs = 0
    let mx = W() / 2
    let my = H() / 2

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      if (curRef.current) {
        curRef.current.style.left = `${mx}px`
        curRef.current.style.top = `${my}px`
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${mx}px`
        ringRef.current.style.top = `${my}px`
      }
    }

    const onResize = () => {
      renderer.setSize(W(), H())
      camera.aspect = W() / H()
      camera.updateProjectionMatrix()
      if (gridPoints) {
        scene.remove(gridPoints)
        gridPoints.geometry.dispose()
        if (gridMat) gridMat.dispose()
        gridPoints = null
        gridMat = null
      }
      buildGrid()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', onResize)

    let raf = 0
    const animate = (ts) => {
      if (disposed) return
      raf = requestAnimationFrame(animate)
      lastTs = ts
      if (!startTs) startTs = ts
      const el = ts - startTs

      gridMat.uniforms.uTime.value = ts / 1000
      gridMat.uniforms.uAlpha.value = 0.82

      if (!typeTriggeredRef.current && el >= T.TYPE_START) {
        typeTriggeredRef.current = true
        if (hintRef.current) {
          hintRef.current.style.transition = 'opacity .5s ease'
          hintRef.current.style.opacity = '0'
        }
        startCopy()
      }

      renderer.render(scene, camera)
    }

    const t0 = performance.now()
    lastTs = t0
    raf = requestAnimationFrame(animate)

    ctxRef.current = {
      dispose: () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('resize', onResize)
        cancelAnimationFrame(raf)
        renderer.dispose()
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
            else obj.material.dispose()
          }
        })
        atlas.dispose()
      },
      skip: () => {
        if (!startTs) startTs = performance.now()
        startTs = performance.now() - T.TYPE_START - 200
        gridMat.uniforms.uAlpha.value = 0.82
        if (hintRef.current) hintRef.current.style.opacity = '0'
        if (!typeTriggeredRef.current) {
          typeTriggeredRef.current = true
          startCopy()
        }
      },
    }

    const prevOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    function cancelled() {
      disposed = true
      document.documentElement.style.overflow = ''
      document.body.style.overflow = prevOverflow
    }

    return () => {
      cancelled()
      ctxRef.current?.dispose()
      ctxRef.current = null
    }
  }, [startCopy])

  const doSkip = () => {
    ctxRef.current?.skip?.()
  }

  return (
    <div className="cin-root">
      <div ref={curRef} className="cin-cur" aria-hidden />
      <div ref={ringRef} className="cin-cur-ring" aria-hidden />
      <canvas ref={canvasRef} className="cin-canvas" />

      <div className="cin-chrome">
        <InpactLogo className="cin-logo" height={120} />
        
        <div ref={hintRef} className="cin-hint">
          ↑ move cursor · code rain · watch
        </div>
      </div>

      <div ref={copyRef} className="cin-copy">
        <div className="cin-copy-wrap">
          <div className="cin-line cin-line-playwrite" id="cin-L1" />
          <div className="cin-line cin-line-playwrite" id="cin-L2" />
          <div className="cin-line cin-sm" id="cin-L3" />
          <div className="cin-line cin-tag" id="cin-L4" />
        </div>
        <div ref={ctaWrapRef} className="cin-cta-wrap">
          <div className="cin-cta-card">
            <p className="cin-cta-sub">
              These aren&apos;t coding tutorials. This is an experience builder — you join a product
              team shipping enterprise applications in the tech and trade you choose. Ready to
              continue? It&apos;s free.
            </p>
            <div className="cin-cta-choices">
              <button type="button" className="cin-cta-btn" onClick={() => onEnterEnterprise?.()}>
                Yes — show me the experience (then Apply)
              </button>
              <button type="button" className="cin-cta-btn cin-cta-btn-secondary" onClick={() => onEnterLessons?.()}>
                Not yet — just teach me React with TypeScript
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
