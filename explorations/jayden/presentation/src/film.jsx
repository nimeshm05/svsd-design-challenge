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
// what each pain point became in the design (the deck's principles), shown beside its label where it's solved
const PRINCIPLE = {
  connection: 'Keeping parents in her story',
  comprehension: 'Care as a story they can follow',
  awareness: 'What’s happening now, and what’s next',
}
const rnd = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x) }
const FIELD = Array.from({ length: 98 }, (_, k) => [rnd(k) * 100, rnd(k + 200) * 100, 0.5 + rnd(k + 400) * 1.3, 2 + rnd(k + 600) * 4])
// compositions: where the monitor sits and how it turns; the callout takes the other side
const LOOK = {
  hero: { ox: 0, ry: -16, rx: 6, sc: 0.92 },
  center: { ox: 0, ry: 0, rx: 0, sc: 1 },
  sky: { ox: 0, ry: 0, rx: 0, sc: 1 }, // her sky, the heart of it: a little closer than anything else
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
  // each lasts as long as it's on screen, its fade out included, so none ever runs out and freezes
  // (length on screen: (until - from) / rate)
  mila: { src: './clips/still-mila.webp', until: 99, rate: 1 }, // Mila, asleep in her incubator: the film opens on her
  ahead: { src: './clips/still-ahead.webp', until: 99, rate: 1 }, // Mom, worrying about everything that might come next
  explain: { src: './clips/still-explain.webp', until: 99, rate: 1 }, // her doctor and nurse, explaining everything at once
  dad: { src: './clips/still-dad.webp', until: 4.3, rate: 0.55 }, // forward, cut before it changes angle (7.8 s)
  home: { src: './clips/still-goinghome.webp', from: 1.4, until: 7.9, rate: 1 }, // buckling her car seat (6.5 s)
  mom: { src: './clips/still-mom.webp', until: 4.35, rate: 0.68 }, // (6.4 s)
  daily: { src: './clips/still-daily.webp', until: 4.6, rate: 0.78 }, // (5.9 s)
  momSky: { src: './clips/still-sky.webp', until: 7.95, rate: 0.75 }, // from behind the screen: a tap, then a pinch (10.6 s)
  mobile: { src: './clips/mobile.mp4', from: 0.4, until: 7.95, rate: 1 }, // (7.5 s)
}
// Her star view, seen from behind the glass: the clip is shot from inside the monitor, so the screen she
// touches is laid over it mirrored and faint. It follows her hand: her tap (low left in the frame, about 1 s
// into the clip) opens her stars, with a ripple under her fingertip; her pinch (upper left, from about 4 s)
// zooms in around her fingers. Driven by the film's clock, so it holds still when paused and seeks exactly.
const TAP = { x: 0.29, y: 0.84, t: 1.33 } // where and when her finger lands (frame fractions, s on the film clock)
const PINCH = { x: 0.36, y: 0.27, t0: 5.2, t1: 10.4 } // where her fingers open, and over which seconds
function Mirror({ clock, at, frame }) {
  const box = useRef(null), ring = useRef(null)
  useEffect(() => {
    const loop = () => {
      const b = box.current, r = ring.current
      if (!b || !r) return
      if (at == null) { b.style.opacity = '0'; r.style.opacity = '0'; return }
      const t = clock.now() - at
      const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
      const z = 1 + 0.55 * ease((t - PINCH.t0) / (PINCH.t1 - PINCH.t0))
      b.style.opacity = String(0.36 * ease(t / 0.9))
      b.style.transform = `scale(${z})`
      const rt = (t - TAP.t) / 0.9
      r.style.opacity = String(rt > 0 && rt < 1 ? (1 - rt) * 0.9 : 0)
      r.style.transform = `translate(-50%, -50%) scale(${0.4 + rt * 1.6})`
    }
    loop()
    const id = setInterval(loop, 30)
    return () => clearInterval(id)
  }, [clock, at])
  return (
    <div className="dfilm-mirror" aria-hidden="true">
      <div ref={box} className="dfilm-mirror-box" style={{ transformOrigin: `${PINCH.x * 100}% ${PINCH.y * 100}%` }}>
        <div className="dfilm-mirror-flip">{frame}</div>
      </div>
      <i ref={ring} className="dfilm-mirror-ring" style={{ left: `${TAP.x * 100}%`, top: `${TAP.y * 100}%` }} />
    </div>
  )
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
function Footage({ src, clock, at, from = 0, until = 99, rate = 1, className = '', children }) {
  const host = useRef(null)
  const vid = useRef(null)
  useEffect(() => {
    const loop = () => {
      const el = host.current, v = vid.current
      if (el) {
        const local = clock.now() - at
        el.getAnimations({ subtree: true }).forEach((an) => { if (an.playState !== 'paused') an.pause(); an.currentTime = local * 1000 })
        if (v && v.readyState >= 1) {
          const vt = Math.min(Math.max(from + local * rate, from), until, v.duration - 0.05)
          if (v.playbackRate !== rate) v.playbackRate = rate
          if (clock.playing() && from + local * rate < until) { if (v.paused) v.play().catch(() => {}); if (Math.abs(v.currentTime - vt) > 0.25) v.currentTime = vt }
          else { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - vt) > 0.04) v.currentTime = vt }
        }
      }
    }
    loop()
    const id = setInterval(loop, 30)
    return () => clearInterval(id)
  }, [clock, at, from, until, rate])
  return (
    <div className={`foot ${className}`} ref={host}>
      <div className="open-box foot-box">
        {/\.(webp|png|jpe?g)$/.test(src)
          ? <img className="foot-video foot-still" src={src} alt="" /> // an illustration, with a slow push in (held to the film's clock)
          : <video ref={vid} className="foot-video" src={src} muted playsInline preload="auto" />}
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
    <div className={`big ${b.day ? 'is-day' : ''} ${b.hero ? 'is-hero' : ''}`}>
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
const FIN_FIELD = Array.from({ length: 90 }, (_, k) => { const h = (n) => { const v = Math.sin(k * 127.1 + n * 311.7) * 43758.5453; return v - Math.floor(v) }; return [h(1) * 100, h(2) * 100, 0.5 + h(3) * 1.1, 2.5 + h(4) * 4] })
const FIN_WORDS = ['', 'Every baby’s life is a story.', 'In the NICU, it gets lost in charts, numbers and alarms.', 'Constellate turns it into answers, right at the bedside.', 'And keeps every day of it.', '']
// the steps as the drawing knows them: her story; lost in the clinical; cleared, with what parents get; her kept sky; the name
const FIN_CLS = ['', 'is-s1', 'is-s2', 'is-s3 is-ans', 'is-s3 is-keep', 'is-s4']
// what parents get done with it: the demo's questions, each with its answer
const FIN_ANS = [
  ['What is all of this on my baby?', 'Every device, one at a time, in plain words'],
  ['What happened while I was away?', 'Every moment nurses noted, hour by hour'],
  ['What does that word mean?', 'One tap, shown on their own baby'],
  ['What’s next, and who’s with my baby tonight?', 'The plan ahead, and tonight’s nurse'],
  ['Is my baby getting better?', 'The whole stay at a glance, firsts and all'],
]
function Finale({ stage, sky }) {
  return (
    <div className={`fin ${FIN_CLS[stage]} ${sky ? 'has-sky' : ''}`} aria-hidden="true">
      {/* "Constellate keeps it": Mila's own sky, as the product draws it */}
      {sky && (
        <div className="fin-sky">
          {/* a field of small stars and a few shooting stars behind her sky, which floats a little */}
          <div className="fin-field">{FIN_FIELD.map(([x, y, z, tw], k) => <i key={k} style={{ left: `${x}%`, top: `${y}%`, '--z': z, '--tw': `${tw}s`, '--k': k }} />)}</div>
          {[0, 1, 2].map((k) => <b key={k} className={`fin-shoot is-${k}`} />)}
          <div className="fin-float" dangerouslySetInnerHTML={{ __html: sky }} />
        </div>
      )}
      <p className="fin-words" key={stage}>{FIN_WORDS[stage]}</p>
      {stage === 3 && (
        <div className="fin-ans">
          <ul>{FIN_ANS.map(([q, a], k) => <li key={q} style={{ '--k': k }}><span className="fin-ans-tick" aria-hidden="true">✓</span><b>&ldquo;{q}&rdquo;</b><span>{a}</span></li>)}</ul>
          <p className="fin-ans-foot">From the chart nurses already keep. Nothing new for them to write.</p>
        </div>
      )}
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
      <div className="fin-brand"><StarGlyph size={58} color="#FFF8E6" /><b>Constellate</b><span>Every baby’s story, one day at a time.</span></div>
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

// the stay, down the right of the film: where each scene sits in it
const STAY = [
  ['Day 1', 'First night', ['Day 1']], ['Day 3', 'Mom catches up', ['Mom', 'What’s ahead']],
  ['Day 23', 'Looking back', ['Looking back']], ['Day 90', 'Going home', ['Going home']],
]

export function DemoFilm({ active, thumb }) {
  const frame = useRef(null)
  const mframe = useRef(null) // the mirrored copy of her screen, laid over Mom's clip
  const screen = useRef(null)
  const [ready, setReady] = useState(false)
  const [run, setRun] = useState(0)
  const blank = { born: false, open: 0, foot: null, say: null, talk: false, wipe: 0, hl: null, big: null, lift: null, lit: null, fin: 0, scene: null, cap: null, cam: { fx: 0.5, fy: 0.5, s: 1 }, look: 'hero', tint: null, spot: null, call: null, ex: null, touch: null, pad: false, card: null, dim: false, close: 0, done: false, mirror: null, ask: null, feat: null, why: null, result: null, tl: -1, altEnd: false, skyArt: null }
  const [v, setV] = useState({ ...blank, t: 0 })
  const set = (patch) => setV((x) => ({ ...x, ...patch }))
  const [playing, setPlaying] = useState(true)
  const [seekTo, setSeekTo] = useState(0)
  const [len, setLen] = useState(FILM_GUESS)
  const [marks, setMarks] = useState([])
  const wantBeat = useRef(null) // a line to replay up to (← steps back by replaying to the line before)
  const curBeat = useRef(0) // the line the film is holding on
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
    const R = { dead: false, timers: [], clock: 0, target: wantBeat.current != null ? Infinity : seekTo, playing, openAt: 0, beat: 0, release: null, queued: false }
    curBeat.current = 0
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
    // the next turn of the page's event loop, without a timer's minimum delay (replays to a line run through hundreds of these)
    const ch = new MessageChannel(), queue = []
    ch.port1.onmessage = () => queue.shift()?.()
    const soon = (f) => { queue.push(f); ch.port2.postMessage(0) }
    const wait = (sec) => new Promise((ok, no) => {
      const end = R.clock + sec
      const step = () => {
        if (R.dead) return no(new Error('stop'))
        if (R.clock < R.target) { R.clock = Math.min(end, R.target); return soon(R.clock >= end ? ok : step) } // replaying to a line: as fast as the page allows
        if (R.clock >= end - 0.001) return ok()
        R.timers.push(setTimeout(step, 16))
      }
      step()
    })
    const mark = (label) => { setMarks((m) => (m.some((x) => x.label === label) ? m : [...m, { t: R.clock, label }])); const n = STAY.findIndex((x) => x[2].includes(label)); if (n >= 0) set({ tl: n }) }
    // the presenter's pace: the film holds at every line until → (a press made mid-transition is kept for the next line)
    const gate = () => new Promise((ok, no) => {
      if (R.dead) return no(new Error('stop'))
      R.beat += 1
      const want = wantBeat.current
      if (want != null && R.beat < want) return ok() // replaying to an earlier line: pass straight through
      if (want != null && R.beat === want) { wantBeat.current = null; R.target = R.clock }
      curBeat.current = R.beat
      if (R.queued) { R.queued = false; return ok() }
      R.release = ok
    })
    R.next = () => { // at a line: go on; mid-animation: skip straight to the next line
      if (R.auto) return // a scene that plays on its own (going home) can't be skipped past by accident
      if (R.release) { const go = R.release; R.release = null; go() } else { wantBeat.current = R.beat + 1; R.target = Infinity }
    }
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
    // push through the glass: the camera moves in until her screen fills the frame
    const through = () => {
      const H = host.current, S = screen.current
      const s = H && S ? Math.max(H.clientWidth / S.clientWidth, H.clientHeight / S.clientHeight) * 1.04 : 1.8
      set({ cam: { fx: 0.5, fy: 0.5, s } })
    }
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
    // a slow drag across an element, as a parent would: the finger shown, real pointer events sent
    const swipe = async (sel, dx, dy = 0, sec = 1.6) => {
      const el = find(sel), f = frame.current; if (!el || !f) return
      const r = el.getBoundingClientRect(), W = f.clientWidth, H = f.clientHeight
      const x0 = r.left + r.width / 2 - dx / 2, y0 = r.top + r.height / 2 - dy / 2
      const ev = (type, x, y) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, isPrimary: true }))
      set({ touch: { x: x0 / W, y: y0 / H, s: 'move' } }); await wait(0.6)
      set({ touch: { x: x0 / W, y: y0 / H, s: 'press' } }); ev('pointerdown', x0, y0); await wait(0.2)
      const n = Math.round(sec / 0.05)
      for (let k = 1; k <= n; k++) {
        const t = k / n, e = t * t * (3 - 2 * t), x = x0 + dx * e, y = y0 + dy * e
        ev('pointermove', x, y); set({ touch: { x: x / W, y: y / H, s: 'drag' } }); await wait(sec / n)
      }
      ev('pointerup', x0 + dx, y0 + dy); set({ touch: { x: (x0 + dx) / W, y: (y0 + dy) / H, s: 'lift' } }); await wait(0.4); set({ touch: null })
    }
    // a moment of her stay: its title card, then its sketch (the scenario clip's place)
    const moment = async (card, kind, cap, s = 3.8) => {
      set({ pad: false, spot: null, call: null, ex: null, card }); await wait(2.4)
      set({ card: null }); await wait(0.5)
      if (kind) { set({ scene: kind, cap }); await wait(s); set({ scene: null, cap: null }) }
    }
    // a change of screen dips the monitor to dark and back, so it never jumps from one screen to the next
    const show = async (what, settle = 1.2) => { post({ type: 'mila:show', what }); await wait(settle) }
    const chapter = async (c, settle = 1.2) => { post({ type: 'mila:chapter', chapter: c }); await wait(settle) }
    const pad = async (cap) => { set({ pad: true, cap: cap ?? null }); await wait(1.2) }
    const sky = (d) => [...d.querySelectorAll('.nav-btn, button')].find((b) => /Mila.s stars/.test(b.textContent)) ?? d.querySelector('.cv-skyt')

    const say = (t, side, k) => set({ say: t ? { t, side, k } : null })
    const feat = (name, p) => set({ feat: name ? { name, p } : null }) // the feature a chapter shows
    const why = (t) => set({ why: t }) // the design decision behind it
    const res = (t, w) => set({ result: t ? { t, w } : null }) // what the parent got done, and why it works this way
    const ask = (q, p, today) => set({ ask: q ? { q, p, today } : null }) // the question parents ask, the thread back to the pillars
    const cap = (c, k = null, q = null) => set({ cap: c, capk: k, capq: q }) // q: a parent's words from our interviews, echoed where it's answered
    const day = (n) => post({ type: 'mila:day', day: n })
    const mpost = (msg) => mframe.current?.contentWindow?.postMessage(msg, '*')
    const mfind = (sel) => mframe.current?.contentDocument?.querySelector(sel)
    // a quiet place-and-time label, top left
    const tag = (t) => set({ say: t ? { t, side: 'tag' } : null })
    // the spotlight, with a gentle push toward it
    const lit = (sel, z = 1.22) => { return // spotlight off: the film shows the screens as parents see them, with no dimming in and out
      if (!sel) return set({ lit: null, cam: { fx: 0.5, fy: 0.5, s: 1 } })
      const r = at(sel, 0); if (!r) return
      const cam = { fx: 0.5, fy: 0.5, s: 1 } // the monitor holds its size and place; the spotlight does the pointing
      set({ lit: { cx: r.x + r.w / 2, cy: r.y + r.h / 2, rx: Math.max(r.w * 0.85, 0.14), ry: Math.max(r.h * 1.1, 0.12) }, cam })
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

      // Constellate, as four things parents get done, then the kept sky. Each scene: the moment and its question
      // (held), the screen doing the work (every tap shown), then the result, what they didn't have to do, with
      // our reasoning in a small line beneath it.
      const line = async (t, k = null) => { cap(t, k); await wait(0.6); await gate() } // held until →
      const scene = async ({ when, name, p, q, still, say }) => {
        cap(null); res(null); lit(null); set({ pad: false, foot: still ? { id: still, at: R.clock } : null })
        feat(name, p)
        if (say) { cap(say); await wait(0.9); await gate(); cap(null) } // the scenario, told over its picture, clear
        ask(q, p); set({ when }); await wait(0.9); await gate() // then the question it raises, over the dimmed picture
        ask(null); set({ when: null })
      }
      const result = async (t, w) => { cap(null); lit(null); res(t, w); await wait(0.8); await gate(); res(null) }

      // ── 1 · Dad, 4:20 a.m.: what is all of this?
      mark('Day 1'); look('center', 'connection')
      await wait(0.6); set({ foot: { id: 'mila', at: R.clock } }); await wait(1.4)
      await line('This is Mila. She was born thirteen weeks early, at 880 grams. She’s inspired by the families we met.')
      cap(null); set({ foot: { id: 'dad', at: R.clock } }); await wait(1)
      await line('It’s 4:20 in the morning. Her dad has just arrived at the NICU, while Mom recovers from surgery.')
      await scene({ when: 'Day 1 · 4:20 a.m.', name: 'First screen', p: 'comprehension', q: 'What is all of this on her?', still: 'explain',
        say: 'Her doctor and nurse explain everything at once: the breathing tube, the wires, the monitors.' })
      set({ pad: true, foot: null }); await wait(0.8)
      lit('.fd-star', 1); await line('At her bedside, the screen opens with who she is: her name, her time of birth, and her current weight.', 'connection')
      lit(null); await chapter('story', 0.2); feat('What’s on them', 'comprehension')
      await tap('.fd-next'); lit('.fd-words', 1); await wait(1.2); await tap('.fd-next'); lit('.fd-words', 1)
      await line('Then it walks him through each device on her, one at a time, lit on her body avatar, in one plain sentence.', 'comprehension')
      lit(null); for (let n = 0; n < 5 && find('.fd-next'); n++) { await flick('.fd-next'); await wait(0.3) }
      await result('He understands everything on her quickly, without needing to stop a nurse.', 'Parents can’t miss anything, but all at once is too much. So it’s explained, one thing at a time.')

      // ── 2 · Mom's first visit: catching up
      mark('Mom')
      await show('today', 0.1); day(3)
      await scene({ when: 'Day 3', name: 'Their day', p: 'connection', q: 'What happened while I was away?', still: 'mom',
        say: 'On the third day, Mom is finally well enough to come up. She’s missed everything so far.' })
      set({ pad: true, foot: null }); await wait(0.8)
      await drag('.cv-arc-now', '.cv-arc-mark[data-kind="family"]', () => post({ type: 'mila:show', what: 'family' })); await wait(0.3)
      lit('.cv-cap', 1); await line('She slides back through Mila’s day, hour by hour, and finds every moment her nurses noted.', 'connection')
      lit(null); await drag('.cv-arc-mark[data-kind="family"]', '.cv-arc-now', () => post({ type: 'mila:show', what: 'today' }))
      feat('Words in a tap', 'comprehension')
      doc()?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await wait(0.3) // no popover open yet
      await line('One word on her screen she’s never heard before: CPAP.', 'comprehension')
      await tap('.cv-term-btn'); await wait(0.5) // she taps the word, and only then does it open
      await line('She taps it, and sees what it means, on Mila’s own body.', 'comprehension')
      await tap('.cv-one', () => doc()?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))
      await result('Mom can catch up on everything she missed before rounds, without having to ask anyone.', 'It all comes from notes nurses already write, so there are no new tasks for them either.')

      // ── 3 · That night: who's with her, and what's next
      mark('What’s ahead')
      await scene({ when: 'Day 3', name: 'What’s ahead', p: 'awareness', q: 'What’s next, and who is caring for her tonight?', still: 'ahead',
        say: 'Before she leaves for the night, the worries turn to what comes next.' })
      set({ pad: true, foot: null }); await wait(0.4)
      await tap('.nav-btn.is-call'); await wait(0.5)
      lit('.ts', 1); await line('First, who’s with Mila tonight: Marcus, her night nurse, with a way to reach him.')
      lit(null); doc()?.querySelector('.ts-scrim')?.click(); await wait(0.6)
      await tap('.cv-ahead-btn'); await wait(0.8)
      lit((d) => d.querySelector('.ah'), 1); await line('Then the week ahead: rounds tomorrow at 10, and what’s planned for her care.', 'awareness')
      await tap((d) => [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Next Steps')); await wait(0.6)
      await line('And Next Steps: what each part of her care is working toward.', 'awareness')
      await result('Mom knows who’s caring for Mila tonight, and plans to join rounds tomorrow at 10 a.m.', 'We show what’s planned, never predictions: no medical claims, just what’s coming and who’s there.')

      // ── 4 · Day 23: looking back at the week she missed
      mark('Looking back')
      await show('morning', 0.2); day(23)
      await scene({ when: 'Day 23 · three weeks in', name: 'Their stars', p: 'connection', q: 'What did I miss that first week?', still: 'daily',
        say: 'Three weeks in, on a quiet morning at the bedside, Mom wonders about the first week she missed.' })
      set({ pad: true, foot: null }); await wait(0.6)
      await line('It’s 9:40 in the morning. Mila is wearing the sleepsuit Mom brought from home.', 'connection')
      await tap(sky); await line('Each day of Mila’s stay is a star. Today’s joins the rest.')
      for (let n = 0; n < 40 && !find('.cv-gweek'); n++) await wait(0.25) // until her sky has opened
      await wait(1.2) // let it settle before looking around
      const wk1 = (d) => [...d.querySelectorAll('.cv-gweek')].find((b) => /^Week 1\b/.test(b.textContent))
      await tap(wk1); await wait(0.4)
      await line('She opens the first week, the one she spent recovering upstairs.')
      const six = (d) => d.querySelector('.cv-gday[aria-label^="Day 6"]') ?? d.querySelector('.cv-ghit[aria-label="Week 1, day 6"]')
      await tap(six); await wait(0.4)
      lit((d) => d.querySelector('.cv-gpanel'), 1); await line('And there it is: the day Dad first held her, recorded as it happened.', 'connection')
      await result('She sees the week she missed, moment by moment, and the first time her baby was held.', 'Progress without charts or percentiles. Firsts are planets, worth celebrating.')

      // ── 5 · Day 90: going home (plays through on its own, paced to its captions)
      mark('Going home'); R.auto = R.clock >= R.target // presses wait until it has played (not while ← replays to a line)
      feat('Going home', 'connection'); set({ pad: false, tint: 'dawn', foot: { id: 'home', at: R.clock } })
      cap('Three months later, it’s finally time. Mila is going home.'); await wait(3.8)
      // her story plays on its own, a little quicker than at the bedside, so no card is skipped or flashed past
      if (frame.current?.contentWindow) frame.current.contentWindow.__storyPace = 0.45
      await show('home', 0.2); cap(null); set({ pad: true, foot: null }); await wait(0.8)
      cap('Before they leave, her screen tells her whole stay one last time, star by star.')
      for (let n = 0; n < 160 && find('.cv-discharge.is-intro'); n++) await wait(0.25) // until the story is told
      cap('Then her stars lift off her sky, and gather into a mobile: a tangible model of her whole stay.')
      for (let n = 0; n < 60 && !find('.cv-discharge.is-mobile'); n++) await wait(0.25) // the stars fly onto its strands
      await wait(1.6)
      cap('Theirs to take home.'); await tap('.cv-takehome-btn'); await wait(1.6)
      cap(null); set({ foot: { id: 'mobile', at: R.clock } }); await wait(1.4) // the real one, over her crib, dissolving in
      cap('Now it hangs over her crib at home.'); await wait(4.5)
      R.auto = false; await gate()
      cap(null); feat(null); set({ tint: null, foot: null })
      if (frame.current?.contentWindow) frame.current.contentWindow.__storyPace = 1

      // ── If she doesn't go home
      mark('If she doesn’t'); set({ altEnd: true })
      await show('notStart', 0.1)
      cap(null); res(null); feat(null); set({ pad: false, foot: null })
      big({ t: 'But not every baby gets to go home like Mila.', art: 'sky' }); cap('Some families leave the NICU without their baby.'); await wait(1.2); await gate()
      big({ t: 'Even a short life is a whole story. Every day of it matters.', art: 'sky' }); cap('So Constellate never assumes how a stay will end.'); await wait(1.2); await gate()
      big(null); cap(null); await wait(0.6)
      feat('A kept sky', 'connection'); set({ pad: true }); await wait(1)
      cap('When the family is ready, they can keep the baby’s sky: who they were, and every day they had together.')
      const herSky = (d) => [...d.querySelectorAll('.cv-actions .nav-btn')].find((b) => b.textContent.trim() === 'Her sky')
      await tap(herSky, () => { herSky(doc())?.click() })
      for (let n = 0; n < 6 && find('.rem-continue'); n++) { await flick('.rem-continue'); await wait(0.8) }
      await wait(0.4); await gate()
      await result('Who she was, and every moment they had, kept for as long as they want.', 'Nothing assumes an outcome. It opens only when the family chooses. It celebrates her life as a person, not a patient.')
      feat(null); set({ pad: false }); await wait(1)

      // ── closing
      mark('Closing')
      { // her kept sky, just as the screen drew it, for "Constellate keeps it"
        const far = doc()?.querySelector('.cv-depth-layer.is-far svg'), kept = doc()?.querySelector('.rem-sky')
        if (kept) set({ skyArt: (far ? far.outerHTML.replace('<svg', '<svg class="fin-sky-far" preserveAspectRatio="xMidYMid slice"') : '') + kept.outerHTML })
      }
      set({ fin: 1 }); cap('Every baby’s stay is a story, and parents need to be able to follow it.'); await wait(1.4); await gate()
      set({ fin: 2 }); cap('But in the NICU, it’s scattered across charts, numbers, alarms and shift changes, and parents piece it together on their own.'); await wait(1.4); await gate()
      set({ fin: 3 }); cap('Constellate turns the chart nurses already keep into answers to the questions parents ask most, with nothing new for nurses to write.'); await wait(1.4); await gate()
      set({ fin: 4 }); cap('And it keeps every day of it, one star at a time, however the stay ends.'); await wait(1.4); await gate()
      set({ fin: 5 }); cap('Constellate: so parents can understand their baby’s care, stay close to it, and know what’s next. Thank you.'); await wait(1.4); await gate()
      setLen(R.clock); set({ done: true })
    }
    script().catch((e) => { if (e?.message !== 'stop') console.error('film script stopped:', e) })
    return () => { R.dead = true; R.timers.forEach(clearTimeout); clearInterval(ticker); ch.port1.close() }
  }, [active, ready, run, thumb, seekTo]) // eslint-disable-line react-hooks/exhaustive-deps

  // the camera: the composition's place and turn, then the push in toward the feature
  const sw = screen.current?.clientWidth ?? 1000, sh = screen.current?.clientHeight ?? 640
  const L = LOOK[v.look]
  const { fx, fy, s } = v.cam
  const zoomed = s > 1.01
  const scale = zoomed ? s : L.sc
  const ry = zoomed ? L.ry * 0.35 : L.ry, rx = zoomed ? 0 : L.rx
  const raise = zoomed ? -0.04 * window.innerHeight : 0 // pushed in, the screen sits a little higher, clear of the captions
  const cam = `translate(${(0.5 - fx) * sw * scale + L.ox * window.innerWidth}px, ${(0.5 - fy) * sh * scale + raise}px) scale(${scale}) rotateY(${ry}deg) rotateX(${rx}deg)`
  const feet = useFade(v.foot, (f) => f.at, 1100)
  const bigs = useFade(v.big, (b) => String(b.t) + (b.sub ?? ''), 900)
  const asks = useFade(v.ask, (a) => a.q, 800)
  const feats = useFade(v.feat, (x) => x.name, 700)
  const whys = useFade(v.why, (t) => t, 600)
  const results = useFade(v.result, (r) => r.t, 600)
  const caps = useFade(v.cap ? { t: v.cap, k: v.capk, q: v.capq } : null, (c) => String(c.t), 600)
  const P = v.call && PILLAR[v.call.p]
  const side = v.call && !v.call.wide && !v.call.over ? (L.ox > 0 ? 'side-l' : 'side-r') : ''
  // where the scrubber sits: while a seek replays the script up to its target, it waits at the target
  const scrubT = drag ?? Math.max(v.t, seekTo)
  // → the next line, ← the line before (a quick replay); past either end, the deck's slides again
  const doneRef = useRef(false); doneRef.current = v.done
  useEffect(() => {
    if (!active || thumb) return
    window.__filmNav = (dir) => {
      const R = Rref.current
      if (dir > 0) { if (doneRef.current || !R) return false; R.next(); return true }
      const back = (wantBeat.current ?? curBeat.current) - 1
      if (back < 1) return false
      wantBeat.current = back; setSeekTo(0); setRun((r) => r + 1); setPlaying(true)
      return true
    }
    return () => { delete window.__filmNav }
  }, [active, thumb])
  return (
    <div ref={host} className={`dfilm ${v.ask ? 'has-ask' : ''} ${v.result ? 'has-result' : ''} ${v.lift ? 'has-lift' : ''} ${v.seeking ? 'is-seeking' : ''} ${playing ? '' : 'is-paused'} look-${v.look} ${v.tint ? `tint-${v.tint}` : ''} ${v.pad ? 'is-pad' : ''} ${side ? `has-call ${side}` : ''} ${v.call?.over ? 'has-over' : ''} ${v.close ? `is-close is-c${v.close}` : ''}`}>
      <div className="dfilm-bg" aria-hidden="true"><i className="w-connection" /><i className="w-comprehension" /><i className="w-awareness" /><i className="w-night" /><i className="w-dawn" /></div>
      <div className="dfilm-cam" style={{ transform: cam, '--s': scale }}>
        <Monitor screen={screen}>
          {!thumb && <iframe ref={frame} title="Constellate bedside display, in the demo" src="./prototype/index.html?embed=1&chapter=born" onLoad={() => setTimeout(() => setReady(true), 400)} />}
          {thumb && <div className="ipad-thumb"><StarGlyph size={44} color="#F3E3B5" /><span>Demo</span></div>}
          {/* the spotlight: the screen falls a little darker around what we're looking at */}
          <div className={`dfilm-blink ${v.blink ? 'is-on' : ''}`} aria-hidden="true" />
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
          <Footage src={CLIPS[f.id].src} from={CLIPS[f.id].from} until={CLIPS[f.id].until} rate={CLIPS[f.id].rate} clock={clock} at={f.at} className={`foot-${f.id}`}>
            {f.tag && <span className="open-tag foot-tag">{f.tag}</span>}
          </Footage>
        </div>
      ))}
      {!thumb && <Mirror clock={clock} at={v.mirror ?? null} frame={<iframe ref={mframe} title="" tabIndex={-1} src="./prototype/index.html?embed=1&chapter=day" />} />}
      {v.born && <Born />}
      {v.talk && <Talk />}
      {v.fin > 0 && <Finale stage={v.fin} sky={v.skyArt} />}
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
      {feats.map(({ k, v: x, out }) => <p key={k} className={`dfilm-feat is-${x.p} ${out ? 'is-out' : ''}`}><span>Feature</span><b><StarGlyph size={16} color={PILLAR[x.p].color} />{x.name}</b></p>)}
      {v.tl >= 0 && !v.fin && !v.altEnd && (
        <ol className="dfilm-tl" aria-label="Her stay">
          {STAY.map(([day, what], k) => (
            <li key={what} className={`${k === v.tl ? 'is-on' : k < v.tl ? 'is-past' : ''} `}>
              <i aria-hidden="true" /><b>{day}</b><span>{what}</span>
            </li>
          ))}
        </ol>
      )}
      {results.map(({ k, v: r, out }) => (
        <div key={k} className={`dfilm-result ${out ? 'is-out' : ''}`}>
          <p className="dfilm-result-t"><span aria-hidden="true">✓</span>{r.t}</p>
          {r.w && <p className="dfilm-result-w"><b>Why it works this way</b>{r.w}</p>}
        </div>
      ))}
      {whys.map(({ k, v: t, out }) => <p key={k} className={`dfilm-why ${out ? 'is-out' : ''}`}><span>Why we built it this way</span>{t}</p>)}
      {asks.map(({ k, v: a, out }) => <p key={k} className={`dfilm-ask is-${a.p} ${out ? 'is-out' : ''}`}><span><Icon name={a.p} size={14} color={PILLAR[a.p].color} />{PILLAR[a.p].name}</span>&ldquo;{a.q}&rdquo;</p>)}
      {v.when && v.ask && <p key={v.when} className="dfilm-when">{v.when}</p>}
      {caps.map(({ k, v: c, out }) => <p key={k} className={`dfilm-cap ${out ? 'is-out' : ''}`}>{c.q && <span className="dfilm-capq"><q>{c.q}</q><span>A NICU parent we interviewed</span></span>}{c.k && <span className={`dfilm-capk is-${c.k}`}><Icon name={c.k} size={14} color={PILLAR[c.k].color} />{PILLAR[c.k].name}<em>{PRINCIPLE[c.k]}</em></span>}{c.t}</p>)}

      <div className="dfilm-close" aria-hidden={!v.close}>
        {/* her days, as a sky: one small star each, scattered, lighting one after another */}
        <div className="dfilm-field">{FIELD.map((f, k) => <i key={k} style={{ '--k': k, left: `${f[0]}%`, top: `${f[1]}%`, '--z': f[2], '--tw': `${f[3]}s` }} />)}</div>
        <p className="dfilm-c1">Every baby’s story, one day at a time.</p>
        <p className="dfilm-c2">Every star is <mark className="is-cream">hers to keep</mark>.</p>
        <div className="dfilm-c3"><StarGlyph size={46} color="#FFF8E6" /><span>Constellate</span></div>
      </div>

      {/* play, pause and scrub: shown on hover, so a recording stays clean */}
      {!thumb && (
        <div className="dfc">
          <button type="button" className="dfc-play" onClick={() => { if (v.done) { setSeekTo(0); setRun((r) => r + 1); setPlaying(true) } else setPlaying((p) => !p) }} aria-label={v.done ? 'Replay' : playing ? 'Pause' : 'Play'}>
            {v.done ? '↺' : playing ? <svg viewBox="0 0 12 12" width="12" height="12"><rect x="2" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" /><rect x="7.4" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" /></svg> : <svg viewBox="0 0 12 12" width="12" height="12"><path d="M3 1.5 L10.5 6 L3 10.5 Z" fill="currentColor" /></svg>}
          </button>
          <span className="dfc-time">{fmt(scrubT)}</span>
          {/* drag or click anywhere on the track; the film jumps there when you let go */}
          <div className="dfc-track" role="slider" tabIndex={0} aria-label="Scrub the film" aria-valuemin={0} aria-valuemax={Math.round(len)} aria-valuenow={Math.round(scrubT)}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); setDrag(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * len) }}
            onPointerMove={(e) => { if (dragRef.current == null) return; const r = e.currentTarget.getBoundingClientRect(); setDrag(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * len) }}
            onPointerUp={() => { const d = dragRef.current; if (d == null) return; setSeekTo(d); setRun((r) => r + 1); setDrag(null) }}
            onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); setSeekTo(Math.max(0, scrubT + (e.key === 'ArrowRight' ? 5 : -5))); setRun((r) => r + 1) } }}>
            <i className="dfc-fill" style={{ width: `${Math.min(100, (scrubT / len) * 100)}%` }} />
            {marks.map((m) => <button key={m.label} type="button" className="dfc-mark" style={{ left: `${(m.t / len) * 100}%` }} title={m.label} onPointerDown={(e) => e.stopPropagation()} onClick={() => { setSeekTo(m.t); setRun((r) => r + 1) }}><span>{m.label}</span></button>)}
          </div>
          <span className="dfc-time is-len">{fmt(len)}</span>
        </div>
      )}
      <div className="dfilm-veil" aria-hidden="true" />
    </div>
  )
}

