// One icon set for every navigation control. Each viewBox is cropped tight to its drawing, so:
// - every icon renders at the same optical height (CSS sets the height, width follows), and
// - the gap to the label is a true ink-to-text gap, the same on every button.
// Strokes don't scale with the viewBox (vector-effect), so every icon has the same 1.5px line.
const svg = (viewBox, cls = '') => ({ className: `nav-ic ${cls}`, viewBox, 'aria-hidden': true })

export function ChevronLeft() {
  return <svg {...svg('-1 -1 8 14', 'is-chev is-left')}><path d="M6 0 0 6l6 6" /></svg>
}

export function ChevronRight() {
  return <svg {...svg('-1 -1 8 14', 'is-chev is-right')}><path d="M0 0l6 6-6 6" /></svg>
}

export function CloseIcon() {
  return <svg {...svg('-1 -1 12 12', 'is-x')}><path d="M0 0l10 10M10 0 0 10" /></svg>
}

export function PhoneIcon() {
  return (
    <svg {...svg('4 3.6 16 16')}>
      <path d="M8.2 4.5H6.6c-.9 0-1.7.8-1.6 1.7.6 6.6 5.9 11.9 12.5 12.5.9.1 1.7-.7 1.7-1.6v-1.6c0-.6-.4-1.1-1-1.3l-2.3-.7c-.5-.2-1 0-1.4.4l-.9 1c-2-1-3.6-2.6-4.6-4.6l1-.9c.4-.4.5-.9.4-1.4l-.7-2.3c-.2-.6-.7-1-1.3-1z" />
    </svg>
  )
}

export function SparkleIcon() {
  return <svg {...svg('4 4 16 16')}><path d="M12 4.5l1.7 5.8 5.8 1.7-5.8 1.7L12 19.5l-1.7-5.8L4.5 12l5.8-1.7z" /></svg>
}

export function InfoIcon() {
  return (
    <svg {...svg('3.2 3.2 17.6 17.6')}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  )
}

export function CenterIcon() {
  return (
    <svg {...svg('2.8 2.8 18.4 18.4')}>
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
