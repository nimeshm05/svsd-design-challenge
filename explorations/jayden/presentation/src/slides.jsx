import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Icon, StarGlyph } from './glyphs.jsx'
import { FEATURES, Feature, Storyboard } from './demo.jsx'

// The case study as one story. Its spine: NICU parents live two things at once (the fight and the
// celebration), and Mila's Sky is a place that holds both. Each chapter opens on a realization, said
// big, with its key phrase lit; the slides after it are the evidence or what we did about it. The three
// pillars keep their colors from the moment they appear to the last product screen.
// Each slide: id, section (top right), tint (which pillar colors the sky), planet (a chapter's opening:
// a planet in the constellation along the bottom), steps (builds inside the slide), and its View.
// Everything with className "rv" rises in when it arrives, in the order of its --d.
const R = ({ d = 0, as: T = 'div', className = '', children, ...p }) => <T className={`rv ${className}`} style={{ '--d': d }} {...p}>{children}</T>

const PILLARS = {
  connection: { name: 'Connection', color: 'var(--connection)' },
  comprehension: { name: 'Comprehension', color: 'var(--comprehension)' },
  awareness: { name: 'Awareness', color: 'var(--awareness)' },
}
// a lit phrase: cream by default, or a pillar's color
const L = ({ p, children }) => <mark className={p ? `is-${p}` : 'is-cream'}>{children}</mark>
const Planet = ({ size = 28, body = '#EFDCAA', ring = '#FFB38A' }) => (
  <svg className="glyph" viewBox="-16 -16 32 32" width={size} height={size} aria-hidden="true">
    <g transform="rotate(-18)">
      <ellipse rx="14" ry="4.2" fill="none" stroke={ring} strokeWidth="1.3" />
      <circle r="6.5" fill={body} />
    </g>
  </svg>
)

// Real work, as it was: a screenshot in a soft frame, drifting slowly so it reads as a wall to look across
function Shot({ src, alt, pan = true, className = '' }) {
  return (
    <figure className={`shot ${pan ? 'is-pan' : ''} ${className}`}>
      <img src={src} alt={alt} />
    </figure>
  )
}

// A realization, said big: a small eyebrow, one sentence, one lit phrase.
function Statement({ k, children, sub, big = false }) {
  return (
    <div className="center statement">
      {k && <R d={0} className="k">{k}</R>}
      <R d={1} as="p" className={`statement-p ${big ? 'is-big' : ''}`}>{children}</R>
      {sub && <R d={4} as="p" className="statement-sub">{sub}</R>}
    </div>
  )
}
const statement = (props) => function StatementView() { return <Statement {...props} /> }

/* ---------- Opening ---------- */
function Title() {
  return (
    <div className="center title">
      <R d={0} className="title-k">A NICU storytelling case study</R>
      <R d={1} as="h1" className="title-h">Mila&apos;s Sky</R>
      <R d={2} as="p" className="title-sub">Turning a premature baby&apos;s care into a story her parents can follow.</R>
      <R d={4} className="title-team">Jayden · Nimesh · Sara</R>
    </div>
  )
}

const HOOK = 'Waking up every day and watching your child fight for their life… It’s this really terrible thing, but if you think about it, you are also celebrating.'
function Hook() {
  const words = HOOK.split(' ')
  return (
    <div className="center hook">
      <blockquote className="hook-q">
        {words.map((w, k) => <span key={k} className="word" style={{ '--d': k }}>{k === 0 ? `“${w}` : k === words.length - 1 ? `${w}”` : w} </span>)}
      </blockquote>
      <R d={18} className="hook-who">NICU parent</R>
    </div>
  )
}

/* ---------- The NICU ---------- */
// what our secondary research said about the room itself (8 papers and standards; see README)
const SENSES = [
  { k: 'Sound', t: 'Noise is linked to heart rate changes, apnea, lower oxygen and sleep disturbance. Monitor alarms are often the loudest sound in the room.' },
  { k: 'Light', t: 'Cycling light between day and night is linked to better weight gain and shorter stays than constant light.' },
  { k: 'Touch', t: 'Too little touch and voice. Holding, and especially skin-to-skin, are linked to better development.' },
  { k: 'Space', t: 'The incubator isn’t a protective bubble: the room’s materials and shape change what the baby hears.' },
]
function Environment() {
  return (
    <div className="env">
      <R d={0} className="k">Inside the NICU</R>
      <R d={1} as="h2" className="h">Loud, bright, and never still, for the smallest people in the hospital.</R>
      <div className="env-grid">
        {SENSES.map((x, k) => (
          <R key={x.k} d={2 + k * 0.6} className="env-card"><span className="env-k">{x.k}</span><p>{x.t}</p></R>
        ))}
      </div>
      <R d={5} className="env-src">From our secondary research: 8 studies and standards on NICU noise, light, sensory care, nurses&apos; alarms and room design.</R>
    </div>
  )
}

function Wall() {
  return (
    <div className="wall">
      <R d={0} className="k">Secondary research</R>
      <R d={1} as="h2" className="h wall-h">The NICU environment <L>shapes how babies develop</L>, how nurses work, and how parents cope.</R>
      <R d={2}><Shot src="./shots/research-wall.webp" alt="Our secondary research board: eight papers and standards on hospital exposures, noise and light, nurses' alarm challenges, incubator acoustics, sensory stimulation, NICU sound levels, NICU design standards and single-family rooms, each summarized in a table with sticky notes." /></R>
    </div>
  )
}

