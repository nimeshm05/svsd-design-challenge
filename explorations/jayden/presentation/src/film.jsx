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
  splitR: { ox: 0.235, ry: -6, rx: 1, sc: 0.6 }, // split screen: footage on the left, the screen on the right
  splitL: { ox: -0.235, ry: 6, rx: 1, sc: 0.6 }, // split screen: the screen on the left, footage on the right
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
const OPEN_LEN = 5.4 // s: her birth, in the dark
// the scenario clips: where each is cut, and which side it goes to when the screen splits
const CLIPS = {
  dad: { src: './clips/dad-arrives.mp4', until: 4.3, len: 6.4 }, // forward, cut before it changes angle
  nurse: { src: './clips/nurse-explains.mp4', until: 7.9, len: 8.6 },
  mom: { src: './clips/mom-day3.mp4', until: 4.35, len: 6 },
}
function Opening({ clock }) {
  const host = useRef(null)
  useEffect(() => {
    const loop = () => {
      const el = host.current
      if (el) { const local = clock.local(); el.getAnimations({ subtree: true }).forEach((an) => { if (an.playState !== 'paused') an.pause(); an.currentTime = local * 1000 }) }
    }
    loop()
    const id = setInterval(loop, 30)
    return () => clearInterval(id)
  }, [clock])
  return (
    <div className="open is-birth" ref={host}>
      <span className="open-star" aria-hidden="true"><i className="open-star-glow" /><StarGlyph size={64} color="#FFF8E6" /></span>
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
function Footage({ src, clock, at, until = 99, className = '', children }) {
  const host = useRef(null)
  const vid = useRef(null)
  useEffect(() => {
    const loop = () => {
      const el = host.current, v = vid.current
      if (el) {
        const local = clock.now() - at
        el.getAnimations({ subtree: true }).forEach((an) => { if (an.playState !== 'paused') an.pause(); an.currentTime = local * 1000 })
        if (v && v.readyState >= 1) {
          const vt = Math.min(Math.max(local, 0), until, v.duration - 0.05)
          if (clock.playing() && local < until) { if (v.paused) v.play().catch(() => {}); if (Math.abs(v.currentTime - vt) > 0.25) v.currentTime = vt }
          else { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - vt) > 0.04) v.currentTime = vt }
        }
      }
    }
    loop()
    const id = setInterval(loop, 30)
    return () => clearInterval(id)
  }, [clock, at, until])
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
  const blank = { open: 0, foot: null, say: null, scene: null, cap: null, cam: { fx: 0.5, fy: 0.5, s: 1 }, look: 'hero', tint: null, spot: null, call: null, ex: null, touch: null, pad: false, card: null, dim: false, close: 0, done: false }
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

    const say = (t, side, k) => set({ say: t ? { t, side, k } : null })
    const cap = (c) => set({ cap: c })
    const day = (n) => post({ type: 'mila:day', day: n })
    const script = async () => {
      set({ ...blank }); day(null)
      await chapter('born', 0.3)

      // 1 · her birth, in the dark
      mark('Born'); R.openAt = R.clock; set({ open: 1 }); await wait(OPEN_LEN - 0.4)

      // 2 · Dad arrives; the frame splits, and her first star is waiting on the screen beside him
      mark('Day 1'); look('splitR', 'connection'); set({ open: 0, foot: { id: 'dad', at: R.clock, tag: 'Day 1 · 4:20 a.m.' } })
      cap('Her dad meets her for the first time.'); await wait(1.7)
      set({ pad: true }); await wait(1.2)
      say('Her first star.', 'tr'); await wait(2.6)
      cap('It asks nothing of him. Just her name, and how small she is.'); await wait(2.6)
      say(null); cap(null)

      // 3 · her nurse explains; the screen swaps sides, the walkthrough runs beside her
      mark('What’s on her'); await chapter('story', 0.1)
      look('splitL', 'comprehension'); set({ foot: { id: 'nurse', at: R.clock, tag: 'Day 1 · 5:10 a.m.' } })
      cap('Her nurse explains what’s on her,'); await wait(1.6)
      await tap('.fd-next'); await wait(0.6)
      cap('one thing at a time, in plain words.'); say('What’s on her.', 'tl'); await wait(1.6)
      await tap('.fd-next'); await wait(1.4)
      await tap('.fd-next'); await wait(1.2)
      say(null); cap(null)

      // 4 · Day 3: Mom comes in (the clip), the frame splits with her day on the screen, then we push in
      mark('Day 3'); await show('today', 0.1); day(3)
      set({ pad: false }); look('splitR', 'comprehension'); set({ foot: { id: 'mom', at: R.clock, tag: 'Day 3' } })
      cap('Three days later, Mom is well enough to come see her.'); await wait(1.9)
      set({ pad: true }); await wait(1.1)
      say('Her day, in plain words.', 'tr'); cap('Everything she missed, in words she can follow.'); await wait(3.2)
      say(null); set({ foot: null }); look('left'); zoom('.cv-one', 1.5); cap(null); await wait(1.4)
      await tap('.cv-term-btn'); await wait(0.4)
      look('center'); zoom('.cv-pop', 1.9); say(null); cap('Medical words, explained in a tap.'); await wait(3.4)
      await tap('.cv-one', () => doc()?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); await wait(0.3)
      look('right', 'connection'); zoom('.cv-arc', 1.25); cap(null); await wait(1)
      await drag('.cv-arc-now', '.cv-arc-mark[data-kind="family"]', () => post({ type: 'mila:show', what: 'family' })); await wait(0.3)
      say('Moments she was there for.', 'l'); cap('Kept from what her nurse already writes down.'); await wait(3)
      out(); say(null); look('left', 'awareness'); await wait(0.8)
      await tap('.cv-ahead-btn'); cap('And what comes next, so nothing is a surprise.'); say('What’s ahead.', 'r'); await wait(3.4)
      say(null); cap(null)

      // 5 · Day 23: every day becomes a star
      mark('Day 23'); await show('today', 0.2); day(23); look('center', 'connection'); await wait(0.6)
      say('Day 23', 'top'); await wait(1.2)
      await tap(sky); say(null); await wait(0.4)
      cap('Every day, her moments gather into a star.'); await wait(5.4)
      cap('Her weeks become constellations. Her sky only grows.'); await wait(4)
      cap(null)

      // 6 · going home
      mark('Going home'); look('center', 'dawn'); await show('home', 0.2)
      say('Day 98', 'top'); cap('And on the day she goes home, her sky goes with her.'); await wait(5)
      say(null); cap(null)

      // 7 · and if she doesn't: the screen goes quiet; nothing is labelled or tapped
      mark('Whatever happens'); set({ pad: false, tint: null }); await wait(1.6)
      cap('Not every story ends at home.'); await wait(3)
      await show('not', 0.1); look('center', null); set({ pad: true }); await wait(1.6)
      cap('But every day was hers.'); await wait(4)
      cap(null)

      // closing
      mark('Closing')
      set({ pad: false, cap: null, tint: null }); await wait(1.2)
      set({ close: 1 }); await wait(3.2)
      set({ close: 2 }); await wait(3.6)
      set({ close: 3 }); await wait(4.6)
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
      {v.foot && (
        <Footage src={CLIPS[v.foot.id].src} until={CLIPS[v.foot.id].until} clock={clock} at={v.foot.at} className={`foot-${v.foot.id}`}>
          {v.foot.tag && <span className="open-tag foot-tag">{v.foot.tag}</span>}
        </Footage>
      )}
      {v.say && <div key={v.say.t} className={`dfilm-say is-${v.say.side ?? 'r'}`}>{v.say.k && <span>{v.say.k}</span>}<b>{v.say.t}</b></div>}
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
