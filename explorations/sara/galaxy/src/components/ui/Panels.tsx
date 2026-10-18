"use client";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { dateLabel, grams, minutesLabel, stay, weeksAlong } from "@/lib/data";
import { glossary } from "@/lib/glossary";
import { useStore } from "@/lib/store";
import { TrueSize } from "./TrueSize";

const ease = [0.22, 1, 0.36, 1] as const;

/** UI enters after the camera arrives: fade + drift up 7px, staggered 40ms. */
export function Stagger({ children, i = 0, show = true }: { children: ReactNode; i?: number; show?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 7 }}
      animate={show ? { opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.7, ease } } : { opacity: 0, y: 7, transition: { duration: 0.15 } }}
    >
      {children}
    </motion.div>
  );
}

function PanelShell({ children, k }: { children: ReactNode; k: string }) {
  return (
    <motion.section
      key={k}
      className="panel pointer-events-auto absolute inset-x-0 bottom-0 z-20 max-h-[48dvh] overflow-y-auto overscroll-contain px-6 pt-16 no-scrollbar wide:inset-x-auto wide:right-0 wide:top-0 wide:max-h-none wide:w-[480px] wide:pt-36"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      {children}
    </motion.section>
  );
}

function Pager({ prev, next, label }: { prev?: () => void; next?: () => void; label: [string, string] }) {
  return (
    <div className="mt-8 flex justify-between">
      <button disabled={!prev} onClick={prev} className="obs min-h-11 px-1 text-ink-2 enabled:hover:text-ink disabled:opacity-30">
        ← {label[0]}
      </button>
      <button disabled={!next} onClick={next} className="obs min-h-11 px-1 text-ink-2 enabled:hover:text-ink disabled:opacity-30">
        {label[1]} →
      </button>
    </div>
  );
}

