import { useEffect, useRef, useState } from 'react'
import { SLIDES } from './slides.jsx'
import { FEATURES } from './demo.jsx'
import { StarGlyph } from './glyphs.jsx'

// The control panel: the whole story at a glance, in its own window (open it from the deck, or ?panel=1).
// Every slide as a small, finished thumbnail with its number and a one-line label, grouped by chapter.
// It follows the deck: the slide being shown is outlined, and clicking a thumbnail moves the deck there.
const LABELS = {
  title: 'Title', niko: 'Meet Niko', hook: 'Hook: a parent’s quote', both: 'The tension: both things at once',
  nicu: 'What the NICU is', environment: 'Inside the NICU, in four senses', wall: 'Secondary research: our wall and finding',
  gap: 'The gap: how parents make sense of it', asked: 'So we listened: 4 interviews',
  heard: 'Parents get the pieces, left to put them together', telephone: 'Both sides of the conversation',
  'p-open': 'Our research pointed to three needs', pillars: 'The three pillars (builds)', problem: 'Problem statement', compete: 'Competitive analysis', hmw: 'Opportunity: how might we (builds)',
  principles: 'Each pain point became a principle', brainstorm: 'Brainstorm: ideas over our affinity map', sort: 'Ideas float to their principles', thread: 'What the ideas had in common',
  film: 'Concept film: day → star → sky → planets → her name', 's-open': 'Stars never disappear', system: 'The story layer: design system',
  'k-open': 'Three people at every bedside', constraints: 'Constraints table, then each one: before → after (builds)', mom: 'A tired mom in a hospital bed', modality: 'Touch, remote or gesture', iterations: 'Previous iterations: where it started',
  board: 'Storyboard: her stay, six moments',  'both-close': 'Niko goes home (builds)', 'every-day': 'Every day counts', close: 'Every star is hers to keep',
}
const FEAT_NAMES = { first: 'Her first star', walk: 'What’s on her', today: 'Her day, as an arc', term: 'Medical words in a tap', family: 'Moments you were there for', ahead: 'What’s ahead', night: 'Night view', sky: 'Every day becomes a star', home: 'Going home', not: 'If she doesn’t go home' }
FEATURES.forEach((f) => { LABELS[f.id] = `${f.k}: ${FEAT_NAMES[f.show]}` })
const W = 1440, H = 900, TW = 248

export function Panel() {
  const [at, setAt] = useState(null)
  const bc = useRef(null)
  useEffect(() => {
    document.title = 'Mila’s Sky · Story overview'
    const ch = new BroadcastChannel('mila-deck')
    bc.current = ch
    ch.onmessage = (e) => { if (e.data?.type === 'at') setAt(e.data.i) }
    ch.postMessage({ type: 'hello' })
    return () => ch.close()
  }, [])
  const go = (i) => { setAt(i); bc.current?.postMessage({ type: 'go', i }) }

  // chapters, in order, each with its slides
  const groups = []
  SLIDES.forEach((S, i) => {
    const g = groups.at(-1)
    if (g && g.section === S.section) g.items.push(i)
    else groups.push({ section: S.section, items: [i] })
  })

  return (
    <div className="panel">
      <header className="panel-top">
        <span className="deck-mark"><StarGlyph size={14} />Mila&apos;s Sky · story overview</span>
        <span className="panel-hint">{SLIDES.length} slides · click one to show it in the deck{at == null ? ' (open the deck in another window)' : ''}</span>
      </header>
      <div className="panel-flow">
      {groups.map((g, gi) => (
        <section key={gi} className="panel-group">
          <h2 className="panel-section">{g.section}</h2>
          <div className="panel-row">
            {g.items.map((i) => {
              const S = SLIDES[i]
              return (
                <button key={S.id} type="button" className={`thumb ${at === i ? 'is-at' : ''} tint-${S.tint ?? 'night'}`} onClick={() => go(i)} aria-label={`Slide ${i + 1}: ${LABELS[S.id] ?? S.id}`}>
                  <span className="thumb-frame" style={{ width: TW, height: TW * H / W }}>
                    <span className="thumb-canvas" style={{ width: W, height: H, transform: `scale(${TW / W})` }}>
                      <span className="thumb-sky" />
                      <section className={`slide slide-${S.id} is-on is-static is-step-${(S.steps ?? 1) - 1}`}>
                        <S.View active={false} step={(S.steps ?? 1) - 1} thumb />
                      </section>
                    </span>
                  </span>
                  <span className="thumb-label"><b>{String(i + 1).padStart(2, '0')}</b>{LABELS[S.id] ?? S.id}{S.steps > 1 && <em>{S.steps} steps</em>}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
      </div>
    </div>
  )
}
