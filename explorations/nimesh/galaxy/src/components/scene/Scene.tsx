"use client";
import { Canvas } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/lib/store";
import { FOV } from "@/lib/view";
import { Constellations, VoiceMotes } from "./Ambient";
import { DeepField } from "./DeepField";
import { Galaxies } from "./Galaxies";
import { Arrival } from "./Arrival";
import { CameraRig } from "./CameraRig";
import { DayRing } from "./DayRing";
import { Labels } from "./Labels";
import { Stars } from "./Stars";

export function Scene() {
  const lite = useStore((s) => s.lite);
  // ?fx=0 turns post-processing off (debugging / very old devices)
  const fx = typeof window === "undefined" || !window.location.search.includes("fx=0");
  const caOffset = useMemo(() => (lite ? new THREE.Vector2(0, 0) : new THREE.Vector2(0.0007, 0.0004)), [lite]);
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={lite ? [1, 1.25] : [1, 2]}
      flat
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false, depth: false }}
      camera={{ fov: FOV, near: 0.05, far: 300, position: [0, 0, 40] }}
      onCreated={({ gl }) => gl.setClearColor("#05060A")}
    >
      <Suspense fallback={null}>
        {/* far → near parallax: nebula far, dust through depth, stars mid, UI near */}
        {/* far → near parallax: deep field far, week galaxies mid, day stars and UI near */}
        <DeepField lite={lite} />
        <Galaxies />
        <Constellations />
        <Stars />
        <VoiceMotes />
        <DayRing />
        <Arrival />
        <Labels />
        <CameraRig />
        {fx && <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.5} luminanceSmoothing={0.3} radius={0.7} />
          <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.35} blendFunction={BlendFunction.NORMAL} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.28} darkness={0.72} />
          <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.32} />
        </EffectComposer>}
      </Suspense>
    </Canvas>
  );
}
