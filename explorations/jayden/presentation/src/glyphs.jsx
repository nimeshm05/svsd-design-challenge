// DS1's soft four-point star, as on the bedside screen
export function StarGlyph({ size = 22, color = 'currentColor', className = '' }) {
  return (
    <svg className={`glyph ${className}`} viewBox="-12 -12 24 24" width={size} height={size} aria-hidden="true">
      <path d="M0 -11Q1.6 -1.6 11 0Q1.6 1.6 0 11Q-1.6 1.6 -11 0Q-1.6 -1.6 0 -11Z" fill={color} />
    </svg>
  )
}
