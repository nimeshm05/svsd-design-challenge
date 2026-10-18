"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { stay, weeksAlong } from "@/lib/data";
import { useStore } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;

export function Header({ onReplayRecap, onLegend }: { onReplayRecap: () => void; onLegend: () => void }) {
  const level = useStore((s) => s.level);
  const week = useStore((s) => s.week);
  const recap = useStore((s) => s.recap.active);
  const listView = useStore((s) => s.listView);
  const { up, setListView, startArrival, resetDemo } = useStore.getState();
  const [menu, setMenu] = useState(false);
  const today = stay.today.dayIndex;
  const wa = weeksAlong(today);

  return (
    <motion.header
      className="scrim-top pointer-events-none absolute inset-x-0 top-0 z-30 px-5 pb-10"
      style={{ paddingTop: "max(env(safe-area-inset-top), 18px)" }}
      animate={{ opacity: recap ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-start gap-2">
        <AnimatePresence initial={false}>
          {level !== "galaxy" && !listView && (
            <motion.button
              key="back"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.4, ease }}
              onClick={up}
              className="pointer-events-auto -ml-3 flex h-11 w-11 shrink-0 items-center justify-center text-ink-2 hover:text-ink"
              aria-label={level === "day" ? `Back to week ${week}` : "Back to the whole galaxy"}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <path d="M11 3.5 5.5 9l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
        <div className="min-w-0 flex-1">
          <h1 className="serif-i text-ink" style={{ fontSize: 34, lineHeight: 1 }}>
            {stay.baby.name}
          </h1>
          <p className="obs mt-2 text-ink-2">
            Day {today} <span className="text-ink-3">·</span> {wa.weeks} weeks along
          </p>
        </div>
        <div className="pointer-events-auto relative -mr-2 flex items-center">
          <button
            onClick={() => setListView(!listView)}
            className="flex h-11 items-center gap-2 px-2 text-ink-2 hover:text-ink"
            aria-pressed={listView}
            aria-label={listView ? "Show the galaxy" : "Show as a list"}
          >
            <span className="obs">{listView ? "Sky" : "List"}</span>
          </button>
          <button onClick={() => setMenu((m) => !m)} className="flex h-11 w-11 items-center justify-center text-ink-2 hover:text-ink" aria-label="More" aria-expanded={menu}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <circle cx="4" cy="9" r="1.1" fill="currentColor" />
              <circle cx="9" cy="9" r="1.1" fill="currentColor" />
              <circle cx="14" cy="9" r="1.1" fill="currentColor" />
            </svg>
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease }}
                className="glass absolute right-0 top-12 w-64 rounded-2xl p-1.5"
                role="menu"
              >
                {[
                  { t: "How to read the sky", f: onLegend },
                  { t: "While you were away", f: onReplayRecap },
                  { t: "Simulate a new moment", f: () => { resetDemo(); setTimeout(startArrival, 50); } },
                  { t: "Bedside display", f: () => (window.location.href = "/bedside") },
                ].map((i) => (
                  <button
                    key={i.t}
                    role="menuitem"
                    onClick={() => {
                      setMenu(false);
                      i.f();
                    }}
                    className="block min-h-11 w-full rounded-xl px-3 text-left text-[14px] text-ink-2 hover:bg-white/5 hover:text-ink"
                  >
                    {i.t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {level === "galaxy" && !listView && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.7, ease } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="mt-3 max-w-[30ch] text-[14px] leading-snug text-ink-2"
          >
            {stay.status}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