/* ---------- 01 · Research ---------- */
function Asked() {
  return (
    <div className="center asked">
      <R d={0} as="p" className="asked-lead">So we asked them.</R>
      <R d={1} className="asked-n">4</R>
      <R d={2} className="asked-nk">interviews</R>
      <R d={3} className="asked-who">
        <span><Icon name="parent" size={40} /><Icon name="parent" size={40} />2 parents</span>
        <span><Icon name="nurse" size={40} color="var(--comprehension)" /><Icon name="nurse" size={40} color="var(--comprehension)" />2 nurses</span>
      </R>
    </div>
  )
}

function Heard() {
  return (
    <div className="center finding">
      <R d={0} className="k">What we found</R>
      <R d={1} as="p" className="statement-p is-big"><L>What&apos;s said</L> isn&apos;t <L>what&apos;s heard</L>.</R>
      <R d={2} className="phone" aria-hidden="true">
        <svg viewBox="0 0 600 60" preserveAspectRatio="none">
          <path className="phone-line" d="M10 30 C 60 30, 90 30, 140 30 S 200 22, 240 32 S 300 18, 340 36 S 400 12, 440 40 S 500 8, 540 44 S 580 14, 590 30" />
          {[10, 150, 300, 450, 590].map((x, k) => <circle key={x} cx={x} cy={30} r={k === 0 ? 5 : 4} className={`phone-dot ${k === 0 ? 'is-from' : k === 4 ? 'is-to' : ''}`} />)}
        </svg>
        <span className="phone-from">Care team</span><span className="phone-to">Parent</span>
      </R>
    </div>
  )
}

// both sides of the same conversation, as chat bubbles
function Telephone() {
  return (
    <div className="chat">
      <R d={0} className="k">In their words</R>
      <R d={1} className="bubble is-nurse">
        <p>&ldquo;We tell them everything, but sometimes it&apos;s too much, they don&apos;t understand.&rdquo;</p>
        <span><Icon name="nurse" size={22} color="var(--comprehension)" />Retired NICU nurse</span>
      </R>
      <R d={4} className="bubble is-parent">
        <p>&ldquo;The hospital is like an elaborate game of telephone.&rdquo;</p>
        <span><Icon name="parent" size={22} />NICU parent</span>
      </R>
    </div>
  )
}

/* ---------- 02 · The problem ---------- */
const PAINS = [
  { p: 'connection', pain: 'Parents can’t bond the way they expected, and guilt fills the gap.', q: 'I didn’t have the luxury of having my baby right away and like putting him on my chest.' },
  { p: 'comprehension', pain: 'Parents have information, but not the whole picture.', q: '[Medical terminology] is a new language.' },
  { p: 'awareness', pain: 'Time disappears, and the next moment is a surprise.', q: 'In the ICU, time just like, it doesn’t exist. It’s just a mash of time.' },
]
// one pillar at a time, each with what a parent said
function Pillars({ step }) {
  return (
    <div className="pillars">
      <R d={0} className="k">The three pillars</R>
      <div className="cols">
        {PAINS.map((x, k) => (
          <div key={x.p} className={`col is-${x.p} ${step >= k ? 'is-in' : ''}`}>
            <span className="col-head"><Icon name={x.p} size={30} color={PILLARS[x.p].color} />{PILLARS[x.p].name}</span>
            <p className="col-pain">{x.pain}</p>
            <figure className="q"><blockquote>&ldquo;{x.q}&rdquo;</blockquote></figure>
          </div>
        ))}
      </div>
    </div>
  )
}

// Arriving from the pillars, each pillar's star flies from its column into its phrase, and the phrase lights
// up in that color from where the star lands.
const PS = ['connection', 'comprehension', 'awareness']
function Problem({ active }) {
  const host = useRef(null)
  const [fly, setFly] = useState(null)
  useLayoutEffect(() => {
    if (!active) { setFly(null); return }
    const from = PS.map((p) => document.querySelector(`.slide-pillars .col.is-${p} .col-head .icon`)?.getBoundingClientRect())
    const to = PS.map((p) => host.current?.querySelector(`mark.is-${p}`)?.getClientRects()[0])
    if (from.some((r) => !r) || to.some((r) => !r)) return
    setFly(PS.map((p, k) => ({ p, x: from[k].left + from[k].width / 2, y: from[k].top + from[k].height / 2, dx: to[k].left - (from[k].left + from[k].width / 2), dy: to[k].top + to[k].height / 2 - (from[k].top + from[k].height / 2) })))
  }, [active])
  return (
    <div className="center statement problem" ref={host}>
      <R d={0} className="k">Problem statement</R>
      <p className="statement-p problem-p">
        Parents of long-stay NICU babies struggle to <L p="connection">bond with their baby</L>, <L p="comprehension">make sense of fragmented medical information</L>, and <L p="awareness">keep track of time and what&apos;s ahead</L>.
      </p>
      {fly?.map((f, k) => (
        <span key={f.p} className="flystar" style={{ left: f.x, top: f.y, '--dx': `${f.dx}px`, '--dy': `${f.dy}px`, '--k': k }}>
          <Icon name={f.p} size={30} color={PILLARS[f.p].color} />
        </span>
      ))}
    </div>
  )
}

