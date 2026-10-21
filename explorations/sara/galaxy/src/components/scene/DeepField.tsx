"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { smudgeFrag, smudgeVert } from "./galaxyShaders";
import { makeStarMaterial } from "./Stars";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const starVert = /* glsl */ `
attribute vec3 aCol;
attribute float aSize;
attribute float aSeed;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vCol;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio;
  vCol = aCol * (0.8 + 0.2 * sin(uTime * (0.3 + aSeed * 0.6) + aSeed * 40.0));
}`;
const starFrag = /* glsl */ `
precision highp float;
varying vec3 vCol;
void main(){
  float r = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(vCol * (exp(-r * r * 40.0) + exp(-r * r * 10.0) * 0.15), 1.0);
}`;

const STAR_COLS = ["#FFFFFF", "#DCE6FF", "#B9CCFF", "#FFE9C9", "#FFD2A0", "#FFFFFF", "#E8EEFF"].map((h) => new THREE.Color(h));

/**
 * The deep field the galaxies hang in: thousands of faint stars of different colours,
 * a few bright foreground stars with diffraction spikes, and tiny far-off galaxies.
 * Spread through depth so camera moves have real parallax.
 */
export function DeepField({ lite }: { lite: boolean }) {
  const { gl } = useThree();

  const [stars, starMat] = useMemo(() => {
    const r = rng(42);
    const n = lite ? 1800 : 3600;
    const pos = new Float32Array(n * 3), cols = new Float32Array(n * 3), size = new Float32Array(n), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([(r() - 0.5) * 120, (r() - 0.5) * 120, -12 - r() * 50], i * 3);
      const c = STAR_COLS[Math.floor(r() * STAR_COLS.length)];
      const b = 0.25 + Math.pow(r(), 4) * 1.2;
      cols.set([c.r * b, c.g * b, c.b * b], i * 3);
      size[i] = 1.2 + Math.pow(r(), 5) * 3.5;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aCol", new THREE.BufferAttribute(cols, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: starVert,
      fragmentShader: starFrag,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });
    return [g, m];
  }, [lite]);

  // a handful of bright foreground stars with spikes, like the reference photograph
  const [bright, brightMat] = useMemo(() => {
    const r = rng(7);
    const n = 9;
    const base = new THREE.PlaneGeometry(2, 2);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute("position", base.getAttribute("position"));
    const a = (k: number) => new Float32Array(n * k);
    const center = a(3), core = a(1), size = a(1), b = a(1), warm = a(1), lines = a(1), sw = a(1), seed = a(1), today = a(1), focus = a(1), pulse = a(1), cool = a(1);
    for (let i = 0; i < n; i++) {
      center.set([(r() - 0.5) * 30, (r() - 0.5) * 50, -6 - r() * 10], i * 3);
      core[i] = 0.03 + r() * 0.03;
      size[i] = 0.7 + r() * 0.9;
      b[i] = 0.5 + r() * 0.35;
      lines[i] = 3;
      sw[i] = 0.006;
      seed[i] = r();
      focus[i] = 0.75;
      cool[i] = r() < 0.5 ? 0.6 : 0;
    }
    const set = (k: string, d: Float32Array, s: number) => g.setAttribute(k, new THREE.InstancedBufferAttribute(d, s));
    set("aCenter", center, 3);
    set("aCore", core, 1);
    set("aSize", size, 1);
    set("aBright", b, 1);
    set("aWarm", warm, 1);
    set("aLines", lines, 1);
    set("aSpikeW", sw, 1);
    set("aSeed", seed, 1);
    set("aToday", today, 1);
    set("aFocus", focus, 1);
    set("aPulse", pulse, 1);
    set("aCool", cool, 1);
    g.instanceCount = n;
    return [g, makeStarMaterial(0)];
  }, []);

  // tiny far-off galaxies
  const [smudges, smudgeMat] = useMemo(() => {
    const r = rng(99);
    const n = lite ? 16 : 34;
    const base = new THREE.PlaneGeometry(2, 2);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute("position", base.getAttribute("position"));
    const center = new Float32Array(n * 3), shape = new Float32Array(n * 4), cols = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      center.set([(r() - 0.5) * 80, (r() - 0.5) * 90, -18 - r() * 30], i * 3);
      shape.set([0.25 + r() * 0.5, 0.25 + r() * 0.6, r() * Math.PI, r()], i * 4);
      const c = r() < 0.5 ? new THREE.Color("#FFE0B8") : new THREE.Color("#BFD0FF");
      const k = 0.25 + r() * 0.3;
      cols.set([c.r * k, c.g * k, c.b * k], i * 3);
    }
    g.setAttribute("aCenter", new THREE.InstancedBufferAttribute(center, 3));
    g.setAttribute("aShape", new THREE.InstancedBufferAttribute(shape, 4));
    g.setAttribute("aCol", new THREE.InstancedBufferAttribute(cols, 3));
    g.instanceCount = n;
    const m = new THREE.ShaderMaterial({
      vertexShader: smudgeVert,
      fragmentShader: smudgeFrag,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });
    return [g, m];
  }, [lite]);

  useFrame((s) => {
    starMat.uniforms.uTime.value = s.clock.elapsedTime;
    starMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    brightMat.uniforms.uTime.value = s.clock.elapsedTime;
  });

  return (
    <>
      <points geometry={stars} material={starMat} frustumCulled={false} renderOrder={-6} />
      <mesh geometry={smudges} material={smudgeMat} frustumCulled={false} renderOrder={-5} />
      <mesh geometry={bright} material={brightMat} frustumCulled={false} renderOrder={-4} />
    </>
  );
}
