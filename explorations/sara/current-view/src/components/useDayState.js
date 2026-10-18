import { useRef, useState } from 'react'
import { eventGroups, eventLabels, inGroup } from '../data/days.js'

// UI state shared by the desktop modal and the phone sheet:
// which device is highlighted, the event filter, and the "More detail" sections.
export function useDayState(day) {
  const [device, setDevice] = useState('feeding')
  const [filter, setFilter] = useState('all')
  const [acc, setAcc] = useState({ team: false, log: false, meds: false, notes: false })
  const refs = { team: useRef(null), log: useRef(null), meds: useRef(null), notes: useRef(null) }

  const toggle = (key) => setAcc((a) => ({ ...a, [key]: !a[key] }))

  // Open one section and bring it into view
  const openOnly = (key) => {
    setAcc((a) => ({ ...a, [key]: true }))
    requestAnimationFrame(() => refs[key].current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const chips = eventGroups.map((g) => ({
    ...g,
    count: day.events.filter((e) => inGroup(e, g.id)).length,
    selected: filter === g.id,
  }))

  const shown = day.events
    .filter((e) => inGroup(e, filter))
    .map((e) => ({ ...e, label: eventLabels[e.cat] }))

  return { device, setDevice, filter, setFilter, chips, shown, acc, toggle, openOnly, refs }
}
