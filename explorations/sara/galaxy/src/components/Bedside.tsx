"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clock, stay, toMinutes, weeksAlong } from "@/lib/data";
import { RING_RADIUS } from "@/lib/layout";
import { FOV, posOf } from "@/lib/view";
import { DayRing } from "./scene/DayRing";
import { makeStarGeometry, makeStarMaterial } from "./scene/Stars";

const today = stay.today.dayIndex;

function TodayStar() {
  const material = useMemo(() => makeStarMaterial(1), []);
  const geometry = useMemo(() => makeStarGeometry([stay.days[today - 1]], () => posOf(today), today), []);
  useFrame((s) => (material.uniforms.uTime.value = s.clock.elapsedTime));
  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

function FixedCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const c = posOf(today);
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180);
    const z = (RING_RADIUS * 1.7) / tan;
    // star sits left of centre; the words sit right
    const aspect = size.width / size.height;
    camera.position.set(c[0] + tan * z * aspect * 0.35, c[1], c[2] + z);
    camera.lookAt(camera.position.x, camera.position.y, c[2]);
  }, [camera, size]);
  return null;
}

/**
 * Bedside display: a dim, warm night light for the incubator side. Amber on black,
 * today's star and its 24-hour ring only. No vitals, no red, no blinking.
 */
export function Bedside() {
  const [minutes, setMinutes] = useState(toMinutes(stay.today.nowTime));
  useEffect(() => {
    const t = setInterval(() => setMinutes((m) => m + 1), 60000);
    return () => clearInterval(t);
  }, []);
  const d = stay.days[today - 1];
  const wa = weeksAlong(today);
  const hh = `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black" style={{ color: "#E8A15C" }}>
      <Canvas className="!absolute inset-0" dpr={[1, 1.5]} flat gl={{ antialias: false }} camera={{ fov: FOV, near: 0.05, far: 100 }} onCreated={({ gl }) => gl.setClearColor("#000000")}>
        <FixedCamera />
        <TodayStar />
        <DayRing amber={1} dayOverride={today} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.5} radius={0.7} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>
      <div className="pointer-events-none absolute inset-y-0 right-[8%] flex w-[36%] flex-col justify-center" style={{ opacity: 0.82 }}>
        <p className="obs" style={{ color: "#B9763C" }}>
          Day {today} · {wa.weeks} weeks along
        </p>
        <p className="serif-i mt-3 text-[44px] leading-none">{stay.baby.name}</p>
        <p className="obs mt-6 text-[28px] tracking-[0.2em]" aria-label={`Time ${clock(hh)}`}>
          {hh}
        </p>
        <p className="serif-i mt-6 text-[24px] leading-snug" style={{ color: "#C98A4E" }}>
          {d.story}
        </p>
      </div>
      <Link href="/?recap=0" className="obs absolute bottom-5 left-6 min-h-11 py-3" style={{ color: "#6E4A28" }}>
        ← Back
      </Link>
    </div>
  );
}
