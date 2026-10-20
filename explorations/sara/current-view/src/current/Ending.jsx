import { useEffect, useMemo, useState } from 'react'

// The end of her stay. Nothing on the screen ever assumed which ending it would be.
// Going home: her last day here, and her whole sky goes home with the family.
// If she doesn't go home (Comfort, below): the screen almost disappears. Her star and her name, and her
// nurse. No day count, no clock, no data. The family can turn it off. Her sky is there if they choose to
// open it (Memorial, below): her life, recorded, theirs to keep. It never opens on its own.
const ENDINGS = {
  home: {
    days: 98, firsts: [4, 6, 14, 23, 41, 62, 90],
    k: 'Today',
    title: 'Mila goes home',
    lines: ['98 days, 98 stars, 7 firsts. From 880 grams to 2,640 grams.', 'Her sky goes home with you.'],
  },

}

const TINTS = ['#FFDCB5', '#D9CEFF', '#BDEBD3', '#C4E0FF', '#FFC9D8', '#F3E3B5']
const TINTS2 = ['#FFD23F', '#FF9A3C', '#FFFFFF', '#FF8FC8', '#7EE0A5']
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }

// her whole stay as a round galaxy: one small constellation per week, winding out from the center
function sky(days) {
  const W = 640, H = 300, CX = W / 2, CY = H / 2, pts = []
  const weeks = Math.ceil(days / 7)
  for (let w = 0; w < weeks; w++) {
    const a = -Math.PI / 2 + w * 1.15, r = 34 + w * 9
    const cx = CX + Math.cos(a) * r * 1.9, cy = CY + Math.sin(a) * r * 0.95
    let heading = a + Math.PI / 2, x = 0, y = 0
    const n = Math.min(7, days - w * 7)
    for (let k = 0; k < n; k++) {
      const d = w * 7 + k + 1
      if (k) { heading += (hash(d * 3) - 0.5) * 1.4 + 0.35; x += Math.cos(heading) * 9; y += Math.sin(heading) * 9 }
      pts.push({ d, w, x: cx + x - 24, y: cy + y })
    }
  }
  return { W, H, pts, weeks }
}

