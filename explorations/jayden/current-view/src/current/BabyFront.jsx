// Her, front-facing and still (public/images/baby-front.png: a soft cream body with her organs in the warm
// accent). What's on her sits where it touches her, with a thin wire out to the side of her bed.
// Coordinates are in the image's own units (272 × 397), so the marks stay on her at any size.
const W = 272, H = 397
const SRC = '/images/baby-front.png'

const DEVICES = {
  vent: { at: [[136, 77]], mark: (x, y) => <rect x={x - 6} y={y - 3.5} width="12" height="7" rx="2.5" />, wire: 'M142 77 C 190 76, 240 70, 300 64' },
  feeding: { at: [[127, 70]], mark: (x, y) => <circle cx={x} cy={y} r="2.6" />, wire: 'M127 70 C 122 110, 140 150, 156 180 M127 70 C 150 40, 230 34, 300 36' },
  heart: { at: [[108, 128], [166, 128], [112, 196]], mark: (x, y) => <circle cx={x} cy={y} r="5" />, wire: 'M166 128 C 220 124, 260 118, 300 114 M108 128 C 140 150, 230 150, 300 146 M112 196 C 170 200, 240 188, 300 180' },
  temp: { at: [[176, 214]], mark: (x, y) => <circle cx={x} cy={y} r="4.5" />, wire: 'M176 214 C 220 222, 260 222, 300 218' },
  iv: { at: [[238, 122]], mark: (x, y) => <circle cx={x} cy={y} r="4.5" />, wire: 'M238 122 C 260 104, 280 96, 300 92' },
  pulse: { at: [[172, 368]], mark: (x, y) => <rect x={x - 9} y={y - 6} width="18" height="12" rx="5" />, wire: 'M181 368 C 230 360, 270 330, 300 300' },
}

export function BabyFront({ present = [], changed = [], label }) {
  const shown = Object.keys(DEVICES).filter((id) => present.includes(id) || changed.includes(id))
  const cls = (id) => `bf-dev ${changed.includes(id) ? 'is-new' : ''}`
  return (
    <div className="bf" role="img" aria-label={label}>
      <img className="bf-img" src={SRC} alt="" draggable="false" />
      <svg className="bf-layer" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {/* wires fade out as they leave her, so the picture stays centred on her */}
        <defs>
          <linearGradient id="bf-fade" gradientUnits="userSpaceOnUse" x1="200" x2="300" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="bf-mask" maskUnits="userSpaceOnUse" x="-20" y="-20" width="340" height="440">
            <rect x="-20" y="-20" width="340" height="440" fill="url(#bf-fade)" />
          </mask>
        </defs>
        {/* quiet ones first, so the lit one is always drawn on top */}
        {[...shown].sort((a, b) => changed.includes(a) - changed.includes(b)).map((id) => (
          <g key={id} className={cls(id)}>
            <path className="bf-wire" d={DEVICES[id].wire} mask="url(#bf-mask)" />
            {DEVICES[id].at.map(([x, y], j) => <g key={j}>{DEVICES[id].mark(x, y)}</g>)}
          </g>
        ))}
      </svg>
    </div>
  )
}
