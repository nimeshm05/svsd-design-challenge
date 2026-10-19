# Mila's Sky: case study presentation

A presentation built as a website, in design system 1 (Night Nursery). Status: **exploring**.

**Why:** the case study is told in the product's own language. The night sky behind every slide drifts a little with each step and warms to the color of the pillar being told (Connection gold, Comprehension blue, Awareness lilac). Along the bottom, her constellation grows one star per slide, with a planet at the start of each section. Content rises in, the hook's quote arrives word by word, the problem statement underlines each pillar in its color, and the product slide holds the real bedside prototype, live, in an iPad frame.

**Run it**

```
npm install
npm run dev
```

Open http://127.0.0.1:5180. `npm run dev` first builds `../current-view` into `public/prototype/` (the iPad's screen), so `../current-view` needs its own `npm install` once.

**Present:** → or space to go on, ← to go back, Home / End. Some slides build inside themselves (the three pillars arrive one at a time; the "How might we" question adds one pillar per press). Each slide has its own address (`#1` … `#29`). After clicking inside the iPad, click outside it again before using the arrow keys.

**The story:** NICU parents live two things at once, the fight and the celebration, and Mila's Sky is a place that holds both. The deck opens on that tension and closes on it. In between, each chapter opens on a realization said big, with one phrase lit, followed by its evidence or what we did about it (after the storytelling in Jayden's portfolio deck):
0. **The NICU:** what it is → inside it, in four senses (sound, light, touch, space), from our secondary research (8 studies and standards).
1. **Research:** the NICU environment shapes how babies develop, how nurses work and how parents cope → but it didn't tell us how parents make sense of it → we asked 4 people → what's said isn't what's heard → both sides of that conversation.
2. **The problem:** it came down to three things → the pillars, one at a time → the problem statement (each pillar's star flies into its phrase) → the question, built pillar by pillar.
3. **Design principles:** each pain point became a principle.
4. **Ideation:** our real affinity map → its ideas float to the principle each one serves → what they had in common: turning her care into a story.
5. **The idea and the story layer:** every day becomes a star → stars never disappear → constellation, stars and planets, naming.
6. **Constraints:** three people to protect at every bedside → the table → a tired mom in a hospital bed (the team chat message) → touch, remote or gesture, sketched.
7. **At her bedside:** the live prototype, each chapter tagged with the pillars it shows → "Mila's Sky holds both" → thank you.

The per-pillar "what we learned / what we did" slides are out for now; their content is still in `slides.jsx` (`DEEP`).

**Real work:** `public/shots/` holds screenshots of our research board, our affinity map and the team chat message that started the modality question; the deck shows them as they were. The modality slide sketches touch, remote control and gesture by hand-drawn SVG.

**To fill in:** the Privacy row in Constraints. The overview copy was written from the rest of the outline; check it with the team.
