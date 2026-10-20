import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './deck.css'
import { Deck } from './Deck.jsx'
import { Panel } from './Panel.jsx'

// ?panel=1 is the story overview (its own window); otherwise the deck
const panel = new URLSearchParams(window.location.search).get('panel') === '1'
createRoot(document.getElementById('root')).render(<StrictMode>{panel ? <Panel /> : <Deck />}</StrictMode>)
