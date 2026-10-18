import { useMemo, useState } from 'react'
import { stay } from '../data/days.js'
import { DEFS, WEEKS, SkyDepth, dayStar, daysOf, pos } from './Galaxy.jsx'

// If she doesn't go home: her sky, kept. Opened only when the family chooses, from the quiet screen.
// Like going home (Sara's discharge view), her stars are the same as on Mila's stars; unlike it, nothing
// plays, nothing asks to be clicked through, and nothing turns into an object to take away. Her sky draws
// in slowly, then her, as a person: who she was and what she did in her life. Touching something she did
// lights its star. No day count; it ends on the people who loved her.
const WHO = [
  'She settled when her hands were near her face.',
  "She calmed to Dad's voice.",
  'She rested best with the cover over her incubator.',
  'On your chest, she was calm and steady.',
]
const DID = [
  { d: 1, text: 'Arrived, 880 grams, and began her story' },
  { d: 4, text: 'Felt your touch for the first time' },
  { d: 5, text: 'Breathed without the ventilator' },
  { d: 6, text: 'Was held, warm on your chest' },
  { d: 14, text: 'Took her first bottle' },
  { d: 17, text: 'Came through a hard night' },
  { d: 23, text: 'Wore the sleepsuit you brought from home' },
]

export function Remembering({ theme }) {
  const c = theme === 'confetti'
  const [lit, setLit] = useState(null)
  const sky = useMemo(() => {
    const pts = stay.days.map((d) => pos(d.d))
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), pad = 70
    const box = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2]
    let b = ''
    for (let w = 1; w <= WEEKS; w++) {
      const p = daysOf(w).map((d) => pos(d.d).map((v) => v.toFixed(1)).join(',')).join(' ')
      b += `<polyline class="rem-line" style="animation-delay:${(0.8 + w * 1.1).toFixed(1)}s" points="${p}" fill="none" stroke="${c ? '#7cc0ff' : '#f3e3b5'}" stroke-width="${c ? 3 : 1.2}" stroke-linecap="round" stroke-linejoin="round" opacity="${c ? 0.5 : 0.3}"/>`
    }
    stay.days.forEach((d) => {
      const [x, y] = pos(d.d)
      b += `<g class="rem-star" data-d="${d.d}" style="animation-delay:${(0.4 + (d.d / stay.days.length) * 4.6).toFixed(2)}s">${dayStar(theme, d, x, y, 1, true)}</g>`
    })
    return { box, html: `${DEFS}${b}` }
  }, [theme, c])
  const at = lit && pos(lit)
  return (
    <div className={`rem is-${theme}`}>
      <SkyDepth theme={theme} />
      <svg className="rem-sky" viewBox={sky.box.join(' ')} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Her sky: every day of her life as a star, gathered into her weeks">
        <g dangerouslySetInnerHTML={{ __html: sky.html }} />
        {at && <circle className="rem-halo" cx={at[0]} cy={at[1]} r="34" fill="none" stroke={c ? '#ffd23f' : '#f3e3b5'} strokeWidth="1.5" />}
      </svg>
      <div className="rem-words">
        <p className="rem-name">Mila</p>
        <p className="rem-sub">Every star is a day she was here.</p>
        <section className="rem-sec">
          <span className="rem-k">Who she was</span>
          <ul className="rem-who">{WHO.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
        <section className="rem-sec">
          <span className="rem-k">What she did</span>
          <ul className="rem-did">
            {DID.map((m) => (
              <li key={m.d}>
                <button type="button" className={lit === m.d ? 'is-on' : ''} onClick={() => setLit(lit === m.d ? null : m.d)}>
                  <i aria-hidden="true" />{m.text}
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
    </div>
  )
}
