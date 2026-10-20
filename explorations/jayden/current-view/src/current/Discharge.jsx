import { NavBack } from './NavIcons.jsx'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { dayDetail, days as dayPages, stay, weekInfo } from '../data/days.js'
import { DEFS, WEEKS, SkyDepth, dayStar, daysOf, hash, pos } from './Galaxy.jsx'
import './discharge.css'

// Discharge: her sky becomes a baby mobile to take home. First her story retells itself in her sky:
// day 1 alone, then her milestones in order (the hard ones too), each day's star lighting up in its place
// as her constellations fill in week by week. Then every star lifts and flies onto the mobile:
// each week's constellation (the same stars, positions and lines as in Mila's stars) hanging on a thin
// string from a ring, in week order, evenly around it. The whole mobile turns slowly; each strand sways
// a little on its own. Drag to turn it; let go and it eases back to its slow turn.

const HALF = 48 // half the patch of sky each star's drawing needs, in the galaxy's own units
const TEX = 256
const AUTO = 0.12 // rad/s: about one turn a minute
const W = 1000, H = 625 // the galaxy's drawing space
const ease = (t) => 1 - Math.pow(1 - t, 3) // the galaxy camera's ease
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) // its long flight
const follow = (dt, rate) => 1 - Math.exp(-dt * rate)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

/* ---------- Her story, from her stay's own data ---------- */
// born at: today's corrected age, less the days she's been here
const BORN_AT = (() => {
  const m = /(\d+) wk (\d+) d/.exec(dayPages[stay.today]?.correctedAge ?? '')
  if (!m) return '[weeks]'
  const t = +m[1] * 7 + +m[2] - (stay.today - 1)
  return `${Math.floor(t / 7)} wk ${t % 7} d`
})()
const BIRTH_LENGTH = '[length] cm' // not in her data yet
// a milestone is any day with a first or a change in her care, in the order they happened
const MILESTONES = stay.days.filter((d) => d.d > 1).flatMap((d) => {
  const ms = dayDetail(d.d).moments
  const m = ms.find((x) => x.kind === 'first') ?? ms.find((x) => x.kind === 'change')
  return m ? [{ d: d.d, k: `Day ${d.d}`, title: m.title, text: m.plain }] : []
})
const STEPS = [
  { d: 1, k: 'Day 1 · Arrival', title: weekInfo[0].title, text: dayDetail(1).story,
    facts: [['Born at', BORN_AT], ['Weight', `${stay.days[0].weight.toLocaleString()} g`], ['Length', BIRTH_LENGTH]] },
  ...MILESTONES,
  { d: stay.today, k: `${stay.days.length} days · ${WEEKS} weeks`, title: 'Every day, a star', text: 'Together they make her sky, and it goes home with her.' },
]
const READ = (i) => (i === 0 ? 4600 : i === STEPS.length - 1 ? 3400 : 3800) // ms on each step
const FLY = 2.2 // s each star takes to reach its strand
const LANDED = (WEEKS - 1) * 0.14 + 6 * 0.03 + FLY // s, when the last star reaches its strand
const CONVERGE = LANDED + 0.7 // s, until the mobile is whole

