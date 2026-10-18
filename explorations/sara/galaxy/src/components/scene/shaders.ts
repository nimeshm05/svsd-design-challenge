// GLSL for the stellar nursery. Colours are passed in as linear THREE.Color uniforms.

export const noise2 = /* glsl */ `
vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

// ---------------------------------------------------------------- nebula
export const nebulaVert = /* glsl */ `
varying vec2 vP;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vP = w.xy;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const nebulaFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uScale;      // world → noise scale
uniform float uGalaxyScale;// world → galaxy coords (perspective compensation for depth)
uniform float uIntensity;
uniform float uWisp;       // 0 = dense back layer, 1 = thin front wisps
uniform vec3 uIndigo;
uniform vec3 uViolet;
uniform vec3 uPeri;
uniform vec3 uEmber;
uniform vec3 uCore;
varying vec2 vP;
${noise2}

float fbm(vec2 p){
  float s = 0.0, a = 0.55;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < OCTAVES; i++) { s += a * snoise(p); p = m * p + vec2(3.1, 1.7); a *= 0.47; }
  return s;
}
float ridged(vec2 p){
  float s = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < OCTAVES; i++) { float n = 1.0 - abs(snoise(p)); s += a * n * n; p = m * p + vec2(5.2, 1.3); a *= 0.5; }
  return s;
}

float density(vec2 p, vec2 q, float shape){
  float b = fbm(p + 1.1 * q);
  float d = smoothstep(-0.22, 0.9, b + shape);
  return pow(d, 1.8);
}

