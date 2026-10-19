import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CenterIcon, ChevronLeft, ChevronRight, InfoIcon } from './NavIcons.jsx'
import { stay, weekInfo, dayDetail } from '../data/days.js'

// Her whole stay, after Nimesh's galaxy (explorations/nimesh/galaxy): one space and one camera.
//   Galaxy: day 1 at the center, days spiral outward, a small gap between weeks so each week reads
//           as its own constellation. A star grows with her weight, simplifies as she needs less
//           breathing help, glows warm when a parent was there, and is dimmer (never dark) on a hard day.
//   Week:   the camera frames one week; the panel tells its story, its firsts and what was hard.
//   Day:    her star at the center of a 24-hour ring (midnight at the top, clockwise), her moments
//           in lanes around it: family nearest, everyday care in the middle, changes outside.
//   Moment: tap one to read it in plain words.
// Back goes up a level, ← / → move between weeks or days, Esc steps out. Firsts are planets.

const W = 1000
const H = 625
const CX = 500
const CY = 312
export const WEEKS = weekInfo.length
export const daysOf = (w) => stay.days.filter((d) => d.week === w)

/* ---------- Layout: her weeks in a loose zigzag ----------
   Each week is its own small constellation in its own patch of sky, set left to right along her stay,
   alternating high and low (week 1 high, week 2 low, …). Each week sits a little off its mark, seeded by
   its number, so the path feels drawn by hand and never moves between renders. A longer stay spaces the
   weeks out along the same line (the sky grows, and the camera frames all of it). */
export function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }
const PATH = { from: [215, 330], to: [805, 330], minStep: 190, zig: 78, jitter: 22, gap: 70 }
const DIR = Math.atan2(PATH.to[1] - PATH.from[1], PATH.to[0] - PATH.from[0])
const U = [Math.cos(DIR), Math.sin(DIR)], N = [U[1], -U[0]] // along her stay, and across it (toward upper left)
const POS = (() => {
  // each week's shape: a gentle, curling walk along the path, never too close to a star already placed
  const shapes = Array.from({ length: WEEKS }, (_, i) => {
    const w = i + 1, days = daysOf(w)
    let heading = DIR + (hash(w) - 0.5) * 0.8
    const pts = [[0, 0]]
    for (let k = 1; k < days.length; k++) {
      const d = days[k].d, prev = pts[k - 1]
      let best = null
      for (let t = 0; t < 14 && !best; t++) {
        const h = heading + (hash(d * 3 + t) - 0.5) * 1.6 + 0.35, step = 30 + hash(d + 5) * 10
        const q = [prev[0] + Math.cos(h) * step, prev[1] + Math.sin(h) * step]
        if (pts.every((o) => Math.hypot(o[0] - q[0], o[1] - q[1]) > 27)) { best = q; heading = h }
      }
      pts.push(best ?? [prev[0] + Math.cos(heading) * 32, prev[1] + Math.sin(heading) * 32])
    }
    const mx = pts.reduce((t, p) => t + p[0], 0) / pts.length, my = pts.reduce((t, p) => t + p[1], 0) / pts.length
    return pts.map((p) => [p[0] - mx, p[1] - my])
  })
  // where each week sits: evenly along the line, nudged along and across it by its own seed
  const mid = [(PATH.from[0] + PATH.to[0]) / 2, (PATH.from[1] + PATH.to[1]) / 2]
  const span = Math.hypot(PATH.to[0] - PATH.from[0], PATH.to[1] - PATH.from[1])
  const lay = (step) => shapes.map((pts, i) => {
    const w = i + 1
    const along = (i - (WEEKS - 1) / 2) * step + (hash(w * 7 + 2) - 0.5) * 24
    // a zigzag: week 1 high, week 2 low, week 3 high… each a little off its mark
    const across = (i % 2 ? -1 : 1) * PATH.zig + (hash(w * 13 + 5) - 0.5) * 2 * PATH.jitter
    const c = [mid[0] + U[0] * along + N[0] * across, mid[1] + U[1] * along + N[1] * across]
    return pts.map((p) => [c[0] + p[0], c[1] + p[1]])
  })
  // weeks never touch: if any two come too close, space the whole path out a little more
  const apart = (weeks) => weeks.every((a, i) => weeks.slice(i + 1).every((b) => a.every((p) => b.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) >= PATH.gap))))
  let step = Math.max(PATH.minStep, WEEKS > 1 ? span / (WEEKS - 1) : 0), weeks = lay(step)
  for (let k = 0; k < 40 && !apart(weeks); k++) weeks = lay((step += 8))
  return weeks.flat()
})()
// her whole sky (at least the screen's own drawing space), with room around the outermost stars
const SKY = [
  Math.min(0, ...POS.map((p) => p[0] - 50)), Math.min(0, ...POS.map((p) => p[1] - 50)),
  Math.max(W, ...POS.map((p) => p[0] + 50)), Math.max(H, ...POS.map((p) => p[1] + 50)),
]
// The view of her whole sky on a screen of this shape. The art fills the screen and crops ("slice"), so on
// a narrower or wider screen the view widens until every constellation shows. On the bedside screen it's
// exactly the drawing space, so the way in from today (and back) lines up as before.
function skyBox(cw = W, ch = H) {
  const a = cw / ch, sw = SKY[2] - SKY[0], sh = SKY[3] - SKY[1]
  const vw = Math.max(sw, sh * (W / H), (sw * W) / (a * H), sh * a), vh = vw * (H / W)
  return [(SKY[0] + SKY[2]) / 2 - vw / 2, (SKY[1] + SKY[3]) / 2 - vh / 2, vw, vh]
}
// each star sits at its own depth, so stars slide past each other as the camera moves
const DEPTH = stay.days.map((d) => (hash(d.d * 7 + 1) - 0.5) * 0.05) // kept shallow so a constellation holds together
const WEEK_AT = Array.from({ length: WEEKS }, (_, i) => {
  const pts = daysOf(i + 1).map((d) => POS[d.d - 1])
  return [pts.reduce((t, p) => t + p[0], 0) / pts.length, pts.reduce((t, p) => t + p[1], 0) / pts.length]
})
export const pos = (d) => POS[d - 1]

/* ---------- Camera: each level is a view box; the subject sits left of the panel ---------- */
function frameBox(points, pad) {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1])
  const bw = Math.max(...xs) - Math.min(...xs) + pad * 2, bh = Math.max(...ys) - Math.min(...ys) + pad * 2
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2
  const vw = Math.max(440, bw / 0.46, (bh / 0.72) * (W / H)), vh = vw * (H / W) // never closer than about 2×
  return [cx - vw * 0.28, cy - vh / 2, vw, vh]
}
function boxFor(view, size) {
  if (view.level === 'today') return [0, 0, W, H]
  if (view.level === 'galaxy') return skyBox(size[0], size[1])
  if (view.level === 'week') return frameBox(daysOf(view.w).map((d) => pos(d.d)), 60)
  if (view.level === 'day') { const [x, y] = pos(view.d); const vw = 150, vh = vw * (H / W); return [x - vw * 0.32, y - vh / 2, vw, vh] }
  return skyBox(size[0], size[1])
}
const ease = (t) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
function lerpBox(a, b, t, f = ease) {
  const k = f(t)
  // zoom eases in log space so a big zoom feels as even as a small one (as in Nimesh's camera)
  const w = Math.exp(Math.log(a[2]) + (Math.log(b[2]) - Math.log(a[2])) * k)
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, w, w * (H / W)]
}

