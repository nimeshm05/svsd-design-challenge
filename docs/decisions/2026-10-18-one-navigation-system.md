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
- **One button:** 44px tall (a comfortable touch target), 15px medium label, 18px SVG icon, 8px icon–label gap, 4px less padding on the icon side so the pair looks optically centred. Variants change colour, never size: default (hairline cream border), primary (cream fill), icon-only (44px circle). Night and comfort-care modes keep the geometry and drop the light.
- **Icons are SVGs** from one set (`NavIcons.jsx`): same box, stroke and caps.
- Naming matches titles: the week view's back said "Her sky" while the screen it returns to is titled "Mila's stars". It now says Mila's stars.

**Why:** A parent glancing from the chair should find "back" in the same place on every screen, and nothing should jump between pages. Consistent height and inset also make the screen calmer, which matters more here than on most interfaces.
