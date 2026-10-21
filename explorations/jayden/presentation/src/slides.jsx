import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Icon, StarGlyph, Wordmark } from './glyphs.jsx'
import { Puzzle } from './puzzle.jsx'
import { Answer, Feature } from './demo.jsx'
import { DemoFilm, Finale } from './film.jsx'

export const ITER_MODE = 'focus' // 'focus' = one at a time, then into the row · 'row' = current staggered fade-in

// The case study as one story. Its spine: NICU parents live two things at once (the fight and the
// celebration), and Constellate is a place that holds both. Each chapter opens on a realization, said
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

// A term, set like a dictionary entry: headword, how it's said, what it means.
function Define({ k, word, short, say, children }) {
  return (
    <div className="center define">
      {k && <R d={0} className="k">{k}</R>}
      <R d={1} as="h2" className="define-word">{word}</R>
      <R d={2} as="p" className="define-meta">{short && <span>{short}</span>}<span>{say}</span><span>noun</span></R>
      <R d={3} className="define-rule" />
      <R d={4} as="p" className="define-p">{children}</R>
    </div>
  )
}
const define = (props) => function DefineView() { return <Define {...props} /> }

/* ---------- Opening ---------- */
function Title({ active }) {
  return (
    <div className="center title">
      <R d={0} className="title-k">A NICU storytelling case study</R>
      <R d={1} as="h1" className="title-h"><Wordmark intro={active} /></R>
      <R d={2} as="p" className="title-sub">Transforming NICU care into a story, one star at a time.</R>
      <R d={4} className="title-team">Jayden · Nimesh · Sara</R>
    </div>
  )
}

