"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { armAngle, galaxies, type WeekGalaxy } from "@/lib/galaxies";
import { fadeK, useStore } from "@/lib/store";
import { diskFrag, diskVert, swarmFrag, swarmVert } from "./galaxyShaders";
import { C } from "./palette";

function rng(seed: number) {
  let s = Math.floor(seed * 9973) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const col = (hex: string) => new THREE.Color(hex);
const BULGE = [col("#FFE7BF"), col("#FFD9A0"), col("#FFF1DC")];
const ARM = [col("#D6E2FF"), col("#B4CBFF"), col("#FFFFFF"), col("#C9D6FF"), col("#9DBBFF")];
const FIELD = col("#E6E2F2");
const KNOT = col("#FF8FB6"); // star-forming regions: the stellar nurseries
const YOUNG = col("#8DB4FF");

/** Thousands of resolved stars along the arms give the galaxy its granular, photographic texture. */
function makeSwarm(g: WeekGalaxy, count: number) {
  const r = rng(g.seed + 1);
  const gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const pos: number[] = [], cols: number[] = [], size: number[] = [], seed: number[] = [];
  const push = (x: number, y: number, c: THREE.Color, s: number, k = 1) => {
    pos.push(x, y, gauss() * 0.012);
    cols.push(c.r * k * g.bright, c.g * k * g.bright, c.b * k * g.bright);
    size.push(s);
    seed.push(r());
  };
  const nB = Math.round(count * 0.2), nA = Math.round(count * 0.58), nF = count - nB - nA;
  for (let i = 0; i < nB; i++) {
    const rn = Math.abs(gauss()) * 0.085, th = r() * Math.PI * 2;
    push(Math.cos(th) * rn, Math.sin(th) * rn, BULGE[i % 3], 0.9 + r() * 1.2, 0.9);
  }
  for (let i = 0; i < nA; i++) {
    const rn = 0.07 + Math.pow(r(), 0.8) * 0.9;
    const th = armAngle(g, rn, i % 2) + gauss() * 0.26 * (0.55 + rn);
    const c = r() < 0.08 ? BULGE[1] : ARM[i % ARM.length];
    push(Math.cos(th) * rn, Math.sin(th) * rn, c, 0.7 + Math.pow(r(), 3) * 2.2, 0.5 + r() * 0.45);
  }
  for (let i = 0; i < nF; i++) {
    const rn = Math.sqrt(r()) * 0.95, th = r() * Math.PI * 2;
    push(Math.cos(th) * rn, Math.sin(th) * rn, FIELD, 0.6 + r() * 0.8, 0.3);
  }
  // rose star-forming knots: more of them in weeks with firsts
  const knots = 4 + g.firsts * 3;
  for (let k = 0; k < knots; k++) {
    const rn = 0.28 + r() * 0.6, th = armAngle(g, rn, k % 2) + gauss() * 0.12;
    const cx = Math.cos(th) * rn, cy = Math.sin(th) * rn;
    for (let j = 0; j < 6; j++) push(cx + gauss() * 0.012, cy + gauss() * 0.012, KNOT, j === 0 ? 4.2 : 1.8 + r() * 1.6, j === 0 ? 1.4 : 1);
  }
  // a few hot blue young clusters
  for (let k = 0; k < 7; k++) {
    const rn = 0.25 + r() * 0.65, th = armAngle(g, rn, k % 2) + gauss() * 0.2;
    push(Math.cos(th) * rn, Math.sin(th) * rn, YOUNG, 3 + r() * 1.5, 1.3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aCol", new THREE.Float32BufferAttribute(cols, 3));
  geo.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
  return geo;
}

function Galaxy({ g, lite }: { g: WeekGalaxy; lite: boolean }) {
  const { gl } = useThree();
  const focus = useRef(1);
  const disk = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: diskVert,
        fragmentShader: diskFrag,
        uniforms: {
          uTime: { value: 0 },
          uPitch: { value: g.pitch },
          uPhase: { value: g.phase },
          uSeed: { value: g.seed },
          uBright: { value: g.bright },
          uCool: { value: g.cool },
          uWarm: { value: g.warm },
          uCurrent: { value: g.current ? 1 : 0 },
          uFocus: { value: 1 },
          uCoreCol: { value: col("#FFE2B0") },
          uCopper: { value: C.copper },
          uArmCol: { value: col("#B9CCFF") },
          uHazeCol: { value: col("#3A4A8F") },
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [g],
  );
  const swarmGeo = useMemo(() => makeSwarm(g, lite ? 1600 : 4200), [g, lite]);
  const swarm = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: swarmVert,
        fragmentShader: swarmFrag,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uFocus: { value: 1 }, uGSeed: { value: g.seed } },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
      }),
    [g],
  );

  useFrame((s, dt) => {
    const st = useStore.getState();
    let target = 1;
    if (st.recap.active) target = g.week === st.week ? 0.6 : 0.12;
    // inside a week the galaxy steps back a little so its day-stars always read
    else if (st.level === "week") target = g.week === st.week ? 0.5 : 0.1;
    else if (st.level === "day") target = g.week === st.week ? 0.5 : 0.06;
    focus.current += (target - focus.current) * fadeK(dt, 3);
    disk.uniforms.uTime.value = s.clock.elapsedTime;
    disk.uniforms.uFocus.value = focus.current;
    swarm.uniforms.uTime.value = s.clock.elapsedTime;
    swarm.uniforms.uFocus.value = focus.current;
    swarm.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });

  return (
    <group matrixAutoUpdate={false} matrix={g.matrix}>
      <group scale={[g.radius, g.radius, g.radius]}>
        <mesh material={disk} renderOrder={0} frustumCulled={false}>
          <planeGeometry args={[2, 2]} />
        </mesh>
        <points geometry={swarmGeo} material={swarm} renderOrder={1} frustumCulled={false} />
      </group>
    </group>
  );
}

/** One spiral galaxy per week of the stay. */
export function Galaxies() {
  const lite = useStore((s) => s.lite);
  return (
    <>
      {galaxies.map((g) => (
        <Galaxy key={g.week} g={g} lite={lite} />
      ))}
    </>
  );
}
