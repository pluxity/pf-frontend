import { useState, useRef, useEffect } from "react";
import { Input, Button, useToast, Toaster, Slider, Toggle } from "@pf-dev/ui";
import {
  MapViewer,
  Terrain,
  Imagery,
  useFeatureStore,
  useMapStore,
  useCameraStore,
} from "@pf-dev/map";
import {
  HeightReference,
  HeadingPitchRoll,
  Transforms,
  Cartesian3,
  Math as CesiumMath,
} from "cesium";
import type { InputFieldProps, SectionFieldProps, Position, Rotation, Scale } from "./types";
import { useModelDrag } from "../../hooks";

const DEFAULT_POSITION: Position = {
  longitude: 126.970198,
  latitude: 37.394399,
  height: 1,
};

const DEFAULT_ROTATION: Rotation = {
  heading: 0,
  pitch: 0,
  roll: 0,
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
    const inputValue = parseFloat(event.target.value);
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
    fields: [
      { id: "heading", label: "Heading", slider: true, step: 0.1, min: 0, max: 360 },
      { id: "pitch", label: "Pitch", slider: true, step: 0.1, min: 0, max: 360 },
      { id: "roll", label: "Roll", slider: true, step: 0.1, min: 0, max: 360 },
    ],
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
  const terrainAssetId = Number(import.meta.env.VITE_ION_CESIUM_TERRAIN_ASSET_ID);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, toast, dismissToast } = useToast();
  const { addFeature, removeFeature, updateFeature } = useFeatureStore();
  const viewer = useMapStore((state) => state.viewer);

  const [featureId, setFeatureId] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const positionRef = useRef<Position>(position);
  const [rotation, setRotation] = useState<Rotation>(DEFAULT_ROTATION);
  const [scale, setScale] = useState<Scale>(DEFAULT_SCALE);

  const { flyTo, cameraPosition } = useCameraStore();
  const [topView, setTopView] = useState<boolean>(false);

  const handleToggleTopView = () => {
    if (!viewer || viewer.isDestroyed()) return;

    const newTopViewState = !topView;
    const cartographic = viewer.camera.positionCartographic;
    setTopView(newTopViewState);

    const currentState = cameraPosition || {
      longitude: CesiumMath.toDegrees(cartographic.longitude),
      latitude: CesiumMath.toDegrees(cartographic.latitude),
      height: cartographic.height,
      heading: CesiumMath.toDegrees(viewer.camera.heading),
    };

    if (newTopViewState) {
      flyTo({
        longitude: currentState.longitude,
        latitude: currentState.latitude,
        height: Math.max(currentState.height, 1000),
        heading: currentState.heading,
        pitch: -90,
      });
    } else {
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
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      toast.success("파일이 업로드되었습니다.");
    } else {
      toast.error("파일 형식이 올바르지 않습니다. GLB 또는 GLTF 파일을 선택해주세요.");
    }
  };

  const handleRemoveFile = () => {
    setFileUrl(null);
    setFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFeatureId(null);
    toast.success("파일이 제거되었습니다.");

    setPosition(DEFAULT_POSITION);
    setRotation(DEFAULT_ROTATION);
    setScale(DEFAULT_SCALE);
  };

  const handleFieldsChange = (sectionId: string, values: Record<string, number>) => {
    if (sectionId === "position") {
      setPosition(values as Position);
      if (featureId) {
        updateFeature(featureId, {
          position: values as Position,
        });
      }
    }

    if (sectionId === "rotation") {
      setRotation(values as Rotation);
      if (featureId) {
        const rotationValues = values as Rotation;
        const headingPitchRoll = new HeadingPitchRoll(
          CesiumMath.toRadians(rotationValues.heading),
          CesiumMath.toRadians(rotationValues.pitch),
          CesiumMath.toRadians(rotationValues.roll)
        );
        const currentPosition = positionRef.current;
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
      }
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
  }, [fileUrl, featureId, addFeature, removeFeature]);

  const getSectionValues = (sectionId: string): Record<string, number> | undefined => {
    if (sectionId === "position") {
      return {
        longitude: position.longitude,
        latitude: position.latitude,
        height: position.height,
      };
    }
    if (sectionId === "rotation") {
      return {
        heading: rotation.heading,
        pitch: rotation.pitch,
        roll: rotation.roll,
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

    if (featureId) {
      const headingPitchRoll = new HeadingPitchRoll(
        CesiumMath.toRadians(DEFAULT_ROTATION.heading),
        CesiumMath.toRadians(DEFAULT_ROTATION.pitch),
        CesiumMath.toRadians(DEFAULT_ROTATION.roll)
      );
      const orientation = Transforms.headingPitchRollQuaternion(
        Cartesian3.fromDegrees(
          DEFAULT_POSITION.longitude,
          DEFAULT_POSITION.latitude,
          DEFAULT_POSITION.height
        ),
        headingPitchRoll
      );

      updateFeature(featureId, {
        position: DEFAULT_POSITION,
        orientation,
      });

      if (fileUrl) {
        updateFeature(featureId, {
          visual: {
            type: "model",
            scale: DEFAULT_SCALE.scale,
            uri: fileUrl,
            heightReference: HeightReference.RELATIVE_TO_GROUND,
          },
        });
      }
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
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="w-full cursor-pointer"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute top-3 left-3 z-1">
          <div className="flex items-center gap-2">
            <Toggle size="sm" pressed={topView} onPressedChange={handleToggleTopView}>
              Top View
            </Toggle>
            <Toggle size="sm">Bounding Box</Toggle>
          </div>
        </div>
        <MapViewer className="w-full h-screen" ionToken={ionToken}>
          <Imagery provider="ion" assetId={imageryAssetId} />
          <Terrain provider="ion" assetId={terrainAssetId} />
        </MapViewer>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} position="bottom-right" />
    </div>
  );
}

export default CalibratePage;
