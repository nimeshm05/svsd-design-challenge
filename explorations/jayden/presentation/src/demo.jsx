import { useEffect, useRef, useState } from 'react'
import { Icon } from './glyphs.jsx'

// The demo, told along her stay. First a storyboard of the whole stay (six sketched moments on one line,
// like a constellation), then four slides, one per stretch of time. Each of those holds a few features as
// steps (→ moves to the next): the live prototype shows that feature, and beside it, which pillar and
// principle it answers and what a parent or nurse told us. The scene from the storyboard stays in the corner.
const PILLAR = {
  connection: { name: 'Connection', principle: 'Keep parents in their baby’s story, even when apart', color: 'var(--connection)' },
  comprehension: { name: 'Comprehension', principle: 'Turn care into a story parents can follow', color: 'var(--comprehension)' },
  awareness: { name: 'Awareness', principle: 'Show what’s happening now and what’s ahead', color: 'var(--awareness)' },
}

/* ---------- Storyboard sketches, in the deck's hand-drawn line ---------- */
const S = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
const starPath = (x, y, r) => `M${x} ${y - r}Q${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y}Q${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}Q${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y}Q${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z`
const Incubator = ({ x, y }) => <>
  <path className="sk" d={`M${x} ${y} C${x} ${y - 34} ${x + 84} ${y - 34} ${x + 84} ${y} Z`} />
  <path className="sk" d={`M${x - 4} ${y} H${x + 88} M${x + 14} ${y} V${y + 30} M${x + 70} ${y} V${y + 30} M${x + 6} ${y + 30} H${x + 78}`} />
  <path className="sk is-hand" d={`M${x + 30} ${y - 6} C${x + 34} ${y - 14} ${x + 50} ${y - 14} ${x + 54} ${y - 6}`} />
</>
const Screen = ({ x, y, w = 46, h = 32, dim = false }) => <>
  <rect className="sk" x={x} y={y} width={w} height={h} rx="4" />
  <path className={`sk is-star ${dim ? 'is-dim' : ''}`} d={starPath(x + w / 2, y + h / 2, h * 0.24)} />
</>
const Person = ({ x, y, s = 1, hand = false, sit = false }) => <>
  <circle className="sk" cx={x} cy={y} r={8 * s} />
  <path className="sk" d={`M${x - 15 * s} ${y + 34 * s} C${x - 15 * s} ${y + 18 * s} ${x - 8 * s} ${y + 11 * s} ${x} ${y + 11 * s} C${x + 8 * s} ${y + 11 * s} ${x + 15 * s} ${y + 18 * s} ${x + 15 * s} ${y + 34 * s}`} />
  {sit && <path className="sk" d={`M${x - 18 * s} ${y + 34 * s} H${x + 22 * s} M${x - 14 * s} ${y + 34 * s} V${y + 52 * s} M${x + 18 * s} ${y + 34 * s} V${y + 52 * s}`} />}
  {hand && <path className="sk is-hand" d={`M${x + 12 * s} ${y + 20 * s} L${x + 32 * s} ${y + 8 * s}`} />}
