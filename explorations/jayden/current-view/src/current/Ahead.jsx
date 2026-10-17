import { ahead } from '../data/days.js'

// "What's ahead": her care plans, separate from her sky but drawn in the same gentle way.
// Each area her team is working on is a short path of stars: lit for steps she has reached,
// glowing for the step she's on, an outline for what comes next. Steps show order, never dates;
// a step back is "working on this again", never failure.
const STATUS = { decided: 'Decided', deciding: 'Still being decided', waiting: 'For now' }

function Star({ state }) {
  // four-point sparkle, like the night sky
  return (
    <svg className={`cv-pstar is-${state}`} viewBox="-16 -16 32 32" aria-hidden="true">
      {state === 'now' && <circle r="15" className="cv-pstar-glow" />}
      <path d="M0 -11L2.6 -2.6L11 0L2.6 2.6L0 11L-2.6 2.6L-11 0L-2.6 -2.6Z" />
    </svg>
  )
}

export function Ahead({ kind }) {
  const a = ahead[kind]
  return (
    <div className="cv-ahead">
      <div className="cv-ahead-main">
        <h2 className="cv-ahead-title">What&apos;s ahead</h2>
        <ul className="cv-paths">
          {a.tracks.map((t) => (
            <li key={t.area} className="cv-path">
              <div className="cv-path-head">
                <b>{t.area}</b>
                <span className={`cv-path-status is-${t.status}`}>{STATUS[t.status]}</span>
              </div>
              <ol className="cv-path-stars" style={{ '--n': t.steps.length }}>
                {t.steps.map((s, i) => {
                  const state = i < t.at ? 'done' : i === t.at ? 'now' : 'next'
                  return (
                    <li key={s} className={`is-${state}`}>
                      <Star state={state} />
                      <span>{s}{state === 'now' && t.again && <em>working on this again</em>}</span>
                    </li>
                  )
                })}
              </ol>
              <p className="cv-path-plan">{t.plan} <span>Next look: {t.review.toLowerCase()}.</span></p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="cv-ahead-side">
        <div className="cv-detail-k">Coming up</div>
        <ul className="cv-coming">
          {a.coming.map((c) => <li key={c.what}><span>{c.when}</span><b>{c.what}</b><em>{c.note}</em></li>)}
          {a.checks.map((c) => <li key={c.what} className="is-waiting"><span>{c.note}</span><b>{c.what}</b></li>)}
        </ul>
        <p className="cv-ahead-note">Plans can change as she grows. Her team will always talk changes through with you.</p>
      </aside>
    </div>
  )
}
