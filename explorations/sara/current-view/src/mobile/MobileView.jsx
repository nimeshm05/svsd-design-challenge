import { useState } from 'react'
import { FIRST_DAY, LAST_DAY, selectedDevice } from '../data/days.js'
import { CloseIcon, ConstellationIcon, DayIcon, MarkerIcon, PlanetHeroArt } from '../components/Icons.jsx'
import { DeviceChips, Scan } from '../components/Scan.jsx'
import { ScrollArea } from '../components/ScrollArea.jsx'
import { Legend, MarkLine } from '../components/Timeline.jsx'
import { useDayState } from '../components/useDayState.js'
import './mobile.css'

const SKY_DOTS = [
  [34, 70, 3, '#C9D3D9'], [92, 34, 4, '#E8EEF2'], [150, 82, 3, '#9AA7B0'], [206, 46, 5, '#E8EEF2'],
  [252, 76, 3, '#C9D3D9'], [60, 220, 4, '#C9D3D9'], [140, 300, 5, '#E8EEF2'], [230, 260, 3, '#9AA7B0'],
  [300, 380, 4, '#E8EEF2'], [80, 470, 3, '#C9D3D9'], [190, 560, 5, '#E8EEF2'],
]

const SHIFTS = [
  { id: 'n1', label: 'Night', hours: '12–7 a.m.', from: 0, to: 7, flex: 7, who: '[Night nurse] (N1)', bg: '#26313A' },
  { id: 'day', label: 'Day · Priya', hours: '7 a.m.–7 p.m.', from: 7, to: 19, flex: 12, who: 'Priya', bg: '#222B32' },
  { id: 'n2', label: 'Night', hours: '7 p.m.–12 a.m.', from: 19, to: 24, flex: 5, who: '[Night nurse] (N2)', bg: '#26313A' },
]

function hourLabel(x) {
  const hr = Math.round(x) % 24
  const n = hr % 12 === 0 ? 12 : hr % 12
  return n + (hr < 12 ? 'a' : 'p')
}

// "Her 24 hours": the whole day, or tap a shift to zoom into it
function Hours({ day, onOpenLog }) {
  const [shiftId, setShiftId] = useState(null)
  const cur = SHIFTS.find((s) => s.id === shiftId)
  const win = cur ? { from: cur.from, to: cur.to } : { from: 0, to: 24 }
  const inWin = day.events.filter((e) => e.h >= win.from && e.h < win.to)
  const timed = inWin.filter((e) => e.cat !== 'moment')
  const tickCount = cur ? 3 : 5
  const ticks = Array.from({ length: tickCount }, (_, i) => hourLabel(win.from + (win.to - win.from) * i / (tickCount - 1)))

  return (
    <section className="m-card m-hours">
      <div className="m-row">
        <div className="eyebrow">{cur ? `${cur.label.split(' · ')[0].toUpperCase()} · ${cur.hours}` : 'HER 24 HOURS'}</div>
        {cur
          ? <button type="button" className="m-link m-link-sm" onClick={() => setShiftId(null)}>Show all 24 hours</button>
          : <button type="button" className="m-link m-link-sm" onClick={onOpenLog}>Every event</button>}
      </div>

      <div role="group" aria-label="Show one shift" className="m-shifts">
        {SHIFTS.map((s) => {
          const on = s.id === shiftId
          return (
            <button key={s.id} type="button" aria-pressed={on} className={`m-shift ${on ? 'is-selected' : ''}`}
              style={{ flex: s.flex, background: on ? undefined : s.bg }}
              onClick={() => setShiftId(on ? null : s.id)}>
              <span>{s.label}</span><span className="m-shift-hours">{s.hours}</span>
            </button>
          )
        })}
      </div>

      <MarkLine events={inWin} from={win.from} to={win.to} hollow="var(--card)" className="m-mark-line" />
      <div className="ticks">{ticks.map((t, i) => <span key={i}>{t}</span>)}</div>

      {cur && (
        <div className="m-shift-list">
          <div className="m-shift-summary">
            {timed.length} {timed.length === 1 ? 'thing' : 'things'} happened · cared for by {cur.who}
          </div>
          {inWin.map((e) => (
            <div key={e.t + e.title} className="m-shift-row">
              <span className="m-time">{e.t}</span>
              <div className="m-col2"><span className="m-shift-title">{e.title}</span><span className="m-by">{e.by}</span></div>
            </div>
          ))}
        </div>
      )}

      <Legend />
    </section>
  )
}

