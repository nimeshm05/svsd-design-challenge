# One continuous camera instead of pages

**Question:** Galaxy, week, day and moment are four levels. Pages with transitions, or one space?

**Chose:** One 3D space and one camera. Every level is a camera position; nothing cuts.

**How:** x/y interpolate with `cubic-bezier(0.22, 1, 0.36, 1)` and z interpolates in log space, so a 12× zoom feels as even as a 2× one. Duration scales with how far we travel (900–1400 ms). Each level has a "focus rect" so the subject sits above the bottom panel on phones and left of the side panel on wide screens. UI only enters once the camera has mostly landed (fade + 7 px drift, 40 ms stagger). Depth layers (nebula far, dust through depth, stars mid, UI near) give real parallax for free.

**Reduced motion:** the camera jumps and the screen does a soft 450 ms dip instead of flying.

**Why:** Parents lose all sense of time in the NICU. Moving *through* the stay, rather than paging between screens, keeps a day connected to its week and the week to the whole journey.
