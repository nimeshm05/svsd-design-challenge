import * as THREE from "three";

/** The live camera, so DOM gestures can unproject taps into the galaxy. */
export const sceneRefs: { camera: THREE.PerspectiveCamera | null } = { camera: null };

/** Screen point (client px, relative to the canvas) → world point on the z = 0 plane. */
export function screenToWorld(x: number, y: number, w: number, h: number): [number, number] | null {
  const cam = sceneRefs.camera;
  if (!cam) return null;
  const ndc = new THREE.Vector3((x / w) * 2 - 1, -(y / h) * 2 + 1, 0.5).unproject(cam);
  const dir = ndc.sub(cam.position).normalize();
  const t = -cam.position.z / dir.z;
  return [cam.position.x + dir.x * t, cam.position.y + dir.y * t];
}

/** World point → client px relative to the canvas. */
export function worldToScreen(p: [number, number, number], w: number, h: number): [number, number] | null {
  const cam = sceneRefs.camera;
  if (!cam) return null;
  const v = new THREE.Vector3(...p).project(cam);
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h];
}
