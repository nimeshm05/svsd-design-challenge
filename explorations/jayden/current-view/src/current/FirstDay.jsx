import { useLayoutEffect, useRef, useState } from 'react'
import { BabyFront } from './BabyFront.jsx'
import { ChevronRight } from './NavIcons.jsx'

// Her first day on the bedside screen: how her story begins.
// Parents first stand here in shock, often hours after she was born. Nothing asks anything of them:
// her first star, her name, how small she is in words you can feel, and who is with her. Then the one
// line that tells her story ("Every day becomes a star"), and "What's on her", which her nurse can open
// while explaining, one thing at a time.
export const FIRST = {
  born: '3:42 a.m.',
  grams: 880,
  feel: 'about the weight of a small pineapple',
  nurse: 'Priya', night: 'Marcus',
  // what's on her on day 1, in the order her nurse would explain it, in plain words
  on: [
    { id: 'vent', name: 'Breathing tube', means: 'A soft tube that helps her breathe while her lungs grow stronger.' },
    { id: 'heart', name: 'Heart stickers', means: 'Three small stickers that count her heartbeat and her breaths.' },
    { id: 'pulse', name: 'Oxygen sensor', means: 'A soft light on her foot that checks the oxygen in her blood.' },
    { id: 'temp', name: 'Temperature probe', means: 'Keeps track of her warmth, so her bed can stay just right.' },
    { id: 'iv', name: 'IV line', means: 'A thin tube that gives her fluids and food for now.' },
    { id: 'feeding', name: 'Feeding tube', means: 'A thin tube to her tummy, for her milk when she is ready.' },
  ],
}

// her first star: it grows with her, so today it is as big as she is
function FirstStar({ theme, big = false }) {
  const c = theme === 'confetti', s = big ? 1 : 0.8
  return (
    <svg className="fd-star" viewBox="-60 -60 120 120" aria-hidden="true" style={{ width: 120 * s, height: 120 * s }}>
      <circle className="fd-star-glow" r="46" fill={c ? '#FFD23F' : '#F3E3B5'} opacity=".1" />
      <circle className="fd-star-glow is-inner" r="24" fill={c ? '#FFD23F' : '#F3E3B5'} opacity=".16" />
      <path d="M0 -20Q2.8 -2.8 20 0Q2.8 2.8 0 20Q-2.8 2.8 -20 0Q-2.8 -2.8 0 -20Z" fill={c ? '#FFD23F' : '#FFF8E6'} />
      <circle r="2.4" fill="#fff" />
    </svg>
  )
}

// One button whose label morphs in place (like "Mila's stars" → "Close"): the old label lifts away,
// the new one rises in, the width eases to fit, and a trailing › slides in or out.
function MorphButton({ label, chevron = false, onClick }) {
  const [shown, setShown] = useState(label)
  const [prev, setPrev] = useState(null)
  const [w, setW] = useState(null)
  const measure = useRef(null)
  useLayoutEffect(() => {
    if (label === shown) return undefined
    setPrev(shown)
    setShown(label)
    const t = setTimeout(() => setPrev(null), 500)
    return () => clearTimeout(t)
  }, [label]) // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { if (measure.current) setW(measure.current.offsetWidth) }, [shown])
  return (
    <button type="button" className={`nav-btn is-primary fd-next mb ${chevron ? 'has-chev' : ''}`} onClick={onClick} aria-label={shown}>
      <span className="mb-label" style={w != null ? { width: w } : undefined} aria-hidden="true">
        <span ref={measure} className="mb-measure">{shown}</span>
        {prev && <span key={`o-${prev}`} className="mb-out">{prev}</span>}
        <span key={`i-${shown}`} className={prev ? 'mb-in' : 'mb-now'}>{shown}</span>
      </span>
      <span className="mb-chev" aria-hidden="true"><ChevronRight /></span>
    </button>
  )
}

export function FirstDay({ stage, theme, walk, setWalk }) {
  // Her first day. On "Her story begins", her nurse opens "What's on her": one thing on her lit at a
  // time, a plain sentence, then "Next". The button stays the same element throughout, so it morphs.
  const walking = walk != null
  const done = walking && walk >= FIRST.on.length
  const item = walking ? FIRST.on[Math.min(walk, FIRST.on.length - 1)] : null
  const label = !walking ? "What\u2019s on her" : done ? 'Done' : 'Next'
  return (
    <div className={`fd ${walking ? 'fd-walk' : ''}`}>
      {walking ? (
        <>
          <div className="fd-model">
            <BabyFront present={FIRST.on.map((o) => o.id)} changed={done ? [] : [item.id]}
              label={done ? 'Mila, with everything on her right now.' : `Mila, with her ${item.name.toLowerCase()} lit.`} />
          </div>
          <div className="fd-words">
            <p className="fd-title">{done ? 'That\u2019s everything on her right now.' : item.name}</p>
            <p className="fd-line">{done ? 'You can talk to her. When her nurse says it\u2019s okay, you can touch her through the portholes.' : item.means}</p>
          </div>
        </>
      ) : (
        <>
          <FirstStar theme={theme} big />
          {stage === 'arrival' ? (
            <>
              <p className="fd-name">Mila</p>
              <p className="fd-line">Born today at {FIRST.born}</p>
              <p className="fd-size"><b>{FIRST.grams} grams</b>, {FIRST.feel}.<span>Her star is as big as she is.</span></p>
              <p className="fd-who">{FIRST.nurse} is with her.</p>
            </>
          ) : (
            <>
              <p className="fd-title is-serif">Every day becomes a star.</p>
              <p className="fd-line">Tonight, her first one.</p>
              <p className="fd-who">{FIRST.nurse} is with her · {FIRST.night} tonight</p>
            </>
          )}
        </>
      )}
      {/* dots above, then the one button, centred under the words */}
      {stage !== 'arrival' && (
        <div className="fd-walk-nav" key="nav">
          <span className={`fd-dots ${walking ? '' : 'is-hidden'}`} aria-label={walking ? (done ? 'Done' : `${walk + 1} of ${FIRST.on.length}`) : undefined} aria-hidden={!walking}>
            {FIRST.on.map((o, i) => <i key={o.id} className={walking && (i === walk || (done && i === FIRST.on.length - 1)) ? 'is-on' : ''} />)}
          </span>
          <MorphButton label={label} chevron={walking && !done}
            onClick={() => (!walking ? setWalk(0) : done ? setWalk(null) : setWalk(walk + 1))} />
        </div>
      )}
    </div>
  )
}
