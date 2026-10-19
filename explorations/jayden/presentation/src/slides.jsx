import { useRef, useState } from 'react'
import { StarGlyph } from './glyphs.jsx'

// The case study, slide by slide. Each slide: id, section (top right), tint (which pillar colors the sky),
// planet (a chapter's opening: a planet in the constellation along the bottom), and its View.
// Everything with className "rv" rises in when the slide arrives, in the order of its --d.
const R = ({ d = 0, as: T = 'div', className = '', children, ...p }) => <T className={`rv ${className}`} style={{ '--d': d }} {...p}>{children}</T>

const PILLARS = {
  connection: { name: 'Connection', color: 'var(--connection)' },
  comprehension: { name: 'Comprehension', color: 'var(--comprehension)' },
  awareness: { name: 'Awareness', color: 'var(--awareness)' },
}
const Pill = ({ p, children }) => <span className={`pill is-${p}`}>{children ?? PILLARS[p].name}</span>
const Q = ({ children, who }) => (
  <figure className="q">
    <blockquote>&ldquo;{children}&rdquo;</blockquote>
    {who && <figcaption>{who}</figcaption>}
  </figure>
)
const Planet = ({ size = 28, body = '#EFDCAA', ring = '#FFB38A' }) => (
  <svg className="glyph" viewBox="-16 -16 32 32" width={size} height={size} aria-hidden="true">
    <g transform="rotate(-18)">
      <ellipse rx="14" ry="4.2" fill="none" stroke={ring} strokeWidth="1.3" />
      <circle r="6.5" fill={body} />
    </g>
  </svg>
)

/* 1 · Title */
function Title() {
  return (
    <div className="center title">
      <R d={0} className="title-k">A NICU storytelling case study</R>
      <R d={1} as="h1" className="title-h">Mila&apos;s Sky</R>
      <R d={2} as="p" className="title-sub">A bedside display that turns a premature baby&apos;s care into a story her parents can follow. Every day becomes a star.</R>
      <R d={4} className="title-team">Jayden · Nimesh · Sara</R>
    </div>
  )
}

/* 2 · Hook */
const HOOK = 'Waking up every day and watching your child fight for their life… It’s this really terrible thing, but if you think about it, you are also celebrating.'
function Hook() {
  return (
    <div className="center hook">
      <blockquote className="hook-q">
        {HOOK.split(' ').map((w, k) => <span key={k} className="word" style={{ '--d': k }}>{k === 0 ? `“${w}` : k === HOOK.split(' ').length - 1 ? `${w}”` : w} </span>)}
      </blockquote>
      <R d={18} className="hook-who">NICU parent</R>
      <R d={22} as="p" className="hook-line">NICU parents live <em className="both">both</em> things at once, every day.</R>
    </div>
  )
}

/* 3 · Overview */
function Overview() {
  return (
    <div className="split overview">
      <div>
        <R d={0} className="k">Overview</R>
        <R d={1} as="h2" className="h">A baby&apos;s stay, told as her sky.</R>
      </div>
      <dl className="facts">
        <R d={2}><dt>Who it&apos;s for</dt><dd>Parents of very preterm babies (born before 32 weeks) on a long NICU stay.</dd></R>
        <R d={3}><dt>What it is</dt><dd>A screen at her bedside. Each day of her stay becomes a star; her firsts become planets; her weeks become constellations.</dd></R>
        <R d={4}><dt>What it does</dt><dd>Keeps parents in her story, explains her care in plain words, and shows what&apos;s happening now and what&apos;s ahead.</dd></R>
        <R d={5}><dt>Team</dt><dd>Jayden, Nimesh and Sara.</dd></R>
      </dl>
    </div>
  )
}

/* 4 · Research */
function Research() {
  return (
    <div className="research">
      <R d={0} className="k">Research</R>
      <div className="research-row">
        <R d={1} className="research-sec">
          <span className="research-tag">Secondary research</span>
          <p>Showed how the NICU affects babies, parents and nurses, <b>but not how parents make sense of it.</b></p>
        </R>
        <R d={3} className="research-arrow" aria-hidden="true"><span />So we asked them.</R>
        <R d={4} className="research-pri">
          <span className="research-tag">Primary research</span>
          <span className="research-n">4</span>
          <span className="research-nk">interviews</span>
          <span className="research-who"><i className="dot is-parent" /><i className="dot is-parent" /> 2 parents <i className="dot is-nurse" /><i className="dot is-nurse" /> 2 nurses</span>
        </R>
      </div>
    </div>
  )
}

