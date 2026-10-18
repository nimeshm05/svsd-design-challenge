import { skyPlanets, skyStars } from '../data/days.js'
import { MarkerIcon } from '../components/Icons.jsx'
import { DayModal } from './DayModal.jsx'
import './desktop.css'

// The sky art was drawn on a 1280×800 frame; positions are kept as percentages of that.
const SKY_W = 1280
const SKY_H = 800
const pct = (x, y) => ({ left: `${(x / SKY_W) * 100}%`, top: `${(y / SKY_H) * 100}%` })

export function DesktopView({ day, open, setOpen, goTo }) {
  return (
    <div className={`desk ${day.kind === 'planet' ? 'is-planet' : ''}`}>
      {/* Sky (behind) */}
      <header className="desk-sky-header">
        <h1>Mila&apos;s sky</h1>
        <div>23 days · 23 stars · 3 planets · 1 constellation</div>
      </header>
      <svg className="desk-sky-lines" viewBox="0 0 1280 800" preserveAspectRatio="none" aria-hidden="true">
        <path d="M300 470L470 380L680 430L860 330L1040 380" fill="none" stroke="#9A9A9A" strokeWidth="1.5" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
      </svg>
      {skyStars.map(([x, y, s], i) => (
        <span key={i} className="desk-star" style={{ ...pct(x, y), width: s, height: s }} />
      ))}
      {skyPlanets.map((p) => (
        <div key={p.label} className="desk-planet" style={pct(p.x, p.y)}>
          <span className="desk-planet-dot" />
          <span className="desk-planet-label">{p.label}</span>
        </div>
      ))}

      {/* The current day's marker: tap to open */}
      <div className="desk-day-anchor" style={pct(1040, 380)}>
        <button type="button" aria-label={day.openLabel} className="desk-day-marker" onClick={() => setOpen(!open)}>
          <span className="ring-outer" />
          <span className="ring-inner" />
          <MarkerIcon kind={day.kind} size={day.kind === 'planet' ? 34 : 28} />
        </button>
        {!open && (
          <div className="desk-tooltip">
            <span className="desk-tooltip-title">{day.tooltip.title}</span>
            <span className="desk-tooltip-sub">{day.tooltip.sub}</span>
          </div>
        )}
      </div>

      {open && <DayModal key={day.day} day={day} onClose={() => setOpen(false)} goTo={goTo} />}
    </div>
  )
}
