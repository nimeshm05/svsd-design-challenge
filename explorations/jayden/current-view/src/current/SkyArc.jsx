import { useLayoutEffect, useRef } from 'react'

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
// a rounded four-point sparkle (Confetti's "now")
const roundSparkle = (x, y, r) => {
  const c = r * 0.18
  return `M${x} ${y - r}Q${x + c} ${y - c} ${x + r} ${y}Q${x + c} ${y + c} ${x} ${y + r}Q${x - c} ${y + c} ${x - r} ${y}Q${x - c} ${y - c} ${x} ${y - r}Z`
}
const starN = (x, y, r, n = 5, inner = 0.46) =>
  'M' + Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / n, rr = i % 2 ? r * inner : r
    return `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`
  }).join('L') + 'Z'
// The marks in each style. Night Nursery: cream dots, sparkles and soft rings.
// Confetti: white glints, chunky colored stars (the colors are only for delight) and blue rings.
const TINTS = ['#FFD23F', '#FF9A3C', '#FF8FC8', '#FFFFFF', '#7EE0A5']
const SHAPES = {
  nursery: {
    care: (x, y) => <circle cx={x} cy={y} r="4" />,
    change: (x, y) => <path d={sparkle(x, y, 13)} className="is-wired" />,
    decision: (x, y) => <circle cx={x} cy={y} r="8" className="is-ring" />,
    first: (x, y) => <Planet x={x} y={y} body="#EFDCAA" ring="#FFB38A" />,
    family: (x, y) => <g className="is-family"><circle cx={x} cy={y} r="11" fill="#FFB38A" opacity=".18" /><circle cx={x} cy={y} r="4.5" fill="#FFC9A8" /></g>,
  },
  confetti: {
    care: (x, y) => <path d={sparkle(x, y, 7)} fill="#fff" />,
    change: (x, y) => <path d={starN(x, y, 12)} fill="#C9A7FF" stroke="#C9A7FF" strokeWidth="2" strokeLinejoin="round" filter="url(#cv-soft)" />,
    decision: (x, y) => <circle cx={x} cy={y} r="8" fill="#000" stroke="#7CC0FF" strokeWidth="2.5" />,
    first: (x, y) => <Planet x={x} y={y} body="#3ECF7A" ring="#FFD23F" big />,
    family: (x, y) => <g className="is-family"><circle cx={x} cy={y} r="11" fill="#FF8FC8" opacity=".22" /><circle cx={x} cy={y} r="5" fill="#FF8FC8" /></g>,
  },
}
// Firsts are planets, here as in her sky
function Planet({ x, y, body, ring, big }) {
  const R = big ? 16 : 13, b = big ? 8.5 : 7
  const arc = (top) => `M${x - R} ${y} A${R} ${R * 0.3} 0 0 ${top ? 1 : 0} ${x + R} ${y}`
  return (
    <g className="is-planet" transform={`rotate(-18 ${x} ${y})`}>
      <circle cx={x} cy={y} r="16" className="is-planet-glow" />
      <path d={arc(true)} fill="none" stroke={ring} strokeWidth={big ? 2.6 : 1.8} strokeLinecap="round" opacity=".75" />
      <circle cx={x} cy={y} r={b} fill={body} />
      <path d={arc(false)} fill="none" stroke={ring} strokeWidth={big ? 2.6 : 1.8} strokeLinecap="round" />
    </g>
  )
}
const CONFETTI = ['#FFD23F', '#FF8FC8', '#7EE0A5', '#FFFFFF', '#FF9A3C', '#9FD0FF']
// A few faint background stars, fixed so they don't jump around
const DUST = Array.from({ length: 34 }, (_, i) => [(i * 293 + 71) % 1000, (i * 151 + 37) % 240, (i % 3) * 0.4 + 0.8])

