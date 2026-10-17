import { useState } from 'react'
import { days, today } from '../data/days.js'
import { Scan } from '../components/Scan.jsx'
import { FormingStar } from './FormingStar.jsx'
import { SkyArc } from './SkyArc.jsx'
import { Ahead } from './Ahead.jsx'
import './current.css'

// Bedside current view: minimal, low-light, read from the parent chair, in the warm star style.
// Every page keeps the same header and "Ask for her nurse" in the same corner.
//   Home A: how she is right now, a link to today, the next care time, today's forming star.
//           "Today so far" opens the day view.
//   Home B: the day view: today as a line of stars to drag through, a caption, the day's list.
//   Home C: today as an arc across the screen; drag today's star along it. The end of the arc
//           leads to What's ahead.
export function CurrentView({ onSky }) {
  const [kind, setKind] = useState('calm')
  const [night, setNight] = useState(false)
  const [page, setPage] = useState('home') // 'home' | 'today' | 'ahead'
  const [homeV, setHomeV] = useState('c') // two home layouts to compare
  const openToday = () => setPage('today')
  const [team, setTeam] = useState(false)
  const d = today[kind]
  const onSub = page !== 'home' && !night // a page with Back

  return (
    <div className="cv-page">
      {/* Prototype controls: not part of the bedside screen */}
      <div className="cv-proto" role="toolbar" aria-label="Prototype controls">
        <span className="cv-proto-k">Prototype</span>
        <Seg value={kind} onChange={setKind} options={[['calm', 'Calm day'], ['harder', 'Harder day']]} />
        <Seg value={night ? 'night' : 'day'} onChange={(v) => setNight(v === 'night')} options={[['day', 'Day'], ['night', 'Night']]} />
        <Seg value={homeV} onChange={(v) => { setHomeV(v); setPage('home') }} options={[['a', 'Home A'], ['b', 'Home B'], ['c', 'Home C']]} />
        <button type="button" className="cv-proto-btn" onClick={onSky}>Open her sky</button>
      </div>

      <div className={`cv-screen ${night ? 'is-night' : ''}`} role="region" aria-label="Bedside display">
        <header className="cv-top">
          <span className="cv-top-left">
            {onSub && <button type="button" className="cv-back" onClick={() => setPage('home')}>‹ Back</button>}
            {page !== 'today' || night ? `Mila · Day ${today.day}` : null}
          </span>
          <span className="cv-clock">{night ? today.clock.night : today.clock.label}</span>
        </header>

        {onSub && page === 'ahead'
          ? <Ahead kind={kind} />
          : onSub
          ? <DayView key={kind} d={d} />
          : homeV === 'c' && !night
            ? <HomeC key={kind} d={d} onAhead={() => setPage('ahead')} />
            : homeV === 'b' && !night
            ? <DayView key={kind} d={d} />
            : <Home d={d} night={night} onToday={() => openToday()} />}

        <footer className="cv-actions">
          <button type="button" className="cv-btn is-call" onClick={() => setTeam(true)}>
            <span className="cv-btn-icon" aria-hidden="true">☎</span>Ask for her nurse
          </button>
        </footer>
      </div>

      {team && <TeamSheet onClose={() => setTeam(false)} />}
    </div>
  )
}

/* ---------------- Home ---------------- */

function Home({ d, night, onToday }) {
  const n = d.changes.length + d.decisions.length
  return (
    <div className="cv-body">
      {night ? (
        <div className="cv-words">
          <p className="cv-status">Mila is resting.</p>
          <p className="cv-line">Next care <b>3:00 a.m.</b></p>
        </div>
      ) : (
        <div className="cv-words">
          <p className="cv-status">{keepTimes(d.status)}</p>
          <button type="button" className="cv-change" onClick={onToday}>
            <span className="cv-change-text">Today · {n} {n === 1 ? 'update' : 'updates'}</span>
            <span className="cv-chev" aria-hidden="true">›</span>
          </button>
          <p className="cv-line">Next care <b>{d.next.t}</b></p>
        </div>
      )}
      <FormingStar moments={d.moments} dim={night} />
    </div>
  )
}