export function WeekPanel() {
  const week = useStore((s) => s.week);
  const settled = useStore((s) => s.settled);
  const days = useStore((s) => s.days);
  const { goWeek, goDay } = useStore.getState();
  const w = stay.weeks[week - 1];
  const wd = days.filter((d) => d.week === week);
  const prevW = days.filter((d) => d.week === week - 1);
  const firsts = wd.flatMap((d) => d.moments.filter((m) => m.first).map((m) => ({ d, m })));
  const now = wd[wd.length - 1].weightGrams;
  const before = prevW.length ? prevW[prevW.length - 1].weightGrams : undefined;
  const wa = weeksAlong(wd[0].dayIndex);
  const lastWeek = Math.ceil(stay.today.dayIndex / 7);

  return (
    <PanelShell k={`w${week}`}>
      <Stagger i={0} show={settled}>
        <p className="obs text-ink-3">
          Week {week} · Days {wd[0].dayIndex}–{wd[wd.length - 1].dayIndex} · {wa.weeks} weeks along
        </p>
      </Stagger>
      <Stagger i={1} show={settled}>
        <h2 className="serif-i mt-2 text-ink" style={{ fontSize: 40, lineHeight: 1.02 }}>
          {w.title}
        </h2>
      </Stagger>
      <Stagger i={2} show={settled}>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{w.summary}</p>
      </Stagger>

      <Stagger i={3} show={settled}>
        <div className="mt-7 border-t border-hair pt-5">
          <p className="obs text-ink-3">True size</p>
          <p className="mt-1 text-[14px] text-ink-2">
            {grams(now)}
            {before && <span className="text-ink-3"> · up {grams(now - before)} from last week</span>}
          </p>
          <div className="mt-3">
            <TrueSize now={now} before={before} />
          </div>
          <p className="mt-2 text-[12px] text-ink-3">Approximate, drawn from his weight.</p>
        </div>
      </Stagger>

      {firsts.length > 0 && (
        <Stagger i={4} show={settled}>
          <div className="mt-7 border-t border-hair pt-5">
            <p className="obs text-ink-3">Firsts this week</p>
            <ul className="mt-2">
              {firsts.map(({ d, m }) => (
                <li key={m.id}>
                  <button onClick={() => goDay(d.dayIndex)} className="flex min-h-11 w-full items-baseline justify-between gap-4 text-left">
                    <span className="serif-i text-[21px] text-ink">{m.first}</span>
                    <span className="obs shrink-0 text-ink-3">Day {d.dayIndex}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Stagger>
      )}

      {w.hardPart && (
        <Stagger i={5} show={settled}>
          {/* hard content gets stillness, not effects */}
          <div className="mt-7 border-t border-hair pt-5">
            <p className="obs text-ink-3">What was hard</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{w.hardPart}</p>
          </div>
        </Stagger>
      )}

      <Pager
        prev={week > 1 ? () => goWeek(week - 1) : undefined}
        next={week < lastWeek ? () => goWeek(week + 1) : undefined}
        label={[`Week ${week - 1 || ""}`.trim(), `Week ${week + 1}`]}
      />
    </PanelShell>
  );
}

export function DayPanel() {
  const day = useStore((s) => s.day);
  const settled = useStore((s) => s.settled);
  const days = useStore((s) => s.days);
  const { goDay, openTerm } = useStore.getState();
  const d = days.find((x) => x.dayIndex === day)!;
  const wa = weeksAlong(day);
  const today = stay.today.dayIndex;
  const supportTerm = d.support === "room-air" ? null : d.support;

  return (
    <PanelShell k={`d${day}`}>
      <Stagger i={0} show={settled}>
        <p className="obs text-ink-3">
          {day === today ? <span className="text-copper">Today</span> : `Day ${day}`} · {dateLabel(d.date)} · {wa.weeks}w {wa.days}d
        </p>
      </Stagger>
      <Stagger i={1} show={settled}>
        <p className="serif-i mt-2 text-ink" style={{ fontSize: 28, lineHeight: 1.12 }}>
          {d.story}
        </p>
      </Stagger>
      <Stagger i={2} show={settled}>
        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-hair pt-4">
          <div>
            <dt className="obs text-ink-3">Weight</dt>
            <dd className="obs mt-1.5 text-[11px] normal-case text-ink">{grams(d.weightGrams)}</dd>
          </div>
          <div>
            <dt className="obs text-ink-3">Breathing</dt>
            <dd className="mt-0.5">
              {supportTerm ? (
                <button onClick={() => openTerm(supportTerm)} className="obs term min-h-8 text-[11px]">
                  {glossary[supportTerm].label}
                </button>
              ) : (
                <span className="obs text-[11px] text-ink">On his own</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="obs text-ink-3">With you</dt>
            <dd className="obs mt-1.5 text-[11px] normal-case text-ink">{minutesLabel(d.parentMinutes)}</dd>
          </div>
        </dl>
      </Stagger>
      <Stagger i={3} show={settled}>
        <p className="mt-5 text-[13px] text-ink-3">Each light on the ring is a moment, placed at the time it happened. Tap one to open it.</p>
      </Stagger>
      <Pager
        prev={day > 1 ? () => goDay(day - 1) : undefined}
        next={day < today ? () => goDay(day + 1) : undefined}
        label={[`Day ${day - 1 || ""}`.trim(), `Day ${day + 1}`]}
      />
    </PanelShell>
  );
}

export function GalaxyFooter() {
  const settled = useStore((s) => s.settled);
  const { goDay, goWeek } = useStore.getState();
  const today = stay.today.dayIndex;
  return (
    <motion.footer
      className="scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-6 pt-16"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 22px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: settled ? 1 : 0, transition: { duration: 0.6 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <p className="obs max-w-[17ch] leading-relaxed text-ink-3">Each galaxy is a week. Tap one to go inside.</p>
      <div className="pointer-events-auto flex gap-2">
        <button onClick={() => goWeek(Math.ceil(today / 7))} className="obs min-h-11 rounded-full border border-hair px-4 text-ink-2 hover:text-ink">
          This week
        </button>
        <button onClick={() => goDay(today)} className="obs min-h-11 rounded-full border border-copper/50 px-4 text-copper hover:border-copper">
          Today
        </button>
      </div>
    </motion.footer>
  );
}

export function LevelPanels() {
  const level = useStore((s) => s.level);
  const recap = useStore((s) => s.recap.active);
  const listView = useStore((s) => s.listView);
  if (recap || listView) return null;
  return (
    <AnimatePresence mode="wait">
      {level === "galaxy" && <GalaxyFooter key="g" />}
      {level === "week" && <WeekPanel key="w" />}
      {level === "day" && <DayPanel key="d" />}
    </AnimatePresence>
  );
}
