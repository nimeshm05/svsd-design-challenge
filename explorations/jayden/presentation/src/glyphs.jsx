// DS1's soft four-point star, as on the bedside screen
export function StarGlyph({ size = 22, color = 'currentColor', className = '' }) {
  return (
    <svg className={`glyph ${className}`} viewBox="-12 -12 24 24" width={size} height={size} aria-hidden="true">
      <path d="M0 -11Q1.6 -1.6 11 0Q1.6 1.6 0 11Q-1.6 1.6 -11 0Q-1.6 -1.6 0 -11Z" fill={color} />
    </svg>
  )
}

// Symbols for the people at the bedside and for the three pillars, in DS1's line: soft cream strokes,
// rounded ends, and a small four-point star as the accent, like everything else in Mila's Sky.
const star = (x, y, r) => `M${x} ${y - r}Q${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y}Q${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}Q${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y}Q${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z`
const ICONS = {
  // a swaddled baby, head on the left, a star by her
  baby: (a) => <>
    <circle cx="16" cy="21" r="6.2" />
    <path d="M21 17 C30 15 39 21 39 29 C39 36 31 40 23 39 C16 38 12 33 13 28" />
    <path d="M20 27 C25 27 31 30 34 35" />
    <path d={star(38, 10, 4.5)} fill={a} stroke="none" />
  </>,
  // a nurse: cap with a small cross, head, shoulders
  nurse: (a) => <>
    <path d="M16.5 12 L18 7.5 L30 7.5 L31.5 12 Z" />
    <path d="M24 8.6 V11 M22.8 9.8 H25.2" stroke={a} />
    <circle cx="24" cy="18.5" r="6.2" />
    <path d="M11 41 C11 32 17 27.5 24 27.5 C31 27.5 37 32 37 41" />
  </>,
  // a parent: head, shoulders, a star held at the heart
  parent: (a) => <>
    <circle cx="24" cy="16" r="6.4" />
    <path d="M11 41 C11 31.5 17 26 24 26 C31 26 37 31.5 37 41" />
    <path d={star(24, 34, 4.2)} fill={a} stroke="none" />
  </>,
  // privacy: a soft lock
  privacy: (a) => <>
    <rect x="13" y="21" width="22" height="18" rx="4" />
    <path d="M17.5 21 V16 C17.5 8 30.5 8 30.5 16 V21" />
    <path d={star(24, 30, 3.4)} fill={a} stroke="none" />
  </>,
  // connection: a heart, with a star inside
  connection: (a) => <>
    <path d="M24 39 C10 30 8.5 20.5 13.5 16.2 C17.5 12.8 22 14.6 24 18 C26 14.6 30.5 12.8 34.5 16.2 C39.5 20.5 38 30 24 39 Z" />
    <path d={star(24, 25, 4.2)} fill={a} stroke="none" />
  </>,
  // comprehension: an open book, a star rising from it
  comprehension: (a) => <>
    <path d="M7 17 C13 15 19.5 15.8 24 19 C28.5 15.8 35 15 41 17 V37 C35 35.2 28.5 36 24 39 C19.5 36 13 35.2 7 37 Z" />
    <path d="M24 19 V39" />
    <path d={star(24, 9, 4.2)} fill={a} stroke="none" />
  </>,
  // awareness: a clock face, a star at its edge
  awareness: (a) => <>
    <circle cx="23" cy="26" r="13" />
    <path d="M23 26 V18 M23 26 L29 29.5" />
    <path d={star(37.5, 11, 4.4)} fill={a} stroke="none" />
  </>,
}
export function Icon({ name, size = 32, color = 'var(--cream)', accent, className = '' }) {
  return (
    <svg className={`icon icon-${name} ${className}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true"
      fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name](accent ?? (['connection', 'comprehension', 'awareness'].includes(name) ? color : 'var(--warm)'))}
    </svg>
  )
}
