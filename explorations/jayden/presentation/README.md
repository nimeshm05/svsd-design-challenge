# Mila's Sky: case study presentation

A presentation built as a website, in design system 1 (Night Nursery). Status: **exploring**.

**Why:** the case study is told in the product's own language. The night sky behind every slide drifts a little with each step and warms to the color of the pillar being told (Connection gold, Comprehension blue, Awareness lilac). Along the bottom, her constellation grows one star per slide, with a planet at the start of each section. Content rises in, the hook's quote arrives word by word, the problem statement underlines each pillar in its color, and the product slide holds the real bedside prototype, live, in an iPad frame.

**Run it**

```
npm install
npm run dev
```

Open http://127.0.0.1:5180. `npm run dev` first builds `../current-view` into `public/prototype/` (the iPad's screen), so `../current-view` needs its own `npm install` once.

**Present:** → or space to go on, ← to go back, Home / End. Some slides build inside themselves (the three pillars arrive one at a time; the "How might we" question adds one pillar per press). Each slide has its own address (`#1` … `#27`). After clicking inside the iPad, click outside it again before using the arrow keys.

**The story:** NICU parents live two things at once, the fight and the celebration, and Mila's Sky is a place that holds both. The deck opens on that tension and closes on it. In between, each chapter opens on a realization said big, with one phrase lit, followed by its evidence or what we did about it (after the storytelling in Jayden's portfolio deck):
1. **Research:** research showed how the NICU affects families, but not how parents make sense of it → we asked 4 people → what's said isn't what's heard → both sides of that conversation.
2. **The problem:** it came down to three things → the pillars, one at a time → the problem statement → the question, built pillar by pillar.
3. **The idea:** every day becomes a star → pain point, principle, feature → for each pillar, what we learned (a statement) and then what we did.
4. **Constraints:** three people to protect at every bedside → the table.
5. **The story layer:** stars never disappear → constellation, stars and planets, naming.
6. **At her bedside:** the live prototype, each chapter tagged with the pillars it shows → "Mila's Sky holds both" → thank you.

**To fill in:** the Privacy row in Constraints. The overview copy was written from the rest of the outline; check it with the team.