/* ---------- Shapes ---------- */
const poly = (pts) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z'
const sparkle = (x, y, r, k = 0.24) => poly([[x, y - r], [x + r * k, y - r * k], [x + r, y], [x + r * k, y + r * k], [x, y + r], [x - r * k, y + r * k], [x - r, y], [x - r * k, y - r * k]])
const starN = (x, y, r, n = 5, inner = 0.46) => poly(Array.from({ length: n * 2 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / n, rr = i % 2 ? r * inner : r
  return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]
}))
// a soft four-point sparkle with curved sides
const softSparkle = (x, y, r, k = 0.14) => {
  const c = r * k
  return `M${x} ${y - r}Q${x + c} ${y - c} ${x + r} ${y}Q${x + c} ${y + c} ${x} ${y + r}Q${x - c} ${y + c} ${x - r} ${y}Q${x - c} ${y - c} ${x} ${y - r}Z`
}
const planet = (x, y, r, body, ring, extra = '') =>
  `<g transform="rotate(-18 ${x} ${y})" ${extra}>` +
  `<path d="M${x - r * 1.8} ${y} A${r * 1.8} ${r * 0.5} 0 0 1 ${x + r * 1.8} ${y}" fill="none" stroke="${ring}" stroke-width="${(r * 0.2).toFixed(1)}" stroke-linecap="round" opacity=".75"/>` +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${body}"/>` +
  `<path d="M${x - r * 1.8} ${y} A${r * 1.8} ${r * 0.5} 0 0 0 ${x + r * 1.8} ${y}" fill="none" stroke="${ring}" stroke-width="${(r * 0.2).toFixed(1)}" stroke-linecap="round"/></g>`
