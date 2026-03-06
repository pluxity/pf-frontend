import * as THREE from "three";

const RIPPLE_COUNT = 3;
const RIPPLE_DURATION = 3000; // ms per cycle

export function createRippleRings(count = RIPPLE_COUNT) {
  const group = new THREE.Group();
  const rings: THREE.Mesh[] = [];

  for (let i = 0; i < count; i++) {
    const geo = new THREE.RingGeometry(0.95, 1.0, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x4d7eff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 0, 0.3);
    mesh.scale.setScalar(0.01);
    group.add(mesh);
    rings.push(mesh);
  }

  return { group, rings };
}

export function updateRippleAnimation(
  rings: THREE.Mesh[],
  maxRadius: number,
  duration = RIPPLE_DURATION
) {
  const now = performance.now();
  const count = rings.length;

  for (let i = 0; i < count; i++) {
    const ring = rings[i]!;
    const phase = (now % duration) / duration;
    const offset = i / count;
    const progress = (phase + offset) % 1;

    const scale = progress * maxRadius;
    ring.scale.setScalar(scale);

    const opacity = progress < 0.1 ? (progress / 0.1) * 0.4 : 0.4 * (1 - (progress - 0.1) / 0.9);
    (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, opacity);
  }
}
