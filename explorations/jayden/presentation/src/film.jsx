import { useEffect, useRef, useState } from 'react'
import { Scene } from './demo.jsx'
import { Icon, StarGlyph } from './glyphs.jsx'

// The product demo as one self-playing film, in the manner of a product feature video. The real bedside
// prototype sits in a bedside monitor on its arm; each moment of her stay opens on a title card and a
// storyboard sketch (standing in for the scenario clip cut in during editing: CLIP slots below), then the
// camera finds the monitor in a new composition (tilted to one side, the other, straight on, or pushed in
// until the screen fills the frame), with its own color in the air. A finger taps and drags; a callout names
// the feature and its pillar, and a piece of the feature's own UI floats out beside it, like an app ad.
// It ends on its own closing. Silent; the words carry it. About 3 minutes.
// It runs on its own clock, so it can pause and be scrubbed: seeking replays the script quickly up to that
// moment (behind a veil), then plays on from there.

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

/* ---------- small animations that show what happens ---------- */
const sp = (x, y, r) => `M${x} ${y - r}Q${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y}Q${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}Q${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y}Q${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z`
const EX = {
  // the Day 1 screen, lifted out of the monitor
  firststar: () => (
    <div className="ex ex-ui ex-first">
      <svg viewBox="-30 -30 60 60" aria-hidden="true"><circle r="26" className="ex-first-glow" /><path d={sp(0, 0, 13)} /></svg>
      <b className="ex-first-name">Mila</b>
      <span className="ex-first-born">Born today at 3:42 a.m.</span>
      <span className="ex-first-size"><b>880 grams</b>, about the weight of a small pineapple.</span>
      <em>Her star is as big as she is.</em>
    </div>
  ),
  // her status line, lifted out
  status: () => (
    <div className="ex ex-ui ex-status">
      <span className="ex-k">Right now · Next feed 3:00 p.m.</span>
      <b>Resting on her <u>CPAP</u> mask after a long night</b>
    </div>
  ),
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
    <ol className="ex ex-ui ex-one">
      {['Breathing tube', 'Heart stickers', 'Oxygen sensor', 'Temperature probe', 'IV line', 'Feeding tube'].map((t, k) => <li key={t} style={{ '--k': k }}><i />{t}</li>)}
    </ol>
  ),
  // the medical word, unfolded
  decode: () => (
    <div className="ex ex-ui ex-decode">
      <span className="ex-acro">{['C', 'P', 'A', 'P'].map((c, k) => <b key={k} style={{ '--k': k }}>{c}</b>)}</span>
      <span className="ex-words">{['Continuous', 'Positive', 'Airway', 'Pressure'].map((w, k) => <span key={w} style={{ '--k': k }}><b>{w[0]}</b>{w.slice(1)}</span>)}</span>
      <span className="ex-note">Steady air that keeps her lungs open.</span>
    </div>
  ),
  // from what her nurse already charts to a star on her day
  chart: () => (
    <div className="ex ex-ui ex-chart">
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
    <div className="ex ex-ui ex-week">
      {['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'].map((d, k) => (
        <span key={d} className={k === 0 ? 'is-today' : ''} style={{ '--k': k }}><b>{d}</b><i /><i /><i style={{ opacity: k === 1 ? 1 : 0.4 }} /></span>
      ))}
    </div>
  ),
}