/* 5 · Core finding */
function Finding() {
  return (
    <div className="center finding">
      <R d={0} className="k">Core finding</R>
      <R d={1} as="h2" className="finding-h">What&apos;s said isn&apos;t what&apos;s heard.</R>
      <R d={2} className="phone" aria-hidden="true">
        <svg viewBox="0 0 600 60" preserveAspectRatio="none">
          <path className="phone-line" d="M10 30 C 60 30, 90 30, 140 30 S 200 22, 240 32 S 300 18, 340 36 S 400 12, 440 40 S 500 8, 540 44 S 580 14, 590 30" />
          {[10, 150, 300, 450, 590].map((x, k) => <circle key={x} cx={x} cy={30} r={k === 0 ? 5 : 4} className={`phone-dot ${k === 0 ? 'is-from' : k === 4 ? 'is-to' : ''}`} />)}
        </svg>
        <span className="phone-from">Care team</span><span className="phone-to">Parent</span>
      </R>
      <div className="two">
        <R d={4}><Q who="Retired NICU nurse">We tell them everything, but sometimes it&apos;s too much, they don&apos;t understand.</Q></R>
        <R d={5}><Q who="NICU parent">The hospital is like an elaborate game of telephone.</Q></R>
      </div>
    </div>
  )
}

/* 6 · Three pillars */
const PAINS = [
  { p: 'connection', pain: 'Parents can’t bond the way they expected, and guilt fills the gap.', q: 'I didn’t have the luxury of having my baby right away and like putting him on my chest.' },
  { p: 'comprehension', pain: 'Parents have information, but not the whole picture.', q: '[Medical terminology] is a new language.' },
  { p: 'awareness', pain: 'Time disappears, and the next moment is a surprise.', q: 'In the ICU, time just like, it doesn’t exist. It’s just a mash of time.' },
]
function Pillars() {
  return (
    <div className="pillars">
      <R d={0} className="k">The three pillars</R>
      <R d={1} as="h2" className="h">Everything we heard, in three pain points.</R>
      <div className="cols">
        {PAINS.map((x, k) => (
          <R key={x.p} d={2 + k * 1.5} className={`col is-${x.p}`}>
            <span className="col-head"><StarGlyph size={18} color={PILLARS[x.p].color} />{PILLARS[x.p].name}</span>
            <p className="col-pain">{x.pain}</p>
            <Q>{x.q}</Q>
          </R>
        ))}
      </div>
    </div>
  )
}

/* 7 · Problem statement */
function Problem() {
  return (
    <div className="center statement">
      <R d={0} className="k">Problem statement</R>
      <R d={1} as="p" className="statement-p">
        Parents of long-stay NICU babies struggle to <mark className="is-connection">bond with their baby</mark>, <mark className="is-comprehension">make sense of fragmented medical information</mark>, and <mark className="is-awareness">keep track of time and what&apos;s ahead</mark>.
      </R>
    </div>
  )
}

/* 8 · How might we */
function HMW() {
  return (
    <div className="center statement hmw">
      <R d={0} className="k">How might we</R>
      <R d={1} as="p" className="statement-p">
        …turn a baby&apos;s care into a story that helps parents <mark className="is-connection">feel connected</mark>, <mark className="is-comprehension">understand what&apos;s happening</mark>, and <mark className="is-awareness">stay aware of what&apos;s ahead</mark>,
      </R>
      <R d={3} as="p" className="hmw-and">without adding to nurses&apos; workload?</R>
    </div>
  )
}

