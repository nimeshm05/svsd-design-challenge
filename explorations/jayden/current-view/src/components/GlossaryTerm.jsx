import { CloseButton } from '../current/NavIcons.jsx'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { glossary } from '../data/glossary.js'

// A medical term a parent can tap to see what it means. Terms without a glossary body render as plain text.
// The explanation opens in the app's sheet (cv-scrim + cv-sheet), portaled to the page so an animated
// parent can't trap its fixed position. Esc, the Close button or a tap outside closes it; focus returns to the term.
export function GlossaryTerm({ term, children }) {
  const entry = glossary[term]
  const [open, setOpen] = useState(false)
  const btn = useRef(null)
  if (!entry?.body) return children ?? term
  const close = () => { setOpen(false); btn.current?.focus() }
  return (
    <>
      <button ref={btn} type="button" className="gl-term" aria-haspopup="dialog" aria-expanded={open}
        aria-label={`${term}: what this means`} onClick={() => setOpen(true)}>
        {children ?? term}
      </button>
      {open && <GlossarySheet term={term} entry={entry} onClose={close} />}
    </>
  )
}

function GlossarySheet({ term, entry, onClose }) {
  const id = useId()
  const sheet = useRef(null)
  const closeBtn = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    closeBtn.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current() }
      // keep Tab inside the sheet
      if (e.key === 'Tab') {
        const f = sheet.current?.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
        if (!f?.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  return createPortal(
    <div className="cv-scrim gl-scrim" onClick={onClose}>
      <div ref={sheet} className="cv-sheet gl-sheet" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}
        onClick={(e) => e.stopPropagation()}>
        <div className="cv-sheet-head">
          <h3>What this means</h3>
          <CloseButton btnRef={closeBtn} onClick={onClose} />
        </div>
        <p id={`${id}-t`} className="gl-title">{term}</p>
        {entry.stands && <p className="gl-stands">{entry.stands}</p>}
        <p className="gl-body">{entry.body}</p>
        {entry.image && (
          <figure className="gl-fig">
            <img src={entry.image} alt={`Illustration: ${term}`} />
          </figure>
        )}
        <span className="ah-review gl-review">Placeholder content · for care-team review</span>
      </div>
    </div>,
    document.querySelector('.cv-page') ?? document.body,
  )
}
