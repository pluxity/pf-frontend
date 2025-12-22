import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useInteractionStore } from "../../store/interactionStore";
import type { Mesh, MeshStandardMaterial, Color as ColorType } from "three";
import {
  Matrix4,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  InstancedMesh,
  Color,
} from "three";

interface StoredMaterialState {
  mesh: Mesh;
  material: MeshStandardMaterial;
  originalColor: ColorType;
  originalEmissive: ColorType;
  originalEmissiveIntensity: number;
}

export function MeshOutline() {
  const hoveredMesh = useInteractionStore((s) => s.hoveredMesh);
  const enableOutline = useInteractionStore((s) => s.enableOutline);
  const outlineColor = useInteractionStore((s) => s.outlineColor);
  const outlineThickness = useInteractionStore((s) => s.outlineThickness);
  const previousStateRef = useRef<StoredMaterialState | null>(null);
  const outlineRef = useRef<LineSegments | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    // 이전 material 상태 복원
    if (previousStateRef.current) {
      const { material, originalColor, originalEmissive, originalEmissiveIntensity } =
        previousStateRef.current;
      if ("color" in material && originalColor) {
        material.color.copy(originalColor);
      }
      if ("emissive" in material && originalEmissive) {
        material.emissive.copy(originalEmissive);
        material.emissiveIntensity = originalEmissiveIntensity;
      }
      previousStateRef.current = null;
    }

    // 이전 outline 제거
    if (outlineRef.current) {
      scene.remove(outlineRef.current);
      outlineRef.current.geometry.dispose();
      (outlineRef.current.material as LineBasicMaterial).dispose();
      outlineRef.current = null;
    }

    if (enableOutline && hoveredMesh?.mesh) {
      const mesh = hoveredMesh.mesh;
      const instanceId = hoveredMesh.intersection.instanceId;
      const isFeatureGroup = mesh.userData?.isFeatureGroup === true;

      // Feature (InstancedMesh)인 경우 - outline 그리기
      if (isFeatureGroup && instanceId !== undefined) {
        const geometry = mesh.geometry;
        const edgesGeometry = new EdgesGeometry(geometry, 15);
        const lineMaterial = new LineBasicMaterial({
          color: outlineColor,
          linewidth: outlineThickness,
          transparent: true,
          opacity: 0.8,
          depthTest: false,
        });
        const outline = new LineSegments(edgesGeometry, lineMaterial);
        outline.renderOrder = 999;

        // 해당 인스턴스의 transform 적용
        const matrix = new Matrix4();
        const instancedMesh = mesh as unknown as InstancedMesh;
        instancedMesh.getMatrixAt(instanceId, matrix);
        outline.applyMatrix4(matrix);

        scene.add(outline);
        outlineRef.current = outline;
      }
      // 일반 Mesh (Facility)인 경우 - material 색상 변경
      else {
        const material = (
          Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
        ) as MeshStandardMaterial;

        if ("color" in material && "emissive" in material) {
          previousStateRef.current = {
            mesh,
            material,
            originalColor: material.color.clone(),
            originalEmissive: material.emissive.clone(),
            originalEmissiveIntensity: material.emissiveIntensity ?? 0,
          };

          // outlineColor를 RGB로 변환
          const colorInt = parseInt(outlineColor.replace("#", "0x"));
          material.color.lerp(new Color(0, 1, 0), 0.3);
          material.emissive.set(colorInt);
          material.emissiveIntensity = 0.2;
        }
      }
    }

    return () => {
      // Cleanup material
      if (previousStateRef.current) {
        const { material, originalColor, originalEmissive, originalEmissiveIntensity } =
          previousStateRef.current;
        if ("color" in material && originalColor) {
          material.color.copy(originalColor);
        }
        if ("emissive" in material && originalEmissive) {
          material.emissive.copy(originalEmissive);
          material.emissiveIntensity = originalEmissiveIntensity;
        }
        previousStateRef.current = null;
      }

      // Cleanup outline
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
