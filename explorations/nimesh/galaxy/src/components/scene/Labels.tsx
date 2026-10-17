"use client";
import { Html } from "@react-three/drei";
import type { CSSProperties, ReactNode } from "react";
import { clock, dateLabel, stay } from "@/lib/data";
import { momentOffset, RING_RADIUS, type Vec3 } from "@/lib/layout";
import { useStore } from "@/lib/store";
import { posOf, weekCenter, weekCount, weekRadius } from "@/lib/view";

const enter = (show: boolean, i: number): CSSProperties => ({
  opacity: show ? 1 : 0,
  transform: `translateY(${show ? 0 : 7}px)`,
  transition: show
    ? `opacity 700ms var(--ease-ui) ${i * 40}ms, transform 800ms var(--ease-camera) ${i * 40}ms`
    : "opacity 200ms ease, transform 200ms ease",
  pointerEvents: show ? "auto" : "none",
});

/** A hairline leader from a celestial object to a small label, like a star-chart annotation. */
function Leader({ dx, dy, children, align = "left", warm = false }: { dx: number; dy: number; children: ReactNode; align?: "left" | "right" | "center"; warm?: boolean }) {
  const x2 = dx, y2 = dy;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}>
      <svg style={{ position: "absolute", overflow: "visible", left: 0, top: 0 }} width="1" height="1" aria-hidden>
        <line x1={dx * 0.12} y1={dy * 0.12} x2={x2} y2={y2} stroke={warm ? "rgba(255,179,138,0.55)" : "rgba(169,164,255,0.42)"} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <circle cx={x2} cy={y2} r="1.4" fill={warm ? "#FFB38A" : "#A9A4FF"} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x2 + (align === "left" ? 6 : align === "right" ? -6 : 0),
          top: y2,
          transform: `translate(${align === "left" ? "0" : align === "right" ? "-100%" : "-50%"}, -50%)`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function At({ p, children }: { p: Vec3; children: ReactNode }) {
  return (
    <Html position={p} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
      {children}
    </Html>
  );
}

