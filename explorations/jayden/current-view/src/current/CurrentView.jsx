import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { days, today } from '../data/days.js'
import { Scan } from '../components/Scan.jsx'
import { SkyArc } from './SkyArc.jsx'
import { HerModel } from './HerModel.jsx'
import { FirstDay } from './FirstDay.jsx'
import { Comfort, LifeSky } from './Ending.jsx'
import { Ahead } from './Ahead.jsx'
import { Galaxy, SkyDepth, FormingOverlay, todayOnScreen, todayFormsAt } from './Galaxy.jsx'
import { Discharge } from './Discharge.jsx'
import './current.css'

// Bedside current view: Home C, minimal and low-light, read from the parent chair, in either of
// the two styles from the design board. Every page keeps the same header and "Contact care team"
// in the same corner. Today is an arc across the screen; drag today's star along it. From here:
//   Her progress: the day view (her baby drawing, a line of stars to scrub, the day's list)
//   Her galaxy:   zoom out into her whole stay (galaxy → week → day → moment, after Nimesh's galaxy)
//   What's ahead: her care plans, from the end of the arc
const CHAPTERS = [['born', '1 · Mila is born'], ['story', '2 · Her story begins'], ['day', '3 · A day'], ['sky', '4 · Her sky'], ['home', '5 · Going home'], ['not', "6 · If she doesn't go home"]]