/* 9 · From pain point to feature */
const FLOW = [
  { p: 'connection', principle: 'Keep parents in their baby’s story, even when apart', feature: 'Mila’s Sky' },
  { p: 'comprehension', principle: 'Turn care into a story parents can follow', feature: 'Today screen and scheduled summary' },
  { p: 'awareness', principle: 'Show what’s happening now and what’s ahead', feature: 'Timeline and What’s Next' },
]
function Flow() {
  return (
    <div className="flow">
      <R d={0} className="k">Designing for each pillar</R>
      <R d={1} as="h2" className="h">Each pain point became a principle, and each principle shaped a feature.</R>
      <div className="flow-grid">
        <R d={2} className="flow-hd">Pain point</R><R d={2} className="flow-hd">Principle</R><R d={2} className="flow-hd">Feature</R>
        {FLOW.map((x, k) => [
          <R key={`${x.p}a`} d={3 + k} className={`flow-cell is-${x.p}`}><StarGlyph size={14} color={PILLARS[x.p].color} />{PILLARS[x.p].name}</R>,
          <R key={`${x.p}b`} d={3.4 + k} className="flow-cell is-principle">{x.principle}</R>,
          <R key={`${x.p}c`} d={3.8 + k} className={`flow-cell is-feature is-${x.p}`}>{x.feature}</R>,
        ])}
      </div>
    </div>
  )
}

/* 10–12 · Each pillar, in depth */
const DEEP = {
  connection: {
    principle: 'Keep parents in their baby’s story, even when apart.',
    decision: 'Milestones without points or streaks: the sky only grows.',
    before: 'Take your star home', after: 'Every star is yours to keep',
    why: <>because &ldquo;sometimes they don&apos;t&rdquo; survive.</>,
    feature: 'Mila’s Sky',
  },
  comprehension: {
    principle: 'Turn care into a story parents can follow.',
    decision: 'Balance completeness with simplicity: plain, warm language.',
    before: 'Raw records', after: 'A scheduled summary',
    why: <>because parents &ldquo;get obsessive over MyChart.&rdquo;</>,
    feature: 'Today screen and scheduled summary',
  },
  awareness: {
    principle: 'Show what’s happening now and what’s ahead.',
    decision: 'Time is visible on every screen: stay, week, day, hour.',
    before: 'Time only on request', after: 'A global clock',
    why: <>because parents said they only notice time at shift change.</>,
    feature: 'Timeline and What’s Next',
  },
}
const Deep = (p) => function DeepView() {
  const x = DEEP[p]
  return (
    <div className={`deep is-${p}`}>
      <div className="deep-left">
        <R d={0} className="deep-name"><StarGlyph size={22} color={PILLARS[p].color} />{PILLARS[p].name}</R>
        <R d={1} as="h2" className="deep-principle">{x.principle}</R>
        <R d={2} className="deep-feature"><span>Feature</span>{x.feature}</R>
      </div>
      <div className="deep-right">
        <R d={3} className="deep-block"><span className="deep-k">Key decision</span><p>{x.decision}</p></R>
        <R d={4} className="deep-block">
          <span className="deep-k">Iteration</span>
          <p className="deep-iter"><s>{x.before}</s><span className="deep-to" aria-label="became">→</span><b>{x.after}</b></p>
          <p className="deep-why">{x.why}</p>
        </R>
      </div>
    </div>
  )
}

/* 13 · Constraints */
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
      <R d={1} as="h2" className="h">Designing for everyone at the bedside.</R>
      <div className="ctable" role="table">
        <R d={2} className="crow is-head" role="row"><span role="columnheader">For</span><span role="columnheader">Constraint</span><span role="columnheader">Our response</span></R>
        {CONSTRAINTS.map((x, k) => (
          <R key={x.who} d={3 + k} className={`crow ${x.todo ? 'is-todo' : ''}`} role="row">
            <span role="cell" className="crow-who">{x.who}</span><span role="cell">{x.c}</span><span role="cell" className="crow-r">{x.r}</span>
          </R>
        ))}
      </div>
    </div>
  )
}

