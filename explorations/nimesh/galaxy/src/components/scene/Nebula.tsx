"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { C } from "./palette";
import { nebulaFrag, nebulaVert } from "./shaders";

type Layer = { z: number; size: number; scale: number; galaxyScale: number; intensity: number; wisp?: number; octaves: number };

function layerMesh(l: Layer) {
  const m = new THREE.ShaderMaterial({
    vertexShader: nebulaVert,
    fragmentShader: nebulaFrag,
    defines: { OCTAVES: l.octaves },
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: l.scale },
      uGalaxyScale: { value: l.galaxyScale },
      uIntensity: { value: l.intensity },
      uWisp: { value: l.wisp ?? 0 },
      uIndigo: { value: C.indigo },
      uViolet: { value: C.violet },
      uPeri: { value: C.peri },
      uEmber: { value: C.ember },
      uCore: { value: C.core },
    },
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(l.size, l.size), m);
  mesh.position.z = l.z;
  return mesh;
}

const compositeVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const compositeFrag = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uDim;
varying vec2 vUv;
void main(){ gl_FragColor = vec4(texture2D(uTex, vUv).rgb * uDim, 1.0); }`;

/**
 * The nebula is soft volumetric gas, so it is rendered into a low-resolution target
 * (≈35–45% of the screen) with the real camera — keeping true perspective parallax —
 * then upscaled behind everything. This is what makes 60 fps on a phone realistic.
 */
export function Nebula({ lite }: { lite: boolean }) {
  const { gl, size, camera } = useThree();
  const scale = lite ? 0.28 : 0.4;

  const [scene, mats] = useMemo(() => {
    const s = new THREE.Scene();
    const layers: Layer[] = [
      { z: -30, size: 180, scale: 0.034, galaxyScale: 0.55, intensity: 0.85, octaves: lite ? 4 : 5 },
      ...(lite ? [] : [{ z: -9, size: 110, scale: 0.06, galaxyScale: 0.8, intensity: 0.22, wisp: 1, octaves: 4 }]),
    ];
    const meshes = layers.map(layerMesh);
    meshes.forEach((m) => s.add(m));
    return [s, meshes.map((m) => m.material as THREE.ShaderMaterial)];
  }, [lite]);

  const target = useMemo(
    () => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter }),
    [],
  );
  useEffect(() => {
    const dpr = Math.min(gl.getPixelRatio(), 2);
    target.setSize(Math.max(2, Math.round(size.width * dpr * scale)), Math.max(2, Math.round(size.height * dpr * scale)));
  }, [size, gl, scale, target]);
  useEffect(() => () => target.dispose(), [target]);

  const composite = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: compositeVert,
        fragmentShader: compositeFrag,
        uniforms: { uTex: { value: target.texture }, uDim: { value: 1 } },
        depthWrite: false,
        depthTest: false,
      }),
    [target],
  );

  // runs before the main render / composer
  useFrame((s) => {
    for (const m of mats) m.uniforms.uTime.value = s.clock.elapsedTime;
    // foreground wisps add depth from afar but go soft and plasticky up close: fade them out
    // the gas steps back when we're reading a single day
    composite.uniforms.uDim.value = 0.45 + 0.55 * THREE.MathUtils.smoothstep(camera.position.z, 2.5, 14);
    if (mats[1]) mats[1].uniforms.uIntensity.value = 0.22 * THREE.MathUtils.smoothstep(camera.position.z, 7, 22);
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(target);
    gl.setClearColor("#05060A", 1);
    gl.clear(true, false, false);
    gl.render(scene, camera);
    gl.setRenderTarget(prev);
  }, -1);

  return (
    <mesh material={composite} renderOrder={-100} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
