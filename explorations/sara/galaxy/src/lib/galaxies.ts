// One spiral galaxy per week. Each galaxy is a tilted disk in world space; that week's
// seven days sit along one of its spiral arms, from the core outward, as its constellation.
import * as THREE from "three";
import { stay } from "./data";
import type { Vec3 } from "./layout";

export type WeekGalaxy = {
  week: number;
  center: Vec3;
  radius: number; // world units, disk edge
  inclination: number; // radians, tilt away from the viewer
  angle: number; // radians, position angle on the sky
  pitch: number; // tan of the spiral pitch angle
  phase: number; // arm rotation
  seed: number;
  bright: number; // 0.65 (hard week) … 1 (calm week): never dark
  cool: number; // 0..1, harder weeks lean bluer
  warm: number; // 0..1, average time a parent was there → golden-copper core
  firsts: number; // firsts this week → rose star-forming knots
  current: boolean;
  matrix: THREE.Matrix4; // local disk (x, y, 0) → world
};

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const days = stay.days;
const weekCountAll = Math.ceil(days.length / 7);
const moodScore = { calm: 1, mixed: 0.8, hard: 0.6 } as const;

/** log-spiral angle of an arm at normalised radius rn (0..1) */
export function armAngle(g: Pick<WeekGalaxy, "phase" | "pitch">, rn: number, arm = 0) {
  return g.phase + arm * Math.PI + Math.log(Math.max(rn, 0.02)) / g.pitch;
}

// Hand-composed like a deep-field photograph: galaxies scattered across the sky at different
// depths, drifting loosely from the first week (top, furthest back) to this week (bottom, closest).
const COMPOSED: Vec3[] = [
  [-3.6, 10.8, -8.0],
  [3.9, 8.3, -7.0],
  [-0.5, 5.9, -6.0],
  [4.5, 2.9, -5.0],
  [-4.3, 0.9, -4.0],
  [1.3, -2.0, -3.0],
  [-3.3, -5.6, -1.5],
  [2.1, -9.9, 0],
];
function skyPosition(week: number): Vec3 {
  const n = weekCountAll;
  if (n <= COMPOSED.length) {
    // the last week always takes the hero slot
    const slot = week === n ? COMPOSED.length - 1 : week - 1;
    return COMPOSED[slot];
  }
  const t = (week - 1) / (n - 1);
  return [Math.sin(week * 2.4) * 2.6, 9.4 - t * 18, -7.5 * (1 - t)];
}

export const galaxies: WeekGalaxy[] = Array.from({ length: weekCountAll }, (_, i) => {
  const week = i + 1;
  const wd = days.filter((d) => d.week === week);
  const avgW = wd.reduce((a, d) => a + d.weightGrams, 0) / wd.length;
  const avgMood = wd.reduce((a, d) => a + moodScore[d.mood], 0) / wd.length;
  const avgParent = wd.reduce((a, d) => a + d.parentMinutes, 0) / wd.length;
  const firsts = wd.filter((d) => d.first).length;
  // this week is the hero; earlier weeks grow with his weight
  const radius = (1.55 + 1.0 * Math.min(1, Math.max(0, (avgW - 900) / 850))) * (week === weekCountAll ? 1.25 : 1);
  const center = skyPosition(week);
  const inclination = 0.2 + hash(week + 3) * 0.85;
  const angle = (hash(week + 9) - 0.5) * 2.2;
  const g: WeekGalaxy = {
    week,
    center,
    radius,
    inclination,
    angle,
    pitch: Math.tan(0.32 + hash(week + 5) * 0.12),
    phase: hash(week + 11) * Math.PI * 2,
    seed: hash(week + 21) * 100,
    bright: 0.55 + 0.45 * ((avgMood - 0.6) / 0.4),
    cool: Math.max(0, 1 - (avgMood - 0.6) / 0.4),
    warm: Math.min(1, avgParent / 170),
    firsts,
    current: week === weekCountAll,
    matrix: new THREE.Matrix4(),
  };
  g.matrix.compose(
    new THREE.Vector3(...center),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-inclination, 0, angle, "ZXY")),
    new THREE.Vector3(1, 1, 1),
  );
  return g;
});

/** local disk coords (in units of the radius) → world */
export function diskToWorld(g: WeekGalaxy, x: number, y: number): Vec3 {
  const v = new THREE.Vector3(x * g.radius, y * g.radius, 0).applyMatrix4(g.matrix);
  return [v.x, v.y, v.z];
}

/** Day stars trace one spiral arm from the core outward, stepping a little either side of it,
 *  so the week reads as a constellation that unfolds from the centre without crossing the core. */
export const dayPositions: Vec3[] = days.map((d) => {
  const g = galaxies[d.week - 1];
  const k = (d.dayIndex - 1) % 7;
  const rn = 0.27 + k * 0.105;
  const side = k % 2 ? 1 : -1;
  const a = armAngle(g, rn) + side * (0.1 + hash(d.dayIndex * 3.1) * 0.12);
  return diskToWorld(g, Math.cos(a) * rn, Math.sin(a) * rn);
});