function Accordion({ id, title, sub, state, children }) {
  const isOpen = state.acc[id]
  return (
    <div className={`m-acc-box ${isOpen ? 'is-open' : ''}`}>
      <button ref={state.refs[id]} type="button" aria-expanded={isOpen} className="m-acc" onClick={() => state.toggle(id)}>
        <span className="m-acc-text"><span className="m-acc-title">{title}</span><span className="m-acc-sub">{sub}</span></span>
        <span className="m-acc-label">{isOpen ? 'Hide ▴' : 'Show ▾'}</span>
      </button>
      {isOpen && <div className="m-acc-body">{children}</div>}
    </div>
  )
}

function Sheet({ day, onClose, goTo }) {
  const state = useDayState(day)
  const planet = day.kind === 'planet'
  const sel = selectedDevice(state.device)
  const peopleCount = day.team.reduce((n, s) => n + s.people.length, 0)

  return (
    <ScrollArea role="dialog" aria-modal="true" aria-labelledby="m-day-title" className="m-sheet">
      {/* Sticky header */}
      <div className="m-header" data-scroll-header>
        <div aria-hidden="true" className="m-grabber" />
        <div className="m-header-row">
          <DayIcon kind={day.kind} size={24} />
          <div className="m-title">
            <h2 id="m-day-title">Mila · Day {day.day}</h2>
            <div className="m-subtitle">{day.dateShort} · Corrected age {day.correctedAge}</div>
          </div>
          <button type="button" aria-label="Close" className="m-close" onClick={onClose}><CloseIcon /></button>
        </div>
      </div>

      <div className="m-body">
        {/* Day navigation + constellation */}
        <div className="m-nav">
          <span className="m-tag"><ConstellationIcon width={14} height={10} />{day.constellation}</span>
          <div className="m-nav-days">
            <button type="button" className="m-pill" aria-label={`Previous day, Day ${day.day - 1}`}
              disabled={day.day <= FIRST_DAY} onClick={() => goTo(day.day - 1)}>‹ Day {day.day - 1}</button>
            <button type="button" className="m-pill" aria-label={`Next day, Day ${day.day + 1}`}
              disabled={day.day >= LAST_DAY} onClick={() => goTo(day.day + 1)}>Day {day.day + 1} ›</button>
          </div>
        </div>

        {/* Planet days lead with the milestone */}
        {day.milestone && (
          <>
            <section aria-labelledby="m-milestone-title" className="m-milestone">
              <div className="m-milestone-top">
                <PlanetHeroArt width={100} height={80} />
                <span className="m-milestone-tag">{day.milestone.tag}</span>
              </div>
              <div className="m-milestone-eyebrow">{day.milestone.eyebrow}</div>
              <h3 id="m-milestone-title">{day.milestone.title}</h3>
              <p>{day.milestone.text}</p>
              <span className="m-milestone-meta">{day.milestone.meta}</span>
              <div className="m-milestone-actions">
                <button type="button" className="m-btn-gold">Add a photo or note</button>
                <button type="button" className="m-btn-gold-outline">Share with family</button>
              </div>
            </section>
            <div className="m-divider">
              <div className="eyebrow">THE REST OF HER DAY</div>
              <div className="m-rule" />
            </div>
          </>
        )}

        {/* 1. How she is */}
        <section className="m-how">
          <div className="eyebrow">{day.howHeading}</div>
          <p className={`m-headline ${planet ? 'is-secondary' : ''}`}>{day.headline}</p>
          <p className="m-summary">{day.summary}</p>
          <div className="m-summary-by">{day.summaryBy}</div>
        </section>

        {/* 2. Three things */}
        <section className="m-card m-things">
          <div className="eyebrow">3 THINGS TO KNOW TODAY</div>
          <ol>
            {day.things.map((t, i) => (
              <li key={t.title}>
                <span className="m-num">{i + 1}</span>
                <div className="m-col">
                  <span className="m-thing-title">{t.title}{t.isNew && <> <span className="badge-new">NEW</span></>}</span>
                  <span className="m-thing-body">{t.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. What she looked like */}
        <section className="m-card">
          <div className="m-row">
            <div className="eyebrow">WHAT SHE LOOKED LIKE</div>
            <button type="button" aria-pressed="false" className="m-pill m-pill-xs">Compare Day {day.day - 1}</button>
          </div>
          <Scan device={state.device} height={210} />
          <div className="m-row baseline">
            <span className="m-label">What&apos;s helping her today</span>
            <span className="m-hint">Swipe for more</span>
          </div>
          <DeviceChips device={state.device} onPick={state.setDevice} className="m-device-chips" />
          <div className="m-device-info">
            <div className="m-row baseline">
              <span className="m-device-title">{sel.title}</span>
              <span className="m-device-route">{sel.route}</span>
            </div>
            <span className="m-device-text">{sel.text}</span>
          </div>
        </section>

        {/* 4. Her day */}
        <section className="m-card m-her-day">
          <div className="m-row">
            <div className="eyebrow">HER DAY</div>
            <button type="button" className="m-link" onClick={() => state.openOnly('log')}>Every event</button>
          </div>
          <div className="m-day-parts">
            {day.dayParts.map((p) => (
              <div key={p.name} className={`m-day-part ${p.highlight ? 'is-highlight' : ''}`}>
                <span className="m-day-part-name">{p.name}</span>
                <span className="m-day-part-hours">{p.hours}</span>
                <span className="m-day-part-text">{p.text}</span>
              </div>
            ))}
          </div>
          <div className="m-coming-up">
            <span className="m-coming-up-label">COMING UP</span>
            <span>{day.comingUp}</span>
          </div>
        </section>

        {/* 5. Her 24 hours */}
        <Hours day={day} onOpenLog={() => state.openOnly('log')} />

        {/* 6. Her nurse */}
        <section className="m-nurse">
          <div className="m-nurse-avatar">P</div>
          <div className="m-col m-grow">
            <span className="m-nurse-name">Priya was her nurse today</span>
            <span className="m-nurse-sub">7 a.m. – 7 p.m. · Ask for her by name</span>
          </div>
          <button type="button" className="m-pill m-pill-sm" onClick={() => state.openOnly('team')}>Team</button>
        </section>

        {/* More detail */}
        <div className="m-more-head">
          <h3>More detail</h3>
          <div>Tap a section to open it.</div>
        </div>

        <div className="m-accs">
          <Accordion id="team" title="Who cared for Mila" sub={`${peopleCount} people, ${day.team.length} shifts`} state={state}>
            <div className="m-card m-team">
              {day.team.map((s, i) => (
                <div key={s.shift} className="m-team-shift">
                  <div className={`m-shift-label ${i > 0 ? 'is-spaced' : ''}`}>{s.shift}</div>
                  {s.people.map((p) => (
                    <div key={p.initials} className="m-team-person">
                      <b>{p.name}</b> <span>· {p.primary ? 'Primary nurse' : p.role}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion id="log" title="Everything that happened" sub={`${day.events.length} entries, with times and names`} state={state}>
            <div className="m-log">
              <div role="group" aria-label="Filter events" className="m-filter-chips">
                {state.chips.map((c) => (
                  <button key={c.id} type="button" aria-pressed={c.selected} className={`m-filter-chip ${c.selected ? 'is-selected' : ''}`}
                    onClick={() => state.setFilter(c.id)}>{c.label} · {c.count}</button>
                ))}
              </div>
              {state.shown.map((e) => (
                <div key={e.t + e.title} className="m-log-row">
                  <span className="m-time">{e.t}</span>
                  <div className="m-col m-gap4">
                    <div className="m-log-title">{e.title}</div>
                    <div className="m-log-plain">{e.plain}</div>
                    {e.med && <div className="mono m-mono-sm">Chart: {e.med}</div>}
                    <div className="m-log-meta">
                      <span className="m-type-tag">{e.label}</span>
                      <span className="m-by">{e.by}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion id="meds" title="Medicines" sub={`${day.meds.length} given today, and why`} state={state}>
            <div className="m-meds">
              {day.meds.map((m) => (
                <div key={m.name} className="m-med">
                  <div className="m-row baseline">
                    <span className="m-med-name">{m.name}</span>
                    <span className="m-med-when">{m.when.startsWith('Every') ? m.when : `${m.when} · ${m.by}`}</span>
                  </div>
                  <span className="m-med-why">{m.why}</span>
                  <span className="mono m-mono-sm">{m.chart}</span>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion id="notes" title="Conversations and your notes" sub="What the team told you" state={state}>
            <div className="m-notes">
              {day.notes.map((n) => (
                <div key={n.meta} className="m-note">
                  <div className="m-note-meta">{n.meta}</div>
                  <div className="m-note-text">{n.text}</div>
                  <div className="m-note-meta">{n.by}</div>
                </div>
              ))}
              <label htmlFor="m-parent-note" className="m-label-lg">Your notes for this day</label>
              <textarea id="m-parent-note" rows={3} placeholder="A question to ask tomorrow…" />
              <button type="button" className="m-btn-solid">Save note</button>
              <button type="button" className="m-btn-dashed">Doesn&apos;t match what you were told? Flag it</button>
            </div>
          </Accordion>
        </div>

        <footer className="m-footer">
          <div>From Mila&apos;s hospital chart · times show when care was recorded</div>
          <div className="m-footer-actions">
            <button type="button" className="m-pill m-grow">Save as PDF</button>
            <button type="button" className="m-pill m-pill-strong m-grow" onClick={onClose}>Back to sky</button>
          </div>
        </footer>
      </div>
    </ScrollArea>
  )
}

export function MobileView({ day, open, setOpen, goTo }) {
  return (
    <div className={`m-screen ${day.kind === 'planet' ? 'is-planet' : ''}`}>
      {/* Sky (behind the sheet) */}
      <div aria-hidden="true" className="m-sky">
        {SKY_DOTS.map(([x, y, s, c], i) => (
          <span key={i} style={{ left: x, top: y, width: s, height: s, borderRadius: Math.ceil(s / 2), background: c }} />
        ))}
        <svg width="390" height="844" viewBox="0 0 390 844"><path d="M92 36 L150 84 L206 48 L252 78 L318 56" fill="none" stroke="#56636C" strokeWidth="1" strokeDasharray="4 4" /></svg>
      </div>
      <div className="m-sky-title">Mila&apos;s sky</div>

      {/* The current day: opens / closes the sheet */}
      <button type="button" aria-label={day.openLabel} className="m-day-marker" onClick={() => setOpen(!open)}>
        <span className="ring-outer" />
        <span className="ring-inner" />
        <MarkerIcon kind={day.kind} size={day.kind === 'planet' ? 26 : 20} />
      </button>

      {!open && (
        <div className="m-tooltip">
          <span className="m-tooltip-title">{day.tooltip.title}</span>
          <span className="m-tooltip-sub">{day.kind === 'planet' ? day.tooltip.sub : 'Tap the lit star to open the day'}</span>
        </div>
      )}

      {open && (
        <>
          {/* The strip of sky above the sheet closes it */}
          <button type="button" aria-label="Close and go back to the sky" className="m-scrim" onClick={() => setOpen(false)} />
          <div className="m-close-hint">Tap the sky to close</div>
          <Sheet key={day.day} day={day} onClose={() => setOpen(false)} goTo={goTo} />
        </>
      )}
    </div>
  )
}
