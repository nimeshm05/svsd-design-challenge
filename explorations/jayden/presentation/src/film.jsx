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
const OPEN_LEN = 10.4 // s: who she is, in the dark
// the scenario clips: where each is cut, and which side it goes to when the screen splits
const CLIPS = {
  // each plays a little slowed, so it fills its moment and never has to freeze
  dad: { src: './clips/dad-arrives.mp4', until: 4.3, rate: 0.55 }, // forward, cut before it changes angle (7.8 s)
  dadClose: { src: './clips/dad-close.mp4', until: 1.5, rate: 1 }, // his face, at real speed
  home: { src: './clips/going-home.mp4', until: 7.9, rate: 0.8 }, // buckling her car seat (9.9 s)
  nurse: { src: './clips/nurse-explains.mp4', until: 7.9, rate: 0.85 }, // (9.3 s)
  mom: { src: './clips/mom-day3.mp4', until: 4.35, rate: 0.6 }, // (7.3 s)
  daily: { src: './clips/mom-daily.mp4', until: 4.6, rate: 0.75 }, // (6.1 s)
  mobile: { src: './clips/mobile.mp4', until: 7.9, rate: 0.9 }, // (8.8 s)
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
        <span className="ow ow-1">This is</span>
        <b className="ow ow-2">Mila</b>
        <span className="ow ow-3">She was born this morning at 3:42, thirteen weeks early.</span>
        <span className="ow ow-4"><em>880 grams.</em> About the weight of a small pineapple.</span>
      </div>
    </div>
  )
}

/* ---------- a scenario clip, with the product layered on it ---------- */
// Footage plays from the film's clock (so it pauses and scrubs). Its layers are children; their CSS
// animations are held and set to the clip's own time, so their delays read as seconds into the clip.
function Footage({ src, clock, at, until = 99, rate = 1, className = '', children }) {
  const host = useRef(null)
  const vid = useRef(null)
  useEffect(() => {
    const loop = () => {
      const el = host.current, v = vid.current
      if (el) {
        const local = clock.now() - at
        el.getAnimations({ subtree: true }).forEach((an) => { if (an.playState !== 'paused') an.pause(); an.currentTime = local * 1000 })
        if (v && v.readyState >= 1) {
          const vt = Math.min(Math.max(local * rate, 0), until, v.duration - 0.05)
          if (v.playbackRate !== rate) v.playbackRate = rate
          if (clock.playing() && local * rate < until) { if (v.paused) v.play().catch(() => {}); if (Math.abs(v.currentTime - vt) > 0.25) v.currentTime = vt }
          else { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - vt) > 0.04) v.currentTime = vt }
        }
      }
    }
    loop()
    const id = setInterval(loop, 30)
    return () => clearInterval(id)
  }, [clock, at, until, rate])
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

