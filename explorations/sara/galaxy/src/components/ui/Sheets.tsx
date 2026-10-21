"use client";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { clock, dateLabel, momentTypeLabel, stay } from "@/lib/data";
import { glossary } from "@/lib/glossary";
import { useStore } from "@/lib/store";
import type { Moment } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function BottomSheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const controls = useDragControls();
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="veil"
            className="absolute inset-0 z-40 bg-[#05060A]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="glass absolute inset-x-0 bottom-0 z-50 mx-auto max-h-[86dvh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] px-6 pt-3 no-scrollbar wide:bottom-6 wide:rounded-[28px]"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 28px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0, transition: { type: "spring", stiffness: 260, damping: 32, mass: 0.9 } }}
            exit={{ y: "100%", transition: { duration: 0.35, ease } }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={(_, i) => (i.offset.y > 110 || i.velocity.y > 600) && onClose()}
          >
            <div className="flex cursor-grab touch-none justify-center pb-3 pt-1" onPointerDown={(e) => controls.start(e)}>
              <span className="h-1 w-9 rounded-full bg-ink-3/50" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TermExplainer({ k }: { k: string }) {
  const t = glossary[k];
  if (!t) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease }} className="overflow-hidden">
      <div className="mt-3 rounded-2xl border border-hair bg-white/[0.02] p-4">
        <p className="serif text-[22px] leading-tight text-ink">{t.label}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{t.what}</p>
        <p className="obs mt-4 text-copper">Why this matters for {stay.baby.name}</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{t.why}</p>
        <p className="mt-4 text-[12px] text-ink-3">Your care team can tell you more about what this means for him.</p>
      </div>
    </motion.div>
  );
}

export function Terms({ terms }: { terms: string[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!terms.length) return null;
  return (
    <div className="mt-6">
      <p className="obs text-ink-3">Words in this moment</p>
      <div className="mt-1 flex flex-wrap gap-x-4">
        {terms.map((k) => (
          <button key={k} onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="term min-h-11 text-[15px]">
            {glossary[k]?.label ?? k}
          </button>
        ))}
      </div>
      <AnimatePresence initial={false}>{open && <TermExplainer key={open} k={open} />}</AnimatePresence>
    </div>
  );
}

function VoicePlayer({ m }: { m: Moment }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const secs = m.seconds ?? 30;
  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - t * 1000;
    let raf = 0;
    const tick = () => {
      const e = (performance.now() - start) / 1000;
      if (e >= secs) {
        setPlaying(false);
        setT(0);
        return;
      }
      setT(e);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);
  const bars = 36;
  return (
    <div className="mt-5 flex items-center gap-4 rounded-2xl border border-hair p-3">
      <button onClick={() => setPlaying((p) => !p)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-periwinkle/40 text-periwinkle" aria-label={playing ? "Pause voice note" : "Play voice note"}>
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><rect x="3" y="2" width="2.5" height="10" rx="1" fill="currentColor" /><rect x="8.5" y="2" width="2.5" height="10" rx="1" fill="currentColor" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M4 2.5v9l7.5-4.5z" fill="currentColor" /></svg>
        )}
      </button>
      <div className="flex h-8 flex-1 items-center gap-[3px]" aria-hidden>
        {Array.from({ length: bars }, (_, i) => {
          const base = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + (m.seconds ?? 1)) * Math.sin(i * 0.37));
          const played = i / bars < t / secs;
          const live = playing ? 0.75 + 0.25 * Math.sin(t * 9 + i) : 1;
          return <span key={i} className="flex-1 rounded-full" style={{ height: `${Math.max(12, base * live * 100)}%`, background: played ? "#C8C2FF" : "rgba(169,164,255,0.25)", transition: "height 120ms" }} />;
        })}
      </div>
      <span className="obs w-10 text-right text-ink-3">0:{String(Math.round(playing ? secs - t : secs)).padStart(2, "0")}</span>
    </div>
  );
}

function PhotoPlaceholder({ m }: { m: Moment }) {
  return (
    <figure className="mt-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl" style={{ background: "radial-gradient(120% 90% at 30% 40%, #3a2a5a 0%, #1a1636 45%, #0b0d16 100%)" }}>
        <div className="absolute left-[38%] top-[44%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,179,138,0.55), rgba(255,106,61,0.12) 50%, transparent 70%)", filter: "blur(4px)" }} />
        <p className="obs absolute bottom-3 left-3 text-ink-3">Photo · placeholder</p>
      </div>
      <figcaption className="mt-2 text-[13px] text-ink-3">{m.plain}</figcaption>
    </figure>
  );
}

