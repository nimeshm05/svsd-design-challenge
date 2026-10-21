import { useEffect, useRef, useState } from 'react'

// Her, in depth, traced from one image (public/her.webp, a sculpt seen from above): an outline, a little
// abstracted, never a photo. On first load: cut her out of the white background, estimate how thick she
// is at every point (from her silhouette, nudged by the image's shading), then draw a glowing contour of
// her at each height, like a topographic drawing. The contours sit at their heights in one 3D stage, so
// turning her shows her shape. What's on her sits on her body at the right height, with a thin line down
// to the mattress and the wire running along it. New things glow blue; what came off is a faint ghost.
const SRC = `${import.meta.env.BASE_URL}her.webp`
const LEVELS = [0, 0.32, 0.58, 0.8] // her outline, then three soft contours toward the middle of her
const DEPTH = 30 // px from her back to the top of her tummy
const AW = 100, AH = 81.4 // overlay units (the image's aspect)

let cache = null // traced once, then reused
function trace() {
  if (cache) return cache
  cache = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const w = 340, h = Math.round((img.height / img.width) * w)
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h
      const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, w, h)
      const px = cx.getImageData(0, 0, w, h).data
      // 1. cut out: the background is white (her soft shadow on the ground is left out too)
      const inside = new Uint8Array(w * h), lum = new Float32Array(w * h)
      for (let i = 0; i < w * h; i++) {
        const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]
        inside[i] = Math.min(r, g, b) < 236 && r > 70 ? 1 : 0
        lum[i] = (0.3 * r + 0.59 * g + 0.11 * b) / 255
      }
      // 2. thickness: distance to her outline (two-pass chamfer), shaped like a soft dome, plus shading
      const dist = new Float32Array(w * h)
      for (let i = 0; i < w * h; i++) dist[i] = inside[i] ? 1e9 : 0
      const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : dist[y * w + x])
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (dist[i]) dist[i] = Math.min(dist[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.4, at(x + 1, y - 1) + 1.4)
      }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x
        if (dist[i]) dist[i] = Math.min(dist[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.4, at(x - 1, y + 1) + 1.4)
      }
      let max = 1
      for (let i = 0; i < w * h; i++) if (inside[i] && dist[i] > max) max = dist[i]
      const depth = new Float32Array(w * h).fill(-1)
      for (let i = 0; i < w * h; i++) if (inside[i]) depth[i] = 0.94 * Math.sqrt(Math.min(1, dist[i] / max)) + 0.06 * lum[i]
      // smooth it a little, so the contours are clean, calm lines
      for (let pass = 0; pass < 3; pass++) {
        const src2 = depth.slice()
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
          const i = y * w + x
          if (!inside[i]) continue
          let sum = 0, n = 0
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = src2[i + dy * w + dx]; if (v >= 0) { sum += v; n++ } }
          depth[i] = sum / n
        }
      }
      // 3. contours: at each height, the edge of everything at least that thick, drawn as a soft line
      const layers = []
      for (let k = 0; k < LEVELS.length; k++) {
        const t = LEVELS[k], out = cx.createImageData(w, h), o = out.data
        const on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && depth[y * w + x] >= t
        const a = k === 0 ? 235 : Math.round(255 * (0.55 - k * 0.08)) // her outline brightest, the inner lines quieter
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (!on(x, y) || (on(x - 1, y) && on(x + 1, y) && on(x, y - 1) && on(x, y + 1))) continue
          for (const [dx, dy] of (k === 0 ? [[0, 0], [1, 0], [0, 1]] : [[0, 0]])) { // outline two pixels wide, inner lines one
            const j = ((y + dy) * w + (x + dx)) * 4
            if (j >= o.length) continue
            o[j] = 255; o[j + 1] = 246; o[j + 2] = 224; o[j + 3] = a
          }
        }
        if (k === 0) { // a faint fill on the lowest contour, so she reads as one shape
          for (let i = 0; i < w * h; i++) if (depth[i] >= 0 && !o[i * 4 + 3]) { o[i * 4] = 243; o[i * 4 + 1] = 227; o[i * 4 + 2] = 181; o[i * 4 + 3] = 26 }
        }
        cx.putImageData(out, 0, 0)
        layers.push({ z: t * DEPTH, url: cv.toDataURL('image/png') })
      }
      // how high her body is at a point (overlay units), so what's on her sits on her
      const heightAt = (ux, uy) => {
        const x = Math.round((ux / AW) * w), y = Math.round((uy / AH) * h)
        let best = 0
        for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
          const xx = x + dx, yy = y + dy
          if (xx >= 0 && yy >= 0 && xx < w && yy < h) best = Math.max(best, depth[yy * w + xx])
        }
        return best * DEPTH
      }
      resolve({ layers, heightAt })
    }
    img.onerror = () => resolve({ layers: [], heightAt: () => 0 })
    img.src = SRC
  })
  return cache
}

