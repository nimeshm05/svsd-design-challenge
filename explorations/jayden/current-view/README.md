# Current view (bedside)

**Owner:** Jayden · **Branch:** `explore/jayden/bedside-display` · **Status:** `exploring`

Built on a copy of Sara's star day view (`explorations/sara/star`, branch `explore/sara/star`): her data, event shapes, scan and sky. Her folder is unchanged.

## What it is

The bedside screen's main view: where today stands right now. It's minimal on purpose, low-light and read from the parent chair.

- **Home:** how she is right now (one large line), a link to today's updates ("Today · 3 updates" with the latest), the next care time, and today's forming star. Today's moments drift into the star and add light; tonight it joins her sky (Sara's view of past days).
- **Home C** (default; compare with A and B in the prototype bar): today's sky. The day is an arc across the whole screen, drawn like the v2 night sky: warm sparkles for changes, small stars for care times, soft rings for team decisions, faint twinkling background stars. Today's star glows at "now"; **dragging it back along the arc** (or the arrow keys) goes back through the day and snaps to moments, with a few soft words underneath. Personal moments stay on the parent's phone but still add light to the star. **"What's ahead ›"** sits at the end of the arc, where the day runs out; tapping it (or the dashed future) opens What's ahead.
- **What's ahead** (with Back): her care plans, kept separate from her sky but drawn in the same gentle way. Each area her team is working on (Breathing, Feeding, Staying warm) is a short path of stars: lit for steps reached, glowing for the step she's on, an outline for what's next, with the plan in one line and a soft status ("Decided", "Still being decided", "For now"). Beside it: what's coming up and checks waiting on a date. No going-home dates; a step back reads as "working on this again".
- **Home B** (default; switch with "Home A / Home B" in the prototype bar): her, always on screen, with the day's list beside her. Picking a moment that already happened, or dragging the scrubber under her (midnight to now, snapping to moments), shows her setup at that time: what was on her, what had just been added (highlighted) or taken off (a faint ghost). Only the scan and a fixed-height caption change, so nothing jumps. "Now" returns to how she is right now. Upcoming items are shown in the list but aren't buttons; next care shows what happens and what a parent can do right in the row.
- **Today so far** (full page, with Back next to her name). It keeps home's header and the "Ask for her nurse" button in the same place, so the change of page doesn't jump, but has its own layout:
  - **Left: the day as a short list**, one line each, in time order with a "Now" marker: what changed, team decisions (tagged Decided or Deciding), next care (glowing), later, and anything waiting on a date. Routine care is one quiet line underneath.
  - **Right: the selected item, shown visually.** A wire change shows on her body (Sara's scan) with a short plain explanation; a decision shows as a card with its status and where it came from; next care shows the time large, what a parent can do, and why care is grouped.
  - Text appears only for the item a parent picks, so the page never reads like a chart.
- **Moments** (holding, reading, firsts) are logged on the parent's phone. They don't appear on the bedside screen, but they add light to today's star.
- **Ask for her nurse:** shows her team right now, with one "Ask for help" action that goes to her nurse (the charge nurse covers if she's busy). Urgent help still goes through the nurse call button by her bed.

Night mode dims everything to the time, one line, the next care and the star. The bar above the screen is for the prototype only: calm vs. harder day, day vs. night, and opening her sky (which a parent would do from their phone).

Open questions:
- The brief said no touch, for infection control. The link and the button need a wipeable touch screen, or could move to the parent's phone.
- My copy of Sara's scan now draws a CPAP mask and can show her setup at any time of day (`present` and `changed`); worth folding back into Sara's version if the team keeps it.

## Why we tried it

To join the two ideas into one story: the bedside view shows today as it forms, and Sara's sky keeps each finished day as a memory.

## Run it

```bash
cd explorations/jayden/current-view
npm install
npm run dev
```

Open the address Vite prints. `?view=sky` opens straight to the sky.

## Log

- 2026-10-17: Copied Sara's app and added the current view with the forming star and day arc from `bedside-display/v3.html`.
- 2026-10-17: Simplified for the bedside: content in the parents' priority order, the forming star as the one storytelling element, the day arc removed, a harder-day version and night mode.
- 2026-10-17: Made it minimal: four things on screen, details moved into tap-to-open sheets, the daily star caption and nurse quote removed, Help and Ask for her nurse added.
- 2026-10-17: Today's updates moved to a full page with Back (all of today, not just the latest), wires overview on the scan, Help removed, team sheet reduced to one Ask for help action.
- 2026-10-17: Redesigned Today so far with a clear hierarchy: what changed, what the team decided (with status and source), then wires, routine care and next care. Moments moved to the phone.
- 2026-10-17: Today so far rebuilt as a single timeline (earlier → now → next → later) instead of stacked sections, with the next care time in the flow rather than in a side card.
- 2026-10-17: Today so far simplified: a one-line-per-item list on the left and the selected item shown visually on the right. Header and nurse button stay put between pages.
- 2026-10-17: Added Home B, a mirror of Today so far: her and her current status large on the left, the day's list on the right.
- 2026-10-17: Home B: the list updates the left panel in place instead of opening Today. Her scan shows only for wire changes, everywhere.
- 2026-10-17: Home B: baby always on screen with a scrubber through the day; her setup shown as it was at each moment; upcoming items no longer buttons. Scan copy learned CPAP.
- 2026-10-17: Added Home C: the day as an arc over her with today's star as the scrubber; care times now include feeds, diapers and sleep; phone moments appear on the arc.
- 2026-10-17: Home C: arc spans the full width, far fewer words, personal moments kept off the bedside screen (still feed the star).
- 2026-10-17: Home C stacked in one column: arc, then her with no background, then the words.
- 2026-10-17: Added What's ahead (care plans, separate from the sky), opened from the arc's future. Home C's baby is now 3D and draggable (three.js 0.160.0), with the flat drawing as a fallback.
- 2026-10-17: Dropped the 3D baby (it felt clinical and unsettling) and three.js. Home C's arc and What's ahead restyled in the warm v2 star style; "What's ahead" moved to the end of the arc.
- 2026-10-17: Warm star style everywhere. Home B and Home A's Today share one day view: Sara's baby drawing (no panel), a line of stars to scrub through, a fixed caption, and the day's list with star marks. Home C's arc and words no longer move.
