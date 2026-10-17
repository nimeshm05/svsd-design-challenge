import { useEffect, useState } from 'react'
import { FIRST_DAY, LAST_DAY, days } from './data/days.js'
import { DesktopView } from './desktop/DesktopView.jsx'
import { MobileView } from './mobile/MobileView.jsx'

const PHONE_QUERY = '(max-width: 700px)'

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY)
    const onChange = () => setIsPhone(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isPhone
}

export default function App() {
  const isPhone = useIsPhone()
  // ?day=24 opens straight to that day (handy for reviews and links)
  const [dayNum, setDayNum] = useState(() => {
    const n = Number(new URLSearchParams(window.location.search).get('day'))
    return days[n] ? n : FIRST_DAY
  })
  const [open, setOpen] = useState(true)

  const goTo = (n) => {
    if (n >= FIRST_DAY && n <= LAST_DAY) setDayNum(n)
  }

  // Escape closes the open day
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const View = isPhone ? MobileView : DesktopView
  return <View day={days[dayNum]} open={open} setOpen={setOpen} goTo={goTo} />
}