/* ---------- motion graphics ---------- */
// A big statement between scenes (an ad's title card): a small label, one line with a lit phrase, and
// sometimes a drawing under it. Or a bold day title.
function Big({ b }) {
  return (
    <div className={`big ${b.day ? 'is-day' : ''}`}>
      {b.art === 'sky' && <div className="big-art"><DaySky n={23} /></div>}
      {b.k && <span className="big-k" style={b.color ? { color: b.color } : undefined}>{b.k}</span>}
      <p className="big-t">{b.t}</p>
      {b.art === 'phone' && (
        <div className="big-phone">
          <svg viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true">
            <path className="big-phone-line" d="M10 30 C 60 30, 90 30, 140 30 S 200 22, 240 32 S 300 18, 340 36 S 400 12, 440 40 S 500 8, 540 44 S 580 14, 590 30" />
            {[10, 150, 300, 450, 590].map((x, k) => <circle key={x} cx={x} cy={30} r={k === 0 || k === 4 ? 6 : 4} className={`big-phone-dot ${k === 0 ? 'is-from' : k === 4 ? 'is-to' : ''}`} style={{ '--k': k }} />)}
          </svg>
          <span className="is-from">Care team</span><span className="is-to">Parents</span>
        </div>
      )}
      {b.sub && <span className="big-sub">{b.sub}</span>}
      {b.day && <DaySky n={b.n} />}
    </div>
  )
}
// The closing, illustrated: her days draw themselves into a constellation (her story); monitor numbers,
// waveforms and alarms crowd over it (lost in the clinical); they clear, and her sky lights up (kept and
// celebrated); then her star and her name.
const FIN_PTS = [[90, 330], [170, 280], [250, 300], [330, 230], [410, 260], [490, 190], [570, 220], [650, 160], [730, 200], [810, 140], [890, 170]]
const FIN_PLANETS = [3, 6, 9]
const FIN_WORDS = ['', 'Every baby’s life is a story.', 'In the NICU, it gets lost in charts, numbers and alarms.', 'Mila’s Sky keeps it, and celebrates every day of it.', '']
function Finale({ stage }) {
  return (
    <div className={`fin is-s${stage}`} aria-hidden="true">
      <p className="fin-words" key={stage}>{FIN_WORDS[stage]}</p>
      <svg className="fin-art" viewBox="0 0 980 420">
        {/* her story: a constellation, drawn day by day */}
        <polyline className="fin-path" points={FIN_PTS.map((p) => p.join(',')).join(' ')} />
        {FIN_PTS.map(([x, y], k) => FIN_PLANETS.includes(k)
          ? <g key={k} className="fin-planet" style={{ '--k': k }} transform={`translate(${x} ${y})`}><g transform="rotate(-18)"><ellipse rx="15" ry="4.5" /><circle r="6.5" /></g></g>
          : <path key={k} className="fin-star" style={{ '--k': k }} transform={`translate(${x} ${y})`} d="M0 -9Q1.3 -1.3 9 0Q1.3 1.3 0 9Q-1.3 1.3 -9 0Q-1.3 -1.3 0 -9Z" />)}
        {/* the clinical: waveforms, numbers and alarms that crowd over it */}
        <g className="fin-noise">
          <path className="fin-ecg" d="M0 120 H120 L135 90 L150 160 L165 60 L180 120 H340 L355 90 L370 160 L385 60 L400 120 H560 L575 90 L590 160 L605 60 L620 120 H780 L795 90 L810 160 L825 60 L840 120 H980" />
          <path className="fin-ecg is-2" d="M0 360 C40 340 60 380 100 360 S160 340 200 360 S260 380 300 360 S360 340 400 360 S460 380 500 360 S560 340 600 360 S660 380 700 360 S760 340 800 360 S860 380 900 360 S960 340 980 360" />
          {[['HR 168', 120, 60], ['SpO₂ 91%', 700, 70], ['RR 54', 860, 300], ['37.1 °C', 60, 250], ['FiO₂ 30%', 470, 395], ['08:00', 330, 40], ['IV 4 mL/h', 620, 300]].map(([t, x, y], k) => <text key={t} x={x} y={y} style={{ '--k': k }}>{t}</text>)}
          {[[260, 380], [760, 250], [520, 60]].map(([x, y], k) => (
            <g key={k} className="fin-alarm" style={{ '--k': k }} transform={`translate(${x} ${y})`}>
              <circle r="16" /><path d="M-6 4 V-2 A6 6 0 0 1 6 -2 V4 Z M-8 4 H8" /><circle className="fin-alarm-ring" r="16" />
            </g>
          ))}
        </g>
      </svg>
      <div className="fin-brand"><StarGlyph size={58} color="#FFF8E6" /><b>Mila&apos;s Sky</b><span>Her story, one day at a time.</span></div>
    </div>
  )
}

