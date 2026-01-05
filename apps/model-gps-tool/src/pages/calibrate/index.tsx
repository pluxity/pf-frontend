import { useState, useRef, useEffect, useCallback } from "react";
import { Input, Button, useToast, Toaster, Slider, Toggle, X } from "@pf-dev/ui";
import { MapViewer, Imagery, useFeatureStore, useMapStore, useCameraStore } from "@pf-dev/map";
import {
  HeightReference,
  HeadingPitchRoll,
  Transforms,
  Cartesian3,
  Math as CesiumMath,
  Cartographic,
  Model,
} from "cesium";
import type {
  InputFieldProps,
  SectionFieldProps,
  Position,
  Rotation,
  Scale,
  BoundingBoxInfo,
  GLTFJson,
} from "./types";
import { useModelDrag, useCoordinatePicker } from "../../hooks";

const DEFAULT_POSITION: Position = {
  longitude: 126.970198,
  latitude: 37.394399,
  height: 1,
};

const DEFAULT_ROTATION: Rotation = {
  heading: 0,
};

const DEFAULT_SCALE: Scale = {
  scale: 1,
};

const InputFields = ({
  id: inputId,
  label,
  slider,
  value,
  onChange,
  step,
  min,
  max,
}: InputFieldProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputString = event.target.value;

    if (inputString === "") {
      onChange?.(0);
      return;
    }

    const inputValue = parseFloat(inputString);
    if (!isNaN(inputValue)) {
      onChange?.(inputValue);
    }
  };

  const handleSliderChange = (values: number[]) => {
    onChange?.(values[0] ?? 0);
  };

  return (
    <div className="flex items-center gap-2">
      <strong className="w-28 text-sm">{label}</strong>
      {slider ? (
        <div className="flex items-center justify-between gap-2">
          <Slider
            className="w-40"
            value={[value ?? 0]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step ?? 0.1}
          />
          <Input
            id={inputId}
            inputSize="sm"
            className="w-20"
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={handleInputChange}
            step={step}
            readOnly={true}
          />
        </div>
      ) : (
        <Input
          id={inputId}
          inputSize="sm"
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={handleInputChange}
          step={step}
        />
      )}
    </div>
  );
};

const SectionFields = ({
  id: sectionId,
  title,
  fields,
  values,
  onFieldsChange,
}: SectionFieldProps) => {
  const handleFieldChange = (fieldId: string, newValue: number) => {
    if (!values) return;
    const updatedValues = { ...values, [fieldId]: newValue };
    onFieldsChange?.(sectionId, updatedValues);
  };
  return (
    <div className="space-y-3">
      <strong className="mb-3 block border-b border-gray-100 pb-2">{title}</strong>
      {fields.map((field) => (
        <InputFields
          key={field.id}
          id={field.id}
          label={field.label}
          slider={field.slider}
          value={values?.[field.id]}
          onChange={(newValue) => handleFieldChange(field.id, newValue)}
          step={field.step}
          min={field.min}
          max={field.max}
        />
      ))}
    </div>
  );
};

const SectionFieldsData: SectionFieldProps[] = [
  {
    id: "position",
    title: "Position",
    fields: [
      { id: "longitude", label: "Longitude", step: 0.000001 },
      { id: "latitude", label: "Latitude", step: 0.000001 },
      { id: "height", label: "Height" },
    ],
  },
  {
    id: "rotation",
    title: "Rotation",
    fields: [{ id: "heading", label: "Heading", slider: true, step: 0.1, min: 0, max: 360 }],
  },
  {
    id: "scale",
    title: "Scale",
    fields: [{ id: "scale", label: "Scale", step: 0.1 }],
  },
];

