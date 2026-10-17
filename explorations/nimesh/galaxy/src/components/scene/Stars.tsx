"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { stay } from "@/lib/data";
import { coreSize } from "@/lib/layout";
import { useStore } from "@/lib/store";
import type { Day, Support } from "@/lib/types";
import { posOf } from "@/lib/view";
import { C } from "./palette";
import { starFrag, starVert } from "./shaders";

// More breathing help → more, thinner spikes. Spikes simplify as the baby needs less help.
const spikeSpec: Record<Support, { lines: number; w: number; len: number }> = {
  ventilator: { lines: 4, w: 0.0042, len: 0.64 },
  cpap: { lines: 3, w: 0.0058, len: 0.6 },
  "high-flow": { lines: 3, w: 0.0075, len: 0.5 },
  "low-flow": { lines: 2, w: 0.0095, len: 0.42 },
  "room-air": { lines: 2, w: 0.013, len: 0.32 },
};
const brightness = { calm: 1, mixed: 0.82, hard: 0.64 } as const; // hard days dimmer, never dark
const cool = { calm: 0, mixed: 0.35, hard: 1 } as const;

export function starAttributes(d: Day) {
  const s = spikeSpec[d.support];
  const b = brightness[d.mood];
  const growth = 1 + Math.max(0, d.weightGrams - 900) / 2200;
  return {
    // day stars live inside a galaxy now, so they are smaller foreground jewels
    core: coreSize(d.weightGrams) * 0.75,
    size: s.len * (0.78 + 0.22 * b) * growth * 0.62,
    bright: b,
    warm: Math.min(1, d.parentMinutes / 210),
    lines: s.lines,
    spikeW: s.w,
    cool: cool[d.mood],
  };
}

export function makeStarMaterial(amber = 0) {
  return new THREE.ShaderMaterial({
    vertexShader: starVert,
    fragmentShader: starFrag,
    uniforms: {
      uTime: { value: 0 },
      uAmber: { value: amber },
      uCoreCol: { value: C.core },
      uViolet: { value: C.violet },
      uPeri: { value: C.peri },
      uEmber: { value: C.ember },
      uCopper: { value: C.copper },
    },
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true,
  });
}

export function makeStarGeometry(days: Day[], pos: (d: Day) => [number, number, number], todayIndex: number) {
  const base = new THREE.PlaneGeometry(2, 2);
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index;
  g.setAttribute("position", base.getAttribute("position"));
  const n = days.length;
  const arr = (k: number) => new Float32Array(n * k);
  const center = arr(3), core = arr(1), size = arr(1), bright = arr(1), warm = arr(1), lines = arr(1), spikeW = arr(1), seed = arr(1), today = arr(1), focus = arr(1), pulse = arr(1), coolA = arr(1);
  days.forEach((d, i) => {
    const p = pos(d);
    center.set(p, i * 3);
    const a = starAttributes(d);
    core[i] = a.core;
    size[i] = a.size;
    bright[i] = a.bright;
    warm[i] = a.warm;
    lines[i] = a.lines;
    spikeW[i] = a.spikeW;
    seed[i] = (Math.sin(d.dayIndex * 91.7) * 0.5 + 0.5) % 1;
    today[i] = d.dayIndex === todayIndex ? 1 : 0;
    focus[i] = 1;
    coolA[i] = a.cool;
  });
  const set = (name: string, data: Float32Array, k: number, dynamic = false) => {
    const attr = new THREE.InstancedBufferAttribute(data, k);
    if (dynamic) attr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute(name, attr);
  };
  set("aCenter", center, 3);
  set("aCore", core, 1);
  set("aSize", size, 1);
  set("aBright", bright, 1);
  set("aWarm", warm, 1);
  set("aLines", lines, 1);
  set("aSpikeW", spikeW, 1);
  set("aSeed", seed, 1);
  set("aToday", today, 1);
  set("aFocus", focus, 1, true);
  set("aPulse", pulse, 1, true);
  set("aCool", coolA, 1);
  g.instanceCount = n;
  return g;
}

export function Stars() {
  const days = useStore((s) => s.days);
  const material = useMemo(() => makeStarMaterial(0), []);
  const geometry = useMemo(() => {
    const g = makeStarGeometry(days, (d) => posOf(d.dayIndex), stay.today.dayIndex);
    // day stars start hidden (only today shows) and fade in when you enter a galaxy
    const f = g.getAttribute("aFocus") as THREE.InstancedBufferAttribute;
    days.forEach((d, i) => (f.array[i] = d.dayIndex === stay.today.dayIndex ? 0.8 : 0));
    return g;
  }, [days]);

  useFrame((s, dt) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    const { level, week, day, pulse, recap } = useStore.getState();
    const focus = geometry.getAttribute("aFocus") as THREE.InstancedBufferAttribute;
    const pul = geometry.getAttribute("aPulse") as THREE.InstancedBufferAttribute;
    const k = 1 - Math.exp(-dt * 3.2);
    const now = performance.now();
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      let target = d.dayIndex === stay.today.dayIndex ? 0.8 : 0;
      if (recap.active) target = d.dayIndex === day ? 1 : d.week === week ? 0.3 : 0;
      else if (level === "week") target = d.week === week ? 1 : 0;
      else if (level === "day") target = d.dayIndex === day ? 1 : 0.1;
      focus.array[i] += (target - focus.array[i]) * k;
      pul.array[i] = pulse && pulse.day === d.dayIndex ? Math.max(0, 1 - (now - pulse.at) / 2600) : 0;
    }
    focus.needsUpdate = true;
    pul.needsUpdate = true;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />;
}
