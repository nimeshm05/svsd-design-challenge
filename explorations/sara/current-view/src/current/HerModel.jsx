import { useRef, useState } from 'react'

// Her, as a soft hologram you can turn: her body is a stack of contour slices at different depths
// (like a tracing in starlight, not a realistic body), lying on her mattress, with what's on her
// floating just above. Turning it makes the layers shift against each other, so it reads as a volume.
// New things glow blue; what came off stays as a faint dashed ghost.
const W = 240
const H = 150
// her parts, seen from above (head on the left): center, half-length, half-width, how tall (depth)
const PARTS = [
  { cx: 58, cy: 75, rx: 27, ry: 25, rz: 24 }, // head
  { cx: 118, cy: 75, rx: 38, ry: 28, rz: 20 }, // body
  { cx: 108, cy: 40, rx: 24, ry: 7, rz: 7 }, // arm
  { cx: 108, cy: 110, rx: 24, ry: 7, rz: 7 }, // arm
  { cx: 176, cy: 62, rx: 28, ry: 8, rz: 8 }, // leg
  { cx: 176, cy: 88, rx: 28, ry: 8, rz: 8 }, // leg
]
const SLICES = Array.from({ length: 11 }, (_, i) => -20 + i * 5) // heights through her body

// what can be on her, drawn on the top layer: [contact points], and the line that leads away
const DEVICES = {
  cpap: { label: 'CPAP mask', d: 'M30 75 C 20 92, 10 104, -6 112', shape: <ellipse cx="38" cy="75" rx="9" ry="13" /> },
  cannula: { label: 'Nasal cannula', d: 'M34 70 C 24 60, 12 54, -6 50 M34 80 C 24 92, 12 98, -6 102', shape: <path d="M34 70 Q 30 75 34 80" /> },
  feeding: { label: 'Feeding tube', d: 'M36 76 C 20 70, 6 62, -6 58', shape: <circle cx="38" cy="76" r="1.8" /> },
  heart: { label: 'Heart stickers', d: 'M104 62 C 150 40, 200 30, 246 26 M104 88 C 150 112, 200 124, 246 128 M140 75 C 180 70, 210 60, 246 52', shape: <><circle cx="104" cy="62" r="3" /><circle cx="104" cy="88" r="3" /><circle cx="140" cy="75" r="3" /></> },
  temp: { label: 'Temperature probe', d: 'M126 82 C 170 100, 210 108, 246 110', shape: <circle cx="126" cy="82" r="2.6" /> },
  pulse: { label: 'Pulse sensor', d: 'M202 88 C 220 92, 232 96, 246 98', shape: <rect x="196" y="84" width="10" height="8" rx="3" /> },
  iv: { label: 'IV line', d: 'M98 110 C 120 130, 180 142, 246 144', shape: <circle cx="98" cy="110" r="2.6" /> },
}

export function HerModel({ present = [], changed = [], label }) {
  const [rot, setRot] = useState([52, -22]) // tilt, turn: start leaning toward you, a little turned
  const drag = useRef(null)
  const shown = Object.keys(DEVICES).filter((id) => present.includes(id) || changed.includes(id))
  return (
    <div className="her3d" role="img" aria-label={label}
      onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, rot }; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={(e) => {
        const g = drag.current
        if (!g) return
        setRot([Math.max(5, Math.min(75, g.rot[0] - (e.clientY - g.y) * 0.4)), Math.max(-80, Math.min(80, g.rot[1] + (e.clientX - g.x) * 0.5))])
      }}
      onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
      <div className="her3d-stage" style={{ transform: `rotateX(${rot[0]}deg) rotateZ(${rot[1]}deg)` }}>
        {/* her mattress, underneath */}
        <svg className="her3d-layer" viewBox={`0 0 ${W} ${H}`} style={{ transform: 'translateZ(-26px)' }}>
          <rect x="6" y="10" width={W - 12} height={H - 20} rx="18" className="her3d-bed" />
        </svg>
        {/* her body, slice by slice */}
        {SLICES.map((z) => (
          <svg key={z} className="her3d-layer" viewBox={`0 0 ${W} ${H}`} style={{ transform: `translateZ(${z}px)` }}>
            {PARTS.map((p, i) => {
              const k = 1 - (z / p.rz) ** 2
              if (k <= 0) return null
              const s = Math.sqrt(k)
              return <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx * s} ry={p.ry * s} className="her3d-slice" style={{ opacity: 0.25 + 0.55 * s }} />
            })}
          </svg>
        ))}
        {/* what's on her, floating just above */}
        <svg className="her3d-layer is-top" viewBox={`-10 0 ${W + 20} ${H}`} style={{ transform: 'translateZ(26px)' }}>
          {shown.map((id) => {
            const dv = DEVICES[id], isNew = changed.includes(id) && present.includes(id), gone = !present.includes(id)
            return (
              <g key={id} className={`her3d-dev ${isNew ? 'is-new' : ''} ${gone ? 'is-gone' : ''}`}>
                <path d={dv.d} />
                {dv.shape}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
