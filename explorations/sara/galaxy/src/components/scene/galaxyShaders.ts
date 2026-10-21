import { noise2 } from "./shaders";

// ---------------------------------------------------------------- the diffuse disk
export const diskVert = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = position.xy;            // plane is 2x2 in units of the radius
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const diskFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uPitch;
uniform float uPhase;
uniform float uSeed;
uniform float uBright;
uniform float uCool;
uniform float uWarm;
uniform float uCurrent;
uniform float uFocus;
uniform vec3 uCoreCol;   // pale gold
uniform vec3 uCopper;
uniform vec3 uArmCol;    // blue-white
uniform vec3 uHazeCol;   // deep blue
varying vec2 vUv;
${noise2}

float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * snoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}

void main(){
  vec2 uv = vUv;
  float r = length(uv);
  if (r > 1.0) discard;
  float th = atan(uv.y, uv.x + 1e-5); // atan(0,0) is NaN on some GPUs, and bloom would smear it everywhere
  float rn = max(r, 0.015);

  // two logarithmic arms with a slow differential sway: the inner galaxy turns a little more
  float sway = 0.05 * sin(uTime * 0.21 + uSeed) * (1.0 - 0.6 * r);
  float sp = th - sway - (uPhase + log(rn) / uPitch);
  float armWave = max(0.0, 0.5 + 0.5 * cos(2.0 * sp)); // pow() of a tiny negative is NaN
  float arm = pow(armWave, 2.6);
  float armSoft = pow(armWave, 0.9);

  // flocculent clumps: arms break into patches of young stars
  vec2 q = uv * 5.5 + uSeed;
  float clumps = smoothstep(-0.25, 0.75, fbm(q + vec2(uTime * 0.004, 0.0)));
  float fine = smoothstep(0.1, 0.9, fbm(uv * 16.0 + uSeed * 1.7));

  float disk = exp(-r / 0.38);
  float edge = smoothstep(1.0, 0.55, r);

  // dust lanes hug the inner edge of each arm
  float dustWave = pow(max(0.0, 0.5 + 0.5 * cos(2.0 * (sp - 0.42))), 7.0);
  float dust = dustWave * smoothstep(0.06, 0.28, r) * smoothstep(0.95, 0.4, r) * (0.55 + 0.45 * fbm(uv * 11.0 - uSeed));

  float bulge = exp(-r * r / 0.014);
  float inner = exp(-r / 0.13);

  // a parent's time warms the core toward copper; the current week breathes
  float breath = 0.5 + 0.5 * sin(uTime * 1.2566);
  vec3 core = mix(uCoreCol, uCopper, 0.25 + 0.5 * uWarm);
  vec3 armCol = mix(uArmCol, uHazeCol * 1.6, uCool * 0.35);

  vec3 col = vec3(0.0);
  float idle = 0.5 + 0.5 * sin(uTime * 0.5 + uSeed);  // every core breathes; this week's breathes deeper
  col += core * (bulge * 2.4 + inner * 0.7) * (0.92 + 0.12 * idle + uCurrent * 0.35 * breath);
  col += armCol * (armSoft * 0.3 + arm * (0.4 + 0.6 * clumps) * (0.55 + 0.45 * fine)) * disk * 2.6 * edge;
  col += uHazeCol * disk * 0.45 * edge;
  col *= 1.0 - dust * 0.75;
  col *= uBright * uFocus;
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------------------------------------------------------- resolved stars + star-forming knots
export const swarmVert = /* glsl */ `
attribute vec3 aCol;
attribute float aSize;
attribute float aSeed;
uniform float uTime;
uniform float uPixelRatio;
uniform float uFocus;
uniform float uGSeed;
varying vec3 vCol;
varying float vA;
void main(){
  // same differential sway as the disk, so stars stay on their arms
  float r = length(position.xy);
  float sway = 0.05 * sin(uTime * 0.21 + uGSeed) * (1.0 - 0.6 * r);
  float c = cos(sway), s = sin(sway);
  vec3 p = vec3(c * position.x - s * position.y, s * position.x + c * position.y, position.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = -mv.z;
  gl_PointSize = aSize * uPixelRatio * clamp(11.0 / d, 0.32, 2.6);
  float tw = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 50.0);
  vCol = aCol;
  vA = tw * uFocus;
}
`;

export const swarmFrag = /* glsl */ `
precision highp float;
varying vec3 vCol;
varying float vA;
void main(){
  float r = length(gl_PointCoord - 0.5);
  float a = exp(-r * r * 36.0) + exp(-r * r * 8.0) * 0.25;
  gl_FragColor = vec4(vCol * a * vA, 1.0);
}
`;

// ---------------------------------------------------------------- deep field: tiny background galaxies
export const smudgeVert = /* glsl */ `
attribute vec3 aCenter;
attribute vec4 aShape;   // size, axis ratio, angle, seed
attribute vec3 aCol;
varying vec2 vUv;
varying vec3 vCol;
varying float vSeed;
void main(){
  vec4 mv = modelViewMatrix * vec4(aCenter, 1.0);
  float c = cos(aShape.z), s = sin(aShape.z);
  vec2 p = position.xy * vec2(1.0, aShape.y);
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  mv.xy += p * aShape.x;
  vUv = position.xy;
  vCol = aCol;
  vSeed = aShape.w;
  gl_Position = projectionMatrix * mv;
}
`;
export const smudgeFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec3 vCol;
varying float vSeed;
void main(){
  float r = length(vUv);
  float a = exp(-r * r * 9.0) * 0.5 + exp(-r * r * 60.0) * 0.8;
  gl_FragColor = vec4(vCol * a * smoothstep(1.0, 0.7, r), 1.0);
}
`;
