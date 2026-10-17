"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Vec3 } from "@/lib/layout";
import { useStore } from "@/lib/store";
import { easeCamera, viewFor } from "@/lib/view";
import { sceneRefs } from "./refs";

type Tween = { from: Vec3; to: Vec3; t0: number; dur: number };

/**
 * One continuous camera through space. x/y ease linearly, z eases in log space so a
 * 12× zoom feels as even as a 2× one. cubic-bezier(0.22, 1, 0.36, 1) everywhere.
 */
export function CameraRig() {
  const { camera, size } = useThree();
  const get = useThree((s) => s.get);
  useEffect(() => {
    // dev-only: lets a headless/minimised browser render a frame on demand for screenshots
    if (process.env.NODE_ENV !== "production") (window as unknown as { __r3f: typeof get }).__r3f = get;
  }, [get]);
  const tween = useRef<Tween | null>(null);
  const lastKey = useRef("");
  const base = useRef(new THREE.Vector3());
  const first = useRef(true);

  useEffect(() => {
    sceneRefs.camera = camera as THREE.PerspectiveCamera;
  }, [camera]);

  useFrame((s) => {
    const st = useStore.getState();
    const aspect = size.width / size.height;
    const target = viewFor(st.cine ? "cinematic" : st.level, st.week, st.day, aspect);
    const key = target.map((v) => v.toFixed(3)).join(",");
    const now = performance.now();

    if (first.current) {
      // opening shot: start further out and drift in
      first.current = false;
      base.current.set(target[0] * 0.6, target[1] * 0.6 - 2, target[2] * (st.reducedMotion ? 1 : 1.9));
    }

    if (key !== lastKey.current) {
      const from: Vec3 = [base.current.x, base.current.y, base.current.z];
      const zoom = Math.abs(Math.log(target[2] / from[2]));
      const pan = Math.hypot(target[0] - from[0], target[1] - from[1]) / Math.max(target[2], from[2]);
      let dur = 900 + Math.min(500, zoom * 210 + pan * 400);
      if (st.cine) dur = 2600;
      if (lastKey.current === "") dur = 2600;
      if (st.reducedMotion) dur = 0;
      tween.current = { from, to: target, t0: now, dur };
      lastKey.current = key;
      if (st.settled) st.setSettled(false);
    }

    const tw = tween.current;
    if (tw) {
      const p = tw.dur ? Math.min(1, (now - tw.t0) / tw.dur) : 1;
      const e = easeCamera(p);
      base.current.set(
        tw.from[0] + (tw.to[0] - tw.from[0]) * e,
        tw.from[1] + (tw.to[1] - tw.from[1]) * e,
        Math.exp(Math.log(tw.from[2]) + (Math.log(tw.to[2]) - Math.log(tw.from[2])) * e),
      );
      // UI may enter a little before the camera fully stops
      if (p > 0.82 && !useStore.getState().settled) st.setSettled(true);
      if (p >= 1) tween.current = null;
    }

    // slow breathing drift (~10 s loop), scaled to the current zoom. Stillness when reduced.
    const t = s.clock.elapsedTime;
    const z = base.current.z;
    const amp = st.reducedMotion ? 0 : 0.0035 * z;
    camera.position.set(base.current.x + Math.sin(t * 0.21) * amp, base.current.y + Math.cos(t * 0.17) * amp, z * (1 + Math.sin(t * 0.11) * 0.004 * (amp ? 1 : 0)));
    camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 1);
  });

  return null;
}
