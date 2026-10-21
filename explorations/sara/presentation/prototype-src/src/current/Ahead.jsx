import { NavBack } from './NavIcons.jsx'
import { useEffect, useRef, useState } from 'react'
import { ahead, events, scheduleFor, today, week } from '../data/days.js'
import { glossary } from '../data/glossary.js'
import { GlossaryTerm } from '../components/GlossaryTerm.jsx'
import { BodyModel3D } from './BodyModel3D.jsx'

// "What's ahead", in two tabs:
//   Timeline: today and the next six days as a schedule; major events stand out and open their own page.
//   Next Steps: three open columns, one per path (where she is now is the biggest thing, what comes
//      next is one quiet line, a short star path shows the steps in order), then a row of small cards
//      for what's still waiting on a date. Medical terms open a plain-language explanation when tapped.
// Steps show order, never dates for going home; a step back is "working on this again", never failure.
const STATUS = { decided: 'Decided', deciding: 'Being decided', waiting: 'Current' }

function Star({ state, selected }) {
  return (
    <svg className={`cv-pstar is-${state}${selected ? ' is-selected' : ''}`} viewBox="-16 -16 32 32" aria-hidden="true">
      {state === 'now' && <circle r="15" className="cv-pstar-glow" />}
      {selected && state !== 'now' && <circle r="15" className="cv-pstar-ring" />}
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

// Timeline: a week calendar, Sun → Sat, seven equal days, like a calendar app's week view. The schedule
// counts days of her stay, not dates, so her day today (`today.day`, the `week` entry marked `today`) is
// placed on that weekday of the real current week and every other day follows. Today has a cream stroke
// and lists every entry in full, recurring care itemized: time, what it is, a small tag, rows split by thin
// lines, scrolled to now. The other days list their events one line each, with the full name on hover.
// Days before today are quieter; days with nothing planned stay, just emptier.
// Prev / next step a week at a time, as does a sideways swipe (touch, or two fingers on a trackpad);
// "Today" comes back.
// Major events are the items with an `event` key (they have a page in `events`): a filled warm block with
// a heavier left edge, bold, with a star marker, time and length, so they don't rely on color alone. They open their own page in place of the calendar (not a modal).
// Back to timeline, the browser's back, or Esc returns to the calendar, with focus on the event opened.
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
const tagOf = (it) => it.event ? 'Major event' : null
// dates, at local midnight; Math.round keeps a daylight-saving hour from shifting the count
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const daysFrom = (a, b) => Math.round((b - a) / 864e5)
const fmtDate = (d, o) => d.toLocaleDateString('en-US', o)
// the weekday her day today falls on (0 = Sunday)
const TODAY_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(week.find((d) => d.today)?.short)

function Timeline() {
  const [open, setOpen] = useState(null)
  const [offset, setOffset] = useState(0) // weeks from this one
  const blocks = useRef({})
  const back = useRef(null)
  const last = useRef(null)
  const list = useRef(null)
  const nowRef = useRef(null)
  const wk = useRef(null)
  const swipe = useRef(null)

  // A sideways swipe changes the week: left for the next, right for the one before. Mostly-vertical
  // moves are left alone, so today's list still scrolls.
  const onSwipeStart = (e) => { if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY } }
  const onSwipeEnd = (e) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x, dy = e.clientY - s.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) setOffset((o) => o + (dx < 0 ? 1 : -1))
  }

  // Trackpads swipe as a sideways wheel: one week per gesture, waiting for its momentum to settle.
  useEffect(() => {
    const el = wk.current
    if (!el) return
    let acc = 0, locked = false, quiet
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      clearTimeout(quiet)
      quiet = setTimeout(() => { acc = 0; locked = false }, 250)
      if (locked) return
      acc += e.deltaX
      if (Math.abs(acc) > 60) { setOffset((o) => o + (acc > 0 ? 1 : -1)); locked = true }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => { el.removeEventListener('wheel', onWheel); clearTimeout(quiet) }
  }, [open])

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
  }, [open])

  // bring now into view in today's list, with the row before it showing
  useEffect(() => {
    const l = list.current, e = nowRef.current
    if (!open && l && e) l.scrollTop += e.getBoundingClientRect().top - l.getBoundingClientRect().top - 56
  }, [open, offset])

  if (open && events[open]) return <EventDetail ev={events[open]} onBack={close} backRef={back} />

  const now = new Date()
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + TODAY_WD - now.getDay())
  const start = addDays(t0, offset * 7 - TODAY_WD)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i), off = daysFrom(t0, date), n = today.day + off
    return { date, n, i, isToday: off === 0, isPast: off < 0, items: scheduleFor(n) }
  })
  const day0 = days.find((d) => d.isToday), rest = days.filter((d) => !d.isToday)
  const range = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).formatRange(start, days[6].date)
  // the "Now" line sits before the first entry still ahead; untimed ones (h = -1) sit above it, like all-day
  const nowH = today.clock.h
  const entries = day0 ? itemize(day0.items) : []
  const nowIdx = entries.findIndex((e) => e.h >= nowH)
  return (
    <section className="ah-sec ah-cal-sec" aria-labelledby="ah-cal-k">
      <div className="ah-wk-bar">
        <h3 id="ah-cal-k" className="ah-k" aria-live="polite">{range}</h3>
        <div className="ah-wk-nav">
          <button type="button" className="ah-wk-btn" onClick={() => setOffset(0)} disabled={offset === 0}>Today</button>
          <button type="button" className="ah-wk-btn is-arrow" onClick={() => setOffset(offset - 1)} aria-label="Previous week">‹</button>
          <button type="button" className="ah-wk-btn is-arrow" onClick={() => setOffset(offset + 1)} aria-label="Next week">›</button>
        </div>
      </div>
      <div className="ah-wk" ref={wk} onPointerDown={onSwipeStart} onPointerUp={onSwipeEnd}
        onPointerCancel={() => { swipe.current = null }}>
        {day0 && (
          <section className="ah-cal-day is-today ah-wk-today" style={{ '--col': day0.i + 1 }}
            aria-label={`Today, ${fmtDate(day0.date, { weekday: 'long', month: 'long', day: 'numeric' })}, day ${day0.n} of her stay`}>
            <DayHead d={day0} />
            {entries.length ? (
              <ul className="ah-sched-items" ref={list}>
                {entries.map((it, i) => [
                  i === nowIdx && <li key="now" className="ah-sched-now" ref={nowRef} aria-hidden="true"><span>Now</span></li>,
                  <li key={`${it.what}-${it.h}`}>
                    {it.event ? (
                      <button type="button" className="ah-sched-row is-major" ref={(el) => { blocks.current[it.event] = el }}
                        onClick={() => show(it.event)} aria-label={`Major event: ${it.what}, today at ${it.t}. Open details`}>
                        <Row it={it} note={events[it.event]?.duration} />
                        <span className="ah-sched-more" aria-hidden="true">›</span>
                      </button>
                    ) : <div className="ah-sched-row"><Row it={it} note={it.note} /></div>}
                  </li>,
                ])}
              </ul>
            ) : <p className="ah-wk-empty">Nothing scheduled</p>}
          </section>
        )}
        <ol className="ah-wk-rest">
          {rest.map((d) => <WeekDay key={d.n} d={d} onOpen={show} blocks={blocks} />)}
        </ol>
      </div>
    </section>
  )
}

