// 3D setup view for the bedside display. Loaded only when someone opens it, because it's the heaviest part.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

export function create({ state, items, esc, $, syncButtons }) {
  /* ---------------- Three.js scene: glowing tracing style ---------------- */
  const host = $("view3d");
  // If the browser can't do 3D (or the graphics card gives up), the rest of the screen must still work.
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (e) { console.warn("3D unavailable", e); }
  const no3d = () => host.insertAdjacentHTML("afterbegin", `<div class="no3d">The 3D view can't load in this browser right now.<br>
    Quit the browser completely and reopen it, then refresh this page.</div>`);
  if (renderer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    host.prepend(renderer.domElement);
    renderer.domElement.addEventListener("webglcontextlost", e => { e.preventDefault(); if (!host.querySelector(".no3d")) no3d(); });
    renderer.domElement.addEventListener("webglcontextrestored", () => host.querySelector(".no3d")?.remove());
  } else no3d();
  const labels = new CSS2DRenderer();
  Object.assign(labels.domElement.style, { position: "absolute", inset: "0", pointerEvents: "none" });
  host.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040b1f);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(2.2, 8.6, 6.4);
  const controls = renderer && new OrbitControls(camera, renderer.domElement);
  if (controls) {
    controls.target.set(-0.2, 1.7, 0);
    controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = 5; controls.maxDistance = 16; controls.maxPolarAngle = Math.PI * .48;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.5;
  }

  // Bloom makes every bright line glow.
  const composer = renderer && new EffectComposer(renderer);
  if (composer) {
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.35, 0.3));
    composer.addPass(new OutputPass());
  }

  const GLOW = 0xe3f7ff, CYAN = 0x6fd3ff, DEEP = 0x081738, FAINT = 0x2d63b3;
  const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });
  const V = a => new THREE.Vector3(...a);

  // Traced shape: a dark fill plus a slightly larger back-facing copy, which shows only as a glowing outline.
  // A faint wireframe inside gives the "nerve net" texture.
  function traced(geo, [x, y, z], parent, { rot = [0, 0, 0], scale = [1, 1, 1], line = GLOW, thick = 0.022, net = .05 } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(...rot); g.scale.set(...scale); parent.add(g);
    geo.computeBoundingSphere();
    const fill = new THREE.Mesh(geo, basic(DEEP)); fill.userData.fill = true;
    const hull = new THREE.Mesh(geo, basic(line, { side: THREE.BackSide }));
    hull.scale.setScalar(1 + thick / geo.boundingSphere.radius);
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: net }));
    wire.userData.fill = true;
    g.add(fill, hull, wire); return g;
  }
  function frame(geo, [x, y, z], opacity = .45, parent = scene) {
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: FAINT, transparent: true, opacity }));
    l.position.set(x, y, z); parent.add(l); return l;
  }
  const tube = (pts, r = 0.03, color = CYAN) =>
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V)), 90, r, 8), basic(color));
  // Glowing dot where something touches her, like the nodes in the reference.
  function node(p, parent, color = 0xffffff, r = 0.05) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), basic(color)); m.position.set(...p);
    m.userData.node = true; parent.add(m); return m;
  }

  // Background: a slow field of linked points.
  {
    const pts = [];
    for (let i = 0; i < 170; i++) {
      const r = 13 + Math.random() * 9, th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 1.6 - .6);
      pts.push(new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * .7 + 1.5, r * Math.sin(ph) * Math.sin(th)));
    }
    const dots = new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.PointsMaterial({ color: CYAN, size: .1, transparent: true, opacity: .7 }));
    const seg = [];
    pts.forEach((a, i) => pts.slice(i + 1).forEach(b => { if (a.distanceTo(b) < 4.2) seg.push(a, b); }));
    const links = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg),
      new THREE.LineBasicMaterial({ color: FAINT, transparent: true, opacity: .14 }));
    scene.add(dots, links);
  }

  // Incubator: drawn as faint blueprint lines so the baby stays the bright thing.
  frame(new THREE.BoxGeometry(0.5, 1.6, 0.5), [0, -0.6, 0], .3);
  frame(new THREE.BoxGeometry(4, 0.15, 2.4), [0, -1.4, 0], .3);
  frame(new THREE.BoxGeometry(7.2, 0.9, 3.8), [0, 0.45, 0], .4);
  frame(new THREE.BoxGeometry(6.4, 0.35, 3.2), [0, 1.07, 0], .55);
  frame(new THREE.BoxGeometry(7, 3.2, 3.6), [0, 2.5, 0], .5);
  [-1.8, 1.8].forEach(x => {
    const c = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 48 }, (_, i) => new THREE.Vector3(Math.cos(i / 48 * Math.PI * 2) * .5, Math.sin(i / 48 * Math.PI * 2) * .5, 0))),
      new THREE.LineBasicMaterial({ color: FAINT, transparent: true, opacity: .5 }));
    c.position.set(x, 2.3, 1.8); scene.add(c);
  });

  // Baby: one smooth surface from capsules joined with a soft blend (a signed distance field),
  // posed like a preemie on her back: hands up near her face, knees bent out ("frog legs").
  const BODY_C = new THREE.Vector3(-0.3, 1.8, 0), BODY_S = 2.7, RES = 90;
  const PARTS = [];
  const part = (a, b, ra, rb = ra) => PARTS.push({ a: V(a), b: V(b), ra, rb });
  const chain = pts => pts.slice(1).forEach((p, i) => part(pts[i].slice(0, 3), p.slice(0, 3), pts[i][3], p[3]));
  part([-2.0, 1.85, 0], [-2.2, 1.85, 0], .6, .53);                         // head
  [1, -1].forEach(s => part([-1.82, 1.8, .25 * s], [-1.82, 1.8, .25 * s], .28)); // cheeks
  part([-1.86, 2.4, 0], [-1.86, 2.4, 0], .07);                             // nose
  part([-1.6, 1.72, 0], [-1.25, 1.72, 0], .27);                            // neck
  chain([[-1.15, 1.75, 0, .48], [-0.35, 1.72, 0, .52], [0.2, 1.66, 0, .42]]); // chest, belly, hips
  [1, -1].forEach(s => {
    chain([[-1.05, 1.8, .42 * s, .17], [-0.7, 1.76, .88 * s, .14], [-1.2, 1.98, .7 * s, .12], [-1.48, 2.1, .5 * s, .12]]); // arm bent up
    part([-1.55, 2.13, .47 * s], [-1.55, 2.13, .47 * s], .14);             // fist
    chain([[0.25, 1.62, .28 * s, .22], [0.85, 1.85, .92 * s, .17], [1.25, 1.56, .62 * s, .13]]); // thigh, shin
    part([1.25, 1.52, .6 * s], [1.5, 1.5, .55 * s], .12, .11);              // foot
  });
  function sdf(x, y, z) {
    let d = 1e9;
    const p = new THREE.Vector3(x, y, z), ab = new THREE.Vector3(), ap = new THREE.Vector3();
    for (const { a, b, ra, rb } of PARTS) {
      ab.subVectors(b, a); ap.subVectors(p, a);
      const L = ab.lengthSq(), t = L ? Math.min(1, Math.max(0, ap.dot(ab) / L)) : 0;
      const di = ap.sub(ab.multiplyScalar(t)).length() - (ra + (rb - ra) * t);
      const k = .1, h = Math.min(1, Math.max(0, .5 + .5 * (di - d) / k)); // smooth union
      d = di * (1 - h) + d * h - k * h * (1 - h);
    }
    return d;
  }
  // Fill the marching-cubes grid with the distance field once; both meshes share it.
  const FIELD = (() => {
    const f = new Float32Array(RES ** 3), half = RES / 2;
    for (let k = 0; k < RES; k++) for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
      const x = BODY_C.x + (i - half) / half * BODY_S, y = BODY_C.y + (j - half) / half * BODY_S, z = BODY_C.z + (k - half) / half * BODY_S;
      f[i + j * RES + k * RES * RES] = 80 - sdf(x, y, z) * 400; // surface where field = 80
    }
    return f;
  })();
  // Marching cubes runs once on the CPU; only the triangles it made are sent to the graphics card.
  // (Adding the MarchingCubes object itself uploads huge empty buffers, which crashed the GPU.)
  const MC = new MarchingCubes(RES, new THREE.MeshBasicMaterial(), false, false, 60000);
  function metaBody(offset, material) {
    MC.isolation = 80 - offset * 400; // offset in world units pushes the surface outward evenly
    MC.field.set(FIELD); MC.update();
    const n = MC.count * 3, geo = new THREE.BufferGeometry();
    if (MC.count >= 60000 * 3) console.warn("Baby mesh hit its triangle budget; raise maxPolyCount");
    geo.setAttribute("position", new THREE.BufferAttribute(MC.positionArray.slice(0, n), 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(MC.normalArray.slice(0, n), 3));
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(BODY_C); mesh.scale.setScalar(BODY_S);
    return mesh;
  }
  // Fill: dark in the middle, glowing toward the edges (fresnel), so the form reads in 3D.
  const rimMat = new THREE.ShaderMaterial({
    uniforms: { base: { value: new THREE.Color(DEEP) }, rim: { value: new THREE.Color(0x8fdcff) } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 base; uniform vec3 rim; varying vec3 vN; varying vec3 vV;
      void main() { float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(mix(base, rim, f * .9), 1.); }`,
  });
  const baby = new THREE.Group(); scene.add(baby);
  baby.add(metaBody(0, rimMat));
  baby.add(metaBody(.03, basic(GLOW, { side: THREE.BackSide }))); // slightly bigger copy = outline
  // Soft traced details: closed eyes and a small mouth.
  const detail = pts => baby.add(tube(pts, .013, GLOW));
  [1, -1].forEach(s => detail([[-2.13, 2.43, .1 * s], [-2.09, 2.46, .19 * s], [-2.12, 2.43, .29 * s]]));
  detail([[-1.68, 2.36, -.07], [-1.65, 2.37, 0], [-1.68, 2.36, .07]]);

  // Monitor on a pole outside the incubator, where every wire ends.
  const PORT = [3.5, 2.0, -1.6];
  const monitor = new THREE.Group(); scene.add(monitor);
  frame(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 6), [4.6, 1.5, -2.2], .35, monitor);
  frame(new THREE.BoxGeometry(1.6, 1.05, 0.15), [4.6, 3.7, -2.1], .8, monitor);
  add(new THREE.PlaneGeometry(1.4, 0.85), basic(0x0d2a5c), 4.6, 3.7, -2.02, monitor);
  node(PORT, monitor, CYAN, .1);
  function add(geo, m, x, y, z, parent = scene) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; }

  // Each item is a group so it can be highlighted as one piece.
  const groups = {};
  function makeGroup(id, anchor) { const g = new THREE.Group(); g.userData.anchor = V(anchor); scene.add(g); groups[id] = g; return g; }

  { const g = makeGroup("cannula", [-2.4, 3.0, 0.7]);
    [1, -1].forEach(s => g.add(tube([[-1.84, 2.43, .05 * s], [-1.88, 2.42, .3 * s], [-1.98, 2.1, .62 * s], [-2.35, 1.65, .62 * s], [-2.75, 1.45, .2 * s], [-2.9, 1.42, 0]], 0.03)));
    g.add(tube([[-2.9, 1.42, 0], [-2.9, 1.4, -0.8], [0, 1.35, -1.5], [2.5, 1.5, -1.6], PORT], 0.035));
    node([-1.84, 2.43, .05], g); node([-1.84, 2.43, -.05], g); }
  { const g = makeGroup("cpap", [-1.9, 3.15, 0.5]);
    traced(new THREE.CapsuleGeometry(0.16, 0.2, 6, 16), [-1.86, 2.5, 0], g, { rot: [Math.PI / 2, 0, 0], line: CYAN, thick: .03, net: .15 });
    g.add(tube([[-1.86, 2.62, 0], [-1.9, 3.0, 0], [-1.4, 3.3, -0.7], [1.5, 2.7, -1.5], PORT], 0.06));
    node([-1.86, 2.62, 0], g); }
  { const g = makeGroup("tube", [-2.5, 3.2, -0.9]);
    g.add(tube([[-1.84, 2.43, 0], [-1.75, 2.62, -.12], [-1.85, 3.0, -0.7], [-2.0, 3.45, -1.35], [-1.7, 3.6, -1.6]], 0.022, 0x9ff0ff));
    traced(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16), [-1.7, 4.0, -1.6], g, { line: CYAN, thick: .03, net: .1 });
    node([-1.84, 2.44, 0], g, 0xffffff, .04); }
  { const g = makeGroup("leads", [-0.8, 2.9, 1.05]);
    [[-1.05, .24], [-1.05, -.24], [-0.4, .3]].forEach(([x, z], i) => {
      node([x, 2.27, z], g, 0xffffff, .06);
      g.add(tube([[x, 2.28, z], [x + 0.3, 2.42, z * 1.5], [0.6, 2.2, -0.95 - i * .08], [2.4, 1.7, -1.5], PORT], 0.018));
    }); }
  { const g = makeGroup("temp", [0.3, 2.85, -0.8]);
    node([-0.25, 2.29, -.12], g, 0xffffff, .06);
    g.add(tube([[-0.25, 2.3, -.12], [0.2, 2.4, -0.5], [1.2, 1.95, -1.2], [2.6, 1.7, -1.6], PORT], 0.018)); }
  { const g = makeGroup("pulseox", [1.95, 2.3, 0.95]);
    traced(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 20), [1.42, 1.5, 0.55], g, { rot: [0, 0, Math.PI / 2], line: CYAN, thick: .025, net: .1 });
    node([1.42, 1.5, 0.74], g, 0xffb3a8, .05); // the soft light on her foot
    g.add(tube([[1.55, 1.5, 0.55], [2.1, 1.45, 0.5], [2.9, 1.6, -0.7], PORT], 0.018)); }
  { const g = makeGroup("iv", [-1.7, 2.95, 1.1]);
    g.add(tube([[-1.5, 2.25, .55], [-1.15, 2.6, .95], [0.4, 2.9, 1.5], [1.8, 3.2, 1.4], [3.0, 3.3, 0.6], PORT], 0.02));
    node([-1.5, 2.25, .55], g); }
  groups.monitor = monitor; monitor.userData.anchor = V([4.6, 4.5, -2.1]);

  // Remember original colors so highlight/ghost states can be reset.
  Object.values(groups).forEach(g => g.traverse(o => {
    if (o.material) o.userData.base = { color: o.material.color.clone(), opacity: o.material.opacity };
  }));
  const labelEls = {};
  Object.entries(groups).forEach(([id, g]) => {
    const div = document.createElement("div"); div.className = "lbl";
    div.onclick = () => select(id);
    const obj = new CSS2DObject(div); obj.position.copy(g.userData.anchor); scene.add(obj);
    labelEls[id] = { div, obj };
  });

  const WHITE = new THREE.Color(0xffffff);
  // Parents who've been here a while know the usual wires, so by default only what changed is called out.
  const shown = () => state.focus === "new" ? items().filter(i => i.status !== "same") : items();
  function applyState() {
    const list = items(), focus = shown(), act = focus[state.active % Math.max(focus.length, 1)];
    Object.entries(groups).forEach(([id, g]) => {
      const it = list.find(i => i.id === id);
      g.visible = !!it;
      if (!it) { labelEls[id].obj.visible = false; return; }
      const inFocus = focus.some(f => f.id === id), removed = it.status === "removed", on = act && act.id === id;
      g.userData.on = on;
      labelEls[id].obj.visible = state.focus === "new" ? inFocus : on;
      const fade = removed ? .15 : on ? 1 : state.focus === "new" ? (inFocus ? .6 : .12) : .22;
      g.traverse(o => {
        const b = o.userData.base; if (!b) return;
        o.material.transparent = fade < 1 || b.opacity < 1;
        o.material.opacity = b.opacity * fade;
        o.material.depthWrite = fade === 1;
        o.material.color.copy(on && !o.userData.fill ? b.color.clone().lerp(WHITE, .35) : b.color);
      });
      const d = labelEls[id].div;
      d.className = `lbl ${it.status} ${on ? "on" : ""}`;
      d.innerHTML = `${it.status !== "same" ? `<span class="tag ${it.status}">${it.status === "new" ? "NEW" : "REMOVED"}</span>` : ""}${esc(it.name)}`;
    });
    $("caption").innerHTML = act ? `<b>${esc(act.name)}</b><span>${esc(act.plain)}</span>`
      : `<b>Nothing new today</b><span>Everything is the same as yesterday.</span>`;
    const leg = document.querySelector(".legend3d");
    if (leg) leg.innerHTML = (state.focus === "new" ? `<li class="head">What's new since yesterday</li>` : "")
      + focus.map((i, n) => `<li data-id="${i.id}" class="${i.status} ${n === state.active % focus.length ? "on" : ""}">
      <b>${i.status !== "same" ? `<span class="tag ${i.status}">${i.status === "new" ? "NEW" : "REMOVED"}</span>` : ""}${esc(i.name)}</b><span>${esc(i.plain)}</span></li>`).join("")
      + (state.focus === "new" ? `<li class="rest">Everything else is the same as yesterday.</li>` : "");
  }
  function select(id) {
    if (!shown().some(i => i.id === id)) state.focus = "all";
    const idx = shown().findIndex(i => i.id === id); if (idx < 0) return;
    state.active = idx; lastStep = performance.now(); syncButtons(); applyState();
  }

  // Tour: on a no-touch screen, the display walks through each item by itself.
  let lastStep = performance.now();
  function size() {
    const r = host.getBoundingClientRect(); if (!r.width) return;
    labels.setSize(r.width, r.height);
    if (renderer) { renderer.setSize(r.width, r.height); composer.setSize(r.width, r.height); }
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(host);
  function frame3d(t) {
    if (host.hidden) return;
    if (shown().length > 1 && t - lastStep > 5000) { state.active = (state.active + 1) % shown().length; lastStep = t; applyState(); }
    // The highlighted item's touch points breathe slowly.
    const pulse = 1 + .35 * (.5 + .5 * Math.sin(t / 450));
    Object.values(groups).forEach(g => g.traverse(o => { if (o.userData.node) o.scale.setScalar(g.userData.on ? pulse : 1); }));
    if (!renderer) return;
    controls.update(); composer.render(); labels.render(scene, camera);
  }
  if (renderer) renderer.setAnimationLoop(frame3d);
  else (function tick(t) { frame3d(t); requestAnimationFrame(tick); })(0); // keep the tour and captions moving
  $("loading3d")?.remove();
  return { applyState, size, select, resetTour: () => { lastStep = performance.now(); } };
}