export function CalibratePage() {
  const ionToken = import.meta.env.VITE_ION_CESIUM_ACCESS_TOKEN;
  const imageryAssetId = Number(import.meta.env.VITE_ION_CESIUM_MAP_ASSET_ID);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, toast, dismissToast } = useToast();
  const { addFeature, removeFeature, updateFeature, getFeature } = useFeatureStore();
  const viewer = useMapStore((state) => state.viewer);

  const [featureId, setFeatureId] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const positionRef = useRef<Position>(position);
  const [rotation, setRotation] = useState<Rotation>(DEFAULT_ROTATION);
  const [scale, setScale] = useState<Scale>(DEFAULT_SCALE);
  const [parsedBBox, setParsedBBox] = useState<{ width: number; depth: number } | null>(null);

  const { flyTo, cameraPosition } = useCameraStore();
  const [topView, setTopView] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [clickedCoord, setClickedCoord] = useState<{ longitude: number; latitude: number } | null>(
    null
  );
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(false);
  const [boundingBoxInfo, setBoundingBoxInfo] = useState<BoundingBoxInfo | null>(null);

  const handleToggleTopView = () => {
    if (!viewer || viewer.isDestroyed()) return;

    const newTopViewState = !topView;
    const cartographic = viewer.camera.positionCartographic;
    const controller = viewer.scene.screenSpaceCameraController;
    setTopView(newTopViewState);

    const currentState = cameraPosition || {
      longitude: CesiumMath.toDegrees(cartographic.longitude),
      latitude: CesiumMath.toDegrees(cartographic.latitude),
      height: cartographic.height,
      heading: CesiumMath.toDegrees(viewer.camera.heading),
    };

    if (newTopViewState) {
      controller.enableTilt = false;

      flyTo({
        longitude: currentState.longitude,
        latitude: currentState.latitude,
        height: Math.max(currentState.height, 1000),
        heading: 0,
        pitch: -90,
      });
    } else {
      controller.enableTilt = true;

      flyTo({
        longitude: currentState.longitude,
        latitude: currentState.latitude,
        height: currentState.height,
        heading: currentState.heading,
        pitch: -45,
      });
    }
  };

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useModelDrag({
    viewer,
    featureId,
    positionRef,
    setPosition,
    enabled: dragMode,
  });

  useCoordinatePicker({
    viewer,
    enabled: !dragMode,
    setClickedCoord,
  });

  const findModelPrimitive = useCallback(
    (entityId: string): Model | null => {
      if (!viewer || viewer.isDestroyed()) return null;

      const entity = getFeature(entityId);
      if (!entity?.model || !entity.position) return null;

      const entityPosition = entity.position.getValue(viewer.clock.currentTime);
      if (!entityPosition) return null;

      for (let i = 0; i < viewer.scene.primitives.length; i++) {
        const primitive = viewer.scene.primitives.get(i);
        if (primitive instanceof Model && primitive.ready) {
          const sphere = primitive.boundingSphere;
          if (sphere && sphere.center && sphere.radius > 0) {
            const distance = Cartesian3.distance(sphere.center, entityPosition);
            if (distance < sphere.radius * 3) {
              return primitive;
            }
          }
        }
      }
      return null;
    },
    [viewer, getFeature]
  );

  const calculateBoundingBoxInfo = useCallback((): BoundingBoxInfo | null => {
    if (!viewer || viewer.isDestroyed() || !featureId || !parsedBBox) return null;

    const entity = getFeature(featureId);
    if (!entity?.position) return null;

    // 모델의 실제 중심점 찾기
    let modelCenter: Cartesian3 | null = null;

    if (entity.model) {
      const modelPrimitive = findModelPrimitive(featureId);
      if (modelPrimitive && modelPrimitive.boundingSphere) {
        const boundingSphere = modelPrimitive.boundingSphere;
        if (boundingSphere.radius > 0 && boundingSphere.center) {
          modelCenter = boundingSphere.center;
        }
      }
    }

    if (!modelCenter) {
      const tempCenter = entity.position.getValue(viewer.clock.currentTime);
      if (!tempCenter) return null;
      modelCenter = tempCenter;
    }

    const carto = Cartographic.fromCartesian(modelCenter);
    const lon = CesiumMath.toDegrees(carto.longitude);
    const lat = CesiumMath.toDegrees(carto.latitude);
    const height = carto.height;

    const actualWidth = parsedBBox.depth * scale.scale;
    const actualDepth = parsedBBox.width * scale.scale;

    const metersPerDegLat = 111320;
    const metersPerDegLon = metersPerDegLat * Math.cos(CesiumMath.toRadians(lat));

    const halfWidth = actualWidth / 2;
    const halfDepth = actualDepth / 2;

    const headingRad = CesiumMath.toRadians(rotation.heading);
    const cosH = Math.cos(headingRad);
    const sinH = Math.sin(headingRad);

    const localPoints = [
      { east: -halfWidth, north: -halfDepth },
      { east: halfWidth, north: -halfDepth },
      { east: halfWidth, north: halfDepth },
      { east: -halfWidth, north: halfDepth },
    ];

    const corners = localPoints.map((p) => {
      const east = p.east * cosH + p.north * sinH;
      const north = -p.east * sinH + p.north * cosH;

      const lonOffset = east / metersPerDegLon;
      const latOffset = north / metersPerDegLat;

      return Cartesian3.fromDegrees(lon + lonOffset, lat + latOffset, height);
    });

    const cornerCartos = corners.map((c) => Cartographic.fromCartesian(c));
    const lats = cornerCartos.map((carto) => CesiumMath.toDegrees(carto.latitude));
    const lons = cornerCartos.map((carto) => CesiumMath.toDegrees(carto.longitude));

    const boundingBoxInfo: BoundingBoxInfo = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons),
    };

    return boundingBoxInfo;
  }, [
    viewer,
    featureId,
    parsedBBox,
    scale.scale,
    rotation.heading,
    getFeature,
    findModelPrimitive,
  ]);

  const parseGLTFBoundingBox = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let gltfJson: GLTFJson | undefined;

    // GLB 여부 확인
    const isGLB =
      uint8Array[0] === 0x67 &&
      uint8Array[1] === 0x6c &&
      uint8Array[2] === 0x54 &&
      uint8Array[3] === 0x46;
    if (isGLB) {
      const view = new DataView(arrayBuffer);
      const jsonChunkLength = view.getUint32(12, true);
      const jsonChunkType = view.getUint32(16, true);
      if (jsonChunkType === 0x4e4f534a) {
        gltfJson = JSON.parse(
          new TextDecoder().decode(uint8Array.slice(20, 20 + jsonChunkLength))
        ) as GLTFJson;
      }
    } else {
      gltfJson = JSON.parse(new TextDecoder().decode(uint8Array)) as GLTFJson;
    }

    if (!gltfJson?.meshes || !gltfJson.accessors) return null;

    let minX = Infinity,
      maxX = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    const processNode = (nodeIndex: number, parentScale: [number, number, number]) => {
      const node = gltfJson.nodes?.[nodeIndex];
      if (!node) return;

      const nodeScale = node.scale || [1, 1, 1];
      const currentScale: [number, number, number] = [
        (parentScale[0] ?? 1) * (nodeScale[0] ?? 1),
        (parentScale[1] ?? 1) * (nodeScale[1] ?? 1),
        (parentScale[2] ?? 1) * (nodeScale[2] ?? 1),
      ];

      if (node.mesh !== undefined) {
        const mesh = gltfJson.meshes?.[node.mesh];
        mesh?.primitives?.forEach((primitive) => {
          const accessor = gltfJson.accessors?.[primitive.attributes.POSITION ?? -1];
          if (
            accessor?.min &&
            accessor?.max &&
            accessor.min.length >= 3 &&
            accessor.max.length >= 3
          ) {
            const scaledMinX = (accessor.min[0] ?? 0) * currentScale[0];
            const scaledMaxX = (accessor.max[0] ?? 0) * currentScale[0];
            const scaledMinZ = (accessor.min[2] ?? 0) * currentScale[2];
            const scaledMaxZ = (accessor.max[2] ?? 0) * currentScale[2];

            minX = Math.min(minX, scaledMinX, scaledMaxX);
            maxX = Math.max(maxX, scaledMinX, scaledMaxX);
            minZ = Math.min(minZ, scaledMinZ, scaledMaxZ);
            maxZ = Math.max(maxZ, scaledMinZ, scaledMaxZ);
          }
        });
      }

      node.children?.forEach((childIndex) => processNode(childIndex, currentScale));
    };

    if (gltfJson.scenes?.[0]?.nodes && gltfJson.nodes) {
      gltfJson.scenes[0].nodes.forEach((nodeIndex) => processNode(nodeIndex, [1, 1, 1]));
    } else {
      gltfJson.meshes.forEach((mesh) => {
        mesh.primitives?.forEach((primitive) => {
          const accessor = gltfJson.accessors?.[primitive.attributes.POSITION ?? -1];
          if (
            accessor?.min &&
            accessor?.max &&
            accessor.min.length >= 3 &&
            accessor.max.length >= 3
          ) {
            minX = Math.min(minX, accessor.min[0] ?? Infinity);
            maxX = Math.max(maxX, accessor.max[0] ?? -Infinity);
            minZ = Math.min(minZ, accessor.min[2] ?? Infinity);
            maxZ = Math.max(maxZ, accessor.max[2] ?? -Infinity);
          }
        });
      });
    }

    if (minX === Infinity || minZ === Infinity) return null;
    return { width: maxX - minX, depth: maxZ - minZ };
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (
      file &&
      (file.name.toLowerCase().endsWith(".glb") || file.name.toLowerCase().endsWith(".gltf"))
    ) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileName(file.name);
      setFeatureId(crypto.randomUUID());

      const parsedBBox = await parseGLTFBoundingBox(file);
      if (parsedBBox) {
        setParsedBBox(parsedBBox);
      } else {
        setParsedBBox(null);
      }

      toast.success("파일이 업로드되었습니다.");
    } else {
      toast.error("파일 형식이 올바르지 않습니다. GLB 또는 GLTF 파일을 선택해주세요.");
    }
  };

  const handleRemoveFile = () => {
    setPosition(DEFAULT_POSITION);
    setRotation(DEFAULT_ROTATION);
    setScale(DEFAULT_SCALE);
    setShowBoundingBox(false);
    setFileUrl(null);
    setFileName("");
    setParsedBBox(null);
    setBoundingBoxInfo(null);
    setClickedCoord(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFeatureId(null);
    toast.success("파일이 제거되었습니다.");
  };

  const handleFieldsChange = (sectionId: string, values: Record<string, number>) => {
    if (sectionId === "position") {
      const positionValues = values as Position;
      const roundedPosition: Position = {
        longitude: parseFloat(positionValues.longitude.toFixed(6)),
        latitude: parseFloat(positionValues.latitude.toFixed(6)),
        height: positionValues.height,
      };
      setPosition(roundedPosition);
      if (featureId) {
        updateFeature(featureId, {
          position: roundedPosition,
        });
      }
    }

    if (sectionId === "rotation") {
      setRotation(values as Rotation);
    }

    if (sectionId === "scale") {
      setScale(values as Scale);
      if (featureId && fileUrl) {
        const scaleValue = values as Scale;
        updateFeature(featureId, {
          visual: {
            type: "model",
            scale: scaleValue.scale,
            uri: fileUrl,
            heightReference: HeightReference.RELATIVE_TO_GROUND,
          },
        });
      }
    }
  };

  useEffect(() => {
    if (!fileUrl || !featureId) {
      return;
    }

    const currentPosition = positionRef.current;

    addFeature(featureId, {
      position: currentPosition,
      visual: {
        type: "model",
        uri: fileUrl,
        heightReference: HeightReference.RELATIVE_TO_GROUND,
        scale: scale.scale,
      },
    });

    return () => {
      if (featureId) {
        removeFeature(featureId);
      }
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, featureId, viewer, addFeature, removeFeature]);

  useEffect(() => {
    if (!featureId || !fileUrl) return;

    const currentPosition = positionRef.current;
    const headingPitchRoll = new HeadingPitchRoll(CesiumMath.toRadians(rotation.heading), 0, 0);
    const orientation = Transforms.headingPitchRollQuaternion(
      Cartesian3.fromDegrees(
        currentPosition.longitude,
        currentPosition.latitude,
        currentPosition.height
      ),
      headingPitchRoll
    );

    updateFeature(featureId, {
      orientation,
    });
  }, [rotation.heading, position, featureId, fileUrl, updateFeature]);

  const getSectionValues = (sectionId: string): Record<string, number> | undefined => {
    if (sectionId === "position") {
      return {
        longitude: position.longitude,
        latitude: position.latitude,
        height: position.height ?? 0,
      };
    }
    if (sectionId === "rotation") {
      return {
        heading: rotation.heading,
      };
    }
    if (sectionId === "scale") {
      return {
        scale: scale.scale,
      };
    }
    return undefined;
  };

  const handleReset = () => {
    setPosition(DEFAULT_POSITION);
    setRotation(DEFAULT_ROTATION);
    setScale(DEFAULT_SCALE);
    setShowBoundingBox(false);
    setFileUrl(null);
    setFileName("");
    setParsedBBox(null);
    setBoundingBoxInfo(null);
    setClickedCoord(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFeatureId(null);

    if (topView && viewer && !viewer.isDestroyed()) {
      setTopView(false);
      const controller = viewer.scene.screenSpaceCameraController;

      controller.enableTilt = true;

      const cartographic = viewer.camera.positionCartographic;
      const currentState = cameraPosition || {
        longitude: CesiumMath.toDegrees(cartographic.longitude),
        latitude: CesiumMath.toDegrees(cartographic.latitude),
        height: cartographic.height,
        heading: CesiumMath.toDegrees(viewer.camera.heading),
      };

      flyTo({
        longitude: currentState.longitude,
        latitude: currentState.latitude,
        height: currentState.height,
        heading: currentState.heading,
        pitch: -45,
      });
    }
  };

  const handleToggleBoundingBox = () => {
    if (!featureId || !parsedBBox) {
      toast.error("모델이 로드되지 않았습니다.");
      return;
    }

    const boundingBoxInfo = calculateBoundingBoxInfo();

    if (boundingBoxInfo) {
      setShowBoundingBox(true);
      setBoundingBoxInfo(boundingBoxInfo);
      toast.success("바운딩 박스 정보를 가져왔습니다.");
    } else {
      toast.error("바운딩 박스 정보를 가져올 수 없습니다.");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-96 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <div className="mb-2 border-b-2 border-primary-200 pb-2">
          <strong>LOCATION EDITOR</strong>
        </div>

        <div className="mb-4 space-y-2">
          <strong className="mb-3 block border-b border-gray-100 pb-2">GLB File</strong>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".glb,.gltf"
              className="hidden"
            />
          </div>

          {fileUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-700 font-medium truncate">{fileName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              파일 선택
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {SectionFieldsData.map((section) => (
            <SectionFields
              key={section.id}
              id={section.id}
              title={section.title}
              fields={section.fields}
              values={getSectionValues(section.id)}
              onFieldsChange={handleFieldsChange}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-5 flex-col">
          <div className="rounded-md border border-gray-200 p-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={handleToggleBoundingBox}
            >
              Bounding Box
            </Button>
            <p className="text-xs text-gray-500 text-center mt-1">
              Model의 박스 정보를 표시합니다.
              <br />
              Position, Scale, Rotation 변경 시 다시 클릭하세요.
            </p>
          </div>

          <Button size="sm" className="w-full cursor-pointer" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-2">
            <Toggle size="sm" pressed={topView} onPressedChange={handleToggleTopView}>
              Top View
            </Toggle>
            <Toggle size="sm" pressed={dragMode} onPressedChange={setDragMode}>
              Model Drag
            </Toggle>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 z-10">
          <div className="flex flex-col gap-2">
            {clickedCoord && (
              <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 text-white min-w-[280px]">
                <div className="space-y-4">
                  <div>
                    <strong className="block mb-2 text-sm font-semibold">Clicked Coordinate</strong>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Longitude:</span>
                        <span>{clickedCoord.longitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Latitude:</span>
                        <span>{clickedCoord.latitude.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="absolute top-2 right-2 p-2 cursor-pointer"
                  onClick={() => setClickedCoord(null)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {showBoundingBox && boundingBoxInfo && (
              <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 text-white min-w-[280px]">
                <div className="space-y-4">
                  <div>
                    <strong className="block mb-2 text-sm font-semibold">Bounding Box</strong>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">North:</span>
                        <span>{boundingBoxInfo.north.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">South:</span>
                        <span>{boundingBoxInfo.south.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">East:</span>
                        <span>{boundingBoxInfo.east.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">West:</span>
                        <span>{boundingBoxInfo.west.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="block text-sm font-semibold">JSON</strong>
                    </div>
                    <pre className="text-xs bg-gray-900/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(
                        {
                          north: Number(boundingBoxInfo.north.toFixed(6)),
                          south: Number(boundingBoxInfo.south.toFixed(6)),
                          east: Number(boundingBoxInfo.east.toFixed(6)),
                          west: Number(boundingBoxInfo.west.toFixed(6)),
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <button
                    className="absolute top-2 right-2 p-2 cursor-pointer"
                    onClick={() => setShowBoundingBox(false)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <MapViewer className="w-full h-screen" ionToken={ionToken} requestRenderMode={false}>
          <Imagery provider="ion" assetId={imageryAssetId} />
        </MapViewer>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} position="bottom-right" />
    </div>
  );
}

export default CalibratePage;