// weekday and date number, right-aligned, like a calendar's week header
function DayHead({ d }) {
  return (
    <div className="ah-cal-head">
      {d.isToday && <span className="ah-wk-label">Today</span>}
      <span className="ah-wk-date"><span>{fmtDate(d.date, { weekday: 'short' })}</span><b>{d.date.getDate()}</b></span>
    </div>
  )
}

// One of today's rows: time, then what it is, with its tag and any note underneath.
function Row({ it, note }) {
  const tag = tagOf(it)
  return (
    <>
      <span className="ah-sched-t">{it.t || 'All day'}</span>
      <span className="ah-sched-what">
        <b>{it.event && <Star state="now" />}{it.what}</b>
        {(tag || note) && <span className="ah-sched-meta">{tag && <i className="ah-tag">{tag}</i>}{note && <span>{note}</span>}</span>}
      </span>
    </>
  )
}

// One compact day: every event on a single line, in time order; the full name and time show on hover.
function WeekDay({ d, onOpen, blocks }) {
  const items = byTime(d.items)
  const tip = (it) => `${it.t ? `${it.t} · ` : ''}${it.what}`
  return (
    <li className={`ah-cal-day${items.length ? '' : ' is-empty'}${d.isPast ? ' is-past' : ''}`} style={{ '--i': d.i, '--col': d.i + 1 }}
      aria-label={`${fmtDate(d.date, { weekday: 'long', month: 'long', day: 'numeric' })}${items.length ? '' : ', nothing scheduled'}`}>
      <DayHead d={d} />
      {items.length > 0 && (
        <ul className="ah-wk-lines">
          {items.map((it) => it.event ? (
            <li key={it.what}>
              <button type="button" className="ah-cal-event" title={tip(it)} ref={(el) => { blocks.current[it.event] = el }}
                onClick={() => onOpen(it.event)} aria-label={`Major event: ${it.what}, ${fmtDate(d.date, { weekday: 'long' })} at ${it.t}. Open details`}>
                <span className="ah-cal-event-t">{it.t}</span>
                <b><Star state="now" /><span>{it.what}</span></b>
                {events[it.event]?.duration && <span className="ah-cal-event-more">{events[it.event].duration}</span>}
              </button>
            </li>
          ) : (
            <li key={it.what} className="ah-wk-line" title={tip(it)}>
              <i className="ah-wk-dot" aria-hidden="true" /><span className="ah-wk-title">{it.what}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

// Next Steps: one column per path, three to a row, all the same shape (area, star path, step + status,
// its meaning, where she is now).
function NextSteps({ kind }) {
  return (
    <section className="ah-sec" aria-label="Where she is on each path">
      <ul className="ah-cols">
        {ahead[kind].tracks.map((t) => <Path key={t.area} t={t} />)}
      </ul>
    </section>
  )
}

// One path. It opens on the step after hers (or hers, if it's the last), with where she is now as a quiet
// status line below. Tapping an empty (future) star peeks at that step, with a "Future" pill; tapping her
// current star shows it. Steps she's already passed stay as they are. The current star always keeps its pulse.
function Path({ t }) {
  const last = t.at >= t.steps.length - 1
  const [sel, setSel] = useState(last ? t.at : t.at + 1)
  const step = t.steps[sel], future = sel > t.at
  const btnLabel = (s, i) => i === t.at ? `Show her current step: ${s}`
    : `Show ${i === t.at + 1 ? 'next' : 'later'} step: ${s}`
  return (
    <li className="ah-col">
      <div className="ah-col-head"><span className="ah-col-area">{t.area}</span></div>
      <ol className="ah-stars" aria-label={`${t.area} steps: ${t.steps.join(', then ')}`}>
        {t.steps.map((s, i) => {
          const state = i < t.at ? 'done' : i === t.at ? 'now' : 'next'
          return (
            <li key={s}>
              {state === 'done' || !s ? <Star state={state} /> : (
                <button type="button" className="ah-star-btn" aria-label={btnLabel(s, i)} aria-pressed={i === sel}
                  onClick={() => setSel(i)}>
                  <Star state={state} selected={i === sel} />
                </button>
              )}
            </li>
          )
        })}
      </ol>
      <div className="ah-col-live" aria-live="polite">
      <div key={sel} className={`ah-col-step${future ? ' is-future' : ''}`}>
        <div className="ah-col-title">
          <b className="ah-now"><GlossaryTerm term={step} /></b>
          {future
            ? <span className="ah-status is-future">Future</span>
            : <span className={`ah-status is-${t.status}`}>{STATUS[t.status]}</span>}
        </div>
        {glossary[step]?.short && <span className="ah-means">{glossary[step].short}</span>}
        <span className="ah-next ah-current"><i aria-hidden="true" />
          {last ? 'Final step reached' : <>Current: <GlossaryTerm term={t.steps[t.at]} /></>}
        </span>
      </div>
      </div>
    </li>
  )
}

// A major event, in full, in place of the calendar. The text scrolls on its own; the body diagram stays put.
function EventDetail({ ev, onBack, backRef }) {
  return (
    <section className="ah-ev" aria-labelledby="ah-ev-title">
      <div className="ah-ev-top">
        <NavBack btnRef={backRef} label="What's ahead" onClick={onBack} />
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
