import { useEffect, useRef, useState } from 'react'
import { Scene } from './demo.jsx'
import { Icon, StarGlyph } from './glyphs.jsx'

// The product demo as one self-playing film, in the manner of a product feature video. The real bedside
// prototype sits in a bedside monitor on its arm; each moment of her stay opens on a title card and a
// storyboard sketch (standing in for the scenario clip cut in during editing: CLIP slots below), then the
// camera finds the monitor in a new composition (tilted to one side, the other, straight on, or pushed in
// until the screen fills the frame), with its own color in the air. A finger taps and drags; everything but
// the feature dims; a callout names it and its pillar, and a small animation beside it shows what happens.
// It ends on its own closing. Silent; the words carry it. About 3 minutes; Replay restarts it.

const PILLAR = {
  connection: { name: 'Connection', color: 'var(--connection)' },
  comprehension: { name: 'Comprehension', color: 'var(--comprehension)' },
  awareness: { name: 'Awareness', color: 'var(--awareness)' },
  baby: { name: 'For the baby', color: 'var(--warm)' },
}
const rnd = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x) }
const FIELD = Array.from({ length: 98 }, (_, k) => [rnd(k) * 100, rnd(k + 200) * 100, 0.5 + rnd(k + 400) * 1.3, 2 + rnd(k + 600) * 4])
// compositions: where the monitor sits and how it turns; the callout takes the other side
const LOOK = {
  hero: { ox: 0, ry: -16, rx: 6, sc: 0.92 },
  center: { ox: 0, ry: 0, rx: 0, sc: 1 },
  left: { ox: -0.2, ry: 9, rx: 2, sc: 0.86 }, // monitor on the left, words on the right
  right: { ox: 0.2, ry: -9, rx: 2, sc: 0.86 }, // monitor on the right, words on the left
}
const sleep = (ms, run) => new Promise((ok, no) => { const t = setTimeout(() => (run.dead ? no(new Error('stop')) : ok()), ms); run.timers.push(t) })

/* ---------- small animations that show what happens ---------- */
const sp = (x, y, r) => `M${x} ${y - r}Q${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y}Q${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}Q${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y}Q${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z`
const EX = {
  // 880 grams, next to the fruit it weighs as much as
  pineapple: () => (
    <div className="ex ex-pine">
      <svg viewBox="0 0 120 150" aria-hidden="true">
        <path className="ex-line" d="M60 46 C34 46 26 72 28 96 C30 124 44 140 60 140 C76 140 90 124 92 96 C94 72 86 46 60 46 Z" />
        <path className="ex-line" d="M34 70 L86 122 M30 96 L74 140 M48 50 L92 94 M86 70 L34 122 M90 96 L46 140 M72 50 L28 94" style={{ strokeOpacity: 0.4 }} />
        <path className="ex-line is-leaf" d="M60 46 C56 30 48 18 38 12 M60 46 C60 28 62 14 66 4 M60 46 C66 30 76 20 88 16" />
      </svg>
      <span className="ex-big">880<small>g</small></span>
      <span className="ex-note">about the weight of a small pineapple</span>
    </div>
  ),
  // six things on her, lit one at a time
  one: () => (
    <ol className="ex ex-one">
      {['Breathing tube', 'Heart stickers', 'Oxygen sensor', 'Temperature probe', 'IV line', 'Feeding tube'].map((t, k) => <li key={t} style={{ '--k': k }}><i />{t}</li>)}
    </ol>
  ),
  // the medical word, unfolded
  decode: () => (
    <div className="ex ex-decode">
      <span className="ex-acro">{['C', 'P', 'A', 'P'].map((c, k) => <b key={k} style={{ '--k': k }}>{c}</b>)}</span>
      <span className="ex-words">{['Continuous', 'Positive', 'Airway', 'Pressure'].map((w, k) => <span key={w} style={{ '--k': k }}><b>{w[0]}</b>{w.slice(1)}</span>)}</span>
      <span className="ex-note">Steady air that keeps her lungs open.</span>
    </div>
  ),
  // from what her nurse already charts to a star on her day
  chart: () => (
    <div className="ex ex-chart">
      <div className="ex-note-card">
        <span className="ex-k">Nursing note · 5:10 a.m.</span>
        <b>Mom in before early feed.</b>
        <span className="ex-sig">Marcus, RN</span>
      </div>
      <svg className="ex-arrow" viewBox="0 0 120 40" aria-hidden="true"><path className="ex-line" d="M4 20 C40 4 80 4 112 20" /><path className="ex-line" d="M104 12 L113 20 L103 27" /></svg>
      <svg className="ex-star" viewBox="-20 -20 40 40" aria-hidden="true"><circle r="16" className="ex-glow" /><path d={sp(0, 0, 10)} /></svg>
      <span className="ex-cap">Already charted. No new tasks.</span>
    </div>
  ),
  // the week ahead filling in
  week: () => (
    <div className="ex ex-week">
      {['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'].map((d, k) => (
        <span key={d} className={k === 0 ? 'is-today' : ''} style={{ '--k': k }}><b>{d}</b><i /><i /><i style={{ opacity: k === 1 ? 1 : 0.4 }} /></span>
      ))}
    </div>
  ),
}