void main(){
  float t = uTime * 0.008;
  vec2 g = vP * uGalaxyScale;           // galaxy-space coordinates (≈ star layout)
  float rad = length(g);
  float ang = atan(-g.y, g.x);          // mirrored to match the clockwise day spiral
  vec2 p = vP * uScale;

  // gentle domain warp: billowing, not marbled
  vec2 q = vec2(fbm(p * 0.7 + vec2(0.0, t)), fbm(p * 0.7 + vec2(5.2, 1.3) - t * 0.6));

  // spiral-arm mask that follows r = a + bθ, the same curve the days sit on
  float phase = ang - (rad - 0.22) / 0.27;
  float arm = smoothstep(0.0, 1.0, 0.5 + 0.5 * cos(phase));
  float halo = exp(-rad * rad / 110.0);
  float centre = exp(-rad * rad / 8.0);
  float shape = 0.3 * arm * halo + 0.25 * centre + 0.02 - (1.0 - halo) * 0.35;

  float d = density(p, q, shape);
  // relief lighting: compare with the density a step toward the centre (where the stars are)
  vec2 toC = normalize(-g + 0.0001);
  float d2 = density(p + toC * 0.05, q, shape);
  float lit = clamp(0.5 + (d - d2) * 7.0, 0.0, 1.0);

  float grain = 0.75 + 0.25 * fbm(p * 3.1 + q * 2.0);
  d *= grain;

  vec3 col = mix(uIndigo * 0.5, uViolet * 0.75, lit * lit) * d;
  col += uPeri * pow(lit, 5.0) * d * 0.75;
  float fil = ridged(p * 2.6 + q * 1.5);
  col += mix(uPeri, uCore, 0.5) * pow(fil, 6.0) * d * 0.35 * (1.0 - uWisp * 0.5);
  col += uIndigo * 0.07 * halo * (1.0 - uWisp);   // faint ambient haze so space is never flat
  col += uEmber * centre * d * 0.18;               // warm stellar-nursery heart

  float a = mix(1.0, smoothstep(0.35, 0.95, fil), uWisp);
  gl_FragColor = vec4(col * a * uIntensity, 1.0);
}
`;

// ---------------------------------------------------------------- stars
export const starVert = /* glsl */ `
attribute vec3 aCenter;
attribute float aCore;     // core radius (world)
attribute float aSize;     // quad half size = spike length (world)
attribute float aBright;   // 0.55 (hard) … 1 (calm)
attribute float aWarm;     // parent presence 0..1
attribute float aLines;    // diffraction lines through the core (2..4)
attribute float aSpikeW;   // spike width (uv)
attribute float aSeed;
attribute float aToday;
attribute float aFocus;    // 0.15 .. 1
attribute float aPulse;    // 0..1 arrival reaction
attribute float aCool;     // 0..1 cooler tint for hard days
attribute float aPlanet;   // 1 = draw a tilted ring instead of spikes
varying vec2 vUv;
varying float vCore, vBright, vWarm, vLines, vSpikeW, vSeed, vToday, vFocus, vPulse, vCool, vHalo, vPlanet;
void main(){
  vec4 mv = modelViewMatrix * vec4(aCenter, 1.0);
  mv.xy += position.xy * aSize;
  vUv = position.xy;
  vCore = aCore / aSize;
  vHalo = (aCore * 2.2 + 0.035) / aSize;
  vBright = aBright; vWarm = aWarm; vLines = aLines; vSpikeW = aSpikeW; vSeed = aSeed;
  vToday = aToday; vFocus = aFocus; vPulse = aPulse; vCool = aCool; vPlanet = aPlanet;
  gl_Position = projectionMatrix * mv;
}
`;

export const starFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uAmber;
uniform vec3 uCoreCol;
uniform vec3 uViolet;
uniform vec3 uPeri;
uniform vec3 uEmber;
uniform vec3 uCopper;
varying vec2 vUv;
varying float vCore, vBright, vWarm, vLines, vSpikeW, vSeed, vToday, vFocus, vPulse, vCool, vHalo, vPlanet;
#define PI 3.14159265

float spike(vec2 uv, float a, float w, float len, float px){
  vec2 d = vec2(cos(a), sin(a));
  float t = abs(dot(uv, d)) / len;
  float p = abs(dot(uv, vec2(-d.y, d.x)));
  float ww = w * (1.0 - 0.8 * clamp(t, 0.0, 1.0));
  float wp = max(ww, px * 0.7);
  float e = ww / wp; // energy conservation when the spike is thinner than a pixel
  return exp(-(p * p) / (wp * wp)) * pow(max(1.0 - t, 0.0), 2.4) * e;
}

void main(){
  vec2 uv = vUv;
  float r = length(uv);
  if (r > 1.0) discard;
  float px = fwidth(r);

  // breathing shimmer at ~0.2 Hz
  float breath = 0.5 + 0.5 * sin(uTime * 1.2566 + vSeed * 6.2831);
  float B = vBright * (0.94 + 0.08 * breath);

  float cr = max(vCore * (1.0 + 0.18 * vPulse), px * 1.4);
  float core = exp(-pow(r / cr, 2.0) * 1.4);
  float inner = exp(-r / (cr * 1.6));
  float wide = exp(-r / (cr * 5.0));

  // JWST-style diffraction spikes. More breathing help → more, thinner spikes.
  float s = 0.0;
  if (vPlanet > 0.5) {
    // Saturn-style ring: a tilted ellipse around the core, hidden behind the planet on its far side
    float ca = cos(-0.42), sa = sin(-0.42);
    vec2 q = vec2(ca * uv.x - sa * uv.y, sa * uv.x + ca * uv.y);
    float ell = length(vec2(q.x, q.y / 0.32));
    float rw = max(cr * 0.32, px * 0.7);
    float ring = exp(-pow((ell - cr * 3.6) / rw, 2.0)) * (cr * 0.32 / rw);
    float behind = step(0.0, q.y) * smoothstep(cr * 1.5, cr * 1.1, r);
    s = ring * (1.0 - behind) * 0.9;
  } else {
    float rot = PI * 0.5;
    for (int i = 0; i < 4; i++) {
      if (float(i) >= vLines) break;
      s += spike(uv, rot + PI * float(i) / vLines, vSpikeW, 1.0, px);
    }
    // the two short horizontal struts of the classic 6+2 pattern (only on 3-line stars)
    if (abs(vLines - 3.0) < 0.1) s += 0.45 * spike(uv, 0.0, vSpikeW * 0.8, 0.45, px);
  }
  float along = clamp(r, 0.0, 1.0);
  vec3 spikeCol = mix(uCopper, uEmber, smoothstep(0.05, 0.7, along));

  // warm copper halo: a parent was here. Intensity = time spent.
  float todayPulse = vToday * (0.55 + 0.45 * breath);
  float warm = clamp(vWarm + todayPulse * 0.8, 0.0, 1.5);
  // halo sized in world units (vHalo), independent of the core
  float ringR = vHalo;
  float halo = exp(-pow((r - ringR) / (vHalo * 0.45), 2.0)) * 0.42 + exp(-pow(r / (vHalo * 0.9), 2.0)) * 0.22;

  // arrival ripple
  float ripR = cr * (2.0 + 14.0 * (1.0 - vPulse));
  float ripple = vPulse * exp(-pow((r - ripR) / (cr * 0.9), 2.0));

  vec3 coreCol = mix(uCoreCol, uPeri, vCool * 0.45);
  vec3 col = vec3(0.0);
  col += coreCol * core * 5.0 * B;
  col += mix(uViolet, uPeri, 0.5) * inner * 0.55 * B;
  col += uViolet * wide * 0.06 * B;
  col += spikeCol * s * 3.2 * B * (1.0 - vCool * 0.35);
  col += mix(uCopper, uEmber, 0.4) * halo * warm * 0.8;
  col += uCopper * ripple * 1.4;

  // bedside / night mode: everything in warm amber
  float lum = dot(col, vec3(0.3, 0.55, 0.15));
  col = mix(col, vec3(1.0, 0.55, 0.22) * lum, uAmber) * mix(1.0, 0.42, uAmber); // night light: dim

  col *= vFocus * smoothstep(1.0, 0.85, r);
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------------------------------------------------------- moments
export const momentVert = /* glsl */ `
attribute vec3 aCenter;
attribute float aSize;
attribute float aType;
attribute float aSeed;
attribute float aFirst;
attribute float aBorn;
uniform float uTime;
varying vec2 vUv;
varying float vType, vSeed, vFirst, vAge;
void main(){
  float age = clamp((uTime - aBorn) / 1.2, 0.0, 1.0);
  float grow = 1.0 - pow(1.0 - age, 3.0);
  vec4 mv = modelViewMatrix * vec4(aCenter, 1.0);
  float size = aSize * (aFirst > 0.5 ? 1.5 : 1.0) * mix(0.2, 1.0, grow);
  mv.xy += position.xy * size;
  vUv = position.xy;
  vType = aType; vSeed = aSeed; vFirst = aFirst; vAge = age;
  gl_Position = projectionMatrix * mv;
}
`;

export const momentFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uVisible;
uniform float uAmber;
uniform vec3 uCols[10];
varying vec2 vUv;
varying float vType, vSeed, vFirst, vAge;
#define PI 3.14159265

float sdBox(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }

void main(){
  vec2 uv = vUv;
  float r = length(uv);
  float px = fwidth(r) * 1.2;
  int T = int(vType + 0.5);
  float t = uTime + vSeed * 10.0;
  float breath = 0.5 + 0.5 * sin(t * 1.2566);
  float I = 0.0;     // intensity

  if (T == 0) {            // feed: soft warm disc, rings flowing inward
    I = exp(-r * r * 22.0) * 1.6;
    float ph = fract(-t * 0.18);
    float ringR = 0.25 + ph * 0.6;
    I += smoothstep(px * 2.0, 0.0, abs(r - ringR) - 0.01) * 0.5 * (1.0 - ph) * ph * 3.0;
  } else if (T == 1) {     // diaper: small bright diamond
    float d = abs(uv.x) + abs(uv.y);
    I = smoothstep(0.24 + px, 0.24 - px, d) * 1.4 + exp(-r * 8.0) * 0.3;
  } else if (T == 2) {     // skin-to-skin: copper halo bloom
    I = exp(-r * r * 6.0) * (0.55 + 0.2 * breath) + exp(-r * r * 45.0) * 1.2;
  } else if (T == 3) {     // cares: copper four-point spark
    float sx = exp(-abs(uv.y) * 40.0) * exp(-abs(uv.x) * 4.0);
    float sy = exp(-abs(uv.x) * 40.0) * exp(-abs(uv.y) * 4.0);
    I = (sx + sy) * 1.2 + exp(-r * r * 60.0) * 1.2;
  } else if (T == 4) {     // nurse note: white rounded square mote
    float d = sdBox(uv, vec2(0.16)) - 0.05;
    I = smoothstep(px, -px, d) * 1.2 + exp(-r * 6.0) * 0.2;
  } else if (T == 5) {     // photo: white square frame
    float d = abs(sdBox(uv, vec2(0.24)) - 0.02) - 0.025;
    I = smoothstep(px, -px, d) * 1.2 + exp(-r * r * 30.0) * 0.4;
  } else if (T == 6) {     // voice: hollow ring with an orbiting mote
    I = smoothstep(px * 1.5, 0.0, abs(r - 0.32) - 0.02) * 1.0;
    float a = t * 0.9;
    vec2 o = vec2(cos(a), sin(a)) * 0.32;
    I += exp(-dot(uv - o, uv - o) * 300.0) * 1.6;
  } else if (T == 7) {     // weight: disc with a ring ripple outward
    I = exp(-r * r * 26.0) * 1.3;
    float ph = fract(t * 0.12);
    I += smoothstep(px * 2.0, 0.0, abs(r - (0.2 + ph * 0.7)) - 0.008) * (1.0 - ph) * 0.8;
  } else if (T == 8) {     // breathing help change: tiny six-spike star
    float a = atan(uv.y, uv.x);
    float sp = pow(abs(cos(a * 3.0)), 40.0);
    I = exp(-r * 14.0 / (0.25 + 0.75 * sp)) * 1.4 + exp(-r * r * 60.0);
  } else {                 // procedure: soft violet triangle, calm slow flicker
    vec2 p = uv * 1.0; p.y += 0.06;
    float k = sqrt(3.0);
    p.x = abs(p.x) - 0.26; p.y = p.y + 0.26 / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -0.52, 0.0);
    float d = -length(p) * sign(p.y);
    I = smoothstep(px, -px, d) * (0.85 + 0.15 * sin(t * 0.8)) + exp(-r * 5.0) * 0.2;
  }

  // firsts get a named flare
  if (vFirst > 0.5) {
    float a = atan(uv.y, uv.x);
    I += exp(-r * 3.0) * 0.35 + pow(abs(cos(a * 2.0 + 0.785)), 60.0) * exp(-r * 4.0) * 0.6;
  }

  vec3 col = uCols[T] * I;
  float lum = dot(col, vec3(0.3, 0.55, 0.15));
  col = mix(col, vec3(1.0, 0.55, 0.22) * lum, uAmber);
  float entry = 1.0 + (1.0 - vAge) * 2.0; // flash on arrival
  gl_FragColor = vec4(col * uVisible * entry * smoothstep(1.0, 0.8, r), 1.0);
}
`;

