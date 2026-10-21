import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { days as dayPages, homeStay, stay } from '../data/days.js'
import { DEFS, SkyDepth, dayStar, hash, layoutStay } from './Galaxy.jsx'
import './discharge.css'
import { NavBack } from './NavIcons.jsx'

// Discharge: her sky becomes a baby mobile to take home. First her story retells itself in her sky:
// day 1 alone, then her milestones in order (the hard ones too), each day's star lighting up in its place
// as her constellations fill in week by week. Then every star lifts and flies onto the mobile:
// each week's constellation (the same stars, positions and lines as in Mila's stars) hanging on a thin
// string from one of three rings, stacked by center strings, in week order. The whole mobile turns slowly;
// each ring turns a little on its own, and each strand sways a little on its own. Drag to turn it; let go and it eases back to its slow turn.

const HALF = 48 // half the patch of sky each star's drawing needs, in the galaxy's own units
const TEX = 256
const AUTO = 0.12 // rad/s: about one turn a minute
const ease = (t) => 1 - Math.pow(1 - t, 3) // the galaxy camera's ease
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) // its long flight
const follow = (dt, rate) => 1 - Math.exp(-dt * rate)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

/* ---------- Her whole stay: 90 days, a star each, in 13 weeks, a constellation each ---------- */
const DAYS = homeStay.days
const WEEKS = Math.max(...DAYS.map((d) => d.week))
const daysOf = (w) => DAYS.filter((d) => d.week === w)
const POS = layoutStay(DAYS) // laid out as on Mila's stars: her weeks in a zigzag, in order
const pos = (d) => POS[d - 1]
// Her story's sky: the same constellations in two rows, weeks 1-7 above and 8-13 below, so it can sit above
// the words with each star larger. Only where each week sits changes; its shape is the one on her mobile.
const ROW_GAP = 30 // between the rows, in the galaxy's units
const SKY = (() => {
  const split = Math.ceil(WEEKS / 2)
  const span = (ds, i) => { const v = ds.map((d) => pos(d.d)[i]); return [Math.min(...v), Math.max(...v)] }
  const top = DAYS.filter((d) => d.week <= split), low = DAYS.filter((d) => d.week > split)
  const [x1, x2] = span(top, 0), [x3, x4] = span(low, 0), dx = (x1 + x2) / 2 - (x3 + x4) / 2
  const dy = span(top, 1)[1] - span(low, 1)[0] + ROW_GAP
  return DAYS.map((d) => { const [x, y] = pos(d.d); return d.week <= split ? [x, y] : [x + dx, y + dy] })
})()
// the space it takes on screen: a share of the screen's width and height, raised above center to clear the words
const SKY_AREA = { w: 0.86, h: 0.56, up: 0.13 }
const LINE_K = 2.5 // its lines thicken with it, as wide against her stars as on the one-row sky
// the patch of sky her stars cover, for framing it on screen
const BOX = (() => {
  const xs = SKY.map((p) => p[0]), ys = SKY.map((p) => p[1])
  return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    w: Math.max(...xs) - Math.min(...xs) + HALF * 2, h: Math.max(...ys) - Math.min(...ys) + HALF * 2 }
})()