const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const dust = (seed, n, colors, op, x0 = 0, y0 = 0, w = W, h = H, size = 1) => {
  const r = rand(seed); let s = ''
  for (let i = 0; i < n; i++) s += `<circle class="cv-twinkle" cx="${(x0 + r() * w).toFixed(1)}" cy="${(y0 + r() * h).toFixed(1)}" r="${((r() * 1.4 + 0.4) * size).toFixed(2)}" fill="${colors[i % colors.length]}" opacity="${op}" style="animation-delay:${(i % 7) * 0.6}s"/>`
  return s
}
const NTINTS_G = () => ['#FFDCB5', '#D9CEFF', '#BDEBD3', '#C4E0FF', '#FFC9D8', '#F3E3B5', '#B9B4E6', '#FFB38A'].map((c) =>
  `<radialGradient id="g-n${c.slice(1)}"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".3" stop-color="${c}" stop-opacity=".22"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')
export const DEFS = `<defs>
  <filter id="g-soft"><feTurbulence type="turbulence" baseFrequency=".05" numOctaves="1" seed="3"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
 <filter id="g-cloud" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="34"/></filter>
  <filter id="g-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="60"/></filter>
  <radialGradient id="g-core"><stop offset="0" stop-color="#f3eeff" stop-opacity="1"/><stop offset=".3" stop-color="#c8c2ff" stop-opacity=".35"/><stop offset="1" stop-color="#a9a4ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-copper"><stop offset="0" stop-color="#ffc9a8" stop-opacity=".7"/><stop offset=".45" stop-color="#ffb38a" stop-opacity=".2"/><stop offset="1" stop-color="#ffb38a" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-cream"><stop offset="0" stop-color="#fff8e6" stop-opacity=".95"/><stop offset=".35" stop-color="#f3e3b5" stop-opacity=".32"/><stop offset="1" stop-color="#f3e3b5" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-butter"><stop offset="0" stop-color="#fff2c2" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd23f" stop-opacity=".3"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>
  ${NTINTS_G()}
  <radialGradient id="g-pink"><stop offset="0" stop-color="#ffd0e6" stop-opacity=".75"/><stop offset=".45" stop-color="#ff8fc8" stop-opacity=".2"/><stop offset="1" stop-color="#ff8fc8" stop-opacity="0"/></radialGradient>
</defs>`

/* ---------- A day's star in each style ---------- */
// Night Nursery's stars are colored too (softer than Confetti), so neighboring days are easy to tell apart
const NTINTS = ['#FFDCB5', '#D9CEFF', '#BDEBD3', '#C4E0FF', '#FFC9D8', '#F3E3B5']
const nTint = (d) => (d.d === stay.today ? '#FFB38A' : d.mood === 'hard' ? '#B9B4E6' : NTINTS[(d.d * 4) % NTINTS.length])
function nurseryDay(d, x, y, s = 1) {
  const bright = { calm: 1, mixed: 0.85, hard: 0.68 }[d.mood]
  const r = (9 + Math.max(0, d.weight - 880) * 0.016) * s // grows with her
  const warm = Math.min(1, d.parent / 210)
  const col = nTint(d)
  let g = ''
  if (warm > 0.15) g += `<circle cx="${x}" cy="${y}" r="${r * (1.5 + warm)}" fill="url(#g-copper)" opacity="${0.22 + warm * 0.35}"/>`
  g += `<circle cx="${x}" cy="${y}" r="${r * 1.2}" fill="url(#g-n${col.slice(1)})" opacity="${0.6 * bright}"/>`
  // the same four-point sparkle as the stars on today's arc
  return g + `<path d="${sparkle(x, y, r * 0.95)}" fill="${col}" opacity="${bright}"/>`
}
const FIRSTS = Object.keys(stay.firsts).map(Number)
const TINTS = ['#ffd23f', '#ff9a3c', '#ffffff', '#ff8fc8', '#7ee0a5']
function confettiDay(d, x, y, s = 1) {
  const points = { ventilator: 8, cpap: 6, 'high-flow': 5, 'low-flow': 4, 'room-air': 4 }[d.support]
  const bright = { calm: 1, mixed: 0.82, hard: 0.6 }[d.mood]
  const r = (8.5 + Math.max(0, d.weight - 880) * 0.026) * s
  const warm = Math.min(1, d.parent / 210)
  const tint = d.mood === 'hard' ? '#b9d6ff' : TINTS[(d.d * 3) % 5]
  let g = ''
  if (warm > 0.15) g += `<circle cx="${x}" cy="${y}" r="${r * (1.6 + warm)}" fill="url(#g-pink)" opacity="${0.22 + warm * 0.4}"/>`
  const shape = points === 4 ? sparkle(x, y, r * 1.2, 0.28) : starN(x, y, r, points, points > 5 ? 0.52 : 0.46)
  return g + `<path d="${shape}" fill="${tint}" stroke="${tint}" stroke-width="${1.4 * s}" stroke-linejoin="round" opacity="${bright}" filter="url(#g-soft)"/>`
}
// done: her stay is whole (no day still forming), as when her sky is kept to remember her
export const dayStar = (theme, d, x, y, s = 1, done = false) => {
  if (stay.firsts[d.d] && (d.d !== stay.today || done)) {
    const i = FIRSTS.indexOf(d.d)
    return `<circle cx="${x}" cy="${y}" r="${24 * s}" fill="url(#${theme === 'confetti' ? 'g-butter' : 'g-cream'})" opacity=".55"/>` +
      (theme === 'confetti' ? planet(x, y, 11 * s, ['#3ecf7a', '#ff8fc8', '#7cc0ff'][i % 3], '#ffd23f', 'filter="url(#g-soft)"')
        : planet(x, y, 10 * s, ['#f6e7b8', '#c8b8ff', '#9ee6c4'][i % 3], '#ffb38a'))
  }
  if (d.d === stay.today && !done) return formingStar(theme, x, y, s)
  return theme === 'confetti' ? confettiDay(d, x, y, s) : nurseryDay(d, x, y, s)
}

// Today, before the day is over: a soft glow with a small star at its heart and a few motes still
// circling in. The same drawing ends the home screen's "becoming a star", in the same place, at the same size.
export function formingStar(theme, x, y, s = 1) {
  const c = theme === 'confetti'
  // its glow and circling motes run on the clock, so wherever it's drawn it is at the same moment
  const now = Date.now(), breathe = `animation-delay:-${((now % 5000) / 1000).toFixed(2)}s`, orbit = `animation-delay:-${((now % 16000) / 1000).toFixed(2)}s`
  let g = `<circle class="cv-breathe" style="${breathe}" cx="${x}" cy="${y}" r="${40 * s}" fill="url(#${c ? 'g-butter' : 'g-cream'})" opacity="${c ? 0.6 : 0.55}"/>`
  g += c
    ? `<path d="${softSparkle(x, y, 13 * s, 0.18)}" fill="#ffd23f"/><circle cx="${x}" cy="${y}" r="${1.8 * s}" fill="#fff"/>`
    : `<path d="${sparkle(x, y, 13 * s)}" fill="#fff8e6"/>`
  g += `<g class="cv-orbit" style="transform-origin:${x}px ${y}px;${orbit}">`
  const motes = c ? ['#ffd23f', '#ff8fc8', '#7ee0a5', '#ffffff', '#9fd0ff', '#ff9a3c'] : ['#f3e3b5']
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2, rr = (19 + (i % 3) * 5) * s
    g += `<circle cx="${(x + Math.cos(a) * rr).toFixed(1)}" cy="${(y + Math.sin(a) * rr).toFixed(1)}" r="${(1.6 * s).toFixed(2)}" fill="${motes[i % motes.length]}" opacity=".8"/>`
  }
  return g + '</g>'
}

/* ---------- The galaxy, drawn once per style ---------- */
function drawStay(theme) {
  const confetti = theme === 'confetti'
  const clouds = confetti ? ['#7b5cff', '#ff8fc8', '#3ecf7a', '#7cc0ff'] : ['#f3e3b5', '#d9ceff', '#f3e3b5', '#c4e0ff']
  let b = confetti ? `<circle class="cv-gfade" cx="${CX}" cy="${CY}" r="90" fill="url(#g-core)" opacity=".12"/>` : ''
  // each week's own patch of sky
  WEEK_AT.forEach(([x, y], i) => { b += `<ellipse class="cv-gfade" cx="${x}" cy="${y}" rx="120" ry="95" fill="${clouds[i % clouds.length]}" opacity="${confetti ? 0.09 : 0.045}" filter="url(#g-cloud)"/>` })
  for (let w = 1; w <= WEEKS; w++) {
    b += confetti
      ? `<polyline class="cv-gline" data-w="${w}" fill="none" stroke="#7cc0ff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>`
      : `<polyline class="cv-gline" data-w="${w}" fill="none" stroke="#f3e3b5" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".32"/>`
  }
  // today isn't joined in yet: a dashed thread from yesterday
  b += `<line class="cv-gpending" stroke="${confetti ? '#7cc0ff' : '#f3e3b5'}" stroke-width="${confetti ? 3 : 1.2}" stroke-dasharray="${confetti ? '2 9' : '3 6'}" stroke-linecap="round" opacity="${confetti ? 0.55 : 0.35}"/>`
  stay.days.forEach((d) => {
    const [x, y] = pos(d.d)
    const star = `<g class="cv-float" style="--fx:${((hash(d.d + 3) - 0.5) * 5).toFixed(1)}px;--fy:${(-2 - hash(d.d + 4) * 3).toFixed(1)}px;animation-duration:${(6 + hash(d.d + 2) * 4).toFixed(1)}s;animation-delay:-${(hash(d.d) * 9).toFixed(1)}s">${dayStar(theme, d, x, y)}</g>`
    // today's star arrives from where it formed
    b += `<g class="cv-gstar${d.d === stay.today ? ' is-today' : ''}" data-d="${d.d}">${d.d === stay.today
      ? `<g class="cv-garrive" style="--ax:${(FORM_AT[0] - x).toFixed(1)}px;--ay:${(FORM_AT[1] - y).toFixed(1)}px">${star}</g>` : star}</g>`
  })
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${DEFS}${b}</svg>`
}
// where a star appears when the camera has moved off its resting place (nearer stars move more)
function starAt(d, cam, rest) {
  const [x, y] = pos(d), z = DEPTH[d - 1]
  const dx = cam[0] + cam[2] / 2 - (rest[0] + rest[2] / 2), dy = cam[1] + cam[3] / 2 - (rest[1] + rest[3] / 2)
  return [x - dx * z, y - dy * z]
}

/* ---------- Depth: space in layers that move slower (far) or faster (near) than her stars ---------- */
const LAYERS = [{ k: 0.25, name: 'far' }, { k: 0.6, name: 'mid' }, { k: 1.7, name: 'near' }]
function drawLayer(theme, name) {
  const c = theme === 'confetti', [tx, ty] = pos(stay.today)
  const colors = c ? ['#ffd23f', '#ff8fc8', '#7ee0a5', '#ffffff', '#ff9a3c', '#9fd0ff'] : ['#ffffff', '#ffffff', '#c8b8ff', '#ffd3a3', '#a8d4ff']
  let b = ''
  if (name === 'far') b += dust(5, 420, colors, c ? 0.45 : 0.28, -W, -H, 3 * W, 3 * H, 0.8)
  if (name === 'mid') {
    b += c
      ? `<ellipse cx="${CX}" cy="${CY}" rx="420" ry="260" fill="#3a2a8f" opacity=".12" filter="url(#g-blur)"/><ellipse cx="${CX + 120}" cy="${CY - 40}" rx="260" ry="160" fill="#ff8fc8" opacity=".06" filter="url(#g-blur)"/><ellipse cx="${CX - 260}" cy="${CY + 120}" rx="200" ry="140" fill="#3ecf7a" opacity=".06" filter="url(#g-blur)"/>`
      : `<ellipse cx="${CX + 120}" cy="${CY - 60}" rx="420" ry="260" fill="#6b5bd6" opacity=".09" filter="url(#g-blur)"/>`
    b += dust(31, 160, colors, c ? 0.6 : 0.32, -W / 2, -H / 2, 2 * W, 2 * H, 1.4)
    const r = rand(13)
    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < 90; i++) {
        const t = i / 90, th = arm * Math.PI + t * 4.2, rr = 30 + t * 330 + (r() - 0.5) * 50
        b += `<circle cx="${(CX + Math.cos(th) * rr).toFixed(1)}" cy="${(CY + Math.sin(th) * rr * 0.9).toFixed(1)}" r="${(r() * 1.3 + 0.5).toFixed(2)}" fill="${colors[i % colors.length]}" opacity="${((0.15 + (1 - t) * 0.35) * (c ? 0.8 : 0.55)).toFixed(2)}"/>`
      }
    }
  }
  if (name === 'near') { // a few big, soft out-of-focus motes drifting past the camera
    const r = rand(77)
    for (let i = 0; i < 16; i++) b += `<circle cx="${(r() * 1.6 * W - 0.3 * W).toFixed(0)}" cy="${(r() * 1.6 * H - 0.3 * H).toFixed(0)}" r="${(r() * 8 + 4).toFixed(1)}" fill="${colors[i % colors.length]}" opacity="${(r() * 0.12 + 0.06).toFixed(2)}"/>`
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${DEFS}${b}</svg>`
}
// a layer at depth k sees the camera's move scaled by k: k < 1 is farther than her stars, k > 1 nearer
function layerBox(bx, k) {
  const vw = W * Math.pow(bx[2] / W, k), vh = vw * (H / W)
  const cx = W / 2 + (bx[0] + bx[2] / 2 - W / 2) * k, cy = H / 2 + (bx[1] + bx[3] / 2 - H / 2) * k
  return [cx - vw / 2, cy - vh / 2, vw, vh]
}

