import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useInteractionStore } from "../store/interactionStore";
import { Matrix4, EdgesGeometry, LineBasicMaterial, LineSegments, InstancedMesh } from "three";

export function MeshOutline() {
  const hoveredMesh = useInteractionStore((s) => s.hoveredMesh);
  const enableOutline = useInteractionStore((s) => s.enableOutline);
  const outlineColor = useInteractionStore((s) => s.outlineColor);
  const outlineThickness = useInteractionStore((s) => s.outlineThickness);
  const outlineRef = useRef<LineSegments | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (outlineRef.current) {
      scene.remove(outlineRef.current);
      outlineRef.current.geometry.dispose();
      (outlineRef.current.material as LineBasicMaterial).dispose();
      outlineRef.current = null;
    }

    if (!enableOutline || !hoveredMesh?.mesh) return;

    const mesh = hoveredMesh.mesh;
    const geometry = mesh.geometry;
    if (!geometry) return;

    const edgesGeometry = new EdgesGeometry(geometry, 15);
    const lineMaterial = new LineBasicMaterial({
      color: outlineColor,
      linewidth: outlineThickness,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    const outline = new LineSegments(edgesGeometry, lineMaterial);
    outline.renderOrder = 999;

    const instanceId = hoveredMesh.intersection.instanceId;
    const isFeatureGroup = mesh.userData?.isFeatureGroup === true;

    if (isFeatureGroup && instanceId !== undefined) {
      const matrix = new Matrix4();
      const instancedMesh = mesh as unknown as InstancedMesh;
      instancedMesh.getMatrixAt(instanceId, matrix);
      outline.applyMatrix4(matrix);
    } else {
      mesh.getWorldPosition(outline.position);
      mesh.getWorldQuaternion(outline.quaternion);
      mesh.getWorldScale(outline.scale);
    }

    scene.add(outline);
    outlineRef.current = outline;

    return () => {
      if (outlineRef.current) {
        scene.remove(outlineRef.current);
        outlineRef.current.geometry.dispose();
        (outlineRef.current.material as LineBasicMaterial).dispose();
        outlineRef.current = null;
      }
    };
  }, [hoveredMesh, enableOutline, outlineColor, outlineThickness, scene]);

  return null;
}