/* ---------- Her story ---------- */
// born at: today's corrected age, less the days she's been here
const BORN_AT = (() => {
  const m = /(\d+) wk (\d+) d/.exec(dayPages[stay.today]?.correctedAge ?? '')
  if (!m) return '[weeks]'
  const t = +m[1] * 7 + +m[2] - (stay.today - 1)
  return `${Math.floor(t / 7)} wk ${t % 7} d`
})()
const BIRTH_LENGTH = '[length] cm' // not in her data yet
// The days her story stops on, in order: the one place to edit it. The days between still light up as the
// story passes them. k is the small label above the title; facts are optional.
const STEPS = [
  { d: 1, k: 'Day 1 · Arrival', title: 'Hello, small one', text: 'The day Mila arrived. She rested in her incubator while the ventilator helped her breathe.',
    facts: [['Born at', BORN_AT], ['Weight', `${DAYS[0].weight.toLocaleString()} g`], ['Length', BIRTH_LENGTH]] },
  { d: 4, k: 'Day 4', title: 'First touch', text: 'You touched her hand for the first time, through the incubator’s porthole.' },
  { d: 6, k: 'Day 6', title: 'First hold', text: 'You held her for the first time. She stayed warm and calm on your chest.' },
  { d: 14, k: 'Day 14', title: 'First bottle', text: 'She tried her first bottle and took a little before resting.' },
  { d: 17, k: 'Day 17', title: 'More breathing help for a while', text: 'Her breathing needed more support overnight, so her team turned up her CPAP. She settled again by evening.' },
  { d: 23, k: 'Day 23', title: 'Her own clothes, for the first time', text: 'Her nurse dressed her in the soft sleepsuit you brought from home.' },
  { d: 38, k: 'Day 38', title: 'Less help breathing', text: 'The air through her nose prongs was turned down low, and she kept her breathing steady.' },
  { d: 45, k: 'Day 45', title: 'Working on this again', text: 'For a few days she needed a little more breathing help. Her team turned it back up, and she rested.' },
  { d: 52, k: 'Day 52', title: 'Out of the incubator', text: 'She moved into an open crib, warm enough now in her own clothes and blankets.' },
  { d: 66, k: 'Day 66', title: 'Her first bath', text: 'You bathed her for the first time, in a small tub beside her crib.' },
  { d: 79, k: 'Day 79', title: 'Every feed by mouth', text: 'Her feeding tube came out. Now she takes every feed by bottle or at the breast.' },
  { d: 90, k: `${DAYS.length} days · ${WEEKS} weeks`, title: 'Every day, a star', text: 'Together they make her sky, and it goes home with her.' },
]
// How long each slide stays before the story moves on, in ms: the one place to tune its pace.
// byDay sets a single slide by its day (e.g. { 17: 5200 }); otherwise first, last, or default.
const TIMING = { default: 2800, first: 3600, last: 2600, byDay: {} }
const READ = (i) => TIMING.byDay[STEPS[i].d] ?? (i === 0 ? TIMING.first : i === STEPS.length - 1 ? TIMING.last : TIMING.default)
const FLY = 2.2 // s each star takes to reach its strand
const LANDED = (WEEKS - 1) * 0.14 + 6 * 0.03 + FLY // s, when the last star reaches its strand
const CONVERGE = LANDED + 0.7 // s, until the mobile is whole

// each star is drawn exactly as on Mila's stars (glow, tint, planet for a first), then hung as a sprite
function starTexture(theme, d) {
  const [x, y] = pos(d.d)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TEX}" height="${TEX}" viewBox="${x - HALF} ${y - HALF} ${HALF * 2} ${HALF * 2}">${DEFS}${dayStar(theme, d, x, y, 1, true, homeStay)}</svg>`
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
    string: c ? { width: 1.4, opacity: 0.35 } : { width: 0.7, opacity: 0.2 },
    rim: c ? { width: 9, opacity: 0.7 } : { width: 5, opacity: 0.45 }, // every ring: thick and rounded
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

// The mobile, in tiers: each ring hangs from the one above by a center string, smaller toward the bottom,
// so the whole mobile stays narrow and her stars can hang larger. Her weeks hang in order, top ring first.
//   weeks: how many hang from the ring · r: its radius · y: its height · size: how large its stars hang
const TIERS = [
  { weeks: 5, r: 305, y: 0, size: 1.2 },
  { weeks: 4, r: 210, y: -150, size: 1.14 },
  { weeks: 4, r: 130, y: -300, size: 1.08 },
]
// her everyday stars hang small so each week reads as an open constellation; her firsts (planets) stand out
const LOOK = { star: 0.78, planet: 1.5 }
const sizeOf = (d) => (homeStay.firsts[d] ? LOOK.planet : LOOK.star)
const HOOK = 70 // the top ring's crown: where the whole mobile hangs from
const CROWN = 44 // each lower ring's crown, where the center string from the ring above ties on