</>
const SCENES = {
  arrive: <>
    <Incubator x={92} y={104} />
    <Screen x={186} y={40} />
    <Person x={46} y={62} s={1.25} />
    <path className="sk is-hand" d="M34 58 C30 40 46 32 58 40" />
  </>,
  explain: <>
    <Incubator x={92} y={104} />
    <Screen x={186} y={40} />
    <Person x={36} y={66} s={1.05} />
    <Person x={150} y={30} s={0.95} hand />
    <path className="sk is-hand" d="M144 24 L148 18 L160 18 L164 24" />
  </>,
  away: <>
    <path className="sk" d="M14 128 V84 M14 106 H170 V128 M14 114 H170" />
    <circle className="sk" cx="40" cy="92" r="9" />
    <path className="sk" d="M52 100 C80 92 120 94 150 104 L168 106" />
    <rect className="sk is-hand" x="96" y="70" width="14" height="22" rx="3" transform="rotate(-18 103 81)" />
    <path className="sk is-ray" d="M190 40 C204 34 218 36 226 46" />
    <path className="sk is-star" d={starPath(212, 26, 6)} />
  </>,
  chair: <>
    <Incubator x={110} y={104} />
    <Screen x={196} y={42} />
    <Person x={56} y={60} s={1.1} sit />
  </>,
  night: <>
    <path className="sk is-star is-dim" d="M30 22 C22 30 24 44 36 48 C26 50 16 42 18 30 C19 25 24 21 30 22 Z" />
    <Incubator x={110} y={104} />
    <Screen x={196} y={42} dim />
    <Person x={56} y={64} s={1.05} sit />
    <path className="sk is-ray" d="M66 52 C70 48 76 48 78 52" />
  </>,
  ending: <>
    <path className="sk" d="M40 120 C40 92 60 76 92 76 C124 76 144 92 144 120 Z" />
    <path className="sk" d="M62 120 V104 C62 94 70 88 80 88 M144 120 H36" />
    <path className="sk is-hand" d="M154 96 L176 82 M150 108 L178 104" />
    <path className="sk is-star" d={starPath(196, 44, 9)} />
    <path className="sk is-ray" d="M184 66 C176 74 168 76 160 76" />
  </>,
  // a parent's hand resting on the incubator, her star above
  keep: <>
    <Incubator x={78} y={108} />
    <path className="sk is-hand" d="M60 64 C76 60 96 66 112 74 L128 78 C134 79 134 86 128 86 L104 84" />
    <path className="sk is-hand" d="M22 92 C34 80 46 70 60 64" />
    <path className="sk is-star" d={starPath(184, 34, 9)} />
    <path className="sk is-ray" d="M172 50 C162 60 150 66 138 70" />
  </>,
}
export function Scene({ kind, className = '' }) {
  return (
    <svg className={`sketch scene ${className}`} viewBox="0 0 240 140" aria-hidden="true" {...S}>
      <defs><filter id={`rough-s-${kind}`}><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed={kind.length + 3} /><feDisplacementMap in="SourceGraphic" scale="2.4" /></filter></defs>
      <g filter={`url(#rough-s-${kind})`}>{SCENES[kind]}</g>
    </svg>
  )
}

