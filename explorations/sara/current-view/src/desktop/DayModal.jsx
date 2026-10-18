import { FIRST_DAY, LAST_DAY, countByCat } from '../data/days.js'
import { ConstellationIcon, CloseIcon, DayIcon, PlanetHeroArt, PlayIcon } from '../components/Icons.jsx'
import { DeviceChips, Scan } from '../components/Scan.jsx'
import { ScrollArea } from '../components/ScrollArea.jsx'
import { Legend, MarkLine } from '../components/Timeline.jsx'
import { useDayState } from '../components/useDayState.js'

function Person({ p }) {
  return (
    <div className="person">
      <div className={`avatar ${p.primary ? 'is-primary' : ''}`}>{p.initials}</div>
      <div className="person-text"><span className="person-name">{p.name}</span><span className="person-role">{p.role}</span></div>
    </div>
  )
}

function TeamList({ shifts, leadingRule = false }) {
  return shifts.map((s, i) => (
    <div key={s.shift} className="team-shift">
      {(i > 0 || leadingRule) && <div className="hr" />}
      <div className="shift-label">{s.shift}</div>
      {s.people.map((p) => <Person key={p.initials} p={p} />)}
    </div>
  ))
}

function Accordion({ id, title, sub, state, children }) {
  const isOpen = state.acc[id]
  return (
    <div className={`acc ${isOpen ? 'is-open' : ''}`}>
      <button ref={state.refs[id]} type="button" aria-expanded={isOpen} className="acc-btn" onClick={() => state.toggle(id)}>
        <span className="acc-text"><span className="acc-title">{title}</span><span className="acc-sub">{sub}</span></span>
        <span className="acc-label">{isOpen ? 'Hide ▴' : 'Show ▾'}</span>
      </button>
      {isOpen && <div className="acc-body">{children}</div>}
    </div>
  )
}