// How others tackle the three pillars, as a matrix (after the COLORFUL project's competitive analysis):
// one band per pillar, one column per kind of product; what it does, and our take on it, or ✕ if it doesn't.
const RIVALS = [
  { name: 'Patient portals', eg: 'e.g. MyChart' },
  { name: 'NICU webcams', eg: 'e.g. NICVIEW, AngelEye' },
  { name: 'Baby journals', eg: 'milestone and memory apps' },
]
const MATRIX = {
  connection: [
    null,
    { does: 'Watch the baby live, from anywhere', take: 'Seeing her isn’t the same as being part of her day: nothing is kept.' },
    { does: 'Parents record milestones and photos', take: 'Parents have to do the recording, on top of everything else.' },
  ],
  comprehension: [
    { does: 'Full medical records and test results', take: 'Complete, but clinical. Parents “get obsessive over MyChart.”' },
    null,
    null,
  ],
  awareness: [
    { does: 'Results and visits as they post', take: 'Built for clinic visits, not a NICU day, hour by hour.' },
    null,
    { does: 'A timeline of past entries', take: 'It looks back, never ahead.' },
  ],
}
function Compete() {
  return (
    <div className="compete">
      <R d={0} className="k">Competitive analysis</R>
      <R d={1} as="h2" className="h">How are others tackling the pain points?</R>
      <div className="mx">
        <R d={2} className="mx-row is-head">
          <span />
          {RIVALS.map((r) => <span key={r.name} className="mx-rival"><b>{r.name}</b><em>{r.eg}</em></span>)}
        </R>
        {PS.map((p, k) => (
          <R key={p} d={3 + k * 0.7} className={`mx-row is-${p}`}>
            <span className={`pill is-${p}`}><Icon name={p} size={18} color="#0b0b0b" />{PILLARS[p].name}</span>
            {MATRIX[p].map((c, j) => c
              ? <span key={j} className="mx-cell"><b>{c.does}</b><span className="mx-take">{c.take}</span></span>
              : <span key={j} className="mx-cell is-none" aria-label="Not addressed">✕</span>)}
          </R>
        ))}
      </div>
    </div>
  )
}

// the question builds one pillar at a time
function HMW({ step }) {
  const on = (n) => (step >= n ? 'is-in' : '')
  return (
    <div className="center statement hmw">
      <R d={0} className="k">Opportunity</R>
      <R d={1} as="p" className="statement-p">
        …turn a baby&apos;s care into a story that helps parents{' '}
        <span className={`hmw-part ${on(1)}`}><L p="connection">feel connected</L>,</span>{' '}
        <span className={`hmw-part ${on(2)}`}><L p="comprehension">understand what&apos;s happening</L>,</span>{' '}
        <span className={`hmw-part ${on(3)}`}>and <L p="awareness">stay aware of what&apos;s ahead</L>,</span>
      </R>
      <p className={`hmw-and hmw-part ${on(4)}`}>without adding to nurses&apos; workload?</p>
    </div>
  )
}

/* ---------- Brainstorm ---------- */
// our affinity map: six themes, two of our sticky notes from each
const THEMES = [
  { t: 'Health status and progress', ideas: ['Health status updates', 'Upcoming plans from different doctors in one place'] },
  { t: 'A visual baby avatar', ideas: ['IV drip lines that become a shape', 'Her setup in 3D'] },
  { t: 'Charts and medical information', ideas: ['Make my charts feel less clinical, more like a story', 'Night mode for bedside monitors'] },
  { t: 'Storytelling for parents', ideas: ['A weekly or daily chapter to read', 'Voice notes to the baby'] },
  { t: 'Celebrating milestones', ideas: ['Milestones like a first poop, first skin-to-skin', 'Reminders of her bravery and strength'] },
  { t: 'Sharing with others', ideas: ['Updates parents can share with family', 'Channels between parents and the care team'] },
]
// the ideas we pulled from the map, mixed (not grouped by principle yet), lifted over it as chips
// each chip keeps its own tilt on both slides, so it reads as the same note
const tilt = (t) => `${(t.length % 5) - 2}deg`
const ideas = () => [0, 1, 2, 3, 4].flatMap((k) => PS.map((p) => SORTED[p][k]))
const CHIP_AT = (k) => [3 + (k % 5) * 19.2 + ((k * 7) % 5) - 2, 19 + Math.floor(k / 5) * 27 + ((k * 11) % 7) - 3]
function Brainstorm() {
  return (
    <div className="brain">
      <R d={0} className="k">Brainstorm</R>
      <R d={1} className="brain-pillars">
        {PS.map((p) => <span key={p} className={`is-${p}`}><Icon name={p} size={26} color={PILLARS[p].color} />{PILLARS[p].name}</span>)}
      </R>
      <R d={2} className="brain-stage"><Shot src="./shots/affinity-map.webp" alt="Our affinity map: sticky notes from Jayden, Sara and Nimesh grouped into six themes: baby health status and progress tracking; a visual and interactive baby avatar; charting and medical information access; storytelling and narrative content for parents; emotional support and celebrating milestones; sharing and communication between stakeholders." />
      {ideas().map((t, k) => {
        const [x, y] = CHIP_AT(k)
        return <span key={t} className="sticky brain-chip" data-idea={t} style={{ left: `${x}%`, top: `${y}%`, '--k': k, '--r': tilt(t) }}>{t}</span>
      })}
      </R>
    </div>
  )
}

