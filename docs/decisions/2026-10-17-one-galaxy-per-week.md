# One galaxy per week (instead of one galaxy for the whole stay)

**Question:** In the first version the whole stay was one spiral galaxy and each week was a constellation inside it. Should a week be a constellation, or a galaxy of its own?

**Options considered**
1. One galaxy for the whole stay, weeks as constellations along its spiral (first version, branch `visual-exploration-galaxy`).
2. One realistic spiral galaxy per week, floating in a deep field. Tap a galaxy to fly inside; its seven days are bright stars joined into a constellation along one arm.

**Chose:** 2 (branch `visual-exploration-week-galaxies`), to compare side by side with 1.

**Why:**
- A week is a big, self-contained chapter for NICU parents. A whole galaxy gives each chapter its own identity and room to carry meaning, where a seven-star constellation is small and easy to miss.
- The top level reads instantly as "how far we've come": a column of galaxies from the first week (top, further back) to this week (bottom, biggest and closest).
- Realistic galaxies, modelled on a photograph of a face-on spiral (golden core, bluish flocculent arms, dust lanes, rose star-forming knots), feel alive and premium, and "stellar nurseries" become literal: the rose knots are the week's firsts.

**What each galaxy encodes**

| Data | Visual |
| --- | --- |
| Average weight that week | Galaxy size (they grow down the screen) |
| This week | Biggest, closest, breathing core |
| Time a parent was there | Core warms from pale gold toward copper |
| Firsts | More rose star-forming knots in the arms |
| A harder week | Softer and a little bluer. Never dark |
| Days | Bright foreground stars tracing one arm from core outward, joined as a constellation |

**Trade-offs:** The days are no longer visible from the top level (only today's star is), so "find a specific day" is now one tap deeper. The list view covers that.

**Implementation notes:** Each galaxy is a tilted disk (procedural arms, bulge, dust lanes) plus ~4,200 resolved stars and rose knots as points, sharing a slow differential sway so it feels alive while the day-stars stay on their arm. We also found a real cross-GPU bug while doing this: `pow()` of a negative base (and `atan(0, 0)`) produced NaNs that bloom smeared across the whole frame on non-Metal GPUs. Both shaders now avoid them.
