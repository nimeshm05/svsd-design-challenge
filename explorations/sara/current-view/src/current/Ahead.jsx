import { useEffect, useRef, useState } from 'react'
import { ahead, events, today, week } from '../data/days.js'
import { BodyModel3D } from './BodyModel3D.jsx'

// "What's ahead", in two tabs:
//   Timeline: today and the next six days as a schedule; major events stand out and open their own page.
//   Next Steps: where she is on each path (three open columns: where she is now is the biggest thing,
//      what comes next is one quiet line, a short star path shows the steps in order), then one small
//      line for what's still waiting on a date.
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

// Two tabs: Timeline (today and the next six days, as a schedule) and Next Steps (where she is on each path).
export function Ahead({ kind }) {
  const [tab, setTab] = useState('timeline')
  return (
    <div className="ah">
      <div className="ah-tabs" role="tablist" aria-label="What's ahead">
        {[['timeline', 'Timeline'], ['next', 'Next Steps']].map(([v, l]) => (
          <button key={v} type="button" role="tab" id={`ah-tab-${v}`} aria-selected={tab === v} aria-controls="ah-panel"
            onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>
      <div key={tab} id="ah-panel" role="tabpanel" aria-labelledby={`ah-tab-${tab}`} className="ah-panel">
        {tab === 'timeline' ? <Timeline /> : <NextSteps kind={kind} />}
      </div>
    </div>
  )
}

// Timeline: a week calendar, like a calendar app's week view. Today's box is wide and lists every entry
// in full, recurring care itemized, time on the left and what it is on the right, scrolled to now; the next six days are compact boxes of chips, with
// "+N more" when a day has more than fit. Untimed care sits first, like an all-day line.
// Major events are the items with an `event` key (they have a page in `events`): a filled warm chip,
// bolder, with a star marker, so they don't rely on color alone, and they're always among a day's
// visible chips. They open their own page in place of the calendar (not a modal). Back to timeline, the
// browser's back, or Esc returns to the calendar, with focus back on the event that was opened.
const CHIPS = 3
// "7 a.m." → 7, "2 p.m." → 14; untimed care sorts first
const hourOf = (t) => {
  if (!t) return -1
  const [, h, m = 0, ap] = t.match(/(\d+)(?::(\d+))?\s*([ap])/) || []
  return h ? (+h % 12) + (ap === 'p' ? 12 : 0) + m / 60 : -1
}
const byTime = (items) => [...items].sort((x, y) => hourOf(x.t) - hourOf(y.t))
const fmtH = (h) => `${h % 12 || 12} ${h < 12 ? 'a.m.' : 'p.m.'}`
// Today, itemized: a recurring task becomes one entry per time (care every 3 hours → 12 a.m., 3 a.m., …).
const itemize = (items) => items
  .flatMap((it) => it.every
    ? Array.from({ length: Math.ceil(24 / it.every) }, (_, k) => ({ ...it, what: it.label ?? it.what, t: fmtH(k * it.every), h: k * it.every }))
    : [{ ...it, h: hourOf(it.t) }])
  .sort((x, y) => x.h - y.h)

function Timeline() {
  const [open, setOpen] = useState(null)
  const blocks = useRef({})
  const back = useRef(null)
  const last = useRef(null)
  const list = useRef(null)
  const hi = useRef(null)

  const show = (id) => { last.current = id; window.history.pushState({ ...window.history.state, ahEvent: id }, ''); setOpen(id) }
  const close = () => { if (window.history.state?.ahEvent) window.history.back(); else setOpen(null) }

  useEffect(() => {
    // a marker left from before a refresh shouldn't reopen an event
    if (window.history.state?.ahEvent) window.history.replaceState({ ...window.history.state, ahEvent: null }, '')
    const onPop = () => setOpen(window.history.state?.ahEvent ?? null)
    window.addEventListener('popstate', onPop)
    // leaving What's ahead with an event open: drop the marker so a refresh starts on the schedule
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
    // bring what's happening now (or next) into view in today's list, with the row before it showing
    const l = list.current, e = hi.current
    if (l && e) l.scrollTop += e.getBoundingClientRect().top - l.getBoundingClientRect().top - 56
  }, [open])

  if (open && events[open]) return <EventDetail ev={events[open]} onBack={close} backRef={back} />

  const day0 = week.find((d) => d.today), rest = week.filter((d) => !d.today)
  // past entries are muted; the one happening now (started in the last half hour) or else the next is
  // highlighted; the "Now" line sits before the first entry still ahead. Untimed ones (h = -1) are neither.
  const nowH = today.clock.h
  const entries = day0 ? itemize(day0.items) : []
  const hiIdx = entries.findIndex((e) => e.h > nowH - 0.5)
  const nowIdx = entries.findIndex((e) => e.h >= nowH)
  return (
    <section className="ah-sec ah-cal-sec" aria-labelledby="ah-cal-k">
      <h3 id="ah-cal-k" className="ah-k">Today and the next six days</h3>
      <div className="ah-wk">
        {day0 && (
          <section className="ah-cal-day is-today ah-wk-today" aria-label={`Today, ${day0.name}, day ${day0.day}`}>
            <div className="ah-cal-head"><b>Today · {day0.short}</b><span>Day {day0.day}</span></div>
            {entries.length ? (
              <ul className="ah-sched-items" ref={list}>
                {entries.map((it, i) => {
                  const state = i === hiIdx ? 'is-next' : it.h >= 0 && it.h < nowH ? 'is-past' : ''
                  return [
                  i === nowIdx && <li key="now" className="ah-sched-now" aria-hidden="true"><span>Now</span></li>,
                  it.event ? (
                  <li key={`${it.what}-${it.h}`} className={state} ref={i === hiIdx ? hi : undefined} aria-current={i === hiIdx ? 'time' : undefined}>
                    <button type="button" className="ah-sched-major" ref={(el) => { blocks.current[it.event] = el }}
                      onClick={() => show(it.event)} aria-label={`Major event: ${it.what}, today at ${it.t}. Open details`}>
                      <span className="ah-sched-t">{it.t}</span>
                      <span className="ah-sched-what">
                        <b><Star state="now" />{it.what}</b>
                        {events[it.event]?.duration && <span>{events[it.event].duration}</span>}
                      </span>
                      <span className="ah-sched-more" aria-hidden="true">Details ›</span>
                    </button>
                  </li>
                ) : (
                  <li key={`${it.what}-${it.h}`} className={`ah-sched-item ${state}`} ref={i === hiIdx ? hi : undefined} aria-current={i === hiIdx ? 'time' : undefined}>
                    <span className="ah-sched-t">{it.t || 'All day'}</span>
                    <span className="ah-sched-what"><b>{it.what}</b>{it.note && <span>{it.note}</span>}</span>
                  </li>
                )]
                })}
              </ul>
            ) : <p className="ah-wk-empty">Nothing scheduled</p>}
          </section>
        )}
        <ol className="ah-wk-rest">
          {rest.map((d, i) => <WeekDay key={d.day} d={d} i={i + 1} onOpen={show} blocks={blocks} />)}
        </ol>
      </div>
    </section>
  )
}

// One compact day: chips in time order, majors always kept, the rest behind "+N more".
function WeekDay({ d, i, onOpen, blocks }) {
  const [all, setAll] = useState(false)
  const items = byTime(d.items)
  const keep = new Set(items.filter((it) => it.event).slice(0, CHIPS))
  for (const it of items) if (keep.size < CHIPS) keep.add(it)
  const shown = all ? items : items.filter((it) => keep.has(it))
  const more = items.length - shown.length
  return (
    <li className="ah-cal-day" style={{ '--i': i }} aria-label={`${d.name}, day ${d.day}`}>
      <div className="ah-cal-head"><b>{d.short}</b><span>Day {d.day}</span></div>
      {items.length ? (
        <ul>
          {shown.map((it) => it.event ? (
            <li key={it.what}>
              <button type="button" className="ah-cal-event" ref={(el) => { blocks.current[it.event] = el }}
                onClick={() => onOpen(it.event)} aria-label={`Major event: ${it.what}, ${d.name} at ${it.t}. Open details`}>
                <span className="ah-cal-event-t">{it.t}</span>
                <b title={it.what}><Star state="now" /><span>{it.what}</span></b>
              </button>
            </li>
          ) : (
            <li key={it.what} className="ah-cal-routine" title={it.what}>
              <span>{it.t || 'All day'}</span><span className="ah-wk-title">{it.what}</span>
            </li>
          ))}
          {(more > 0 || all) && items.length > CHIPS && (
            <li>
              <button type="button" className="ah-wk-more" aria-expanded={all} onClick={() => setAll(!all)}>
                {all ? 'Show less' : `+${more} more`}
              </button>
            </li>
          )}
        </ul>
      ) : <p className="ah-wk-empty">Nothing scheduled</p>}
    </li>
  )
}

// Next Steps: "Where she is on each path" (unchanged), then the one small "Waiting on a date" line.
function NextSteps({ kind }) {
  const a = ahead[kind]
  return (
    <>
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
      <div className="ah-waiting" aria-label="Waiting on a date">
        <span className="ah-k">Waiting on a date</span>
        {a.checks.map((c) => <span key={c.what} className="ah-check"><b>{c.what}</b> · {c.note.toLowerCase()}</span>)}
      </div>
    </>
  )
}

// A major event, in full, in place of the calendar. Placeholder medical content, marked for review.
function EventDetail({ ev, onBack, backRef }) {
  return (
    <section className="ah-ev" aria-labelledby="ah-ev-title">
      <div className="ah-ev-top">
        <button ref={backRef} type="button" className="cv-back" onClick={onBack}>‹ Back</button>
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