// The day, in the star style: used as Home B, and as Home A's "Today so far".
// Left: her (Sara's drawing, no panel behind her), today as a line of stars you can drag
// through, and a fixed-height caption. Her wires show as they were at the chosen time.
// Right: the day's list. Picking a past moment moves the star there; nothing else moves.
function DayView({ d }) {
  const items = dayItems(d)
  const nowH = today.clock.h
  const [h, setH] = useState(nowH)
  const atNow = Math.abs(h - nowH) < 0.01
  const past = items.filter((i) => i.phase === 'past')
  const current = past.filter((i) => i.h <= h + 0.001).at(-1) // the latest thing at or before h
  const marks = past.map((i) => ({ h: i.h, kind: i.kind }))
  const later = [15, 18, 21].filter((x) => x > nowH).map((x) => ({ h: x, kind: 'care' }))
  const { present, changed } = setupAt(d, h)

  return (
    <div className="cv-dayview">
      <section className="cv-dayview-main">
        <Scan present={present} changed={changed} height={220} bare />
        <SkyArc shape="line" h={h} nowH={nowH} marks={marks} later={later} glow={Math.min(1, (marks.length + d.saved.length * 2) / 8)} onChange={setH} />
        <div className="cv-caption cv-dayview-caption">
          {atNow ? (
            <>
              <span className="cv-detail-k">Right now</span>
              <p className="cv-her-status">{keepTimes(d.status)}</p>
            </>
          ) : current ? (
            <Caption item={current} />
          ) : (
            <>
              <span className="cv-detail-k">{hourLabel(h)}</span>
              <p className="cv-caption-title">The start of her day</p>
            </>
          )}
        </div>
      </section>
      <section className="cv-day cv-day-side">
        <div className="cv-day-k">Today so far</div>
        <DayList items={items} sel={atNow ? 'now' : current?.key} onPick={(key) => setH(items.find((i) => i.key === key).h)} onNow={() => setH(nowH)} />
        <p className="cv-routine">{routineSoFar()} so far, all as planned.</p>
      </section>
    </div>
  )
}

// What was on her at hour h, and what the most recent change before h added or took away.
function setupAt(d, h) {
  const present = new Set(d.setup.start)
  let changed = []
  for (const c of d.setup.changes) {
    if (c.h > h + 0.001) break
    c.add?.forEach((x) => present.add(x))
    c.remove?.forEach((x) => present.delete(x))
    changed = [...(c.add ?? []), ...(c.remove ?? [])]
  }
  return { present: [...present], changed }
}

function Caption({ item }) {
  if (item.kind === 'decision') {
    return (
      <>
        <span className="cv-detail-k">{item.t} · Team decision · <span className={`cv-status-tag ${item.status}`}>{item.status === 'decided' ? 'Decided' : 'Still deciding'}</span></span>
        <p className="cv-caption-title">{item.text}</p>
        <p className="cv-caption-text">{item.source}</p>
      </>
    )
  }
  return (
    <>
      <span className="cv-detail-k">{item.t}</span>
      <p className="cv-caption-title">{item.title}</p>
      <p className="cv-caption-text">{item.plain}</p>
      {item.term && <p className="cv-term"><span>{item.term.word}</span> {item.term.means}</p>}
    </>
  )
}

const hourLabel = (h) => {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60 / 5) * 5
  return `${hh % 12 || 12}:${String(mm % 60).padStart(2, '0')} ${hh < 12 ? 'a.m.' : 'p.m.'}`
}

