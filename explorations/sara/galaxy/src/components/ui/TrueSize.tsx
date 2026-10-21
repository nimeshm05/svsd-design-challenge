"use client";
import { useId } from "react";

// Illustrative only: head-to-bottom length estimated from weight, compared with an
// adult hand (~19 cm wrist to fingertip). Not a clinical measurement.
export function lengthCm(weightGrams: number) {
  return 0.62 * (35 + (weightGrams - 980) * 0.0104);
}

const HAND_CM = 19;

function Baby({ L, x, y, ...rest }: { L: number; x: number; y: number } & React.SVGProps<SVGGElement>) {
  // a curled, sleeping shape: head, body, tucked knees and hands. Bottom at y.
  return (
    <g transform={`translate(${x} ${y - L})`} {...rest}>
      <ellipse cx={0} cy={L * 0.19} rx={L * 0.19} ry={L * 0.2} />
      <ellipse cx={L * 0.01} cy={L * 0.6} rx={L * 0.21} ry={L * 0.36} />
      <ellipse cx={-L * 0.14} cy={L * 0.82} rx={L * 0.1} ry={L * 0.15} transform={`rotate(20 ${-L * 0.14} ${L * 0.82})`} />
      <ellipse cx={L * 0.15} cy={L * 0.82} rx={L * 0.1} ry={L * 0.15} transform={`rotate(-20 ${L * 0.15} ${L * 0.82})`} />
      <ellipse cx={-L * 0.12} cy={L * 0.4} rx={L * 0.06} ry={L * 0.11} transform={`rotate(-30 ${-L * 0.12} ${L * 0.4})`} />
      <ellipse cx={L * 0.12} cy={L * 0.4} rx={L * 0.06} ry={L * 0.11} transform={`rotate(30 ${L * 0.12} ${L * 0.4})`} />
    </g>
  );
}

function Hand({ H, x, y }: { H: number; x: number; y: number }) {
  // an open palm, fingers up, wrist at y
  const fw = H * 0.105;
  const fingers = [
    { dx: -0.165, len: 0.4 },
    { dx: -0.055, len: 0.47 },
    { dx: 0.055, len: 0.44 },
    { dx: 0.16, len: 0.35 },
  ];
  const palmTop = y - H * 0.55;
  return (
    <g>
      <rect x={x - H * 0.23} y={palmTop} width={H * 0.46} height={H * 0.55} rx={H * 0.12} />
      {fingers.map((f, i) => (
        <rect key={i} x={x + f.dx * H - fw / 2} y={palmTop - f.len * H + fw} width={fw} height={f.len * H + H * 0.1} rx={fw / 2} />
      ))}
      <rect x={x - H * 0.42} y={y - H * 0.5} width={fw * 1.1} height={H * 0.36} rx={fw * 0.55} transform={`rotate(-38 ${x - H * 0.3} ${y - H * 0.25})`} />
    </g>
  );
}

export function TrueSize({ now, before }: { now: number; before?: number }) {
  const id = useId().replace(/:/g, "");
  const W = 320, Hh = 230;
  const pxPerCm = 6.6;
  const handH = HAND_CM * pxPerCm;
  const Ln = lengthCm(now) * pxPerCm;
  const Lb = before ? lengthCm(before) * pxPerCm : 0;
  const base = Hh - 14;
  // side by side at the same scale: a hand on the left, him on the right
  const hx = W * 0.3;
  const cx = W * 0.66;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${Hh}`} className="block h-auto w-full max-w-[340px]" role="img" aria-label={`Illustration: this week he is about ${Math.round(lengthCm(now))} cm from head to bottom${before ? `, last week about ${Math.round(lengthCm(before))} cm` : ""}, compared with an adult hand of about 19 cm.`}>
        <defs>
          <filter id={`o${id}`} x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="0.8" result="d" />
            <feComposite in="d" in2="SourceAlpha" operator="out" result="edge" />
            <feFlood floodColor="currentColor" />
            <feComposite in2="edge" operator="in" />
          </filter>
        </defs>
        {/* the parent's hand */}
        <g fill="#C9C4E8" opacity="0.05">
          <Hand H={handH} x={hx} y={base} />
        </g>
        <g fill="#000" filter={`url(#o${id})`} style={{ color: "rgba(201,196,232,0.42)" }}>
          <Hand H={handH} x={hx} y={base} />
        </g>
        <line x1={14} x2={W - 14} y1={base + 0.5} y2={base + 0.5} stroke="rgba(169,164,255,0.18)" strokeWidth="1" />
        {/* last week */}
        {before && (
          <g fill="#A9A4FF" opacity="0.16">
            <Baby L={Lb} x={cx} y={base} />
          </g>
        )}
        {/* this week */}
        <g fill="#FFB38A" opacity="0.1">
          <Baby L={Ln} x={cx} y={base} />
        </g>
        <g fill="#000" filter={`url(#o${id})`} style={{ color: "#FFB38A" }}>
          <Baby L={Ln} x={cx} y={base} />
        </g>
        <line x1={W - 22} x2={W - 22} y1={base} y2={base - Ln} stroke="rgba(255,179,138,0.6)" strokeWidth="1" />
        <line x1={W - 26} x2={W - 18} y1={base - Ln} y2={base - Ln} stroke="rgba(255,179,138,0.6)" strokeWidth="1" />
        <text x={W - 22} y={base - Ln - 8} textAnchor="middle" className="obs" fill="#FFB38A" style={{ fontSize: 9 }}>
          {Math.round(lengthCm(now))} cm
        </text>
        <text x={hx} y={base - handH - 8} textAnchor="middle" className="obs" fill="#9A95C2" style={{ fontSize: 9 }}>
          {HAND_CM} cm
        </text>
      </svg>
      <figcaption className="mt-2 flex gap-4 text-[12px] text-ink-3">
        <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full border border-copper" /> This week</span>
        {before && <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full bg-periwinkle/40" /> Last week</span>}
        <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-sm border border-ink-3" /> A parent&apos;s hand</span>
      </figcaption>
    </figure>
  );
}
