# One navigation system for the bedside screen

**Question:** Navigation controls had drifted screen by screen: "back" lived in four places with four styles (a small chip top-left, a bordered pill bottom-left, plain text bottom-left, a chip jammed into the corner of the week/day/discharge views); button heights ranged from ~22px to 56px; icons were text glyphs (‹ › ☎ ✦ i) that sit on the baseline and never centre with their label. How should navigation work everywhere?

**Options considered**
1. Keep "back to Today" bottom-left (the earlier rule) and fix only sizes.
2. One system: back always top-left, page actions in a bottom bar, one button spec.

**Chose:** 2.

**The rules**
- Every page has a **top bar** and a **bottom bar** on the same inset from the screen edge (32px top/bottom, 40px sides), including her sky, a week, a day and the discharge mobile, which used to sit in the corner.
- **Top-left: back + title.** Back is always the same control and always names where it goes: ‹ Today, ‹ Mila's stars, ‹ Week 2. In a week or day, the ‹ › steppers sit right beside it.
- **Top-right: the corner action.** The clock + Care team, or the page's own action (Time to discharge!, Skip to mobile) in the same slot.
- **Bottom-left: secondary actions. Bottom-right: the one primary action** (What's ahead).
- **One button:** 36px tall with an invisible 44px hit area (small to look at, easy to tap), 14px medium label, 16px SVG icon, 6px icon–label gap, 3px less padding on the icon side so the pair looks optically centred. A first pass at 44px tall read as chunky on a calm, low-light screen. Variants change colour, never size: default (hairline cream border), primary (cream fill), icon-only (44px circle). Night and comfort-care modes keep the geometry and drop the light.
- **Icons are SVGs** from one set (`NavIcons.jsx`): same box, stroke and caps.
- Naming matches titles: the week view's back said "Her sky" while the screen it returns to is titled "Mila's stars". It now says Mila's stars.

**Why:** A parent glancing from the chair should find "back" in the same place on every screen, and nothing should jump between pages. Consistent height and inset also make the screen calmer, which matters more here than on most interfaces.

## Update: up and sideways look different (her sky)

**Problem:** In a week or a day, "‹ Week 2" (go up a level) sat right next to ‹ › (previous / next day). Three chevrons, two different jobs, so parents couldn't tell which was which.

**Chose:**
- **Up = a breadcrumb, top-left:** "Today / Mila's stars / Week 2 / Day 12". It shows where you are; tap any earlier step to go up. Slashes, not chevrons, so it never reads as previous/next. The current step is cream and not a link.
- **Sideways = a named pager, bottom-left:** "‹ Day 11 · Day 13 ›" (or weeks). Each side names its destination; the day before today reads "Today ›"; at an end, that side is dimmed.

**Rejected:** different icons on the same row (e.g. an up-arrow for back). Still three similar controls in one place; position and form together make the difference unmistakable.

## Update: "Mila's stars" becomes "Close"

**Chose:** The button that opens her sky (bottom-left on Today) is the same button that closes it. As her sky opens it morphs in place: the mini-sky icon shrinks out as an ✕ rotates in, the label cross-fades from "Mila's stars" to "Close", and the width animates between the two. Closing reverses it.

**Consequences:**
- Leaving her sky is always bottom-left, at every level (galaxy, week, day), so the breadcrumb no longer needs "Today". It starts at "Mila's stars" and appears only inside a week or day; at the top level the big "Mila's stars" title takes that corner.
- The week/day pager moved to the bottom centre of the sky area, clear of Close.

**Why:** The thing you tapped to go somewhere is the thing you tap to come back, in the same spot. Nothing to search for, and the transition explains itself.

## Update: dots and a swipe instead of ‹ › buttons

**Chose:** In a week or a day, moving sideways is a gesture, not a pair of buttons. A two-finger sideways swipe on the trackpad moves to the week or day before or after (swipe left for the next). Dots at the bottom centre show where you are (one per week in a week; one per day of this week in a day; the current one is a cream pill) and can be tapped. ← → still work, and so does dragging on a day.

**Details that matter:**
- One swipe = one step. A trackpad keeps sending scroll events as momentum; we count a step once, then wait for a short quiet gap.
- In a week, a mostly vertical two-finger scroll still pans, and pinch still zooms.
- You can't swipe out of her sky by accident: past the last day before today (or before day 1), a swipe does nothing. Closing is always the Close button.
- No dots when there's only one item to show.

## Update: pinch together = up one level, everywhere

**Chose:** On a trackpad (or a touch screen), pinching fingers together zooms out, and zooming out always means going up one level: a day → its week → Mila's stars; Today → Mila's stars (today becomes a star in her sky); What's ahead or Today so far → Today; the discharge mobile → Mila's stars. Spreading fingers still zooms in to look closer.

**Details:** one level per gesture, even for a long slow pinch that continues while the camera is flying (momentum is absorbed until the fingers stop). The browser's own page zoom is blocked over the screen, so a pinch never resizes the whole page instead.
