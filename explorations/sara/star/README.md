# Star

**Status:** exploring

## What it is

A "sky" of the baby's NICU days. Each day is a star, and special moments (like the first skin-to-skin with Dad) become planets. Opening a day shows a gentle summary first: what changed, how each part of the day went, and who was there. Below that, "More detail" sections hold the full record: the care team by shift, a timeline of every entry, the medicines and why she gets each one, and conversations with space for the parent's own notes. Separate layouts for desktop (modal) and phone (bottom sheet).

## Why we tried it

Charts give parents numbers and jargon. This tries to turn one day of hospital records into something a parent can take in at a glance, while keeping every detail one tap away for when they want it. Plain-language explanations sit next to the chart wording so parents can follow conversations with the team.

All content is synthetic. Values in `[brackets]` are placeholders for chart data.

## Run it

```
cd explorations/sara/star
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173). Narrow the window or use DevTools device mode to see the phone layout.

## Log

- 2026-10-17: Ported the star/planet day view from the design file. "More detail" sections now open inside the same box as their header.
