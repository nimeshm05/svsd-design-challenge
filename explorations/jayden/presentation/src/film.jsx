import { useEffect, useRef, useState } from 'react'
import { Scene } from './demo.jsx'
import { StarGlyph } from './glyphs.jsx'

// The product demo as one self-playing film, in the style of a product feature video: the real bedside
// prototype in its frame, the camera pushing in to each feature and pulling back, a visible finger tapping
// and dragging on the screen, the rest of the screen dimming around what matters, and one short callout
// for each feature with the pillar it serves. Between the screen segments, the storyboard's sketches hold
// the place of the short scenario clips that will be cut in during editing (CLIP slots in the script).
// It ends on its own closing. Silent; captions carry it. About 2½ minutes; Replay restarts it.

const PILLAR = {
  connection: { name: 'Connection', color: 'var(--connection)' },
  comprehension: { name: 'Comprehension', color: 'var(--comprehension)' },
  awareness: { name: 'Awareness', color: 'var(--awareness)' },
  baby: { name: 'For the baby', color: 'var(--warm)' },
}
const rnd = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x) }
const FIELD = Array.from({ length: 98 }, (_, k) => [rnd(k) * 100, rnd(k + 200) * 100, 0.5 + rnd(k + 400) * 1.3, 2 + rnd(k + 600) * 4])
const WIDE = { fx: 0.5, fy: 0.5, s: 1, ox: 0 }
const sleep = (ms, run) => new Promise((ok, no) => { const t = setTimeout(() => (run.dead ? no(new Error('stop')) : ok()), ms); run.timers.push(t) })