export function Ending({ ending, theme }) {
  const e = ENDINGS[ending]
  const c = theme === 'confetti'
  const s = useMemo(() => sky(e.days), [e.days])
  return (
    <div className={`end is-${ending}`}>
      <svg className="end-sky" viewBox={`0 0 ${s.W} ${s.H}`} role="img" aria-label={`Her sky: ${e.days} days as stars, in ${s.weeks} constellations`}>
        {Array.from({ length: s.weeks }, (_, w) => {
          const ws = s.pts.filter((p) => p.w === w)
          return <polyline key={w} points={ws.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none"
            stroke={c ? '#7CC0FF' : '#F3E3B5'} strokeWidth={c ? 1.6 : 0.8} strokeOpacity={c ? 0.55 : 0.35} strokeLinecap="round" strokeLinejoin="round" />
        })}
        {s.pts.map((p) => {
          const last = p.d === e.days
          if (e.firsts.includes(p.d)) {
            return (
              <g key={p.d} transform={`rotate(-18 ${p.x} ${p.y})`}>
                <ellipse cx={p.x} cy={p.y} rx="7" ry="2.2" fill="none" stroke={c ? '#FFD23F' : '#FFB38A'} strokeWidth="1" />
                <circle cx={p.x} cy={p.y} r="3.2" fill={c ? '#3ECF7A' : '#EFDCAA'} />
              </g>
            )
          }
          const t = (c ? TINTS2 : TINTS)[(p.d * 4) % (c ? 5 : 6)]
          return (
            <g key={p.d} className={last ? 'end-last' : ''} style={{ animationDelay: `${(p.d / e.days) * 1.6}s` }}>
              {last && <circle cx={p.x} cy={p.y} r="14" fill={c ? '#FFD23F' : '#F3E3B5'} opacity=".18" />}
              <path d={`M${p.x} ${p.y - (last ? 6 : 2.6)}Q${p.x + 0.5} ${p.y - 0.5} ${p.x + (last ? 6 : 2.6)} ${p.y}Q${p.x + 0.5} ${p.y + 0.5} ${p.x} ${p.y + (last ? 6 : 2.6)}Q${p.x - 0.5} ${p.y + 0.5} ${p.x - (last ? 6 : 2.6)} ${p.y}Q${p.x - 0.5} ${p.y - 0.5} ${p.x} ${p.y - (last ? 6 : 2.6)}Z`}
                fill={last ? (c ? '#FFD23F' : '#FFF8E6') : t} opacity={ending === 'not' ? 0.85 : 1} />
            </g>
          )
        })}
      </svg>
      <div className="end-words">
        {e.k && <span className="end-k">{e.k}</span>}
        <p className="end-title">{e.title}</p>
        {e.lines.map((l) => <p key={l} className="end-line">{l}</p>)}
      </div>
    </div>
  )
}

export function Comfort({ theme, dark, onWake }) {
  const c = theme === 'confetti'
  if (dark) return <button type="button" className="comfort-off" onClick={onWake} aria-label="Turn the screen back on" />
  return (
    <div className="comfort">
      <svg className="comfort-star" viewBox="-60 -60 120 120" aria-hidden="true">
        <circle className="comfort-glow" r="44" fill={c ? '#FFD23F' : '#F3E3B5'} opacity=".07" />
        <path d="M0 -14Q2 -2 14 0Q2 2 0 14Q-2 2 -14 0Q-2 -2 0 -14Z" fill={c ? '#FFE79A' : '#FFF8E6'} opacity=".8" />
      </svg>
      <p className="comfort-name">Mila</p>
      <p className="comfort-line">Her nurse is here with you.</p>
    </div>
  )
}

// Her sky, as the story of her stay. One piece, two ways of reading it:
//   walk (going home): her story retold moment by moment, each lighting its star, at the family's pace.
//   map (if she doesn't go home): her whole life at once, nothing to click through. Her sky draws in, her
//     moments sit beneath it, all visible; touching one lights its star. Opened only when the family
//     chooses; never a count of days.
export const LIVES = {
  home: {
    days: 98, firsts: [4, 6, 14, 23, 41, 62, 90],
    moments: [
      { d: 1, text: 'She arrived, 880 grams, and her story began.' },
      { d: 4, text: 'You touched her hand for the first time.' },
      { d: 6, text: 'You held her for the first time.' },
      { d: 14, text: 'Her first bottle.' },
      { d: 17, text: 'A hard night. More breathing help, and she came through.' },
      { d: 23, text: 'She wore the sleepsuit you brought from home.' },
      { d: 41, text: 'Breathing on her own, no more CPAP.' },
      { d: 62, text: 'Out of the incubator, into an open crib.' },
      { d: 90, text: 'Her first feed all by mouth.' },
      { d: 98, text: 'Today, she goes home.' },
    ],
    close: { title: 'Mila goes home', sub: '98 days, 7 firsts, and everyone who cared for her.', quiet: 'Her sky goes home with you.' },
  },
  not: {
    days: 41, firsts: [4, 6, 14, 23],
    moments: [
      { d: 1, text: 'She arrived, and her story began.' },
      { d: 4, text: 'You touched her hand for the first time.' },
      { d: 6, text: 'You held her. She was warm on your chest.' },
      { d: 14, text: 'Her first bottle.' },
      { d: 23, text: 'She wore the sleepsuit you brought from home.' },
      { d: 38, text: 'Dad read her a story, and she slept.' },
    ],
    close: { title: 'Mila. Loved, every day.', sub: 'Mom and Dad, Priya, Marcus, and everyone who cared for her.', quiet: "Her sky is yours to keep. Her nurse can help, whenever you're ready." },
  },
}

export function LifeSky({ theme, life, mode }) {
  const c = theme === 'confetti'
  const L = LIVES[life]
  const s = useMemo(() => sky(L.days), [L.days])
  const [i, setI] = useState(-1) // walk: which moment is lit (-1: the start; past the end, the close)
  const [touch, setTouch] = useState(null) // map: the moment a finger is on
  const [ready, setReady] = useState(false) // her sky draws in by itself first
  useEffect(() => { const t = setTimeout(() => setReady(true), 3800); return () => clearTimeout(t) }, [])
  const end = mode === 'walk' && i >= L.moments.length
  const lit = mode === 'walk' ? L.moments[i]?.d : touch
  return (
    <div className={`mem is-${mode}`}>
      <svg className="end-sky mem-sky" viewBox={`0 0 ${s.W} ${s.H}`} role="img" aria-label="Her sky: every day of her stay as a star">
        {Array.from({ length: s.weeks }, (_, w) => {
          const ws = s.pts.filter((p) => p.w === w)
          return <polyline key={w} className="mem-line" style={{ animationDelay: `${0.4 + (w / s.weeks) * 2.6}s` }} points={ws.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none"
            stroke={c ? '#7CC0FF' : '#F3E3B5'} strokeWidth={c ? 1.4 : 0.8} strokeOpacity={c ? 0.45 : 0.32} strokeLinecap="round" strokeLinejoin="round" />
        })}
        {s.pts.map((p) => {
          const on = p.d === lit
          const delay = { animationDelay: `${(p.d / L.days) * 3.4}s` }
          const halo = on && <circle cx={p.x} cy={p.y} r="16" fill={c ? '#FFD23F' : '#F3E3B5'} opacity=".2" className="mem-halo" />
          if (L.firsts.includes(p.d)) {
            return (
              <g key={p.d} className="mem-star" style={delay}>
                {halo}
                <g transform={`rotate(-18 ${p.x} ${p.y})`}>
                  <ellipse cx={p.x} cy={p.y} rx="7" ry="2.2" fill="none" stroke={c ? '#FFD23F' : '#FFB38A'} strokeWidth="1" />
                  <circle cx={p.x} cy={p.y} r="3.2" fill={c ? '#3ECF7A' : '#EFDCAA'} />
                </g>
              </g>
            )
          }
          const t = (c ? TINTS2 : TINTS)[(p.d * 4) % (c ? 5 : 6)], r = on ? 5 : 2.6
          return (
            <g key={p.d} className="mem-star" style={delay}>
              {halo}
              <path d={`M${p.x} ${p.y - r}Q${p.x + 0.5} ${p.y - 0.5} ${p.x + r} ${p.y}Q${p.x + 0.5} ${p.y + 0.5} ${p.x} ${p.y + r}Q${p.x - 0.5} ${p.y + 0.5} ${p.x - r} ${p.y}Q${p.x - 0.5} ${p.y - 0.5} ${p.x} ${p.y - r}Z`} fill={on ? '#FFF8E6' : t} />
            </g>
          )
        })}
      </svg>

      {mode === 'walk' ? (
        <>
          <div className="mem-words" aria-live="polite">
            {i < 0 && <p key="intro" className="mem-line-in mem-title">Her story</p>}
            {L.moments[i] && (
              <div key={i} className="mem-line-in mem-step">
                <span className="mem-day">Day {L.moments[i].d}</span>
                <p className="mem-moment">{L.moments[i].text}</p>
              </div>
            )}
            {end && (
              <div key="end" className="mem-line-in mem-end">
                <p className="mem-title">{L.close.title}</p>
                <p className="mem-sub">{L.close.sub}</p>
                <p className="mem-sub is-quiet">{L.close.quiet}</p>
              </div>
            )}
          </div>
          {ready && !end && <button type="button" className="mem-next" onClick={() => setI((v) => v + 1)}>{i < 0 ? 'Begin' : 'Next'}</button>}
        </>
      ) : (
        <div className={`mem-map ${ready ? 'is-in' : ''}`}>
          <ul className="mem-list">
            {L.moments.map((m) => (
              <li key={m.d}>
                <button type="button" className={touch === m.d ? 'is-on' : ''} onPointerEnter={() => setTouch(m.d)} onPointerLeave={() => setTouch(null)}
                  onFocus={() => setTouch(m.d)} onBlur={() => setTouch(null)} onClick={() => setTouch(touch === m.d ? null : m.d)}>
                  <i aria-hidden="true" />{m.text}
                </button>
              </li>
            ))}
          </ul>
          <div className="mem-end">
            <p className="mem-title">{L.close.title}</p>
            <p className="mem-sub">{L.close.sub}</p>
            <p className="mem-sub is-quiet">{L.close.quiet}</p>
          </div>
        </div>
      )}
    </div>
  )
}
