import { useId } from 'react'

// The glossary's illustration: one flat, front-on baby silhouette, no face or skin tone, so any parent can see
// their own baby in it. Only the equipment the term names is drawn on her, placed where it really sits.
// Drawn for the dark sheet: a solid, quiet shape, no bright fills, nothing that reads as alarming.
const BODY = '#46525E'
const TUBE = '#CFE3EC'
const TUBE_RIB = '#8FB3C6'
const TAPE = '#F6EEDB'
const WIRE = '#9AA7B2'
const INSIDE = '#F6EEDB' // a line's path under the skin, drawn dashed

// Each scene: alt text, an optional bed around her, and the equipment on top.
const SCENES = {
  'nasal-cannula': {
    alt: 'A baby with a nasal cannula: two soft prongs just inside her nostrils, the thin tubing taped to her cheeks and running over her ears.',
    gear: () => (
      <g>
        <path d="M193 82 C180 86 166 84 160 72 C152 56 120 44 0 50" stroke={TUBE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M207 82 C220 86 234 84 240 72 C248 56 280 44 400 50" stroke={TUBE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <rect x="191" y="79.5" width="18" height="4.5" rx="2.2" fill={TUBE} />
        <rect x="195.5" y="75.5" width="3" height="5" rx="1.5" fill={TUBE} />
        <rect x="201.5" y="75.5" width="3" height="5" rx="1.5" fill={TUBE} />
        <rect x="166" y="78" width="14" height="10" rx="3" fill={TAPE} opacity=".9" transform="rotate(-15 173 83)" />
        <rect x="220" y="78" width="14" height="10" rx="3" fill={TAPE} opacity=".9" transform="rotate(15 227 83)" />
      </g>
    ),
  },
  cpap: {
    alt: 'A baby on CPAP: a small soft mask over her nose, held by a snug bonnet, with two ribbed tubes running up to the top of her head.',
    gear: () => (
      <g>
        <path d="M156 60 C152 -2 248 -2 244 60 C228 50 172 50 156 60 Z" fill="#7E9BB3" />
        <Ribbed d="M190 84 C170 88 160 76 162 58 C164 44 170 30 176 0" />
        <Ribbed d="M210 84 C230 88 240 76 238 58 C236 44 230 30 224 0" />
        <rect x="157" y="52" width="12" height="8" rx="2" fill={TAPE} opacity=".85" />
        <rect x="231" y="52" width="12" height="8" rx="2" fill={TAPE} opacity=".85" />
        <path d="M200 68 C206 68 212 80 213 86 C208 90 192 90 187 86 C188 80 194 68 200 68 Z" fill={TUBE} fillOpacity=".45" stroke={TUBE} strokeWidth="1.5" />
      </g>
    ),
  },
  ventilator: {
    alt: 'A baby on a ventilator: a soft breathing tube goes through her mouth into her windpipe, held with tape, and joins a ribbed tube to the machine.',
    gear: () => (
      <g>
        <path d="M200 92 L200 124" stroke={INSIDE} strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
        <Ribbed d="M178 96 C150 94 140 80 120 70 C100 60 60 64 0 70" />
        <path d="M200 90 C200 96 190 98 176 96" stroke={TUBE} strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="186" y="86" width="28" height="7" rx="3" fill={TAPE} opacity=".9" />
      </g>
    ),
  },
  'feeding-tube': {
    alt: 'A baby with a feeding tube: a thin tube goes in through her nose and down to her tummy, taped to her cheek, with a small cap at the end.',
    gear: () => (
      <g>
        <path d="M203 80 C206 92 205 104 204 120 C204 140 214 156 218 172" stroke={INSIDE} strokeWidth="2" strokeDasharray="3 3" fill="none" />
        <path d="M203 79 C210 84 222 86 232 82 C252 76 280 84 300 100 L316 110" stroke="#EBD9A0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="218" y="78" width="14" height="10" rx="3" fill={TAPE} opacity=".9" transform="rotate(10 225 83)" />
        <rect x="312" y="104" width="16" height="10" rx="3" fill="#C9B6E4" transform="rotate(32 320 109)" />
      </g>
    ),
  },
  incubator: {
    alt: 'A baby lying in an incubator, seen from above: a clear covered bed with round hand-holes in its sides, warm air around her.',
    bed: 'incubator',
    gear: () => null,
  },
  'open-crib': {
    alt: 'A baby in an open crib, seen from above, wrapped in a blanket from her chest down.',
    bed: 'crib',
    gear: () => (
      <g>
        <path d="M146 150 Q200 138 254 150 L262 282 Q200 298 138 282 Z" fill="#8FA9C4" />
        <path d="M150 162 Q200 150 250 162" stroke="#B3C7DA" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M170 200 Q200 214 230 200" stroke="#7A93AD" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  'pulse-ox': {
    alt: 'A baby with a pulse oximeter: a soft wrap on her foot with a small red light, its cable running to the monitor.',
    gear: () => (
      <g>
        <path d="M244 284 C280 288 320 272 400 278" stroke={WIRE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="224" y="274" width="22" height="16" rx="5" fill="#E8EEF2" transform="rotate(-10 235 282)" />
        <RedLight x={235} y={282} />
      </g>
    ),
  },
  'spot-check': {
    alt: 'A baby having her oxygen spot-checked: the soft wrap and its small red light on her hand, just for a moment.',
    gear: () => (
      <g>
        <path d="M104 112 C80 100 60 110 0 104" stroke={WIRE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="102" y="106" width="22" height="15" rx="5" fill="#E8EEF2" transform="rotate(-20 113 113)" />
        <RedLight x={113} y={113} />
      </g>
    ),
  },
  'iv-line': {
    alt: 'A baby with an IV line: a tiny tube in a vein on the back of her hand under a clear dressing, its line running away to the side.',
    gear: () => (
      <g>
        <path d="M108 111 C90 112 70 130 40 128 L0 124" stroke={TUBE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="108" y="108.5" width="10" height="5" rx="2" fill="#F2C46D" />
        <rect x="100" y="101" width="26" height="22" rx="5" fill={TUBE} fillOpacity=".3" stroke={TUBE} strokeOpacity=".7" />
      </g>
    ),
  },
  'central-line': {
    alt: 'A baby with a central line: a thin tube goes in at her arm under a clear dressing and travels inside, up her arm, to a large vein near her heart.',
    gear: () => (
      <g>
        <path d="M268 150 L246 128 C236 120 224 124 214 134 L208 140" stroke={INSIDE} strokeWidth="2" strokeDasharray="3 3" fill="none" />
        <path d="M276 152 C300 160 330 150 400 158" stroke={TUBE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="306" cy="156" r="4" fill="#F2C46D" />
        <rect x="262" y="142" width="22" height="18" rx="4" fill={TUBE} fillOpacity=".3" stroke={TUBE} strokeOpacity=".7" />
      </g>
    ),
  },
  'eye-exam': {
    alt: 'A baby having an eye exam: a soft light and a small round lens held just above her eye.',
    gear: (id) => (
      <g>
        <defs>
          <linearGradient id={`${id}-beam`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3E3B5" stopOpacity=".05" />
            <stop offset="1" stopColor="#F3E3B5" stopOpacity=".35" />
          </linearGradient>
        </defs>
        <path d="M300 0 L346 0 L222 68 L206 58 Z" fill={`url(#${id}-beam)`} />
        <circle cx="214" cy="63" r="13" fill={TUBE} fillOpacity=".12" stroke={TUBE} strokeWidth="2.5" />
      </g>
    ),
  },
  'hearing-screen': {
    alt: 'A baby having a hearing screen: small soft earcups over her ears and little sensors on her forehead and shoulder, with fine wires.',
    gear: () => (
      <g stroke={WIRE} strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M156 54 C160 10 260 6 400 20" />
        <path d="M200 30 C240 20 300 20 400 32" />
        <path d="M241 66 C280 60 320 50 400 54" />
        <path d="M246 120 C300 110 340 100 400 106" />
        <g stroke={TUBE} strokeWidth="1.5">
          <ellipse cx="159" cy="66" rx="10" ry="13" fill="#9FC6D8" fillOpacity=".85" />
          <ellipse cx="241" cy="66" rx="10" ry="13" fill="#9FC6D8" fillOpacity=".85" />
        </g>
        <g fill="#E8EEF2" stroke={WIRE}>
          <circle cx="200" cy="30" r="5" />
          <circle cx="246" cy="120" r="5" />
        </g>
      </g>
    ),
  },
}

export function GlossaryBaby({ scene }) {
  const id = useId().replace(/:/g, '')
  const s = SCENES[scene]
  if (!s) return null
  const baby = <Baby>{s.gear(id)}</Baby>
  return (
    <svg className="gl-baby" viewBox="0 0 400 300" role="img" aria-label={s.alt}>
      <defs>
        <clipPath id={`${id}-frame`}><rect x="1" y="1" width="398" height="298" rx="14" /></clipPath>
      </defs>
      <rect x="1" y="1" width="398" height="298" rx="14" fill="#F3E3B5" fillOpacity=".04" />
      {/* tubes and wires run off to their machines, so keep them inside the frame */}
      <g clipPath={`url(#${id}-frame)`}>{s.bed ? <Bed kind={s.bed} id={id}>{baby}</Bed> : baby}</g>
      <rect x="1" y="1" width="398" height="298" rx="14" fill="none" stroke="#F3E3B5" strokeOpacity=".18" />
    </svg>
  )
}

// Seen from above, so she's drawn smaller inside it
function Bed({ kind, id, children }) {
  const small = <g transform="translate(200 150) scale(.72) translate(-200 -155)">{children}</g>
  if (kind === 'crib') {
    return (
      <g>
        <rect x="104" y="36" width="192" height="228" rx="12" fill="#25303B" />
        <rect x="100" y="32" width="200" height="236" rx="14" fill="none" stroke="#B8A88A" strokeWidth="6" />
        {small}
      </g>
    )
  }
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-warm`}>
          <stop offset="0" stopColor="#F3C9A0" stopOpacity=".22" />
          <stop offset="1" stopColor="#F3C9A0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="104" y="42" width="192" height="216" rx="14" fill="#25303B" />
      {small}
      <rect x="92" y="30" width="216" height="240" rx="26" fill={`url(#${id}-warm)`} />
      <rect x="92" y="30" width="216" height="240" rx="26" fill={TUBE} fillOpacity=".07" stroke={TUBE} strokeOpacity=".55" strokeWidth="2" />
      <path d="M120 48 L150 48 M112 60 L124 60" stroke={TUBE} strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
      {[110, 190].map((y) => (
        <g key={y}>
          <ellipse cx="92" cy={y} rx="8" ry="18" fill="#25303B" stroke={TUBE} strokeOpacity=".7" strokeWidth="2.5" />
          <ellipse cx="308" cy={y} rx="8" ry="18" fill="#25303B" stroke={TUBE} strokeOpacity=".7" strokeWidth="2.5" />
        </g>
      ))}
    </g>
  )
}

function Baby({ children }) {
  return (
    <g>
      <g stroke={BODY} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M160 124 L126 156 L114 124" strokeWidth="20" />
        <path d="M240 124 L274 156 L286 124" strokeWidth="20" />
        <path d="M180 214 Q164 252 170 274" strokeWidth="32" />
        <path d="M220 214 Q236 252 230 274" strokeWidth="32" />
      </g>
      <g fill={BODY}>
        <circle cx="113" cy="114" r="11" />
        <circle cx="287" cy="114" r="11" />
        <ellipse cx="164" cy="284" rx="12" ry="8" />
        <ellipse cx="236" cy="284" rx="12" ry="8" />
        <path d="M164 110 Q200 104 236 110 Q252 116 254 134 L252 200 Q252 228 230 236 L170 236 Q148 228 148 200 L146 134 Q148 116 164 110 Z" />
        <rect x="185" y="96" width="30" height="18" />
        <ellipse cx="159" cy="66" rx="7" ry="10" />
        <ellipse cx="241" cy="66" rx="7" ry="10" />
        <ellipse cx="200" cy="62" rx="40" ry="44" />
      </g>
      {children}
    </g>
  )
}

function Ribbed({ d }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={TUBE} strokeWidth="7" />
      <path d={d} stroke={TUBE_RIB} strokeWidth="7" strokeDasharray="1.5 2.5" strokeLinecap="butt" />
    </g>
  )
}

function RedLight({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="8" fill="#FF6B6B" opacity=".25" />
      <circle cx={x} cy={y} r="3" fill="#FF6B6B" />
    </g>
  )
}
