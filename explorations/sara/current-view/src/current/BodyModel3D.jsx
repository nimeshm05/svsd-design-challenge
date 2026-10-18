import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A baby's body in three.js, drawn the way her figure is on home: a soft hologram of starlight points
// with a faint shell, not a realistic body. The area a procedure targets glows (always visible, even
// from behind) and gently pulses. Drag to turn it; arrow keys turn it when focused.
// Not anatomy: a diagram to show roughly where, for the care team to explain.
const TARGETS = {
  heart: [0.13, 0.32, 0.22], // a little to her left, in her chest
}

// her parts: [geometry, position, rotation z, scale]
function parts() {
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 16)
  return [
    [new THREE.SphereGeometry(0.6, 28, 20), [0, 1.22, 0], 0, [1, 1, 0.95]], // head
    [new THREE.SphereGeometry(1, 32, 24), [0, 0.1, 0], 0, [0.6, 0.78, 0.46]], // body
    [cap(0.14, 0.55), [0.74, 0.28, 0.05], 0.55, [1, 1, 1]], // arms
    [cap(0.14, 0.55), [-0.74, 0.28, 0.05], -0.55, [1, 1, 1]],
    [cap(0.17, 0.62), [0.3, -1.02, 0.06], 0.12, [1, 1, 1]], // legs
    [cap(0.17, 0.62), [-0.3, -1.02, 0.06], -0.12, [1, 1, 1]],
  ]
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.35, 'rgba(255,255,255,.35)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export function BodyModel3D({ target = 'heart', label }) {
  const host = useRef(null)
  const rot = useRef({ x: 0.15, y: -0.5, idle: true })

  useEffect(() => {
    const el = host.current
    const css = getComputedStyle(el)
    const cream = new THREE.Color(css.getPropertyValue('--cream').trim() || '#F3E3B5')
    const warm = new THREE.Color(css.getPropertyValue('--warm').trim() || '#FFB38A')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
    camera.position.set(0, 0.15, 6.4)

    const body = new THREE.Group()
    scene.add(body)
    const trash = []
    const shellMat = new THREE.MeshBasicMaterial({ color: cream, transparent: true, opacity: 0.07, depthWrite: false })
    const dotMat = new THREE.PointsMaterial({ color: cream, size: 0.028, transparent: true, opacity: 0.75, depthWrite: false })
    trash.push(shellMat, dotMat)
    for (const [geo, pos, rz, sc] of parts()) {
      const shell = new THREE.Mesh(geo, shellMat)
      const dots = new THREE.Points(geo, dotMat)
      for (const o of [shell, dots]) { o.position.set(...pos); o.rotation.z = rz; o.scale.set(...sc); body.add(o) }
      trash.push(geo)
    }

    // the target: a warm core and a soft halo, drawn on top of everything
    const at = TARGETS[target] ?? TARGETS.heart
    const coreGeo = new THREE.SphereGeometry(0.15, 24, 16)
    const coreMat = new THREE.MeshBasicMaterial({ color: warm, depthTest: false, transparent: true, opacity: 0.95 })
    const core = new THREE.Mesh(coreGeo, coreMat)
    const tex = glowTexture()
    const haloMat = new THREE.SpriteMaterial({ map: tex, color: warm, depthTest: false, transparent: true, blending: THREE.AdditiveBlending })
    const halo = new THREE.Sprite(haloMat)
    halo.scale.setScalar(0.9)
    for (const o of [core, halo]) { o.position.set(...at); o.renderOrder = 10; body.add(o) }
    trash.push(coreGeo, coreMat, tex, haloMat)

    const size = () => {
      const { width, height } = el.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(size)
    ro.observe(el)
    size()

    let raf, t0 = performance.now()
    const tick = (now) => {
      const t = (now - t0) / 1000
      const r = rot.current
      if (r.idle && !still) r.y += 0.003 // a slow turn until someone takes hold
      body.rotation.set(r.x, r.y, 0)
      const p = still ? 1 : 1 + Math.sin(t * 2.4) * 0.12
      core.scale.setScalar(p)
      halo.scale.setScalar(0.9 * p)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      trash.forEach((x) => x.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [target])

  const drag = useRef(null)
  const turn = (dx, dy) => {
    const r = rot.current
    r.idle = false
    r.y += dx
    r.x = Math.max(-0.9, Math.min(0.9, r.x + dy))
  }
  return (
    <div ref={host} className="ah-body3d" role="img" tabIndex={0} aria-label={label}
      onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={(e) => {
        const g = drag.current
        if (!g) return
        turn((e.clientX - g.x) * 0.01, (e.clientY - g.y) * 0.01)
        drag.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}
      onKeyDown={(e) => {
        const k = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key]
        if (k) { e.preventDefault(); turn(...k) }
      }} />
  )
}
