// The finding, drawn: the picture parents are left to put together. A 5×4 jigsaw where part of the picture
// is assembled, a few slots stay empty, and the rest lies scattered.
// Two pieces find their place; a third tries a slot it doesn't fit and drifts back out; the rest never settle.
// Everything is seeded, so the layout is the same every run. The resting styles are the final state, so the
// overview thumbnail and reduced motion simply show it; `.is-on` plays the build.

const C = 64, COLS = 5, ROWS = 4, GX = 150, GY = 110, W = 600, H = 470

// mulberry32: a small seeded random
function seeded(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = seeded(19)
const between = (a, b) => a + rand() * (b - a)

// which way each shared edge's tab points: +1 down / right, -1 up / left
const HE = Array.from({ length: ROWS - 1 }, () => Array.from({ length: COLS }, () => (rand() < 0.5 ? 1 : -1)))
const VE = Array.from({ length: ROWS }, () => Array.from({ length: COLS - 1 }, () => (rand() < 0.5 ? 1 : -1)))

// one edge from a to b, with a tab (s = 1), a blank (s = -1) or flat (s = 0); the knob is in edge-lengths,
// u along the edge and v out of the piece
const KNOB = [[0.38, 0], [0.4, 0.06], [0.3, 0.2], [0.5, 0.22], [0.7, 0.2], [0.6, 0.06], [0.62, 0]]
function edge([ax, ay], [bx, by], s) {
  if (!s) return `L${bx} ${by}`
  const dx = bx - ax, dy = by - ay
  const p = ([u, v]) => `${(ax + u * dx + v * s * dy).toFixed(1)} ${(ay + u * dy - v * s * dx).toFixed(1)}`
  const k = KNOB.map(p)
  return `L${k[0]} C${k[1]} ${k[2]} ${k[3]} C${k[4]} ${k[5]} ${k[6]} L${bx} ${by}`
}
// the piece at column c, row r, drawn around its own center
function piece(c, r) {
  const h = C / 2, a = [-h, -h], b = [h, -h], d = [h, h], e = [-h, h]
  const top = r === 0 ? 0 : -HE[r - 1][c]
  const right = c === COLS - 1 ? 0 : VE[r][c]
  const bottom = r === ROWS - 1 ? 0 : HE[r][c]
  const left = c === 0 ? 0 : -VE[r][c - 1]
  return `M${a[0]} ${a[1]} ${edge(a, b, top)} ${edge(b, d, right)} ${edge(d, e, bottom)} ${edge(e, a, left)} Z`
}
const home = (c, r) => [GX + c * C + C / 2, GY + r * C + C / 2]

// the part of the picture parents have, off to one side, and the slots that nothing ever reached
const HAVE = [[0, 1], [1, 1], [0, 2], [1, 2], [2, 2], [0, 3], [1, 3], [2, 3]]
const EMPTY = [[0, 0], [3, 1], [3, 2], [3, 3]]
// the loose pieces and where they rest. Two find their place; one tries a slot and doesn't fit.
const LOOSE = [
  { cell: [1, 0], at: [86, 70], role: 'snap' },
  { cell: [2, 0], at: [372, 50] },
  { cell: [4, 0], at: [548, 156], role: 'try', near: [388, 196] },
  { cell: [3, 0], at: [466, 72] },
  { cell: [2, 1], at: [530, 262], role: 'snap', late: true },
  { cell: [4, 1], at: [456, 304] },
  { cell: [4, 2], at: [404, 418] },
  { cell: [4, 3], at: [62, 318] },
].map((p, k) => {
  const [x, y] = p.role === 'snap' ? home(...p.cell) : p.at
  const r = p.role === 'snap' ? 0 : between(-28, 28)
  const [lx, ly] = p.at
  const lr = p.role === 'snap' ? between(-22, 22) : r
  // drift in from beyond the nearest edge, turning a little on the way
  const dx = lx - W / 2, dy = ly - H / 2, n = Math.hypot(dx, dy) || 1
  const sx = lx + (dx / n) * 170, sy = ly + (dy / n) * 170, sr = lr + between(-24, 24)
  const px = (v) => `${v.toFixed(1)}px`, deg = (v) => `${v.toFixed(1)}deg`
  return {
    ...p, k,
    style: {
      '--k': k, '--x': px(x), '--y': px(y), '--r': deg(r), '--lx': px(lx), '--ly': px(ly), '--lr': deg(lr),
      '--sx': px(sx), '--sy': px(sy), '--sr': deg(sr),
      ...(p.near && { '--nx': px(p.near[0]), '--ny': px(p.near[1]), '--nr': deg(lr * 0.25) }),
    },
    float: { '--fd': `${between(7, 10).toFixed(1)}s`, '--fx': px(between(-3, 3)), '--fy': px(between(-3, 3)), '--fr': deg(between(-2, 2)) },
  }
})

export function Puzzle() {
  return (
    <svg className="puzzle" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <filter id="rough-puzzle" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </defs>
      <rect className="pz-frame" x={GX} y={GY} width={C * COLS} height={C * ROWS} />
      {EMPTY.map(([c, r]) => <path key={`${c}${r}`} className="pz-slot" transform={`translate(${home(c, r).join(' ')})`} d={piece(c, r)} filter="url(#rough-puzzle)" />)}
      <g className="pz-have">
        {HAVE.map(([c, r]) => <path key={`${c}${r}`} className="pz-piece" transform={`translate(${home(c, r).join(' ')})`} d={piece(c, r)} filter="url(#rough-puzzle)" />)}
      </g>
      {LOOSE.map((p) => (
        <g key={p.k} className={`pz-loose ${p.role ? `is-${p.role}` : ''} ${p.late ? 'is-late' : ''}`} style={p.style}>
          <g className="pz-float" style={p.float}>
            <path className="pz-piece" d={piece(...p.cell)} filter="url(#rough-puzzle)" />
          </g>
        </g>
      ))}
    </svg>
  )
}
