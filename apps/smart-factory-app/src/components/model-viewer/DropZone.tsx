import { useState, useRef } from "react";

interface DropZoneProps {
  onFilesDropped: (glb: File, meta: File | null) => void;
  isLoading: boolean;
}

export function DropZone({ onFilesDropped, isLoading }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    processFiles(files);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function processFiles(files: File[]) {
    const glbFile = files.find((f) => f.name.endsWith(".glb") || f.name.endsWith(".gltf"));
    const metaFile = files.find((f) => f.name.endsWith(".json"));

    if (!glbFile) {
      console.warn("[DropZone] No .glb file found in dropped files");
      return;
    }

    onFilesDropped(glbFile, metaFile ?? null);
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-600 border-t-brand" />
          <p className="text-sm text-neutral-400">Loading model...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full cursor-pointer items-center justify-center transition-colors ${
        isDragOver
          ? "border-brand bg-brand/10 border-2 border-dashed"
          : "border-2 border-dashed border-neutral-700 bg-neutral-900 hover:border-neutral-500"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="pointer-events-none text-center">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        <p className="mb-2 text-lg font-medium text-neutral-300">Drop .glb file here</p>
        <p className="text-sm text-neutral-500">
          or click to browse. Optional: drop a .json metadata file alongside.
        </p>
        <p className="mt-4 text-xs text-neutral-600">
          Supports: .glb, .gltf + .json (PF-Model sidecar)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,.json"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
