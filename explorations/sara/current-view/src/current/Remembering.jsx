import { useEffect, useMemo, useState } from 'react'
import { stay } from '../data/days.js'
import { DEFS, WEEKS, SkyDepth, dayStar, daysOf, pos } from './Galaxy.jsx'

// If she doesn't go home: her story, kept. Opened only when the family chooses, from the quiet screen.
// Told like going home (Sara's discharge view): her sky fills in as her life is retold, each moment lighting
// its day's star, in the same type, bottom left. Unlike going home, nothing plays by itself and nothing
// becomes an object to take away: the family turns each page (a tap anywhere, or "Continue"), and can stay
// on a moment as long as they need. A few moments, each with a real detail, one of them hard. It ends on
// everything at once: her whole sky, who she was, her moments, and the people who loved her.
const STORY = [
  { d: 1, k: 'Day 1', title: 'Mila', text: 'She arrived at 3:42 in the morning, about the weight of a small pineapple. Priya was with her from her first minute.',
    facts: [['Born at', '3:42 a.m.'], ['Weight', '880 g']] },
  { d: 4, k: 'Day 4', title: 'Your touch', text: 'Through the portholes, you cupped her head and her feet. She stayed still and calm under your hands.' },
  { d: 6, k: 'Day 6', title: 'In your arms', text: 'Priya helped lift her onto your chest. She stayed there for forty minutes, warm, and her breathing settled.' },
  { d: 14, k: 'Day 14', title: 'Her first bottle', text: 'She took a few small sips, then rested. Her nurse wrote that she worked hard at it.' },
  { d: 17, k: 'Day 17', title: 'A hard night', text: 'Her breathing needed more help, and her team stayed close. She came through it, and so did you.' },
  { d: 23, k: 'Day 23', title: 'Her own clothes', text: 'Her nurse dressed her in the soft sleepsuit you brought from home. She slept in it all afternoon.' },
]
const WHO = [
  "She calmed to Dad's voice.",
  'She settled when her hands were near her face.',
  'On your chest, she was calm and steady.',
]

export function Remembering({ theme }) {
  const c = theme === 'confetti'
  const [step, setStep] = useState(0) // a moment of her story; past the last, everything at once
  const [lit, setLit] = useState(null) // at the end: the moment a finger is on
  const end = step >= STORY.length
  const upTo = end ? stay.today : STORY[step].d // her sky, filled in up to this day
  const here = end ? lit : STORY[step].d
  const go = () => setStep((s) => Math.min(s + 1, STORY.length))
  // TODO: saving her sky for the family. A placeholder until it's designed.
  const onSaveSky = () => {}
  useEffect(() => {
    const key = (e) => { if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go() } }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  // the drawings, once per style; which stars show is decided by upTo
  const art = useMemo(() => {
    const stars = stay.days.map((d) => { const [x, y] = pos(d.d); return { d: d.d, w: d.week, html: dayStar(theme, d, x, y, 1, true) } })
    const pts = stay.days.map((d) => pos(d.d))
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), pad = 70
    const box = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2]
    return { stars, box }
  }, [theme])
  const at = here && pos(here)

  return (
    <div className={`rem is-${theme} ${end ? 'is-end' : 'is-story'}`} onClick={end ? undefined : go}>
      <SkyDepth theme={theme} />
      <svg className="rem-sky" viewBox={art.box.join(' ')} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Her sky: each day of her life as a star, gathered into her weeks">
        <g dangerouslySetInnerHTML={{ __html: DEFS }} />
        {Array.from({ length: WEEKS }, (_, i) => {
          const ds = daysOf(i + 1).filter((d) => d.d <= upTo)
          return ds.length > 1 && <polyline key={i} className="rem-line" points={ds.map((d) => pos(d.d).join(',')).join(' ')} fill="none"
            stroke={c ? '#7cc0ff' : '#f3e3b5'} strokeWidth={c ? 3 : 1.2} strokeLinecap="round" strokeLinejoin="round" opacity={c ? 0.5 : 0.3} />
        })}
        {art.stars.filter((s) => s.d <= upTo).map((s) => <g key={s.d} className="rem-star" dangerouslySetInnerHTML={{ __html: s.html }} />)}
        {at && <circle key={here} className="rem-halo" cx={at[0]} cy={at[1]} r="34" fill="none" stroke={c ? '#ffd23f' : '#f3e3b5'} strokeWidth="1.5" />}
      </svg>

      {!end ? (
        <div className="cv-story rem-story" key={step} aria-live="polite">
          <span className="cv-story-k">{STORY[step].k}</span>
          <h3 className="cv-story-title">{STORY[step].title}</h3>
          <p className="cv-story-text">{STORY[step].text}</p>
          {STORY[step].facts && (
            <dl className="cv-story-facts">
              {STORY[step].facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          )}
          <div className="cv-story-foot">
            <span className="cv-story-dots" aria-hidden="true">
              {STORY.map((_, i) => <i key={i} className={i === step ? 'is-on' : i < step ? 'is-past' : ''} />)}
            </span>
            <button type="button" className="cv-story-ctl cv-story-continue" onClick={(e) => { e.stopPropagation(); go() }}>Continue</button>
          </div>
        </div>
      ) : (
        <div className="rem-words">
          <p className="rem-name">Mila</p>
          <section className="rem-sec">
            <span className="rem-k">Who she was</span>
            <ul className="rem-who">{WHO.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
          <section className="rem-sec">
            <span className="rem-k">Her story</span>
            <ul className="rem-did">
              {STORY.map((m) => (
                <li key={m.d}>
                  <button type="button" className={lit === m.d ? 'is-on' : ''} onClick={() => setLit(lit === m.d ? null : m.d)}>
                    <i aria-hidden="true" /><span>{m.k}</span>{m.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <div className="rem-end">
            <p className="rem-loved">Loved, every day.</p>
            <p className="rem-people">Mom and Dad, Priya, Marcus, and everyone who cared for her. Her sky is yours to keep.</p>
          </div>
        </div>
      )}
      {end && <button type="button" className="cv-story-ctl rem-again" onClick={() => { setLit(null); setStep(0) }}>From the beginning</button>}
      {end && <button type="button" className="cv-btn is-quiet cv-cta rem-cta" onClick={onSaveSky}>Save Mila&apos;s sky</button>}
    </div>
  )
}
