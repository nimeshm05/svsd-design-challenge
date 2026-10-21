"use client";
import { create } from "zustand";
import { stay } from "./data";
import type { Day, Moment } from "./types";

export type Level = "galaxy" | "week" | "day";

type Arrival = { moment: Moment; startedAt: number } | null;

type State = {
  level: Level;
  week: number; // focused week index (1-based)
  day: number; // focused dayIndex
  moment: Moment | null; // open in sheet
  term: string | null; // glossary term open
  listView: boolean;
  days: Day[]; // mutable copy so live moments can arrive
  arrival: Arrival;
  arrivalDone: boolean;
  toast: { text: string; momentId: string } | null;
  pulse: { day: number; at: number } | null; // star reaction after an arrival
  recap: { active: boolean; step: number };
  reducedMotion: boolean;
  lite: boolean;
  settled: boolean; // camera has arrived; UI may enter
  cine: boolean; // cinematic framing (recap)

  goGalaxy: () => void;
  goWeek: (w: number) => void;
  goDay: (d: number) => void;
  up: () => void;
  openMoment: (m: Moment | null) => void;
  openTerm: (t: string | null) => void;
  setListView: (v: boolean) => void;
  startArrival: () => void;
  completeArrival: () => void;
  dismissToast: () => void;
  setRecap: (r: Partial<State["recap"]>) => void;
  setEnv: (e: Partial<Pick<State, "reducedMotion" | "lite">>) => void;
  setSettled: (v: boolean) => void;
  setCine: (v: boolean) => void;
  resetDemo: () => void;
};

export const useStore = create<State>((set, get) => ({
  level: "galaxy",
  week: Math.ceil(stay.today.dayIndex / 7),
  day: stay.today.dayIndex,
  moment: null,
  term: null,
  listView: false,
  days: stay.days.map((d) => ({ ...d, moments: [...d.moments] })),
  arrival: null,
  arrivalDone: false,
  toast: null,
  pulse: null,
  recap: { active: false, step: 0 },
  reducedMotion: false,
  lite: false,
  settled: false,
  cine: false,

  goGalaxy: () => set({ level: "galaxy", moment: null, settled: false }),
  goWeek: (w) => set({ level: "week", week: w, moment: null, settled: false }),
  goDay: (d) => set({ level: "day", day: d, week: Math.ceil(d / 7), moment: null, settled: false }),
  up: () => {
    const { level, moment } = get();
    if (moment) return set({ moment: null });
    if (level === "day") return set({ level: "week", settled: false });
    if (level === "week") return set({ level: "galaxy", settled: false });
  },
  openMoment: (m) => set({ moment: m, term: null }),
  openTerm: (t) => set({ term: t }),
  setListView: (v) => set({ listView: v }),

  startArrival: () => {
    const { arrival, arrivalDone } = get();
    if (arrival || arrivalDone) return;
    const { notification: _n, ...m } = stay.liveArrival;
    void _n;
    const moment: Moment = { id: `d${stay.today.dayIndex}-live`, ...m };
    set({ arrival: { moment, startedAt: performance.now() } });
  },
  completeArrival: () => {
    const { arrival, days } = get();
    if (!arrival) return;
    const today = stay.today.dayIndex;
    const next = days.map((d) =>
      d.dayIndex === today ? { ...d, moments: [...d.moments, arrival.moment].sort((a, b) => a.time.localeCompare(b.time)) } : d,
    );
    set({
      days: next,
      arrival: null,
      arrivalDone: true,
      pulse: { day: today, at: performance.now() },
      toast: { text: stay.liveArrival.notification, momentId: arrival.moment.id },
    });
  },
  dismissToast: () => set({ toast: null }),
  setRecap: (r) => set({ recap: { ...get().recap, ...r } }),
  setEnv: (e) => set(e),
  setSettled: (v) => set({ settled: v }),
  setCine: (v) => set({ cine: v }),
  resetDemo: () =>
    set({
      days: stay.days.map((d) => ({ ...d, moments: [...d.moments] })),
      arrival: null,
      arrivalDone: false,
      toast: null,
      pulse: null,
    }),
}));

// handy for demos and debugging from the console
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") (window as unknown as { __store: typeof useStore }).__store = useStore;

/** Exponential ease factor for per-frame fades; snaps (1) under reduced motion. */
export function fadeK(dt: number, rate: number) {
  return useStore.getState().reducedMotion ? 1 : 1 - Math.exp(-dt * rate);
}
