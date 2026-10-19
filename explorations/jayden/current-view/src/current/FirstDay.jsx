import { HerModel } from './HerModel.jsx'

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

export function FirstDay({ stage, theme, walk, setWalk }) {
  // the nurse-led walkthrough: one thing on her lit at a time, a plain sentence, then "Next"
  if (walk != null) {
    const done = walk >= FIRST.on.length
    const item = FIRST.on[Math.min(walk, FIRST.on.length - 1)]
    return (
      <div className="fd fd-walk">
        <div className="fd-model">
          <HerModel present={FIRST.on.map((o) => o.id)} changed={done ? [] : [item.id]}
            label={done ? 'Mila, with everything on her right now.' : `Mila, with her ${item.name.toLowerCase()} lit.`} />
        </div>
        {done ? (
          <div className="fd-words">
            <p className="fd-title">That&apos;s everything on her right now.</p>
            <p className="fd-line">You can talk to her. When her nurse says it&apos;s okay, you can touch her through the portholes.</p>
          </div>
        ) : (
          <div className="fd-words">
            <p className="fd-title">{item.name}</p>
            <p className="fd-line">{item.means}</p>
          </div>
        )}
        <div className="fd-walk-nav">
          <span className="fd-dots" aria-label={done ? 'Done' : `${walk + 1} of ${FIRST.on.length}`}>
            {FIRST.on.map((o, i) => <i key={o.id} className={i === walk || (done && i === FIRST.on.length - 1) ? 'is-on' : i < walk ? 'is-past' : ''} />)}
          </span>
          {done
            ? <button type="button" className="fd-next is-done" onClick={() => setWalk(null)}>Done</button>
            : <button type="button" className="fd-next" onClick={() => setWalk(walk + 1)}>Next</button>}
        </div>
      </div>
    )
  }

  return (
    <div className="fd">
      <FirstStar theme={theme} big />
      {stage === 'arrival' ? (
        <>
          {/* two quiet groups with room between them: who she is, then how small she is */}
          <div className="fd-group">
            <p className="fd-name">Mila</p>
            <p className="fd-born">Born today at {FIRST.born}</p>
          </div>
          <div className="fd-group fd-size">
            <span><b>{FIRST.grams} grams</b>, {FIRST.feel}.</span>
            <em>Her star is as big as she is.</em>
          </div>
        </>
      ) : (
        <>
          <p className="fd-title is-serif">Every day becomes a star.</p>
          <p className="fd-line">Tonight, her first one.</p>
        </>
      )}
    </div>
  )
}
