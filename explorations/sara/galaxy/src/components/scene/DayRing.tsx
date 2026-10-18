"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { stay, toMinutes } from "@/lib/data";
import { momentOffset, RING_RADIUS, timeAngle } from "@/lib/layout";
import { useStore } from "@/lib/store";
import type { Day } from "@/lib/types";
import { posOf } from "@/lib/view";
import { C, momentCols, momentSize, momentTypes } from "./palette";
import { flowFrag, flowVert, momentFrag, momentVert } from "./shaders";

/** Visible amount of the day layer: 1 when looking at a single day. */
function useDayVisibility() {
  const v = useRef(0);
  useFrame((_, dt) => {
    const { level, recap } = useStore.getState();
    const target = level === "day" || recap.active ? 1 : 0;
    v.current += (target - v.current) * (1 - Math.exp(-dt * (target ? 2.2 : 5)));
  });
  return v;
}

export function DayRing({ amber = 0, dayOverride }: { amber?: number; dayOverride?: number }) {
  const focusedDay = useStore((s) => s.day);
  const dayIndex = dayOverride ?? focusedDay;
  const days = useStore((s) => s.days);
  const day = days.find((d) => d.dayIndex === dayIndex) as Day;
  const vis = useDayVisibility();
  const forceVisible = dayOverride != null;
  const center = posOf(dayIndex);
  const { clock, gl } = useThree();
  const seen = useRef(new Set<string>());

  // ---- moment particles
  const momentMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: momentVert,
        fragmentShader: momentFrag,
        uniforms: { uTime: { value: 0 }, uVisible: { value: 0 }, uAmber: { value: amber }, uCols: { value: momentCols } },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
      }),
    [amber],
  );
  const momentGeo = useMemo(() => {
    const base = new THREE.PlaneGeometry(2, 2);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute("position", base.getAttribute("position"));
    const n = day.moments.length;
    const c = new Float32Array(n * 3), size = new Float32Array(n), type = new Float32Array(n), seed = new Float32Array(n), first = new Float32Array(n), born = new Float32Array(n);
    day.moments.forEach((m, i) => {
      const o = momentOffset(m);
      c.set([center[0] + o[0], center[1] + o[1], center[2] + 0.001], i * 3);
      size[i] = momentSize[m.type];
      type[i] = momentTypes.indexOf(m.type);
      seed[i] = (toMinutes(m.time) % 97) / 97;
      first[i] = m.first ? 1 : 0;
      const isNew = m.id.endsWith("-live") && !seen.current.has(m.id);
      born[i] = isNew ? clock.elapsedTime : -100;
    });
    day.moments.forEach((m) => seen.current.add(m.id));
    g.setAttribute("aCenter", new THREE.InstancedBufferAttribute(c, 3));
    g.setAttribute("aSize", new THREE.InstancedBufferAttribute(size, 1));
    g.setAttribute("aType", new THREE.InstancedBufferAttribute(type, 1));
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 1));
    g.setAttribute("aFirst", new THREE.InstancedBufferAttribute(first, 1));
    g.setAttribute("aBorn", new THREE.InstancedBufferAttribute(born, 1));
    g.instanceCount = n;
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, dayIndex]);

  // ---- feeds flow inward to the core
  const flowMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: flowVert,
        fragmentShader: flowFrag,
        uniforms: { uTime: { value: 0 }, uTo: { value: new THREE.Vector3() }, uPixelRatio: { value: 1 }, uFade: { value: 0 }, uCol: { value: new THREE.Color("#FFC9A8").multiplyScalar(1.1) } },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
      }),
    [],
  );
  const flowGeo = useMemo(() => {
    const feeds = day.moments.filter((m) => m.type === "feed");
    const per = 3;
    const from = new Float32Array(feeds.length * per * 3);
    const phase = new Float32Array(feeds.length * per);
    feeds.forEach((m, i) => {
      const o = momentOffset(m);
      for (let k = 0; k < per; k++) {
        from.set([center[0] + o[0], center[1] + o[1], center[2]], (i * per + k) * 3);
        phase[i * per + k] = k / per + i * 0.13;
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(feeds.length * per * 3), 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, dayIndex]);

  // ---- the 24-hour ring with hour ticks
  const ringGeo = useMemo(() => {
    const pts: number[] = [];
    const seg = 192;
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      pts.push(Math.cos(a0) * RING_RADIUS, Math.sin(a0) * RING_RADIUS, 0, Math.cos(a1) * RING_RADIUS, Math.sin(a1) * RING_RADIUS, 0);
    }
    for (let h = 0; h < 24; h++) {
      const a = Math.PI / 2 - (h / 24) * Math.PI * 2;
      const r0 = RING_RADIUS * (h % 6 === 0 ? 0.93 : 0.965);
      const r1 = RING_RADIUS * (h % 6 === 0 ? 1.07 : 1.035);
      pts.push(Math.cos(a) * r0, Math.sin(a) * r0, 0, Math.cos(a) * r1, Math.sin(a) * r1, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, []);
  const ringMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: amber ? new THREE.Color("#FF9A4A") : C.peri, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }),
    [amber],
  );

  // ---- "now" hand for today
  const isToday = dayIndex === stay.today.dayIndex;
  const nowGeo = useMemo(() => new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3)), []);
  const nowMat = useMemo(() => new THREE.LineBasicMaterial({ color: C.copper, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }), []);
  const startMinutes = useRef(toMinutes(stay.today.nowTime));
  const startClock = useRef<number | null>(null);

  useEffect(() => () => momentGeo.dispose(), [momentGeo]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const v = forceVisible ? 1 : vis.current;
    momentMat.uniforms.uTime.value = t;
    momentMat.uniforms.uVisible.value = v;
    flowMat.uniforms.uTime.value = t;
    flowMat.uniforms.uFade.value = v * (useStore.getState().reducedMotion ? 0 : 1);
    flowMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    (flowMat.uniforms.uTo.value as THREE.Vector3).set(center[0], center[1], center[2]);
    ringMat.opacity = v * 0.32;
    nowMat.opacity = isToday ? v * 0.85 : 0;
    if (isToday) {
      if (startClock.current == null) startClock.current = t;
      const minutes = startMinutes.current + (t - startClock.current) / 60;
      const a = timeAngle(`${Math.floor(minutes / 60)}:${Math.floor(minutes % 60)}`);
      const p = nowGeo.getAttribute("position") as THREE.BufferAttribute;
      p.setXYZ(0, Math.cos(a) * RING_RADIUS * 0.5, Math.sin(a) * RING_RADIUS * 0.5, 0);
      p.setXYZ(1, Math.cos(a) * RING_RADIUS * 1.48, Math.sin(a) * RING_RADIUS * 1.48, 0);
      p.needsUpdate = true;
    }
  });

  return (
    <group>
      <group position={center}>
        <lineSegments geometry={ringGeo} material={ringMat} renderOrder={1} frustumCulled={false} />
        <lineSegments geometry={nowGeo} material={nowMat} renderOrder={1} frustumCulled={false} />
      </group>
      <points geometry={flowGeo} material={flowMat} frustumCulled={false} renderOrder={3} />
      <mesh geometry={momentGeo} material={momentMat} frustumCulled={false} renderOrder={4} />
    </group>
  );
}