export function DayModal({ day, onClose, goTo }) {
  const state = useDayState(day)
  const planet = day.kind === 'planet'
  const counts = countByCat(day.events)
  const peopleCount = day.team.reduce((n, s) => n + s.people.length, 0)

  return (
    <>
      {/* Scrim: the sky around the modal closes it */}
      <button type="button" aria-label="Close and go back to the sky" className="desk-scrim" onClick={onClose} />

      <div className="close-hint">Tap outside to go back to the sky</div>

      <ScrollArea role="dialog" aria-modal="true" aria-labelledby="day-title" className="modal">
        {/* Sticky header */}
        <div className="modal-header" data-scroll-header>
          <DayIcon kind={day.kind} size={30} />
          <div className="modal-title">
            <h2 id="day-title">Mila · Day {day.day}</h2>
            <div className="modal-subtitle">{day.dateLong} · Corrected age {day.correctedAge}</div>
          </div>
          <div className="header-tags">
            <span className="tag-dashed"><ConstellationIcon />{day.constellation}</span>
            {day.milestone && <span className="tag-milestone">{day.milestone.tag}</span>}
          </div>
          <div className="header-actions">
            <button type="button" className="pill" aria-label={`Previous day, Day ${day.day - 1}`}
              disabled={day.day <= FIRST_DAY} onClick={() => goTo(day.day - 1)}>‹ Day {day.day - 1}</button>
            <button type="button" className="pill" aria-label={`Next day, Day ${day.day + 1}`}
              disabled={day.day >= LAST_DAY} onClick={() => goTo(day.day + 1)}>Day {day.day + 1} ›</button>
            <button type="button" aria-label="Close" className="close-btn" onClick={onClose}><CloseIcon /></button>
          </div>
        </div>

        <div className="modal-body">
          {day.milestone && (
            <>
              <section aria-labelledby="milestone-title" className="milestone">
                <PlanetHeroArt />
                <div className="milestone-text">
                  <div className="milestone-eyebrow">{day.milestone.eyebrow}</div>
                  <h3 id="milestone-title">{day.milestone.title}</h3>
                  <p>{day.milestone.text}</p>
                  <div className="milestone-actions">
                    <span className="milestone-meta">{day.milestone.meta}</span>
                    <button type="button" className="btn-gold">Add a photo or note</button>
                    <button type="button" className="btn-gold-outline">Share with family</button>
                  </div>
                </div>
              </section>
              <div className="divider-label">
                <div className="eyebrow">THE REST OF HER DAY</div>
                <div className="divider-rule" />
              </div>
            </>
          )}

          {/* First view: calm overview */}
          <div className="overview">
            {/* Left: words first */}
            <div className="overview-left">
              <section className="how">
                <div className="eyebrow">{day.howHeading}</div>
                <p className={`headline ${planet ? 'is-secondary' : ''}`}>{day.headline}</p>
                <p className="summary">{day.summary}</p>
                <div className="summary-by">{day.summaryBy}</div>
              </section>

              <section className="card things">
                <div className="eyebrow">3 THINGS TO KNOW TODAY</div>
                <ol>
                  {day.things.map((t, i) => (
                    <li key={t.title}>
                      <span className="num">{i + 1}</span>
                      <div className="thing-text">
                        <span className="thing-title">{t.title}{t.isNew && <> <span className="badge-new">NEW</span></>}</span>
                        <span className="thing-body">{t.text}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="outline-card team">
                <div className="eyebrow">WHO CARED FOR MILA</div>
                <TeamList shifts={day.team.slice(1)} leadingRule />
              </section>
            </div>

            {/* Right: what she looked like + her day */}
            <div className="overview-right">
              <section className="card scan-card">
                <div className="row-between">
                  <div className="eyebrow">WHAT SHE LOOKED LIKE TODAY</div>
                  <button type="button" aria-pressed="false" className="pill pill-sm">Compare with Day {day.day - 1}</button>
                </div>
                <Scan device={state.device} height={200} />
                <div className="player">
                  <button type="button" aria-label="Play recording" className="play-btn"><PlayIcon /></button>
                  <div className="scrubber"><div className="scrubber-fill" /><div className="scrubber-knob" /></div>
                  <div className="player-meta">7:40 a.m. · Priya</div>
                </div>
                <div className="row-between baseline">
                  <span className="label-strong">What&apos;s helping her today</span>
                  <span className="hint">Tap one to see where it is on her body</span>
                </div>
                <DeviceChips device={state.device} onPick={state.setDevice} />
              </section>

              <section className="card her-day">
                <div className="row-between">
                  <div className="eyebrow">HER DAY</div>
                  <button type="button" className="link-btn" onClick={() => state.openOnly('log')}>See every event, with times</button>
                </div>
                <div className="day-parts">
                  {day.dayParts.map((p) => (
                    <div key={p.name} className={`day-part ${p.highlight ? 'is-highlight' : ''}`}>
                      <span className="day-part-name">{p.name}</span>
                      <span className="day-part-hours">{p.hours}</span>
                      <span className="day-part-text">{p.text}</span>
                    </div>
                  ))}
                </div>
                <div className="coming-up">
                  <span className="coming-up-label">COMING UP</span>
                  <span className="coming-up-text">{day.comingUp}</span>
                </div>
              </section>
            </div>

            <section className="card hours-strip">
              <div className="row-between">
                <div className="eyebrow">HER 24 HOURS</div>
                <button type="button" className="link-btn link-btn-sm" onClick={() => state.openOnly('log')}>See every event</button>
              </div>
              <div className="shift-bar">
                <div style={{ width: '29.17%' }}>Night</div>
                <div style={{ width: '50%' }} className="is-day">Day · Priya</div>
                <div style={{ width: '20.83%' }}>Night</div>
              </div>
              <MarkLine events={day.events} hollow="var(--card)" />
              <div className="ticks"><span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span></div>
              <Legend />
            </section>
          </div>

          {/* Scroll cue */}
          <div className="scroll-cue">
            <div className="divider-rule" />
            <div>Want more detail? Scroll down ↓</div>
            <div className="divider-rule" />
          </div>

          {/* More detail: collapsed sections */}
          <div className="more-detail-head">
            <h3>More detail</h3>
            <div>Tap a section to open it. Everything here comes from Mila&apos;s hospital chart.</div>
          </div>

          <Accordion id="team" title="Who cared for Mila" sub={`${peopleCount} people across ${day.team.length} shifts`} state={state}>
            <section className="outline-card team">
              <div className="eyebrow">WHO CARED FOR MILA</div>
              <TeamList shifts={day.team} />
            </section>
          </Accordion>

          <Accordion id="log" title="Everything that happened" sub={`${day.events.length} entries, each with the time and who did it`} state={state}>
            <section className="outline-card log-strip">
              <div className="row-between wrap">
                <div className="eyebrow">HER 24 HOURS</div>
                <Legend counts={counts} className="legend-lg" />
              </div>
              <div className="shift-bar shift-bar-lg">
                <div style={{ width: '29.17%' }}>Night · N1</div>
                <div style={{ width: '50%' }} className="is-day">Day · Priya</div>
                <div style={{ width: '20.83%' }}>Night · N2</div>
              </div>
              <MarkLine events={day.events} size="lg" hollow="var(--sheet)" />
              <div className="ticks">
                {['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p', '12a'].map((t, i) => <span key={i}>{t}</span>)}
              </div>
            </section>
            <section className="outline-card event-log">
              <div className="row-between wrap">
                <div className="eyebrow">EVERYTHING THAT HAPPENED</div>
                <div role="group" aria-label="Filter events" className="filter-chips">
                  {state.chips.map((c) => (
                    <button key={c.id} type="button" aria-pressed={c.selected} className={`filter-chip ${c.selected ? 'is-selected' : ''}`}
                      onClick={() => state.setFilter(c.id)}>{c.label} · {c.count}</button>
                  ))}
                </div>
              </div>
              <div className="log-grid log-head"><span>TIME</span><span>TYPE</span><span>WHAT HAPPENED</span><span>WHO</span></div>
              <div>
                {state.shown.map((e) => (
                  <div key={e.t + e.title} className="log-grid log-row">
                    <span className="log-time">{e.t}</span>
                    <span className="type-tag">{e.label}</span>
                    <div className="log-what">
                      <div className="log-title">{e.title}</div>
                      <div className="log-plain">{e.plain}</div>
                      {e.med && <div className="mono">Chart: {e.med}</div>}
                    </div>
                    <span className="log-by">{e.by}</span>
                  </div>
                ))}
              </div>
            </section>
          </Accordion>

          <Accordion id="meds" title="Medicines" sub={`${day.meds.length} given today, and why she gets each one`} state={state}>
            <section className="outline-card meds">
              <div className="eyebrow">MEDICINES GIVEN</div>
              <div className="meds-grid meds-head"><span>MEDICINE</span><span>WHY SHE GETS IT</span><span>WHEN</span><span>GIVEN BY</span></div>
              {day.meds.map((m) => (
                <div key={m.name} className="meds-grid meds-row">
                  <div className="med-name"><span>{m.name}</span><span className="mono">{m.chart}</span></div>
                  <span className="med-why">{m.why}</span><span>{m.when}</span><span>{m.by}</span>
                </div>
              ))}
            </section>
          </Accordion>

          <Accordion id="notes" title="Conversations and your notes" sub="What the team told you, and space for your questions" state={state}>
            <section className="outline-card notes">
              <div className="eyebrow">CONVERSATIONS &amp; NOTES</div>
              {day.notes.map((n) => (
                <div key={n.meta} className="note">
                  <div className="note-meta">{n.meta}</div>
                  <div className="note-text">{n.text}</div>
                  <div className="note-meta">{n.by}</div>
                </div>
              ))}
              <label htmlFor="parent-note" className="label-strong-lg">Your notes for this day</label>
              <textarea id="parent-note" rows={3} placeholder="A question to ask tomorrow, or something you noticed…" />
              <div className="row-between wrap">
                <button type="button" className="pill pill-dashed">Doesn&apos;t match what you were told? Flag it</button>
                <button type="button" className="btn-solid">Save note</button>
              </div>
            </section>
          </Accordion>

          <footer className="modal-footer">
            <div>From Mila&apos;s hospital chart · times show when care was recorded · [Hospital] NICU</div>
            <div className="footer-actions">
              <button type="button" className="pill">Save as PDF</button>
              <button type="button" className="pill pill-strong" onClick={onClose}>Back to sky</button>
            </div>
          </footer>
        </div>
      </ScrollArea>
    </>
  )
}