// each star is drawn exactly as on Mila's stars (glow, tint, planet for a first), then hung as a sprite
function starTexture(theme, d) {
  const [x, y] = pos(d.d)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TEX}" height="${TEX}" viewBox="${x - HALF} ${y - HALF} ${HALF * 2} ${HALF * 2}">${DEFS}${dayStar(theme, d, x, y)}</svg>`
  const tex = new THREE.TextureLoader().load(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function lineStyles(theme) {
  const c = theme === 'confetti'
  // the same line styles as the galaxy's constellations, in its units
  return {
    color: c ? '#7cc0ff' : '#f3e3b5',
    constellation: c ? { width: 4.5, opacity: 0.7 } : { width: 1.2, opacity: 0.32 },
    pending: c ? { width: 3, opacity: 0.55, dash: [2, 9] } : { width: 1.2, opacity: 0.35, dash: [3, 6] },
    string: c ? { width: 1.4, opacity: 0.35 } : { width: 0.7, opacity: 0.2 },
    ring: c ? { width: 4, opacity: 0.6 } : { width: 1.4, opacity: 0.4 },
  }
}
function makeLine(color, pts, { width, opacity, dash }) {
  const g = new LineGeometry()
  g.setPositions(pts.flat())
  const m = new LineMaterial({ color, linewidth: width, worldUnits: true, transparent: true, opacity, depthWrite: false, dashed: !!dash, dashSize: dash?.[0] ?? 1, gapSize: dash?.[1] ?? 1 })
  m.userData.base = opacity
  const l = new Line2(g, m)
  if (dash) l.computeLineDistances()
  return l
}

function buildMobile(theme) {
  const st = lineStyles(theme)
  const mats = []
  const line = (pts, s) => { const l = makeLine(st.color, pts, s); mats.push(l.material); return l }

  const root = new THREE.Group()
  const R = Math.max(130, WEEKS * 36)
  const HOOK = 70
  const strands = []
  const sprites = []
  let bottom = 0
  for (let i = 0; i < WEEKS; i++) {
    const w = i + 1, days = daysOf(w)
    const a = (i / WEEKS) * Math.PI * 2
    // each strand hangs from the ring, its constellation facing outward
    const pivot = new THREE.Group()
    pivot.position.set(Math.cos(a) * R, 0, Math.sin(a) * R)
    pivot.rotation.y = Math.PI / 2 - a
    const sway = new THREE.Group()
    pivot.add(sway)
    // the string ties on at the week's highest star; lengths alternate so neighbours don't line up
    const top = days.reduce((t, d) => (pos(d.d)[1] < pos(t.d)[1] ? d : t))
    const [tx, ty] = pos(top.d)
    const L = 60 + (i % 2) * 50 + hash(w) * 16
    const at = (d) => { const [x, y] = pos(d); return [x - tx, -(y - ty) - L, 0] }
    sway.add(line([[0, 0, 0], [0, -L + 8, 0]], st.string))
    const joined = days.filter((d) => d.d !== stay.today).map((d) => at(d.d))
    // constellation lines join only once their stars have landed (userData.late)
    const late = (l) => { l.material.userData.late = true; return l }
    if (joined.length > 1) sway.add(late(line(joined, st.constellation)))
    // today isn't joined in yet: the same dashed thread from yesterday
    if (days.some((d) => d.d === stay.today) && days.some((d) => d.d === stay.today - 1)) sway.add(late(line([at(stay.today - 1), at(stay.today)], st.pending)))
    days.forEach((d) => {
      const mat = new THREE.SpriteMaterial({ map: starTexture(theme, d), transparent: true, depthWrite: false })
      const s = new THREE.Sprite(mat)
      s.position.set(...at(d.d))
      s.scale.setScalar(HALF * 2)
      s.userData.seed = hash(d.d + 4) * Math.PI * 2
      s.userData.d = d.d
      sway.add(s)
      sprites.push(s)
      bottom = Math.min(bottom, at(d.d)[1] - HALF * 0.5)
    })
    root.add(pivot)
    strands.push({ sway, phase: i * 1.9 + hash(w + 7) * 2 })
  }

  // the ring, a crown of struts up to one hook, and the string it all hangs from
  root.add(line(Array.from({ length: 97 }, (_, k) => { const a = (k / 96) * Math.PI * 2; return [Math.cos(a) * R, 0, Math.sin(a) * R] }), st.ring))
  for (let i = 0; i < WEEKS; i++) {
    const a = (i / WEEKS) * Math.PI * 2
    root.add(line([[0, HOOK, 0], [Math.cos(a) * R, 0, Math.sin(a) * R]], st.string))
  }
  root.add(line([[0, HOOK, 0], [0, 2000, 0]], st.string))

  return { root, strands, sprites, mats, bounds: { top: HOOK, bottom, R } }
}

// Her sky as it is on Mila's stars, flat and facing you: the same stars (sharing the mobile's drawings)
// and the same constellation lines, one segment per pair of days so they can fill in as the story goes.
function buildSky(theme, mobileSprites) {
  const st = lineStyles(theme)
  const group = new THREE.Group()
  const stars = stay.days.map((d) => {
    const src = mobileSprites.find((s) => s.userData.d === d.d)
    const s = new THREE.Sprite(src.material.clone())
    s.userData = { ...src.userData, week: d.week, lit: 0, onAt: Infinity, focus: 0, src }
    s.renderOrder = 2
    group.add(s)
    return s
  })
  const segs = []
  for (let w = 1; w <= WEEKS; w++) {
    const ds = daysOf(w).filter((d) => d.d !== stay.today).map((d) => d.d)
    for (let i = 1; i < ds.length; i++) segs.push({ a: ds[i - 1], b: ds[i], style: st.constellation })
  }
  if (stay.today > 1) segs.push({ a: stay.today - 1, b: stay.today, style: st.pending })
  segs.forEach((s) => {
    s.line = makeLine(st.color, [[0, 0, 0], [1, 0, 0]], s.style)
    s.line.renderOrder = 1
    s.reveal = 0
    group.add(s.line)
  })
  return { group, stars, segs, mats: segs.map((s) => s.line.material) }
}

export function Discharge({ theme, onBack }) {
  const host = useRef(null)
  const ctl = useRef(null)
  const phaseRef = useRef('intro') // survives a style change, so the mobile doesn't replay its story
  const [story, setStory] = useState({ phase: 'intro', step: 0 })

  useEffect(() => {
    const el = host.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      setStory({ phase: 'mobile', step: 0 }) // no WebGL: the title and the way back still show
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 1, 6000)
    const { root, strands, sprites, mats, bounds } = buildMobile(theme)
    const sky = buildSky(theme, sprites)
    const tiltG = new THREE.Group() // dragging up and down tilts the view a little
    tiltG.add(root)
    scene.add(tiltG)
    scene.add(sky.group)

    // frame the whole mobile, seen from a little below, the way she'll see it from her crib
    const cy = (bounds.top + bounds.bottom) / 2
    const look = new THREE.Vector3(0, cy, 0)
    const right = new THREE.Vector3(), upv = new THREE.Vector3()
    const skyPos = stay.days.map(() => new THREE.Vector3())
    let skyK = 1
    const fit = (w, h) => {
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const height = bounds.top - bounds.bottom + 40, width = bounds.R * 2 + 160
      const dist = Math.max(height / 2 / t, width / 2 / (t * camera.aspect)) * 1.08 + bounds.R * 0.6
      camera.position.set(0, cy - 50, dist)
      camera.lookAt(look)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      ;[...mats, ...sky.mats].forEach((m) => m.resolution.set(w, h))
      // her sky, laid out as on Mila's stars on a plane facing the camera, a little right of center for the words
      right.setFromMatrixColumn(camera.matrixWorld, 0)
      upv.setFromMatrixColumn(camera.matrixWorld, 1)
      const visH = 2 * camera.position.distanceTo(look) * t, visW = visH * camera.aspect
      skyK = Math.min((visH * 0.78) / H, (visW * 0.8) / W)
      stay.days.forEach((d, i) => {
        const [x, y] = pos(d.d)
        skyPos[i].copy(look).addScaledVector(right, (x - W / 2) * skyK + visW * 0.07).addScaledVector(upv, -(y - H / 2) * skyK)
      })
      sky.segs.forEach((s) => {
        s.line.geometry.setPositions([...skyPos[s.a - 1].toArray(), ...skyPos[s.b - 1].toArray()])
        if (s.style.dash) s.line.computeLineDistances()
      })
    }
    const ro = new ResizeObserver(() => fit(Math.max(1, el.clientWidth), Math.max(1, el.clientHeight)))
    ro.observe(el)
    fit(Math.max(1, el.clientWidth), Math.max(1, el.clientHeight))

    /* ---------- the story ---------- */
    let phase = 'intro', step = 0, stepAt = 0, convAt = 0, dropAt = performance.now()
    const tell = () => { phaseRef.current = phase; setStory({ phase, step }) }
    const goStep = (n) => {
      const now = performance.now(), D = STEPS[n].d
      step = n
      stepAt = now
      // days up to this one light in order, a beat apart; this step's own star last. Later days go dark.
      const fresh = sky.stars.filter((s) => s.userData.d <= D && s.userData.onAt === Infinity)
      fresh.forEach((s, j) => (s.userData.onAt = now + (reduce ? 0 : j * 110)))
      sky.stars.forEach((s) => { if (s.userData.d > D) s.userData.onAt = Infinity })
      stepAt += fresh.length > 1 && !reduce ? (fresh.length - 1) * 110 : 0
      tell()
    }
    const startIntro = () => {
      phase = 'intro'
      root.visible = false
      sky.group.visible = true
      sprites.forEach((s) => (s.visible = false))
      mats.forEach((m) => (m.opacity = 0))
      sky.stars.forEach((s) => { s.userData.onAt = Infinity; s.userData.lit = 0; s.userData.focus = 0; s.visible = true })
      sky.segs.forEach((s) => (s.reveal = 0))
      goStep(0)
    }
    const startConverge = () => {
      if (phase !== 'intro') return
      phase = 'converge'
      convAt = dropAt = performance.now()
      sky.stars.forEach((s) => { if (s.userData.onAt === Infinity) s.userData.onAt = convAt })
      root.visible = true
      tell()
      if (reduce) endConverge()
    }
    const endConverge = () => {
      phase = 'mobile'
      sky.group.visible = false
      sprites.forEach((s) => (s.visible = true))
      mats.forEach((m) => (m.opacity = m.userData.base))
      tell()
    }
    const next = () => { if (phase === 'intro') (step < STEPS.length - 1 ? goStep(step + 1) : startConverge()) }
    const prev = () => { if (phase === 'intro' && step > 0) goStep(step - 1) }
    const skip = () => { if (phase === 'mobile') return; if (phase === 'intro') dropAt = performance.now(); root.visible = true; endConverge() }
    ctl.current = { next, skip, replay: startIntro }

    // motion state
    let rotY = -Math.PI / 2 + Math.PI / WEEKS // week 1 starts a little left of front
    let vel = reduce ? 0 : AUTO, tilt = 0, lag = 0, lean = 0
    let drag = null
    const auto = reduce ? 0 : AUTO
    const amp = reduce ? 0 : 1
    const t0 = performance.now()
    let last = t0, raf
    const v = new THREE.Vector3()

    if (phaseRef.current === 'mobile') { root.visible = true; endConverge() } else startIntro()

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000), t = (now - t0) / 1000
      last = now
      if (!drag) {
        vel += (auto - vel) * follow(dt, 1.2)
        rotY += vel * dt
        tilt += (0 - tilt) * follow(dt, 1.5)
      }
      root.rotation.y = rotY
      tiltG.rotation.x = tilt
      // it settles in from just above, on the galaxy's ease
      root.position.y = reduce ? 0 : 40 * (1 - ease(Math.min(1, (now - dropAt) / 1600)))
      // a fling makes the strands trail behind, a faster turn swings them out a little
      lag += (THREE.MathUtils.clamp(-(vel - auto) * 0.25, -0.35, 0.35) - lag) * follow(dt, 2)
      lean += (Math.min(0.25, Math.abs(vel) * 0.22) - lean) * follow(dt, 2)
      strands.forEach(({ sway, phase: ph }) => {
        sway.rotation.z = amp * 0.05 * Math.sin(t * 0.9 + ph) + lag
        sway.rotation.x = amp * 0.035 * Math.sin(t * 0.63 + ph * 1.3) - lean
      })
      // each star breathes like today's star on her sky (to 1.08 and back, every 5 s)
      const breathe = (s) => 1 + amp * 0.04 * (1 - Math.cos((t / 5) * Math.PI * 2 + s.userData.seed))
      sprites.forEach((s) => s.scale.setScalar(HALF * 2 * breathe(s)))

      if (phase === 'intro') {
        if (now - stepAt > READ(step)) next()
        const k = reduce ? 1 : follow(dt, 3.2)
        sky.stars.forEach((s, i) => {
          const u = s.userData, on = now >= u.onAt
          u.lit += ((on ? 1 : 0) - u.lit) * k
          // this step's star steps forward; the days before it stay lit, a little quieter
          u.focus += ((on && u.d === STEPS[step].d && step < STEPS.length - 1 ? 1 : 0) - u.focus) * k
          s.position.copy(skyPos[i])
          s.material.opacity = u.lit * (0.8 + 0.2 * u.focus)
          s.scale.setScalar(HALF * 2 * skyK * (0.6 + 0.4 * u.lit) * (1 + 0.35 * u.focus) * breathe(s))
        })
        sky.segs.forEach((s) => {
          s.reveal += ((now >= sky.stars[s.b - 1].userData.onAt ? 1 : 0) - s.reveal) * (reduce ? 1 : follow(dt, 2.4))
          s.line.material.opacity = s.style.opacity * s.reveal
        })
      } else if (phase === 'converge') {
        // every star lifts and flies onto its strand, week by week; the lines let go, the mobile's own appear
        const tc = (now - convAt) / 1000
        tiltG.updateMatrixWorld(true)
        sky.stars.forEach((s) => {
          const u = s.userData, order = daysOf(u.week).findIndex((d) => d.d === u.d)
          const p = clamp01((tc - (u.week - 1) * 0.14 - order * 0.03) / FLY), e = easeInOut(p)
          u.src.getWorldPosition(v)
          s.position.copy(skyPos[u.d - 1]).lerp(v, e).addScaledVector(upv, Math.sin(Math.PI * p) * 40)
          u.lit += (1 - u.lit) * follow(dt, 3.2)
          s.material.opacity = u.lit
          s.scale.setScalar(THREE.MathUtils.lerp(HALF * 2 * skyK, HALF * 2, e) * breathe(s))
        })
        sky.segs.forEach((s) => (s.line.material.opacity = s.style.opacity * s.reveal * (1 - clamp01(tc / 0.6))))
        // the ring and strings gather while the stars fly; each week's lines join once its stars are on
        mats.forEach((m) => (m.opacity = m.userData.base * ease(m.userData.late ? clamp01((tc - LANDED + 0.3) / 1) : clamp01((tc - 0.8) / (LANDED - 0.8)))))
        if (tc >= CONVERGE) endConverge()
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // in the story, a tap moves it on; on the mobile, a drag turns it
    const down = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, at: performance.now(), turn: phase === 'mobile' }
      if (!drag.turn) return
      vel = 0
      el.setPointerCapture(e.pointerId)
      el.classList.add('is-dragging')
    }
    const move = (e) => {
      if (!drag?.turn) return
      const now = performance.now(), dx = e.clientX - drag.x, dy = e.clientY - drag.y
      const dr = dx * 0.006, ddt = Math.max(0.008, (now - drag.at) / 1000)
      rotY += dr
      vel += (dr / ddt - vel) * 0.5
      tilt = THREE.MathUtils.clamp(tilt + dy * 0.003, -0.3, 0.3)
      Object.assign(drag, { x: e.clientX, y: e.clientY, at: now })
    }
    const up = (e) => {
      if (!drag) return
      if (!drag.turn) {
        if (e.type === 'pointerup' && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) next()
        drag = null
        return
      }
      if (performance.now() - drag.at > 80) vel = 0 // held still before letting go
      vel = THREE.MathUtils.clamp(vel, -3, 3)
      drag = null
      el.classList.remove('is-dragging')
    }
    const key = (e) => {
      if (phase !== 'intro') return
      if (['ArrowRight', 'ArrowDown', ' ', 'Enter'].includes(e.key) && !e.target.closest?.('button')) { e.preventDefault(); next() }
      if (e.key === 'ArrowRight' && e.target.closest?.('button')) next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev() }
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    window.addEventListener('keydown', key)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      ctl.current = null
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      window.removeEventListener('keydown', key)
      scene.traverse((o) => {
        o.geometry?.dispose()
        o.material?.map?.dispose()
        o.material?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [theme])

  const cur = STEPS[story.step]
  return (
    <div className={`cv-discharge is-${theme} is-${story.phase}`}>
      <SkyDepth theme={theme} />
      <div className="cv-mobile" ref={host} role="img" aria-label={`A baby mobile made of Mila's stars: ${WEEKS} weeks, one constellation hanging for each. Drag to turn it.`} />
      <div className="nav-bar-top"><NavBack label="Mila's stars" onClick={onBack} /></div>

      {story.phase === 'intro' && (
        <div className="cv-story" key={story.step} aria-live="polite" onClick={() => ctl.current?.next()}>
          <span className="cv-story-k">{cur.k}</span>
          <h3 className="cv-story-title">{cur.title}</h3>
          <p className="cv-story-text">{cur.text}</p>
          {cur.facts && (
            <dl className="cv-story-facts">
              {cur.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          )}
          {story.step === 0 && <span className="cv-story-hint">Tap or press → to go on</span>}
          <span className="cv-story-dots" aria-hidden="true">
            {STEPS.map((_, i) => <i key={i} className={i === story.step ? 'is-on' : i < story.step ? 'is-past' : ''} />)}
          </span>
        </div>
      )}
      {story.phase === 'mobile' && (
        <div className="cv-galaxy-title">
          <b>Mila&apos;s mobile</b>
          <span>{WEEKS} weeks of her stars, one strand for each · drag to turn it</span>
        </div>
      )}

      <div className="cv-story-ctls">
        {story.phase === 'mobile'
          ? <button type="button" className="nav-btn" onClick={() => ctl.current?.replay()}><span>Replay</span></button>
          : <button type="button" className="nav-btn" onClick={() => ctl.current?.skip()}><span>Skip to mobile</span></button>}
      </div>
    </div>
  )
}