// Home C: today's sky. The day is an arc across the whole screen, drawn like the night sky:
// warm stars on a thin line. Today's star sits at "now" and is what you drag to go back through
// the day. Below: a few soft words. (A 3D body was tried here and dropped: it felt clinical.)
// Marks on the arc: care times, changes to her wires, and team decisions. Personal moments stay
// on the parent's phone (the screen can be seen by others), but they still add light to the star.
function HomeC({ d, onAhead }) {
  const nowH = today.clock.h
  const [h, setH] = useState(nowH)
  const atNow = Math.abs(h - nowH) < 0.01
  const marks = [
    ...d.care.filter((c) => c.h <= nowH).map((c) => ({ ...c, kind: 'care' })),
    ...d.changes.map((c) => ({ ...c, kind: 'change' })),
    ...d.decisions.map((x) => ({ ...x, kind: 'decision' })),
  ].sort((a, b) => a.h - b.h)
  const later = [15, 18, 21].filter((x) => x > nowH).map((x) => ({ h: x, kind: 'care' }))
  const current = marks.filter((m) => m.h <= h + 0.001).at(-1)
  const glow = Math.min(1, (marks.length + d.saved.length * 2) / 12)

  return (
    <div className="cv-homec">
      <SkyArc h={h} nowH={nowH} marks={marks} later={later} glow={glow} onChange={setH} onFuture={onAhead} />
      <div className="cv-homec-words">
        <div className="cv-caption">
          {atNow ? (
            <>
              <span className="cv-detail-k">Right now</span>
              <p className="cv-her-status">{keepTimes(d.status)}</p>
            </>
          ) : current ? <ShortCaption item={current} /> : (
            <>
              <span className="cv-detail-k">{hourLabel(h)}</span>
              <p className="cv-caption-title">The start of her day</p>
            </>
          )}
        </div>
        {/* always in place, only hidden, so nothing moves while the star is dragged */}
        <p className={`cv-homec-next ${atNow ? '' : 'is-hidden'}`} aria-hidden={!atNow}>Next care <b>{d.next.t}</b> · <span className="cv-you">{d.next.you}</span></p>
      </div>
    </div>
  )
}

// A few words for the moment the star is on.
function ShortCaption({ item }) {
  const k = <span className="cv-detail-k">{item.t}</span>
  if (item.kind === 'care') return <>{k}<p className="cv-caption-title">Care time</p><p className="cv-caption-text">Fed · {item.diaper.toLowerCase()}</p></>
  if (item.kind === 'decision') {
    return <>{k}<p className="cv-caption-title">{item.short}</p>
      <p className="cv-caption-text"><span className={`cv-status-tag ${item.status}`}>{item.status === 'decided' ? 'Decided' : 'Still deciding'}</span></p></>
  }
  return <>{k}<p className="cv-caption-title">{item.short}</p>{item.term && <p className="cv-term"><span>{item.term.word}</span> {item.term.means}</p>}</>
}

/* ---------------- Today so far ---------------- */

// The day as a short list, in time order, with "Now" in place.
function dayItems(d) {
  const earlier = [
    ...d.changes.map((c) => ({ ...c, kind: 'change' })),
    ...d.decisions.map((x) => ({ ...x, kind: 'decision' })),
  ].sort((a, b) => a.h - b.h)
  return [
    ...earlier.map((e) => ({ ...e, key: `${e.kind}-${e.h}`, when: e.t, phase: 'past' })),
    { key: 'now', kind: 'now' },
    { ...d.next, key: 'next', kind: 'next', when: d.next.t, short: 'Next care', phase: 'next' },
    ...d.upcoming.map((u) => ({ ...u, key: `up-${u.short}`, kind: 'later', phase: 'later' })),
    ...d.waiting.map((w) => ({ ...w, key: `wait-${w.short}`, kind: 'waiting', when: w.note, phase: 'waiting' })),
  ]
}

// The same marks as the star timeline, so the list and the sky read as one thing.
function StarMark({ kind }) {
  const sparkle = 'M0 -9L2.2 -2.2L9 0L2.2 2.2L0 9L-2.2 2.2L-9 0L-2.2 -2.2Z'
  return (
    <svg className={`cv-starmark is-${kind}`} viewBox="-12 -12 24 24" aria-hidden="true">
      {kind === 'change' && <path d={sparkle} />}
      {kind === 'decision' && <circle r="6" />}
      {kind === 'next' && <><circle r="11" className="cv-starmark-glow" /><path d={sparkle} /></>}
      {kind === 'later' && <path d={sparkle} className="is-outline" />}
      {kind === 'waiting' && <circle r="5.5" className="is-dashed" />}
    </svg>
  )
}

