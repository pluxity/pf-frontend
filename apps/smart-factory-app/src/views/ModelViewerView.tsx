import { ModelUploadViewer } from "@/components/model-viewer/ModelUploadViewer";

export function ModelViewerView() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <ModelUploadViewer />
    </div>
  );
}