/* ---------- The storyboard: her whole stay on one line ---------- */
const BOARD = [
  { kind: 'arrive', when: 'Day 1 · 4:20 a.m.', t: 'Dad meets her first star.' },
  { kind: 'explain', when: 'Day 1', t: 'Her nurse explains what’s on her.' },
  { kind: 'away', when: 'Day 2', t: 'Mom is still recovering, two floors away.' },
  { kind: 'chair', when: 'Day 23', t: 'Mom comes back after a hard night.' },
  { kind: 'night', when: 'Day 23 · 1 a.m.', t: 'She stays, in the dark, beside her.' },
  { kind: 'ending', when: 'The end of her stay', t: 'Her sky stays with them, whatever happens.' },
]
export function Storyboard() {
  return (
    <div className="board">
      <div className="rv k" style={{ '--d': 0 }}>08 · The product, along her stay</div>
      <h2 className="rv h" style={{ '--d': 1 }}>One family, from her first star to the end of her stay.</h2>
      <div className="board-line">
        <svg className="board-thread" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 C160 2 340 18 500 10 S840 2 1000 10" /></svg>
        {BOARD.map((b, k) => (
          <div key={b.kind} className="rv board-frame" style={{ '--d': 2 + k * 0.7, '--k': k }}>
            <span className="board-star" aria-hidden="true" />
            <div className="board-card"><Scene kind={b.kind} /></div>
            <span className="board-when">{b.when}</span>
            <p className="board-t">{b.t}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- One stretch of her stay, its features as steps ---------- */
export const STRETCHES = {
  day1: {
    when: 'Day 1', title: 'Her story begins', scene: 'arrive',
    features: [
      { name: 'Her first star', show: 'first', p: 'connection', why: 'Parents arrive in shock. Nothing asks anything of them: her name, how small she is in words they can feel, and who is with her.', quote: 'I didn’t have the luxury of having my baby right away and like putting him on my chest.', who: 'NICU parent' },
      { name: 'What’s on her', show: 'walk', p: 'comprehension', why: 'Her nurse walks through each thing on her, one at a time, in one plain sentence.', quote: '[Medical terminology] is a new language.' },
    ],
  },
  day23: {
    when: 'Day 23', title: 'A day she can follow', scene: 'chair',
    features: [
      { name: 'Today, as an arc', show: 'today', p: 'awareness', why: 'Her day so far, hour by hour, with the time on every screen.', quote: 'In the ICU, time just like, it doesn’t exist. It’s just a mash of time.' },
      { name: 'Terms in a tap', show: 'term', p: 'comprehension', why: 'Warm words first; the clinical word is one tap away, with her 3D model when it’s something on her.', quote: 'We tell them everything, but sometimes it’s too much, they don’t understand.', who: 'Retired NICU nurse' },
      { name: 'Moments you were there for', show: 'family', p: 'connection', why: 'Kept from what her nurse already charts, so it adds no new tasks.', quote: 'You have to be quick… life or death.', who: 'NICU nurse' },
      { name: 'What’s ahead', show: 'ahead', p: 'awareness', why: 'Tomorrow and this week at a glance, so the next moment isn’t a surprise.' },
    ],
  },
  sky: {
    when: 'Night, and looking back', title: 'Every day becomes a star', scene: 'night',
    features: [
      { name: 'Night view', show: 'night', p: 'awareness', why: 'Dim and still for her, since babies are sensitive to light: the time and one quiet line.' },
      { name: 'Today becomes a star', show: 'sky', p: 'connection', why: 'Each day’s moments gather into a star; her weeks become constellations. Milestones without points or streaks: the sky only grows.' },
    ],
  },
  end: {
    when: 'The end of her stay', title: 'Whatever happens', scene: 'ending',
    features: [
      { name: 'Going home', show: 'home', p: 'connection', why: 'Her sky becomes a mobile to take home.' },
      { name: 'If she doesn’t go home', show: 'not', p: 'connection', why: 'Her story, kept, at the family’s pace. Nothing assumes an outcome.', quote: 'Sometimes they don’t.' },
    ],
  },
}

export const Stretch = (id) => function StretchView({ active, step = 0, thumb }) {
  const st = STRETCHES[id]
  const f = st.features[Math.min(step, st.features.length - 1)]
  const frame = useRef(null)
  const [live, setLive] = useState(false) // the prototype loads the first time this slide is shown
  useEffect(() => { if (active) setLive(true) }, [active])
  useEffect(() => { if (active) frame.current?.contentWindow?.postMessage({ type: 'mila:show', what: f.show }, '*') }, [active, f.show])
  const P = PILLAR[f.p]
  return (
    <div className="stretch">
      <div className="stretch-side">
        <div className="rv k" style={{ '--d': 0 }}>{st.when}</div>
        <h2 className="rv h" style={{ '--d': 1 }}>{st.title}</h2>
        <ol className="rv stretch-list" style={{ '--d': 2 }}>
          {st.features.map((x, k) => <li key={x.name} className={k === step ? 'is-on' : k < step ? 'is-past' : ''}><i style={{ background: PILLAR[x.p].color }} />{x.name}</li>)}
        </ol>
        <div className="stretch-why" key={f.name}>
          <span className="stretch-pillar" style={{ color: P.color }}><Icon name={f.p} size={22} color={P.color} />{P.name}</span>
          <p className="stretch-principle">{P.principle}</p>
          <p className="stretch-text">{f.why}</p>
          {f.quote && <p className="stretch-quote">&ldquo;{f.quote}&rdquo;{f.who && <span>{f.who}</span>}</p>}
        </div>
      </div>
      <div className="rv stretch-stage" style={{ '--d': 1 }}>
        <div className="ipad">
          <div className="ipad-screen">
            {thumb || !live
              ? <div className="ipad-thumb"><Icon name={f.p} size={44} color={P.color} /><span>{f.name}</span></div>
              : <iframe ref={frame} title={`Mila's Sky: ${f.name}`} src={`./prototype/index.html?embed=1&chapter=${id === 'day1' ? 'born' : 'day'}`}
                  onLoad={() => setTimeout(() => frame.current?.contentWindow?.postMessage({ type: 'mila:show', what: f.show }, '*'), 300)} />}
          </div>
          <i className="ipad-cam" aria-hidden="true" />
        </div>
        <div className="stretch-scene"><Scene kind={st.scene} /></div>
      </div>
    </div>
  )
}

/* ---------- The product, one feature per slide (after COLORFUL's feature highlights) ---------- */
// A centered title with small illustrations inside it, one short paragraph, and the bedside screen below.
// The screen is one live prototype that stays in place across these slides (see DemoPad in Deck.jsx);
// each slide only asks it to show its feature, so clicking through feels like using one product.
export const FEATURES = [
  { id: 'f-first', show: 'first', k: 'Day 1', p: 'connection', title: <>Her first <Icon name="star" size={40} color="#FFF3D6" accent="#FFF3D6" /> star</>, text: 'Parents arrive in shock. The screen asks nothing of them: her name, how small she is in words they can feel, and who is with her.' },
  { id: 'f-walk', show: 'walk', k: 'Day 1', p: 'comprehension', title: <>What&apos;s on her <Icon name="nurse" size={40} color="var(--comprehension)" />, one thing at a time</>, text: 'Her nurse walks through each wire and tube on her outline, one plain sentence each.' },
  { id: 'f-today', show: 'today', k: 'Day 23', p: 'awareness', title: <>Her day, as an arc <Icon name="arc" size={44} color="var(--awareness)" accent="#FFF3D6" /></>, text: 'Every moment of her day so far, hour by hour, with the time always on screen.' },
  { id: 'f-term', show: 'term', k: 'Day 23', p: 'comprehension', title: <>Medical words <Icon name="comprehension" size={40} color="var(--comprehension)" />, explained in a tap</>, text: 'Warm words first. The clinical term is one tap away, with her 3D model when it’s something on her.' },
  { id: 'f-family', show: 'family', k: 'Day 23', p: 'connection', title: <>Moments you were there for <Icon name="parent" size={40} /></>, text: 'Kept from what her nurse already charts, so it adds no new tasks.' },
  { id: 'f-ahead', show: 'ahead', k: 'Day 23', p: 'awareness', title: <>What&apos;s ahead <Icon name="awareness" size={40} color="var(--awareness)" /></>, text: 'Tomorrow and this week at a glance, so the next moment isn’t a surprise.' },
  { id: 'f-night', show: 'night', k: 'Night', p: 'baby', title: <>Night view <Icon name="moon" size={40} color="#C9C2B3" accent="#FFF3D6" /></>, text: 'Dim and still for her, since babies are sensitive to light: just the time and one quiet line.' },
  { id: 'f-sky', show: 'sky', k: 'Looking back', p: 'connection', title: <>Every day becomes a star <Icon name="constellation" size={46} color="#F3E3B5" accent="#FFF3D6" /></>, text: 'Each day’s moments gather into a star; her weeks become constellations. The sky only grows.' },
  { id: 'f-home', show: 'home', k: 'The end of her stay', p: 'connection', title: <>Going home <Icon name="mobile" size={44} color="#F3E3B5" accent="#FFF3D6" /></>, text: 'Her sky becomes a mobile to take home.' },
  { id: 'f-not', show: 'not', k: 'The end of her stay', p: 'connection', title: <>If she doesn&apos;t go home <Icon name="connection" size={40} color="var(--connection)" /></>, text: 'Her story, kept, at the family’s pace. Nothing assumes an outcome.' },
]
const TAG = { connection: 'Connection', comprehension: 'Comprehension', awareness: 'Awareness', baby: 'For the baby' }
export const Feature = (f) => function FeatureView({ thumb }) {
  return (
    <div className="feat">
      <div className="rv feat-k" style={{ '--d': 0 }}><span>{f.k}</span><i className={`is-${f.p}`} />{TAG[f.p]}</div>
      <h2 className="rv feat-h" style={{ '--d': 1 }}>{f.title}</h2>
      {f.before ? (
        <div className="rv feat-vs" style={{ '--d': 2 }}>
          <p className="feat-before"><b>Today</b>{f.before}</p>
          <p className="feat-after"><b>With Mila&apos;s Sky</b>{f.text}</p>
        </div>
      ) : <p className="rv feat-p" style={{ '--d': 2 }}>{f.text}</p>}
      <div className="feat-pad-spot">{thumb && <div className="ipad demo-pad is-thumb"><div className="ipad-screen"><div className="ipad-thumb"><Icon name={f.p === 'baby' ? 'moon' : f.p} size={44} /></div></div></div>}</div>
    </div>
  )
}