// the moment the question came up, as it was said in our team chat
function Mom() {
  return (
    <div className="center statement mom">
      <R d={0} className="k">Modality</R>
      <R d={1} as="p" className="statement-p">Picture a tired mom in a hospital bed, <L>anxious about her baby</L>.</R>
      <R d={3}><Shot src="./shots/modality-chat.png" pan={false} className="is-chat" alt="A teammate's message in our chat: imagining how a parent might interact with this from a hospital bed, by touch, remote control or gesture; imagining a tired mom on a bed who's anxious about her baby." /></R>
    </div>
  )
}

// how would she reach it? Three sketches, drawn in as if by hand
const Sketch = ({ kind }) => (
  <svg className={`sketch is-${kind}`} viewBox="0 0 240 170" aria-hidden="true">
    <defs>
      <filter id={`rough-${kind}`}><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed={kind.length} /><feDisplacementMap in="SourceGraphic" scale="2.6" /></filter>
    </defs>
    <g filter={`url(#rough-${kind})`}>
      {kind === 'touch' && <>
        {/* her bedside screen, and a finger on it */}
        <rect className="sk" x="92" y="18" width="128" height="86" rx="8" />
        <path className="sk" d="M156 104 L156 124 M136 126 L176 126" />
        <path className="sk is-star" d="M156 46 Q158 59 171 61 Q158 63 156 76 Q154 63 141 61 Q154 59 156 46 Z" />
        <path className="sk is-hand" d="M18 168 C30 150 44 138 62 130 L116 92 C121 88 127 92 123 98 L90 126 L100 124 C108 123 110 131 103 134 L80 146 C70 156 60 162 52 168" />
        <circle className="sk is-ping" cx="118" cy="93" r="9" /><circle className="sk is-ping is-2" cx="118" cy="93" r="17" />
      </>}
      {kind === 'remote' && <>
        {/* mom in her bed, a remote in her hand, her baby's screen across the room */}
        <path className="sk" d="M8 150 L8 96 M8 122 L120 122 L120 150 M8 132 L120 132" />
        <circle className="sk" cx="30" cy="104" r="11" />
        <path className="sk" d="M42 114 C60 106 84 108 104 116 L118 122" />
        <path className="sk is-hand" d="M60 110 L78 96 L86 102 L68 116" />
        <path className="sk is-ray" d="M86 96 L170 52" />
        <rect className="sk" x="160" y="22" width="70" height="48" rx="6" />
        <path className="sk is-star" d="M195 36 Q196 44 204 46 Q196 48 195 56 Q194 48 186 46 Q194 44 195 36 Z" />
      </>}
      {kind === 'gesture' && <>
        {/* an open hand in the air, the screen answering without a touch */}
        <rect className="sk" x="120" y="26" width="104" height="72" rx="8" />
        <path className="sk is-star" d="M172 46 Q174 58 186 60 Q174 62 172 74 Q170 62 158 60 Q170 58 172 46 Z" />
        <path className="sk is-hand" d="M44 150 L44 104 C44 98 52 98 52 104 L52 84 C52 78 60 78 60 84 L60 80 C60 74 68 74 68 80 L68 86 C68 80 76 80 76 86 L76 120 C76 138 66 150 56 158" />
        <path className="sk is-hand" d="M44 112 C38 106 30 110 34 118 L44 132" />
        <path className="sk is-wave" d="M90 72 C98 80 98 92 90 100 M100 64 C112 76 112 96 100 108" />
      </>}
    </g>
  </svg>
)
const MODES = [
  { k: 'Touch', t: 'One tap, big targets, nothing hidden behind hover.', chosen: true },
  { k: 'Remote control', t: 'For a parent who can’t reach the screen from bed.' },
  { k: 'Gesture', t: 'No touching at all, near an incubator.' },
]
function Modality() {
  return (
    <div className="modes">
      <R d={0} className="k">Modality</R>
      <R d={1} as="h2" className="h">How would she reach it?</R>
      <div className="cols">
        {MODES.map((x, k) => (
          <R key={x.k} d={2 + k * 0.6} className={`col mode ${x.chosen ? 'is-chosen' : ''}`}>
            <Sketch kind={x.k === 'Touch' ? 'touch' : x.k === 'Gesture' ? 'gesture' : 'remote'} />
            <span className="col-head">{x.k}{x.chosen && <em>Designed first</em>}</span>
            <p>{x.t}</p>
          </R>
        ))}
      </div>
      <R d={4.5} as="p" className="modes-note">We designed for touch first, dim by default, with night mode for the hours she&apos;s there in the dark.</R>
    </div>
  )
}