// ---------------------------------------------------------------- points (dust, motes, flows)
export const dustVert = /* glsl */ `
attribute float aSize;
attribute float aSeed;
uniform float uTime;
uniform float uPixelRatio;
varying float vTw;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio * (18.0 / -mv.z + 0.6);
  vTw = 0.6 + 0.4 * sin(uTime * (0.4 + aSeed * 0.5) + aSeed * 40.0);
}
`;
export const dustFrag = /* glsl */ `
precision highp float;
uniform vec3 uCol;
varying float vTw;
void main(){
  float r = length(gl_PointCoord - 0.5);
  float a = exp(-r * r * 40.0);
  gl_FragColor = vec4(uCol * a * vTw, 1.0);
}
`;

export const orbitVert = /* glsl */ `
attribute vec3 aCenter;
attribute vec3 aOrbit;   // radius, speed, phase
uniform float uTime;
uniform float uPixelRatio;
varying float vA;
void main(){
  float a = aOrbit.z + uTime * aOrbit.y;
  vec3 p = aCenter + vec3(cos(a) * aOrbit.x, sin(a) * aOrbit.x * 0.92, sin(a) * 0.01);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * clamp(26.0 / -mv.z, 1.6, 9.0);
  vA = 0.75 + 0.25 * sin(a * 3.0);
}
`;
export const orbitFrag = /* glsl */ `
precision highp float;
uniform vec3 uCol;
uniform float uFade;
varying float vA;
void main(){
  float r = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(uCol * exp(-r * r * 30.0) * vA * uFade, 1.0);
}
`;