/* ---------- the opening: Mila is born, then Dad arrives ---------- */
// 1. A UI view in the dark: her first star forms; when, her name, how early, how small.
// 2. Match cut: the star glides to the bedside monitor as the footage fades up around it, and lands on the
//    star already on that screen. 3. Over the footage, the product is layered like an ad: a soft ring
//    finds the monitor (tracking the camera's slow push), and a frosted card names what he's seeing.
// 4. The cut to his face stays clean. Positions are in the clip's own frame (1280×720), which covers the
//    screen like the video does, so the layers stay on the monitor at any window size.
const OPEN_INTRO = 6.2 // s: her birth, before the footage
const OPEN_CLIP = 7.4 // s of the 8 s clip (cut just before its end)
function Opening() {
  const vid = useRef(null)
  useEffect(() => {
    const t = setTimeout(() => { const v = vid.current; if (v) { v.currentTime = 0; v.play().catch(() => {}) } }, (OPEN_INTRO - 1.1) * 1000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="open" style={{ '--intro': `${OPEN_INTRO}s` }}>
      <div className="open-box">
        <video ref={vid} className="open-video" src="./clips/dad-arrives.mp4" muted playsInline preload="auto" />
        <div className="open-grade" aria-hidden="true" />
        {/* layered on the footage */}
        <span className="open-ring" aria-hidden="true" />
        <div className="open-card">
          <span className="dfilm-call-k" style={{ color: 'var(--connection)' }}><Icon name="connection" size={16} color="var(--connection)" />Connection</span>
          <b>Her first star</b>
          <span className="dfilm-call-line">The first thing he sees: her name, when she was born, and how small she is, in words he can picture.</span>
        </div>
        <span className="open-tag">Day 1 · 4:20 a.m.</span>
        {/* her first star: born in the dark, then carried to the monitor */}
        <span className="open-star" aria-hidden="true"><i className="open-star-glow" /><StarGlyph size={64} color="#FFF8E6" /></span>
      </div>
      <div className="open-words" aria-hidden="true">
        <span className="ow ow-1">3:42 a.m.</span>
        <b className="ow ow-2">Mila</b>
        <span className="ow ow-3">Born thirteen weeks early.</span>
        <span className="ow ow-4"><em>880 grams.</em> About the weight of a small pineapple.</span>
      </div>
    </div>
  )
}

/* ---------- the bedside monitor ---------- */
function Monitor({ children, screen }) {
  return (
    <div className="mon">
      <div className="mon-arm" aria-hidden="true"><i className="mon-arm-a" /><i className="mon-joint" /></div>
      <div className="mon-body">
        <div className="mon-screen" ref={screen}>{children}<i className="mon-glass" aria-hidden="true" /></div>
        <div className="mon-chin" aria-hidden="true"><StarGlyph size={10} color="rgba(243, 227, 181, .5)" /><i className="mon-led" /></div>
      </div>
    </div>
  )
}

export function DemoFilm({ active, thumb }) {
  const frame = useRef(null)
  const screen = useRef(null)
  const [ready, setReady] = useState(false)
  const [run, setRun] = useState(0)
  const blank = { open: 0, scene: null, cap: null, cam: { fx: 0.5, fy: 0.5, s: 1 }, look: 'hero', tint: null, spot: null, call: null, ex: null, touch: null, pad: false, card: null, dim: false, close: 0, done: false }
  const [v, setV] = useState({ ...blank, t: 0 })
  const set = (patch) => setV((x) => ({ ...x, ...patch }))

  useEffect(() => {
    if (!active || !ready || thumb) return
    const R = { dead: false, timers: [] }
    const t0 = performance.now()
    const tick = setInterval(() => set({ t: (performance.now() - t0) / 1000 }), 200)
    const doc = () => frame.current?.contentDocument
    const post = (msg) => frame.current?.contentWindow?.postMessage(msg, '*')
    const find = (sel) => (typeof sel === 'function' ? sel(doc()) : doc()?.querySelector(sel))
    const at = (sel, pad = 0.012) => {
      const el = find(sel), f = frame.current
      if (!el || !f) return null
      const r = el.getBoundingClientRect(), W = f.clientWidth, H = f.clientHeight
      return { x: r.left / W - pad, y: r.top / H - pad * 1.6, w: r.width / W + pad * 2, h: r.height / H + pad * 3.2 }
    }
    const wait = (s) => sleep(s * 1000, R)
    const look = (name, tint) => set({ look: name, ...(tint !== undefined ? { tint } : {}) })
    const zoom = (sel, s = 1.55) => { const r = at(sel, 0); if (r) set({ cam: { fx: r.x + r.w / 2, fy: r.y + r.h / 2, s } }) }
    const out = () => set({ cam: { fx: 0.5, fy: 0.5, s: 1 }, spot: null, call: null, ex: null })
    const spot = (sel, call, ex) => set({ spot: at(sel), call: call ?? null, ex: ex ?? null })
    const tap = async (sel, after) => {
      const r = at(sel, 0); if (!r) return
      const p = { x: r.x + r.w / 2, y: r.y + r.h / 2 }
      set({ touch: { ...p, s: 'move' } }); await wait(0.7)
      set({ touch: { ...p, s: 'press' } }); await wait(0.18)
      after ? after() : find(sel)?.click()
      await wait(0.35); set({ touch: { ...p, s: 'lift' } }); await wait(0.5); set({ touch: null })
    }
    const drag = async (from, to, after) => {
      const a = at(from, 0), b = at(to, 0); if (!a || !b) return
      const p = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, q = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
      set({ touch: { ...p, s: 'move' } }); await wait(0.7)
      set({ touch: { ...p, s: 'press' } }); await wait(0.25)
      set({ touch: { ...q, s: 'drag' } }); await wait(1.4)
      after?.(); await wait(0.3)
      set({ touch: { ...q, s: 'lift' } }); await wait(0.5); set({ touch: null })
    }
    // a moment of her stay: its title card, then its sketch (the scenario clip's place)
    const moment = async (card, kind, cap, s = 3.8) => {
      set({ pad: false, spot: null, call: null, ex: null, card }); await wait(2.4)
      set({ card: null }); await wait(0.5)
      if (kind) { set({ scene: kind, cap }); await wait(s); set({ scene: null, cap: null }) }
    }
    const show = async (what, settle = 1.2) => { post({ type: 'mila:show', what }); await wait(settle) }
    const chapter = async (c, settle = 1.2) => { post({ type: 'mila:chapter', chapter: c }); await wait(settle) }
    const pad = async (cap) => { set({ pad: true, cap: cap ?? null }); await wait(1.2) }
    const sky = (d) => [...d.querySelectorAll('.nav-btn, button')].find((b) => /Mila.s stars/.test(b.textContent)) ?? d.querySelector('.cv-skyt')

    const script = async () => {
      set({ ...blank })
      await chapter('born', 0.3)
      // Day 1: Mila is born (a UI view), and her first star carries us into Dad's arrival (the clip),
      // with the product layered over the footage. See <Opening>.
      set({ open: 1 }); await wait(OPEN_INTRO + OPEN_CLIP)
      set({ open: 0 }); await wait(0.6)

      // Day 1 · Comprehension
      await moment(null, 'explain', <>Her nurse explains what&apos;s on her.</>) // CLIP slot 2
      await chapter('story', 0.4); look('right', 'comprehension'); await pad(); await wait(0.4)
      spot('.fd-next', { p: 'comprehension', title: 'What’s on her', line: 'Her nurse opens it while she explains.' }); await wait(1.8)
      await tap('.fd-next'); set({ spot: null }); await wait(1)
      zoom('.fd-model', 1.45); await wait(1.1)
      spot('.fd-model', { p: 'comprehension', title: 'One thing at a time', line: 'Each thing on her lit on her body, in one plain sentence.' }, 'one'); await wait(2.6)
      await tap('.fd-next'); await wait(1.5)
      await tap('.fd-next'); await wait(1.7)
      out(); await wait(1)

      // Day 23 · Comprehension, then Connection
      await moment({ k: 'Three weeks later', t: 'Day 23' }, 'away', <>Mom has been recovering, two floors away.</>) // CLIP slot 3
      set({ scene: 'chair', cap: <>She comes back after a hard night.</> }); await wait(3.6); set({ scene: null, cap: null }) // CLIP slot 4
      await show('today', 0.3); look('left', 'comprehension'); await pad(); await wait(0.4)
      zoom('.cv-one', 1.6); await wait(1.2)
      spot('.cv-cap', { p: 'comprehension', title: 'Her day, in plain words', line: 'What happened, and what’s next, in one line.' }); await wait(2.8)
      await tap('.cv-term-btn'); await wait(0.5)
      look('center'); zoom('.cv-pop', 2.05); await wait(1.3)
      spot('.cv-pop', { p: 'comprehension', title: 'The medical word, one tap away', line: 'With her 3D model, when it’s something on her.', over: true }, 'decode'); await wait(4.6)
      set({ spot: null, call: null, ex: null }); await tap('.cv-one', () => doc()?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); await wait(0.5)
      look('right', 'connection'); zoom('.cv-arc', 1.3); await wait(1.4)
      await drag('.cv-arc-now', '.cv-arc-mark[data-kind="family"]', () => post({ type: 'mila:show', what: 'family' })); await wait(0.5)
      spot('.cv-cap', { p: 'connection', title: 'Moments she was there for', line: 'Kept from her nurse’s notes, even the ones she slept through.' }, 'chart'); await wait(4.6)
      out(); await wait(0.8)

      // Day 23 · Awareness
      look('left', 'awareness'); await show('today', 0.9)
      spot('.cv-clock', { p: 'awareness', title: 'Time, on every screen', line: 'So her day never turns into a blur.' }); await wait(2.6)
      out(); await wait(0.9)
      await tap('.cv-ahead-btn'); await wait(1.4)
      spot((d) => d.querySelector('.ah-panel') ?? d.querySelector('.ah'), { p: 'awareness', title: 'What’s ahead', line: 'Today and the next six days. Nothing is a surprise.' }, 'week'); await wait(3.6)
      await tap((d) => [...d.querySelectorAll('.ah-tabs button')].find((b) => /Next Steps/.test(b.textContent))); await wait(0.8)
      spot((d) => d.querySelector('.ah-panel') ?? d.querySelector('.ah'), { p: 'awareness', title: 'Next steps', line: 'Where she is on each path, and what comes next.' }); await wait(3)
      out(); await wait(0.6)

      // Night
      await moment({ k: '1:12 a.m.', t: 'Night' }, 'night', <>She stays beside her, in the dark.</>, 3.4) // CLIP slot 5
      await show('night', 0.3); look('center', 'night'); await pad(); await wait(0.6)
      set({ call: { p: 'baby', title: 'Night view', line: 'The screen almost disappears: the time, and one quiet line.', wide: true } }); await wait(3.8)
      set({ call: null })

      // Looking back · every day becomes a star
      await moment({ k: 'Looking back', t: 'Every day' }, null, null)
      await show('today', 0.2); look('hero', 'connection'); await pad(); await wait(0.6)
      look('center'); await wait(0.8)
      await tap(sky); await wait(0.4)
      set({ cap: 'Today’s moments gather into one star.' }); await wait(6)
      set({ cap: null, call: { p: 'connection', title: 'Every day becomes a star', line: 'Her weeks become constellations. The sky only grows.', wide: true } }); await wait(4.4)
      set({ call: null })

      // Day 98 · going home
      await moment({ k: 'Day 98', t: 'Going home' }, 'ending', <>The day she goes home.</>) // CLIP slot 6
      await show('home', 0.3); look('center', 'dawn'); await pad(); await wait(4.6)
      set({ call: { p: 'connection', title: 'Her sky goes home with her', line: 'Every star, as a mobile above her crib.', wide: true } }); await wait(4)
      set({ call: null })

      // If she doesn't go home
      await moment({ k: 'And if she doesn’t', t: 'go home' }, 'keep', <>Nothing on the screen assumes an ending.</>) // CLIP slot 7
      await show('not', 0.3); look('center', null); await pad(); await wait(2.2)
      set({ call: { p: 'connection', title: 'Her story, kept', line: 'Told at the family’s pace, one moment at a time.', wide: true } }); await wait(3)
      await tap('.rem-continue'); await wait(2.6)
      await tap('.rem-continue'); await wait(2.8)
      set({ call: null })

      // closing
      set({ pad: false, cap: null, tint: null }); await wait(1.6)
      set({ close: 1 }); await wait(3.6)
      set({ close: 2 }); await wait(3.8)
      set({ close: 3 }); await wait(5)
      set({ done: true })
    }
    script().catch(() => {})
    return () => { R.dead = true; R.timers.forEach(clearTimeout); clearInterval(tick) }
  }, [active, ready, run, thumb])

  // the camera: the composition's place and turn, then the push in toward the feature
  const sw = screen.current?.clientWidth ?? 1000, sh = screen.current?.clientHeight ?? 640
  const L = LOOK[v.look]
  const { fx, fy, s } = v.cam
  const zoomed = s > 1.01
  const scale = zoomed ? s : L.sc
  const ry = zoomed ? L.ry * 0.35 : L.ry, rx = zoomed ? 0 : L.rx
  const cam = `translate(${(0.5 - fx) * sw * scale + L.ox * window.innerWidth}px, ${(0.5 - fy) * sh * scale}px) scale(${scale}) rotateY(${ry}deg) rotateX(${rx}deg)`
  const P = v.call && PILLAR[v.call.p]
  const side = v.call && !v.call.wide && !v.call.over ? (L.ox > 0 ? 'side-l' : 'side-r') : ''
  return (
    <div className={`dfilm look-${v.look} ${v.tint ? `tint-${v.tint}` : ''} ${v.pad ? 'is-pad' : ''} ${side ? `has-call ${side}` : ''} ${v.call?.over ? 'has-over' : ''} ${v.close ? `is-close is-c${v.close}` : ''}`}>
      <div className="dfilm-bg" aria-hidden="true"><i className="w-connection" /><i className="w-comprehension" /><i className="w-awareness" /><i className="w-night" /><i className="w-dawn" /></div>
      <div className="dfilm-cam" style={{ transform: cam, '--s': scale }}>
        <Monitor screen={screen}>
          {!thumb && <iframe ref={frame} title="Mila's Sky bedside display, in the demo" src="./prototype/index.html?embed=1&chapter=born" onLoad={() => setTimeout(() => setReady(true), 400)} />}
          {thumb && <div className="ipad-thumb"><StarGlyph size={44} color="#F3E3B5" /><span>Demo</span></div>}
          <div className={`dfilm-spot ${v.spot ? 'is-on' : ''}`} style={v.spot ? { left: `${v.spot.x * 100}%`, top: `${v.spot.y * 100}%`, width: `${v.spot.w * 100}%`, height: `${v.spot.h * 100}%` } : undefined} />
          {v.touch && <span className={`dfilm-touch is-${v.touch.s}`} style={{ left: `${v.touch.x * 100}%`, top: `${v.touch.y * 100}%` }} />}
        </Monitor>
      </div>

      {P && (
        <div key={v.call.title} className={`dfilm-call ${v.call.wide ? 'is-wide' : ''} ${v.call.over ? 'is-over' : ''} ${side}`}>
          <span className="dfilm-call-k" style={{ color: P.color }}>{v.call.p !== 'baby' && <Icon name={v.call.p} size={18} color={P.color} />}{P.name}</span>
          <b>{v.call.title}</b>
          <span className="dfilm-call-line">{v.call.line}</span>
          {v.ex && EX[v.ex] && <div className="dfilm-ex" key={v.ex}>{EX[v.ex]()}</div>}
        </div>
      )}

      {v.open > 0 && <Opening />}
      {v.card && (
        <div className="dfilm-card" key={v.card.t}>
          <span className="dfilm-card-k">{v.card.k}</span>
          <b>{v.card.t}</b>
          <i />
        </div>
      )}
      {v.scene && <div key={v.scene} className="dfilm-scene"><Scene kind={v.scene} /></div>}
      {v.cap && <p key={String(v.cap)} className="dfilm-cap">{v.cap}</p>}

      <div className="dfilm-close" aria-hidden={!v.close}>
        {/* her days, as a sky: one small star each, scattered, lighting one after another */}
        <div className="dfilm-field">{FIELD.map((f, k) => <i key={k} style={{ '--k': k, left: `${f[0]}%`, top: `${f[1]}%`, '--z': f[2], '--tw': `${f[3]}s` }} />)}</div>
        <p className="dfilm-c1">Every day becomes a star.</p>
        <p className="dfilm-c2">Every star is <mark className="is-cream">hers to keep</mark>.</p>
        <div className="dfilm-c3"><StarGlyph size={46} color="#FFF8E6" /><span>Mila&apos;s Sky</span></div>
      </div>

      <div className="dfilm-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (v.t / 185) * 100)}%` }} /></div>
      {v.done && <button type="button" className="film-replay dfilm-replay" onClick={() => { setV((x) => ({ ...x, t: 0 })); setRun((r) => r + 1) }}>Replay</button>}
    </div>
  )
}
