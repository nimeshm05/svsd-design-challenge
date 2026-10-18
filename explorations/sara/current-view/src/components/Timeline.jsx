import { StarIcon } from './Icons.jsx'

// One event marker on a 24-hour line. Shape encodes the event type.
// size "sm" is the compact strip, "lg" the strip inside "Everything that happened".
export function Mark({ cat, size = 'sm', hollow = 'var(--card)' }) {
  const lg = size === 'lg'
  switch (cat) {
    case 'care': {
      const s = lg ? 10 : 8
      return <div style={{ width: s, height: s, borderRadius: s / 2, background: hollow, border: '2px solid var(--text)' }} />
    }
    case 'med': {
      const s = lg ? 11 : 9
      return <div style={{ width: s, height: s, background: 'var(--text)', transform: 'rotate(45deg)' }} />
    }
    case 'proc': {
      const s = lg ? 13 : 11
      return <div style={{ width: s, height: s, background: 'var(--text)' }} />
    }
    case 'test': {
      const s = lg ? 12 : 9
      return <div style={{ width: s, height: s, background: hollow, border: '2px solid var(--text)' }} />
    }
    case 'check': {
      const s = lg ? 16 : 13
      const dot = lg ? 6 : 5
      return (
        <div style={{ width: s, height: s, borderRadius: s / 2, border: '2px solid var(--text)', background: hollow, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: dot, height: dot, borderRadius: 3, background: 'var(--text)' }} />
        </div>
      )
    }
    case 'moment':
      return <StarIcon size={lg ? 20 : 16} fill="var(--accent)" />
    default:
      return null
  }
}

export function MarkLine({ events, size = 'sm', hollow, from = 0, to = 24, className = '' }) {
  const span = to - from
  const box = size === 'lg' ? 20 : 18
  return (
    <div className={`mark-line mark-line-${size} ${className}`}>
      <div className="mark-line-rule" />
      {events.map((e, i) => (
        <div key={i} className="mark" style={{ left: `${((e.h - from) / span * 100).toFixed(2)}%`, width: box, height: box, marginLeft: -box / 2 }}>
          <Mark cat={e.cat} size={size} hollow={hollow} />
        </div>
      ))}
    </div>
  )
}

export function Legend({ counts, className = '' }) {
  const items = [
    ['care', 'Care time', <span key="i" className="lg-care" />],
    ['med', 'Medicine', <span key="i" className="lg-med" />],
    ['proc', 'Procedure', <span key="i" className="lg-proc" />],
    ['test', 'Test', <span key="i" className="lg-test" />],
    ['check', 'Check', <span key="i" className="lg-check" />],
  ]
  return (
    <div className={`legend ${className}`}>
      {items.map(([cat, label, icon]) => (
        <span key={cat} className="legend-item">{icon}{label}{counts ? ` · ${counts[cat] ?? 0}` : ''}</span>
      ))}
    </div>
  )
}
