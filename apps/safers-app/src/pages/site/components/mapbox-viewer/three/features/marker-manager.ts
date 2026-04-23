import * as THREE from "three";
import type { FeatureEntry } from "../core/types";

interface MarkerEntry {
  featureId: string;
  core: THREE.Mesh;
  pulses: THREE.Mesh[];
  maxRadius: number;
  offsets: number[];
}

const PULSE_CYCLE = 2.0;
const PULSE_COUNT = 2;

export function createMarkerManager(
  features: Map<string, FeatureEntry>,
  requestRepaint: () => void
) {
  const markerEntries = new Map<string, MarkerEntry>();

  function addFeatureMarker(id: string, color = 0x00c48c, radius = 6) {
    const entry = features.get(id);
    if (!entry || markerEntries.has(id)) return;

    const coreGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.userData.isMarker = true;
    entry.group.add(core);

    const pulses: THREE.Mesh[] = [];
    const offsets: number[] = [];

    for (let i = 0; i < PULSE_COUNT; i++) {
      const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
      const sphereMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.userData.isMarker = true;
      sphere.scale.setScalar(0.01);
      entry.group.add(sphere);
      pulses.push(sphere);
      offsets.push(i / PULSE_COUNT);
    }

    markerEntries.set(id, { featureId: id, core, pulses, maxRadius: radius, offsets });
    requestRepaint();
  }

  function removeFeatureMarker(id: string) {
    const marker = markerEntries.get(id);
    if (!marker) return;

    const entry = features.get(id);
    if (entry) {
      entry.group.remove(marker.core);
      marker.core.geometry.dispose();
      (marker.core.material as THREE.Material).dispose();
      for (const p of marker.pulses) {
        entry.group.remove(p);
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      }
    }
    markerEntries.delete(id);
    requestRepaint();
  }

  function clearAllMarkers() {
    for (const [id, marker] of markerEntries) {
      const entry = features.get(id);
      if (entry) {
        entry.group.remove(marker.core);
        marker.core.geometry.dispose();
        (marker.core.material as THREE.Material).dispose();
        for (const p of marker.pulses) {
          entry.group.remove(p);
          p.geometry.dispose();
          (p.material as THREE.Material).dispose();
        }
      }
    }
    markerEntries.clear();
    requestRepaint();
  }

  /** Called per-frame. Returns true if markers are active. */
  function updateAnimation(elapsedTime: number) {
    for (const marker of markerEntries.values()) {
      for (let i = 0; i < marker.pulses.length; i++) {
        const pulse = marker.pulses[i]!;
        const offset = marker.offsets[i]!;
        const t = (elapsedTime / PULSE_CYCLE + offset) % 1;
        const scale = t * marker.maxRadius;
        pulse.scale.setScalar(Math.max(scale, 0.01));
        (pulse.material as THREE.MeshBasicMaterial).opacity = 0.2 * (1 - t);
      }
    }
  }

  function hasMarkers(): boolean {
    return markerEntries.size > 0;
  }

  return { addFeatureMarker, removeFeatureMarker, clearAllMarkers, updateAnimation, hasMarkers };
}