export function MomentSheet() {
  const m = useStore((s) => s.moment);
  const day = useStore((s) => s.day);
  const days = useStore((s) => s.days);
  const { openMoment } = useStore.getState();
  const d = days.find((x) => x.dayIndex === day);
  const isPerson = m?.by && !m.by.startsWith("Nurse") && !m.by.startsWith("Dr.") && m.by !== "Care team";
  return (
    <BottomSheet open={!!m} onClose={() => openMoment(null)} label={m ? m.title : "Moment"}>
      {m && d && (
        <article>
          <p className="obs text-ink-3">
            {clock(m.time)} · {momentTypeLabel[m.type]} · Day {d.dayIndex}, {dateLabel(d.date)}
          </p>
          {m.first && <p className="serif-i mt-3 text-[20px] text-copper">{m.first}</p>}
          <h2 className="serif mt-2 text-[30px] leading-[1.08] text-ink">{m.title}</h2>
          {m.media !== "photo" && <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{m.plain}</p>}
          {m.media === "voice" && <VoicePlayer m={m} />}
          {m.media === "photo" && <PhotoPlaceholder m={m} />}
          {m.by && (
            <p className="mt-5 text-[13px] text-ink-3">
              {isPerson ? "With " : m.type === "note" ? "Written by " : "Logged by "}
              <span className="text-ink-2">{m.by}</span>
            </p>
          )}
          <Terms terms={m.terms ?? []} />
        </article>
      )}
    </BottomSheet>
  );
}

/** A term opened directly (e.g. from the day panel's "Breathing" fact). */
export function TermSheet() {
  const term = useStore((s) => s.term);
  const { openTerm } = useStore.getState();
  return (
    <BottomSheet open={!!term} onClose={() => openTerm(null)} label={term ? glossary[term]?.label ?? term : "Term"}>
      {term && <TermExplainer k={term} />}
    </BottomSheet>
  );
}

const legend: { k: string; t: string; shape: ReactNode }[] = [
  { k: "A galaxy", t: "One week, one chapter. The newest week is the biggest and closest.", shape: <span className="block h-3 w-4 rounded-[50%] bg-[radial-gradient(circle,#FFE2B0_0%,#B9CCFF_45%,transparent_70%)]" /> },
  { k: "Its size", t: "His weight that week. Each galaxy is a little bigger than the last.", shape: <span className="block h-3 w-3 rounded-full bg-ink-2/60" /> },
  { k: "A warm, golden core", t: "Time you spent with him that week. The warmer, the more.", shape: <span className="block h-2.5 w-2.5 rounded-full bg-copper shadow-[0_0_10px_#FFB38A]" /> },
  { k: "Rose knots in the arms", t: "Star-forming nurseries: the week's firsts.", shape: <span className="block h-1.5 w-1.5 rounded-full bg-[#FF8FB6]" /> },
  { k: "A softer, bluer galaxy", t: "A harder week. Never dark.", shape: <span className="block h-2 w-2 rounded-full bg-periwinkle/60" /> },
  { k: "Bright stars inside", t: "The days of that week, joined into a constellation along one arm, from the core outward.", shape: <svg width="18" height="12" aria-hidden><path d="M1 10 7 3l5 5 5-6" stroke="#A9A4FF" strokeWidth="1" fill="none" /></svg> },
  { k: "A star's spikes and halo", t: "Spikes are breathing help (they soften as he needs less). A copper halo means you were there.", shape: <span className="relative block h-4 w-4"><span className="absolute left-1/2 top-0 h-4 w-px bg-copper" /><span className="absolute left-0 top-1/2 h-px w-4 bg-copper/60" /></span> },
];

export function LegendSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} label="How to read the sky">
      <h2 className="serif-i text-[30px] text-ink">How to read the sky</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-2">Every moment of {stay.baby.name}&apos;s stay becomes light. Each week is its own galaxy, from the first at the top to this week, closest to you.</p>
      <dl className="mt-5">
        {legend.map((l) => (
          <div key={l.k} className="flex gap-4 border-t border-hair py-3">
            <span className="flex w-6 shrink-0 items-center justify-center pt-1">{l.shape}</span>
            <div>
              <dt className="text-[14px] text-ink">{l.k}</dt>
              <dd className="text-[14px] leading-snug text-ink-2">{l.t}</dd>
            </div>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[12px] text-ink-3">Prototype with synthetic data. Not a real baby.</p>
    </BottomSheet>
  );
}