// where everything hangs, before any of it is drawn
export function mobilePlan() {
  let w = 0
  return TIERS.map((T, k) => ({ ...T, k, items: Array.from({ length: T.weeks }, (_, i) => {
    w += 1
    const days = daysOf(w)
    // each ring starts a little further round, so strands never hang straight under the ones above
    const a = (i / T.weeks) * Math.PI * 2 + k * 0.62
    const K = T.size * (i % 2 ? 0.86 : 1.08) // large, medium, large… so it feels hand-made, not uniform
    // the string ties on at a star near the top and middle of the week, so it hangs balanced
    const xs = days.map((d) => pos(d.d)[0]), ys = days.map((d) => pos(d.d)[1])
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, top = Math.min(...ys)
    const score = (d) => Math.abs(pos(d.d)[0] - cx) + (pos(d.d)[1] - top) * 0.7
    const tie = days.reduce((b, d) => (score(d) < score(b) ? d : b))
    const [tx, ty] = pos(tie.d)
    // a little longer or shorter on every strand, and always long enough to keep the week below its ring
    const L = Math.max(30 + (i % 2) * 34 + hash(w) * 20, (ty - top) * K + 26)
    const at = (d) => { const [x, y] = pos(d); return [(x - tx) * K, -(y - ty) * K - L, 0] }
    return { w, days, a, K, L, at }
  }) }))
}

function buildMobile(theme) {
  const st = lineStyles(theme)
  const mats = []
  const line = (pts, s) => { const l = makeLine(st.color, pts, s); mats.push(l.material); return l }
  const scaled = (s, K) => ({ ...s, width: s.width * K })
  const late = (l) => { l.material.userData.late = true; return l } // constellation lines join once their stars have landed
  const ring = (r, y) => Array.from({ length: 97 }, (_, j) => { const a = (j / 96) * Math.PI * 2; return [Math.cos(a) * r, y, Math.sin(a) * r] })

  const root = new THREE.Group()
  const tiers = []
  const strands = []
  const sprites = []
  let bottom = 0, outer = 0
  mobilePlan().forEach((T) => {
    const g = new THREE.Group() // each ring turns a little on its own string
    const hub = T.k === 0 ? HOOK : T.y + CROWN
    T.items.forEach(({ w, days, a, K, L, at }, i) => {
      // each strand hangs from its ring's edge, its constellation facing outward
      const pivot = new THREE.Group()
      pivot.position.set(Math.cos(a) * T.r, T.y, Math.sin(a) * T.r)
      pivot.rotation.y = Math.PI / 2 - a
      const sway = new THREE.Group()
      pivot.add(sway)
      sway.add(line([[0, 0, 0], [0, -L + 8, 0]], st.string))
      if (days.length > 1) sway.add(late(line(days.map((d) => at(d.d)), scaled(st.constellation, K))))
      days.forEach((d) => {
        const mat = new THREE.SpriteMaterial({ map: starTexture(theme, d), transparent: true, depthWrite: false })
        const s = new THREE.Sprite(mat)
        const p = at(d.d)
        s.position.set(...p)
        s.userData.size = HALF * 2 * K * sizeOf(d.d)
        s.scale.setScalar(s.userData.size)
        s.userData.seed = hash(d.d + 4) * Math.PI * 2
        s.userData.d = d.d
        sway.add(s)
        sprites.push(s)
        bottom = Math.min(bottom, T.y + p[1] - HALF * 0.5 * K)
        outer = Math.max(outer, Math.hypot(T.r, Math.abs(p[0]) + HALF * 0.4 * K))
      })
      g.add(pivot)
      strands.push({ sway, phase: i * 1.9 + hash(w + 7) * 2 + T.k * 0.8 })
      // a strut from the ring's crown to where this strand ties on
      g.add(line([[0, hub, 0], [Math.cos(a) * T.r, T.y, Math.sin(a) * T.r]], st.string))
    })
    g.add(line(ring(T.r, T.y), st.rim))
    root.add(g)
    tiers.push({ g, phase: T.k * 1.3 })
  })
  // the center strings: from the hook up out of the room, and from each ring's crown down to the next ring's
  root.add(line([[0, HOOK, 0], [0, 2000, 0]], st.string))
  for (let k = 1; k < TIERS.length; k++) root.add(line([[0, k === 1 ? HOOK : TIERS[k - 1].y + CROWN, 0], [0, TIERS[k].y + CROWN, 0]], st.string))

  return { root, tiers, strands, sprites, mats, bounds: { top: HOOK, bottom, R: outer } }
}