/* ---------- The day ring ---------- */
const LANE = { parent: 0.72, first: 0.72, care: 1, change: 1.26 }
const ang = (h) => -Math.PI / 2 + (h / 24) * Math.PI * 2 // midnight at the top, clockwise
function momentMark(theme, m, x, y) {
  const c = theme === 'confetti'
  if (m.kind === 'first') return c ? planet(x, y, 11, '#3ecf7a', '#ffd23f', 'filter="url(#g-soft)"') : planet(x, y, 10, '#efdcaa', '#ffb38a')
  if (m.kind === 'parent') {
    return `<circle cx="${x}" cy="${y}" r="20" fill="url(#${c ? 'g-pink' : 'g-copper'})"/>` +
      (c ? `<path d="${starN(x, y, 10)}" fill="#ff8fc8" stroke="#ff8fc8" stroke-width="1.6" stroke-linejoin="round" filter="url(#g-soft)"/>` : `<path d="${softSparkle(x, y, 11)}" fill="#ffc9a8"/>`)
  }
  if (m.kind === 'change') {
    const col = m.hard ? (c ? '#b9d6ff' : '#c8c2ff') : null
    return c ? `<path d="${starN(x, y, 12)}" fill="${col || '#ffd23f'}" stroke="${col || '#ffd23f'}" stroke-width="1.6" stroke-linejoin="round" filter="url(#g-soft)"/>`
      : `<path d="${softSparkle(x, y, 13)}" fill="${col || '#f3e3b5'}"/>`
  }
  return c ? `<path d="${sparkle(x, y, 7, 0.32)}" fill="#ffffff"/>` : `<circle cx="${x}" cy="${y}" r="4.5" fill="#f3e3b5" opacity=".9"/>`
}