// who this is for: one real baby, before any numbers
function Niko() {
  // Lauren is one of the parents we interviewed; her family's stay is where the story starts
  return (
    <div className="niko2">
      <R d={1} className="niko2-photo"><img src="./shots/niko-lauren.webp" alt="Lauren holds her son Niko close outside the hospital, her cheek against his head. Niko, in a plaid shirt with soft lines and a tube taped at his chest, rests against her." /></R>
      <div className="niko2-words">
        <R d={0} className="k">Meet Niko</R>
        <R d={2} as="h2" className="niko2-h">Niko, and his mom, Lauren.</R>
        <R d={3} as="p" className="niko2-p">Lauren is one of the NICU parents we interviewed. Her family&apos;s time in the NICU is where this story starts.</R>
      </div>
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
  { k: 'Sound', t: 'Noise is linked to changes in heart rate, breathing and sleep.' },
  { k: 'Light', t: 'Light that cycles between day and night is linked to better weight gain and shorter stays.' },
  { k: 'Touch', t: 'The baby needs to be held in specific positions with extra protection.' },
  { k: 'Space', t: 'The incubator isn’t a protective bubble. The room itself can impact the baby’s health.' },
]
function Environment() {
  return (
    <div className="env">
      <R d={0} className="k">Inside the NICU</R>
      <R d={1} as="h2" className="h">For babies this fragile, the room itself is part of their care.</R>
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
      <R d={1} as="h2" className="h wall-h">The research showed how the NICU affects babies’ growth, nurses’ work, and parents’ wellbeing.</R>
      <R d={2}><Shot src="./shots/research-wall.webp" alt="Our secondary research board: eight papers and standards on hospital exposures, noise and light, nurses' alarm challenges, incubator acoustics, sensory stimulation, NICU sound levels, NICU design standards and single-family rooms, each summarized in a table with sticky notes." /></R>
    </div>
  )
}

/* ---------- 01 · Research ---------- */
// Who we listened to, in three steps: the headline alone; then the count and four icons; then the headline
// rises to the title and each icon travels from the row into its person's card (the same icon, moved with
// a transform from where it sat to where its card keeps a place for it).
const PEOPLE = [
  { id: 'P1', who: 'parent', role: 'Former SICU/PICU parent', notes: ['Child spent significant time in the hospital with a congenital heart defect', 'Not NICU, but inpatient care from an extremely early age'] },
  { id: 'P2', who: 'nurse', role: 'Retired NICU nurse', notes: ['35 years as a NICU nurse', 'Retired 7 years ago'] },
  { id: 'P3', who: 'parent', role: 'Current NICU parent', notes: ['Child has a rare congenital heart disease and esophageal atresia', 'In the NICU for the past 11 months'] },
  { id: 'P4', who: 'nurse', role: 'Former NICU night-shift nurse', notes: ['Worked in NICUs in Seattle and Texas', 'Mostly night shifts'] },
]
const BY_ID = Object.fromEntries(PEOPLE.map((p) => [p.id, p]))
const ROW = ['P1', 'P3', 'P2', 'P4'] // parents, then nurses
const Person = ({ id }) => <Icon name={BY_ID[id].who} size={40} color={BY_ID[id].who === 'nurse' ? 'var(--comprehension)' : undefined} />
const Slot = ({ id }) => <span className="ivw-slot" data-p={id}><Person id={id} /></span>

function Asked({ step, active, thumb }) {
  const host = useRef(null)
  const head = useRef(null)
  const [pos, setPos] = useState(null)
  useLayoutEffect(() => {
    const el = host.current
    if (!el || thumb) return
    // layout offsets, not screen rects, so the slide's own entrance transforms don't skew them
    const at = (n) => { let x = 0, y = 0; while (n && n !== el) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent } return [x, y] }
    const slots = (sel) => Object.fromEntries([...el.querySelectorAll(sel)].map((n) => [n.dataset.p, at(n)]))
    const measure = () => {
      const h = head.current
      setPos({ drop: el.clientHeight / 2 - (at(h)[1] + h.offsetHeight / 2), row: slots('.ivw-row .ivw-slot'), card: slots('.ivw-card .ivw-slot') })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [thumb])
  // arriving back from the next slide lands on the last step: show it, don't replay the flight
  const [jump, setJump] = useState(false)
  const was = useRef(active)
  useLayoutEffect(() => {
    if (active && !was.current && step > 0) {
      setJump(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setJump(false)))
    }
    was.current = active
  }, [active, step])
  return (
    <div ref={host} className={`ivw is-s${step} ${jump ? 'is-jump' : ''}`} style={pos ? { '--drop': `${pos.drop}px` } : undefined}>
      <div ref={head} className="ivw-head"><R d={0} as="p" className="statement-p">We listened.</R></div>
      <div className="ivw-row">
        <span className="ivw-count"><b>4</b>interviews</span>
        <i className="ivw-rule" />
        <figure className="ivw-who">
          <span className="ivw-icons">{ROW.map((id) => <Slot key={id} id={id} />)}</span>
          <figcaption>2 parents · 2 nurses</figcaption>
        </figure>
      </div>
      <div className="ivw-grid">
        {PEOPLE.map((p, k) => (
          <article key={p.id} className={`ivw-card is-${p.who}`} style={{ '--k': k }}>
            <Slot id={p.id} />
            <div className="ivw-text">
              <span className="ivw-id">{p.who === 'nurse' ? 'Nurse' : 'Parent'} · {p.id}</span>
              <h3 className="ivw-role">{p.role}</h3>
              <ul>{p.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
      {pos && (
        <div className="ivw-fly" aria-hidden="true">
          {ROW.map((id, k) => {
            const [x, y] = (step >= 2 ? pos.card : pos.row)[id]
            return <span key={id} className="ivw-icon" style={{ transform: `translate(${x}px, ${y}px)`, '--k': k }}><Person id={id} /></span>
          })}
        </div>
      )}
    </div>
  )
}

function Heard() {
  return (
    <div className="finding">
      <div className="finding-words">
        <R d={0} className="k">What we found</R>
        <R d={1} as="p" className="statement-p is-big">Parents get the <L>pieces</L> but are left to <L>put them together</L>.</R>
      </div>
      <R d={2} className="finding-art"><Puzzle /></R>
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
  { p: 'connection', qs: ['How can I feel close to my baby before I can hold them?', 'What happened while I was away?'], themes: [['Bonding', 'Weeks before a first hold'], ['Emotions', 'Fear and hope, every day'], ['Parent guilt', 'For the situation, and when they can’t be there']], pain: 'Parents can’t bond the way they expected, and guilt fills the gap.', q: 'I didn’t have the luxury of having my baby right away and like putting him on my chest.' },
  { p: 'comprehension', qs: ['What is all of this on my baby?', 'What does that word mean?'], themes: [['Medical terminology', 'A whole new language'], ['Status of child', 'Is he okay today?'], ['Provider communication', 'A new nurse every shift']], pain: 'Parents have information, but not the whole picture.', q: '[Medical terminology] is a new language.' },
  { p: 'awareness', qs: ['What’s next, and who is caring for my baby tonight?', 'How are they doing right now?'], themes: [['Situational awareness', 'What’s happening right now'], ['Holistic awareness', 'How far he’s come, and what’s next']], pain: 'Time blurs, and the next moment is a surprise.', q: 'In the ICU, time just like, it doesn’t exist. It’s just a mash of time.' },
]
// one pillar at a time, each card taking the last one's place; the next click brings what its parents ask beside it
function Pillars({ step }) {
  const at = Math.floor(step / 2), asks = step % 2 === 1
  return (
    <div className="pillars">
      <R d={0} className="k">Three needs</R>
      <div className="cols">
        {PAINS.map((x, k) => (
          <div key={x.p} className={`col is-${x.p} ${at === k ? 'is-in' : ''}`}>
            <span className="col-head"><Icon name={x.p} size={30} color={PILLARS[x.p].color} />{PILLARS[x.p].name}</span>
            <p className="col-pain">{x.pain}</p>
            <ul className="col-themes">{x.themes.map(([t, eg]) => <li key={t}><b>{t}</b><span>{eg}</span></li>)}</ul>
          </div>
        ))}
        {/* keyed on the pillar so it rises in fresh each time */}
        {PAINS.filter((_, k) => asks && k === at).map((x) => (
          <div key={x.p} className={`pillars-ask pa is-${x.p}`}>
            <R d={0} className="pa-k"><span>Parents ask</span></R>
            {x.qs.map((q, k) => <R key={q} d={1 + k * 2} as="p" className="pa-q">&ldquo;{q}&rdquo;</R>)}
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
    { does: 'Watch the baby live, from anywhere', take: 'Seeing your baby isn’t the same as being part of their day: nothing is kept.' },
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
// what each colour means, wherever the three pain points appear together
const KEY = [
  ['connection', 'Feeling close to their baby, even when apart'],
  ['comprehension', 'Understanding what’s happening, in words they know'],
  ['awareness', 'Knowing what’s happening now, and what’s next'],
]
function HMW({ step }) {
  const on = (n) => (step >= n ? 'is-in' : '')
  return (
    <div className="center statement hmw">
      <R d={0} className="k">Opportunity</R>
      <R d={1} as="p" className="statement-p">
        How might we turn a baby&apos;s care into a story that helps parents{' '}
        <span className={`hmw-part ${on(1)}`}><L p="connection">feel connected</L>,</span>{' '}
        <span className={`hmw-part ${on(2)}`}><L p="comprehension">understand what&apos;s happening</L>,</span>{' '}
        <span className={`hmw-part ${on(3)}`}>and <L p="awareness">stay aware of what&apos;s ahead</L>?</span>
      </R>
      <div className="hmw-key">
        {/* only the pillar the sentence has just reached */}
        {KEY.filter((_, k) => step === k + 1).map(([p, def]) => <span key={p} className={`is-${p} hmw-key-on`}><i /><b>{PILLARS[p].name}</b>{def}</span>)}
      </div>
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
// where each chip was on screen (its center, bob and tilt included) the moment the brainstorm was left.
// Read in a layout cleanup, which runs before the slide's own classes change: once the slide is past,
// its stage snaps back to its hidden pose (18px lower) and the bob stops, so reading later is off.
const CHIP_LEFT = new Map()
function Brainstorm({ active }) {
  const host = useRef(null)
  useLayoutEffect(() => {
    if (!active) return
    const el = host.current
    return () => el?.querySelectorAll('.brain-chip').forEach((c) => {
      const r = c.getBoundingClientRect()
      CHIP_LEFT.set(c.dataset.idea, [r.left + r.width / 2, r.top + r.height / 2])
    })
  }, [active])
  return (
    <div className="brain" ref={host}>
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

// brainstorm and sort as one slide: the affinity map first, then → sends its chips to their principles.
// Both layers are stacked in place; each keeps its own logic, switched on by the step.
function Ideation({ active, step }) {
  return (
    <div className="ideate">
      <Brainstorm active={active && step === 0} />
      <Sort active={active && step === 1} />
    </div>
  )
}

// the moment the question came up, as it was said in our team chat
function Mom() {
  return (
    <div className="center statement mom">
      <R d={0} className="k">Modality</R>
      <R d={1} as="p" className="statement-p">Ideating interactions</R>
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
  { k: 'Remote control', t: 'If the monitor can’t be accessed directly.' },
  { k: 'Gesture', t: 'No touching at all, near an incubator.' },
]
function Modality() {
  return (
    <div className="modes">
      <R d={0} className="k">Modality</R>
      <R d={1} as="h2" className="h">How would parents interact with it?</R>
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
        <span className="idea2-name">Constellate</span>
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
  { p: 'connection', principle: 'Keep parents in their baby’s story, even when apart', feature: 'Constellate' },
  { p: 'comprehension', principle: 'Turn care into a cohesive story parents can follow', feature: 'Today screen and scheduled summary' },
  { p: 'awareness', principle: 'Show what’s happening now and prepare for what’s ahead', feature: 'Timeline and What’s Next' },
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
  connection: ['Constellates', 'Milestones like a first poop, first skin-to-skin', 'Voice notes to the baby', 'Reminders of her bravery and strength', 'Updates parents can share with family'],
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
      // centers, not corners: a tilted chip's box is wider than the chip, but its center is where the chip is
      const to = el.getBoundingClientRect()
      const r = document.querySelector(`.slide-brainstorm .brain-chip[data-idea="${el.dataset.idea}"]`)?.getBoundingClientRect()
      const from = CHIP_LEFT.get(el.dataset.idea) ?? (r && [r.left + r.width / 2, r.top + r.height / 2])
      CHIP_LEFT.delete(el.dataset.idea)
      const [sx, sy] = scatter(n + 1)
      el.style.setProperty('--fx', `${from ? from[0] - (to.left + to.width / 2) : sx}px`)
      el.style.setProperty('--fy', `${from ? from[1] - (to.top + to.height / 2) : sy}px`)
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
    feature: 'Constellate',
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
// One row per person or rule at the bedside. A row with `before` and `after` also gets a walkthrough after the
// table: its For and Constraint lift to the top as a label, then the previous screen, then the iterated one.
// To fill in a row, edit its `before` / `after` (src: null shows a placeholder frame).
const CONSTRAINTS = [
  { who: 'Baby', c: 'Sensitive to light, needs quiet rest', r: 'Dark mode, silent, angled away from the incubator',
    before: { src: './shots/baby previous.png', caption: 'Bright colors from the screen can light up the room', alt: 'An earlier version of the day screen: a large glowing pink-and-white star with long light flares fills most of the screen, beside a panel with the baby’s weight, breathing and time with family.' },
    after: { src: './shots/baby new.png', caption: 'Screen is dark by default to reduce residual light', alt: 'The new default screen: almost entirely black, with a small dim star, the time 1:12 a.m. in soft gray, “Next care 3:00 a.m. · Mila is resting,” and a Care team button.' } },
  { who: 'Nurse', c: '“You have to be quick… life or death.” (retired NICU nurse)', r: 'Zero new tasks; content comes from charting',
    before: { src: './shots/nurse previous.webp', caption: 'Nurses would have to write a new summary', alt: 'An early design idea of a baby dashboard' },
    after: { src: './shots/nurse new.png', caption: 'Nurse charts are incorporated into day overview', alt: '' } },
  { who: 'Family', c: 'Not every baby goes home', r: 'Nothing assumes an outcome; sensitive news only after a clinician talks with the family',
    before: { src: './shots/parent previous.png', caption: 'Only highlights key moments from the hospital, lacking the memory of the baby itself', alt: '' },
    after: { src: './shots/parent new.png', caption: 'Highlights the unique characteristics of the baby, beyond the medical status', alt: '' } },
]
// Steps: 0 the table · then per walkthrough row: lift, before, after. The last row's "after" ends the slide.
// Going from one row's "after" to the next row's "lift" is one click: the label flies home, the table blinks
// back in, then the next row lifts.
const WALK = CONSTRAINTS.flatMap((x, k) => (x.before ? [k] : []))
const PHASES = ['lift', 'before', 'after']
const CONSTRAINT_STEPS = WALK.length * PHASES.length + 1
const walkAt = (step) => (step < 1 || step > WALK.length * PHASES.length
  ? { row: -1, phase: 'rest' }
  : { row: WALK[Math.floor((step - 1) / PHASES.length)], phase: PHASES[(step - 1) % PHASES.length] })
const LABEL_GAP = 28 // between For and Constraint in the label, as in the table
const LABEL_ABOVE = 30 // the label's vertical center, above the top of the screens
const iconFor = (who) => (who === 'Family' ? 'parent' : who.toLowerCase())
const Who = ({ x, size = 30 }) => <><Icon name={iconFor(x.who)} size={size} />{x.who}</>

function WalkShot({ shot, kind, on }) {
  return (
    <figure className={`cwalk-shot is-${kind} ${on ? 'is-on' : ''}`} aria-hidden={!on}>
      <div className="cwalk-frame">
        {shot.src
          ? <img src={shot.src} alt={shot.alt} />
          : <div className="cwalk-placeholder">Screen to come</div>}
      </div>
      <figcaption><span className="cwalk-tag">{kind === 'before' ? 'Before' : 'After'}</span><p>{shot.caption}</p></figcaption>
    </figure>
  )
}

function Constraints({ step = 0, active, thumb }) {
  const host = useRef(null)
  const [pos, setPos] = useState(null)
  const remeasure = useRef(null)
  useLayoutEffect(() => {
    const el = host.current
    if (!el || thumb) return
    // layout offsets, not screen rects, so the slide's own entrance transforms don't skew them
    const at = (n) => { let x = 0, y = 0; while (n && n !== el) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent } return [x, y] }
    const measure = () => {
      const rows = WALK.map((k) => {
        const slot = (part) => el.querySelector(`.crow[data-row="${k}"] .cwalk-slot.is-${part}`)
        // each label piece is pinned by its left-center: in its cell, and just above the screens, left-aligned with the table
        const home = (n) => { const [x, y] = at(n); return [x, y + n.offsetHeight / 2] }
        const y = at(el.querySelector(`.cwalk-pair[data-row="${k}"] .cwalk-shot`))[1] - LABEL_ABOVE
        // the Constraint starts after For as it's actually drawn in the label, so it can never overlap it
        const whoW = el.querySelector(`.cwalk-fly.is-who[data-row="${k}"] .cwalk-as-cell`).offsetWidth
        return {
          who: { home: home(slot('who')), top: [0, y] },
          c: { home: home(slot('c')), top: [whoW + LABEL_GAP, y] },
        }
      })
      setPos(Object.fromEntries(WALK.map((k, j) => [k, rows[j]])))
    }
    measure()
    remeasure.current = measure
    // the type can arrive after the first measure (web fonts), so watch the pieces themselves, not just the slide
    const ro = new ResizeObserver(measure)
    ;[el, ...el.querySelectorAll('.cwalk-slot, .cwalk-as-cell, .cwalk-shot')].forEach((n) => ro.observe(n))
    document.fonts?.ready.then(measure)
    document.fonts?.addEventListener('loadingdone', measure)
    return () => { ro.disconnect(); document.fonts?.removeEventListener('loadingdone', measure); remeasure.current = null }
  }, [thumb])
  // and once more on every click, before it paints, so a label always leaves from and lands on real positions
  useLayoutEffect(() => { if (active) remeasure.current?.() }, [step, active])

  // what this click changed, kept steady until the next click (re-renders mustn't restart the timing)
  const tr = useRef({ step, from: step })
  if (!active) tr.current = { step, from: step }
  else if (tr.current.step !== step) tr.current = { step, from: tr.current.step }
  const cur = walkAt(step), pre = walkAt(tr.current.from)
  const swap = pre.row >= 0 && cur.row >= 0 && pre.row !== cur.row
  const lift = swap ? 0.9 : 0 // on a swap, the next label waits for the last one to land and the table to show
  const stage = cur.row !== pre.row ? lift + 0.55 : 0.1
  const away = cur.row >= 0

  // a label piece travels between its cell and the top, in the table's own type the whole way
  const fly = (k, part, x) => {
    const p = pos?.[k]
    const [tx, ty] = p ? (cur.row === k ? p[part].top : p[part].home) : [0, 0]
    return (
      <span className={`cwalk-fly is-${part} ${cur.row === k ? 'is-away' : ''}`} data-row={k} style={{ transform: `translate(${tx}px, ${ty}px)` }}>
        <span className="cwalk-as-cell">{part === 'who' ? <Who x={x} /> : x.c}</span>
      </span>
    )
  }
  return (
    <div ref={host} className={`constraints cwalk ${away ? 'is-away' : ''} ${swap ? `is-swap-${step % 2}` : ''}`}
      style={{ '--lift-delay': `${lift}s`, '--stage-delay': `${stage}s` }}>
      <div className="cwalk-fade"><R d={0} className="k">Constraints</R></div>
      <div className="ctable cwalk-fade" role="table">
        <R d={1} className="crow is-head" role="row"><span role="columnheader">For</span><span role="columnheader">Constraint</span><span role="columnheader">Our response</span></R>
        {CONSTRAINTS.map((x, k) => (
          <R key={x.who} d={2 + k} className={`crow ${x.todo ? 'is-todo' : ''} ${cur.row === k ? 'is-away' : ''}`} role="row" data-row={k}>
            <span role="cell" className="crow-who"><span className="cwalk-slot is-who"><Who x={x} /></span></span>
            <span role="cell"><span className="cwalk-slot is-c">{x.c}</span></span>
            <span role="cell" className="crow-r">{x.r}</span>
          </R>
        ))}
      </div>
      {!thumb && (
        <>
          <div className="cwalk-layer" aria-hidden="true">
            {WALK.map((k) => <span key={k}>{fly(k, 'who', CONSTRAINTS[k])}{fly(k, 'c', CONSTRAINTS[k])}</span>)}
          </div>
          {/* before, then after beside it; both stay up until the label goes home */}
          <div className="cwalk-stage">
            {WALK.map((k) => (
              <div key={k} className="cwalk-pair" data-row={k}>
                <WalkShot shot={CONSTRAINTS[k].before} kind="before" on={cur.row === k && cur.phase !== 'lift'} />
                <WalkShot shot={CONSTRAINTS[k].after} kind="after" on={cur.row === k && cur.phase === 'after'} />
              </div>
            ))}
          </div>
        </>
      )}
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
          <span className="col-head">Constellate</span>
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
          <div className="sys-art sys-name" aria-hidden="true">Constellate</div>
          <span className="col-head">Naming and tone</span>
          <p>&ldquo;Constellate&rdquo;: her days, joined into one picture. Hopeful and reassuring, never clinical.</p>
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
      <R d={2} as="p" className="statement-p">Our design has to work for <L>three people</L> at every bedside: the baby, the nurse, and the family.</R>
    </div>
  )
}

/* ---------- 07 · Previous iterations: where three features started ---------- */
const ITERS = [
  { src: './shots/iter-galaxy.webp', t: 'Exploring the galaxy’s visual direction', c: 'Beautifully crafted, but too layered and complex for a tired parent at the bedside.', alt: 'An early version: her stay drawn as a dense, swirling galaxy.' },
  { src: './shots/iter-day-report.webp', t: 'Mapping the content and information architecture', c: 'Too much at once. We cut the content and layout down to the essentials.', alt: 'An early version: a full report of her day, section by section.' },
  { src: './shots/iter-setup-3d.webp', t: '3D models for detailed care visuals', c: 'In the moment, parents needed other information more than a 3D model.', alt: 'An early version: a 3D model of the baby and everything on her.' },
]
function IterationsRow() {
  return (
    <div className="iters">
      <R d={0} className="k">07 · Previous iterations</R>
      <R d={1} as="h2" className="h">Where it started.</R>
      <div className="iter-row">
        {ITERS.map((x, k) => (
          <R key={x.src} d={2 + k * 0.7} as="figure" className="iter">
            <div className="iter-frame"><img src={x.src} alt={x.alt} /></div>
            <figcaption><b>{x.t}</b><span>{x.c}</span></figcaption>
          </R>
        ))}
      </div>
    </div>
  )
}

// focus: each iteration arrives large, then travels (FLIP: translate + scale) into its slot as the next arrives.
// Every figure always sits in its slot, so the row never reflows; "large" and "waiting" are transforms on top.
const LIFT = 1.3 // the large caption's scale
const twice = (f) => requestAnimationFrame(() => requestAnimationFrame(f))
function IterationsFocus({ step, active, thumb }) {
  const N = ITERS.length
  const row = useRef(null)
  const [g, setG] = useState(null)
  useLayoutEffect(() => {
    const el = row.current
    if (!el || thumb) return
    const slide = el.closest('.slide')
    // layout offsets, not screen rects, so the slide's entrance and our own transforms don't skew them
    const measure = () => {
      let top = 0
      for (let n = el; n && n !== slide; n = n.offsetParent) top += n.offsetTop
      const w = el.clientWidth
      const gap = 32
      setG([...el.querySelectorAll('.iter')].map((fig) => {
        const fr = fig.querySelector('.iter-frame'), cap = fig.querySelector('figcaption')
        const sw = fr.offsetWidth, r = fr.offsetHeight / sw, cw = cap.offsetWidth * LIFT
        const fw = Math.min((slide.clientHeight - 96 - top) / r, w * 0.62, w - gap - cw)
        const fh = fw * r, s = fw / sw, x0 = (w - fw - gap - cw) / 2, sx = fig.offsetLeft
        const cx = x0 + fw + gap - sx - cap.offsetLeft, cy = (fh - cap.offsetHeight * LIFT) / 2 - cap.offsetTop
        return {
          frame: { big: `translate(${x0 - sx}px, 0) scale(${s})`, wait: `translate(${x0 - sx + fw * 0.03}px, ${fh * 0.03}px) scale(${s * 0.94})` },
          cap: { big: `translate(${cx}px, ${cy}px) scale(${LIFT})`, wait: `translate(${cx}px, ${cy + 10}px) scale(${LIFT})` },
        }
      }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [thumb])

  // which step is on screen; it holds while the slide leaves, and lags a beat for the reduced-motion crossfade
  const [shown, setShown] = useState(thumb ? N : step)
  const [jump, setJump] = useState(false)
  const [fading, setFading] = useState(false)
  const was = useRef({ active, step })
  const fwd = useRef(true)
  useLayoutEffect(() => {
    if (thumb) return
    const p = was.current
    was.current = { active, step }
    if (!active) return
    // arriving at the slide (from either side) or skipping steps: show the state, don't replay the flights
    if (!p.active || Math.abs(step - p.step) > 1) {
      setShown(step); setFading(false); setJump(true); twice(() => setJump(false))
      return
    }
    if (step === p.step) return
    fwd.current = step > p.step
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFading(true)
      const t = setTimeout(() => { setShown(step); setFading(false) }, 300)
      return () => clearTimeout(t)
    }
    setShown(step)
  }, [active, step, thumb])

  const at = thumb ? N : shown
  return (
    <div className="iters">
      <R d={0} className="k">07 · Previous iterations</R>
      <R d={1} as="h2" className="h">Where it started.</R>
      <div ref={row} className={`iter-row is-focus ${jump || thumb ? 'is-jump' : ''} ${fading ? 'is-fading' : ''}`}>
        {ITERS.map((x, k) => {
          const state = k < at ? 'slot' : k === at ? 'big' : 'wait'
          const t = g?.[k]
          return (
            <R key={x.src} d={2} as="figure" className={`iter is-${state} ${state === 'slot' && at < N ? 'is-dim' : ''}`}
              style={{ '--d': 2, '--wait': state === 'big' && fwd.current ? '150ms' : '0ms' }}>
              <div className="iter-frame" style={{ transform: state === 'slot' || !t ? 'none' : t.frame[state] }}><img src={x.src} alt={x.alt} /></div>
              <figcaption style={{ transform: state === 'slot' || !t ? 'none' : t.cap[state] }}><b>{x.t}</b><span>{x.c}</span></figcaption>
            </R>
          )
        })}
      </div>
    </div>
  )
}
const Iterations = ITER_MODE === 'focus' ? IterationsFocus : IterationsRow

/* ---------- 06 · At her bedside: the product, live ---------- */
const CHAPTERS = [
  { id: 'born', name: 'Mila is born', note: 'Her first star, as big as she is.', p: ['connection'] },
  { id: 'story', name: 'Her story begins', note: 'What’s on her, one thing at a time.', p: ['comprehension'] },
  { id: 'day', name: 'A day', note: 'Today as an arc; terms explained; what’s ahead.', p: ['comprehension', 'awareness'] },
  { id: 'sky', name: 'Her sky', note: 'Today becomes a star in her sky.', p: ['connection', 'awareness'] },
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
            : <iframe ref={frame} title="Constellate bedside display" src="./prototype/index.html?embed=1&chapter=day" />}
        </div>
        <i className="ipad-cam" aria-hidden="true" />
      </R>
    </div>
  )
}

/* ---------- Close: back to where we started ---------- */
// Niko again, going home: the photo, then it slides aside for a parent's words
function Both({ step }) {
  return (
    <div className={`center home is-s${step}`}>
      <R d={0} as="h2" className="h home-h">11 months later, we join</R>
      <div className="home-row">
        <R d={2} className="home-cell">
          <div className="home-photo">
            <Shot src="./shots/niko%20discharge.jpg" pan={false} alt="Niko, now a chubby, smiling baby, sits up wearing a black graduation cap and gown with a bow tie, a few lines still attached, under the caption “…on Niko’s journey home.”" />
          </div>
        </R>
        <div className="home-quote">
          <p className="statement-p">“There are going to be peaks and valleys… But that doesn’t mean you’re moving backward. You are still moving forward, even if you feel stuck.”</p>
          <p className="hook-who">Lauren, Niko&apos;s mom</p>
        </div>
      </div>
    </div>
  )
}
/* ---------- v2: Niko's NICU journey, as it happened ---------- */
// Niko's real story, from his family's public fundraiser and our interview with his mom, Lauren. Only what we
// know: anything we haven't confirmed with Lauren stays out. Quotes are Lauren's, from our interview with her.
const JOURNEY = [
  { when: 'Nov 14, 2025', title: 'An emergency birth', felt: 'Lauren underwent an emergency surgery, and Niko was taken to the NICU immediately.', p: 'connection', img: './shots/niko-1.webp', what: 'Lauren has an emergency C-section. Niko arrives a little over two months early.', q: 'I didn’t have the luxury of having my baby right away and putting him on my chest.', who: 'Lauren, Niko’s mom' },
  { when: 'The first days', title: 'Two hospitals', felt: 'Recovering from surgery in one place, while her newborn is cared for in another, and feeling guilty for not being there.', p: 'connection', img: './shots/niko-2.webp', what: 'Niko is born at one hospital, but his care is in another hospital’s NICU. From the start, his family’s life moves there.', q: 'They’re hooked up to leads, they’re hooked up to pulse ox… ensuring that these itty-bitty babies are gonna survive.', who: 'Lauren, Niko’s mom' },
  { when: 'His diagnoses', title: 'A new language', felt: 'Complex conditions, explained in words they’d never heard, while they were exhausted and scared.', p: 'comprehension', img: './shots/niko-3.webp', what: 'Niko has Tetralogy of Fallot, a rare heart condition, and esophageal atresia: his esophagus isn’t connected to his stomach. Two conditions, two specialist teams.', q: 'Medical terminology is a new language. Ask all the dumb questions, because it’s most important to understand your child’s care.', who: 'Lauren, Niko’s mom' },
  { when: 'Every day', title: 'Round-the-clock care', felt: 'Long days and nights at his bedside, until the hours blur together, and it’s hard to tell if he’s making any progress.', p: 'awareness', img: './shots/niko-4.webp', what: 'Life is centered on the NICU. Scott and Lauren take time away from work to be by his side, day after day.', q: 'How is it already 6 p.m.? How is it already time for the shift change? You have no sense of time at all.', who: 'Lauren, Niko’s mom' },
  { when: 'Outside the unit', title: 'The weight of it all', felt: 'Bills, work and insurance, and every hour they can’t be with him.', p: 'awareness', img: './shots/niko-5.webp', what: 'Daily costs, and the worry of keeping their health insurance, follow them home. They can’t always be at his bedside.', q: 'Where the mom and dad are having to work full-time… the NICU experience itself would be almost impossible.', who: 'Lauren, Niko’s mom' },
]
function Journey({ step = 0 }) {
  // like a page in a picture book: the drawing whole, framed, on the right; the words on the left; the timeline below
  const i = Math.min(step, JOURNEY.length - 1), m = JOURNEY[i]
  return (
    <div className="nj">
      <div className="nj-page">
        <div className="nj-text" key={`t${i}`}>
          <span className="nj-k">Niko&apos;s NICU journey</span>
          <h2 className="nj-title">{m.title}</h2>
          {m.felt && <p className="nj-felt">{m.felt}</p>}
          {m.q && <blockquote className="nj-q"><p>&ldquo;{m.q}&rdquo;</p><cite>{m.who}</cite></blockquote>}
        </div>
        <figure className="nj-art">
          {JOURNEY.map((x, k) => <img key={x.img} className={k === i ? 'is-on' : ''} src={x.img} alt="" />)}
        </figure>
      </div>
      <ol className="nj-line" aria-hidden="true">
        {JOURNEY.map((x, k) => <li key={x.title} className={k === i ? 'is-on' : k < i ? 'is-past' : ''}><i /><span>{x.title}</span></li>)}
      </ol>
    </div>
  )
}
const TAGS = { connection: 'Connection', comprehension: 'Comprehension', awareness: 'Awareness' }

/* ---------- v2: the needs, as the questions parents actually ask ---------- */
const QUESTIONS = [
  ['What happened while I was away?', 'Ask whoever is on shift, check medical charts', 'connection'],
  ['What does that word mean?', 'Google it later, ask a nurse, or stay confused', 'comprehension'],
  ['What’s next in her care plan?', 'Wait, remember from morning rounds, or miss them', 'awareness'],
  ['Who is caring for her?', 'Check the nurse note after the shift, try to remember names and roles during rounds', 'awareness'],
  ['Is she getting better?', 'Piece it together from memory and staggered communication', 'connection'],
]
function Questions() {
  return (
    <div className="qs">
      <R d={0} className="k">What parents are really asking</R>
      <div className="qs-table" role="table">
        <R d={1} className="qs-row is-head" role="row"><span role="columnheader">Parents ask</span><span role="columnheader">Today, they…</span></R>
        {QUESTIONS.map(([q, now, p], k) => (
          <R key={q} d={2 + k} className="qs-row" role="row">
            <span role="cell" className="qs-q"><Icon name={p} size={24} color={PILLARS[p].color} />{q}</span><span role="cell" className="qs-now">{now}</span>
          </R>
        ))}
      </div>
    </div>
  )
}

/* ---------- v2: the star idea, before the film, on the product's own screens ---------- */
// Three builds over the live prototype (see DemoPad): her first star on Day 1; today's star forming and joining
// her sky, each week a constellation; one week opened, where her firsts are planets.
const STAR_SHOW = ['first', 'sky', 'week']
const STAR_WORDS = [
  ['Every day becomes a star.', 'Shaped by what her nurses already chart.'],
  ['Every week, a constellation.', 'Her whole stay, at a glance.'],
  ['Her firsts are planets.', 'First touch, first hold, first bottle.'],
]
function Stars({ step = 0, active, thumb }) {
  // full screen: the live prototype fills the frame, one big line per build
  const frame = useRef(null), [ready, setReady] = useState(false)
  const n = Math.min(step, 2)
  useEffect(() => { if (active && ready) frame.current?.contentWindow?.postMessage({ type: 'mila:show', what: STAR_SHOW[n] }, '*') }, [active, ready, n])
  return (
    <div className="scf">
      {!thumb && <iframe ref={frame} title="Constellate, her stars" src="./prototype/index.html?embed=1&chapter=born" onLoad={() => setTimeout(() => setReady(true), 300)} tabIndex={-1} />}
      <div className="scf-shade" aria-hidden="true" />
      <div className="scf-words" key={n}>
        <span className="scf-k">How Constellate shows progress</span>
        <h2>{STAR_WORDS[n][0]}</h2>
        <p>{STAR_WORDS[n][1]}</p>
      </div>
    </div>
  )
}

/* ---------- v2: each question, and what answers it (a map for the film that follows) ---------- */
// The same questions as the pillars slide, each led by a line straight into the feature that answers it.
const GLANCE = [
  ['connection', [
    ['How can I feel close to her before I can hold her?', 'Her first screen', 'Her name, and how small she is, before any numbers.'],
    ['What happened while I was away?', 'Her day', 'Hour by hour, from notes her nurses already write.'],
  ]],
  ['comprehension', [
    ['What is all of this on her?', 'What’s on her', 'Each device on her body, one plain sentence at a time.'],
    ['What does that word mean?', 'Words in a tap', 'Warm words first. One tap for the real term, shown on her.'],
  ]],
  ['awareness', [
    ['What’s next, and who is caring for her tonight?', 'What’s ahead', 'Her week, where you fit in, and her care team.'],
    ['How is she doing right now?', 'Night view', 'The time, her next care, and one quiet line.'],
  ]],
]
function Glance({ step = 0 }) {
  // one problem → solution pair per build; the live screen for that solution sits on the right (see DemoPad)
  let n = 0
  return (
    <div className="gl">
      <R d={0} className="k">Every problem, and what we built for it</R>
      <div className="gl-rows">
        {GLANCE.map(([p, pairs]) => (
          <section key={p} className={`gl-row is-${p}`}>
            <span className="gl-pillar"><Icon name={p} size={16} color={PILLARS[p].color} />{PILLARS[p].name}</span>
            {pairs.map(([q, name, how]) => {
              const k = n++
              return (
                <div key={q} className={`gl-pair ${k === step ? 'is-on' : k < step ? 'is-past' : ''}`}>
                  <p className="gl-q">&ldquo;{q}&rdquo;</p>
                  <i className="gl-arrow" aria-hidden="true" />
                  <p className="gl-a"><b>{name}</b>{how}</p>
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}

// after the competitive analysis, what it showed, in the pillar slides' design
function Gap() {
  return (
    <div className="center pa is-gap">
      <R d={0} className="pa-k"><Icon name="star" size={22} color="var(--cream)" />The gap<span>What we found</span></R>
      <R d={1} as="p" className="pa-q">Every NICU tool shows parents data, but none tell their baby’s story in a way that speaks to how parents feel.</R>
    </div>
  )
}

/* ---------- v2: Mila, our persona, before the film ---------- */
function Mila() {
  return (
    <div className="center mila">
      <R d={0} className="k">Meet Mila</R>
      <R d={1} as="h2" className="mila-h">Mila is born thirteen weeks early, at 880 grams.</R>
      <R d={2} as="p" className="mila-p">Her dad is first at her bedside. Her mom is recovering from a C-section, and won&apos;t meet her for days.</R>
      <R d={4} as="p" className="mila-note">Mila isn&apos;t a real baby. She&apos;s built from Niko&apos;s story and the other families we heard from, so we can show a whole NICU stay, the hard parts too.</R>
    </div>
  )
}

/* ---------- v2: after the film, the six features as one constellation ---------- */
const RECAP = [
  ['First screen', 'connection', [150, 250]], ['Their day', 'connection', [300, 160]], ['What’s on them', 'comprehension', [460, 230]],
  ['Words in a tap', 'comprehension', [610, 130]], ['What’s ahead', 'awareness', [760, 210]], ['Their stars', 'connection', [900, 120]],
]
// Sara's six answers, as a line of six stars
function SixStars() {
  return (
    <svg className="rc-art" viewBox="80 60 900 260" aria-hidden="true">
      <polyline className="rc-line" points={RECAP.map(([, , p]) => p.join(',')).join(' ')} />
      {RECAP.map(([name, p, [x, y]], k) => (
        <g key={name} className="rc-pt" style={{ '--k': k }} transform={`translate(${x} ${y})`}>
          <circle r="22" className={`rc-glow is-${p}`} />
          <path className="rc-star" d="M0 -11Q1.6 -1.6 11 0Q1.6 1.6 0 11Q-1.6 1.6 -11 0Q-1.6 -1.6 0 -11Z" />
          <text y="44" className="rc-name">{name}</text>
        </g>
      ))}
    </svg>
  )
}

/* ---------- The closing: five slides after the film ---------- */
// 1 and 2 are the drawn story (her days as a constellation; then charts, numbers and alarms crowding it);
// each plays from the start when its slide comes on.
const ClosingDrawn = (stage) => function ClosingDrawnSlide({ active }) { return <div className="cl cl-drawn">{active && <Finale stage={stage} />}</div> }
// 3: what parents get, Sara's six answers
function ClosingAnswers() {
  return (
    <div className="center cl cl-answers">
      <R d={0} as="h2" className="cl-h">Constellate turns it into answers, right at the bedside.</R>
      <R d={1}><SixStars /></R>
    </div>
  )
}
// 4: her sky, as the product draws it (the prototype, showing only her sky)
function ClosingSky({ active }) {
  return (
    <div className="cl cl-sky">
      {active && <iframe className="cl-sky-art" title="" tabIndex={-1} aria-hidden="true" src="./prototype/index.html?embed=1&art=1" />}
      <R d={1} as="h2" className="cl-h">And keeps every day of it.</R>
    </div>
  )
}
// 5: the name, as big as on the title slide
function ClosingName({ active }) {
  return (
    <div className="center title cl-name">
      <R d={0} as="h1" className="title-h"><Wordmark intro={active} /></R>
      <R d={1} as="p" className="title-sub">Every baby’s story, one day at a time.</R>
      <R d={3} className="close-thanks">Thank you</R>
      <R d={4} className="title-team">Jayden · Nimesh · Sara</R>
    </div>
  )
}

/* ---------- v2: what Constellate is, beside the product itself ---------- */
const CONCEPT = [
  ['Every day becomes a star.', 'Shaped by what nurses already chart: the care, the changes, the moments family was there.',
    'A story, not a chart', 'Parents live their baby’s stay as moments, not numbers.', null],
  ['Every week, a constellation.', 'The whole stay at a glance, so the days stop blurring together.',
    'No harsh metrics', 'Nothing ranks a baby or compares them to anyone.', ['Not all babies start out the same way.', 'Former PICU parent']],
  ['Firsts are planets.', 'First touch, first hold, first bottle. The hard days stay too: stars never disappear.',
    'Moments to cherish', 'Kept for good, whatever happens.', ['They’re celebrating those little milestones that are actually a really big deal.', 'Lauren, Niko’s mom']],
]
function Overview({ step = 0 }) {
  // what it is, built a step at a time while the idea forms on the live screen beside it (the why is on the concepts slide)
  return (
    <div className="ov">
      <R d={0} className="k">Constellate</R>
      <R d={1} as="h2" className="ov-h">A bedside screen that turns a baby’s chart into <L>something parents can follow</L>.</R>
      <ol className="ov-steps">
        {CONCEPT.map(([t, d], k) => (
          <li key={t} className={k === step ? 'is-on' : k < step ? 'is-past' : ''}>
            <i aria-hidden="true" /><b>{t}</b><span>{d}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ---------- v2: in their words, one voice at a time, before we name what we found ---------- */
const VOICES = [
  ['We felt so whiplashed, because we would be told one thing by one team. And then the next day it would be completely different.', 'Lauren, Niko’s mom'],
  ['The hospital is like an elaborate game of telephone.', 'Lauren, Niko’s mom'],
  ['We tell them everything, but sometimes it’s too much. They don’t understand.', 'Retired NICU nurse, 35 years'],
]
function Voices() {
  return (
    <div className="vo2">
      <R d={0} className="k">In their words</R>
      <div className="vo2-grid">
        {VOICES.map(([q, who], k) => (
          <R key={q} d={1 + k * 2} as="blockquote" className={`vo2-q ${k === 0 ? 'is-lead' : ''}`}><p>&ldquo;{q}&rdquo;</p><cite>{who}</cite></R>
        ))}
      </div>
    </div>
  )
}

/* ---------- v2: the solution's cover ---------- */
function SolutionCover({ active }) {
  return (
    <div className="center title">
      <R d={0} className="title-k">Solution</R>
      <R d={1} as="h1" className="title-h"><Wordmark intro={active} /></R>
      <R d={2} as="p" className="title-sub">A baby’s care, made something parents can follow.</R>
    </div>
  )
}

/* ---------- v2: why constellations: the decision behind the idea ---------- */
const WHY_STARS = [
  ['A story, not a chart.', 'Parents live their baby’s stay as moments, not numbers. Stars gather those moments into something they can follow and remember.', null],
  ['No harsh metrics.', 'Nothing ranks a baby, or compares them to anyone. A star is shaped by their own days, never by a percentile.', ['Not all babies start out the same way, or go through the same things.', 'Former PICU parent']],
  ['Moments to cherish.', 'Firsts become planets, worth celebrating. And stars never disappear, so the sky holds whatever ending a family faces.', ['They’re celebrating those little milestones that are actually a really big deal.', 'Lauren, Niko’s mom']],
]
function WhyStars() {
  return (
    <div className="ws">
      <R d={0} className="k">Why constellations</R>
      <div className="ws-grid">
        {WHY_STARS.map(([t, d, q], k) => (
          <R key={t} d={1 + k * 2} className="ws-col">
            <StarGlyph size={20} color="#FFF8E6" />
            <h3>{t}</h3>
            <p>{d}</p>
            {q && <blockquote><p>&ldquo;{q[0]}&rdquo;</p><cite>{q[1]}</cite></blockquote>}
          </R>
        ))}
      </div>
    </div>
  )
}

/* ---------- v2: the concepts we explored, sketched, and why constellations won ---------- */
// Sketches are drawn by hand, like the modality sketches: a rough pen line that draws itself in. Three builds: the options; why each fell short; the one we chose.
const SK = { className: 'sk' }
const CONCEPTS = [
  { name: 'Growth chart', no: 'Ranks and compares. A hard week looks like failure.', art: (
    <g {...SK}><path d="M20 90 V18 M20 90 H150" /><path d="M24 80 C 50 76, 64 60, 82 62 S 112 40, 146 30" /><path d="M24 70 C 60 62, 90 44, 146 20" className="sk is-ray" /><path d="M24 88 C 60 84, 92 70, 146 52" className="sk is-ray" /></g>) },
  { name: 'Garden', no: 'Growth isn’t a straight line, and a wilting plant on a hard day hurts.', art: (
    <g {...SK}><path d="M60 92 H110 L104 70 H66 Z" /><path d="M85 70 C 84 54, 88 40, 86 22" /><path d="M86 48 C 70 44, 64 34, 66 26 C 78 28, 86 36, 86 48 Z" /><path d="M86 38 C 100 30, 112 32, 114 24 C 104 20, 92 26, 86 38 Z" /></g>) },
  { name: 'Road home', no: 'Assumes a destination. Not every baby goes home.', art: (
    <g {...SK}><path d="M18 92 C 50 86, 40 64, 72 60 S 104 44, 120 36" /><path d="M30 94 C 64 88, 56 68, 84 64 S 114 50, 128 42" className="sk is-ray" /><path d="M126 34 V18 L138 10 L150 18 V34 Z" /><circle cx="48" cy="80" r="3" /><circle cx="92" cy="54" r="3" /></g>) },
  { name: 'Journal', no: 'Heavy to read at 3 a.m., and more writing for nurses.', art: (
    <g {...SK}><path d="M24 24 C 46 18, 66 22, 84 30 C 102 22, 122 18, 144 24 V88 C 122 82, 102 86, 84 92 C 66 86, 46 82, 24 88 Z" /><path d="M84 30 V92" /><path d="M36 40 H70 M36 52 H72 M36 64 H66 M98 40 H132 M98 52 H128 M98 64 H130" opacity=".6" /></g>) },
  { name: 'Constellations', chosen: true, art: (
    <g><path {...SK} d="M24 78 L52 50 L80 62 L108 30 L140 44" />
      {[[24, 78], [52, 50], [80, 62], [140, 44]].map(([x, y]) => <path key={x} d={`M${x} ${y - 7}Q${x + 1} ${y - 1} ${x + 7} ${y}Q${x + 1} ${y + 1} ${x} ${y + 7}Q${x - 1} ${y + 1} ${x - 7} ${y}Q${x - 1} ${y - 1} ${x} ${y - 7}Z`} className="sk is-star" />)}
      <g transform="translate(108 30)"><ellipse className="sk is-hand" rx="12" ry="4" transform="rotate(-18)" /><circle className="sk is-star" r="5.5" /></g></g>) },
]
const CHOSEN_WHY = ['A story, not a chart', 'No ranking, no percentiles', 'Firsts kept as planets', 'Holds every ending', 'Dark by nature, for a light-sensitive NICU']
function Concepts({ step = 0 }) {
  return (
    <div className={`cx is-s${step}`}>
      <R d={0} className="k">Concepts we explored</R>
      <div className="cx-row">
        {CONCEPTS.map((c, k) => (
          <R key={c.name} d={1 + k} className={`cx-card ${c.chosen ? 'is-chosen' : ''}`}>
            <svg className="sketch cx-sketch" viewBox="0 0 168 104" aria-hidden="true" style={{ '--d': k * 5 }}>
              <defs><filter id={`rough-cx${k}`}><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed={k + 3} /><feDisplacementMap in="SourceGraphic" scale="2.6" /></filter></defs>
              <g filter={`url(#rough-cx${k})`}>{c.art}</g>
            </svg>
            <b>{c.name}</b>
            {c.chosen
              ? <ul className="cx-why">{CHOSEN_WHY.map((w) => <li key={w}>{w}</li>)}</ul>
              : <p className="cx-no">{c.no}</p>}
          </R>
        ))}
      </div>
    </div>
  )
}

export const SLIDES = [
  { id: 'title', section: 'Constellate', planet: true, View: Title },
  { id: 'niko', section: 'Niko', View: Niko },
  { id: 'nicu', section: 'The NICU', planet: true, View: define({ k: 'The NICU', word: 'Neonatal Intensive Care Unit', say: '“nick-you”', children: <>The hospital unit where babies born too early or too sick are cared for, <L>often for weeks or months</L>.</> }) },
  { id: 'journey', section: '01 · Niko’s journey', planet: true, steps: JOURNEY.length, View: Journey },
  { id: 'asked', section: '02 · Research', planet: true, steps: 3, View: Asked },
  { id: 'voices', section: '02 · Research', View: Voices },
  { id: 'heard', section: '02 · Research', View: Heard },
  { id: 'wall', section: '02 · Research', View: Wall },
  { id: 'pillars', section: '03 · The problem', planet: true, tint: 'all', steps: 6, View: Pillars },
  { id: 'compete', section: '03 · The problem', tint: 'all', View: Compete },
  { id: 'gap', section: '03 · The problem', tint: 'all', View: Gap },
  { id: 'hmw', section: '03 · The problem', tint: 'all', steps: 4, View: HMW },
  { id: 'brainstorm', section: '03 · Ideation', planet: true, steps: 2, View: Ideation },
  { id: 'concepts', section: '03 · Concepts', steps: 3, View: Concepts },
  { id: 'mom', section: '04 · Modality', planet: true, View: Mom },
  { id: 'modality', section: '04 · Modality', View: Modality },
  { id: 'k-open', section: '04 · Constraints', View: KOpen },
  { id: 'constraints', section: '04 · Constraints', steps: CONSTRAINT_STEPS, View: Constraints },
  { id: 'insight', section: '05 · The insight', View: statement({ k: 'The insight', big: true, children: <>Everything parents need is <L>already in their baby’s chart</L>. It just never reaches them in a form they can use.</> }) },
  { id: 'solution', section: '06 · Constellate', planet: true, View: SolutionCover },
  { id: 'overview', section: '06 · Constellate', steps: 3, feature: ['sky', 'openWeek', 'day6'], padSide: true, View: Overview },
  { id: 'demo', section: '07 · One stay, question by question', planet: true, bare: true, View: DemoFilm },
  { id: 'c-story', section: '08 · Closing', planet: true, View: ClosingDrawn(1) },
  { id: 'c-lost', section: '08 · Closing', View: ClosingDrawn(2) },
  { id: 'c-answers', section: '08 · Closing', View: ClosingAnswers },
  { id: 'c-keep', section: '08 · Closing', View: ClosingSky },
  { id: 'c-name', section: 'Constellate', View: ClosingName },
]