export function CurrentView({ onSky }) {
  const kind = 'harder' // Mila is a complex baby: her day is shown as it really goes, setbacks included
  const [night, setNight] = useState(false)
  const [page, setPage] = useState('home') // 'home' | 'ahead' | 'progress' | 'galaxy' | 'discharge'
  const [cH, setCH] = useState(today.clock.h) // where today's star sits on Home C's arc
  // arriving from the galaxy (?from=galaxy): open mid zoom-in, as if we flew into today's star
  const [zoom, setZoom] = useState(() => (new URLSearchParams(window.location.search).get('from') === 'galaxy' ? 'in' : null)) // 'out' | 'in' while the sky is zooming
  const [theme, setTheme] = useState('nursery') // the two styles from the design board
  const [team, setTeam] = useState(false)
  const [about, setAbout] = useState(false) // who she is: opened by tapping her name
  // Her first day (chapters 1 and 2): how her story begins
  // The demo tells her whole story as chapters: born, her story begins, a day in the long middle,
  // her sky, then going home, or, if she doesn't go home, a screen that almost disappears.
  const [chapter, setChapter] = useState('born')
  const [mode, setMode] = useState('story') // 'story' (the six chapters) | 'bedside' (just the regular screen, day or night)
  const fstage = chapter === 'born' ? 'arrival' : 'visit'
  const [walk, setWalk] = useState(null) // the "What's on her" walkthrough step, or null
  const first = (chapter === 'born' || chapter === 'story') && !night
  const comfort = chapter === 'not' && !night
  const [dark, setDark] = useState(false) // comfort care: the family can turn the screen off
  const [memory, setMemory] = useState(false) // her sky, opened only when the family chooses
  const d = today[kind]
  const onSub = page !== 'home' && page !== 'galaxy' && page !== 'discharge' && !night // a page with Back
  const onC = !night && page === 'home' && (chapter === 'day' || chapter === 'sky')
  // Today becomes a star: the day retells itself. Its moments lift off the arc in order, each with a few
  // words, and drift to where her sky keeps today's star; the family moment joins last. Then her sky
  // fades in around that star. Tap to skip. Coming back, the sky fades away and the day returns.
  const [form, setForm] = useState(null)
  const [skyExit, setSkyExit] = useState(0) // a tap on "Today" while in her sky
  const formT = useRef(null)
  const toSky = () => { clearTimeout(formT.current); setPage('galaxy'); setZoom(null); setForm(null) }
  const zoomOut = () => {
    if (zoom) return
    setCH(today.clock.h)
    const el = document.querySelector('.cv-screen')
    if (!el) return
    const r = el.getBoundingClientRect(), ox = r.left + el.clientLeft, oy = r.top + el.clientTop
    const target = todayFormsAt(el.clientWidth, el.clientHeight)
    const marks = [...el.querySelectorAll('.cv-arc.is-arc .cv-arc-mark[data-label]')]
    // every moment, the family's too, in the order it happened; each lifts off as its turn comes
    const lifts = [
      ...marks.map((m) => {
        const b = m.getBoundingClientRect()
        return { x: b.left + b.width / 2 - ox, y: b.top + b.height / 2 - oy, label: m.dataset.label, kind: m.dataset.kind, h: +m.dataset.h, el: m }
      }),
    ].sort((a, b) => a.h - b.h)
    lifts.forEach((l, i) => { l.delay = 0.6 + i * 0.34; l.el?.style.setProperty('--lift', `${l.delay}s`); delete l.el })
    const end = (lifts.at(-1)?.delay ?? 0.6) + 1.7
    setForm({ lifts, target, end })
    setZoom('out')
    formT.current = setTimeout(toSky, (end + 2.1) * 1000)
  }
  const goChapter = (c) => {
    setWalk(null); setTeam(false); setNight(false); setDark(false); setMemory(false); setPage(c === 'home' ? 'discharge' : 'home'); setChapter(c)
    if (c === 'sky') setTimeout(() => document.querySelector('.cv-lookup-btn')?.click(), 400) // today becomes a star
  }
  const zoomIn = () => {
    setPage('home'); setZoom('in')
    setTimeout(() => setZoom(null), 3000)
  }
  useEffect(() => {
    if (zoom !== 'in') return
    // drop the flag so a refresh opens home normally
    const q = new URLSearchParams(window.location.search)
    if (q.get('from') === 'galaxy') {
      q.delete('from')
      window.history.replaceState(null, '', `${window.location.pathname}${q.size ? `?${q}` : ''}`)
      const t = setTimeout(() => setZoom(null), 3000)
      return () => clearTimeout(t)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Coming back: today's star travels from its place in her sky to "now" on the arc
  useLayoutEffect(() => {
    if (zoom !== 'in') return
    const el = document.querySelector('.cv-screen'), ov = document.querySelector('.cv-forming.is-in')
    const star = document.querySelector('.cv-arc.is-arc .cv-arc-now .cv-arc-star')
    if (!el || !ov || !star) return
    const r = el.getBoundingClientRect(), b = star.getBoundingClientRect()
    const [tx, ty] = todayOnScreen(el.clientWidth, el.clientHeight)
    const nx = b.left + b.width / 2 - r.left - el.clientLeft, ny = b.top + b.height / 2 - r.top - el.clientTop
    const s = Math.max(el.clientWidth / 1000, el.clientHeight / 625) // the sky's drawing units on this screen
    ov.style.setProperty('--mx', `${(nx - tx) / s}px`)
    ov.style.setProperty('--my', `${(ny - ty) / s}px`)
  }, [zoom])

  return (
    <div className={`cv-page theme-${theme}`}>
      {/* Prototype controls: not part of the bedside screen */}
      <div className="cv-proto" role="toolbar" aria-label="Prototype controls">
        <span className="cv-proto-k">Prototype</span>
        <Seg value={mode} onChange={(m) => { setMode(m); goChapter(m === 'story' ? 'born' : 'day') }} options={[['story', 'Story'], ['bedside', 'Bedside']]} />
        {mode === 'story'
          ? <Seg value={chapter} onChange={goChapter} options={CHAPTERS} />
          : <Seg value={night ? 'night' : 'day'} onChange={(v) => setNight(v === 'night')} options={[['day', 'Day'], ['night', 'Night']]} />}
        <Seg value={theme} onChange={setTheme} options={[['nursery', 'DS1'], ['confetti', 'DS2']]} />
      </div>

      <div className={`cv-screen ${night ? 'is-night' : ''} ${(page === 'galaxy' || page === 'discharge') && !night ? 'is-galaxy' : ''} ${zoom === 'out' ? 'is-forming' : zoom === 'in' ? 'is-unforming' : ''}`} role="region" aria-label="Bedside display"
        style={form ? { '--end': `${form.end}s` } : undefined}
        onPointerMove={(e) => { // the home sky's depth layers lean a little toward the pointer
          const r = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
          e.currentTarget.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
        }}>
        {page === 'home' && !night && <SkyDepth theme={theme} />}
        {zoom && page === 'home' && !night && <FormingOverlay theme={theme} mode={zoom} {...(zoom === 'out' ? form : {})} onSkip={zoom === 'out' ? toSky : undefined} />}
        {page === 'galaxy' && !night && <Galaxy theme={theme} onBack={() => { setSkyExit(0); setChapter('day'); zoomIn() }} onDischarge={() => setPage('discharge')} exit={skyExit} />}
        {page === 'discharge' && !night && <Discharge theme={theme} onBack={() => setPage('galaxy')} />}
        <header className="cv-top" hidden={comfort}>
          <span className="cv-top-left">
            {onSub && page !== 'ahead' && <button type="button" className="cv-back" onClick={() => setPage('home')}>‹ Back</button>}
            {first ? 'Mila · Day 1' : comfort ? 'Mila · Day 41' : page === 'ahead' && !night ? <span className="cv-top-title">What&apos;s ahead</span> : page !== 'progress' || night ? <><button type="button" className="cv-name" onClick={() => setAbout(true)} aria-label="Mila: who she is">Mila</button> · Day {today.day}</> : null}
          </span>
          <span className="cv-clock">{first ? (chapter === 'born' ? '4:20 a.m.' : '5:10 a.m.') : comfort ? '' : night ? today.clock.night : today.clock.label}</span>
        </header>

        {(page === 'galaxy' || page === 'discharge') && !night
          ? null
          : comfort && memory
          ? <LifeSky key="map" theme={theme} life="not" mode="map" />
          : comfort
          ? <Comfort theme={theme} dark={dark} onWake={() => setDark(false)} />
          : first
          ? <FirstDay stage={fstage} theme={theme} walk={walk} setWalk={setWalk} />
          : onSub && page === 'ahead'
          ? <Ahead kind={kind} />
          : onSub && page === 'progress'
          ? <DayView key={`${kind}-p`} d={d} startH={cH} theme={theme} />
          : night
          ? <NightView theme={theme} />
          : <HomeC key={kind} d={d} h={cH} setH={setCH} zoom={zoom} theme={theme} onAhead={() => setPage('ahead')} onZoomOut={zoomOut} />}

        <footer className="cv-actions">
          {/* comfort care: the family decides whether the screen is on at all */}
          {comfort && !dark && !memory && (
            <div className="cv-actions-left">
              <button type="button" className="cv-btn is-quiet" onClick={() => setMemory(true)}><span className="cv-today-icon" aria-hidden="true">✦</span>Her sky</button>
              <button type="button" className="cv-btn is-quiet" onClick={() => setDark(true)}>Turn off the screen</button>
            </div>
          )}
          {comfort && memory && (
            <div className="cv-actions-left">
              <button type="button" className="cv-btn is-quiet cv-today-btn" onClick={() => setMemory(false)}><span className="cv-today-icon" aria-hidden="true">‹</span>Close</button>
            </div>
          )}
          {/* her first day: her nurse can open "What's on her" while explaining */}
          {first && fstage !== 'arrival' && walk == null && (
            <div className="cv-actions-left">
              <button type="button" className="cv-btn is-quiet" onClick={() => setWalk(0)}>What&apos;s on her</button>
            </div>
          )}
          {/* back to today: always bottom left, wherever you are */}
          {page === 'ahead' && !night && (
            <div className="cv-actions-left">
              <button type="button" className="cv-btn is-quiet cv-today-btn" onClick={() => setPage('home')}>
                <span className="cv-today-icon" aria-hidden="true">‹</span>Today
              </button>
            </div>
          )}
          {page === 'galaxy' && !night && (
            <div className="cv-actions-left">
              <button type="button" className={`cv-btn is-quiet cv-today-btn ${skyExit ? 'is-leaving' : ''}`} onClick={() => setSkyExit((n) => n + 1)}>
                <span className="cv-today-icon" aria-hidden="true">‹</span>Today
              </button>
            </div>
          )}
          {onC && (
            <div className="cv-actions-left">
              <button type="button" className="cv-btn is-quiet cv-lookup-btn" onClick={zoomOut}>
                <LookUpIcon />Mila&apos;s stars
              </button>
            </div>
          )}
          {/* her sky is for looking back; contacting her care team belongs with today */}
          {page !== 'galaxy' && page !== 'discharge' && !(comfort && dark) && (
            <button type="button" className="cv-btn is-call" onClick={() => setTeam(true)}>
              <span className="cv-btn-icon" aria-hidden="true">☎</span>Contact care team
            </button>
          )}
        </footer>
      </div>

      {team && <TeamSheet onClose={() => setTeam(false)} />}
      {about && <AboutSheet onClose={() => setAbout(false)} />}
    </div>
  )
}

/* ---------------- Home ---------------- */

// Night: very dim. How she is, the next care time, and today's star.
function NightView({ theme }) {
  // Home, quieter: no arc at night. Today's star, dim; the time, large and soft; one line. All centered,
  // so a glance from the chair in the dark is enough.
  const c = theme === 'confetti'
  return (
    <div className="cv-homec is-night-home">
      <svg className="cv-night-sky" viewBox="400 20 200 120" aria-hidden="true">
        <defs>
          <radialGradient id="cv-night-glow">
            <stop offset="0" stopColor={c ? '#FFF2C2' : '#FFF8E6'} stopOpacity=".35" />
            <stop offset=".4" stopColor={c ? '#FFD23F' : '#F3E3B5'} stopOpacity=".1" />
            <stop offset="1" stopColor={c ? '#FFD23F' : '#F3E3B5'} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="cv-night-glow" cx="500" cy="80" r="44" fill="url(#cv-night-glow)" />
        <path className="cv-night-star" d={`M500 ${80 - 14}L${500 + 3.4} ${80 - 3.4}L${500 + 14} 80L${500 + 3.4} ${80 + 3.4}L500 ${80 + 14}L${500 - 3.4} ${80 + 3.4}L${500 - 14} 80L${500 - 3.4} ${80 - 3.4}Z`}
          fill={c ? '#FFD23F' : '#F3E3B5'} />
      </svg>
      <p className="cv-night-time">{today.clock.night}</p>
      <p className="cv-night-line">Next care 3:00 a.m. · Mila is resting</p>
    </div>
  )
}

// The day view, opened from "Her progress".
// Left: her (Sara's drawing, no panel behind her), today as a line of stars you can drag
// through, and a fixed-height caption. Her wires show as they were at the chosen time.
// Right: the day's list. Picking a past moment moves the star there; nothing else moves.
function DayView({ d, startH, theme }) {
  const items = dayItems(d)
  const nowH = today.clock.h
  const [h, setH] = useState(startH ?? nowH)
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
        <SkyArc shape="line" theme={theme} h={h} nowH={nowH} marks={marks} later={later} glow={Math.min(1, (marks.length + d.saved.length * 2) / 8)} onChange={setH} />
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
// Marks on the arc: care times, changes to her wires, team decisions, firsts, and family moments
// as her nurse notes them. Everything comes from what's recorded at the bedside (no phone app).
function HomeC({ d, h, setH, zoom, theme, onAhead, onZoomOut }) {
  const nowH = today.clock.h
  const atNow = Math.abs(h - nowH) < 0.01
  // Her day so far: feeds and naps, what changed for her, her team's plans, her firsts, and her family's moments
  const marks = [
    ...d.care.filter((c) => c.h <= nowH).map((c) => ({ ...c, kind: 'care' })),
    ...d.changes.map((c) => ({ ...c, kind: 'change' })),
    ...d.decisions.map((x) => ({ ...x, kind: 'decision' })),
    ...(d.firsts ?? []).map((x) => ({ ...x, kind: 'first' })),
    ...d.saved.map((x) => ({ ...x, kind: 'family' })),
  ].sort((a, b) => a.h - b.h)
  const later = [15, 18, 21].filter((x) => x > nowH).map((x) => ({ h: x, kind: 'care' }))
  const current = marks.filter((m) => m.h <= h + 0.001).at(-1)
  const glow = Math.min(1, (marks.length + d.saved.length * 2) / 12)
  const wiredHere = !atNow && d.setup.changes.some((c) => Math.abs(c.h - h) < 0.01)

  return (
    // Pinching out over the sky (a trackpad pinch arrives as ctrl + wheel) opens her stars.
    <div className={`cv-homec ${zoom ? `is-zoom-${zoom}` : ''}`} onWheel={(e) => { if (e.ctrlKey && e.deltaY > 4) onZoomOut() }}>
      <SkyArc h={h} nowH={nowH} marks={marks} later={later} glow={glow} onChange={setH} onFuture={onAhead} theme={theme} gather={zoom} />
      {/* One layout for every moment, always the same size: when, what she did, one line. Nothing jumps. */}
      {/* on a moment that changed what's on her, one tap shows her too, in the same space as the words */}
      <div className={`cv-homec-words cv-cap ${wiredHere ? 'is-wired' : ''}`} aria-live="polite">
        {wiredHere && <HerFigure d={d} h={h} />}
        <div className="cv-cap-text">
        <span className="cv-detail-k">{atNow ? 'Right now' : current ? current.t : hourLabel(h)}</span>
        <p className="cv-cap-title">{atNow ? keepTimes(d.status) : current ? current.short : 'The start of her day'}</p>
        <p className="cv-cap-line">
          {atNow ? <>Next feed <b>{d.next.t}</b> · <span className="cv-you">{d.next.you}</span></> : current?.line ?? ''}
        </p>
        {/* the clinical word, when there is one, in plain English */}
        <p className="cv-cap-term">{(() => { const t = atNow ? d.statusTerm : current?.term; return t ? <><b>{t.word}</b> · {t.means}</> : '' })()}</p>
        </div>
      </div>
    </div>
  )
}

// Her, softly drawn, as she was at that moment: what's new glows, what came off stays as a faint ghost
// Her, as a soft hologram: drag to turn her and see her from another side
function HerFigure({ d, h }) {
  const { present, changed } = setupAt(d, h)
  return (
    <div className="cv-her-fig">
      <HerModel present={present} changed={changed} label="Mila as she was then, with what was on her. Drag to turn her." />
    </div>
  )
}

// A constellation that draws itself, with today's star at its end still twinkling
function LookUpIcon() {
  return (
    <svg className="cv-lookup" viewBox="0 0 34 24" aria-hidden="true">
      <polyline className="cv-lookup-line" points="3,20 10,14 16,17 23,9" />
      <line className="cv-lookup-next" x1="23" y1="9" x2="30" y2="4" />
      {[[3, 20], [10, 14], [16, 17], [23, 9]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" />)}
      <path className="cv-lookup-today" d="M30 0.8L31 3L33.2 4L31 5L30 7.2L29 5L26.8 4L29 3Z" />
    </svg>
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

// A simple outline of a sleeping baby, for "Her progress"
function BabyIcon() {
  return (
    <svg className="cv-btn-icon is-svg" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7" cy="12" r="3.4" />
      <path d="M10.6 12c0-2.2 2-3.4 4.4-3.4h1.6c2.3 0 3.9 1.5 3.9 3.4s-1.6 3.4-3.9 3.4H15c-2.4 0-4.4-1.2-4.4-3.4z" />
    </svg>
  )
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

/* ---------------- Contact care team ---------------- */

// Gentle starting points for the note. A parent can tap one, write their own, or send nothing at all.
const helpPrompts = [
  'Could you come by when you have a moment?',
  'I’d like help holding her.',
  'I have a question about today.',
]

// Who she is, behind her name: her as a person, her age two ways, and what she can sense this week.
function AboutSheet({ onClose }) {
  const a = today.about
  return (
    <div className="cv-scrim" onClick={onClose}>
      <div className="cv-sheet cv-about" role="dialog" aria-label="Mila, who she is" onClick={(e) => e.stopPropagation()}>
        <div className="cv-sheet-head">
          <p className="cv-about-name">Mila</p>
          <button type="button" className="cv-close" onClick={onClose}>Close</button>
        </div>
        <p className="cv-about-age"><b>{a.age}</b> · {a.along}. {a.due}</p>
        <div className="cv-sheet-sec">
          <span className="cv-k">Who she is</span>
          <ul className="cv-about-list">
            {a.traits.map((t) => <li key={t.text}><span>{t.text}</span><em>{t.from}</em></li>)}
          </ul>
        </div>
        <div className="cv-sheet-sec">
          <span className="cv-k">What she can sense this week</span>
          <ul className="cv-about-list is-senses">
            {a.senses.map((t) => <li key={t}><span>{t}</span></li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Parents see who's caring for her, and reach out in one place. The request goes to her nurse
// (the charge nurse covers if she's busy), with an optional note. Urgent help stays with the
// nurse call button by her bed. Steps: team → note → sent.
function TeamSheet({ onClose }) {
  const nurse = today.team.find((p) => p.primary) ?? today.team[0]
  const [step, setStep] = useState('team')
  const [note, setNote] = useState('')
  const title = step === 'team' ? 'Her team right now' : step === 'note' ? `Contact ${nurse.name}` : 'Sent'
  return (
    <div className="cv-scrim" onClick={onClose}>
      <div className="cv-sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="cv-sheet-head">
          <h3>{title}</h3>
          <button type="button" className="cv-close" onClick={onClose}>{step === 'sent' ? 'Done' : 'Close'}</button>
        </div>

        {step === 'team' && (
          <>
            <ul className="cv-team">
              {today.team.map((p) => (
                <li key={p.name} className={p.primary ? 'is-primary' : ''}>
                  <span className="cv-avatar">{p.initials}</span>
                  <span className="cv-who"><b>{p.name}</b><span>{p.role}</span></span>
                </li>
              ))}
            </ul>
            <button type="button" className="cv-help-btn" onClick={() => setStep('note')}>Contact {nurse.name}</button>
            <p className="cv-muted">If it feels urgent, press the nurse call button by her bed.</p>
          </>
        )}

        {step === 'note' && (
          <div className="cv-compose">
            <div className="cv-compose-to">
              <span className="cv-avatar">{nurse.initials}</span>
              <span className="cv-who"><b>{nurse.name}</b><span>{nurse.role}</span></span>
            </div>
            <label className="cv-k" htmlFor="cv-note">Add a note, if you&apos;d like</label>
            <textarea id="cv-note" className="cv-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder={`Write to ${nurse.name}…`} />
            <div className="cv-prompts">
              {helpPrompts.map((p, i) => (
                <button key={p} type="button" className="cv-pill cv-prompt" style={{ '--i': i }}
                  aria-pressed={note === p} onClick={() => setNote(p)}>{p}</button>
              ))}
            </div>
            <button type="button" className="cv-help-btn" onClick={() => setStep('sent')}>Ask for help</button>
            <button type="button" className="cv-compose-back" onClick={() => setStep('team')}>‹ Back to her team</button>
          </div>
        )}

        {step === 'sent' && (
          <div className="cv-sent">
            <div className="cv-asked">
              <p className="cv-sheet-lead">{nurse.name} has been contacted.</p>
              <p>She&apos;ll come by as soon as she can. If she&apos;s with another baby, the charge nurse will come instead.</p>
              {note.trim() && <p className="cv-sent-note">“{note.trim()}”</p>}
            </div>
            <div className="cv-urgent" role="note">
              <span className="cv-urgent-icon" aria-hidden="true">!</span>
              <p>If this is an emergency, press the nurse call button by her bed.</p>
            </div>
          </div>
        )}
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
