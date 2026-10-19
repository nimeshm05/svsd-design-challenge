import { useRef, useState } from 'react'
import { StarGlyph } from './glyphs.jsx'

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

function Overview() {
  return (
    <div className="center overview">
      <R d={0} className="k">What we made</R>
      <R d={1} as="p" className="statement-p">A bedside display that turns a baby&apos;s NICU stay into <L>a story her parents can follow</L>.</R>
      <R d={3} className="ov-facts">
        <span><StarGlyph size={14} color="#F3E3B5" />Every day becomes a star</span>
        <span><Planet size={20} />Her firsts become planets</span>
        <span><i className="ov-line" />Her weeks become constellations</span>
      </R>
      <R d={5} className="title-team">For parents of very preterm babies on a long NICU stay · Jayden, Nimesh and Sara</R>
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
        <span><i className="dot is-parent" /><i className="dot is-parent" />2 parents</span>
        <span><i className="dot is-nurse" /><i className="dot is-nurse" />2 nurses</span>
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
        <span>Retired NICU nurse</span>
      </R>
      <R d={4} className="bubble is-parent">
        <p>&ldquo;The hospital is like an elaborate game of telephone.&rdquo;</p>
        <span>NICU parent</span>
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
            <span className="col-head"><StarGlyph size={18} color={PILLARS[x.p].color} />{PILLARS[x.p].name}</span>
            <p className="col-pain">{x.pain}</p>
            <figure className="q"><blockquote>&ldquo;{x.q}&rdquo;</blockquote></figure>
          </div>
        ))}
      </div>
    </div>
  )
}

function Problem() {
  return (
    <Statement k="Problem statement">
      Parents of long-stay NICU babies struggle to <L p="connection">bond with their baby</L>, <L p="comprehension">make sense of fragmented medical information</L>, and <L p="awareness">keep track of time and what&apos;s ahead</L>.
    </Statement>
  )
}

// the question builds one pillar at a time
function HMW({ step }) {
  const on = (n) => (step >= n ? 'is-in' : '')
  return (
    <div className="center statement hmw">
      <R d={0} className="k">How might we</R>
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

/* ---------- 03 · The idea ---------- */
function Idea() {
  return (
    <div className="center idea">
      <R d={0} className="k">03 · The idea</R>
      <div className="idea-star" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((k) => <i key={k} style={{ '--k': k }} />)}
        <StarGlyph size={58} color="#FFF8E6" />
      </div>
      <R d={6} as="p" className="statement-p is-big">Every day becomes <L>a star</L>.</R>
      <R d={8} as="p" className="statement-sub">A day&apos;s moments gather into one star. Her stay becomes a sky that only grows.</R>
    </div>
  )
}

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

// each pillar: first what we learned (a statement slide), then what we did about it
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
            <span role="cell" className="crow-who">{x.who}</span><span role="cell">{x.c}</span><span role="cell" className="crow-r">{x.r}</span>
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

/* ---------- 06 · At her bedside: the product, live ---------- */
const CHAPTERS = [
  { id: 'born', name: 'Mila is born', note: 'Her first star, as big as she is.', p: ['connection'] },
  { id: 'story', name: 'Her story begins', note: 'What’s on her, one thing at a time.', p: ['comprehension'] },
  { id: 'day', name: 'A day', note: 'Today as an arc; terms explained; what’s ahead.', p: ['comprehension', 'awareness'] },
  { id: 'sky', name: 'Her sky', note: 'Today becomes a star in Mila’s Sky.', p: ['connection', 'awareness'] },
  { id: 'home', name: 'Going home', note: 'Her sky becomes a mobile for home.', p: ['connection'] },
  { id: 'not', name: 'If she doesn’t go home', note: 'Her story, kept, at the family’s pace.', p: ['connection'] },
]
function Product() {
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
          <iframe ref={frame} title="Mila's Sky bedside display" src="./prototype/index.html?embed=1&chapter=day" />
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
  { id: 'overview', section: 'Overview', View: Overview },

  { id: 'r-open', section: '01 · Research', planet: true, View: statement({ k: '01 · Research', children: <>Research showed how the NICU affects babies, parents and nurses, <L>but not how parents make sense of it</L>.</> }) },
  { id: 'asked', section: '01 · Research', View: Asked },
  { id: 'heard', section: '01 · Research', View: Heard },
  { id: 'telephone', section: '01 · Research', View: Telephone },

  { id: 'p-open', section: '02 · The problem', planet: true, tint: 'all', View: statement({ k: '02 · The problem', big: true, children: <>Everything we heard came down to <L>three things</L>.</> }) },
  { id: 'pillars', section: '02 · The problem', tint: 'all', steps: 3, View: Pillars },
  { id: 'problem', section: '02 · The problem', tint: 'all', View: Problem },
  { id: 'hmw', section: '02 · The problem', tint: 'all', steps: 5, View: HMW },

  { id: 'idea', section: '03 · The idea', planet: true, View: Idea },
  { id: 'flow', section: '03 · The idea', tint: 'all', View: Flow },
  { id: 'c-learn', section: 'Connection', tint: 'connection', View: statement({ k: 'Connection · what we learned', children: <>Our first idea was &ldquo;take your star home.&rdquo; But <L p="connection">not every baby goes home</L>.</>, sub: <>&ldquo;Sometimes they don&apos;t.&rdquo;</> }) },
  { id: 'connection', section: 'Connection', tint: 'connection', View: Deep('connection') },
  { id: 'u-learn', section: 'Comprehension', tint: 'comprehension', View: statement({ k: 'Comprehension · what we learned', children: <>More records didn&apos;t mean more understanding. Parents <L p="comprehension">&ldquo;get obsessive over MyChart.&rdquo;</L></> }) },
  { id: 'comprehension', section: 'Comprehension', tint: 'comprehension', View: Deep('comprehension') },
  { id: 'a-learn', section: 'Awareness', tint: 'awareness', View: statement({ k: 'Awareness · what we learned', children: <>Parents told us they only notice time <L p="awareness">at shift change</L>.</> }) },
  { id: 'awareness', section: 'Awareness', tint: 'awareness', View: Deep('awareness') },

  { id: 'k-open', section: '04 · Constraints', planet: true, View: statement({ k: '04 · Constraints', children: <>Every bedside has <L>three people to protect</L>: the baby, the nurse, and the family.</> }) },
  { id: 'constraints', section: '04 · Constraints', View: Constraints },

  { id: 's-open', section: '05 · The story layer', planet: true, View: statement({ k: '05 · The story layer', children: <>Stars <L>never disappear</L>, because &ldquo;you are still moving forward even if you feel stuck.&rdquo;</> }) },
  { id: 'system', section: '05 · The story layer', View: System },

  { id: 'product', section: '06 · At her bedside', planet: true, View: Product },
  { id: 'both-close', section: 'Mila’s Sky', steps: 2, View: Both },
  { id: 'close', section: 'Mila’s Sky', View: Close },
]
