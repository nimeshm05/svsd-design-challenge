// Camera framing for each zoom level. The camera always looks straight down -z;
// a "focus rect" (in NDC) says where on screen the subject should sit, so the UI
// panels never cover it.
import { stay } from "./data";
import { centroid, radiusAround, RING_RADIUS, spiralPositions, type Vec3 } from "./layout";
import type { Level } from "./store";

export const FOV = 35;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);

export const positions = spiralPositions(stay.days.length);
export const posOf = (dayIndex: number): Vec3 => positions[dayIndex - 1];

export const weekCount = Math.ceil(stay.days.length / 7);
export const weekPoints = (w: number) => positions.slice((w - 1) * 7, Math.min(w * 7, positions.length));
export const weekCenter = (w: number) => centroid(weekPoints(w));
export const weekRadius = (w: number) => Math.max(0.85, radiusAround(weekCenter(w), weekPoints(w)) + 0.25);

const galaxyCenter: Vec3 = (() => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of positions) {
    minX = Math.min(minX, p[0]);
    maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]);
    maxY = Math.max(maxY, p[1]);
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2, 0];
})();
const galaxyRadius = radiusAround(galaxyCenter, positions) + 0.95; // room for chapter labels

type Rect = { cx: number; cy: number; w: number; h: number }; // NDC

export function focusRect(level: Level | "cinematic", aspect: number): Rect {
  const wide = aspect > 1.1;
  if (level === "galaxy") return wide ? { cx: 0, cy: -0.04, w: 1.7, h: 1.55 } : { cx: 0, cy: -0.02, w: 1.92, h: 1.45 };
  if (level === "cinematic") return { cx: 0, cy: 0.1, w: 1.6, h: 1.3 };
  // week / day: panel sits right on wide screens, bottom on phones
  if (wide) return { cx: -0.3, cy: 0, w: 1.25, h: 1.5 };
  return { cx: 0, cy: 0.33, w: 1.9, h: 0.7 };
}

export function frame(center: Vec3, radius: number, rect: Rect, aspect: number): Vec3 {
  const zW = radius / (TAN * aspect * (rect.w / 2));
  const zH = radius / (TAN * (rect.h / 2));
  const dist = Math.max(zW, zH);
  const x = center[0] - rect.cx * TAN * aspect * dist;
  const y = center[1] - rect.cy * TAN * dist;
  return [x, y, center[2] + dist];
}

export function viewFor(level: Level | "cinematic", week: number, day: number, aspect: number): Vec3 {
  if (level === "galaxy") return frame(galaxyCenter, galaxyRadius, focusRect("galaxy", aspect), aspect);
  if (level === "week") return frame(weekCenter(week), weekRadius(week), focusRect("week", aspect), aspect);
  if (level === "cinematic") return frame(posOf(day), RING_RADIUS * 1.9, focusRect("cinematic", aspect), aspect);
  return frame(posOf(day), RING_RADIUS * 1.38, focusRect("day", aspect), aspect);
}

/** cubic-bezier(0.22, 1, 0.36, 1) */
export function easeCamera(t: number) {
  return bezier(0.22, 1, 0.36, 1, t);
}

export function bezier(x1: number, y1: number, x2: number, y2: number, x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // Newton on x(t), then y(t)
  let t = x;
  for (let i = 0; i < 8; i++) {
    const xt = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t - x;
    const dx = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
    if (Math.abs(dx) < 1e-6) break;
    t -= xt / dx;
    t = Math.min(1, Math.max(0, t));
  }
  return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
}
