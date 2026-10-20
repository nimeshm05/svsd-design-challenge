// World-space layout of the galaxy. Day 1 sits at the center; days spiral outward,
// with a small gap between weeks so each chapter reads as its own constellation.
import type { Day, Moment, MomentType } from "./types";
import { toMinutes } from "./data";

export type Vec3 = [number, number, number];

const STEP = 0.52; // arc length between days
const WEEK_GAP = 0.62; // extra arc length between weeks
const A = 0.22; // spiral start radius
const B = 0.27; // radial growth per radian (arm separation ≈ 1.7)

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function spiralPositions(count: number): Vec3[] {
  const out: Vec3[] = [];
  let theta = 0.6;
  for (let i = 0; i < count; i++) {
    const day = i + 1;
    if (i > 0) {
      const s = STEP + (i % 7 === 0 ? WEEK_GAP : 0);
      const r = A + B * theta;
      theta += s / Math.max(r, 0.45);
    }
    const r = A + B * theta;
    // perpendicular jitter gives each week a constellation-like shape
    const j = (hash(day) - 0.5) * 0.34;
    const rr = r + j;
    const ang = theta + (hash(day + 99) - 0.5) * 0.08;
    const z = (hash(day + 7) - 0.5) * 0.5;
    out.push([Math.cos(ang) * rr, Math.sin(ang) * rr, z]);
  }
  return out;
}

export function centroid(points: Vec3[]): Vec3 {
  const c: Vec3 = [0, 0, 0];
  for (const p of points) {
    c[0] += p[0];
    c[1] += p[1];
    c[2] += p[2];
  }
  return [c[0] / points.length, c[1] / points.length, c[2] / points.length];
}

export function radiusAround(c: Vec3, points: Vec3[]) {
  let r = 0;
  for (const p of points) r = Math.max(r, Math.hypot(p[0] - c[0], p[1] - c[1]));
  return r;
}

/** Star core radius in world units. The galaxy visibly grows as weight goes up. */
export function coreSize(weightGrams: number) {
  return 0.026 + Math.max(0, weightGrams - 880) * 0.000032;
}

export const RING_RADIUS = 0.3;

/** Moments sit in three lanes on the 24-hour ring so close times don't collide.
 *  Inner: the family's voices and notes. Middle: the body (feeds, diapers, weight).
 *  Outer: the parent (cares, skin-to-skin) and the medical layer. */
export const lane: Record<MomentType, number> = {
  voice: 0.78,
  note: 0.78,
  photo: 0.78,
  feed: 1,
  diaper: 1,
  weight: 1,
  cares: 1.2,
  "skin-to-skin": 1.2,
  "support-change": 1.38,
  procedure: 1.38,
};

/** angle on the 24h ring: midnight at 12 o'clock, running clockwise */
export function timeAngle(t: string) {
  return Math.PI / 2 - (toMinutes(t) / 1440) * Math.PI * 2;
}

export function momentOffset(m: Pick<Moment, "time" | "type">): Vec3 {
  const a = timeAngle(m.time);
  const r = RING_RADIUS * lane[m.type];
  return [Math.cos(a) * r, Math.sin(a) * r, 0];
}

export function dayById(days: Day[], index: number) {
  return days.find((d) => d.dayIndex === index);
}
