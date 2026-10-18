import raw from "../../data/stay.json";
import type { Day, Moment, Stay } from "./types";

export const stay = raw as unknown as Stay;

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** 14:04 → "2:04 PM" */
export function clock(t: string) {
  const m = toMinutes(t);
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

export function dateLabel(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

/** weeks + days along, counted from conception dating (gestational age at birth + days of life) */
export function weeksAlong(dayIndex: number) {
  const totalDays = stay.baby.gestationalAgeAtBirthWeeks * 7 + (dayIndex - 1);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

export function weekDays(weekIndex: number, days: Day[]) {
  return days.filter((d) => d.week === weekIndex);
}

export function grams(n: number) {
  return `${n.toLocaleString("en-US")} g`;
}

export function minutesLabel(n: number) {
  if (n <= 0) return "—";
  const h = Math.floor(n / 60);
  const m = n % 60;
  return h ? `${h} h ${m ? `${m} m` : ""}`.trim() : `${m} min`;
}

export const momentTypeLabel: Record<Moment["type"], string> = {
  feed: "Feed",
  diaper: "Diaper",
  "skin-to-skin": "Skin-to-skin",
  cares: "Cares",
  note: "Nurse note",
  photo: "Photo",
  voice: "Voice note",
  weight: "Weight",
  "support-change": "Breathing help",
  procedure: "Test or procedure",
};
