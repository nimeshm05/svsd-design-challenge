import { useCallback, useEffect, useState } from 'react'
import { SLIDES } from './slides.jsx'
import { StarGlyph } from './glyphs.jsx'

// The case study as a website you present from. One slide at a time; → / space / click "Next" to go on.
// Behind every slide, the night sky drifts a little further with each step, its color warming to the
// pillar being told, and along the bottom her constellation grows: one star per slide, a planet for each
// chapter's opening. The story of the product, told in the product's own language.
const N = SLIDES.length
const fromHash = () => {
  const n = parseInt(window.location.hash.slice(1), 10)
  return Number.isFinite(n) ? Math.min(N - 1, Math.max(0, n - 1)) : 0
}

export function Deck() {
  const [i, setI] = useState(fromHash)
  const go = useCallback((n) => setI(Math.min(N - 1, Math.max(0, n))), [])
  useEffect(() => { window.history.replaceState(null, '', `#${i + 1}`) }, [i])
  useEffect(() => {
    const key = (e) => {
      if (e.target.closest?.('input, textarea')) return
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); setI((v) => Math.min(N - 1, v + 1)) }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); setI((v) => Math.max(0, v - 1)) }
      if (e.key === 'Home') setI(0)
      if (e.key === 'End') setI(N - 1)
    }
    const hash = () => setI(fromHash())
    window.addEventListener('keydown', key)
    window.addEventListener('hashchange', hash)
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('hashchange', hash) }
  }, [])

  const s = SLIDES[i]
  return (
    <div className={`deck tint-${s.tint ?? 'night'}`} style={{ '--i': i }}>
      <Sky />
      <header className="deck-top">
        <span className="deck-mark"><StarGlyph size={14} />Mila&apos;s Sky</span>
        <span className="deck-where"><span key={s.section} className="deck-section">{s.section}</span><span className="deck-count">{String(i + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span></span>
      </header>

      <main className="deck-stage">
        {SLIDES.map((S, k) => (
          <section key={S.id} className={`slide slide-${S.id} ${k === i ? 'is-on' : k < i ? 'is-past' : 'is-next'}`} aria-hidden={k !== i} inert={k !== i}>
            <S.View active={k === i} />
          </section>
        ))}
      </main>

      <footer className="deck-foot">
        <Progress i={i} go={go} />
        <span className="deck-arrows">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous slide">‹</button>
          <button type="button" onClick={() => go(i + 1)} disabled={i === N - 1} aria-label="Next slide">›</button>
        </span>
      </footer>
    </div>
  )
}

/* ---------- The sky behind everything ---------- */
function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="neb neb-night" />
      <div className="neb neb-connection" />
      <div className="neb neb-comprehension" />
      <div className="neb neb-awareness" />
      <div className="stars stars-far" />
      <div className="stars stars-mid" />
      <div className="stars stars-near" />
      <div className="shoot" />
    </div>
  )
}

/* ---------- Her constellation: one star per slide ---------- */
const PW = 520, PH = 54
const PTS = SLIDES.map((S, k) => {
  const x = 12 + (k / (N - 1)) * (PW - 24)
  const y = PH / 2 + Math.sin(k * 1.35) * 14 + Math.sin(k * 3.1) * 4
  return [x, y]
})
function Progress({ i, go }) {
  return (
    <nav className="prog" aria-label="Slides">
      <svg viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH}>
        <polyline className="prog-path" points={PTS.map((p) => p.join(',')).join(' ')} />
        <polyline className="prog-lit" points={PTS.slice(0, i + 1).map((p) => p.join(',')).join(' ')} />
        {PTS.map(([x, y], k) => {
          const planet = SLIDES[k].planet
          const state = k === i ? 'is-now' : k < i ? 'is-past' : 'is-ahead'
          return (
            <g key={k} className={`prog-pt ${state}`} transform={`translate(${x} ${y})`} onClick={() => go(k)}>
              <title>{SLIDES[k].section}</title>
              <circle r="11" className="prog-hit" />
              {k === i && <circle r="10" className="prog-glow" />}
              {planet
                ? <g transform="rotate(-18)"><ellipse rx="7.5" ry="2.3" className="prog-ring" /><circle r="3.4" className="prog-body" /></g>
                : <path d="M0 -5L1.2 -1.2L5 0L1.2 1.2L0 5L-1.2 1.2L-5 0L-1.2 -1.2Z" className="prog-star" />}
            </g>
          )
        })}
      </svg>
    </nav>
  )
}
