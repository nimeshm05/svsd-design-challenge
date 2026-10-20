import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { days, today } from '../data/days.js'
import { glossary } from '../data/glossary.js'
import { Scan } from '../components/Scan.jsx'
import { SkyArc } from './SkyArc.jsx'
import { HerModel } from './HerModel.jsx'
import { FirstDay } from './FirstDay.jsx'
import { Comfort } from './Ending.jsx'
import { Remembering } from './Remembering.jsx'
import { Ahead } from './Ahead.jsx'
import { Galaxy, SkyDepth, FormingOverlay, todayOnScreen, todayFormsAt } from './Galaxy.jsx'
import { Discharge } from './Discharge.jsx'
import { ChevronRight, CloseButton, CloseIcon, NavBack, PhoneIcon, SparkleIcon } from './NavIcons.jsx'
import './current.css'

// Bedside current view: Home C, minimal and low-light, read from the parent chair, in either of
// the two styles from the design board. Every page keeps the same header and "Contact care team"
// in the same corner. Today is an arc across the screen; drag today's star along it. From here:
//   Her progress: the day view (her baby drawing, a line of stars to scrub, the day's list)
//   Her galaxy:   zoom out into her whole stay (galaxy → week → day → moment, after Nimesh's galaxy)
//   What's ahead: her care plans, from the end of the arc
// Review links: ?chapter=born|story|day|sky|home|not  ?page=home|ahead|progress|galaxy|discharge  ?night=1  ?theme=confetti  ?team=1
const qp = (k) => new URLSearchParams(window.location.search).get(k)

const CHAPTERS = [['born', '1 · Mila is born'], ['story', '2 · Her story begins'], ['day', '3 · A day'], ['sky', '4 · Her sky'], ['home', '5 · Going home'], ['not', "6 · If she doesn't go home"]]

// ?embed=1 shows only the bedside screen, filling the window (for the presentation's iPad frame);
// ?chapter=<id> opens on that chapter, and a parent page can switch chapters with postMessage.
const Q = new URLSearchParams(window.location.search)
const EMBED = Q.get('embed') === '1'