export const flowVert = /* glsl */ `
attribute vec3 aFrom;
attribute float aPhase;
uniform vec3 uTo;
uniform float uTime;
uniform float uPixelRatio;
varying float vA;
void main(){
  float ph = fract(uTime / 6.0 + aPhase);
  float e = ph * ph;                       // eases in toward the star
  vec3 p = mix(aFrom, uTo, e);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * clamp(14.0 / -mv.z, 1.0, 6.0) * (1.0 - e * 0.6);
  vA = sin(ph * 3.14159);
}
`;
export const flowFrag = /* glsl */ `
precision highp float;
uniform vec3 uCol;
uniform float uFade;
varying float vA;
void main(){
  float r = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(uCol * exp(-r * r * 26.0) * vA * uFade, 1.0);
}
`;

// constellation hairlines
export const lineVert = /* glsl */ `
attribute float aWeek;
attribute float aT;
uniform float uWeekAlpha[9];
varying float vA;
void main(){
  int w = int(aWeek + 0.5);
  float a = 0.0;
  for (int i = 0; i < 9; i++) if (i == w) a = uWeekAlpha[i];
  vA = a;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const lineFrag = /* glsl */ `
precision highp float;
uniform vec3 uCol;
varying float vA;
void main(){ gl_FragColor = vec4(uCol * vA, 1.0); }
`;
