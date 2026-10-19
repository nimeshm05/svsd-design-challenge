// One icon set for every navigation control: an 18px box, 1.6 stroke, round caps, currentColor.
// Real SVGs instead of text glyphs (‹ › ☎ ✦ i), which sit on the text baseline and never centre.
const base = { className: 'nav-ic', viewBox: '0 0 24 24', 'aria-hidden': true }

export function ChevronLeft() {
  return <svg {...base}><path d="M14.5 6.5 9 12l5.5 5.5" /></svg>
}

export function ChevronRight() {
  return <svg {...base}><path d="M9.5 6.5 15 12l-5.5 5.5" /></svg>
}

export function PhoneIcon() {
  return (
    <svg {...base}>
      <path d="M8.2 4.5H6.6c-.9 0-1.7.8-1.6 1.7.6 6.6 5.9 11.9 12.5 12.5.9.1 1.7-.7 1.7-1.6v-1.6c0-.6-.4-1.1-1-1.3l-2.3-.7c-.5-.2-1 0-1.4.4l-.9 1c-2-1-3.6-2.6-4.6-4.6l1-.9c.4-.4.5-.9.4-1.4l-.7-2.3c-.2-.6-.7-1-1.3-1z" />
    </svg>
  )
}

export function SparkleIcon() {
  return <svg {...base}><path d="M12 4.5l1.7 5.8 5.8 1.7-5.8 1.7L12 19.5l-1.7-5.8L4.5 12l5.8-1.7z" /></svg>
}

export function InfoIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  )
}

export function CenterIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5V6M12 18v2.5M3.5 12H6M18 12h2.5" />
    </svg>
  )
}

/** The one "back / up" control: always top-left, always "‹ where you're going". */
export function NavBack({ label, onClick, btnRef, className = '' }) {
  return (
    <button ref={btnRef} type="button" className={`nav-btn is-back ${className}`} onClick={onClick}>
      <ChevronLeft />
      <span>{label}</span>
    </button>
  )
}