export function SkyArc({ h, nowH, marks, later = [], glow, onChange, onFuture, shape = 'arc', theme = 'nursery', gather = null, gatherTo = null, onTapStar, onPast }) {
  const all = useRef(null)
  const tap = useRef(null) // a press on today's star that hasn't moved yet: a tap, not a drag
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
  // Tap today's star (or press Enter) to see her; drag it to go back through the day
  const onDown = (e) => {
    if (e.target.closest?.('.cv-arc-past')) return // Mila's stars is its own button
    const v = nearestHour(e)
    tap.current = onTapStar && Math.abs(v - h) < 0.7 ? [e.clientX, e.clientY] : null
    if (v > nowH + 0.6 && onFuture) return onFuture() // a tap on the future
    dragging.current = true
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* a pointer the browser isn't tracking (the demo's own drag) */ }
    onChange(snap(Math.min(v, nowH)))
  }
  const onMove = (e) => {
    if (tap.current && Math.hypot(e.clientX - tap.current[0], e.clientY - tap.current[1]) > 8) tap.current = null
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
  // When the day becomes a star, all of it (path, stars, today's star) swirls in together toward the
  // place in her sky where today's star forms. gatherTo is that place on screen.
  useLayoutEffect(() => {
    if (!gather || !gatherTo || !svg.current || !all.current) return
    const p = svg.current.createSVGPoint()
    p.x = gatherTo[0]; p.y = gatherTo[1]
    const { x, y } = p.matrixTransform(svg.current.getScreenCTM().inverse())
    all.current.style.transformOrigin = `${x}px ${y}px`
  }, [gather, gatherTo])
  const confetti = theme === 'confetti'
  const SET = SHAPES[confetti ? 'confetti' : 'nursery']
  const [sx, sy] = arcPt(h)
  const [nx, ny] = arcPt(nowH)
  const atNowH = Math.abs(h - nowH) < 0.01
  const r = (shape === 'line' ? 14 : 26) + glow * (shape === 'line' ? 8 : 22)
  const [ex, ey] = arcPt(24)

  return (
    <svg ref={svg} className={`cv-arc is-${shape} is-${theme} ${gather ? `is-gather-${gather}` : ''}`} viewBox={`0 0 ${W} ${H}`} role="slider" tabIndex={0}
      aria-label="Today, from midnight to now" aria-valuemin={0} aria-valuemax={nowH} aria-valuenow={h}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => { dragging.current = false; if (tap.current) onTapStar?.(); tap.current = null }}
      onPointerCancel={() => { dragging.current = false; tap.current = null }}
      onKeyDown={(e) => { if (e.key === 'Enter' && onTapStar) { e.preventDefault(); onTapStar() } else onKey(e) }}>
      <defs>
        <radialGradient id="cv-arc-star">
          <stop offset="0" stopColor={confetti ? '#FFF2C2' : '#FFF8E6'} stopOpacity={0.3 + glow * 0.3} />
          <stop offset="0.3" stopColor={confetti ? '#FFD23F' : '#F3E3B5'} stopOpacity={0.14 + glow * 0.2} />
          <stop offset="1" stopColor={confetti ? '#FFD23F' : '#F3E3B5'} stopOpacity="0" />
        </radialGradient>
        {/* Confetti's cut-paper edges */}
        <filter id="cv-soft"><feTurbulence type="turbulence" baseFrequency=".05" numOctaves="1" seed="3" /><feDisplacementMap in="SourceGraphic" scale="1.6" /></filter>
      </defs>
      <g ref={all} className="cv-arc-all">
      <g className="cv-dust">{DUST.filter(([x, y]) => x < W && y < H).map(([x, y, s], i) => (
        <circle key={i} cx={x} cy={y} r={confetti ? s + 0.6 : s} fill={confetti ? CONFETTI[i % CONFETTI.length] : undefined}
          style={{ animationDelay: `${(i % 7) * 0.9}s`, ...(confetti ? { fill: CONFETTI[i % CONFETTI.length], opacity: 0.28 } : {}) }} />
      ))}</g>
      <polyline className="cv-arc-ahead" points={path(nowH, 24)} />
      <polyline className="cv-arc-day" points={path(0, nowH)} pathLength={gather === 'in' ? 1 : undefined} />
      <polyline className="cv-arc-lit" points={path(0, h)} pathLength={gather === 'in' ? 1 : undefined} />
      {(onPast ? [6, 12, 18] : [0, 6, 12, 18]).map((x) => {
        const [px, py] = arcPt(x)
        return <text key={x} className="cv-arc-hour" x={px} y={py + geo.label} textAnchor="middle">{x % 12 || 12} {x < 12 ? 'a.m.' : 'p.m.'}</text>
      })}
      {later.map((k, i) => {
        const [x, y] = arcPt(k.h)
        return <g key={`l${k.h}`} className={`cv-arc-mark is-later ${k.kind}`}>{SET[k.kind](x, y, i)}</g>
      })}
      {marks.map((k, i) => {
        const [x, y] = arcPt(k.h)
        return (
          <g key={`${k.kind}${k.h}`} data-label={k.short ?? k.t} data-kind={k.kind} data-h={k.h}
            style={gather === 'out' ? {} /* its --lift is set by the screen, in the day's order */
              : gather === 'in' ? { '--back': `${1.45 + (marks.length - 1 - i) * 0.09}s`, '--fx': `${nx - x}px`, '--fy': `${ny - y}px` }
              : { animationDelay: `${i * 0.7}s` }}
            className={`cv-arc-mark ${k.kind} ${Math.abs(k.h - h) < 0.01 ? 'is-on' : ''}`}>
            {SET[k.kind](x, y, i)}
          </g>
        )
      })}
      {/* The way into what's ahead: where the day's path ends */}
      {onFuture && <text className="cv-arc-ahead-label" x={ex} y={ey + geo.label} textAnchor="end">What&apos;s ahead ›</text>}
      {/* ...and where it began: every day before today, as stars */}
      {onPast && (() => {
        const [px, py] = arcPt(0)
        return (
          <g className="cv-arc-past" role="button" tabIndex={0} aria-label="Mila's stars: every day so far"
            onClick={onPast} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPast() } }}>
            <rect x={px - 26} y={py + 14} width="230" height="52" rx="26" className="cv-arc-past-hit" />
            <text className="cv-arc-ahead-label is-past" x={px - 14} y={py + geo.label + 12}>‹</text>
            <svg x={px - 2} y={py + geo.label - 12} width="42" height="30" viewBox="0 0 34 24" className="cv-lookup" overflow="visible">
              <polyline className="cv-lookup-line" points="3,20 10,14 16,17 23,9" />
              <line className="cv-lookup-next" x1="23" y1="9" x2="30" y2="4" />
              {[[3, 20], [10, 14], [16, 17], [23, 9]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.6" />)}
              <path className="cv-lookup-today" d="M30 0.8L31 3L33.2 4L31 5L30 7.2L29 5L26.8 4L29 3Z" />
            </svg>
            <text className="cv-arc-ahead-label is-past" x={px + 48} y={py + geo.label + 12}>Mila&apos;s stars</text>
          </g>
        )
      })()}
      {/* Today's star stays at "now". Dragging back through the day moves a soft ring instead, which
          circles the moment it's on, so the star never sits on top of another moment. */}
      <g className={`cv-arc-now ${atNowH ? '' : 'is-away'}`}>
        <circle className="cv-arc-glow" cx={nx} cy={ny} r={r} fill="url(#cv-arc-star)" />
        {confetti
          ? <g className="cv-arc-star is-confetti-now"><path d={roundSparkle(nx, ny, shape === 'line' ? 12 : 18)} fill="#FFD23F" /><circle cx={nx} cy={ny} r={shape === 'line' ? 1.8 : 2.6} fill="#fff" /></g>
          : <path className="cv-arc-star" d={sparkle(nx, ny, shape === 'line' ? 10 : 15)} />}
      </g>
      {!atNowH && (
        <g className="cv-arc-handle">
          <circle cx={sx} cy={sy} r={shape === 'line' ? 11 : 17} className="cv-arc-handle-glow" />
          <circle cx={sx} cy={sy} r={shape === 'line' ? 11 : 17} className="cv-arc-handle-ring" />
        </g>
      )}
      </g>
    </svg>
  )
}
