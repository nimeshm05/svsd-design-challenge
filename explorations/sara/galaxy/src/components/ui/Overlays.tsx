"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { clock, dateLabel, grams, minutesLabel, momentTypeLabel, stay } from "@/lib/data";
import { glossary } from "@/lib/glossary";
import { useStore } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;

/** "A new moment: Arjun finished his 2 PM feed" */
export function Toast() {
  const toast = useStore((s) => s.toast);
  const { dismissToast, goDay, openMoment } = useStore.getState();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 8000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);
  return (
    <div className="pointer-events-none absolute inset-x-0 z-40 flex justify-center px-4" style={{ top: "max(calc(env(safe-area-inset-top) + 96px), 104px)" }} aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.momentId}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.3 } }}
            className="glass pointer-events-auto flex w-full max-w-[360px] items-center gap-3 rounded-2xl py-2 pl-4 pr-2"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-copper/60" style={{ animationDuration: "2.4s" }} />
              <span className="relative h-2.5 w-2.5 rounded-full bg-copper" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="obs text-copper">A new moment</p>
              <p className="truncate text-[14px] text-ink">{toast.text}</p>
            </div>
            <button
              className="obs min-h-11 shrink-0 rounded-xl px-3 text-ink-2 hover:text-ink"
              onClick={() => {
                const today = stay.today.dayIndex;
                const m = useStore.getState().days.find((d) => d.dayIndex === today)?.moments.find((x) => x.id === toast.momentId);
                dismissToast();
                goDay(today);
                if (m) setTimeout(() => openMoment(m), 1300);
              }}
            >
              See it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** "While you were away": a short cinematic recap. */