export function Labels() {
  const level = useStore((s) => s.level);
  const settled = useStore((s) => s.settled);
  const week = useStore((s) => s.week);
  const day = useStore((s) => s.day);
  const days = useStore((s) => s.days);
  const recap = useStore((s) => s.recap.active);
  const listView = useStore((s) => s.listView);
  const { goWeek, goDay, openMoment } = useStore.getState();
  if (listView) return null;

  const showGalaxy = level === "galaxy" && settled && !recap;
  const showWeek = level === "week" && settled && !recap;
  const showDay = level === "day" && settled && !recap;
  const today = stay.today.dayIndex;
  const focusedDay = days.find((d) => d.dayIndex === day)!;

  return (
    <>
      {/* ---------- galaxy: chapter markers ---------- */}
      {Array.from({ length: weekCount }, (_, i) => i + 1).map((w, i) => {
        const c = weekCenter(w);
        const r = weekRadius(w) * 0.55;
        const ang = Math.atan2(c[1], c[0]);
        const p: Vec3 = [c[0] + Math.cos(ang) * r, c[1] + Math.sin(ang) * r, c[2]];
        const dx = Math.cos(ang) * 14, dy = -Math.sin(ang) * 14;
        return (
          <At key={`w${w}`} p={p}>
            <div style={enter(showGalaxy, i)}>
              <Leader dx={dx} dy={dy} align={dx >= 0 ? "left" : "right"}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goWeek(w);
                  }}
                  className="obs text-ink-2 hover:text-ink"
                  style={{ minHeight: 44, minWidth: 44, padding: "0 6px" }}
                  aria-label={`Week ${w}: ${stay.weeks[w - 1].title}`}
                >
                  W{w}
                </button>
              </Leader>
            </div>
          </At>
        );
      })}
      <At p={posOf(today)}>
        <div style={enter(showGalaxy, weekCount)}>
          <Leader dx={Math.cos(Math.atan2(posOf(today)[1], posOf(today)[0])) * 34} dy={-Math.sin(Math.atan2(posOf(today)[1], posOf(today)[0])) * 34} align={posOf(today)[0] >= 0 ? "left" : "right"} warm>
            <button onClick={(e) => { e.stopPropagation(); goDay(today); }} className="obs text-copper" style={{ minHeight: 44, padding: "0 4px" }} aria-label="Open today">
              Today
            </button>
          </Leader>
        </div>
      </At>

      {/* ---------- week: the seven days, firsts named ---------- */}
      {days
        .filter((d) => d.week === week)
        .map((d, i) => {
          const p = posOf(d.dayIndex);
          // alternate labels outward / inward along the spiral's normal so neighbours never collide
          const out = Math.atan2(p[1], p[0]);
          const ang = i % 2 === 0 ? out : out + Math.PI;
          const len = d.first ? 38 : 24;
          const dx = Math.cos(ang) * len, dy = -Math.sin(ang) * len;
          return (
            <At key={`d${d.dayIndex}`} p={p}>
              <div style={enter(showWeek, i)}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goDay(d.dayIndex);
                  }}
                  aria-label={`Day ${d.dayIndex}, ${dateLabel(d.date)}${d.first ? `, ${d.first}` : ""}. ${d.story}`}
                  style={{ position: "absolute", left: -24, top: -24, width: 48, height: 48, borderRadius: 24 }}
                />
                <Leader dx={dx} dy={dy} align={dx >= 0 ? "left" : "right"} warm={d.dayIndex === today}>
                  <span className="flex flex-col" style={{ alignItems: dx >= 0 ? "flex-start" : "flex-end" }}>
                    {d.first && <span className="serif-i text-ink" style={{ fontSize: 17, lineHeight: 1.1 }}>{d.first}</span>}
                    <span className={`obs ${d.dayIndex === today ? "text-copper" : "text-ink-3"}`}>
                      {d.dayIndex === today ? "Today" : d.dayIndex}
                    </span>
                  </span>
                </Leader>
              </div>
            </At>
          );
        })}

      {/* ---------- day: 24-hour ring, moments ---------- */}
      {[
        { h: 0, t: "Midnight" },
        { h: 6, t: "6 AM" },
        { h: 12, t: "Noon" },
        { h: 18, t: "6 PM" },
      ].map(({ h, t }, i) => {
        const a = Math.PI / 2 - (h / 24) * Math.PI * 2;
        const c = posOf(day);
        const r = RING_RADIUS * 1.62;
        return (
          <At key={`h${h}`} p={[c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]]}>
            <div style={enter(showDay, i)}>
              <span className="obs text-ink-3" style={{ position: "absolute", transform: "translate(-50%,-50%)", whiteSpace: "nowrap" }}>
                {t}
              </span>
            </div>
          </At>
        );
      })}
      {focusedDay.moments.map((m, i) => {
        const c = posOf(day);
        const o = momentOffset(m);
        const p: Vec3 = [c[0] + o[0], c[1] + o[1], c[2]];
        const ang = Math.atan2(o[1], o[0]);
        return (
          <At key={m.id} p={p}>
            <div style={enter(showDay, 4 + i * 0.5)}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openMoment(m);
                }}
                aria-label={`${clock(m.time)}: ${m.title}`}
                className="moment-hit"
                // pointer taps resolve to the nearest moment in Experience; this button serves keyboard + screen readers
                style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: 22, pointerEvents: "none" }}
              />
              {m.first && (
                <Leader dx={Math.cos(ang) * 46} dy={-Math.sin(ang) * 46} align={Math.cos(ang) >= 0 ? "left" : "right"} warm>
                  <span className="flex flex-col" style={{ alignItems: Math.cos(ang) >= 0 ? "flex-start" : "flex-end" }}>
                    <span className="serif-i text-ink" style={{ fontSize: 19, lineHeight: 1.1 }}>{m.first}</span>
                    <span className="obs text-ink-3">{clock(m.time)}</span>
                  </span>
                </Leader>
              )}
            </div>
          </At>
        );
      })}
    </>
  );
}
