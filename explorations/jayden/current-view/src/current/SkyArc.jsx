import { useRef } from 'react'

// Today's sky: the day as an arc across the screen, midnight on the left to midnight on the right,
// drawn like the night sky in v2: warm stars on a thin line. Changes are four-point sparkles,
// care times small stars, team decisions soft rings. Today's star sits at "now" and is the
// control: drag it back through the day and it snaps to moments. Past it, the path is dashed;
// tapping the future (or "What's ahead ›" at the end of the arc) opens her care plans.
// shape "arc" spans the screen as the sky; shape "line" is the same day drawn straight, for side panels.
// The line uses a smaller drawing space, so its stars and labels stay readable in a side panel.
const SHAPES_OF_DAY = {
  arc: { W: 1000, H: 250, P0: [30, 222], P1: [500, -60], P2: [970, 222], label: 30 },
  line: { W: 440, H: 62, P0: [14, 26], P1: [220, 26], P2: [426, 26], label: 27 },
}
const SAMPLES = Array.from({ length: 241 }, (_, i) => i / 10) // hours 0–24 in tenths
const pointOn = ({ P0, P1, P2 }) => (h) => {
  const t = h / 24, u = 1 - t
  return [0, 1].map((i) => u * u * P0[i] + 2 * u * t * P1[i] + t * t * P2[i])
}
const sparkle = (x, y, r) => {
  const k = r * 0.24
  return `M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z`
}
const SHAPES = {
  care: (x, y) => <circle cx={x} cy={y} r="4" />,
  change: (x, y) => <path d={sparkle(x, y, 13)} />,
  decision: (x, y) => <circle cx={x} cy={y} r="8" className="is-ring" />,
}
// A few faint background stars, fixed so they don't jump around
const DUST = Array.from({ length: 34 }, (_, i) => [(i * 293 + 71) % 1000, (i * 151 + 37) % 240, (i % 3) * 0.4 + 0.8])

export function SkyArc({ h, nowH, marks, later = [], glow, onChange, onFuture, shape = 'arc' }) {
  const svg = useRef(null)
  const geo = SHAPES_OF_DAY[shape]
  const { W, H } = geo
  const arcPt = pointOn(geo)
  const path = (h0, h1) =>
    Array.from({ length: 49 }, (_, k) => arcPt(h0 + ((h1 - h0) * k) / 48).map((v) => v.toFixed(1)).join(',')).join(' ')
  const snap = (v) => {
    if (v > nowH - 0.4) return nowH
    const near = marks.reduce((b, k) => (!b || Math.abs(k.h - v) < Math.abs(b.h - v) ? k : b), null)
    return near && Math.abs(near.h - v) < 0.6 ? near.h : v
  }
  const nearestHour = (e) => {
    const p = svg.current.createSVGPoint()
    p.x = e.clientX; p.y = e.clientY
    const { x, y } = p.matrixTransform(svg.current.getScreenCTM().inverse())
    let best = 0, d = Infinity
    for (const s of SAMPLES) {
      const [ax, ay] = arcPt(s)
      const dd = (ax - x) ** 2 + (ay - y) ** 2
      if (dd < d) { d = dd; best = s }
    }
    return best
  }
  const dragging = useRef(false)
  const onDown = (e) => {
    const v = nearestHour(e)
    if (v > nowH + 0.6 && onFuture) return onFuture() // a tap on the future
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    onChange(snap(Math.min(v, nowH)))
  }
  const onMove = (e) => {
    if (dragging.current && e.buttons) onChange(snap(Math.min(nearestHour(e), nowH)))
  }
  const onKey = (e) => {
    const stops = [...marks.map((m) => m.h), nowH].sort((a, b) => a - b)
    if (e.key === 'ArrowLeft') { e.preventDefault(); onChange(stops.filter((s) => s < h - 0.01).at(-1) ?? h) }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = stops.find((s) => s > h + 0.01)
      if (next !== undefined) onChange(next)
      else onFuture?.() // past "now" is the future
    }
  }
  const [sx, sy] = arcPt(h)
  const r = (shape === 'line' ? 14 : 26) + glow * (shape === 'line' ? 8 : 22)
  const [ex, ey] = arcPt(24)

  return (
    <svg ref={svg} className={`cv-arc is-${shape}`} viewBox={`0 0 ${W} ${H}`} role="slider" tabIndex={0}
      aria-label="Today, from midnight to now" aria-valuemin={0} aria-valuemax={nowH} aria-valuenow={h}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => { dragging.current = false }}
      onKeyDown={onKey}>
      <defs>
        <radialGradient id="cv-arc-star">
          <stop offset="0" stopColor="#FFF8E6" stopOpacity={0.5 + glow * 0.5} />
          <stop offset="0.3" stopColor="#F3E3B5" stopOpacity={0.25 + glow * 0.35} />
          <stop offset="1" stopColor="#F3E3B5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="cv-dust">{DUST.filter(([x, y]) => x < W && y < H).map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={s} style={{ animationDelay: `${(i % 7) * 0.9}s` }} />)}</g>
      <polyline className="cv-arc-ahead" points={path(nowH, 24)} />
      <polyline className="cv-arc-day" points={path(0, nowH)} />
      <polyline className="cv-arc-lit" points={path(0, h)} />
      {[0, 6, 12, 18].map((x) => {
        const [px, py] = arcPt(x)
        return <text key={x} className="cv-arc-hour" x={px} y={py + geo.label} textAnchor="middle">{x % 12 || 12} {x < 12 ? 'a.m.' : 'p.m.'}</text>
      })}
      {later.map((k) => {
        const [x, y] = arcPt(k.h)
        return <g key={`l${k.h}`} className={`cv-arc-mark is-later ${k.kind}`}>{SHAPES[k.kind](x, y)}</g>
      })}
      {marks.map((k, i) => {
        const [x, y] = arcPt(k.h)
        return (
          <g key={`${k.kind}${k.h}`} style={{ animationDelay: `${i * 0.7}s` }}
            className={`cv-arc-mark ${k.kind} ${Math.abs(k.h - h) < 0.01 ? 'is-on' : ''}`}>{SHAPES[k.kind](x, y)}</g>
        )
      })}
      {/* The way into what's ahead: where the day's path ends */}
      {onFuture && <text className="cv-arc-ahead-label" x={ex} y={ey + geo.label} textAnchor="end">What&apos;s ahead ›</text>}
      {/* Today's star: the thing you drag */}
      <circle className="cv-arc-glow" cx={sx} cy={sy} r={r} fill="url(#cv-arc-star)" />
      <path className="cv-arc-star" d={sparkle(sx, sy, shape === 'line' ? 10 : 15)} />
    </svg>
  )
}
