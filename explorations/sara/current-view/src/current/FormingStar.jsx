// Today is a star still forming. Each moment of the day drifts in and adds light.
// It only ever grows: a hard day still becomes a star. Tonight it joins her sky.
const SKY = [[30, 250], [70, 205], [118, 228], [150, 168], [196, 190], [232, 130]] // earlier days, already stars
const CX = 300
const CY = 160

export function FormingStar({ moments, dim = false }) {
  const glow = Math.min(1, 0.35 + moments * 0.12)
  const r = 26 + glow * 30
  return (
    <svg className={`cv-star ${dim ? 'is-dim' : ''}`} viewBox="0 0 400 320" role="img" aria-label="Today's star, still forming">
      <defs>
        <radialGradient id="cv-neb">
          <stop offset="0" stopColor="#FFF8E6" stopOpacity={glow} />
          <stop offset="0.3" stopColor="#F3E3B5" stopOpacity={glow * 0.6} />
          <stop offset="1" stopColor="#F3E3B5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="cv-past">
        {SKY.slice(1).map(([x, y], i) => <line key={i} x1={SKY[i][0]} y1={SKY[i][1]} x2={x} y2={y} />)}
        {SKY.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === SKY.length - 1 ? 3 : 2.2} />)}
      </g>
      <line className="cv-pending" x1="232" y1="130" x2={CX} y2={CY} />
      <circle className="cv-neb" cx={CX} cy={CY} r={r} fill="url(#cv-neb)" />
      <circle cx={CX} cy={CY} r="3.5" fill="#FFF8E6" />
      {/* Today's moments, slowly orbiting in */}
      <g className="cv-motes" style={{ transformOrigin: `${CX}px ${CY}px` }}>
        {Array.from({ length: moments }, (_, i) => {
          const a = (i / moments) * Math.PI * 2
          const d = r + 14 + (i % 2) * 10
          return <circle key={i} cx={CX + Math.cos(a) * d} cy={CY + Math.sin(a) * d} r="2" />
        })}
      </g>
    </svg>
  )
}
