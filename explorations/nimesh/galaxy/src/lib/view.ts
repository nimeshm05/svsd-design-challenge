// Camera framing for each zoom level. The camera always looks straight down -z;
// a "focus rect" (in NDC) says where on screen the subject should sit, so the UI
// panels never cover it.
import { stay } from "./data";
import { dayPositions, galaxies } from "./galaxies";
import { RING_RADIUS, type Vec3 } from "./layout";
import type { Level } from "./store";

export const FOV = 35;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);

export const positions = dayPositions;
export const posOf = (dayIndex: number): Vec3 => positions[dayIndex - 1];

export const weekCount = Math.ceil(stay.days.length / 7);
export const weekPoints = (w: number) => positions.slice((w - 1) * 7, Math.min(w * 7, positions.length));
// a week is framed as its whole galaxy
export const weekCenter = (w: number): Vec3 => galaxies[w - 1].center;
export const weekRadius = (w: number) => galaxies[w - 1].radius * 0.86;

// the top level ("the sky") frames every week's galaxy
const skyBox = (() => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const g of galaxies) {
    minX = Math.min(minX, g.center[0] - g.radius);
    maxX = Math.max(maxX, g.center[0] + g.radius);
    minY = Math.min(minY, g.center[1] - g.radius);
    maxY = Math.max(maxY, g.center[1] + g.radius);
  }
  return { c: [(minX + maxX) / 2, (minY + maxY) / 2, 0] as Vec3, hw: (maxX - minX) / 2 + 0.3, hh: (maxY - minY) / 2 + 0.3 };
})();

type Rect = { cx: number; cy: number; w: number; h: number }; // NDC

export function focusRect(level: Level | "cinematic", aspect: number): Rect {
  const wide = aspect > 1.1;
  if (level === "galaxy") return wide ? { cx: 0, cy: -0.04, w: 1.7, h: 1.55 } : { cx: 0, cy: -0.02, w: 1.92, h: 1.45 };
  if (level === "cinematic") return { cx: 0, cy: 0.1, w: 1.6, h: 1.3 };
  // week / day: panel sits right on wide screens, bottom on phones
  if (wide) return { cx: -0.3, cy: 0, w: 1.25, h: 1.5 };
  return { cx: 0, cy: 0.33, w: 1.9, h: 0.7 };
}

export function frame(center: Vec3, radius: number, rect: Rect, aspect: number, radiusY = radius): Vec3 {
  const zW = radius / (TAN * aspect * (rect.w / 2));
  const zH = radiusY / (TAN * (rect.h / 2));
  const dist = Math.max(zW, zH);
  const x = center[0] - rect.cx * TAN * aspect * dist;
  const y = center[1] - rect.cy * TAN * dist;
  return [x, y, center[2] + dist];
}

export function viewFor(level: Level | "cinematic", week: number, day: number, aspect: number): Vec3 {
  if (level === "galaxy") {
    return frame(skyBox.c, skyBox.hw, focusRect("galaxy", aspect), aspect, skyBox.hh);
  }
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