/* ---------- 03 · The idea ---------- */
// The big moment, in three beats (→ for each):
//   1. Her day, as it really went: small moments scattered across the dark, each with its time.
//   2. They pull together, in the order they happened, and burst into one star: every day becomes a star.
//   3. The star settles into its place, and the rest of her stay lights up around it, week by week:
//      her sky, which only grows.
const MOMENTS = [
  { t: '12 a.m.', m: 'A midnight feed', x: 14, y: 22 },
  { t: '3 a.m.', m: 'A restless night', x: 34, y: 12, kind: 'hard' },
  { t: '4:15 a.m.', m: 'Back on her CPAP mask', x: 70, y: 16, kind: 'change' },
  { t: '5:10 a.m.', m: 'Mom came in', x: 86, y: 36, kind: 'family' },
  { t: '6 a.m.', m: 'Her early feed', x: 10, y: 58 },
  { t: '9 a.m.', m: 'Her morning feed', x: 24, y: 80 },
  { t: '9:25 a.m.', m: 'Her own clothes, for the first time', x: 52, y: 86, kind: 'first' },
  { t: '11 a.m.', m: 'A breathing plan, still being made', x: 80, y: 74, kind: 'change' },
  { t: '12 p.m.', m: 'Her noon feed', x: 90, y: 56 },
]
// the rest of her stay, as constellations (one per week); today is the last star of week 4
const WEEKS = [
  [[90, 330], [140, 290], [190, 310], [230, 260], [280, 280], [320, 230], [370, 250]],
  [[420, 380], [470, 350], [520, 370], [560, 330], [610, 345], [650, 300], [700, 320]],
  [[460, 170], [510, 140], [560, 160], [610, 120], [655, 140], [700, 100], [745, 120]],
  [[780, 260], [830, 230], [880, 250]],
]
const TODAY = WEEKS[3][2]
// her firsts (days 4, 6, 14 and 23) become planets; day 17, the hard night, stays lit
const FIRSTS = [WEEKS[0][3], WEEKS[0][5], WEEKS[1][6], TODAY]
const HARD = WEEKS[2][2]
function Idea({ step = 0 }) {
  return (
    <div className={`idea2 is-beat-${Math.min(step, 2)} ${step >= 3 ? `is-later is-b${step}` : ''}`}>
      <div className="idea2-field" aria-hidden="true">
        <svg className="idea2-sky" viewBox="0 0 1000 480" preserveAspectRatio="xMidYMid meet">
          {WEEKS.map((w, i) => <polyline key={i} className="idea2-line" style={{ '--w': i }} points={w.map((p) => p.join(',')).join(' ')} />)}
          {WEEKS.flatMap((w, i) => w.map(([x, y], j) => (x === TODAY[0] && y === TODAY[1]) ? null : (
            <path key={`${i}-${j}`} className="idea2-day" style={{ '--n': i * 7 + j }} transform={`translate(${x} ${y})`} d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z" />
          )))}
          {FIRSTS.map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y}) rotate(-18)`}>
              <g className="idea2-planet" style={{ '--k': k }}>
                <circle r="16" className="idea2-planet-glow" /><ellipse rx="15" ry="4.5" className="idea2-ring" /><circle r="6.5" className="idea2-body" />
              </g>
            </g>
          ))}
          <circle className="idea2-hard" cx={HARD[0]} cy={HARD[1]} r="20" />
        </svg>
        {MOMENTS.map((m, k) => (
          <span key={m.m} className={`moment is-${m.kind ?? 'care'}`} style={{ left: `${m.x}%`, top: `${m.y}%`, '--k': k }}>
            <i /><span><b>{m.t}</b>{m.m}</span>
          </span>
        ))}
        <span className="idea2-star"><span className="idea2-burst" /><StarGlyph size={84} color="#FFF8E6" /></span>
        <span className="idea2-name">Mila&apos;s Sky</span>
      </div>
      <div className="idea2-words">
        <div className="k idea2-k">05 · The idea</div>
        <p className="idea2-line-0">Her day is full of small moments.</p>
        <p className="statement-p is-big idea2-line-1">Every day becomes <L>a star</L>.</p>
        <p className="statement-p idea2-line-2">Her stay becomes <L>a sky that only grows</L>.</p>
        <p className="statement-p idea2-line-3">Her firsts become <L>planets</L>.<span>Big moments, defined by parents: &ldquo;Yes, he pooped!… in its own way, it&apos;s beautiful.&rdquo;</span></p>
        <p className="statement-p idea2-line-4">Stars <L>never disappear</L>, even on hard days.<span>&ldquo;You are still moving forward even if you feel stuck.&rdquo;</span></p>
        <p className="statement-p idea2-line-5">It&apos;s <L>her</L> story, not a chart.</p>
      </div>
    </div>
  )
}

// The concept as one short film that plays by itself (no sound; the captions carry it): her day's moments
// gather into a star, her stay becomes a sky, her firsts become planets, hard days stay lit, and the sky
// takes her name. About 40 seconds; Replay restarts it.
const BEATS = [0, 5, 11, 18, 25, 32] // when each beat starts, in seconds
const FILM_END = 40
function Film({ active, thumb }) {
  const [t, setT] = useState(thumb ? FILM_END : 0)
  const [run, setRun] = useState(0)
  useEffect(() => {
    if (!active) { setT(0); return }
    const t0 = performance.now()
    const id = setInterval(() => { const v = (performance.now() - t0) / 1000; setT(Math.min(v, FILM_END)); if (v >= FILM_END) clearInterval(id) }, 100)
    return () => clearInterval(id)
  }, [active, run])
  const beat = BEATS.findLastIndex((b) => t >= b)
  return (
    <div className="film">
      <Idea key={run} step={beat} />
      <div className="film-bar" aria-hidden="true"><i style={{ width: `${(t / FILM_END) * 100}%` }} /></div>
      {!thumb && t >= FILM_END && <button type="button" className="film-replay" onClick={() => setRun((r) => r + 1)}>Replay</button>}
    </div>
  )
}

const FLOW = [
  { p: 'connection', principle: 'Keep parents in their baby’s story, even when apart', feature: 'Mila’s Sky' },
  { p: 'comprehension', principle: 'Turn care into a story parents can follow', feature: 'Today screen and scheduled summary' },
  { p: 'awareness', principle: 'Show what’s happening now and what’s ahead', feature: 'Timeline and What’s Next' },
]
function Principles() {
  return (
    <div className="flow">
      <R d={0} className="k">03 · Design principles</R>
      <R d={1} as="h2" className="h">Each pain point became a principle.</R>
      <div className="flow-grid is-two">
        <R d={2} className="flow-hd">Pain point</R><R d={2} className="flow-hd">Principle</R>
        {FLOW.map((x, k) => [
          <R key={`${x.p}a`} d={3 + k} className={`flow-cell is-${x.p}`}><Icon name={x.p} size={28} color={PILLARS[x.p].color} />{PILLARS[x.p].name}</R>,
          <R key={`${x.p}b`} d={3.4 + k} className="flow-cell is-principle">{x.principle}</R>,
        ])}
      </div>
    </div>
  )
}

// Ideas from our affinity map, each floating from the brainstorm to the principle it serves
const SORTED = {
  connection: ['Constellations', 'Milestones like a first poop, first skin-to-skin', 'Voice notes to the baby', 'Reminders of her bravery and strength', 'Updates parents can share with family'],
  comprehension: ['Make my charts feel less clinical, more like a story', 'Search medical terms in charting', 'IV drip lines that become a shape', 'Her setup in 3D', 'A weekly or daily chapter to read'],
  awareness: ['A clock that shows progress hour by hour', 'Journey timeline', 'Upcoming plans from different doctors in one place', 'Notifications for new updates', 'Standup information'],
}
const scatter = (n) => { const a = Math.sin(n * 91.7) * 43758.5; const b = Math.sin(n * 37.3) * 15731.7; return [(a - Math.floor(a) - 0.5) * 700, (b - Math.floor(b) - 0.5) * 340 + 120] }
function Sort({ active }) {
  const host = useRef(null)
  // each chip starts exactly where it floated on the affinity map, then flies to its principle
  useLayoutEffect(() => {
    if (!active || !host.current) return
    host.current.querySelectorAll('.floater').forEach((el, n) => {
      el.style.animation = 'none'; el.style.transform = 'none'
      const to = el.getBoundingClientRect()
      const from = document.querySelector(`.slide-brainstorm .brain-chip[data-idea="${el.dataset.idea}"]`)?.getBoundingClientRect()
      const [sx, sy] = scatter(n + 1)
      el.style.setProperty('--fx', `${from ? from.left - to.left : sx}px`)
      el.style.setProperty('--fy', `${from ? from.top - to.top : sy}px`)
      void el.offsetWidth
      el.style.animation = ''; el.style.transform = ''
    })
  }, [active])
  return (
    <div className="sort" ref={host}>
      <R d={0} className="k">Ideas, sorted by principle</R>
      <div className="sort-cols">
        {FLOW.map((x, c) => (
          <div key={x.p} className={`sort-col is-${x.p}`}>
            <R d={1 + c * 0.3} className="sort-head">
              <span><Icon name={x.p} size={22} color={PILLARS[x.p].color} />{PILLARS[x.p].name}</span>
              <b>{x.principle}</b>
            </R>
            {SORTED[x.p].map((t, k) => {
              const n = c * 7 + k
              return <span key={t} className="sticky floater" data-idea={t} style={{ '--n': n, '--r': tilt(t) }}>{t}</span>
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// each pillar: what we learned, then what we did about it (out of the deck for now; kept to bring back)
const DEEP = {
  connection: {
    principle: 'Keep parents in their baby’s story, even when apart.',
    decision: 'Milestones without points or streaks. The sky only grows.',
    iter: <><s>Take your star home</s><span className="deep-to" aria-label="became">→</span><b>Every star is yours to keep</b></>,
    feature: 'Mila’s Sky',
  },
  comprehension: {
    principle: 'Turn care into a story parents can follow.',
    decision: 'Balance completeness with simplicity, in plain, warm language.',
    iter: <><s>Raw records</s><span className="deep-to" aria-label="became">→</span><b>A scheduled summary</b></>,
    feature: 'Today screen and scheduled summary',
  },
  awareness: {
    principle: 'Show what’s happening now and what’s ahead.',
    decision: 'Time is visible on every screen: stay, week, day, hour.',
    iter: <><span className="deep-to">Added</span><b>A global clock</b></>,
    feature: 'Timeline and What’s Next',
  },
}
const Deep = (p) => function DeepView() {
  const x = DEEP[p]
  return (
    <div className={`deep is-${p}`}>
      <div className="deep-left">
        <R d={0} className="deep-name"><StarGlyph size={22} color={PILLARS[p].color} />{PILLARS[p].name} · what we did</R>
        <R d={1} as="h2" className="deep-principle">{x.principle}</R>
        <R d={2} className="deep-feature"><span>Feature</span>{x.feature}</R>
      </div>
      <div className="deep-right">
        <R d={3} className="deep-block"><span className="deep-k">Key decision</span><p>{x.decision}</p></R>
        <R d={4} className="deep-block"><span className="deep-k">Iteration</span><p className="deep-iter">{x.iter}</p></R>
      </div>
    </div>
  )
}

/* ---------- 04 · Constraints ---------- */
const CONSTRAINTS = [
  { who: 'Baby', c: 'Sensitive to light, needs quiet rest', r: 'Dark mode, silent, angled away from the incubator' },
  { who: 'Nurse', c: '“You have to be quick… life or death.”', r: 'Zero new tasks; content comes from charting' },
  { who: 'Family', c: 'Not every baby goes home', r: 'Nothing assumes an outcome; sensitive news only after a clinician talks with the family' },
  { who: 'Privacy', c: '[to fill in]', r: '[to fill in]', todo: true },
]
function Constraints() {
  return (
    <div className="constraints">
      <R d={0} className="k">Constraints</R>
      <div className="ctable" role="table">
        <R d={1} className="crow is-head" role="row"><span role="columnheader">For</span><span role="columnheader">Constraint</span><span role="columnheader">Our response</span></R>
        {CONSTRAINTS.map((x, k) => (
          <R key={x.who} d={2 + k} className={`crow ${x.todo ? 'is-todo' : ''}`} role="row">
            <span role="cell" className="crow-who"><Icon name={x.who === 'Family' ? 'parent' : x.who.toLowerCase()} size={30} />{x.who}</span><span role="cell">{x.c}</span><span role="cell" className="crow-r">{x.r}</span>
          </R>
        ))}
      </div>
    </div>
  )
}

/* ---------- 05 · The story layer ---------- */
function System() {
  return (
    <div className="system">
      <R d={0} className="k">Design system · the story layer</R>
      <div className="cols">
        <R d={1} className="col sys">
          <svg className="sys-art sys-const" viewBox="0 0 200 110" aria-hidden="true">
            <polyline points="18,82 52,60 80,70 112,38 146,48 180,22" />
            {[[18, 82], [52, 60], [80, 70], [112, 38], [146, 48], [180, 22]].map(([x, y], k) => (
              <path key={k} style={{ '--k': k }} transform={`translate(${x} ${y})`} d="M0 -6Q.9 -.9 6 0Q.9 .9 0 6Q-.9 .9 -6 0Q-.9 -.9 0 -6Z" />
            ))}
          </svg>
          <span className="col-head">Constellation</span>
          <p>Shows progress and holds memory, whatever the outcome.</p>
        </R>
        <R d={2} className="col sys">
          <div className="sys-art sys-pair" aria-hidden="true">
            <span><StarGlyph size={34} color="#F3E3B5" /><em>Everyday moments</em></span>
            <span><Planet size={46} /><em>Big moments</em></span>
          </div>
          <span className="col-head">Stars and planets</span>
          <p>Stars for everyday moments, planets for big ones, defined by parents: &ldquo;Yes, he pooped!… in its own way, it&apos;s beautiful.&rdquo;</p>
        </R>
        <R d={3} className="col sys">
          <div className="sys-art sys-name" aria-hidden="true">Mila&apos;s Sky</div>
          <span className="col-head">Naming and tone</span>
          <p>&ldquo;Mila&apos;s Sky&rdquo; makes it her story, not a chart: hopeful and reassuring.</p>
        </R>
      </div>
    </div>
  )
}

function KOpen() {
  return (
    <div className="center statement">
      <R d={0} className="k">06 · Constraints</R>
      <R d={1} className="people">
        <span><Icon name="baby" size={64} />Baby</span>
        <span><Icon name="nurse" size={64} color="var(--comprehension)" />Nurse</span>
        <span><Icon name="parent" size={64} />Family</span>
      </R>
      <R d={2} as="p" className="statement-p">Every bedside has <L>three people to protect</L>: the baby, the nurse, and the family.</R>
    </div>
  )
}

/* ---------- 06 · At her bedside: the product, live ---------- */
const CHAPTERS = [
  { id: 'born', name: 'Mila is born', note: 'Her first star, as big as she is.', p: ['connection'] },
  { id: 'story', name: 'Her story begins', note: 'What’s on her, one thing at a time.', p: ['comprehension'] },
  { id: 'day', name: 'A day', note: 'Today as an arc; terms explained; what’s ahead.', p: ['comprehension', 'awareness'] },
  { id: 'sky', name: 'Her sky', note: 'Today becomes a star in Mila’s Sky.', p: ['connection', 'awareness'] },
  { id: 'home', name: 'Going home', note: 'Her sky becomes a mobile for home.', p: ['connection'] },
  { id: 'not', name: 'If she doesn’t go home', note: 'Her story, kept, at the family’s pace.', p: ['connection'] },
]
function Product({ thumb }) {
  const frame = useRef(null)
  const [ch, setCh] = useState('day')
  const pick = (id) => { setCh(id); frame.current?.contentWindow?.postMessage({ type: 'mila:chapter', chapter: id }, '*') }
  return (
    <div className="product">
      <div className="product-side">
        <R d={0} className="k">At her bedside</R>
        <R d={1} as="h2" className="h">Her whole stay, one star at a time.</R>
        <ol className="chapters">
          {CHAPTERS.map((c, k) => (
            <R key={c.id} d={2 + k * 0.5} as="li">
              <button type="button" className={ch === c.id ? 'is-on' : ''} onClick={() => pick(c.id)}>
                <span className="ch-n">{k + 1}</span>
                <span className="ch-name">{c.name}{c.p.map((p) => <i key={p} className={`ch-dot is-${p}`} title={PILLARS[p].name} />)}</span>
                <span className="ch-note">{c.note}</span>
              </button>
            </R>
          ))}
        </ol>
      </div>
      <R d={1} className="ipad">
        <div className="ipad-screen">
          {thumb
            ? <div className="ipad-thumb"><StarGlyph size={40} color="#F3E3B5" /><span>Live prototype</span></div>
            : <iframe ref={frame} title="Mila's Sky bedside display" src="./prototype/index.html?embed=1&chapter=day" />}
        </div>
        <i className="ipad-cam" aria-hidden="true" />
      </R>
    </div>
  )
}

/* ---------- Close: back to where we started ---------- */
function Both({ step }) {
  return (
    <div className="center statement both-close">
      <R d={0} as="p" className="statement-p">NICU parents live both things at once, every day.</R>
      <p className={`statement-p is-big hmw-part ${step >= 1 ? 'is-in' : ''}`}>Mila&apos;s Sky <L>holds both</L>.</p>
    </div>
  )
}
function Close() {
  return (
    <div className="center close">
      <R d={0} className="close-star" aria-hidden="true"><StarGlyph size={64} color="#FFF8E6" /></R>
      <R d={1} as="h2" className="close-h">Every star is hers to keep.</R>
      <R d={3} className="close-thanks">Thank you</R>
      <R d={4} className="title-team">Jayden · Nimesh · Sara</R>
    </div>
  )
}

export const SLIDES = [
  { id: 'title', section: 'Mila’s Sky', planet: true, View: Title },
  { id: 'hook', section: 'Hook', View: Hook },
  { id: 'both', section: 'Hook', View: statement({ k: 'The tension', big: true, children: <>NICU parents live <L>both things at once</L>, every day.</> }) },
  { id: 'nicu', section: 'The NICU', planet: true, View: statement({ k: 'The NICU', children: <>The neonatal intensive care unit is where babies born too early or too sick are cared for, <L>often for weeks or months</L>.</> }) },
  { id: 'environment', section: 'The NICU', View: Environment },
  { id: 'wall', section: '01 · Research', planet: true, View: Wall },

  { id: 'gap', section: '01 · Research', View: statement({ k: 'The gap', big: true, children: <>But it didn&apos;t tell us <L>how parents make sense of it</L>.</> }) },
  { id: 'asked', section: '01 · Research', View: Asked },
  { id: 'heard', section: '01 · Research', View: Heard },
  { id: 'telephone', section: '01 · Research', View: Telephone },

  { id: 'p-open', section: '02 · The problem', planet: true, tint: 'all', View: statement({ k: '02 · The problem', big: true, children: <>Everything we heard came down to <L>three things</L>.</> }) },
  { id: 'pillars', section: '02 · The problem', tint: 'all', steps: 3, View: Pillars },
  { id: 'problem', section: '02 · The problem', tint: 'all', View: Problem },
  { id: 'compete', section: '02 · The problem', tint: 'all', View: Compete },
  { id: 'hmw', section: '02 · The problem', tint: 'all', steps: 5, View: HMW },

  { id: 'principles', section: '03 · Design principles', planet: true, tint: 'all', View: Principles },

  { id: 'brainstorm', section: '04 · Ideation', planet: true, View: Brainstorm },
  { id: 'sort', section: '04 · Ideation', tint: 'all', View: Sort },
  { id: 'thread', section: '04 · Ideation', View: statement({ k: 'What the ideas had in common', children: <>The ideas we kept coming back to all did one thing: <L>turn her care into a story</L>.</> }) },

  { id: 'film', section: '05 · The idea and the story layer', planet: true, bare: true, View: Film },

  { id: 'k-open', section: '06 · Constraints', planet: true, View: KOpen },
  { id: 'constraints', section: '06 · Constraints', View: Constraints },
  { id: 'mom', section: '06 · Constraints', View: Mom },
  { id: 'modality', section: '06 · Constraints', View: Modality },

  { id: 'board', section: '07 · The product', planet: true, View: Storyboard },
  ...FEATURES.map((f) => ({ id: f.id, section: '07 · The product', feature: f.show, View: Feature(f) })),
  { id: 'both-close', section: 'Mila’s Sky', steps: 2, View: Both },
  { id: 'close', section: 'Mila’s Sky', View: Close },
]