/* ---------- the opening: Mila is born, then Dad arrives ---------- */
// 1. A UI view in the dark: her first star forms; when, her name, how early, how small.
// 2. The footage, played backwards: it opens on Dad's face, then pulls back to reveal her monitor.
// 3. As the monitor comes into view, its Day 1 screen lifts out of it as a floating card, and stays.
// 4. The camera pushes into the monitor and the film carries on inside the screen.
// Everything here is driven by the film's clock (pause, scrub). Positions are in the clip's own frame,
// which covers the screen exactly as the video does.
const OPEN_INTRO = 4.6 // s: her birth, before the footage
const OPEN_VIDEO = 8 // s of the reversed clip
const OPEN_LEN = OPEN_INTRO + OPEN_VIDEO + 0.6
const NURSE_LEN = 8
function Opening({ clock }) {
  const host = useRef(null)
  const vid = useRef(null)
  useEffect(() => {
    const loop = () => {
      const el = host.current, v = vid.current
      if (el) {
        const local = clock.local()
        // every CSS animation in here is held and set to this moment
        el.getAnimations({ subtree: true }).forEach((an) => { if (an.playState !== 'paused') an.pause(); an.currentTime = local * 1000 })
        if (v && v.readyState >= 1) {
          const vt = Math.min(Math.max(local - (OPEN_INTRO - 0.4), 0), v.duration - 0.05)
          if (clock.playing() && local > OPEN_INTRO - 0.4) {
            if (v.paused) v.play().catch(() => {})
            if (Math.abs(v.currentTime - vt) > 0.25) v.currentTime = vt
          } else {
            if (!v.paused) v.pause()
            if (Math.abs(v.currentTime - vt) > 0.04) v.currentTime = vt
          }
        }
      }
    }
    loop()
    const id = setInterval(loop, 30)
    return () => clearInterval(id)
  }, [clock])
  return (
    <div className="open" ref={host} style={{ '--intro': `${OPEN_INTRO}s` }}>
      <div className="open-box">
        <video ref={vid} className="open-video" src="./clips/dad-arrives-reversed.mp4" muted playsInline preload="auto" />
        <div className="open-grade" aria-hidden="true" />
        <span className="open-tag">Day 1 · 4:20 a.m.</span>
        {/* her Day 1 screen, lifting out of the monitor as it comes into view, then staying */}
        <div className="open-lift">
          <span className="dfilm-call-k" style={{ color: 'var(--connection)' }}><Icon name="connection" size={16} color="var(--connection)" />Connection</span>
          <b className="open-lift-title">Her first star</b>
          {EX.firststar()}
        </div>
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

/* ---------- a scenario clip, with the product layered on it ---------- */
// Footage plays from the film's clock (so it pauses and scrubs). Its layers are children; their CSS
// animations are held and set to the clip's own time, so their delays read as seconds into the clip.
function Footage({ src, clock, at, className = '', children }) {
  const host = useRef(null)
  const vid = useRef(null)
  useEffect(() => {
    const loop = () => {
      const el = host.current, v = vid.current
      if (el) {
        const local = clock.now() - at
        el.getAnimations({ subtree: true }).forEach((an) => { if (an.playState !== 'paused') an.pause(); an.currentTime = local * 1000 })
        if (v && v.readyState >= 1) {
          const vt = Math.min(Math.max(local, 0), v.duration - 0.05)
          if (clock.playing()) { if (v.paused) v.play().catch(() => {}); if (Math.abs(v.currentTime - vt) > 0.25) v.currentTime = vt }
          else { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - vt) > 0.04) v.currentTime = vt }
        }
      }
    }
    loop()
    const id = setInterval(loop, 30)
    return () => clearInterval(id)
  }, [clock, at])
  return (
    <div className={`foot ${className}`} ref={host}>
      <div className="open-box foot-box">
        <video ref={vid} className="foot-video" src={src} muted playsInline preload="auto" />
        <div className="open-grade foot-grade" aria-hidden="true" />
        {children}
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

const FILM_GUESS = 160
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

export function DemoFilm({ active, thumb }) {
  const frame = useRef(null)
  const screen = useRef(null)
  const [ready, setReady] = useState(false)
  const [run, setRun] = useState(0)
  const blank = { open: 0, foot: null, scene: null, cap: null, cam: { fx: 0.5, fy: 0.5, s: 1 }, look: 'hero', tint: null, spot: null, call: null, ex: null, touch: null, pad: false, card: null, dim: false, close: 0, done: false }
  const [v, setV] = useState({ ...blank, t: 0 })
  const set = (patch) => setV((x) => ({ ...x, ...patch }))
  const [playing, setPlaying] = useState(true)
  const [seekTo, setSeekTo] = useState(0)
  const [len, setLen] = useState(FILM_GUESS)
  const [marks, setMarks] = useState([])
  const Rref = useRef(null)
  const host = useRef(null)
  // the clock as the opening sees it
  const clock = useRef({
    local: () => (Rref.current ? Rref.current.clock - (Rref.current.openAt ?? 0) : 0),
    playing: () => !!Rref.current && Rref.current.playing && Rref.current.clock >= Rref.current.target,
    now: () => Rref.current?.clock ?? 0,
  }).current

  // pause and play everything that moves: the film's own animations, the prototype's, and the clock
  useEffect(() => {
    const R = Rref.current
    if (R) R.playing = playing
    // (the opening and the clips keep their own time from the clock)
    const own = [...(host.current?.querySelectorAll('.open, .foot') ?? [])]
    const all = [...(host.current?.getAnimations({ subtree: true }) ?? []), ...(frame.current?.contentDocument?.getAnimations?.() ?? [])]
      .filter((an) => !own.some((o) => o.contains(an.effect?.target)))
    all.forEach((an) => (playing ? an.play() : an.pause()))
  }, [playing])

  useEffect(() => {
    if (!active || !ready || thumb) return
    // the film's clock: it runs while playing; while seeking it jumps ahead through the script
    const R = { dead: false, timers: [], clock: 0, target: seekTo, playing, openAt: 0 }
    Rref.current = R
    let last = performance.now(), shown = -1
    // a plain timer (animation frames stop in a hidden window, and the film should keep time anyway)
    const ticker = setInterval(() => {
      if (R.dead) return
      const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now
      if (R.playing && R.clock >= R.target) R.clock += dt
      const tt = Math.round(R.clock * 10) / 10
      if (tt !== shown) { shown = tt; set({ t: tt, seeking: R.clock < R.target }) }
    }, 16)
    const wait = (sec) => new Promise((ok, no) => {
      const end = R.clock + sec
      const step = () => {
        if (R.dead) return no(new Error('stop'))
        if (R.clock < R.target) { R.clock = Math.min(end, R.target); return R.timers.push(setTimeout(R.clock >= end ? ok : step, 30)) }
        if (R.clock >= end - 0.001) return ok()
        R.timers.push(setTimeout(step, 16))
      }
      step()
    })
    const mark = (label) => setMarks((m) => (m.some((x) => x.label === label) ? m : [...m, { t: R.clock, label }]))
    const doc = () => frame.current?.contentDocument
    const post = (msg) => frame.current?.contentWindow?.postMessage(msg, '*')
    const find = (sel) => (typeof sel === 'function' ? sel(doc()) : doc()?.querySelector(sel))
    const at = (sel, pad = 0.012) => {
      const el = find(sel), f = frame.current
      if (!el || !f) return null
      const r = el.getBoundingClientRect(), W = f.clientWidth, H = f.clientHeight
      return { x: r.left / W - pad, y: r.top / H - pad * 1.6, w: r.width / W + pad * 2, h: r.height / H + pad * 3.2 }
    }
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
      // Day 1: Mila is born (a UI view), then Dad's arrival, backwards: his face, then her monitor, its
      // screen lifting out beside it; then into the screen. See <Opening>.
      mark('Day 1'); R.openAt = R.clock; set({ open: 1 }); await wait(OPEN_LEN - 0.6)
      // inside the screen: her first star fills the frame, then the monitor pulls back into view
      look('center'); set({ pad: true, cam: { fx: 0.5, fy: 0.42, s: 2.6 } }); await wait(0.6)
      set({ open: 0 }); await wait(0.6)
      out(); await wait(1.8)

      // Day 1 · Comprehension
      mark('What’s on her')
      // the nurse clip: she points at the monitor, its "What's on her" lifts out and stays; then into it
      await chapter('story', 0.2)
      set({ pad: false, foot: { id: 'nurse', at: R.clock } }); await wait(NURSE_LEN - 0.6)
      look('right', 'comprehension'); set({ pad: true, cam: { fx: 0.5, fy: 0.62, s: 2.4 } }); await wait(0.6)
      set({ foot: null }); await wait(0.3)
      out(); await wait(1.6)
      await tap('.fd-next'); await wait(1)
      zoom('.fd-model', 1.45); await wait(1.1)
      spot('.fd-model', { p: 'comprehension', title: 'One thing at a time', line: 'Each thing on her lit on her body, in one plain sentence.' }, 'one'); await wait(2.6)
      await tap('.fd-next'); await wait(1.5)
      await tap('.fd-next'); await wait(1.7)
      out(); await wait(1)

      // Day 23 · Comprehension, then Connection
      mark('Day 23')
      await moment({ k: 'Three weeks later', t: 'Day 23' }, 'away', <>Mom has been recovering, two floors away.</>) // CLIP slot 3
      set({ scene: 'chair', cap: <>She comes back after a hard night.</> }); await wait(3.6); set({ scene: null, cap: null }) // CLIP slot 4
      await show('today', 0.3); look('left', 'comprehension'); await pad(); await wait(0.4)
      zoom('.cv-one', 1.6); await wait(1.2)
      spot('.cv-cap', { p: 'comprehension', title: 'Her day, in plain words', line: 'What happened, and what’s next, in one line.' }, 'status'); await wait(2.8)
      await tap('.cv-term-btn'); await wait(0.5)
      look('center'); zoom('.cv-pop', 2.05); await wait(1.3)
      spot('.cv-pop', { p: 'comprehension', title: 'The medical word, one tap away', line: 'With her 3D model, when it’s something on her.', over: true }, 'decode'); await wait(4.6)
      set({ spot: null, call: null, ex: null }); await tap('.cv-one', () => doc()?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); await wait(0.5)
      look('right', 'connection'); zoom('.cv-arc', 1.3); await wait(1.4)
      await drag('.cv-arc-now', '.cv-arc-mark[data-kind="family"]', () => post({ type: 'mila:show', what: 'family' })); await wait(0.5)
      spot('.cv-cap', { p: 'connection', title: 'Moments she was there for', line: 'Kept from her nurse’s notes, even the ones she slept through.' }, 'chart'); await wait(4.6)
      out(); await wait(0.8)

      // Day 23 · Awareness
      mark('What’s ahead')
      look('left', 'awareness'); await show('today', 0.9)
      spot('.cv-clock', { p: 'awareness', title: 'Time, on every screen', line: 'So her day never turns into a blur.' }); await wait(2.6)
      out(); await wait(0.9)
      await tap('.cv-ahead-btn'); await wait(1.4)
      spot((d) => d.querySelector('.ah-panel') ?? d.querySelector('.ah'), { p: 'awareness', title: 'What’s ahead', line: 'Today and the next six days. Nothing is a surprise.' }, 'week'); await wait(3.6)
      await tap((d) => [...d.querySelectorAll('.ah-tabs button')].find((b) => /Next Steps/.test(b.textContent))); await wait(0.8)
      spot((d) => d.querySelector('.ah-panel') ?? d.querySelector('.ah'), { p: 'awareness', title: 'Next steps', line: 'Where she is on each path, and what comes next.' }); await wait(3)
      out(); await wait(0.6)

      // Night
      mark('Night')
      await moment({ k: '1:12 a.m.', t: 'Night' }, 'night', <>She stays beside her, in the dark.</>, 3.4) // CLIP slot 5
      await show('night', 0.3); look('center', 'night'); await pad(); await wait(0.6)
      set({ call: { p: 'baby', title: 'Night view', line: 'The screen almost disappears: the time, and one quiet line.', wide: true } }); await wait(3.8)
      set({ call: null })

      // Looking back · every day becomes a star
      mark('Every day')
      await moment({ k: 'Looking back', t: 'Every day' }, null, null)
      await show('today', 0.2); look('hero', 'connection'); await pad(); await wait(0.6)
      look('center'); await wait(0.8)
      await tap(sky); await wait(0.4)
      set({ cap: 'Today’s moments gather into one star.' }); await wait(6)
      set({ cap: null, call: { p: 'connection', title: 'Every day becomes a star', line: 'Her weeks become constellations. The sky only grows.', wide: true } }); await wait(4.4)
      set({ call: null })

      // Day 98 · going home
      mark('Going home')
      await moment({ k: 'Day 98', t: 'Going home' }, 'ending', <>The day she goes home.</>) // CLIP slot 6
      await show('home', 0.3); look('center', 'dawn'); await pad(); await wait(4.6)
      set({ call: { p: 'connection', title: 'Her sky goes home with her', line: 'Every star, as a mobile above her crib.', wide: true } }); await wait(4)
      set({ call: null })

      // If she doesn't go home
      mark('If she doesn’t')
      await moment({ k: 'And if she doesn’t', t: 'go home' }, 'keep', <>Nothing on the screen assumes an ending.</>) // CLIP slot 7
      await show('not', 0.3); look('center', null); await pad(); await wait(2.2)
      set({ call: { p: 'connection', title: 'Her story, kept', line: 'Told at the family’s pace, one moment at a time.', wide: true } }); await wait(3)
      await tap('.rem-continue'); await wait(2.6)
      await tap('.rem-continue'); await wait(2.8)
      set({ call: null })

      // closing
      mark('Closing')
      set({ pad: false, cap: null, tint: null }); await wait(1.6)
      set({ close: 1 }); await wait(3.6)
      set({ close: 2 }); await wait(3.8)
      set({ close: 3 }); await wait(5)
      setLen(R.clock); set({ done: true })
    }
    script().catch(() => {})
    return () => { R.dead = true; R.timers.forEach(clearTimeout); clearInterval(ticker) }
  }, [active, ready, run, thumb, seekTo]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <div ref={host} className={`dfilm ${v.seeking ? 'is-seeking' : ''} ${playing ? '' : 'is-paused'} look-${v.look} ${v.tint ? `tint-${v.tint}` : ''} ${v.pad ? 'is-pad' : ''} ${side ? `has-call ${side}` : ''} ${v.call?.over ? 'has-over' : ''} ${v.close ? `is-close is-c${v.close}` : ''}`}>
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

      {v.open > 0 && <Opening clock={clock} />}
      {v.foot?.id === 'nurse' && (
        <Footage src="./clips/nurse-explains.mp4" clock={clock} at={v.foot.at} className="foot-nurse">
          <span className="open-tag foot-tag">Day 1 · 5:10 a.m.</span>
          <div className="open-lift foot-lift">
            <span className="dfilm-call-k" style={{ color: 'var(--comprehension)' }}><Icon name="comprehension" size={16} color="var(--comprehension)" />Comprehension</span>
            <b className="open-lift-title">What&apos;s on her</b>
            <div className="ex ex-ui ex-walk">
              <span className="ex-walk-k">1 of 6</span>
              <b>Breathing tube</b>
              <span>A soft tube that helps her breathe while her lungs grow stronger.</span>
              <i className="ex-walk-dots">{[0, 1, 2, 3, 4, 5].map((k) => <i key={k} className={k === 0 ? 'is-on' : ''} />)}</i>
            </div>
          </div>
        </Footage>
      )}
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

      {/* play, pause and scrub: shown on hover, so a recording stays clean */}
      {!thumb && (
        <div className="dfc">
          <button type="button" className="dfc-play" onClick={() => { if (v.done) { setSeekTo(0); setRun((r) => r + 1); setPlaying(true) } else setPlaying((p) => !p) }} aria-label={v.done ? 'Replay' : playing ? 'Pause' : 'Play'}>
            {v.done ? '↺' : playing ? <svg viewBox="0 0 12 12" width="12" height="12"><rect x="2" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" /><rect x="7.4" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" /></svg> : <svg viewBox="0 0 12 12" width="12" height="12"><path d="M3 1.5 L10.5 6 L3 10.5 Z" fill="currentColor" /></svg>}
          </button>
          <span className="dfc-time">{fmt(v.t)}</span>
          <div className="dfc-track">
            <input type="range" min="0" max={Math.round(len * 10)} value={Math.round(v.t * 10)} aria-label="Scrub the film"
              onChange={(e) => { setSeekTo(+e.target.value / 10); setRun((r) => r + 1) }} />
            <i className="dfc-fill" style={{ width: `${Math.min(100, (v.t / len) * 100)}%` }} />
            {marks.map((m) => <button key={m.label} type="button" className="dfc-mark" style={{ left: `${(m.t / len) * 100}%` }} title={m.label} onClick={() => { setSeekTo(m.t); setRun((r) => r + 1) }}><span>{m.label}</span></button>)}
          </div>
          <span className="dfc-time is-len">{fmt(len)}</span>
        </div>
      )}
      <div className="dfilm-veil" aria-hidden="true" />
    </div>
  )
}
