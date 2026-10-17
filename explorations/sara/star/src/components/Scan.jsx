import { devices, selectedDevice } from '../data/days.js'

// Cross-section slices that give the scan body its volume
function ell(cx, cy, rx, ry) {
  return `M${(cx - rx).toFixed(1)} ${cy}a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(2 * rx).toFixed(1)} 0a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(-2 * rx).toFixed(1)} 0`
}

const bodySlices = (() => {
  const d = []
  let x, h, k
  for (x = 62; x <= 138; x += 6) { h = 40 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 100) / 42, 2))); if (h > 3) d.push(ell(x, 118, h * 0.2, h)) }
  for (k = 1; k <= 2; k++) d.push(ell(100, 118, 42 * k / 3, 40 * k / 3))
  d.push(ell(146, 120, 4, 20)); d.push(ell(151, 120, 4, 22))
  for (x = 152; x <= 262; x += 7) { h = 46 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 206) / 60, 2))); if (h > 3) d.push(ell(x, 122, h * 0.18, h)) }
  for (x = 162; x <= 226; x += 8) { h = x > 214 ? 8 : 10; d.push(ell(x, 64, h * 0.3, h)); d.push(ell(x + 2, 180, h * 0.3, h)) }
  for (x = 266; x <= 332; x += 7) { h = 15 - (x - 266) / 66 * 4; d.push(ell(x, 100, h * 0.3, h)); d.push(ell(x, 144, h * 0.3, h)) }
  d.push(ell(344, 100, 3, 10)); d.push(ell(344, 144, 3, 10))
  return d.join(' ')
})()

