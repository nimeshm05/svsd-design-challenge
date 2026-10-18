import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import './scroll-area.css'

const MIN_THUMB = 36
const TRACK_GAP = 8 // space above and below the track

// A scroll container with the native scrollbar hidden and a themed one drawn on top.
// The track starts below a child marked data-scroll-header (the sticky header).
// Wheel, touch and keyboard scrolling are untouched; the thumb can also be dragged
// and the track clicked.
export function ScrollArea({ className = '', children, ...rest }) {
  const scrollRef = useRef(null)
  const drag = useRef(null)
  const [m, setM] = useState({ show: false, top: 0, trackH: 0, thumbH: 0, thumbY: 0, atEnd: true })
  const [dragging, setDragging] = useState(false)

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const header = el.querySelector('[data-scroll-header]')
    const top = (header?.offsetHeight ?? 0) + TRACK_GAP
    const trackH = Math.max(0, el.clientHeight - top - TRACK_GAP)
    const max = el.scrollHeight - el.clientHeight
    if (max <= 1 || trackH <= MIN_THUMB) {
      setM((p) => (p.show ? { ...p, show: false, atEnd: true } : p))
      return
    }
    const visible = (el.clientHeight - top) / (el.scrollHeight - top)
    const thumbH = Math.max(MIN_THUMB, Math.round(trackH * visible))
    const thumbY = Math.round((el.scrollTop / max) * (trackH - thumbH))
    setM({ show: true, top, trackH, thumbH, thumbY, atEnd: el.scrollTop >= max - 2 })
  }, [])

  useLayoutEffect(() => {
    const el = scrollRef.current
    measure()
    // Re-measure when the window resizes or content grows (e.g. a section opens)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    Array.from(el.children).forEach((c) => ro.observe(c))
    return () => ro.disconnect()
  }, [measure])

  const scrollPerPx = () => {
    const el = scrollRef.current
    return (el.scrollHeight - el.clientHeight) / Math.max(1, m.trackH - m.thumbH)
  }

  const onThumbDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { y: e.clientY, scrollTop: scrollRef.current.scrollTop, ratio: scrollPerPx() }
    setDragging(true)
  }
  const onThumbMove = (e) => {
    if (!drag.current) return
    scrollRef.current.scrollTop = drag.current.scrollTop + (e.clientY - drag.current.y) * drag.current.ratio
  }
  const onThumbUp = () => {
    drag.current = null
    setDragging(false)
  }

  // Clicking the track jumps so the thumb centres on the click
  const onTrackDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top - m.thumbH / 2
    scrollRef.current.scrollTo({ top: y * scrollPerPx(), behavior: 'smooth' })
  }

  return (
    <div className={`scroll-area ${className}`} {...rest}>
      <div ref={scrollRef} className="scroll-area-viewport" onScroll={measure}>
        {children}
      </div>
      {m.show && (
        <>
          <div aria-hidden="true" className={`scroll-fade ${m.atEnd ? 'is-hidden' : ''}`} />
          <div aria-hidden="true" className={`scroll-track ${dragging ? 'is-dragging' : ''}`}
            style={{ top: m.top, height: m.trackH }} onPointerDown={onTrackDown}>
            <div className="scroll-thumb" style={{ height: m.thumbH, transform: `translateY(${m.thumbY}px)` }}
              onPointerDown={onThumbDown} onPointerMove={onThumbMove} onPointerUp={onThumbUp} onPointerCancel={onThumbUp} />
          </div>
        </>
      )}
    </div>
  )
}
