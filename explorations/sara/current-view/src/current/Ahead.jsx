import { useEffect, useRef, useState } from 'react'
import { ahead, events, tomorrow, week } from '../data/days.js'
import { BodyModel3D } from './BodyModel3D.jsx'

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

// Two tabs: Tomorrow first (one day at a time), then This week (the full picture).
export function Ahead({ kind }) {
  const [tab, setTab] = useState('tomorrow')
  return (
    <div className="ah">
      <div className="ah-tabs" role="tablist" aria-label="What's ahead">
        {[['tomorrow', 'Tomorrow'], ['week', 'This week']].map(([v, l]) => (
          <button key={v} type="button" role="tab" id={`ah-tab-${v}`} aria-selected={tab === v} aria-controls="ah-panel"
            onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>
      <div key={tab} id="ah-panel" role="tabpanel" aria-labelledby={`ah-tab-${tab}`} className="ah-panel">
        {tab === 'tomorrow' ? <Tomorrow onWeek={() => setTab('week')} /> : <Week kind={kind} />}
      </div>
    </div>
  )
}

// Once the day is under way, finished items dim and say "Done", and a "Now" line sits
// before whatever comes next, the same marker as Today so far.
function Tomorrow({ onWeek }) {
  const { nowH, items } = tomorrow
  const started = nowH != null
  const firstAhead = started ? items.findIndex((it) => it.h >= nowH) : -1
  return (
    <div className="ah-tomorrow">
      <section aria-labelledby="ah-tmr">
        <h3 id="ah-tmr" className="ah-k">Tomorrow · {tomorrow.day}</h3>
        <ol className="ah-day">
          {items.map((it, i) => {
            const state = !started ? '' : it.h < nowH ? 'is-done' : it.h === nowH ? 'is-now' : ''
            return [
              i === firstAhead && (
                <li key="now" className="ah-day-now" aria-hidden="true"><span>Now</span></li>
              ),
              <li key={it.t} className={state} style={{ '--i': i }}>
                <span className="ah-day-t">{it.t}</span>
                <div>
                  <b>
                    {it.what}
                    {state === 'is-done' && <span className="ah-done"><span aria-hidden="true">✓</span> Done</span>}
                    {state === 'is-now' && <span className="ah-happening">Happening now</span>}
                  </b>
                  <span>{it.note}</span>
                </div>
              </li>,
            ]
          })}
        </ol>
      </section>
      <section className="ah-rest" aria-label="Later this week">
        <div className="ah-rest-head">
          <span className="ah-k">Later this week</span>
          <button type="button" className="ah-rest-link" onClick={onWeek}>This week ›</button>
        </div>
        <ul>
          {tomorrow.rest.map((r) => (
            <li key={r.day}><button type="button" onClick={onWeek}><b>{r.day}</b>{r.line}</button></li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// This week: a seven-day calendar (today first). Routine care is small and quiet; major events are
// warm blocks that open their own page in place of the calendar (not a modal). Back to week, the
// browser's back, or Esc returns to the calendar, with focus back on the event that was opened.
// "Where she is on each path" stays at the bottom in both views.
function Week({ kind }) {
  const a = ahead[kind]
  const [open, setOpen] = useState(null)
  const blocks = useRef({})
  const back = useRef(null)
  const last = useRef(null)

  const show = (id) => { last.current = id; window.history.pushState({ ...window.history.state, ahEvent: id }, ''); setOpen(id) }
  const close = () => { if (window.history.state?.ahEvent) window.history.back(); else setOpen(null) }

  useEffect(() => {
    // a marker left from before a refresh shouldn't reopen an event
    if (window.history.state?.ahEvent) window.history.replaceState({ ...window.history.state, ahEvent: null }, '')
    const onPop = () => setOpen(window.history.state?.ahEvent ?? null)
    window.addEventListener('popstate', onPop)
    // leaving What's ahead with an event open: drop the marker so a refresh starts on the calendar
    return () => {
      window.removeEventListener('popstate', onPop)
      if (window.history.state?.ahEvent) window.history.replaceState({ ...window.history.state, ahEvent: null }, '')
    }
  }, [])

  useEffect(() => {
    if (open) {
      back.current?.focus()
      const onKey = (e) => { if (e.key === 'Escape') close() }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    if (last.current) blocks.current[last.current]?.focus()
  }, [open])

  return (
    <>
      {open && events[open] ? (
        <EventDetail ev={events[open]} onBack={close} backRef={back} />
      ) : (
        <>
          <section className="ah-sec ah-cal-sec" aria-labelledby="ah-cal-k">
            <h3 id="ah-cal-k" className="ah-k">Today and the next six days</h3>
            <div className="ah-cal-scroll">
              <ol className="ah-cal">
                {week.map((d) => (
                  <li key={d.day} className={`ah-cal-day ${d.today ? 'is-today' : ''}`} aria-label={`${d.name}, day ${d.day}${d.today ? ', today' : ''}`}>
                    <div className="ah-cal-head">
                      <b>{d.today ? 'Today' : d.short}</b>
                      <span>Day {d.day}</span>
                    </div>
                    <ul>
                      {d.items.map((it) => it.event ? (
                        <li key={it.what}>
                          <button type="button" className="ah-cal-event" ref={(el) => { blocks.current[it.event] = el }}
                            onClick={() => show(it.event)} aria-label={`${it.what}, ${d.name} at ${it.t}. Open details`}>
                            <span className="ah-cal-event-t">{it.t}</span>
                            <b>{it.what}</b>
                            <span className="ah-cal-event-more" aria-hidden="true">Details ›</span>
                          </button>
                        </li>
                      ) : (
                        <li key={it.what} className="ah-cal-routine">
                          {it.t && <span>{it.t}</span>}{it.what}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
            <div className="ah-waiting ah-cal-waiting" aria-label="Waiting on a date">
              <span className="ah-k">Waiting on a date</span>
              {a.checks.map((c) => <span key={c.what} className="ah-check"><b>{c.what}</b> · {c.note.toLowerCase()}</span>)}
            </div>
          </section>
        </>
      )}

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
    </>
  )
}

// A major event, in full, in place of the calendar. Placeholder medical content, marked for review.
function EventDetail({ ev, onBack, backRef }) {
  return (
    <section className="ah-ev" aria-labelledby="ah-ev-title">
      <div className="ah-ev-top">
        <button ref={backRef} type="button" className="cv-back" onClick={onBack}>‹ Back to week</button>
        <span className="ah-review">Placeholder content · for care-team review</span>
      </div>
      <div className="ah-ev-grid">
        <div className="ah-ev-text">
          <span className="ah-k">{ev.when}</span>
          <h3 id="ah-ev-title" className="ah-ev-title">{ev.name}</h3>
          <dl className="ah-ev-facts">
            <div><dt>Starts</dt><dd>{ev.time}</dd></div>
            <div><dt>Takes about</dt><dd>{ev.duration.replace(/^About /, '')}</dd></div>
            <div><dt>Expected to finish</dt><dd>{ev.done}</dd></div>
          </dl>
          <p className="ah-ev-note">{ev.doneNote}</p>
          <div className="ah-ev-sec">
            <h4>What it involves</h4>
            {ev.involves.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="ah-ev-sec">
            <h4>Risks</h4>
            <ul>{ev.risks.map((r) => <li key={r}>{r}</li>)}</ul>
            <p className="ah-ev-ask">Questions or worries are always welcome. Ask her care team anytime, before or after.</p>
          </div>
        </div>
        <figure className="ah-ev-fig">
          <BodyModel3D target={ev.target} label={`A turnable 3D diagram of a baby's body. ${ev.targetLabel} is highlighted. Use the arrow keys to turn it.`} />
          <figcaption>
            <span className="ah-ev-legend"><i aria-hidden="true" />{ev.targetLabel}: where the surgery happens</span>
            <span>Drag, or use the arrow keys, to turn</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