// The opening, drawn: a pregnancy as a line of forty weeks; a light travels it and stops at week 27, where
// her star is born; the thirteen weeks she skipped stay dim. Then how small she is, beside a pineapple.
function Born() {
  return (
    <div className="born" aria-hidden="true">
      <svg className="born-art" viewBox="0 0 900 200">
        <line className="born-line" x1="40" y1="110" x2="593.5" y2="110" />
        <line className="born-skip" x1="593.5" y1="110" x2="860" y2="110" />
        {Array.from({ length: 41 }, (_, w) => <line key={w} className={`born-tick ${w % 10 === 0 ? 'is-big' : ''} ${w > 27 ? 'is-skip' : ''}`} x1={40 + w * 20.5} x2={40 + w * 20.5} y1={w % 10 === 0 ? 98 : 104} y2="110" style={{ '--w': w }} />)}
        {[0, 10, 20, 30, 40].map((w) => <text key={w} className="born-wk" x={40 + w * 20.5} y="138">{w === 40 ? 'Due' : `Week ${w}`}</text>)}
        <circle className="born-dot" cx="40" cy="110" r="5" />
        <g transform="translate(593.5 110)"><g className="born-star"><circle r="26" className="born-glow" /><path d="M0 -16Q2.4 -2.4 16 0Q2.4 2.4 0 16Q-2.4 2.4 -16 0Q-2.4 -2.4 0 -16Z" /></g></g>
        <text className="born-early" x="726" y="88">13 weeks early</text>
      </svg>
      <svg className="born-pine" viewBox="0 0 120 150">
        <path className="ex-line" d="M60 46 C34 46 26 72 28 96 C30 124 44 140 60 140 C76 140 90 124 92 96 C94 72 86 46 60 46 Z" />
        <path className="ex-line" d="M34 70 L86 122 M30 96 L74 140 M48 50 L92 94 M86 70 L34 122 M90 96 L46 140 M72 50 L28 94" style={{ strokeOpacity: 0.4 }} />
        <path className="ex-line is-leaf" d="M60 46 C56 30 48 18 38 12 M60 46 C60 28 62 14 66 4 M60 46 C66 30 76 20 88 16" />
      </svg>
      <p className="born-w born-w1">Mila was born at 3:42 this morning.</p>
      <p className="born-w born-w2">Thirteen weeks before she was due.</p>
      <p className="born-w born-w3"><b>880 grams.</b> About the weight of a small pineapple.</p>
      <p className="born-w born-w4">This is her story.</p>
    </div>
  )
}
// a day title: the day, a line under it, and her sky so far (one star a day)
const DAY_PTS = Array.from({ length: 30 }, (_, k) => [40 + k * 30, 70 + Math.sin(k * 1.3) * 26 + Math.sin(k * 3.1) * 8])
function DaySky({ n }) {
  const lit = Math.min(n, DAY_PTS.length)
  return (
    <svg className="day-sky" viewBox="0 0 960 140" aria-hidden="true">
      <polyline className="day-sky-path" points={DAY_PTS.slice(0, lit).map((p) => p.join(',')).join(' ')} />
      {DAY_PTS.map(([x, y], k) => <path key={k} className={`day-sky-star ${k < lit ? 'is-lit' : ''} ${k === lit - 1 ? 'is-today' : ''}`} style={{ '--k': k }} transform={`translate(${x} ${y})`} d="M0 -6Q.9 -.9 6 0Q.9 .9 0 6Q-.9 .9 -6 0Q-.9 -.9 0 -6Z" />)}
    </svg>
  )
}

// copy an element of the screen, with its look, so it can be lifted out of the screen
function cloneStyled(src) {
  const c = src.cloneNode(false)
  if (src.nodeType === 1) {
    const cs = src.ownerDocument.defaultView.getComputedStyle(src)
    c.setAttribute('style', [...cs].map((k) => `${k}:${cs.getPropertyValue(k)}`).join(';'))
    c.removeAttribute('id')
  }
  src.childNodes.forEach((ch) => c.appendChild(cloneStyled(ch)))
  return c
}

