import { useState } from 'react'
import { CurrentView } from './current/CurrentView.jsx'
import { SkyApp } from './SkyApp.jsx'

// Opens on the bedside current view (today, still forming). ?view=sky opens Sara's sky of past days.
export default function App() {
  const [view, setView] = useState(() => (new URLSearchParams(window.location.search).get('view') === 'sky' ? 'sky' : 'now'))
  return view === 'sky' ? <SkyApp onBack={() => setView('now')} /> : <CurrentView onSky={() => setView('sky')} />
}
