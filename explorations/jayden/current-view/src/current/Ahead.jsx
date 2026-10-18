import { ahead } from '../data/days.js'

// "What's ahead", read the way a parent reads it, top to bottom:
//   1. When you can be there: a short agenda, the time on the left, what it is on the right.
//   2. Where she is on each path: three open columns. Where she is now is the biggest thing;
//      what comes next is one quiet line; a short star path shows the steps in order.
//   3. Still waiting on a date: one small line at the end.
// Steps show order, never dates for going home; a step back is "working on this again", never failure.
const STATUS = { decided: 'Decided', deciding: 'Being decided', waiting: 'For now' }
// the words her team uses, in plain English
const MEANS = {
  'CPAP mask': 'steady air pressure through a small mask, so her lungs stay open',
  'Nasal cannula': 'a gentle flow of air through soft prongs in her nose',
  'Breathing on her own': 'no breathing help needed',
  'Feeding tube': 'a thin tube through her nose to her tummy that carries her milk',
  'First bottle': 'learning to suck, swallow and breathe together',
  Breastfeeding: 'feeding at your breast, when you and she are ready',
  Incubator: 'a warm, covered bed that keeps her temperature steady',
  'Open crib': 'a regular baby bed, once she can keep herself warm',
}

function Star({ state }) {
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
    <div className="ah">
      <section className="ah-sec" aria-labelledby="ah-when">
        <h3 id="ah-when" className="ah-k">When you can be there</h3>
        <ul className="ah-agenda">
          {a.coming.map((c) => (
            <li key={c.what}>
              <span className="ah-agenda-t">{c.when}</span>
              <div>
                <b>{c.what}</b>
                <span>{c.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="ah-sec" aria-labelledby="ah-paths">
        <h3 id="ah-paths" className="ah-k">Where she is on each path</h3>
        <ul className="ah-cols">
          {a.tracks.map((t) => {
            const now = t.steps[t.at], next = t.steps[t.at + 1]
            return (
              <li key={t.area} className="ah-col">
                <div className="ah-col-head">
                  <span className="ah-col-area">{t.area}</span>
                  <span className={`ah-status is-${t.status}`}>{STATUS[t.status]}</span>
                </div>
                <ol className="ah-stars" aria-label={t.steps.join(', then ')}>
                  {t.steps.map((s, i) => <li key={s}><Star state={i < t.at ? 'done' : i === t.at ? 'now' : 'next'} /></li>)}
                </ol>
                <b className="ah-now">{now}</b>
                {MEANS[now] && <span className="ah-means">{MEANS[now]}</span>}
                {next && <span className="ah-next">Next: {next}</span>}
                {t.status !== 'waiting' && <p className="ah-plan">{t.plan}</p>}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="ah-sec ah-waiting" aria-label="Waiting on a date">
        <span className="ah-k">Waiting on a date</span>
        {a.checks.map((c) => <span key={c.what} className="ah-check"><b>{c.what}</b> · {c.note.toLowerCase()}</span>)}
      </section>
    </div>
  )
}
