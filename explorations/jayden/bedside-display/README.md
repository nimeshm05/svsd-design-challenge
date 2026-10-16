# Bedside Story (bedside display)

**Owner:** Jayden · **Branch:** `explore/jayden/bedside-display` · **Status:** `exploring`

## What it is

A calm, low-light display beside the parent chair in the baby's NICU room. It turns the baby's care into a daily story parents can follow. It updates automatically from charting, so nurses don't have to explain everything twice. The screen is view-only (no touch, for infection control) and always silent; parents interact through their phone.

**HMW:** How might we turn a baby's care into a story parents can follow, so they understand what's happening without adding to nurses' workload?

## Why we're trying it

Parents need to understand what's happening, who's who, and what's next. Nurses need to keep them informed without extra work. A shared screen in the room puts the story where parents already are, and nurses only confirm the auto-written summary with one tap.

## Wireframe

Lo-fi, clickable wireframe with synthetic data (a made-up baby, Mila, Day 23).

```bash
python3 -m http.server 8123 --directory explorations/jayden/bedside-display
```

Then open http://localhost:8123. Use the bar at the top to switch screens, modes, and day type.

- **Today's chapter:** summary, what changed since yesterday, milestone, next care time, "checked by" nurse line
- **Setup:** drawing of the incubator, each item labeled in plain language, new or removed since yesterday
- **Care team:** people and roles, plus each specialty's plan, with open items marked (dashed, not red)
- **Rounds:** questions added from the phone; answered ones are checked
- **Night mode:** very dim, just the time, next care, and one line of status
- **Away mode:** room number only, for privacy
- **Phone:** add a question for rounds; it appears on the display
- **Harder day:** the same screens on a day with a setback (back on CPAP, no milestone), so the tone holds up when things don't go well

Not built yet: the real 3D setup view, tapping setup items on the phone for details, and the daily summary for parents who aren't at the bedside.

## Open questions

- Where exactly is it mounted, and how readable is it from the chair at night?
- What does the nurse's one-tap confirm look like, and what if they don't get to it?
- Does "No milestone today. That's okay." feel kind or patronizing on a bad day?

## Log

- 2026-10-16: Created the exploration folder and branch.
- 2026-10-16: First wireframe: home (day/night/away), setup, care team, rounds, phone question flow, steady vs. harder day.