function DayScene({ theme, day, sel, onPick }) {
  const c = theme === 'confetti'
  const ox = 300, oy = 322, R = 150
  const ringCol = c ? '#7cc0ff' : '#f3e3b5'
  const arc = (h0, h1, r) => {
    const pts = Array.from({ length: 49 }, (_, k) => { const a = ang(h0 + ((h1 - h0) * k) / 48); return [ox + Math.cos(a) * r, oy + Math.sin(a) * r] })
    return pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')
  }
  const back = useMemo(() => {
    let b = DEFS
    b += c ? dust(77, 120, ['#ffd23f', '#ff8fc8', '#7ee0a5', '#ffffff', '#9fd0ff'], 0.7) : dust(9, 90, ['#ffffff'], 0.25)
    b += `<ellipse cx="${ox}" cy="${oy}" rx="300" ry="260" fill="${c ? '#3a2a8f' : '#2b2f7a'}" opacity="${c ? 0.25 : 0.5}" filter="url(#g-blur)"/>`
    b += dayStar(theme, day, ox, oy, 2.2)
    return b
  }, [theme, day, c])
  return (
    <svg className="cv-day-scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Day ${day.d}: ${day.story}`}>
      <rect x="-2000" y="-2000" width="5000" height="5000" fill="#000" />
      <g dangerouslySetInnerHTML={{ __html: back }} />
      {/* the 24-hour ring: lit up to now on today, whole on past days */}
      {[0.72, 1, 1.26].map((k) => <circle key={k} cx={ox} cy={oy} r={R * k} fill="none" stroke={ringCol} strokeOpacity={k === 1 ? 0.22 : 0.1} strokeWidth={c && k === 1 ? 3 : 1} />)}
      <polyline points={arc(0, day.nowH, R)} fill="none" stroke={ringCol} strokeOpacity={c ? 0.8 : 0.5} strokeWidth={c ? 4.5 : 1.6} strokeLinecap="round" />
      {[[0, '12 a.m.'], [6, '6 a.m.'], [12, '12 p.m.'], [18, '6 p.m.']].map(([h, l]) => {
        const a = ang(h), x = ox + Math.cos(a) * (R * 1.5), y = oy + Math.sin(a) * (R * 1.5)
        return <text key={h} x={x} y={y + 5} textAnchor="middle" className="cv-ring-hour">{l}</text>
      })}
      {day.isToday && (() => {
        const a = ang(day.nowH)
        return (
          <g className="cv-ring-now">
            <line x1={ox + Math.cos(a) * 40} y1={oy + Math.sin(a) * 40} x2={ox + Math.cos(a) * R * 1.36} y2={oy + Math.sin(a) * R * 1.36} stroke={c ? '#ffd23f' : '#ffb38a'} strokeWidth="2" strokeLinecap="round" />
            <text x={ox + Math.cos(a) * R * 1.36 + 8} y={oy + Math.sin(a) * R * 1.36 + 4} fill={c ? '#ffd23f' : '#ffb38a'} className="cv-ring-now-label">Now</text>
          </g>
        )
      })()}
      {day.moments.map((m, i) => {
        const a = ang(m.h), r = R * LANE[m.kind], x = ox + Math.cos(a) * r, y = oy + Math.sin(a) * r
        const on = sel === i
        return (
          <g key={i} className={`cv-moment ${on ? 'is-on' : ''}`} onClick={() => onPick(i)} role="button" tabIndex={0}
            aria-label={`${m.t}, ${m.title}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(i) } }}>
            <circle cx={x} cy={y} r="22" fill="transparent" />
            {on && <circle cx={x} cy={y} r="20" fill="none" stroke={c ? '#ffd23f' : '#f3e3b5'} strokeWidth="1.5" />}
            <g dangerouslySetInnerHTML={{ __html: momentMark(theme, m, x, y) }} />
          </g>
        )
      })}
    </svg>
  )
}

// Today's star forms in the middle of the screen, a little high so it has room above the caption;
// only when her sky opens does it travel to its own place.
const FORM_AT = [W / 2, H / 2 - 48]
const onScreen = ([x, y], cw, ch) => { const s = Math.max(cw / W, ch / H); return [(cw - W * s) / 2 + x * s, (ch - H * s) / 2 + y * s] }
export const todayFormsAt = (cw, ch) => onScreen(FORM_AT, cw, ch)
export const todayOnScreen = (cw, ch) => onScreen(pos(stay.today), cw, ch)

/* ---------- The day retells itself (home → her sky, and back) ----------
   Each of today's moments lifts off the arc in the order it happened, says its few words, and drifts
   into today's star, which grows a little with each. The family moment joins last, rising from below,
   where the parents sit. The star is drawn in the sky's own space, exactly where her sky keeps it. */
export function FormingOverlay({ theme, mode, lifts = [], target = [0, 0], end = 3, onSkip }) {
  // forming, the star sits in the middle, a little high; coming back it starts in her sky
  const [x, y] = mode === 'out' ? FORM_AT : pos(stay.today)
  const html = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${DEFS}` +
    `<g class="cv-form-star">${formingStar(theme, x, y)}</g></svg>`
  return (
    <div className={`cv-forming is-${mode}`} style={{ '--form': `${Math.max(1.5, end - 0.6)}s`, '--cap': '0.9s', '--capdur': `${end + 1.1}s` }}
      onClick={onSkip} aria-hidden={mode !== 'out'}>
      <div className="cv-forming-art" dangerouslySetInnerHTML={{ __html: html }} />
      {mode === 'out' && lifts.map((l, i) => (
        <div key={i} className={`cv-lift is-${l.kind}`}
          style={{ left: l.x, top: l.y, '--tx': `${target[0] - l.x}px`, '--ty': `${target[1] - l.y}px`, '--d': `${l.delay}s` }}>
          <i />
          <span>{l.label}</span>
        </div>
      ))}
      {mode === 'out' && (
        <p className="cv-form-caption" role="status">
          <b>Today&apos;s moments become a star</b>
          <span>made of her day, and everyone who was with her, near and far</span>
        </p>
      )}
    </div>
  )
}

/* ---------- Depth behind the home screen ----------
   Far dust and a few near, soft motes, so today's sky sits in space too. Each layer drifts on its own,
   and shifts a little with the pointer (--px / --py, set by the screen), the far one least. */
export function SkyDepth({ theme }) {
  const html = useMemo(() => {
    const c = theme === 'confetti'
    const colors = c ? ['#ffd23f', '#ff8fc8', '#7ee0a5', '#ffffff', '#9fd0ff'] : ['#ffffff', '#ffffff', '#c8b8ff', '#ffd3a3', '#a8d4ff']
    const svg = (b) => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${b}</svg>`
    const r = rand(91)
    let near = ''
    for (let i = 0; i < 9; i++) near += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(r() * 7 + 4).toFixed(1)}" fill="${colors[i % colors.length]}" opacity="${(r() * 0.025 + 0.012).toFixed(3)}"/>`
    return {
      far: svg(dust(17, 170, colors, c ? 0.1 : 0.09, -40, -40, W + 80, H + 80, 0.8)),
      mid: svg(dust(23, 50, colors, c ? 0.14 : 0.11, -40, -40, W + 80, H + 80, 1.3)),
      near: svg(near),
    }
  }, [theme])
  return (
    <div className="cv-depth" aria-hidden="true">
      {['far', 'mid', 'near'].map((k) => <div key={k} className={`cv-depth-layer is-${k}`} dangerouslySetInnerHTML={{ __html: html[k] }} />)}
    </div>
  )
}

/* ---------- Shooting stars ---------- */
function ShootingStars() {
  const [shot, setShot] = useState(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let t
    const next = (n) => {
      t = setTimeout(() => {
        setShot({ n, x: 10 + Math.random() * 70, y: 5 + Math.random() * 40, a: 18 + Math.random() * 30 })
        next(n + 1)
      }, 5000 + Math.random() * 7000)
    }
    next(0)
    return () => clearTimeout(t)
  }, [])
  return shot && <span key={shot.n} className="cv-shoot" style={{ left: `${shot.x}%`, top: `${shot.y}%`, '--a': `${shot.a}deg` }} aria-hidden="true" />
}

/* ---------- Panels ---------- */
// A panel section: a small heading, then its content, on one spacing rhythm.
function Sec({ title, children, className = '' }) {
  return (
    <section className={`cv-gsec ${className}`}>
      {title && <h4 className="cv-gsec-k">{title}</h4>}
      {children}
    </section>
  )
}

function WeekPanel({ w, onDay }) {
  const info = weekInfo[w - 1]
  const firsts = daysOf(w).filter((d) => stay.firsts[d.d])
  return (
    <aside className="cv-gpanel" aria-label={`Week ${w}`}>
      <h3 className="cv-gpanel-title">{info.title}</h3>
      <div className="cv-gpanel-desc"><p>{info.summary}</p></div>
      {info.hard && <Sec title="What changed"><div className="cv-gpanel-desc"><p>{info.hard}</p></div></Sec>}
      {firsts.length > 0 && (
        <Sec title="Firsts">
          <ul className="cv-grows">
            {firsts.map((d) => (
              <li key={d.d}>
                <button type="button" onClick={() => onDay(d.d)}>
                  <span className="cv-grows-k">Day {d.d}</span><span className="cv-grows-v"><span className="cv-gplanet" aria-hidden="true" />{stay.firsts[d.d]}</span>
                </button>
              </li>
            ))}
          </ul>
        </Sec>
      )}
      <Sec title="Days">
        <div className="cv-gpanel-days">
          {daysOf(w).map((d) => <button key={d.d} type="button" onClick={() => onDay(d.d)} className={d.d === stay.today ? 'is-today' : ''}>Day {d.d}</button>)}
        </div>
      </Sec>
    </aside>
  )
}

// Label and value in two columns; a metric with several values lists them one per line.
function Facts({ rows }) {
  return (
    <dl className="cv-gfacts">
      {rows.map(([label, values]) => (
        <div key={label} className="cv-gfacts-row">
          <dt>{label}</dt>
          <dd>{[].concat(values).map((v) => <span key={v}>{v}</span>)}</dd>
        </div>
      ))}
    </dl>
  )
}

// The day in plain paragraphs: its story, then what else a parent should know, then its care times.
// A "thing to know" that repeats the story isn't said twice, but its time (and what it opens) joins the story.
function dayParagraphs(day) {
  const story = { text: day.story }
  const rest = []
  for (const x of day.things ?? []) {
    if (day.story.toLowerCase().startsWith(x.title.toLowerCase())) { if (x.detail) story.thing = x; continue }
    rest.push({ text: [x.title.replace(/\.?$/, '.'), x.text].filter(Boolean).join(' '), thing: x.detail ? x : null })
  }
  const cares = day.moments.filter((m) => m.kind === 'care').length
  return [story, ...rest, ...(cares ? [{ text: `${cares} care times, each with a feed and a diaper change.` }] : [])]
}

function DayPanel({ day, sel, onPick }) {
  const m = sel != null ? day.moments[sel] : null
  const [open, setOpen] = useState(null) // a "thing" opened from its time
  const [noImg, setNoImg] = useState(false)
  const paras = dayParagraphs(day)
  const moments = day.moments.filter((x) => x.kind !== 'care')
  return (
    <aside className="cv-gpanel" aria-label={`Day ${day.d}`}>
      <h3 className="cv-gpanel-title">{day.first ?? `Day ${day.d}`}</h3>
      <div className="cv-gpanel-desc">
        {paras.map((p, i) => (
          <Fragment key={i}>
            <p>
              {p.text}
              {p.thing && <> <button type="button" className="cv-gpanel-at" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{p.thing.t}</button></>}
            </p>
            {p.thing && open === i && (
              <div className="cv-gmoment">
                <b>{p.thing.detail.title}</b>
                <p>{p.thing.detail.text}</p>
                <figure className="cv-gthings-img">
                  {noImg ? <figcaption>{p.thing.detail.alt}</figcaption>
                    : <img src={p.thing.detail.img} alt={p.thing.detail.alt} onError={() => setNoImg(true)} />}
                </figure>
                <button type="button" className="cv-gmoment-close" onClick={() => setOpen(null)}>Close</button>
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <Sec title="Life support">
        <Facts rows={[
          ['Breathing help', day.supportLabel],
          ['Weight', `${day.weight.toLocaleString()} g`],
        ]} />
      </Sec>
      {moments.length > 0 && (
        <Sec title="Moments">
          {m ? (
            <div className="cv-gmoment">
              <span className="cv-gmoment-t">{m.t}</span>
              <b>{m.title}</b>
              <p>{m.plain}</p>
              {m.by && <span className="cv-gmoment-by">{m.by}</span>}
              <button type="button" className="cv-gmoment-close" onClick={() => onPick(null)}>All moments</button>
            </div>
          ) : (
            <ol className="cv-grows">
              {moments.map((x) => {
                const i = day.moments.indexOf(x)
                return <li key={i}><button type="button" onClick={() => onPick(i)}><span className="cv-grows-k">{x.t}</span><span className="cv-grows-v">{x.title}</span></button></li>
              })}
            </ol>
          )}
        </Sec>
      )}
    </aside>
  )
}

/* ---------- Labels: placed once, clear of every star and of the screen's own buttons ---------- */
const KEEP_CLEAR = [[0, 0, 390, 130], [W - 200, 0, W, 70], [0, H - 90, 170, H]] // the title, "Time to discharge!", "Today"
function placeLabels() {
  const placed = []
  const free = (cx, cy, hw, hh) =>
    cx - hw > SKY[0] + 10 && cx + hw < SKY[2] - 10 && cy - hh > SKY[1] + 10 && cy + hh < SKY[3] - 10 &&
    !POS.some(([px, py]) => Math.hypot(Math.max(Math.abs(px - cx) - hw, 0), Math.max(Math.abs(py - cy) - hh, 0)) < 16) &&
    ![...KEEP_CLEAR, ...placed].some(([x0, y0, x1, y1]) => cx + hw > x0 && cx - hw < x1 && cy + hh > y0 && cy - hh < y1)
  const place = ([sx, sy], hw, hh, out = Math.atan2(sy - CY, sx - CX)) => {
    for (let k = 0; k < 300; k += 4) {
      for (const da of [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2]) {
        const cx = sx + Math.cos(out + da) * k, cy = sy + Math.sin(out + da) * k
        if (free(cx, cy, hw, hh)) { placed.push([cx - hw - 6, cy - hh - 6, cx + hw + 6, cy + hh + 6]); return [cx, cy] }
      }
    }
    return [sx, sy + 30]
  }
  // week names sit beside the path, on alternating sides (above it, then below), so they read in order
  const across = Math.atan2(N[1], N[0])
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const pts = daysOf(i + 1).map((d) => pos(d.d))
    return place([pts.reduce((t, p) => t + p[0], 0) / pts.length, pts.reduce((t, p) => t + p[1], 0) / pts.length], 66, 22, across + (i % 2 ? Math.PI : 0))
  })
  const today = place(pos(stay.today), 34, 13)
  return { weeks, today }
}
const LABEL_AT = placeLabels()

/* ---------- The galaxy ---------- */
export function Galaxy({ theme, onBack, onDischarge, exit = 0 }) {
  // it opens close on today's star (where the home screen left it) and pulls back to show its week
  // review links: ?gweek=3 or ?gday=12 open straight into a week or a day
  const [view, setView] = useState(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('gday')) return { level: 'day', d: +q.get('gday') }
    if (q.get('gweek')) return { level: 'week', w: +q.get('gweek') }
    return { level: 'galaxy' }
  })
  const [story, setStory] = useState(() => !new URLSearchParams(window.location.search).get('page')) // while her sky fades in around today's star
  const [leaving, setLeaving] = useState(false) // while it fades away again, back to today
  const [landed, setLanded] = useState(true)
  const [sel, setSel] = useState(null)
  const [, setTick] = useState(0) // re-places labels while you drag
  const [fly, setFly] = useState(0)
  const [info, setInfo] = useState(false) // "How to navigate", opened from ⓘ by the title
  const infoBtn = useRef(null)
  const infoBox = useRef(null)
  const host = useRef(null)
  const box = useRef([0, 0, W, H])
  const sizeRef = useRef([W, H])
  const [size, setSize] = useState([W, H])
  const art = useMemo(() => drawStay(theme), [theme])
  const layers = useMemo(() => LAYERS.map((l) => ({ ...l, html: drawLayer(theme, l.name) })), [theme])

  // one camera for her stars and every depth layer
  const applyBox = (b) => {
    box.current = b
    const el = host.current
    if (!el) return
    el.querySelector('.cv-galaxy-art svg')?.setAttribute('viewBox', b.map((v) => v.toFixed(2)).join(' '))
    el.querySelectorAll('.cv-glayer').forEach((l) => l.firstElementChild?.setAttribute('viewBox', layerBox(b, +l.dataset.k).map((v) => v.toFixed(2)).join(' ')))
    // her stars sit at slightly different depths: nearer ones slide further and grow a little as you move
    const rest = rest_.current
    el.querySelectorAll('.cv-gstar').forEach((g) => {
      const d = +g.dataset.d, [x, y] = pos(d), [sx, sy] = starAt(d, b, rest), sc = 1
      g.setAttribute('transform', `translate(${(sx).toFixed(2)} ${(sy).toFixed(2)}) scale(${sc.toFixed(3)}) translate(${-x} ${-y})`)
    })
    el.querySelectorAll('.cv-gline').forEach((l) => {
      l.setAttribute('points', daysOf(+l.dataset.w).filter((d) => d.d !== stay.today).map((d) => starAt(d.d, b, rest).map((v) => v.toFixed(1)).join(',')).join(' '))
    })
    const pend = el.querySelector('.cv-gpending')
    if (pend && stay.today > 1) {
      const [x1, y1] = starAt(stay.today - 1, b, rest), [x2, y2] = starAt(stay.today, b, rest)
      pend.setAttribute('x1', x1); pend.setAttribute('y1', y1); pend.setAttribute('x2', x2); pend.setAttribute('y2', y2)
    }
  }

  // fly between levels
  const target = boxFor(view, size)
  const rest_ = useRef(target) // where the camera rests for this level; stars line up exactly there
  useLayoutEffect(() => {
    rest_.current = target
    const from = box.current, to = target
    if (from.every((v, i) => Math.abs(v - to[i]) < 0.01)) { applyBox(to); return undefined } // same place (a style change)
    const dist = Math.abs(Math.log(to[2] / from[2])) + Math.hypot(to[0] - from[0], to[1] - from[1]) / 400
    const long = view.level === 'today' // the way back to today
    const dur = long ? 2800 : Math.min(1400, Math.max(900, 900 + dist * 220))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf, start
    setLanded(false)
    const step = (t) => {
      start ??= t
      const p = reduce ? 1 : Math.min(1, (t - start) / dur)
      applyBox(lerpBox(from, to, p, long ? easeInOut : ease))
      if (p < 1) raf = requestAnimationFrame(step)
      else arrive()
    }
    const arrive = () => { setLanded(true); if (view.level === 'today') leave() }
    raf = requestAnimationFrame(step)
    // if frames are paused (a hidden tab), still land on time
    const done = setTimeout(() => { cancelAnimationFrame(raf); applyBox(to); arrive() }, dur + 150)
    return () => { cancelAnimationFrame(raf); clearTimeout(done) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.level, view.w, view.d, art, layers, fly, target[0], target[1], target[2]])

  useEffect(() => { const t = setTimeout(() => setStory(false), 2200); return () => clearTimeout(t) }, [])
  // "Today" (bottom left, in the screen's footer) takes her back from any level
  useEffect(() => { if (exit) goToday() }, [exit]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = host.current
    const ro = new ResizeObserver(() => { sizeRef.current = [el.clientWidth, el.clientHeight]; setSize(sizeRef.current) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // the art uses "slice": it fills the screen and crops
  const scaleOf = (b) => { const [cw, ch] = sizeRef.current; return Math.max(cw / b[2], ch / b[3]) }
  const project = ([x, y]) => {
    const b = box.current, [cw, ch] = size, s = scaleOf(b)
    return [(cw - b[2] * s) / 2 + (x - b[0]) * s, (ch - b[3] * s) / 2 + (y - b[1]) * s]
  }
  // keep some of her sky on screen however far you drag
  const clampBox = (b) => {
    const cx = Math.min(SKY[2] + 60, Math.max(SKY[0] - 60, b[0] + b[2] / 2)), cy = Math.min(SKY[3] + 60, Math.max(SKY[1] - 60, b[1] + b[3] / 2))
    return [cx - b[2] / 2, cy - b[3] / 2, b[2], b[3]]
  }

  const goGalaxy = () => { setSel(null); setView({ level: 'galaxy' }) }
  const goWeek = (w) => { setSel(null); setView({ level: 'week', w: Math.min(WEEKS, Math.max(1, w)) }) }
  // moved away from where this level started (by dragging or pinching)
  const panned = landed && view.level !== 'day' && box.current.some((v, i) => Math.abs(v - target[i]) > 8)
  const recenter = () => setFly((f) => f + 1) // flies back to this level's own view
  // Back to today: settle on her whole sky, let it fade away around today's star, then home
  const leave = () => { setLeaving(true); setTimeout(onBack, 1000) }
  const goToday = () => { setSel(null); if (view.level === 'galaxy' && !panned) leave(); else setView({ level: 'today' }) }
  const goDay = (d) => (d >= stay.today ? goToday() : (setSel(null), setView({ level: 'day', d: Math.max(1, d) })))
  // the tip takes focus when it opens and hands it back to ⓘ when it closes
  const closeInfo = () => { setInfo(false); infoBtn.current?.focus() }
  useEffect(() => { if (info) infoBox.current?.focus() }, [info])
  useEffect(() => { if (view.level !== 'galaxy' || panned) setInfo(false) }, [view.level, panned])
  const up = () => (view.level === 'day' ? goWeek(stay.days[view.d - 1].week) : view.level === 'week' ? goGalaxy() : view.level === 'galaxy' ? goToday() : null)

  // Drag to look around her sky (galaxy and week). On a day, swipe sideways for the day before or after.
  const drag = useRef(null)
  const justDragged = useRef(false)
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.target.closest('.cv-gpanel, .cv-galaxy-nav, .cv-ginfo, .cv-ginfo-btn')) return
    drag.current = { x: e.clientX, y: e.clientY, box: [...box.current], moved: false, id: e.pointerId }
    justDragged.current = false
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || !landed) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 6) return
      d.moved = true
      host.current.setPointerCapture(d.id)
      host.current.classList.add('is-dragging')
    }
    if (view.level === 'day') return
    const s = scaleOf(d.box)
    applyBox(clampBox([d.box[0] - dx / s, d.box[1] - dy / s, d.box[2], d.box[3]]))
    setTick((t) => t + 1)
  }
  const onPointerUp = (e) => {
    const d = drag.current
    drag.current = null
    host.current.classList.remove('is-dragging')
    if (!d?.moved) return
    justDragged.current = true // the drag shouldn't also count as a tap
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (view.level === 'day' && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.3) goDay(view.d + (dx < 0 ? 1 : -1))
  }
  const onClickCapture = (e) => { if (justDragged.current) { e.stopPropagation(); e.preventDefault(); justDragged.current = false } }

  // Two-finger scroll looks around; pinch zooms toward your fingers
  useEffect(() => {
    const el = host.current
    const onWheel = (e) => {
      if (view.level === 'day' || !landed || e.target.closest('.cv-gpanel')) return
      e.preventDefault()
      const b = box.current, s = scaleOf(b), [cw, ch] = sizeRef.current
      if (e.ctrlKey) {
        const r = el.getBoundingClientRect()
        const wx = b[0] + (e.clientX - r.left - (cw - b[2] * s) / 2) / s, wy = b[1] + (e.clientY - r.top - (ch - b[3] * s) / 2) / s
        const vw = Math.min(Math.max(1300, skyBox(cw, ch)[2] * 1.3), Math.max(220, b[2] * Math.exp(e.deltaY * 0.01))), k = vw / b[2]
        if (e.deltaY > 0 && view.level === 'week' && vw > target[2] * 1.3) { goGalaxy(); return }
        applyBox(clampBox([wx - (wx - b[0]) * k, wy - (wy - b[1]) * k, vw, vw * (H / W)]))
      } else applyBox(clampBox([b[0] + e.deltaX / s, b[1] + e.deltaY / s, b[2], b[3]]))
      setTick((t) => t + 1)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  })

  useEffect(() => {
    const onKey = (e) => {
      if (info) { if (e.key === 'Escape') { e.preventDefault(); closeInfo() } return } // Esc closes the tip, not the sky
      if (e.key === 'Escape') { e.preventDefault(); up() }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const k = e.key === 'ArrowRight' ? 1 : -1
        if (view.level === 'week') goWeek(view.w + k)
        if (view.level === 'day') goDay(view.d + k)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Week labels, placed in screen space so no star, other label, panel or edge ever covers one
  const dayLabels = (() => {
    if (view.level !== 'week' || !landed) return []
    const [cw, ch] = size, right = cw - Math.min(360, cw * 0.38) - 40
    const days = daysOf(view.w), pts = days.map((d) => project(starAt(d.d, box.current, target)))
    const all = stay.days.map((d) => project(starAt(d.d, box.current, target)))
    const placed = []
    return days.map((d, i) => {
      const [x, y] = pts[i], first = stay.firsts[d.d]
      const w = Math.max(first ? first.length * 7.6 : 0, 46) + 8, h = first ? 38 : 20
      const out = Math.atan2(y - ch / 2, x - cw * 0.3)
      let best = null
      for (const r of [30, 40, 52]) {
        for (const da of [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8, Math.PI]) {
          const a = out + da, cx = x + Math.cos(a) * (r + w * 0.35 * Math.abs(Math.cos(a))), cy = y + Math.sin(a) * (r + h * 0.3)
          const box2 = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]
          const inside = box2[0] > 8 && box2[2] < right && box2[1] > 64 && box2[3] < ch - 12
          const hitsStar = all.some(([sx, sy], j) => { const m = stay.firsts[j + 1] ? 26 : 14; return sx > box2[0] - m && sx < box2[2] + m && sy > box2[1] - m && sy < box2[3] + m })
          const hitsLabel = placed.some((o) => box2[0] < o[2] + 6 && box2[2] > o[0] - 6 && box2[1] < o[3] + 4 && box2[3] > o[1] - 4)
          if (inside && !hitsStar && !hitsLabel) { best = [cx, cy, box2]; break }
        }
        if (best) break
      }
      best ??= [x, y - 30, [x - w / 2, y - 30 - h / 2, x + w / 2, y - 30 + h / 2]]
      placed.push(best[2])
      return { d, x, y, dx: best[0] - x, dy: best[1] - y }
    })
  })()
  const day = view.level === 'day' ? dayDetail(view.d) : null
  const wOf = (d) => stay.days[d - 1].week
  const crumbs = [
    { label: 'Today', go: goToday },
    { label: "Mila's stars", go: view.level === 'galaxy' ? null : goGalaxy },
    ...(view.level === 'week' || view.level === 'day' ? [{ label: `Week ${view.level === 'week' ? view.w : wOf(view.d)}`, go: view.level === 'day' ? () => goWeek(wOf(view.d)) : null }] : []),
    ...(view.level === 'day' ? [{ label: `Day ${view.d}`, go: null }] : []),
  ]
  const prev = view.level === 'week' ? (view.w > 1 ? { label: `Week ${view.w - 1}`, go: () => goWeek(view.w - 1) } : null)
    : view.level === 'day' ? (view.d > 1 ? { label: `Day ${view.d - 1}`, go: () => goDay(view.d - 1) } : null) : null
  const next = view.level === 'week' ? (view.w < WEEKS ? { label: `Week ${view.w + 1}`, go: () => goWeek(view.w + 1) } : null)
    : view.level === 'day' ? { label: view.d + 1 >= stay.today ? 'Today' : `Day ${view.d + 1}`, go: () => goDay(view.d + 1) } : null
  const faded = view.level === 'day' ? 'is-faded' : ''
  const layer = (l) => <div key={l.name} className={`cv-glayer is-${l.name} ${faded}`} data-k={l.k} dangerouslySetInnerHTML={{ __html: l.html }} />

  return (
    <div className={`cv-galaxy is-${theme} is-${view.level} ${panned ? 'is-panned' : ''} ${story ? 'is-arriving' : ''} ${leaving ? 'is-leaving' : ''}`} ref={host}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onClickCapture={onClickCapture}>
      {layers.filter((l) => l.k < 1).map(layer)}
      <div className={`cv-galaxy-art ${faded}`} dangerouslySetInnerHTML={{ __html: art }} />
      {layers.filter((l) => l.k > 1).map(layer)}
      {view.level !== 'day' && <ShootingStars />}

      {/* Galaxy: each week named in plain words; every star opens its week */}
      {view.level === 'galaxy' && landed && !story && (
        // drawn small (a phone), her sky keeps only the week names and today, so nothing crowds
        <div className={`cv-glabels ${scaleOf(box.current) < 0.6 ? 'is-compact' : ''}`}>
          {Array.from({ length: WEEKS }, (_, i) => {
            const pts = daysOf(i + 1).map((d) => project(starAt(d.d, box.current, target)))
            const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
            const x0 = Math.min(...xs) - 30, x1 = Math.max(...xs) + 30, y0 = Math.min(...ys) - 30, y1 = Math.max(...ys) + 30
            return <button key={`area${i}`} type="button" className="cv-garea" aria-label={`Week ${i + 1}: ${weekInfo[i].title}`}
              style={{ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }} onClick={() => goWeek(i + 1)} />
          })}
          {stay.days.map((d) => {
            const [x, y] = project(starAt(d.d, box.current, target))
            return <button key={d.d} type="button" className={`cv-ghit ${d.d === stay.today ? 'is-today' : ''}`} style={{ left: x, top: y }} aria-label={`Week ${d.week}, day ${d.d}`}
              onClick={() => (d.d === stay.today ? goDay(d.d) : goWeek(d.week))} />
          })}
          {LABEL_AT.weeks.map((p, i) => {
            const [x, y] = project(p)
            return (
              <button key={i} type="button" className="cv-gweek" style={{ left: x, top: y }} onClick={() => goWeek(i + 1)}>
                <b>Week {i + 1}</b><span>{weekInfo[i].caption}</span>
              </button>
            )
          })}
          {(() => {
            const [x, y] = project(LABEL_AT.today)
            return <button type="button" className="cv-gweek is-today" style={{ left: x, top: y }} onClick={() => goDay(stay.today)}><b>Today</b></button>
          })()}
        </div>
      )}

      {/* Week: each day labeled (firsts by name); tap one to open it */}
      {view.level === 'week' && landed && (
        <div className="cv-glabels">
          {dayLabels.map(({ d, x, y, dx, dy }) => (
            <button key={d.d} type="button" className={`cv-gday ${d.d === stay.today ? 'is-today' : ''}`} style={{ left: x, top: y }} onClick={() => goDay(d.d)} aria-label={`Day ${d.d}${stay.firsts[d.d] ? `, ${stay.firsts[d.d]}` : ''}`}>
              <span className="cv-gday-label" style={{ left: `calc(50% + ${dx}px)`, top: `calc(50% + ${dy}px)` }}>
                {stay.firsts[d.d] && <em>{stay.firsts[d.d]}</em>}
                <span>{d.d === stay.today ? 'Today' : `Day ${d.d}`}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {view.level === 'day' && (
        <div className={`cv-gday-scene ${landed ? 'is-in' : ''}`}>
          <DayScene key={view.d} theme={theme} day={day} sel={sel} onPick={setSel} />
        </div>
      )}

      {view.level === 'galaxy' && !story && (
        <div className="cv-galaxy-title">
          <div className="cv-galaxy-head">
            <b>Mila&apos;s stars</b>
            <button ref={infoBtn} type="button" className="cv-ginfo-btn" aria-label="How to navigate" aria-expanded={info} aria-controls="cv-ginfo"
              onClick={() => (info ? closeInfo() : setInfo(true))}>
              <InfoIcon />
            </button>
          </div>
          <p className="cv-gsum">
            <b>{stay.days.length}</b> {stay.days.length === 1 ? 'star' : 'stars'}, gathered into <b>{WEEKS}</b> {WEEKS === 1 ? 'constellation' : 'constellations'}
          </p>
        </div>
      )}
      {view.level === 'galaxy' && !story && info && (
        <>
          <div className="cv-ginfo-scrim" onClick={closeInfo} aria-hidden="true" />
          <div className="cv-sheet cv-ginfo" id="cv-ginfo" role="dialog" aria-label="How to navigate" ref={infoBox} tabIndex={-1}>
            <div className="cv-sheet-head">
              <h3>How to look around</h3>
              <button type="button" className="cv-close" onClick={closeInfo}>Close</button>
            </div>
            <ul className="cv-help">
              <li><b>Each day is a star.</b> Each week of her stay makes its own constellation.</li>
              <li><b>Drag</b> to look around her sky. <b>Center</b> brings you back.</li>
              <li><b>Tap a week</b> to look closer, then a day to see it.</li>
            </ul>
          </div>
        </>
      )}
      {view.level === 'galaxy' && !story && onDischarge && (
        <button type="button" className="nav-btn nav-corner cv-discharge-btn" onClick={onDischarge}><span>Time to discharge!</span></button>
      )}
      {view.level === 'week' && landed && <WeekPanel w={view.w} onDay={goDay} />}
      {view.level === 'day' && landed && <DayPanel day={day} sel={sel} onPick={setSel} />}

      {/* Where you are, top-left: a breadcrumb. Tap any earlier step to go up a level.
          Slashes, not chevrons, so it never reads as "previous / next". */}
      <div className="cv-galaxy-nav" hidden={view.level === 'today' || story}>
        <nav className="nav-crumbs" aria-label="Where you are">
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.label}>
                {i > 0 && <span className="nav-crumbs-sep" aria-hidden="true">/</span>}
                {c.go
                  ? <button type="button" className="nav-crumb" onClick={c.go}>{c.label}</button>
                  : <span className="nav-crumb is-here" aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        {panned && <button type="button" className="nav-btn" onClick={recenter}><CenterIcon /><span>Center</span></button>}
      </div>

      {/* Moving sideways, bottom-left: the day or week before and after, each named. */}
      {(view.level === 'week' || view.level === 'day') && !story && (
        <nav className="nav-pager" aria-label={view.level === 'week' ? 'Other weeks' : 'Other days'}>
          <button type="button" className="nav-btn nav-pager-prev" disabled={!prev} onClick={prev?.go}>
            <ChevronLeft /><span>{prev ? prev.label : view.level === 'week' ? 'Previous week' : 'Previous day'}</span>
          </button>
          <button type="button" className="nav-btn is-trailing nav-pager-next" disabled={!next} onClick={next?.go}>
            <span>{next ? next.label : 'Next week'}</span><ChevronRight />
          </button>
        </nav>
      )}
    </div>
  )
}