export function Recap({ onDone }: { onDone: () => void }) {
  const recap = useStore((s) => s.recap);
  const step = recap.step; // 0 = title, 1..n = days
  const item = step > 0 ? stay.recap[step - 1] : null;
  const day = item ? stay.days[item.dayIndex - 1] : null;
  const last = stay.lastVisit;
  const lastDay = stay.days[last.dayIndex - 1];

  return (
    <AnimatePresence>
      {recap.active && (
        <motion.div
          key="recap"
          className="pointer-events-none absolute inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.8 } }}
          exit={{ opacity: 0, transition: { duration: 0.9 } }}
        >
          <div className="scrim-bottom absolute inset-x-0 bottom-0 h-[46%]" />
          <div className="absolute inset-x-0 bottom-0 px-7" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom) + 84px), 96px)" }}>
            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div key="title" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 1, ease } }} exit={{ opacity: 0, y: -4, transition: { duration: 0.5 } }}>
                  <p className="obs text-copper">Since {dateLabel(lastDay.date).split(",")[0]} {clock(last.time)}</p>
                  <h2 className="serif-i mt-2 text-[40px] leading-none text-ink">While you were away</h2>
                </motion.div>
              ) : (
                item &&
                day && (
                  // caption arrives once the camera has mostly landed
                  <motion.div key={`s${step}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 1.4, duration: 1, ease } }} exit={{ opacity: 0, y: -4, transition: { duration: 0.5 } }}>
                    <p className="obs text-ink-3">
                      {item.dayIndex === stay.today.dayIndex ? <span className="text-copper">Today</span> : `Day ${item.dayIndex}`} · {dateLabel(day.date)}
                    </p>
                    <p className="serif-i mt-2 max-w-[24ch] text-[28px] leading-[1.12] text-ink">{item.caption}</p>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
          <div className="absolute inset-x-0 flex items-center justify-between px-7" style={{ bottom: "max(calc(env(safe-area-inset-bottom) + 24px), 28px)" }}>
            <div className="flex gap-1.5" aria-hidden>
              {[0, ...stay.recap.map((_, i) => i + 1)].map((i) => (
                <span key={i} className="h-px w-6" style={{ background: i <= step ? "#FFB38A" : "rgba(169,164,255,0.25)", transition: "background 600ms" }} />
              ))}
            </div>
            <button onClick={onDone} className="obs pointer-events-auto min-h-11 px-2 text-ink-2 hover:text-ink">
              Skip
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Reduced motion: a soft dip instead of a camera flight. */
export function MotionFade() {
  const reduced = useStore((s) => s.reducedMotion);
  const level = useStore((s) => s.level);
  const week = useStore((s) => s.week);
  const day = useStore((s) => s.day);
  if (!reduced) return null;
  return (
    <motion.div
      key={`${level}-${week}-${day}`}
      className="pointer-events-none absolute inset-0 z-10 bg-[#05060A]"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 0, transition: { duration: 0.45 } }}
    />
  );
}

/** Flying into today's star: the screen fades to black just before her page opens. */
export function LeaveFade() {
  const leaving = useStore((s) => s.leaving);
  // coming back with the browser's Back button restores this page as it was; lift the black
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && useStore.getState().setLeaving(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
  return (
    <motion.div
      className="absolute inset-0 z-50 bg-black"
      style={{ pointerEvents: leaving ? "auto" : "none" }}
      initial={false}
      animate={{ opacity: leaving ? 1 : 0, transition: { duration: leaving ? 1.1 : 0.4, delay: leaving ? 0.15 : 0, ease: [0.55, 0, 0.75, 0.3] } }}
    />
  );
}

/** The facts, as a readable timeline. For screen readers and for parents who just want the list. */
export function ListView() {
  const listView = useStore((s) => s.listView);
  const days = useStore((s) => s.days);
  const { setListView, openMoment, goDay } = useStore.getState();
  return (
    <AnimatePresence>
      {listView && (
        <motion.main
          key="list"
          aria-label={`${stay.baby.name}'s stay, as a list`}
          className="absolute inset-0 z-[25] overflow-y-auto bg-[#05060A]/95 px-6 no-scrollbar"
          style={{ paddingTop: "max(calc(env(safe-area-inset-top) + 110px), 120px)", paddingBottom: 60 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <div className="mx-auto max-w-[560px]">
            {[...stay.weeks].reverse().map((w) => {
              const wd = days.filter((d) => d.week === w.index).reverse();
              if (!wd.length) return null;
              return (
                <section key={w.index} className="mb-12" aria-labelledby={`wk${w.index}`}>
                  <p className="obs text-ink-3">Week {w.index}</p>
                  <h2 id={`wk${w.index}`} className="serif-i text-[32px] leading-tight text-ink">{w.title}</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{w.summary}</p>
                  {w.hardPart && <p className="mt-2 text-[14px] leading-relaxed text-ink-3">{w.hardPart}</p>}
                  {wd.map((d) => (
                    <details key={d.dayIndex} className="group mt-4 border-t border-hair pt-3" open={d.dayIndex === stay.today.dayIndex}>
                      <summary className="flex min-h-11 cursor-pointer list-none items-baseline justify-between gap-3">
                        <span>
                          <span className="obs block text-ink-3">
                            {d.dayIndex === stay.today.dayIndex ? "Today" : `Day ${d.dayIndex}`} · {dateLabel(d.date)}
                          </span>
                          <span className="mt-1 block text-[15px] text-ink">{d.story}</span>
                        </span>
                        <span className="obs shrink-0 text-ink-3 group-open:rotate-90" aria-hidden>›</span>
                      </summary>
                      <p className="obs mt-2 text-ink-3">
                        {grams(d.weightGrams)} · {glossary[d.support]?.label ?? "Breathing on his own"} · With you {minutesLabel(d.parentMinutes)}
                      </p>
                      <ol className="mt-2">
                        {d.moments.map((m) => (
                          <li key={m.id}>
                            <button
                              onClick={() => {
                                setListView(false);
                                goDay(d.dayIndex);
                                setTimeout(() => openMoment(m), 900);
                              }}
                              className="flex min-h-11 w-full items-baseline gap-4 py-1 text-left"
                            >
                              <span className="obs w-16 shrink-0 text-ink-3">{clock(m.time)}</span>
                              <span className="text-[14px] text-ink-2">
                                <span className="sr-only">{momentTypeLabel[m.type]}: </span>
                                {m.first ? <span className="serif-i text-[17px] text-copper">{m.first} · </span> : null}
                                {m.title}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ol>
                    </details>
                  ))}
                </section>
              );
            })}
            <p className="text-[12px] text-ink-3">Synthetic data for a design prototype. Not a real baby.</p>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
