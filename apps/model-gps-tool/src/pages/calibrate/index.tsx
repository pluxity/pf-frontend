import { useState, useRef, useEffect } from "react";
import { Input, Button, useToast, Toaster, Slider } from "@pf-dev/ui";
import { MapViewer, Terrain, Imagery, useFeatureStore } from "@pf-dev/map";
import { HeightReference } from "cesium";
import type { InputFieldProps, SectionFieldProps, Position } from "./types";

const DEFAULT_POSITION: Position = {
  longitude: 126.970198,
  latitude: 37.394399,
  height: 1,
};

const InputFields = ({ id: inputId, label, slider, value, onChange, step }: InputFieldProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseFloat(event.target.value);
    if (!isNaN(inputValue)) {
      onChange?.(inputValue);
    }
  };
  return (
    <div className="flex items-center gap-2">
      <strong className="w-28 text-sm">{label}</strong>
      {slider ? (
        <div className="flex items-center justify-between gap-2">
          <Slider className="w-40" />
          <Input
            id={inputId}
            inputSize="sm"
            className="w-20"
            type="number"
            value={value}
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
      { id: "heading", label: "Heading", slider: true },
      { id: "pitch", label: "Pitch", slider: true },
      { id: "roll", label: "Roll", slider: true },
    ],
  },
  {
    id: "scale",
    title: "Scale",
    fields: [
      { id: "scaleX", label: "Scale X" },
      { id: "scaleY", label: "Scale Y" },
      { id: "scaleZ", label: "Scale Z" },
    ],
  },
];

export function CalibratePage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, toast, dismissToast } = useToast();
  const { addFeature, removeFeature, updateFeature } = useFeatureStore();

  const [featureId, setFeatureId] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const positionRef = useRef<Position>(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const ionToken = import.meta.env.VITE_ION_CESIUM_ACCESS_TOKEN;
  const imageryAssetId = Number(import.meta.env.VITE_ION_CESIUM_MAP_ASSET_ID);
  const terrainAssetId = Number(import.meta.env.VITE_ION_CESIUM_TERRAIN_ASSET_ID);

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
    // rotation, scale은 나중에 구현
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
    // rotation, scale은 나중에 구현
    return undefined;
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
          <Button size="sm" className="w-full cursor-pointer">
            Save
          </Button>
          <Button size="sm" variant="outline" className="w-full cursor-pointer">
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
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
