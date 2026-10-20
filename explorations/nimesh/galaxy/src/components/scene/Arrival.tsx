"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { stay } from "@/lib/data";
import { momentOffset } from "@/lib/layout";
import { useStore } from "@/lib/store";
import { bezier, posOf } from "@/lib/view";

const TRAIL = 40;
const DURATION = 3200;

const vert = /* glsl */ `
attribute float aAlpha;
attribute float aSize;
uniform float uPixelRatio;
varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio;
  vA = aAlpha;
}`;
const frag = /* glsl */ `
precision highp float;
uniform vec3 uHead;
uniform vec3 uTail;
varying float vA;
void main(){
  float r = length(gl_PointCoord - 0.5);
  float core = exp(-r * r * 60.0);
  float glow = exp(-r * r * 14.0) * 0.5 * smoothstep(0.5, 0.3, r);
  vec3 col = mix(uTail, uHead, vA) * (core * 2.4 + glow);
  gl_FragColor = vec4(col * vA, 1.0);
}`;

/**
 * The signature interaction: a new moment travels in from the edge of the screen
 * as a mote of light with a soft comet tail, slows as it nears today's star, and is
 * absorbed. The star answers with a ring ripple and a brief swell of its core.
 */
export function Arrival() {
  const arrival = useStore((s) => s.arrival);
  const { camera, gl, size } = useThree();
  const path = useRef<{ a: THREE.Vector3; c: THREE.Vector3; b: THREE.Vector3; key: number } | null>(null);

  const [geometry, material] = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(TRAIL), 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(TRAIL), 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: { uPixelRatio: { value: 1 }, uHead: { value: new THREE.Color("#FFF1E6").multiplyScalar(1.6) }, uTail: { value: new THREE.Color("#FF6A3D") } },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });
    return [g, m];
  }, []);

  useFrame(() => {
    const st = useStore.getState();
    const a = st.arrival;
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    const alpha = geometry.getAttribute("aAlpha") as THREE.BufferAttribute;
    const sz = geometry.getAttribute("aSize") as THREE.BufferAttribute;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (!a) {
      path.current = null;
      for (let i = 0; i < TRAIL; i++) alpha.setX(i, 0);
      alpha.needsUpdate = true;
      return;
    }
    const center = posOf(stay.today.dayIndex);
    if (!path.current || path.current.key !== a.startedAt) {
      // start just outside the top-right edge, on the plane of today's star
      const ndc = new THREE.Vector3(1.15, 0.92, 0.5).unproject(camera);
      const dir = ndc.sub(camera.position).normalize();
      const t = (center[2] - camera.position.z) / dir.z;
      const start = camera.position.clone().add(dir.multiplyScalar(t));
      // if we're looking at today, land on the moment's place on the ring
      const landOnRing = st.level === "day" && st.day === stay.today.dayIndex;
      const off = landOnRing ? momentOffset(a.moment) : [0, 0, 0];
      const end = new THREE.Vector3(center[0] + off[0] * 0.2, center[1] + off[1] * 0.2, center[2]);
      const mid = start.clone().lerp(end, 0.5);
      const d = end.clone().sub(start);
      const perp = new THREE.Vector3(-d.y, d.x, 0).normalize().multiplyScalar(d.length() * 0.32);
      path.current = { a: start, c: mid.add(perp), b: end, key: a.startedAt };
    }
    const { a: p0, c: p1, b: p2 } = path.current;
    const raw = (performance.now() - a.startedAt) / (st.reducedMotion ? 600 : DURATION);
    const at = (u: number) => {
      const e = bezier(0.45, 0.05, 0.18, 1, Math.min(1, Math.max(0, u)));
      const k = 1 - e;
      return new THREE.Vector3(
        k * k * p0.x + 2 * k * e * p1.x + e * e * p2.x,
        k * k * p0.y + 2 * k * e * p1.y + e * e * p2.y,
        k * k * p0.z + 2 * k * e * p1.z + e * e * p2.z,
      );
    };
    const pxScale = Math.min(size.height, 900) / 844;
    for (let i = 0; i < TRAIL; i++) {
      const u = raw - i * 0.011;
      const v = at(u);
      pos.setXYZ(i, v.x, v.y, v.z);
      const head = 1 - i / TRAIL;
      const fadeIn = Math.min(1, Math.max(0, u * 6));
      const absorb = raw > 0.92 ? Math.max(0, 1 - (raw - 0.92) / 0.08) : 1;
      alpha.setX(i, u < 0 ? 0 : head * head * fadeIn * absorb);
      sz.setX(i, (i === 0 ? 26 : 4 + 14 * head * head) * pxScale);
    }
    pos.needsUpdate = alpha.needsUpdate = sz.needsUpdate = true;
    if (raw >= 1) st.completeArrival();
  });

  if (!arrival) return null;
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={6} />;
}