export function DemoFilm({ active, thumb }) {
  const frame = useRef(null)
  const screen = useRef(null)
  const [ready, setReady] = useState(false)
  const [run, setRun] = useState(0)
  const [v, setV] = useState({ scene: null, cap: null, cam: WIDE, spot: null, call: null, touch: null, pad: false, close: 0, done: false, t: 0 })
  const set = (patch) => setV((x) => ({ ...x, ...patch }))

  useEffect(() => {
    if (!active || !ready || thumb) return
    const R = { dead: false, timers: [] }
    const t0 = performance.now()
    const tick = setInterval(() => set({ t: (performance.now() - t0) / 1000 }), 200)
    const doc = () => frame.current?.contentDocument
    const win = () => frame.current?.contentWindow
    const post = (msg) => win()?.postMessage(msg, '*')
    const find = (sel) => (typeof sel === 'function' ? sel(doc()) : doc()?.querySelector(sel))
    // where an element sits on the screen, as fractions of the screen
    const at = (sel, pad = 0.012) => {
      const el = find(sel), f = frame.current
      if (!el || !f) return null
      const r = el.getBoundingClientRect(), W = f.clientWidth, H = f.clientHeight
      return { x: r.left / W - pad, y: r.top / H - pad * 1.43, w: r.width / W + pad * 2, h: r.height / H + pad * 2.86 }
    }
    const wait = (s) => sleep(s * 1000, R)
    // camera: push in so the target sits a little left of center, leaving room for its callout
    const zoom = (sel, s = 1.6, ox = -0.17) => { const r = at(sel, 0); if (r) set({ cam: { fx: r.x + r.w / 2, fy: r.y + r.h / 2, s, ox } }) }
    const wide = () => set({ cam: WIDE, spot: null, call: null })
    const spot = (sel, call) => { const r = at(sel); set({ spot: r, call: call ?? null }) }
    // a finger: it arrives, presses, and the screen answers
    const tap = async (sel, after) => {
      const r = at(sel, 0); if (!r) return
      const p = { x: r.x + r.w / 2, y: r.y + r.h / 2 }
      set({ touch: { ...p, s: 'move' } }); await wait(0.7)
      set({ touch: { ...p, s: 'press' } }); await wait(0.18)
      after ? after() : find(sel)?.click()
      await wait(0.35); set({ touch: { ...p, s: 'lift' } }); await wait(0.5); set({ touch: null })
    }
    const drag = async (from, to, after) => {
      const a = at(from, 0), b = at(to, 0); if (!a || !b) return
      const p = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, q = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
      set({ touch: { ...p, s: 'move' } }); await wait(0.7)
      set({ touch: { ...p, s: 'press' } }); await wait(0.25)
      set({ touch: { ...q, s: 'drag' } }); await wait(1.4)
      after?.(); await wait(0.3)
      set({ touch: { ...q, s: 'lift' } }); await wait(0.5); set({ touch: null })
    }
    // a storyboard moment, standing in for a scenario clip
    const clip = async (kind, cap, s = 4.2) => {
      set({ pad: false, scene: kind, cap, spot: null, call: null }); await wait(s)
      set({ scene: null, cap: null })
    }
    const show = async (what, settle = 1.2) => { post({ type: 'mila:show', what }); await wait(settle) }
    const chapter = async (c, settle = 1.2) => { post({ type: 'mila:chapter', chapter: c }); await wait(settle) }
    const pad = async (cap) => { set({ pad: true, cap: cap ?? null }); await wait(1.1) }

    const script = async () => {
      set({ scene: null, cap: null, cam: WIDE, spot: null, call: null, touch: null, pad: false, close: 0, done: false })
      await chapter('born', 0.6)
      // 0 · establish
      await pad('Mila’s Sky lives at her bedside.'); await wait(2.4)

      // 1 · Connection: she arrives
      await clip('arrive', <><b>Day 1, 4:20 a.m.</b> Dad meets her for the first time.</>) // CLIP slot 1
      await pad(); await wait(0.6)
      zoom('.fd-star', 2.1); await wait(1.4)
      spot('.fd-star', { p: 'connection', title: 'Her first star', line: 'As big as she is. It asks nothing of him.' }); await wait(3.2)
      zoom('.fd-size', 1.9); await wait(0.6)
      spot('.fd-size', { p: 'connection', title: 'How small she is', line: 'In words he can feel, not only numbers.' }); await wait(3.2)
      wide(); await wait(1.2)

      // 2 · Comprehension: what's on her
      await clip('explain', <>Her nurse explains what&apos;s on her.</>) // CLIP slot 2
      await chapter('story', 0.4); await pad(); await wait(0.6)
      spot((d) => [...d.querySelectorAll('.cv-actions button')].find((b) => /What.s on her/.test(b.textContent)), { p: 'comprehension', title: 'What’s on her', line: 'Her nurse opens it while explaining.' }); await wait(1.6)
      await tap((d) => [...d.querySelectorAll('.cv-actions button')].find((b) => /What.s on her/.test(b.textContent)))
      set({ spot: null }); await wait(0.9)
      zoom('.fd-walk', 1.35, -0.14); await wait(1.2)
      spot('.fd-model', { p: 'comprehension', title: 'One thing at a time', line: 'Each wire and tube lit on her outline, in one plain sentence.' }); await wait(2.6)
      await tap('.fd-next'); await wait(1.6)
      await tap('.fd-next'); await wait(1.8)
      wide(); await wait(1.2)

      // 3 · Comprehension: Day 23, a hard night she missed
      await clip('away', <><b>Day 2.</b> Mom is still recovering, two floors away.</>) // CLIP slot 3
      await clip('chair', <><b>Day 23.</b> She comes back after a hard night.</>) // CLIP slot 4
      await show('today', 0.3); await pad(); await wait(0.6)
      zoom('.cv-one', 1.75); await wait(1.3)
      spot('.cv-cap', { p: 'comprehension', title: 'Her day, in plain words', line: 'What happened, and what’s next, in one line.' }); await wait(2.8)
      await tap('.cv-term-btn'); await wait(0.6)
      zoom('.cv-pop', 1.7); await wait(1.2)
      spot('.cv-pop', { p: 'comprehension', title: 'The medical word, one tap away', line: 'With her 3D model, when it’s something on her.' }); await wait(3.4)
      set({ spot: null, call: null }); await tap('.cv-one', () => doc()?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); await wait(0.8)

      // 4 · Connection: she was there too
      zoom('.cv-arc', 1.35, -0.12); await wait(1.2)
      await drag('.cv-arc-now', '.cv-arc-mark[data-kind="family"]', () => post({ type: 'mila:show', what: 'family' })); await wait(0.6)
      spot('.cv-cap', { p: 'connection', title: 'Moments she was there for', line: 'Noted by her nurse, from what’s already charted. No new tasks.' }); await wait(3.4)
      wide(); await wait(1)

      // 5 · Awareness: what's ahead
      await show('today', 0.8)
      spot('.cv-clock', { p: 'awareness', title: 'Time, on every screen', line: 'So the day never becomes a blur.' }); await wait(2.6)
      await tap('.cv-ahead-btn'); set({ spot: null }); await wait(1.4)
      zoom('.ah-tabs', 1.15, -0.1); await wait(1.2)
      spot((d) => d.querySelector('.ah-panel') ?? d.querySelector('.ah'), { p: 'awareness', title: 'What’s ahead', line: 'Today and the next six days, so nothing is a surprise.' }); await wait(3)
      await tap((d) => [...d.querySelectorAll('.ah-tabs button')].find((b) => /Next Steps/.test(b.textContent))); await wait(0.8)
      spot((d) => d.querySelector('.ah-panel') ?? d.querySelector('.ah'), { p: 'awareness', title: 'Next steps', line: 'Where she is on each path, and what comes next.' }); await wait(3)
      wide(); await wait(1)

      // 6 · Night
      await clip('night', <>At night, she stays beside her.</>, 3.6) // CLIP slot 5
      await show('night', 0.3); await pad(); await wait(0.4)
      set({ call: { p: 'baby', title: 'Night view', line: 'The screen almost disappears: the time and one quiet line.', wide: true } }); await wait(3.6)
      set({ call: null })

      // 7 · Every day becomes a star
      await show('today', 1.4)
      await tap('.cv-lookup-btn'); await wait(0.4)
      set({ cap: 'Today’s moments gather into one star.' }); await wait(6.2)
      set({ cap: null, call: { p: 'connection', title: 'Every day becomes a star', line: 'Her weeks become constellations. The sky only grows.', wide: true } }); await wait(4.6)
      set({ call: null })

      // 8 · Going home
      await clip('ending', <><b>Day 98.</b> The day she goes home.</>) // CLIP slot 6
      await show('home', 0.3); await pad(); await wait(5)
      set({ call: { p: 'connection', title: 'Her sky goes home with her', line: 'Every star, as a mobile above her crib.', wide: true } }); await wait(4)
      set({ call: null })

      // 9 · If she doesn't go home
      await clip('keep', <>And if she doesn&apos;t go home.</>) // CLIP slot 7
      await show('not', 0.3); await pad(); await wait(2.2)
      set({ call: { p: 'connection', title: 'Her story, kept', line: 'At the family’s pace. Nothing assumes an outcome.', wide: true } }); await wait(3)
      await tap('.rem-continue'); await wait(2.6)
      await tap('.rem-continue'); await wait(2.8)
      set({ call: null })

      // 10 · closing
      set({ pad: false, cap: null }); await wait(1.6)
      set({ close: 1 }); await wait(3.6)
      set({ close: 2 }); await wait(3.8)
      set({ close: 3 }); await wait(5)
      set({ done: true })
    }
    script().catch(() => {})
    return () => { R.dead = true; R.timers.forEach(clearTimeout); clearInterval(tick) }
  }, [active, ready, run, thumb])

  // the camera, in pixels of this screen
  const sw = screen.current?.clientWidth ?? 1000, sh = screen.current?.clientHeight ?? 700
  const { fx, fy, s, ox } = v.cam
  const cam = `translate(${(0.5 - fx) * sw * s + ox * sw}px, ${(0.5 - fy) * sh * s}px) scale(${s})`
  const P = v.call && PILLAR[v.call.p]
  return (
    <div className={`dfilm ${v.pad ? 'is-pad' : ''} ${v.call && !v.call.wide ? 'has-call' : ''} ${v.close ? `is-close is-c${v.close}` : ''}`}>
      <div className="dfilm-cam" style={{ transform: cam, '--s': s }}>
        <div className="ipad dfilm-pad">
          <div className="ipad-screen" ref={screen}>
            {!thumb && <iframe ref={frame} title="Mila's Sky bedside display, in the demo" src="./prototype/index.html?embed=1&chapter=born" onLoad={() => setTimeout(() => setReady(true), 400)} />}
            {thumb && <div className="ipad-thumb"><StarGlyph size={44} color="#F3E3B5" /><span>Demo</span></div>}
            <div className={`dfilm-spot ${v.spot ? 'is-on' : ''}`} style={v.spot ? { left: `${v.spot.x * 100}%`, top: `${v.spot.y * 100}%`, width: `${v.spot.w * 100}%`, height: `${v.spot.h * 100}%` } : undefined} />
            {v.touch && <span className={`dfilm-touch is-${v.touch.s}`} style={{ left: `${v.touch.x * 100}%`, top: `${v.touch.y * 100}%` }} />}
          </div>
          <i className="ipad-cam" aria-hidden="true" />
        </div>
      </div>

      {P && (
        <div key={v.call.title} className={`dfilm-call ${v.call.wide ? 'is-wide' : ''}`}>
          <span className="dfilm-call-k" style={{ color: P.color }}><i style={{ background: P.color }} />{P.name}</span>
          <b>{v.call.title}</b>
          <span className="dfilm-call-line">{v.call.line}</span>
        </div>
      )}

      {v.scene && <div key={v.scene} className="dfilm-scene"><Scene kind={v.scene} /></div>}
      {v.cap && <p key={String(v.cap)} className="dfilm-cap">{v.cap}</p>}

      <div className="dfilm-close" aria-hidden={!v.close}>
        {/* her days, as a sky: one small star each, scattered (a fixed pseudo-random spread), lighting one after another */}
        <div className="dfilm-field">{FIELD.map((f, k) => <i key={k} style={{ '--k': k, left: `${f[0]}%`, top: `${f[1]}%`, '--z': f[2], '--tw': `${f[3]}s` }} />)}</div>
        <p className="dfilm-c1">Every day becomes a star.</p>
        <p className="dfilm-c2">Every star is <mark className="is-cream">hers to keep</mark>.</p>
        <div className="dfilm-c3"><StarGlyph size={46} color="#FFF8E6" /><span>Mila&apos;s Sky</span></div>
      </div>

      <div className="dfilm-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (v.t / 160) * 100)}%` }} /></div>
      {v.done && <button type="button" className="film-replay dfilm-replay" onClick={() => { setV((x) => ({ ...x, t: 0 })); setRun((r) => r + 1) }}>Replay</button>}
    </div>
  )
}
