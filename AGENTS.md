# AGENTS.md

Instructions for AI coding agents (and humans) working in this repo. Read this before making any change.

## Project in one paragraph

A storytelling product for parents of very preterm babies (born before 32 weeks) in the NICU. It turns a preemie's numbers into a story parents can feel: true size, growth over time, corrected age, and what the baby senses in the NICU environment. Built by a team of 3 for the "Search for Top Young Design Talent" challenge. **Submission (video, max 7 min) is due Mon Oct 19, 2026, 11:59 PM PT.** Every decision should serve a working, demoable prototype by then.

## Team

| Person | GitHub handle | Exploration folder |
| --- | --- | --- |
| Nimesh | nimeshm05 | explorations/nimesh/ |
| Jayden | jaydehnajun-jpg | explorations/jayden/ |
| Sara | sarachong02 | explorations/sara/ |

Agents: find out whose machine you're on (`git config user.name`) and work in that person's space.

## Branching model

```
main                          ← shared, always runs, always demoable
├── explore/<name>/<idea>     ← personal, divergent, messy is fine
└── feat/<topic>              ← converged work headed to main
```

- **`main`** is protected in spirit: never commit or push to it directly. It must always build and run, because any of us may record the demo from it.
- **`explore/<name>/<idea>`** (e.g. `explore/nimesh/true-size-ar`) is for trying ideas. Only its owner pushes to it. Work only inside `explorations/<name>/` on these branches, so explorations never conflict.
- **`feat/<topic>`** (e.g. `feat/size-scrubber`) is for work the team agreed to bring into the main prototype in `app/`. Anyone can open one.
- **Merging into `main`** happens only through a pull request with at least one teammate's approval. Use **squash merge**. Delete the branch after merging (explorations can stay if you want them for the video).
- **Promoting an exploration:** when the team picks an idea, create a `feat/` branch from `main` and port the idea into `app/`. Don't merge an `explore/` branch wholesale.

### Daily routine

1. `git fetch origin && git switch <your-branch>`
2. Sync with main: `git rebase origin/main` (or `git merge origin/main` if you've already shared the branch and others pulled it).
3. Work, commit small, push often.
4. Before ending a session, push and add a line to your exploration's `README.md` (see below).

## Folder structure

```
app/                     ← the one converged prototype (what we demo)
explorations/<name>/     ← each person's experiments; one subfolder per idea
research/                ← interview notes, competitive analysis, references
docs/decisions/          ← decision log (one file per decision)
data/                    ← synthetic baby datasets used by prototypes
assets/                  ← shared illustrations, fonts, video clips
video/                   ← script, storyboard, recording notes
```

## Rules for agents

**Before editing**
- Run `git status` and `git branch --show-current`. If you are on `main`, stop and create or switch to a branch first.
- Pull the latest for your branch before starting.
- Don't edit another person's `explorations/<name>/` folder. Copy what you need into your own.

**While working**
- Keep commits small and focused. Use Conventional Commit messages: `feat:`, `fix:`, `design:`, `docs:`, `chore:`, `research:`.
- Don't add a dependency to `app/` without noting it in the PR description. Explorations can use anything.
- Don't reformat files you didn't otherwise change; it creates merge conflicts.
- Never `git push --force` to `main` or to anyone else's branch. `--force-with-lease` on your own branch is fine.
- Never rewrite history that's already on `main`.

**Data and content safety (non-negotiable)**
- Use **synthetic data only**. Never commit real patient data, medical records, or photos of real babies without written consent from the family.
- No API keys or secrets in the repo. Use `.env.local` (gitignored) and keep `.env.example` updated.
- The product must not make medical claims, diagnoses, or rank a baby against others by percentile. Copy explains; it doesn't advise.
- Tone: tender and honest. Design for setbacks and for a baby who doesn't go home; never assume a happy ending in copy or code paths.

**When you finish a chunk**
- Update `explorations/<name>/<idea>/README.md` with: what it is, why we tried it, status (`exploring` / `promising` / `dropped`), and a screenshot or GIF if visual.
- If you made a design decision (chose one approach over another), add `docs/decisions/YYYY-MM-DD-short-title.md` with: the question, options considered, what we chose, why. **These feed the video**, which is judged on the decisions we made along the way.

## Pull requests

- Title: Conventional Commit style, e.g. `feat: true-size scrubber on home screen`.
- Description: what changed, why, how to see it (route or steps), and a screenshot or screen recording for anything visual.
- One teammate approves. The author merges.
- Keep PRs small enough to review in 10 minutes.

## Timeline and freezes (all times PT)

| When | What |
| --- | --- |
| Fri Oct 16 | Research, interviews, explorations start |
| Sat Oct 17 | Explorations; team picks direction by end of day |
| Sun Oct 18 | Build converged prototype in `app/` |
| **Mon Oct 19, 6:00 PM** | **Code freeze on `main`.** Only fixes needed for recording. |
| Mon Oct 19, 11:59 PM | Video submitted |

After the freeze, agents should not merge anything into `main` unless a teammate explicitly asks.

## Running the project

`TODO: fill in once the stack is chosen` (install command, dev server command, where to open it).
