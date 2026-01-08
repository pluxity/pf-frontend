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
    <div className="flex items-center gap-3">
      <label className="w-24 text-xs font-medium text-text-muted">{label}</label>
      {slider ? (
        <div className="flex items-center justify-between gap-3 flex-1">
          <Slider
            className="flex-1"
            value={[value ?? 0]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step ?? 0.1}
          />
          <Input
            id={inputId}
            inputSize="sm"
            className="w-20 text-xs bg-white border-border-default focus:border-border-focus focus:ring-primary-500"
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
          className="flex-1 text-xs bg-white border-border-default focus:border-border-focus focus:ring-primary-500"
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
    <div className="space-y-3 p-4 bg-white rounded-lg border border-neutral-200 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 bg-primary-500 rounded-full"></div>
        <h2 className="text-sm font-semibold text-text-secondary">{title}</h2>
      </div>
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
    const cornerLabels = ["Southwest", "Southeast", "Northeast", "Northwest"];

    const boundingBoxInfo: BoundingBoxInfo = {
      corners: cornerCartos.map((carto, index) => ({
        longitude: CesiumMath.toDegrees(carto.longitude),
        latitude: CesiumMath.toDegrees(carto.latitude),
        label: cornerLabels[index] || "",
      })),
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

      calculateBoundingBoxInfo();
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
    <div className="flex h-screen bg-neutral-50">
      <div className="w-96 border-r border-border-default bg-white shadow-lg p-6 overflow-y-auto">
        <div className="mb-6 pb-3 border-b-2 border-primary-500">
          <h1 className="text-xl font-bold text-primary-600">Location Editor</h1>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary-500 rounded-full"></div>
            <h2 className="text-sm font-semibold text-text-secondary">Model File</h2>
          </div>
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
              <div className="flex items-center gap-3 p-3 bg-success-50 border border-success-200 rounded-lg shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-success-700 font-semibold truncate">{fileName}</p>
                  <p className="text-[10px] text-success-600 mt-0.5">Model loaded successfully</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer border-success-300 text-success-700 hover:bg-success-100"
                  onClick={handleRemoveFile}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full cursor-pointer bg-primary-50 border-primary-200 text-primary-600 hover:bg-primary-100 font-medium"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
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
        <div className="flex gap-3 mt-6 flex-col">
          <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 shadow-sm">
            <Button
              size="sm"
              variant="outline"
              className="w-full cursor-pointer bg-white border-primary-300 text-primary-600 hover:bg-primary-100 font-medium"
              onClick={handleToggleBoundingBox}
            >
              Show Bounding Box
            </Button>
            <p className="text-xs text-primary-600 text-center mt-2">
              Model의 박스 정보를 표시합니다.
              <br />
              Position, Scale, Rotation 변경 시 다시 클릭하세요.
            </p>
          </div>

          <Button
            size="sm"
            className="w-full cursor-pointer bg-neutral-700 hover:bg-neutral-800 text-white font-medium shadow-md"
            onClick={handleReset}
          >
            Reset All
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-1 border border-border-default">
            <Toggle
              size="sm"
              pressed={topView}
              onPressedChange={handleToggleTopView}
              className="data-[state=on]:bg-primary-600 data-[state=on]:text-white font-medium"
            >
              Top View
            </Toggle>
            <Toggle
              size="sm"
              pressed={dragMode}
              onPressedChange={setDragMode}
              className="data-[state=on]:bg-primary-600 data-[state=on]:text-white font-medium"
            >
              Model Drag
            </Toggle>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-10">
          <div className="flex gap-3 items-end">
            {showBoundingBox && boundingBoxInfo && (
              <div className="relative bg-neutral-900/95 backdrop-blur-md rounded-xl shadow-2xl p-5 text-white min-w-[300px] border border-neutral-700">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-5 w-1 bg-info-500 rounded-full"></div>
                      <strong className="text-sm font-bold text-white">Bounding Box</strong>
                    </div>
                    <div className="space-y-2 text-xs">
                      {boundingBoxInfo.corners.map((corner, index) => (
                        <div
                          key={index}
                          className="bg-neutral-800/50 rounded-lg p-2 border border-neutral-700"
                        >
                          <div className="font-semibold text-primary-300 mb-1.5 text-xs">
                            {corner.label}
                          </div>
                          <div className="flex justify-between pl-2">
                            <span className="text-neutral-300">Lon:</span>
                            <span className="text-neutral-200">{corner.longitude.toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between pl-2">
                            <span className="text-neutral-300">Lat:</span>
                            <span className="text-neutral-200">{corner.latitude.toFixed(6)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-1 bg-info-500 rounded-full"></div>
                      <strong className="text-xs font-bold text-white">JSON</strong>
                    </div>
                    <pre className="text-xs bg-neutral-950/70 rounded-lg p-3 overflow-x-auto border border-neutral-700 text-neutral-300">
                      {JSON.stringify(
                        {
                          corners: boundingBoxInfo.corners.map((corner) => ({
                            longitude: Number(corner.longitude.toFixed(6)),
                            latitude: Number(corner.latitude.toFixed(6)),
                          })),
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <button
                    className="absolute top-3 right-3 p-1.5 cursor-pointer hover:bg-neutral-700/50 rounded-md transition-colors"
                    onClick={() => setShowBoundingBox(false)}
                  >
                    <X className="w-4 h-4 text-neutral-400 hover:text-white" />
                  </button>
                </div>
              </div>
            )}
            {clickedCoord && (
              <div className="relative bg-neutral-900/95 backdrop-blur-md rounded-xl shadow-2xl p-5 text-white min-w-[300px] border border-neutral-700">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-5 w-1 bg-info-500 rounded-full"></div>
                      <strong className="text-sm font-bold text-white">Clicked Coordinate</strong>
                    </div>
                    <div className="space-y-1.5 text-xs bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
                      <div className="flex justify-between">
                        <span className="text-neutral-300">Lon:</span>
                        <span className="text-neutral-200">
                          {clickedCoord.longitude.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-300">Lat:</span>
                        <span className="text-neutral-200">{clickedCoord.latitude.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-1 bg-info-500 rounded-full"></div>
                      <strong className="text-xs font-bold text-white">JSON</strong>
                    </div>
                    <pre className="text-xs bg-neutral-950/70 rounded-lg p-3 overflow-x-auto border border-neutral-700 text-neutral-300">
                      {JSON.stringify(
                        {
                          longitude: Number(clickedCoord.longitude.toFixed(6)),
                          latitude: Number(clickedCoord.latitude.toFixed(6)),
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
                <button
                  className="absolute top-3 right-3 p-1.5 cursor-pointer hover:bg-neutral-700/50 rounded-md transition-colors"
                  onClick={() => setClickedCoord(null)}
                >
                  <X className="w-4 h-4 text-neutral-400 hover:text-white" />
                </button>
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
