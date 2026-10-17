# The NICU galaxy

**Status:** promising

A baby's NICU stay as a stellar nursery. Every moment (a feed, a diaper, skin-to-skin, a nurse's note, a grandma's voice note) becomes light. Days are stars, weeks are constellations, the whole stay is a galaxy spiralling out from day 1. Parents can zoom from the galaxy into a week, into a day, and open a single moment.

Built from `build-prompt.md` (the NICU galaxy brief). All data is **synthetic**; Arjun is not a real baby.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Open it at phone size (390×844) in devtools; it is designed mobile-first. Landscape screens put the panels on the right.

| URL | What |
| --- | --- |
| `/` | Galaxy. First visit per session plays "While you were away", then a live moment arrives. |
| `/?recap=0` | Skip the recap (a live moment still arrives after ~4 s). Add `&arrive=0` to stop that too. |
| `/?level=week&week=3` | Open straight into a week (the hard week). |
| `/?level=day&day=6` | Open straight into a day (first hold). |
| `/?list=1` | The list view (screen-reader and "just the facts" fallback). |
| `/?lite=1` | Lighter shader path (fewer octaves, no front nebula layer, lower DPR). Auto-on for ≤4 cores. |
| `/?motion=reduced` | Reduced-motion behaviour without changing OS settings. |
| `/bedside` | Bedside display, 1280×800 landscape, amber night mode. |

The `…` menu has "How to read the sky", "While you were away" (replay), "Simulate a new moment" and the bedside display.

Regenerate the dataset with `node scripts/generate-stay.mjs` (seeded, so the output is stable).

## What's built

- **Galaxy → week → day → moment** as one camera through space. x/y ease, z eases in log space, `cubic-bezier(0.22, 1, 0.36, 1)`; UI fades in and drifts up after the camera lands (40 ms stagger).
- **Stars** (one instanced shader): core size = weight, brightness = how the day went (hard days dimmer and cooler, never dark), copper halo = time a parent was there, diffraction spikes = breathing support (more help, more and thinner spikes; they simplify as help drops), today pulses copper.
- **Nebula**: domain-warped fbm with relief lighting toward the stars, rendered to a low-res target with the real camera so parallax stays true, then upscaled. Front wisp layer fades out up close.
- **Day view**: the 24-hour ring (midnight at top, clockwise) with moments in three lanes; each moment type has its own shape and motion (feeds flow inward, voice notes orbit, procedures are a slow violet triangle). A copper hand marks "now" on today.
- **Moment sheet** with plain language, who was there, voice-note playback (silent, waveform only) and tappable terms ("what it is" + "why this matters for Arjun").
- **Live arrival**: a comet of light arcs in from the screen edge, slows, and is absorbed; the star ripples and swells, and a toast offers "See it".
- **While you were away**: a cinematic glide over the days since the last visit with narrator captions, then back to the galaxy.
- **Week panel**: chapter title, true-size comparison (hand vs baby, this week vs last), firsts, and "What was hard" with context, deliberately still.
- **List view**, keyboard (Esc, ←/→), pinch/wheel to zoom, swipe between days and weeks, 44 px targets, reduced motion.

## Known gaps / next

- Not yet measured on a real iPhone. The nebula is the main cost; `?lite=1` is the fallback.
- The reference image wasn't attached to the build, so the look was matched to the written brief.
- Clinical shape of the dataset (weights, support timeline, timing of firsts) and all glossary copy **need review by someone with NICU experience**.
- The true-size baby silhouette is a placeholder shape.
- Photo moments use an abstract placeholder; voice notes have no audio.
- R3F is pinned to 9.7.0; 9.8.x didn't mount its canvas under Next 15's bundled React in testing.

Design decisions are logged in `docs/decisions/2026-10-17-*.md` at the repo root.