/* 14 · Design system: the story layer */
function System() {
  return (
    <div className="system">
      <R d={0} className="k">Design system · the story layer</R>
      <R d={1} as="h2" className="h">A language of stars.</R>
      <div className="cols">
        <R d={2} className="col sys">
          <svg className="sys-art sys-const" viewBox="0 0 200 110" aria-hidden="true">
            <polyline points="18,82 52,60 80,70 112,38 146,48 180,22" />
            {[[18, 82], [52, 60], [80, 70], [112, 38], [146, 48], [180, 22]].map(([x, y], k) => (
              <path key={k} style={{ '--k': k }} transform={`translate(${x} ${y})`} d="M0 -6Q.9 -.9 6 0Q.9 .9 0 6Q-.9 .9 -6 0Q-.9 -.9 0 -6Z" />
            ))}
          </svg>
          <span className="col-head">Constellation</span>
          <p>Shows progress and holds memory, whatever the outcome. Stars never disappear, because &ldquo;you are still moving forward even if you feel stuck.&rdquo;</p>
        </R>
        <R d={3} className="col sys">
          <div className="sys-art sys-pair" aria-hidden="true">
            <span><StarGlyph size={34} color="#F3E3B5" /><em>Everyday moments</em></span>
            <span><Planet size={46} /><em>Big moments</em></span>
          </div>
          <span className="col-head">Stars and planets</span>
          <p>Stars for everyday moments, planets for big ones, defined by parents: &ldquo;Yes, he pooped!… in its own way, it&apos;s beautiful.&rdquo;</p>
        </R>
        <R d={4} className="col sys">
          <div className="sys-art sys-name" aria-hidden="true">Mila&apos;s Sky</div>
          <span className="col-head">Naming and tone</span>
          <p>&ldquo;Mila&apos;s Sky&rdquo; makes it her story, not a chart: hopeful and reassuring.</p>
        </R>
      </div>
    </div>
  )
}

/* 15 · Product highlights: the bedside screen itself, live, in an iPad frame */
const CHAPTERS = [
  { id: 'born', name: 'Mila is born', note: 'Her first star, as big as she is.' },
  { id: 'story', name: 'Her story begins', note: 'What’s on her, one thing at a time.' },
  { id: 'day', name: 'A day', note: 'Today as an arc. Terms explained on tap.' },
  { id: 'sky', name: 'Her sky', note: 'Today becomes a star in Mila’s Sky.' },
  { id: 'home', name: 'Going home', note: 'Her sky becomes a mobile for home.' },
  { id: 'not', name: 'If she doesn’t go home', note: 'Her story, kept, at the family’s pace.' },
]
function Product({ active }) {
  const frame = useRef(null)
  const [ch, setCh] = useState('day')
  const pick = (id) => { setCh(id); frame.current?.contentWindow?.postMessage({ type: 'mila:chapter', chapter: id }, '*') }
  return (
    <div className="product">
      <div className="product-side">
        <R d={0} className="k">Product highlights</R>
        <R d={1} as="h2" className="h">At her bedside.</R>
        <ol className="chapters">
          {CHAPTERS.map((c, k) => (
            <R key={c.id} d={2 + k * 0.5} as="li">
              <button type="button" className={ch === c.id ? 'is-on' : ''} onClick={() => pick(c.id)}>
                <span className="ch-n">{k + 1}</span><span className="ch-name">{c.name}</span><span className="ch-note">{c.note}</span>
              </button>
            </R>
          ))}
        </ol>
      </div>
      <R d={1} className="ipad">
        <div className="ipad-screen">
          {active !== undefined && <iframe ref={frame} title="Mila's Sky bedside display" src="./prototype/index.html?embed=1&chapter=day" />}
        </div>
        <i className="ipad-cam" aria-hidden="true" />
      </R>
    </div>
  )
}

/* 16 · Close */
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
  { id: 'overview', section: 'Overview', planet: true, View: Overview },
  { id: 'research', section: 'Research', planet: true, View: Research },
  { id: 'finding', section: 'Research', View: Finding },
  { id: 'pillars', tint: 'all', section: 'The three pillars', planet: true, View: Pillars },
  { id: 'problem', tint: 'all', section: 'Problem statement', View: Problem },
  { id: 'hmw', tint: 'all', section: 'How might we', View: HMW },
  { id: 'flow', tint: 'all', section: 'Designing for each pillar', planet: true, View: Flow },
  { id: 'connection', section: 'Connection', tint: 'connection', View: Deep('connection') },
  { id: 'comprehension', section: 'Comprehension', tint: 'comprehension', View: Deep('comprehension') },
  { id: 'awareness', section: 'Awareness', tint: 'awareness', View: Deep('awareness') },
  { id: 'constraints', section: 'Constraints', planet: true, View: Constraints },
  { id: 'system', section: 'Design system', planet: true, View: System },
  { id: 'product', section: 'Product highlights', planet: true, View: Product },
  { id: 'close', section: 'Mila’s Sky', View: Close },
]