// a soft round glow, drawn once, that sits behind each lit star of her story
function haloTexture(theme) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255, 248, 230, .9)')
  r.addColorStop(0.35, theme === 'confetti' ? 'rgba(255, 210, 63, .32)' : 'rgba(243, 227, 181, .3)')
  r.addColorStop(1, 'rgba(243, 227, 181, 0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Her sky as it is on Mila's stars, flat and facing you: the same stars (sharing the mobile's drawings)
// and the same constellation lines, one segment per pair of days so they can fill in as the story goes.
function buildSky(theme, mobileSprites) {
  const st = lineStyles(theme)
  const group = new THREE.Group()
  const glow = haloTexture(theme)
  const stars = DAYS.map((d) => {
    const src = mobileSprites.find((s) => s.userData.d === d.d)
    const s = new THREE.Sprite(src.material.clone())
    s.userData = { ...src.userData, week: d.week, lit: 0, onAt: Infinity, focus: 0, src }
    s.renderOrder = 2
    group.add(s)
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }))
    halo.renderOrder = 1
    s.userData.halo = halo
    group.add(halo)
    return s
  })
  const segs = []
  for (let w = 1; w <= WEEKS; w++) {
    const ds = daysOf(w).map((d) => d.d)
    for (let i = 1; i < ds.length; i++) segs.push({ a: ds[i - 1], b: ds[i], style: st.constellation })
  }
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
  const bar = useRef(null) // the story's progress bar, filled each frame from the same clock that moves it on
  const phaseRef = useRef('intro') // survives a style change, so the mobile doesn't replay its story
  const [story, setStory] = useState({ phase: 'intro', step: 0 })
  const [took, setTook] = useState(false) // "Take home your stars": once pressed, it's on its way
  // TODO: the take-home flow (keeping her stars). A placeholder until it's designed.
  const onTakeHome = () => {}

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
    const { root, tiers, strands, sprites, mats, bounds } = buildMobile(theme)
    const sky = buildSky(theme, sprites)
    const tiltG = new THREE.Group() // dragging up and down tilts the view a little
    tiltG.add(root)
    scene.add(tiltG)
    scene.add(sky.group)

    // frame the whole mobile, seen from a little below, the way she'll see it from her crib
    const cy = (bounds.top + bounds.bottom) / 2
    const look = new THREE.Vector3(0, cy, 0)
    const right = new THREE.Vector3(), upv = new THREE.Vector3()
    const skyPos = DAYS.map(() => new THREE.Vector3())
    let skyK = 1
    const fit = (w, h) => {
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      // it fills about 70% of the screen's height (80% of its width on a narrow screen), hanging in the room
      const height = bounds.top - bounds.bottom, width = bounds.R * 2
      const dist = Math.max(height / 0.7, width / (0.8 * camera.aspect)) / 2 / t + bounds.R * 0.6
      camera.position.set(0, cy - 50, dist)
      camera.lookAt(look)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      ;[...mats, ...sky.mats].forEach((m) => m.resolution.set(w, h))
      // her sky, laid out as on Mila's stars on a plane facing the camera, a little right of center for the words
      right.setFromMatrixColumn(camera.matrixWorld, 0)
      upv.setFromMatrixColumn(camera.matrixWorld, 1)
      const visH = 2 * camera.position.distanceTo(look) * t, visW = visH * camera.aspect
      skyK = Math.min((visH * SKY_AREA.h) / BOX.h, (visW * SKY_AREA.w) / BOX.w)
      DAYS.forEach((d, i) => {
        const [x, y] = SKY[i]
        skyPos[i].copy(look).addScaledVector(right, (x - BOX.cx) * skyK).addScaledVector(upv, -(y - BOX.cy) * skyK + visH * SKY_AREA.up)
      })
      sky.segs.forEach((s) => {
        s.line.material.linewidth = s.style.width * skyK * LINE_K
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
      const gap = reduce ? 0 : Math.min(110, 1200 / fresh.length) // a long jump between days lights a little faster
      fresh.forEach((s, j) => (s.userData.onAt = now + j * gap))
      sky.stars.forEach((s) => { if (s.userData.d > D) s.userData.onAt = Infinity })
      stepAt += fresh.length > 1 ? (fresh.length - 1) * gap : 0
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
    const skip = () => { if (phase === 'mobile') return; if (phase === 'intro') dropAt = performance.now(); root.visible = true; endConverge() }
    ctl.current = { next, skip, replay: startIntro }

    // motion state
    let rotY = -Math.PI / 2 + Math.PI / TIERS[0].weeks // week 1 starts a little left of front
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
      // each ring turns a little on its own string, a beat apart from the ring above
      tiers.forEach(({ g, phase: ph }) => (g.rotation.y = amp * 0.14 * Math.sin(t * 0.32 + ph)))
      strands.forEach(({ sway, phase: ph }) => {
        sway.rotation.z = amp * 0.05 * Math.sin(t * 0.9 + ph) + lag
        sway.rotation.x = amp * 0.035 * Math.sin(t * 0.63 + ph * 1.3) - lean
      })
      // each star breathes like today's star on her sky (to 1.08 and back, every 5 s)
      const breathe = (s) => 1 + amp * 0.04 * (1 - Math.cos((t / 5) * Math.PI * 2 + s.userData.seed))
      sprites.forEach((s) => s.scale.setScalar(s.userData.size * breathe(s)))

      if (phase === 'intro') {
        if (now - stepAt > READ(step)) next()
        // past slides full, this one filling over its time (from when its star lights), later ones empty
        if (bar.current) [...bar.current.children].forEach((seg, i) => {
          seg.firstChild.style.transform = `scaleX(${i < step ? 1 : i > step ? 0 : clamp01((now - stepAt) / READ(step))})`
        })
        const k = reduce ? 1 : follow(dt, 3.2)
        sky.stars.forEach((s, i) => {
          const u = s.userData, on = now >= u.onAt
          u.lit += ((on ? 1 : 0) - u.lit) * k
          // this step's star steps forward, bright and larger; the days before it stay lit, a little quieter;
          // the days still to come wait, dim
          u.focus += ((on && u.d === STEPS[step].d && step < STEPS.length - 1 ? 1 : 0) - u.focus) * k
          s.position.copy(skyPos[i])
          s.material.opacity = 0.14 + u.lit * (0.76 + 0.1 * u.focus)
          s.scale.setScalar(HALF * 2 * skyK * sizeOf(u.d) * (0.6 + 0.4 * u.lit) * (1 + 0.6 * u.focus) * breathe(s))
          // lit stars glow softly; this step's star glows most
          u.halo.position.copy(s.position)
          u.halo.material.opacity = u.lit * (0.12 + 0.42 * u.focus)
          u.halo.scale.setScalar(s.scale.x * 1.4)
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
          s.scale.setScalar(THREE.MathUtils.lerp(HALF * 2 * skyK * sizeOf(u.d), u.src.userData.size, e) * breathe(s))
          // its glow goes with it, fading as it flies
          u.halo.position.copy(s.position)
          u.halo.material.opacity = u.lit * 0.12 * (1 - e)
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
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      ctl.current = null
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
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
          {story.step === 0 && <span className="cv-story-hint">Tap to go on</span>}
          <div className="cv-story-foot">
            <div className="cv-story-bar" ref={bar} aria-hidden="true">
              {STEPS.map((_, i) => <span key={i}><i /></span>)}
            </div>
            <button type="button" className="cv-story-ctl cv-story-continue" onClick={(e) => { e.stopPropagation(); ctl.current?.next() }}>Continue</button>
          </div>
        </div>
      )}
      {story.phase === 'mobile' && (
        <div className="cv-galaxy-title">
          <b>Mila&apos;s mobile</b>
          <span>{WEEKS} weeks of her stars, one strand for each · drag to turn it</span>
        </div>
      )}
      {story.phase === 'mobile' && (
        took
          ? <p className="cv-takehome-done cv-cta">Her mobile is on its way home with her. ✦</p>
          : <button type="button" className="cv-btn is-primary cv-cta cv-takehome-btn" onClick={() => { setTook(true); onTakeHome?.() }}>Take home your stars</button>
      )}

      <div className="cv-story-ctls">
        {story.phase === 'mobile'
          ? <button type="button" className="cv-story-ctl" onClick={() => ctl.current?.replay()}>Replay</button>
          : <button type="button" className="cv-story-ctl" onClick={() => ctl.current?.skip()}>Skip to mobile</button>}
      </div>
    </div>
  )
}
