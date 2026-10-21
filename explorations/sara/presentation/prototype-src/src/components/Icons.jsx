const STAR_PATH = 'M10 1.5l2.4 5.6 6.1.6-4.6 4 1.4 6-5.3-3.2-5.3 3.2 1.4-6-4.6-4 6.1-.6z'

export function StarIcon({ size = 20, fill = '#FFFFFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d={STAR_PATH} fill={fill} />
    </svg>
  )
}

export function PlanetIcon({ size = 34, outline = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" style={{ flex: 'none' }}>
      {outline
        ? <circle cx="10" cy="10" r="5.2" fill="none" stroke="var(--text)" strokeWidth="1.3" />
        : <circle cx="10" cy="10" r="5.2" fill="#FFFFFF" />}
      <ellipse cx="10" cy="10" rx="9.2" ry={3} fill="none" stroke="var(--gold)" strokeWidth={outline ? 1.3 : 1.4} transform="rotate(-20 10 10)" />
    </svg>
  )
}

// Outlined star used in the modal / sheet header
export function StarOutlineIcon({ size = 30, strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="var(--text)" strokeWidth={strokeWidth} aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M20 4l4.5 10.5L36 16l-8.5 7.5L30 35l-10-6-10 6 2.5-11.5L4 16l11.5-1.5z" />
    </svg>
  )
}

export function DayIcon({ kind, size }) {
  return kind === 'planet' ? <PlanetIcon size={size + 4} outline /> : <StarOutlineIcon size={size} />
}

export function MarkerIcon({ kind, size }) {
  return kind === 'planet' ? <PlanetIcon size={size} /> : <StarIcon size={size} />
}

export function ConstellationIcon({ width = 16, height = 11 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 18 12" fill="none" stroke="var(--text-2)" strokeWidth="1.4" aria-hidden="true">
      <circle cx="2" cy="10" r="1.6" /><circle cx="9" cy="2" r="1.6" /><circle cx="16" cy="8" r="1.6" />
      <path d="M3.2 9L8 3.2M10.3 3L14.8 7" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ink)" strokeWidth="2" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="var(--text)" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5z" />
    </svg>
  )
}

// Large illustration at the left of the milestone hero
export function PlanetHeroArt({ width = 150, height = 120 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 150 120" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="75" cy="60" r="44" fill="#F2C46D" fillOpacity="0.08" />
      <circle cx="75" cy="60" r="30" fill="#2A2418" stroke="#F2C46D" strokeWidth="1.6" />
      <path d="M51 52 C 63 46, 87 46, 99 52 M48 62 C 62 57, 88 57, 102 62 M53 72 C 64 68, 86 68, 97 72" fill="none" stroke="#F2C46D" strokeOpacity="0.45" strokeWidth="1" />
      <ellipse cx="75" cy="60" rx="62" ry="17" fill="none" stroke="#F2C46D" strokeWidth="2" transform="rotate(-18 75 60)" />
      <path d="M18 18l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z M128 14l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z M134 96l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z M14 98l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#FFFFFF" fillOpacity="0.85" />
    </svg>
  )
}