export function Scan({ device, height }) {
  const sel = selectedDevice(device)
  const op = (id) => (id === device ? 1 : devices.find((d) => d.id === id).removed ? 0.35 : 0.28)
  const hi = (id) => (id === device ? 1 : 0)

  return (
    <div className="scan" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 440 240" preserveAspectRatio="xMidYMid meet" role="img"
        aria-label={`3D scan of Mila with the ${sel.title} highlighted: ${sel.route}`}>
        <defs>
          <pattern id="scan-dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.6" fill="#1E2A31" /></pattern>
          <linearGradient id="scan-sweep" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#6CB6FF" stopOpacity="0" />
            <stop offset="0.85" stopColor="#6CB6FF" stopOpacity="0.10" />
            <stop offset="1" stopColor="#6CB6FF" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect width="440" height="240" fill="url(#scan-dots)" />

        {/* Mattress plane */}
        <path d="M40 210 L400 210 M60 30 L380 30 M40 210 L60 30 M400 210 L380 30" fill="none" stroke="#22323B" strokeWidth="1" />

        {/* Body: scan slices + silhouette */}
        <g fill="none" stroke="#8FB3C4" strokeLinecap="round">
          <path d={bodySlices} strokeWidth="0.7" strokeOpacity="0.55" />
          <g strokeWidth="1" strokeOpacity="0.85">
            <ellipse cx="100" cy="118" rx="42" ry="40" />
            <ellipse cx="206" cy="122" rx="60" ry="46" />
            <rect x="154" y="54" width="76" height="20" rx="10" />
            <rect x="154" y="170" width="80" height="20" rx="10" />
            <rect x="258" y="85" width="80" height="30" rx="15" />
            <rect x="258" y="129" width="80" height="30" rx="15" />
            <ellipse cx="344" cy="100" rx="8" ry="12" />
            <ellipse cx="344" cy="144" rx="8" ry="12" />
          </g>
          <path d="M246 86 C 256 110, 256 134, 246 158" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.6" />
        </g>

        <rect className="scan-sweep" x="-60" y="30" width="60" height="180" fill="url(#scan-sweep)" />

        {/* Devices: base lines (dim when another is selected) */}
        <g fill="none" stroke="#B9CCD6" strokeWidth="1.1" strokeLinecap="round">
          <g opacity={op('cannula')}>
            <path d="M106 112 C 96 96, 80 84, 60 80 S 24 70, 6 52" />
            <path d="M106 124 C 96 140, 80 152, 60 156 S 24 166, 6 184" />
            <circle cx="106" cy="114" r="2" /><circle cx="106" cy="122" r="2" />
          </g>
          <g opacity={op('feeding')}>
            <path d="M6 112 C 40 112, 80 116, 104 118" />
            <path d="M104 118 C 130 119, 150 121, 172 124 C 190 127, 202 130, 212 134" strokeDasharray="3 3" />
            <ellipse cx="218" cy="136" rx="13" ry="9" strokeDasharray="2 2" />
          </g>
          <g opacity={op('heart')}>
            <path d="M176 100 C 210 60, 320 40, 434 22" />
            <path d="M236 104 C 280 72, 360 44, 434 30" />
            <path d="M176 146 C 200 120, 300 70, 434 38" />
            <circle cx="176" cy="100" r="4" /><circle cx="236" cy="104" r="4" /><circle cx="176" cy="146" r="4" />
          </g>
          <g opacity={op('temp')}>
            <rect x="217" y="112" width="11" height="8" rx="2" />
            <path d="M228 116 C 270 104, 340 76, 434 62" />
          </g>
          <g opacity={op('pulse')}>
            <ellipse cx="344" cy="144" rx="11" ry="14" />
            <path d="M355 150 C 380 170, 405 190, 434 200" />
          </g>
          <g opacity={op('iv')} stroke="#5B6B73" strokeDasharray="3 4">
            <path d="M232 182 C 262 205, 300 220, 344 238" />
            <path d="M228 178 l8 8 M236 178 l-8 8" />
          </g>
        </g>

        {/* Devices: highlight trails (only the selected one shows) */}
        <g fill="none" stroke="#6CB6FF" strokeLinecap="round">
          <g opacity={hi('cannula')}>
            <path className="flow" d="M6 52 C 24 70, 40 76, 60 80 S 96 96, 106 112" strokeWidth="2.4" />
            <path className="flow" d="M6 184 C 24 166, 40 160, 60 156 S 96 140, 106 124" strokeWidth="2.4" />
            <circle className="pulse" cx="106" cy="118" r="7" strokeWidth="1.5" />
          </g>
          <g opacity={hi('feeding')}>
            <path className="flow" d="M6 112 C 40 112, 80 116, 104 118 C 130 119, 150 121, 172 124 C 190 127, 202 130, 212 134" strokeWidth="2.4" />
            <ellipse className="glow" cx="218" cy="136" rx="13" ry="9" fill="#6CB6FF" fillOpacity="0.18" strokeWidth="1.5" />
          </g>
          <g opacity={hi('heart')}>
            <circle className="pulse" cx="176" cy="100" r="6" strokeWidth="1.5" />
            <circle className="pulse" cx="236" cy="104" r="6" strokeWidth="1.5" />
            <circle className="pulse" cx="176" cy="146" r="6" strokeWidth="1.5" />
            <path className="flow" d="M176 100 C 210 60, 320 40, 434 22" strokeWidth="1.8" />
            <path className="flow" d="M236 104 C 280 72, 360 44, 434 30" strokeWidth="1.8" />
            <path className="flow" d="M176 146 C 200 120, 300 70, 434 38" strokeWidth="1.8" />
          </g>
          <g opacity={hi('temp')}>
            <circle className="pulse-slow" cx="222" cy="116" r="10" strokeWidth="1.5" />
            <rect x="217" y="112" width="11" height="8" rx="2" fill="#6CB6FF" fillOpacity="0.35" strokeWidth="1.5" />
            <path className="flow" d="M228 116 C 270 104, 340 76, 434 62" strokeWidth="1.8" />
          </g>
          <g opacity={hi('pulse')}>
            <ellipse className="glow" cx="344" cy="144" rx="11" ry="14" fill="#6CB6FF" fillOpacity="0.22" strokeWidth="1.5" />
            <circle className="pulse" cx="344" cy="144" r="9" strokeWidth="1.5" />
            <path className="flow" d="M355 150 C 380 170, 405 190, 434 200" strokeWidth="1.8" />
          </g>
          <g opacity={hi('iv')} stroke="#9AA9B0">
            <path d="M232 182 C 262 205, 300 220, 344 238" strokeWidth="1.8" strokeDasharray="3 5" />
            <circle cx="232" cy="182" r="7" strokeWidth="1.5" strokeDasharray="2 2" />
          </g>
        </g>
      </svg>

      <div className="scan-stamp"><span className="scan-stamp-dot" />SCAN · 7:40 A.M.</div>
      <div className="scan-hint">Drag to turn</div>
    </div>
  )
}

export function DeviceChips({ device, onPick, className = '' }) {
  return (
    <div role="group" aria-label="Highlight a device on the scan" className={`device-chips ${className}`}>
      {devices.map((d) => {
        const on = d.id === device
        if (on) {
          return (
            <button key={d.id} type="button" aria-pressed="true" className="device-chip is-selected" onClick={() => onPick(d.id)}>
              <span className="device-chip-dot" />
              {d.isNew ? 'NEW · ' : d.removed ? 'REMOVED · ' : ''}{d.label}
            </button>
          )
        }
        if (d.removed) {
          return (
            <button key={d.id} type="button" aria-pressed="false" className="device-chip is-removed" onClick={() => onPick(d.id)}>
              <span className="tiny-bold">REMOVED</span> <s>{d.label}</s>
            </button>
          )
        }
        return (
          <button key={d.id} type="button" aria-pressed="false" className="device-chip" onClick={() => onPick(d.id)}>
            {d.isNew && <span className="tiny-bold new-text">NEW </span>}
            <span>{d.label}</span>
          </button>
        )
      })}
    </div>
  )
}
