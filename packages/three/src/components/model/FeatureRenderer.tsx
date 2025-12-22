import { useEffect, useRef, useMemo } from "react";
import {
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
  Euler,
  Object3D,
  BufferGeometry,
  Material,
  Mesh,
} from "three";
import { useAssetStore } from "../../store";
import { useFeatureStore } from "../../store";
import type { Feature } from "../../types";

interface FeatureGroup {
  assetId: string;
  features: Feature[];
}

export function FeatureRenderer() {
  const assets = useAssetStore((s) => s.assets);
  const featuresMap = useFeatureStore((s) => s.features);
  const featuresByAsset = useFeatureStore((s) => s.featuresByAsset);

  const featureGroups = useMemo(() => {
    const groups: FeatureGroup[] = [];

    featuresByAsset.forEach((featureIds, assetId) => {
      const features = Array.from(featureIds)
        .map((id) => featuresMap.get(id))
        .filter((f): f is Feature => f !== undefined && f.visible !== false);

      if (features.length > 0) {
        groups.push({ assetId, features });
      }
    });

    return groups;
  }, [featuresByAsset, featuresMap]);

  return (
    <>
      {featureGroups.map((group) => {
        const asset = assets.get(group.assetId);
        if (!asset?.object) return null;

        return (
          <InstancedFeatureGroup
            key={group.assetId}
            model={asset.object}
            features={group.features}
          />
        );
      })}
    </>
  );
}

interface InstancedFeatureGroupProps {
  model: Object3D;
  features: Feature[];
}

function InstancedFeatureGroup({ model, features }: InstancedFeatureGroupProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const matrixRef = useRef(new Matrix4());
  const positionRef = useRef(new Vector3());
  const rotationRef = useRef(new Quaternion());
  const scaleRef = useRef(new Vector3());

  useEffect(() => {
    if (!meshRef.current) return;

    features.forEach((feature, index) => {
      positionRef.current.set(...feature.position);

      const euler = new Euler(...feature.rotation);
      rotationRef.current.setFromEuler(euler);

      if (typeof feature.scale === "number") {
        scaleRef.current.set(feature.scale, feature.scale, feature.scale);
      } else {
        scaleRef.current.set(...feature.scale);
      }

      matrixRef.current.compose(positionRef.current, rotationRef.current, scaleRef.current);

      meshRef.current!.setMatrixAt(index, matrixRef.current);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [features]);

  const { geometry, material } = useMemo(() => {
    let mergedGeometry: BufferGeometry | null = null;
    let foundMaterial: Material | null = null;

    model.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        if (!mergedGeometry) {
          mergedGeometry = mesh.geometry.clone();
        }
        if (!foundMaterial) {
          const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (mat && "clone" in mat) {
            foundMaterial = mat as Material;
          }
        }
      }
    });

    return {
      geometry: mergedGeometry,
      material: foundMaterial ? (foundMaterial as Material).clone() : null,
    };
  }, [model]);

  if (!geometry || !material) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, features.length]}
      frustumCulled={true}
      userData={{ features, isFeatureGroup: true }}
    />
  );
}