export function CurrentView({ onSky }) {
  const kind = 'harder' // Mila is a complex baby: her day is shown as it really goes, setbacks included
  const [night, setNight] = useState(() => qp('night') === '1')
  const [page, setPage] = useState(() => qp('page') || 'home') // 'home' | 'ahead' | 'progress' | 'galaxy' | 'discharge'
  const [cH, setCH] = useState(today.clock.h) // where today's star sits on Home C's arc
  // arriving from the galaxy (?from=galaxy): open mid zoom-in, as if we flew into today's star
  const [zoom, setZoom] = useState(() => (new URLSearchParams(window.location.search).get('from') === 'galaxy' ? 'in' : null)) // 'out' | 'in' while the sky is zooming
  const [theme, setTheme] = useState(() => qp('theme') || 'nursery') // the two styles from the design board
  const [team, setTeam] = useState(() => qp('team') === '1')
  // Her first day (chapters 1 and 2): how her story begins
  // The demo tells her whole story as chapters: born, her story begins, a day in the long middle,
  // her sky, then going home, or, if she doesn't go home, a screen that almost disappears.
  const [chapter, setChapter] = useState(() => qp('chapter') || 'born')
  const [mode, setMode] = useState(() => qp('mode') || 'story') // 'story' (the six chapters) | 'bedside' (just the regular screen, day or night)
  const fstage = chapter === 'born' ? 'arrival' : 'visit'
  const [walk, setWalk] = useState(null) // the "What's on her" walkthrough step, or null
  const first = (chapter === 'born' || chapter === 'story') && !night
  const comfort = chapter === 'not' && !night
  const [dark, setDark] = useState(false) // comfort care: the family can turn the screen off
  const [dayLabel, setDayLabel] = useState(null) // the day number shown in the header, when a presentation asks
  const [memory, setMemory] = useState(false) // her sky, opened only when the family chooses
  const d = today[kind]
  const onSub = page !== 'home' && page !== 'galaxy' && page !== 'discharge' && !night // a page with Back
  const onC = !night && page === 'home' && (chapter === 'day' || chapter === 'sky')
  const skyOpen = !night && (page === 'galaxy' || zoom === 'out') // her sky is open, or opening
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
    if (c === 'sky') setTimeout(() => document.querySelector('.cv-skyt')?.click(), 400) // today becomes a star
  }
  useEffect(() => {
    if (Q.get('chapter')) goChapter(Q.get('chapter'))
    // the presentation can also ask for one feature at a time (mila:show)
    const later = (f, ms = 350) => setTimeout(f, ms)
    const SHOW = {
      first: () => goChapter('born'),
      walk: () => { goChapter('story'); later(() => setWalk(1)) },
      today: () => { goChapter('day'); setCH(today.clock.h) },
      term: () => { goChapter('day'); setCH(today.clock.h); later(() => document.querySelector('.cv-term-btn')?.click(), 500) },
      family: () => { goChapter('day'); later(() => setCH(d.saved[0].h)) },
      ahead: () => { goChapter('day'); later(() => setPage('ahead')) },
      night: () => { goChapter('day'); later(() => setNight(true)) },
      sky: () => goChapter('sky'),
      home: () => goChapter('home'),
      not: () => { goChapter('not'); later(() => setMemory(true)) },
    }
    const on = (e) => {
      if (e.data?.type === 'mila:chapter') goChapter(e.data.chapter)
      if (e.data?.type === 'mila:show') SHOW[e.data.what]?.()
      if (e.data?.type === 'mila:day') setDayLabel(e.data.day ?? null) // a film can show the same screen on another day
    }
    window.addEventListener('message', on)
    return () => window.removeEventListener('message', on)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
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

  // Pinch fingers together = zoom out = up one level, everywhere (a trackpad pinch arrives as ctrl + wheel):
  // Today → Mila's stars; What's ahead or Today so far → Today; the discharge mobile → Mila's stars.
  // Her sky handles its own levels (a day → its week → Mila's stars). Once per gesture.
  const pinchUp = useRef({ x: 0, done: false, t: 0 })
  const upRef = useRef(null)
  upRef.current = () => {
    if (zoom || night) return
    if (page === 'home' && onC) zoomOut()
    else if (page === 'ahead' || page === 'progress') setPage('home')
    else if (page === 'discharge') setPage('galaxy')
  }
  useEffect(() => {
    const el = document.querySelector('.cv-screen')
    if (!el) return
    const onWheel = (e) => {
      if (!e.ctrlKey) return
      e.preventDefault() // never let the browser zoom the page
      if (e.target.closest('.cv-galaxy')) return
      const g = pinchUp.current
      clearTimeout(g.t)
      g.t = setTimeout(() => { g.x = 0; g.done = false }, 220)
      if (g.done || e.deltaY <= 0) return
      g.x += e.deltaY
      if (g.x > 12) { g.done = true; upRef.current() }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className={`cv-page theme-${theme} ${EMBED ? 'is-embed' : ''}`}>
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
        {page === 'galaxy' && !night && <Galaxy theme={theme} onBack={() => { setSkyExit(0); setChapter('day'); zoomIn() }} exit={skyExit} />}
        {page === 'discharge' && !night && <Discharge theme={theme} onBack={() => setPage('galaxy')} />}
        <header className="cv-top" hidden={comfort}>
          <span className="cv-top-left">
            {onSub && <NavBack label="Today" onClick={() => setPage('home')} />}
            {first ? 'Mila · Day 1' : comfort ? 'Mila · Day 41' : page === 'ahead' && !night ? <span className="cv-top-title">What&apos;s ahead</span> : page !== 'progress' || night ? `Mila · Day ${dayLabel ?? today.day}` : null}
          </span>
          <span className="cv-top-right">
            <span className="cv-clock">{first ? (chapter === 'born' ? '4:20 a.m.' : '5:10 a.m.') : comfort ? '' : night ? today.clock.night : today.clock.label}</span>
            {/* her sky is for looking back; contacting her care team belongs with today */}
            {!comfort && page !== 'galaxy' && page !== 'discharge' && (
              <button type="button" className="nav-btn is-call" onClick={() => setTeam(true)}>
                <PhoneIcon /><span>Care team</span>
              </button>
            )}
          </span>
        </header>

        {(page === 'galaxy' || page === 'discharge') && !night
          ? null
          : comfort && memory
          ? <Remembering key="rem" theme={theme} />
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
          : <HomeC key={kind} d={d} h={cH} setH={setCH} zoom={zoom} theme={theme} onAhead={() => setPage('ahead')} />}

        <footer className="cv-actions">
          {/* comfort care: the family decides whether the screen is on at all */}
          {comfort && !dark && !memory && (
            <div className="cv-actions-left">
              <button type="button" className="nav-btn" onClick={() => setMemory(true)}><SparkleIcon /><span>Her sky</span></button>
              <button type="button" className="nav-btn" onClick={() => setDark(true)}><span>Turn off the screen</span></button>
            </div>
          )}
          {/* "What's on her" lives in the content now, centred under her words (FirstDay) */}
          {/* back to today lives top-left with every other "back" (see NavBack) */}
          {/* "Mila's stars" opens her sky; in the same place it becomes "Close", which brings you back.
              One element on both pages, so it morphs instead of disappearing and reappearing. */}
          {(onC || skyOpen) && (
            <div className="cv-actions-left">
              <SkyToggle open={skyOpen} busy={zoom === 'out'} onOpen={zoomOut} onClose={() => setSkyExit((n) => n + 1)} />
            </div>
          )}
          {onC && (
            <button type="button" className="nav-btn is-primary is-trailing cv-ahead-btn" onClick={() => setPage('ahead')}>
              <span>What&apos;s ahead</span><ChevronRight />
            </button>
          )}
          {/* with the screen almost gone, her care team stays down here, the one thing on it */}
          {comfort && !dark && (
            <button type="button" className="nav-btn is-call" onClick={() => setTeam(true)}>
              <PhoneIcon /><span>Care team</span>
            </button>
          )}
        </footer>
      </div>

      {team && <TeamSheet onClose={() => setTeam(false)} />}
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
function HomeC({ d, h, setH, zoom, theme, onAhead }) {
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
  const one = atNow ? d.statusOne ?? d.status : current ? current.one ?? current.short : 'The start of her day'
  const when = atNow ? <>Right now · Next feed <b>{d.next.t}</b></>
    : !current ? hourLabel(h)
    : current.kind === 'family' ? `${current.t} · ${current.from}`
    : current.kind === 'decision' ? `${current.t} · ${current.team} team · ${current.status === 'decided' ? 'Decided' : 'Still deciding'}`
    : current.kind === 'first' ? `${current.t} · A first`
    : current.t

  return (
    <div className={`cv-homec ${zoom ? `is-zoom-${zoom}` : ''}`}>
      <SkyArc h={h} nowH={nowH} marks={marks} later={later} glow={glow} onChange={setH} onFuture={onAhead} theme={theme} gather={zoom} />
      {/* One layout for every moment, always the same size: when, what she did, one line. Nothing jumps. */}
      {/* on a moment that changed what's on her, one tap shows her too, in the same space as the words */}
      {/* One line for every moment: when, then what happened, always on one line. A clinical word in it
          can be tapped for what it means; on a moment that changed what's on her, she is there too. */}
      <div className="cv-homec-words cv-cap" aria-live="polite">
        <span className="cv-detail-k">{when}</span>
        <OneLine key={one} text={one} d={d} h={h} />
      </div>
    </div>
  )
}

// Clinical words, in plain English. Glossary entries (Sara's) give the fuller explanation where they exist.
const TERMS = {
  cpap: { word: 'CPAP', g: 'CPAP mask', device: 'cpap', means: 'a small mask that gives steady air pressure so her lungs stay open' },
  'nasal cannula': { word: 'Nasal cannula', g: 'Nasal cannula', device: 'cannula', means: 'soft prongs in her nose that give a gentle flow of air' },
  'oxygen dips': { word: 'Oxygen dips', stands: 'Her team may call them desats (desaturations)', means: 'her oxygen level dropping for a moment; her nurse watches closely and helps' },
  'feeding tube': { word: 'Feeding tube', g: 'Feeding tube', device: 'feeding', means: 'a thin tube through her nose to her tummy that carries her milk' },
}

// Her status on one line: shrinks a little to fit the width rather than wrapping. [Words] in brackets are
// clinical terms: a tap opens what they mean in a small popover; when the term is something on her, her 3D
// model is there too, with it lit.
function OneLine({ text, d, h }) {
  const p = useRef(null)
  const [open, setOpen] = useState(null)
  useLayoutEffect(() => {
    const el = p.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = ''
      let fs = parseFloat(getComputedStyle(el).fontSize)
      while (el.scrollWidth > el.clientWidth + 1 && fs > 16) { fs -= 1; el.style.fontSize = `${fs}px` }
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [text])
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!e.target.closest?.('.cv-pop, .cv-term-btn')) setOpen(null) }
    const key = (e) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', key) }
  }, [open])
  const parts = text.split(/\[([^\]]+)\]/)
  const t = open && TERMS[open.toLowerCase()]
  const g = t?.g && glossary[t.g]
  return (
    <>
      <p ref={p} className="cv-cap-title cv-one">
        {parts.map((s, i) => (i % 2
          ? <button key={i} type="button" className={`cv-term-btn ${open === s ? 'is-open' : ''}`} aria-expanded={open === s} onClick={() => setOpen(open === s ? null : s)}>{s}</button>
          : <Fragment key={i}>{s}</Fragment>))}
      </p>
      {t && (
        <div className="cv-pop" role="dialog" aria-label={`${t.word}: what it means`}>
          {t.device && <HerFigure d={d} h={h} device={t.device} />}
          <p className="cv-pop-word">{t.word}</p>
          {(g?.stands ?? t.stands) && <p className="cv-pop-stands">{g?.stands ?? t.stands}</p>}
          <p className="cv-pop-means">{g?.body ?? `${t.means[0].toUpperCase()}${t.means.slice(1)}.`}</p>
        </div>
      )}
    </>
  )
}

// Her, softly drawn, as she was at that moment: what's new glows, what came off stays as a faint ghost
// Her, as a soft hologram: drag to turn her and see her from another side
// device: the thing a term names, lit on her (shown in place of the breathing help it stands in for)
const SWAPS = { cpap: 'cannula', cannula: 'cpap' }
function HerFigure({ d, h, device }) {
  let { present, changed } = setupAt(d, h)
  if (device) { present = [...present.filter((x) => x !== SWAPS[device]), ...(present.includes(device) ? [] : [device])]; changed = [device] }
  return (
    <div className="cv-her-fig">
      <HerModel present={present} changed={changed} label="Mila, with what was on her. Drag to turn her." />
    </div>
  )
}

// A constellation that draws itself, with today's star at its end still twinkling
function LookUpIcon() {
  return (
    <svg className="cv-lookup" viewBox="1.2 0 32.6 22" aria-hidden="true">
      <polyline className="cv-lookup-line" points="3,20 10,14 16,17 23,9" />
      <line className="cv-lookup-next" x1="23" y1="9" x2="30" y2="4" />
      {[[3, 20], [10, 14], [16, 17], [23, 9]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" />)}
      <path className="cv-lookup-today" d="M30 0.8L31 3L33.2 4L31 5L30 7.2L29 5L26.8 4L29 3Z" />
    </svg>
  )
}

// The button that opens her sky and, once it's open, closes it again from the same spot.
// Icon and label cross-fade; the width animates between the two measured widths.
function SkyToggle({ open, busy, onOpen, onClose }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const [a, b] = el.querySelectorAll('.cv-skyt-label > span')
    el.style.setProperty('--wa', `${a.scrollWidth}px`)
    el.style.setProperty('--wb', `${b.scrollWidth}px`)
  }, [])
  return (
    <button ref={ref} type="button" className={`nav-btn cv-skyt ${open ? 'is-open' : ''}`} aria-disabled={busy || undefined}
      aria-label={open ? "Close Mila's stars" : "Mila's stars"} onClick={busy ? undefined : open ? onClose : onOpen}>
      <span className="cv-skyt-ic" aria-hidden="true"><LookUpIcon /><CloseIcon /></span>
      <span className="cv-skyt-label" aria-hidden="true"><span>Mila&apos;s stars</span><span>Close</span></span>
    </button>
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
// Parents see who's caring for her, and reach out in one place. The request goes to her nurse
// (the charge nurse covers if she's busy), with an optional note. Urgent help stays with the
// nurse call button by her bed. Steps: team → note → sent.
// Who's caring for her: the people, her nurse today first, and one way to call her nurse.
// "Role, available until 7 p.m." (or "from 7 p.m." for someone whose shift hasn't started)
const availability = (p) => `${p.role}, available ${p.from ? `from ${p.from}` : `until ${p.until}`}`

function TeamSheet({ onClose }) {
  const nurse = today.team.find((p) => p.primary) ?? today.team[0]
  const people = [nurse, ...today.team.filter((p) => p !== nurse)]
  const [call, setCall] = useState(null) // null | 'calling' | 'called'
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  // no Close button: tap outside the sheet, or press Esc
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const ring = () => { setCall('calling'); timer.current = setTimeout(() => setCall('called'), 1400) }
  return (
    <div className="cv-scrim ts-scrim" onClick={onClose}>
      <div className="ts" role="dialog" aria-modal="true" aria-labelledby="ts-title" onClick={(e) => e.stopPropagation()}>
        <header className="ts-head">
          <h2 id="ts-title" className="ts-title">Her care team</h2>
        </header>
        <ul className="ts-list">
          {people.map((p) => (
            <li key={p.name} className={p.from ? 'is-later' : ''}>
              <img className="ts-photo" src={p.photo ?? p.img} alt="" onError={(e) => { if (p.img && !e.currentTarget.src.endsWith(p.img)) e.currentTarget.src = p.img }} />
              <span className="ts-person"><b>{p.name}</b><span>{availability(p)}</span></span>
            </li>
          ))}
        </ul>
        <button type="button" className={`nav-btn is-primary ts-cta ts-call ${call ? `is-${call}` : ''}`} disabled={!!call} onClick={ring}>
          {call === 'called' ? <CheckIcon /> : <PhoneIcon />}
          <span aria-live="polite">{call === 'calling' ? 'Calling…' : call === 'called' ? 'Called' : 'Call'}</span>
        </button>
      </div>
    </div>
  )
}

function CheckIcon() {
  return <svg className="nav-ic" viewBox="4 5 16 14" aria-hidden="true"><path d="M6 12.5l4 4 8-9" /></svg>
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
