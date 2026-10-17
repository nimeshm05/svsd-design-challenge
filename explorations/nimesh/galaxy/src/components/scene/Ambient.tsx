"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/lib/store";
import { posOf, weekCount, weekPoints } from "@/lib/view";
import { C } from "./palette";
import { dustFrag, dustVert, lineFrag, lineVert, orbitFrag, orbitVert } from "./shaders";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Very sparse distant star dust, spread through depth for parallax. */
export function Dust({ count = 1400 }: { count?: number }) {
  const { gl } = useThree();
  const [geometry, material] = useMemo(() => {
    const r = rng(7);
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const near = i < count * 0.08;
      pos[i * 3] = (r() - 0.5) * (near ? 14 : 90);
      pos[i * 3 + 1] = (r() - 0.5) * (near ? 14 : 90);
      pos[i * 3 + 2] = near ? -1.5 - r() * 4 : -6 - r() * 26;
      size[i] = 0.6 + Math.pow(r(), 6) * 3.2;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uCol: { value: C.peri.clone().lerp(C.core, 0.5).multiplyScalar(0.55) } },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });
    return [g, m];
  }, [count]);
  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-5} />;
}

/** Family voice notes: tiny motes orbiting that day's star. */
export function VoiceMotes() {
  const days = useStore((s) => s.days);
  const { gl } = useThree();
  const [geometry, material] = useMemo(() => {
    const items: { c: [number, number, number]; o: [number, number, number] }[] = [];
    for (const d of days) {
      const voices = d.moments.filter((m) => m.type === "voice");
      voices.forEach((_, j) => {
        const r = 0.07 + j * 0.03;
        items.push({ c: posOf(d.dayIndex), o: [r, (0.35 + j * 0.12) * (d.dayIndex % 2 ? 1 : -1), d.dayIndex * 1.7 + j * 2.1] });
      });
    }
    const c = new Float32Array(items.length * 3);
    const o = new Float32Array(items.length * 3);
    items.forEach((it, i) => {
      c.set(it.c, i * 3);
      o.set(it.o, i * 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(items.length * 3), 3));
    g.setAttribute("aCenter", new THREE.BufferAttribute(c, 3));
    g.setAttribute("aOrbit", new THREE.BufferAttribute(o, 3));
    const m = new THREE.ShaderMaterial({
      vertexShader: orbitVert,
      fragmentShader: orbitFrag,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uCol: { value: new THREE.Color("#D6D2FF").multiplyScalar(1.4) }, uFade: { value: 1 } },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });
    return [g, m];
  }, [days]);
  useFrame((s, dt) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    const { level } = useStore.getState();
    const target = level === "day" ? 0.25 : 1;
    material.uniforms.uFade.value += (target - material.uniforms.uFade.value) * (1 - Math.exp(-dt * 3));
  });
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={3} />;
}

/** Hairlines joining each week's seven stars. */
export function Constellations() {
  const [geometry, material] = useMemo(() => {
    const pos: number[] = [];
    const wk: number[] = [];
    const t: number[] = [];
    for (let w = 1; w <= weekCount; w++) {
      const pts = weekPoints(w);
      for (let i = 0; i < pts.length - 1; i++) {
        // stop the hairline short of each star so it never touches the core
        const a = pts[i], b = pts[i + 1];
        const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
        const len = Math.hypot(dx, dy, dz);
        const gap = Math.min(0.09, len * 0.25) / len;
        pos.push(a[0] + dx * gap, a[1] + dy * gap, a[2] + dz * gap, b[0] - dx * gap, b[1] - dy * gap, b[2] - dz * gap);
        wk.push(w, w);
        t.push(0, 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute("aWeek", new THREE.BufferAttribute(new Float32Array(wk), 1));
    g.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(t), 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: lineVert,
      fragmentShader: lineFrag,
      uniforms: { uWeekAlpha: { value: new Array(9).fill(0.3) }, uCol: { value: C.peri } },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });
    return [g, m];
  }, []);
  useFrame((_, dt) => {
    const { level, week, recap } = useStore.getState();
    const arr = material.uniforms.uWeekAlpha.value as number[];
    const k = 1 - Math.exp(-dt * 3);
    for (let w = 0; w < 9; w++) {
      let target = 0.16;
      if (recap.active) target = 0.08;
      else if (level === "week") target = w === week ? 0.42 : 0.05;
      else if (level === "day") target = w === week ? 0.12 : 0.03;
      arr[w] += (target - arr[w]) * k;
    }
  });
  return <lineSegments geometry={geometry} material={material} frustumCulled={false} renderOrder={1} />;
}