// The nurse explaining everything at once: bubbles stack up faster than he can read them, then blur together.
const TALK = [
  ['n', 'This is her breathing tube.'],
  ['n', 'These stickers count her heartbeat and her breaths.'],
  ['n', 'The light on her foot checks the oxygen in her blood.'],
  ['d', 'Okay…'],
  ['n', 'The IV gives her fluids. This one is her feeding tube.'],
  ['n', 'If you hear that alarm, it’s usually her oxygen dipping, and we’ll…'],
  ['d', 'Sorry, what does that one do?'],
]
function Talk() {
  return (
    <div className="talk" aria-hidden="true">
      {TALK.map(([who, t], k) => <p key={k} className={`talk-b is-${who}`} style={{ '--k': k }}>{t}</p>)}
    </div>
  )
}
// between moments: a star flares, opens to fill the frame, and lets the next moment through
function Wipe() {
  return <div className="wipe" aria-hidden="true"><i className="wipe-ring" /><StarGlyph size={40} color="#FFF8E6" /></div>
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

const FILM_GUESS = 240
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

// Keeps what just left on screen a moment longer, marked "out", so a change is a crossfade instead of a cut
function useFade(value, keyOf, ms = 900) {
  const [list, setList] = useState([])
  const k = value == null ? null : keyOf(value)
  useEffect(() => {
    setList((xs) => {
      const kept = xs.filter((x) => x.k !== k).map((x) => ({ ...x, out: true })).slice(-2)
      return value == null ? kept : [...kept, { k, v: value, out: false }]
    })
    const id = setTimeout(() => setList((xs) => xs.filter((x) => !x.out)), ms)
    return () => clearTimeout(id)
  }, [k]) // eslint-disable-line react-hooks/exhaustive-deps
  return list
}

export function DemoFilm({ active, thumb }) {
  const frame = useRef(null)
  const screen = useRef(null)
  const [ready, setReady] = useState(false)
  const [run, setRun] = useState(0)
  const blank = { born: false, open: 0, foot: null, say: null, talk: false, wipe: 0, hl: null, big: null, lift: null, lit: null, fin: 0, scene: null, cap: null, cam: { fx: 0.5, fy: 0.5, s: 1 }, look: 'hero', tint: null, spot: null, call: null, ex: null, touch: null, pad: false, card: null, dim: false, close: 0, done: false }
  const [v, setV] = useState({ ...blank, t: 0 })
  const set = (patch) => setV((x) => ({ ...x, ...patch }))
  const [playing, setPlaying] = useState(true)
  const [seekTo, setSeekTo] = useState(0)
  const [len, setLen] = useState(FILM_GUESS)
  const [marks, setMarks] = useState([])
  const [drag, setDragS] = useState(null) // where the scrubber is being dragged to
  const dragRef = useRef(null)
  const setDrag = (d) => { dragRef.current = d; setDragS(d) }
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
    // a quick tap, for running through a flow fast
    const flick = async (sel) => {
      const r = at(sel, 0); if (!r) return
      const p = { x: r.x + r.w / 2, y: r.y + r.h / 2 }
      set({ touch: { ...p, s: 'press' } }); await wait(0.12)
      find(sel)?.click(); await wait(0.2); set({ touch: null })
    }
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
    const cap = (c, k = null) => set({ cap: c, capk: k })
    const day = (n) => post({ type: 'mila:day', day: n })
    // a quiet place-and-time label, top left
    const tag = (t) => set({ say: t ? { t, side: 'tag' } : null })
    // the spotlight, with a gentle push toward it
    const lit = (sel, z = 1.22) => {
      if (!sel) return set({ lit: null, cam: { fx: 0.5, fy: 0.5, s: 1 } })
      const r = at(sel, 0); if (!r) return
      set({ lit: { cx: r.x + r.w / 2, cy: r.y + r.h / 2, rx: Math.max(r.w * 0.85, 0.14), ry: Math.max(r.h * 1.1, 0.12) }, cam: { fx: 0.5 + (r.x + r.w / 2 - 0.5) * 0.6, fy: 0.5 + (r.y + r.h / 2 - 0.5) * 0.6, s: z } })
    }
    // lift a piece of the screen out of it, toward us
    const lift = (sel, dy = -30) => {
      if (!sel) return set({ lift: null })
      const el = find(sel), f = frame.current, h = host.current
      if (!el || !f || !h) return
      const fr = f.getBoundingClientRect(), hr = h.getBoundingClientRect(), k = fr.width / f.clientWidth
      const r = el.getBoundingClientRect()
      const c = cloneStyled(el)
      Object.assign(c.style, { position: 'relative', left: '0', top: '0', right: 'auto', bottom: 'auto', margin: '0', transform: 'none', width: `${r.width}px`, height: `${r.height}px`, opacity: '1', animation: 'none' })
      set({ lift: { html: c.outerHTML, x: fr.left - hr.left + r.left * k, y: fr.top - hr.top + r.top * k, w: r.width, h: r.height, k, dy } })
    }
    const big = (b) => set({ big: b })
    const dayCard = async (n, k, sub, behind) => { set({ pad: false, cap: null, say: null }); big({ day: true, n, k, t: `Day ${n}`, sub }); await wait(1.2); if (behind) await behind(); await wait(2.4); big(null); await wait(0.6) }
    const script = async () => {
      set({ ...blank }); day(null)
      await chapter('born', 0.3)

      // ── her birth, drawn
      mark('Mila'); set({ born: true }); await wait(9.2)
      set({ born: false })

      // ── Day 1 · Connection
      mark('Day 1'); await dayCard(1, '4:20 a.m.', 'Her first night in the NICU.')
      look('center', 'connection'); set({ foot: { id: 'dad', at: R.clock } })
      cap('This is her dad.'); await wait(3.4)
      cap('He hasn’t been able to hold her yet.'); await wait(4.2)
      cap(null); set({ pad: true }); await wait(1.6)
      set({ foot: null }); lit('.fd-star', 1.18); await wait(1.2)
      cap('So the first thing on her screen isn’t a number. It’s her.'); await wait(3)
      lit('.fd-size', 1.22); cap('How small she is, in something he can picture.'); await wait(3.2)
      cap('When you can’t hold your baby yet, it’s easy to feel far away. This keeps him close to her story from the very first day.', 'connection'); await wait(5)
      lit(null); cap(null); set({ pad: false }); await wait(1.2)

      // ── Day 1 · Comprehension: the nurse, all at once (slowly), then one thing at a time
      mark('Her nurse'); await chapter('story', 0.1); set({ talk: true })
      cap('A few hours later, his nurse walks him through what’s on her.'); await wait(6.4)
      cap('She tells him everything. At five in the morning, most of it doesn’t stick.', 'comprehension'); await wait(7.4)
      cap(null); set({ talk: false, pad: true }); await wait(1.6)
      cap('So her screen takes it one thing at a time.'); await tap('.fd-next'); await wait(0.8)
      lit('.fd-words', 1.15); await wait(2.4)
      await tap('.fd-next'); await wait(0.6); lit('.fd-words', 1.15); cap('In plain words he can hold on to.'); await wait(2.8)
      await tap('.fd-next'); await wait(2)
      lit(null); cap(null); await wait(0.6)

      // ── Day 3 · Comprehension, then Awareness
      mark('Day 3'); await dayCard(3, null, 'Mom is finally well enough to come up.', async () => { await show('today', 0.1); day(3) })
      look('center', 'comprehension'); set({ foot: { id: 'mom', at: R.clock } })
      cap('She’s been recovering two floors up. Three days of missing everything.'); await wait(6.8)
      set({ foot: { id: 'daily', at: R.clock } }); cap('Now it’s all right there.'); await wait(4.4)
      cap(null); set({ pad: true }); await wait(1.6)
      set({ foot: null }); lit('.cv-cap', 1.2); cap('Her day, start to finish, in plain words.'); await wait(3)
      await tap('.cv-term-btn'); await wait(0.5)
      lit('.cv-pop', 1.25); cap('And when a word doesn’t make sense, one tap explains it.'); await wait(3.8)
      lit(null); await tap('.cv-one', () => doc()?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); cap(null); await wait(0.8)
      await drag('.cv-arc-now', '.cv-arc-mark[data-kind="family"]', () => post({ type: 'mila:show', what: 'family' })); await wait(0.6)
      lit('.cv-cap', 1.22); cap('Even the moment she walked in is kept, from notes her nurses already write. Nothing extra for them.'); await wait(4.2)
      lit(null); cap('In here, the hours run together, and the next thing always comes as a surprise.', 'awareness'); await wait(4)
      await tap('.cv-ahead-btn'); await wait(1)
      lit((d) => d.querySelector('.ah-panel') ?? d.querySelector('.ah'), 1.08); cap('So she can always see what’s coming next.', 'awareness'); await wait(3.6)
      lit(null); cap(null); await wait(0.4)

      // ── Day 23 · into her stars, a week, a day
      mark('Day 23'); await dayCard(23, null, 'Three weeks in, the days start to blur together.', async () => { await show('today', 0.2); day(23) })
      set({ pad: true }); look('center', 'connection'); await wait(1.4)
      await tap(sky); cap('So every day becomes a star.'); await wait(4.4)
      await tap('.cv-gweek'); cap('Mom can open the week she was recovering,'); await wait(3.4)
      cap('and find the day that shines a little brighter.'); await wait(3)
      await tap((d) => d.querySelector('.cv-ghit[aria-label="Week 1, day 6"]') ?? d.querySelector('.cv-ghit')); cap('Day 6. The first time Dad held her, moment by moment.', 'connection'); await wait(4.4)
      cap('Her weeks become constellations. Her sky only grows.'); await wait(3.6)
      cap(null); await wait(0.6)

      // ── Day 98 · going home: the car seat, then her story one last time, then her mobile
      mark('Going home'); await dayCard(98, null, 'The day her parents have been waiting for.')
      await show('home', 0.1); set({ pad: true, tint: 'dawn' }); await wait(1)
      cap('Before they leave, her screen tells her story one last time,'); await wait(2.4)
      for (let n = 0; n < 16 && find('.cv-story'); n++) {
        if (n === 3) cap('every day of it, the hard ones too.')
        if (n === 7) cap('each one lighting up in her sky.')
        await flick('.cv-story'); await wait(0.75)
      }
      cap('And her sky becomes a mobile.'); await wait(5.2)
      await tap('.cv-takehome-btn'); cap('Theirs to take home.'); await wait(3.4)
      cap(null); set({ foot: { id: 'home', at: R.clock } }); await wait(1.2)
      set({ pad: false }); cap('Mila is going home.'); await wait(3.6)
      set({ foot: { id: 'mobile', at: R.clock } }); cap('Her sky goes with her, into the next chapter of her story.'); await wait(7.4)
      cap(null); set({ tint: null })

      // ── and if she doesn't go home
      mark('If she doesn’t'); set({ foot: null, pad: false }); await wait(1.8)
      big({ t: 'Not every baby gets to go home like Mila.', art: 'sky' }); await wait(3.8)
      big({ t: 'But a short life is still a whole story. Every day of it mattered.', art: 'sky' }); await wait(4.6)
      big(null); await show('notStart', 0.1); set({ pad: true }); await wait(1.2)
      cap('For a family whose baby doesn’t, the screen goes quiet. Just their baby’s name, and their nurse beside them.'); await wait(4.2)
      await tap((d) => [...d.querySelectorAll('.cv-actions .nav-btn')].find((b) => b.textContent.trim() === 'Her sky')); await wait(0.6)
      cap('When they’re ready, they can go through their baby’s story at their own pace.'); await wait(2.2)
      for (let n = 0; n < 10 && find('.rem-continue'); n++) {
        if (n === 3) cap('Who their baby was. Every moment they lived.')
        await flick('.rem-continue'); await wait(1)
      }
      cap('Kept for them, as a memorial. For as long as they want it.'); await wait(4.6)
      cap(null); set({ pad: false }); await wait(1.4)

      // ── closing
      mark('Closing')
      set({ fin: 1 }); await wait(5.2)
      set({ fin: 2 }); await wait(5.4)
      set({ fin: 3 }); await wait(5.6)
      set({ fin: 4 }); await wait(6.4)
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
  const feet = useFade(v.foot, (f) => f.at, 1100)
  const bigs = useFade(v.big, (b) => String(b.t) + (b.sub ?? ''), 900)
  const caps = useFade(v.cap ? { t: v.cap, k: v.capk } : null, (c) => String(c.t), 600)
  const P = v.call && PILLAR[v.call.p]
  const side = v.call && !v.call.wide && !v.call.over ? (L.ox > 0 ? 'side-l' : 'side-r') : ''
  return (
    <div ref={host} className={`dfilm ${v.lift ? 'has-lift' : ''} ${v.seeking ? 'is-seeking' : ''} ${playing ? '' : 'is-paused'} look-${v.look} ${v.tint ? `tint-${v.tint}` : ''} ${v.pad ? 'is-pad' : ''} ${side ? `has-call ${side}` : ''} ${v.call?.over ? 'has-over' : ''} ${v.close ? `is-close is-c${v.close}` : ''}`}>
      <div className="dfilm-bg" aria-hidden="true"><i className="w-connection" /><i className="w-comprehension" /><i className="w-awareness" /><i className="w-night" /><i className="w-dawn" /></div>
      <div className="dfilm-cam" style={{ transform: cam, '--s': scale }}>
        <Monitor screen={screen}>
          {!thumb && <iframe ref={frame} title="Mila's Sky bedside display, in the demo" src="./prototype/index.html?embed=1&chapter=born" onLoad={() => setTimeout(() => setReady(true), 400)} />}
          {thumb && <div className="ipad-thumb"><StarGlyph size={44} color="#F3E3B5" /><span>Demo</span></div>}
          {/* the spotlight: the screen falls a little darker around what we're looking at */}
          <div className={`dfilm-lit ${v.lit ? 'is-on' : ''}`} style={v.lit ? { '--cx': `${v.lit.cx * 100}%`, '--cy': `${v.lit.cy * 100}%`, '--rx': `${v.lit.rx * 100}%`, '--ry': `${v.lit.ry * 100}%` } : undefined} />
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
      {feet.map(({ k, v: f, out }) => (
        <div key={k} className={`foot-wrap ${out ? 'is-out' : ''}`}>
          <Footage src={CLIPS[f.id].src} until={CLIPS[f.id].until} rate={CLIPS[f.id].rate} clock={clock} at={f.at} className={`foot-${f.id}`}>
            {f.tag && <span className="open-tag foot-tag">{f.tag}</span>}
          </Footage>
        </div>
      ))}
      {v.born && <Born />}
      {v.talk && <Talk />}
      {v.fin > 0 && <Finale stage={v.fin} />}
      {bigs.map(({ k, v: b, out }) => <div key={k} className={`big-wrap ${out ? 'is-out' : ''}`}><Big b={b} /></div>)}
      {v.lift && (
        <div className="dfilm-lift" style={{ left: v.lift.x, top: v.lift.y, width: v.lift.w, height: v.lift.h, '--k': v.lift.k, '--dy': `${v.lift.dy}px` }}>
          <div className="dfilm-lift-in" dangerouslySetInnerHTML={{ __html: v.lift.html }} />
        </div>
      )}
      {v.wipe > 0 && <Wipe key={v.wipe} />}
      {v.say && <div key={v.say.t} className={`dfilm-say is-${v.say.side ?? 'r'}`}>{v.say.k && <span>{v.say.k}</span>}<b>{v.say.t}</b></div>}
      {v.card && (
        <div className="dfilm-card" key={v.card.t}>
          <span className="dfilm-card-k">{v.card.k}</span>
          <b>{v.card.t}</b>
          <i />
        </div>
      )}
      {v.scene && <div key={v.scene} className="dfilm-scene"><Scene kind={v.scene} /></div>}
      {caps.map(({ k, v: c, out }) => <p key={k} className={`dfilm-cap ${out ? 'is-out' : ''}`}>{c.k && <span className={`dfilm-capk is-${c.k}`}><Icon name={c.k} size={14} color={PILLAR[c.k].color} />{PILLAR[c.k].name}</span>}{c.t}</p>)}

      <div className="dfilm-close" aria-hidden={!v.close}>
        {/* her days, as a sky: one small star each, scattered, lighting one after another */}
        <div className="dfilm-field">{FIELD.map((f, k) => <i key={k} style={{ '--k': k, left: `${f[0]}%`, top: `${f[1]}%`, '--z': f[2], '--tw': `${f[3]}s` }} />)}</div>
        <p className="dfilm-c1">Her story, one day at a time.</p>
        <p className="dfilm-c2">Every star is <mark className="is-cream">hers to keep</mark>.</p>
        <div className="dfilm-c3"><StarGlyph size={46} color="#FFF8E6" /><span>Mila&apos;s Sky</span></div>
      </div>

      {/* play, pause and scrub: shown on hover, so a recording stays clean */}
      {!thumb && (
        <div className="dfc">
          <button type="button" className="dfc-play" onClick={() => { if (v.done) { setSeekTo(0); setRun((r) => r + 1); setPlaying(true) } else setPlaying((p) => !p) }} aria-label={v.done ? 'Replay' : playing ? 'Pause' : 'Play'}>
            {v.done ? '↺' : playing ? <svg viewBox="0 0 12 12" width="12" height="12"><rect x="2" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" /><rect x="7.4" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" /></svg> : <svg viewBox="0 0 12 12" width="12" height="12"><path d="M3 1.5 L10.5 6 L3 10.5 Z" fill="currentColor" /></svg>}
          </button>
          <span className="dfc-time">{fmt(drag ?? v.t)}</span>
          {/* drag or click anywhere on the track; the film jumps there when you let go */}
          <div className="dfc-track" role="slider" tabIndex={0} aria-label="Scrub the film" aria-valuemin={0} aria-valuemax={Math.round(len)} aria-valuenow={Math.round(v.t)}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); setDrag(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * len) }}
            onPointerMove={(e) => { if (dragRef.current == null) return; const r = e.currentTarget.getBoundingClientRect(); setDrag(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * len) }}
            onPointerUp={() => { const d = dragRef.current; if (d == null) return; setSeekTo(d); setRun((r) => r + 1); setDrag(null) }}
            onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); setSeekTo(Math.max(0, v.t + (e.key === 'ArrowRight' ? 5 : -5))); setRun((r) => r + 1) } }}>
            <i className="dfc-fill" style={{ width: `${Math.min(100, ((drag ?? v.t) / len) * 100)}%` }} />
            {marks.map((m) => <button key={m.label} type="button" className="dfc-mark" style={{ left: `${(m.t / len) * 100}%` }} title={m.label} onPointerDown={(e) => e.stopPropagation()} onClick={() => { setSeekTo(m.t); setRun((r) => r + 1) }}><span>{m.label}</span></button>)}
          </div>
          <span className="dfc-time is-len">{fmt(len)}</span>
        </div>
      )}
      <div className="dfilm-veil" aria-hidden="true" />
    </div>
  )
}