function DayList({ items, sel, onPick, onNow }) {
  return (
    <ol className="cv-list">
      {items.map((i) => i.kind === 'now' ? (
        <li key="now" className="cv-list-now">
          {onNow
            ? <button type="button" className={sel === 'now' ? 'is-on' : ''} onClick={onNow}>Now</button>
            : <span>Now</span>}
        </li>
      ) : (
        <li key={i.key}>
          {i.phase === 'past' ? (
            <button type="button" className={`cv-list-item is-${i.phase} ${i.key === sel ? 'is-on' : ''}`} onClick={() => onPick(i.key)}>
              <StarMark kind={i.kind} />
              <span className="cv-list-t">{i.when}</span>
              <span className="cv-list-title">{i.short}</span>
              {i.kind === 'decision' && <span className={`cv-soft-status is-${i.status}`}>{i.status === 'decided' ? 'decided' : 'still deciding'}</span>}
            </button>
          ) : (
            // Coming up: shown, not picked
            <div className={`cv-list-item is-static is-${i.phase}`}>
              <StarMark kind={i.kind} />
              <span className="cv-list-t">{i.when}</span>
              <span className="cv-list-title">
                {i.short}
                {i.kind === 'next' && <span className="cv-list-sub">{i.what}. <span className="cv-you">{i.you}</span></span>}
              </span>
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}

function routineSoFar() {
  const done = days[today.day].events.filter((e) => e.h <= today.clock.h)
  const n = (pred) => done.filter(pred).length
  return [
    [n((e) => e.cat === 'care'), 'care time', 'care times'],
    [n((e) => e.cat === 'med'), 'medicine', 'medicines'],
    [n((e) => e.cat === 'test' || e.cat === 'check'), 'check', 'checks'],
  ].filter(([c]) => c > 0).map(([c, one, many]) => `${c} ${c === 1 ? one : many}`).join(' · ')
}

/* ---------------- Ask for her nurse ---------------- */

// Parents see who's caring for her, and ask for help in one place. The request goes to her nurse;
// the charge nurse covers if she's busy. Urgent help stays with the nurse call button by her bed.
function TeamSheet({ onClose }) {
  const [asked, setAsked] = useState(false)
  return (
    <div className="cv-scrim" onClick={onClose}>
      <div className="cv-sheet" role="dialog" aria-label="Her team right now" onClick={(e) => e.stopPropagation()}>
        <div className="cv-sheet-head">
          <h3>Her team right now</h3>
          <button type="button" className="cv-close" onClick={onClose}>Close</button>
        </div>
        <ul className="cv-team">
          {today.team.map((p) => (
            <li key={p.name} className={p.primary ? 'is-primary' : ''}>
              <span className="cv-avatar">{p.initials}</span>
              <span className="cv-who"><b>{p.name}</b><span>{p.role}</span></span>
            </li>
          ))}
        </ul>
        {asked ? (
          <div className="cv-asked">
            <p className="cv-sheet-lead">Priya knows you&apos;d like help.</p>
            <p>She&apos;ll come by as soon as she can. If she&apos;s with another baby, the charge nurse will come instead.</p>
          </div>
        ) : (
          <button type="button" className="cv-help-btn" onClick={() => setAsked(true)}>Ask for help</button>
        )}
        <p className="cv-muted">If it feels urgent, press the nurse call button by her bed.</p>
      </div>
    </div>
  )
}

// Keep "12 p.m." on one line
const keepTimes = (s) => s.replace(/ (a\.m\.|p\.m\.)/g, ' $1')

function Seg({ value, onChange, options }) {
  return (
    <span className="cv-seg">
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>
      ))}
    </span>
  )
}