// What can be on her: where it touches her (overlay units), its mark there, and the wire along the bed
const DEVICES = {
  vent: { at: [[70, 23]], mark: (x, y) => <rect x={x - 2} y={y - 1.5} width="5" height="3" rx="1" />, wire: 'M70 23 C 82 30, 94 34, 104 34' },
  cpap: { at: [[71, 20]], mark: (x, y) => <ellipse cx={x} cy={y} rx="5" ry="6.5" transform={`rotate(-35 ${x} ${y})`} />, wire: 'M71 20 C 80 28, 92 30, 104 28' },
  cannula: { at: [[72, 19]], mark: (x, y) => <path d={`M${x - 2} ${y - 2} Q ${x + 2} ${y} ${x - 1} ${y + 3}`} />, wire: 'M72 19 C 84 14, 94 12, 104 12' },
  feeding: { at: [[70, 23]], mark: (x, y) => <circle cx={x} cy={y} r=".9" />, wire: 'M70 23 C 82 16, 94 15, 104 16' },
  heart: { at: [[53, 23], [67, 37], [49, 43]], mark: (x, y) => <circle cx={x} cy={y} r="1.6" />, wire: 'M53 23 C 74 32, 92 42, 104 44 M67 37 C 82 46, 94 50, 104 52 M49 43 C 70 56, 90 60, 104 60' },
  temp: { at: [[56, 50]], mark: (x, y) => <circle cx={x} cy={y} r="1.4" />, wire: 'M56 50 C 76 62, 92 66, 104 68' },
  pulse: { at: [[30, 74]], mark: (x, y) => <rect x={x - 3.5} y={y - 2.5} width="7" height="5" rx="2" />, wire: 'M30 74 C 56 80, 86 78, 104 74' },
  iv: { at: [[43, 29]], mark: (x, y) => <circle cx={x} cy={y} r="1.4" />, wire: 'M43 29 C 64 12, 88 6, 104 6' },
}

export function HerModel({ present = [], changed = [], label, still = false }) {
  const [model, setModel] = useState(null)
  const [rot, setRot] = useState(() => (still ? [0, 0] : [48, 34])) // tilt, turn: a still picture is flat and straight-on
  const drag = useRef(null)
  useEffect(() => { let on = true; trace().then((m) => on && setModel(m)); return () => { on = false } }, [])
  const shown = Object.keys(DEVICES).filter((id) => present.includes(id) || changed.includes(id))
  const cls = (id) => `her3d-dev ${changed.includes(id) && present.includes(id) ? 'is-new' : ''} ${!present.includes(id) ? 'is-gone' : ''}`
  return (
    <div className={`her3d ${still ? 'is-still' : ''}`} role="img" aria-label={label}
      onPointerDown={(e) => { if (still) return; drag.current = { x: e.clientX, y: e.clientY, rot }; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={(e) => {
        const g = drag.current
        if (!g) return
        setRot([Math.max(0, Math.min(72, g.rot[0] - (e.clientY - g.y) * 0.4)), Math.max(-90, Math.min(120, g.rot[1] + (e.clientX - g.x) * 0.5))])
      }}
      onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
      <div className="her3d-stage" style={{ transform: `rotateX(${rot[0]}deg) rotateZ(${rot[1]}deg)` }}>
        <div className="her3d-bed" />
        {/* wires lie along her mattress */}
        <svg className="her3d-layer" viewBox={`0 0 ${AW} ${AH}`} style={{ transform: 'translateZ(.5px)' }}>
          {shown.map((id) => <g key={id} className={cls(id)}><path d={DEVICES[id].wire} /></g>)}
        </svg>
        {model?.layers.map((l, i) => <img key={i} className="her3d-img" src={l.url} alt="" draggable="false" style={{ transform: `translateZ(${l.z.toFixed(1)}px)` }} />)}
        {/* each thing sits on her body at its height, with a thin line down to where its wire runs */}
        {model && shown.flatMap((id) => DEVICES[id].at.map(([x, y], j) => {
          const z = model.heightAt(x, y) + 0.6
          return (
            <div key={`${id}${j}`}>
              <span className={`her3d-post ${cls(id)}`} style={{ left: `${x}%`, top: `${(y / AH) * 100}%`, height: z }} />
              <svg className="her3d-layer" viewBox={`0 0 ${AW} ${AH}`} style={{ transform: `translateZ(${z.toFixed(1)}px)` }}>
                <g className={cls(id)}>{DEVICES[id].mark(x, y)}</g>
              </svg>
            </div>
          )
        }))}
      </div>
    </div>
  )
}
