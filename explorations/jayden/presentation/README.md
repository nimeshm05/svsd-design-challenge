# Mila's Sky: case study presentation

A presentation built as a website, in design system 1 (Night Nursery). Status: **exploring**.

**Why:** the case study is told in the product's own language. The night sky behind every slide drifts a little with each step and warms to the color of the pillar being told (Connection gold, Comprehension blue, Awareness lilac). Along the bottom, her constellation grows one star per slide, with a planet at the start of each section. Content rises in, the hook's quote arrives word by word, the problem statement underlines each pillar in its color, and the product slide holds the real bedside prototype, live, in an iPad frame.

**Run it**

```
npm install
npm run dev
```

Open http://127.0.0.1:5180. `npm run dev` first builds `../current-view` into `public/prototype/` (the iPad's screen), so `../current-view` needs its own `npm install` once.

**Present:** → or space to go on, ← to go back, Home / End. Some slides build inside themselves (the three pillars arrive one at a time; the "How might we" question adds one pillar per press). Each slide has its own address (`#1` … `#33`). Press **O** (or "Overview ↗" in the top bar) to open the story overview in its own window: every slide as a thumbnail with a label, grouped by chapter. It follows the deck, and clicking a thumbnail moves the deck there. You can also open it directly at `?panel=1`.. After clicking inside the iPad, click outside it again before using the arrow keys.

**The story:** NICU parents live two things at once, the fight and the celebration, and Mila's Sky is a place that holds both. The deck opens on that tension and closes on it. In between, each chapter opens on a realization said big, with one phrase lit, followed by its evidence or what we did about it (after the storytelling in Jayden's portfolio deck):
0. **The NICU:** what it is → inside it, in four senses (sound, light, touch, space), from our secondary research (8 studies and standards).
1. **Research:** the NICU environment shapes how babies develop, how nurses work and how parents cope → but it didn't tell us how parents make sense of it → we asked 4 people → what's said isn't what's heard → both sides of that conversation.
2. **The problem:** it came down to three things → the pillars, one at a time → the problem statement (each pillar's star flies into its phrase) → competitive analysis (patient portals, NICU webcams, baby journals against the three pillars, laid out like the COLORFUL project's) → the question, built pillar by pillar.
3. **Design principles:** each pain point became a principle.
4. **Ideation:** our real affinity map, with the ideas we pulled from it floating over it as chips → the same chips fly from their spots on the map to the principle each one serves → what they had in common: turning her care into a story.
5. **The idea and the story layer:** every day becomes a star, in three beats (her day as scattered moments → they gather and burst into one star → it settles into place as her whole stay lights up, week by week) → stars never disappear → constellation, stars and planets, naming.
6. **Constraints:** three people to protect at every bedside → the table → a tired mom in a hospital bed (the team chat message) → touch, remote or gesture, sketched.
7. **The product, along her stay:** a storyboard of six sketched moments on one thread → four slides, one per stretch of time (Day 1, Day 23, night and looking back, the end of her stay). Each holds its features as steps: the live prototype jumps to that feature (`mila:show` messages), and beside it, the pillar and principle it answers, why, and the research quote; the storyboard scene stays in the corner → "Mila's Sky holds both" → thank you.

The per-pillar "what we learned / what we did" slides are out for now; their content is still in `slides.jsx` (`DEEP`).

**Symbols:** the baby, nurse and parent, and the three pillars (a heart, an open book, a clock), are line symbols in DS1's style with a small star accent (`Icon` in `src/glyphs.jsx`). They appear on the interviews, the chat bubbles, the pillars, principles, competitive analysis, the constraints opener and table; each pillar's symbol is what flies into the problem statement.

**Real work:** `public/shots/` holds screenshots of our research board, our affinity map and the team chat message that started the modality question; the deck shows them as they were. The modality slide sketches touch, remote control and gesture by hand-drawn SVG.

**To check:** the competitive analysis columns and our takes were written by Claude from general knowledge of those product types; confirm them with the team's own competitor research.

**To fill in:** the Privacy row in Constraints. The overview copy was written from the rest of the outline; check it with the team.
