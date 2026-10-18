"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { stay } from "@/lib/data";
import { useStore } from "@/lib/store";
import { posOf, positions } from "@/lib/view";
import { screenToWorld, worldToScreen } from "./scene/refs";
import { momentOffset } from "@/lib/layout";
import { Header } from "./ui/Header";
import { ListView, MotionFade, Recap, Toast } from "./ui/Overlays";
import { LevelPanels } from "./ui/Panels";
import { LegendSheet, MomentSheet, TermSheet } from "./ui/Sheets";

const Scene = dynamic(() => import("./scene/Scene").then((m) => m.Scene), { ssr: false });

function nearestDay(x: number, y: number) {
  let best = 0, bd = Infinity;
  positions.forEach((p, i) => {
    const d = Math.hypot(p[0] - x, p[1] - y);
    if (d < bd) {
      bd = d;
      best = i + 1;
    }
  });
  return { day: best, dist: bd };
}

export function Experience() {
  const wrap = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [legend, setLegend] = useState(false);

  // ---------- environment + deep links (?level=day&day=17&recap=0&lite=1) ----------
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lite = q.get("lite") === "1" || (q.get("lite") !== "0" && ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 3));
    useStore.getState().setEnv({ reducedMotion: mq.matches || q.get("motion") === "reduced", lite });
    const onMq = () => useStore.getState().setEnv({ reducedMotion: mq.matches });
    mq.addEventListener("change", onMq);

    const s = useStore.getState();
    const level = q.get("level");
    if (level === "week") s.goWeek(Number(q.get("week") ?? s.week));
    if (level === "day") s.goDay(Number(q.get("day") ?? s.day));
    if (q.get("list") === "1") s.setListView(true);

    let seen = false;
    try {
      seen = sessionStorage.getItem("recap-seen") === "1";
    } catch {}
    const wantRecap = q.get("recap") === "1" || (!level && q.get("recap") !== "0" && !seen);
    if (wantRecap) timers.current.push(setTimeout(runRecap, 900));
    else if (q.get("arrive") !== "0" && !level) timers.current.push(setTimeout(() => useStore.getState().startArrival(), 4200));
    return () => {
      mq.removeEventListener("change", onMq);
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- "while you were away" ----------
  const finishRecap = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const s = useStore.getState();
    s.setCine(false);
    s.setRecap({ active: false, step: 0 });
    s.goGalaxy();
    try {
      sessionStorage.setItem("recap-seen", "1");
    } catch {}
    timers.current.push(setTimeout(() => useStore.getState().startArrival(), 3000));
  }, []);

  const runRecap = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const s = useStore.getState();
    s.openMoment(null);
    s.setListView(false);
    s.setRecap({ active: true, step: 0 });
    s.setCine(false);
    s.goGalaxy();
    const reduced = s.reducedMotion;
    let t = reduced ? 2200 : 3000;
    stay.recap.forEach((r, i) => {
      timers.current.push(
        setTimeout(() => {
          const st = useStore.getState();
          st.setCine(true);
          st.setRecap({ step: i + 1 });
          st.goDay(r.dayIndex);
        }, t),
      );
      t += i === 0 ? 5400 : 4800;
    });
    timers.current.push(setTimeout(finishRecap, t));
  }, [finishRecap]);

  // ---------- gestures: tap, pinch, wheel, swipe, keys ----------
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const pts = new Map<number, { x: number; y: number; x0: number; y0: number }>();
    let pinch0 = 0;
    let lock = 0;
    let wheelAcc = 0;

    /** In a day, a tap opens the nearest moment on screen (lanes can sit close together). */
    const momentAt = (cx: number, cy: number) => {
      const s = useStore.getState();
      const r = el.getBoundingClientRect();
      const d = s.days.find((x) => x.dayIndex === s.day);
      if (!d) return false;
      const c = posOf(s.day);
      let best = null as null | (typeof d.moments)[number], bd = 30;
      for (const m of d.moments) {
        const o = momentOffset(m);
        const p = worldToScreen([c[0] + o[0], c[1] + o[1], c[2]], r.width, r.height);
        if (!p) continue;
        const dist = Math.hypot(p[0] - (cx - r.left), p[1] - (cy - r.top));
        if (dist < bd) {
          bd = dist;
          best = m;
        }
      }
      if (best) s.openMoment(best);
      return !!best;
    };
    const zoomInAt = (cx: number, cy: number) => {
      const s = useStore.getState();
      if (s.level === "day") {
        momentAt(cx, cy);
        return;
      }
      const r = el.getBoundingClientRect();
      const w = screenToWorld(cx - r.left, cy - r.top, r.width, r.height);
      if (!w) return;
      const n = nearestDay(w[0], w[1]);
      if (s.level === "galaxy" && n.dist < 1.4) s.goWeek(Math.ceil(n.day / 7));
      else if (s.level === "week" && n.dist < 0.5) s.goDay(n.day);
    };
    const step = (dir: 1 | -1) => {
      const s = useStore.getState();
      if (s.level === "week") {
        const w = s.week + dir;
        if (w >= 1 && w <= Math.ceil(stay.today.dayIndex / 7)) s.goWeek(w);
      } else if (s.level === "day") {
        const d = s.day + dir;
        if (d >= 1 && d <= stay.today.dayIndex) s.goDay(d);
      }
    };
    const blocked = () => {
      const s = useStore.getState();
      return s.recap.active || s.listView || !!s.moment || !!s.term;
    };

    const down = (e: PointerEvent) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch0 = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;
      if (pts.size === 2 && pinch0 && performance.now() > lock && !blocked()) {
        const [a, b] = [...pts.values()];
        const ratio = Math.hypot(a.x - b.x, a.y - b.y) / pinch0;
        if (ratio > 1.3) {
          zoomInAt((a.x + b.x) / 2, (a.y + b.y) / 2);
          lock = performance.now() + 900;
          pinch0 = 0;
        } else if (ratio < 0.75) {
          useStore.getState().up();
          lock = performance.now() + 900;
          pinch0 = 0;
        }
      }
    };
    const upH = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      const wasMulti = pts.size > 1;
      pts.delete(e.pointerId);
      if (!p || wasMulti || blocked()) return;
      const dx = p.x - p.x0, dy = p.y - p.y0;
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [role=dialog], .panel, header, footer")) return;
      if (Math.abs(dx) > 60 && Math.abs(dy) < 50) step(dx < 0 ? 1 : -1);
      else if (Math.hypot(dx, dy) < 8) zoomInAt(e.clientX, e.clientY);
    };
    const wheel = (e: WheelEvent) => {
      if (blocked() || (e.target as HTMLElement).closest(".panel, [role=dialog]")) return;
      e.preventDefault();
      if (performance.now() < lock) return;
      wheelAcc += e.deltaY;
      if (wheelAcc < -140) {
        zoomInAt(e.clientX, e.clientY);
        lock = performance.now() + 1100;
        wheelAcc = 0;
      } else if (wheelAcc > 140) {
        useStore.getState().up();
        lock = performance.now() + 1100;
        wheelAcc = 0;
      }
    };
    const key = (e: KeyboardEvent) => {
      if (blocked()) return;
      if (e.key === "Escape") useStore.getState().up();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", upH);
    el.addEventListener("pointercancel", upH);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", upH);
      el.removeEventListener("pointercancel", upH);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <div ref={wrap} className="fixed inset-0 overflow-hidden bg-space" style={{ touchAction: "none" }}>
      <Scene />
      <MotionFade />
      <Header onReplayRecap={runRecap} onLegend={() => setLegend(true)} />
      <LevelPanels />
      <ListView />
      <Toast />
      <Recap onDone={finishRecap} />
      <MomentSheet />
      <TermSheet />
      <LegendSheet open={legend} onClose={() => setLegend(false)} />
    </div>
  );
}
