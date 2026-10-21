# Render the nebula at ~40% resolution

**Question:** The domain-warped fbm nebula is the most expensive thing on screen. How do we keep it rich and still aim for 60 fps on a phone?

**Options considered**
1. Pre-baked nebula texture, drifted with UV offsets. Cheap, but goes blurry when the camera zooms 12×, and parallax is fake.
2. Full-resolution procedural shader. Looks best, but billions of noise evaluations per second at 3× DPR.
3. Procedural shader rendered into a low-resolution target **with the real camera**, then upscaled behind the stars.

**Chose:** 3 (40% resolution; 28% plus fewer octaves and no foreground layer on the lite path).

**Why:** Gas is soft; nobody can see the difference at 40%. Stars, spikes and type stay full resolution and crisp, which keeps the "huge, slow atmosphere vs tiny precise UI" contrast. Rendering with the real camera keeps true perspective parallax between the two nebula depths and the stars.

**Also:** the foreground wisp layer fades out as the camera gets close (it goes soft and plasticky when magnified), and the whole nebula steps back to ~45% brightness in the day view so moments stay legible.
