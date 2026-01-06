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
  Color,
  PolylineGraphics,
} from "cesium";
import type {
  InputFieldProps,
  SectionFieldProps,
  Position,
  Rotation,
  Scale,
  BoundingBoxInfo,
} from "./types";
import { useModelDrag, useCoordinatePicker } from "./hooks";
import { parseGLTFBoundingBox } from "./utils/gltfParser";

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

  const viewer = useMapStore((state) => state.viewer);
  const { addFeature, removeFeature, updateFeature, getFeature, hasFeature } = useFeatureStore();
  const { flyTo, cameraPosition } = useCameraStore();
  const { toasts, toast, dismissToast } = useToast();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [featureId, setFeatureId] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [rotation, setRotation] = useState<Rotation>(DEFAULT_ROTATION);
  const [scale, setScale] = useState<Scale>(DEFAULT_SCALE);
  const [parsedBBox, setParsedBBox] = useState<{ width: number; depth: number } | null>(null);
  const [topView, setTopView] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [clickedCoord, setClickedCoord] = useState<{ longitude: number; latitude: number } | null>(
    null
  );
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(false);
  const [boundingBoxInfo, setBoundingBoxInfo] = useState<BoundingBoxInfo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<Position>(position);
  const boundingBoxFeatureIdRef = useRef<string | null>(null);

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

    const boundingBoxFeatureId = boundingBoxFeatureIdRef.current ?? `bbox-${featureId}`;
    boundingBoxFeatureIdRef.current = boundingBoxFeatureId;

    if (hasFeature(boundingBoxFeatureId)) {
      const entity = getFeature(boundingBoxFeatureId);
      if (entity) {
        updateFeature(boundingBoxFeatureId, {
          position: { longitude: lon, latitude: lat, height },
        });
        entity.polyline = new PolylineGraphics({
          positions: [...corners, corners[0]] as Cartesian3[],
          width: 3,
          material: Color.LIME,
          clampToGround: true,
        });
      }
    } else {
      const entity = addFeature(boundingBoxFeatureId, {
        position: { longitude: lon, latitude: lat, height },
      });

      if (entity) {
        entity.polyline = new PolylineGraphics({
          positions: [...corners, corners[0]] as Cartesian3[],
          width: 3,
          material: Color.LIME,
          clampToGround: true,
        });
      }
    }

    return boundingBoxInfo;
  }, [
    viewer,
    featureId,
    parsedBBox,
    scale.scale,
    rotation.heading,
    getFeature,
    findModelPrimitive,
    hasFeature,
    updateFeature,
    addFeature,
  ]);

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

  const resetState = () => {
    setPosition(DEFAULT_POSITION);
    setRotation(DEFAULT_ROTATION);
    setScale(DEFAULT_SCALE);
    setShowBoundingBox(false);
    setFileUrl(null);
    setFileName("");
    setParsedBBox(null);
    setBoundingBoxInfo(null);
    setClickedCoord(null);
    setDragMode(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (boundingBoxFeatureIdRef.current) {
      removeFeature(boundingBoxFeatureIdRef.current);
      boundingBoxFeatureIdRef.current = null;
    }

    setFeatureId(null);
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
    resetState();
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

  const handleReset = () => {
    resetState();

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

  // positionRef 동기화
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // 모델 Feature 추가/제거
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

  // 모델 Orientation 업데이트
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
      position: currentPosition,
      orientation,
    });
  }, [rotation.heading, position, featureId, fileUrl, updateFeature]);

  // 바운딩 박스 업데이트
  useEffect(() => {
    if (showBoundingBox) {
      if (!viewer || !featureId || !parsedBBox) return;

      const result = calculateBoundingBoxInfo();
      if (result) {
        setBoundingBoxInfo(result);
      }
    } else if (boundingBoxFeatureIdRef.current && hasFeature(boundingBoxFeatureIdRef.current)) {
      removeFeature(boundingBoxFeatureIdRef.current);
      boundingBoxFeatureIdRef.current = null;
      setBoundingBoxInfo(null);
    }
  }, [
    position.longitude,
    position.latitude,
    position.height,
    rotation.heading,
    scale.scale,
    showBoundingBox,
    viewer,
    featureId,
    parsedBBox,
    calculateBoundingBoxInfo,
    hasFeature,
    removeFeature,
  ]);

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
