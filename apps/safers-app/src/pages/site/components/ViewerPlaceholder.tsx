import {
  Canvas,
  GLTFModel,
  MeshOutline,
  useMeshHover,
  useInteractionStore,
  traverseMeshes,
  updateMaterialProps,
} from "@pf-dev/three";

const SCENE_BG = "#E8ECF1";
const ACES_FILMIC_TONE_MAPPING = 4;

// ─── Material 이름 매칭 패턴 ───
const METAL_PATTERN = /^Material\s*#\d+$/i;
const SAFETYNET_PATTERN = /safetynet/i;

// ─── 씬 조명 상수 ───
const LIGHTING = {
  toneMappingExposure: 1.4,
  ambient: 1.0,
  hemisphere: 0.8,
  directional: 2.0,
} as const;

// ─── Material PBR 프리셋 ───
const MATERIAL_PRESET = {
  metal: { roughness: 0.85, metalness: 0.86, envMapIntensity: 0.0 },
  safetynet: {
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 5.0,
    transparent: true,
    opacity: 1.0,
  },
  default: { roughness: 0.8, metalness: 0.0, envMapIntensity: 0.0 },
} as const;

function getMaterialPreset(name: string) {
  if (METAL_PATTERN.test(name)) return MATERIAL_PRESET.metal;
  if (SAFETYNET_PATTERN.test(name)) return MATERIAL_PRESET.safetynet;
  return null; // default: GLB 원본 유지
}

/** Canvas 내부에서 호버 인터랙션을 활성화하는 컴포넌트 */
function SceneInteraction() {
  useMeshHover(null);
  return <MeshOutline />;
}

/** 호버된 메시 정보를 화면 하단 중앙에 표시하는 오버레이 */
function MeshInfoOverlay() {
  const hoveredMesh = useInteractionStore((s) => s.hoveredMesh);
  const getMeshInfo = useInteractionStore((s) => s.getHoveredMeshInfo);

  const meshInfo = getMeshInfo();
  if (!hoveredMesh || !meshInfo) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
      <div className="rounded-lg bg-black/70 px-4 py-2.5 backdrop-blur-sm">
        <p className="text-sm font-medium text-white">{meshInfo.name}</p>
        <div className="mt-1 flex gap-3 text-xs text-gray-300">
          <span>Material: {meshInfo.materialName}</span>
          <span>{meshInfo.triangles.toLocaleString()} tris</span>
        </div>
      </div>
    </div>
  );
}

export function ViewerPlaceholder() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        lighting={false}
        background={SCENE_BG}
        camera={{
          position: [300, 200, 300] as [number, number, number],
          fov: 30,
          near: 0.1,
          far: 50000,
        }}
        controls={{ maxDistance: 2000, minDistance: 1 }}
        grid={{ infiniteGrid: true }}
        gl={{
          toneMapping: ACES_FILMIC_TONE_MAPPING,
          toneMappingExposure: LIGHTING.toneMappingExposure,
        }}
      >
        <ambientLight intensity={LIGHTING.ambient} />
        <hemisphereLight args={["#b1c4de", "#8b7355", LIGHTING.hemisphere]} />
        <directionalLight
          position={[400, 600, 300]}
          intensity={LIGHTING.directional}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={1}
          shadow-camera-far={2000}
          shadow-camera-left={-400}
          shadow-camera-right={400}
          shadow-camera-top={400}
          shadow-camera-bottom={-400}
          shadow-bias={-0.0005}
        />

        <GLTFModel
          url="/assets/models/safers.glb"
          castShadow
          receiveShadow
          onLoaded={(gltf) => {
            traverseMeshes(gltf.scene, (mesh) => {
              const applyPreset = (mat: typeof mesh.material) => {
                const preset = getMaterialPreset(mat.name);
                if (!preset) return mat; // 원본 유지
                const cloned = mat.clone();
                updateMaterialProps(cloned, preset);
                return cloned;
              };

              if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map(applyPreset);
              } else {
                mesh.material = applyPreset(mesh.material);
              }
            });
          }}
        />

        <SceneInteraction />
      </Canvas>

      <MeshInfoOverlay />
    </div>
  );
}
