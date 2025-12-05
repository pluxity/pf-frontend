import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { ImageUpload } from "./ImageUpload";
import { UploadZone } from "./UploadZone";
import { FileItem, type FileItemData } from "./FileItem";
import { ThumbnailItem, type ThumbnailItemData } from "./ThumbnailItem";

const meta = {
  title: "Molecules/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    accept: {
      control: "text",
      description: "허용되는 파일 타입",
    },
    multiple: {
      control: "boolean",
      description: "다중 파일 선택 허용",
    },
    maxSize: {
      control: "number",
      description: "최대 파일 크기 (bytes)",
    },
    maxFiles: {
      control: "number",
      description: "최대 파일 개수",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ImageOnly: Story = {
  args: {
    accept: "image/*",
    title: "이미지 파일만 업로드 가능합니다",
  },
};

export const WithSizeLimit: Story = {
  args: {
    maxSize: 1024 * 1024,
    description: "PNG, JPG, PDF 최대 1MB",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

function InteractiveFileUploadDemo() {
  const [files, setFiles] = useState<FileItemData[]>([]);

  const handleUpload = (newFiles: File[]) => {
    newFiles.forEach((file) => {
      let progress = 0;

      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }

        setFiles((prev) =>
          prev.map((f) => {
            if (f.name === file.name && f.status === "uploading") {
              return {
                ...f,
                progress: Math.round(progress),
                status: progress >= 100 ? "complete" : "uploading",
              };
            }
            return f;
          })
        );
      }, 500);
    });
  };

  return (
    <div className="w-[500px]">
      <FileUpload
        value={files}
        onChange={setFiles}
        onUpload={handleUpload}
        multiple
        maxFiles={5}
        title="파일을 드래그하거나 클릭하여 업로드"
        buttonLabel="파일 선택"
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveFileUploadDemo />,
};

export const UploadZoneBasic: Story = {
  render: () => (
    <div className="w-[400px]">
      <UploadZone
        onFilesSelected={(files) => console.log("Selected:", files)}
        title="파일을 드래그하거나 클릭하여 업로드"
        buttonLabel="파일 선택"
      />
    </div>
  ),
};

const sampleFiles: FileItemData[] = [
  {
    id: "1",
    name: "document.pdf",
    size: 1024 * 1024 * 2.5,
    type: "application/pdf",
    status: "complete",
  },
  {
    id: "2",
    name: "very-long-filename-that-should-be-truncated.docx",
    size: 1024 * 512,
    type: "application/msword",
    status: "uploading",
    progress: 65,
  },
  {
    id: "3",
    name: "image.png",
    size: 1024 * 1024 * 15,
    type: "image/png",
    status: "error",
    error: "파일 크기가 10MB를 초과합니다",
  },
];

export const FileItemVariants: Story = {
  render: () => (
    <div className="w-[400px] space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">완료됨</h3>
      <FileItem file={sampleFiles[0]!} onRemove={(id) => console.log("Remove:", id)} />

      <h3 className="text-sm font-semibold text-gray-700">업로드 중</h3>
      <FileItem file={sampleFiles[1]!} onRemove={(id) => console.log("Remove:", id)} />

      <h3 className="text-sm font-semibold text-gray-700">에러</h3>
      <FileItem file={sampleFiles[2]!} onRemove={(id) => console.log("Remove:", id)} />
    </div>
  ),
};

const sampleThumbnails: ThumbnailItemData[] = [
  {
    id: "1",
    name: "photo-1.jpg",
    url: "https://picsum.photos/200/200?random=1",
    status: "complete",
  },
  {
    id: "2",
    name: "photo-2.jpg",
    url: "https://picsum.photos/200/200?random=2",
    status: "uploading",
    progress: 45,
  },
  {
    id: "3",
    name: "invalid-image.jpg",
    status: "error",
    error: "업로드 실패",
  },
];

export const ThumbnailItemVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">완료됨</h3>
        <ThumbnailItem item={sampleThumbnails[0]!} onRemove={(id) => console.log("Remove:", id)} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">업로드 중</h3>
        <ThumbnailItem item={sampleThumbnails[1]!} onRemove={(id) => console.log("Remove:", id)} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">에러</h3>
        <ThumbnailItem item={sampleThumbnails[2]!} onRemove={(id) => console.log("Remove:", id)} />
      </div>
    </div>
  ),
};

export const ThumbnailSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Small</h3>
        <ThumbnailItem
          item={sampleThumbnails[0]!}
          size="sm"
          onRemove={(id) => console.log("Remove:", id)}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Medium</h3>
        <ThumbnailItem
          item={sampleThumbnails[0]!}
          size="md"
          onRemove={(id) => console.log("Remove:", id)}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Large</h3>
        <ThumbnailItem
          item={sampleThumbnails[0]!}
          size="lg"
          onRemove={(id) => console.log("Remove:", id)}
        />
      </div>
    </div>
  ),
};

function InteractiveImageUploadDemo() {
  const [images, setImages] = useState<ThumbnailItemData[]>([]);

  const handleUpload = (files: File[]) => {
    files.forEach((file) => {
      let progress = 0;

      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }

        setImages((prev) =>
          prev.map((img) => {
            if (img.name === file.name && img.status === "uploading") {
              return {
                ...img,
                progress: Math.round(progress),
                status: progress >= 100 ? "complete" : "uploading",
              };
            }
            return img;
          })
        );
      }, 400);
    });
  };

  return (
    <div className="w-[600px]">
      <ImageUpload
        value={images}
        onChange={setImages}
        onUpload={handleUpload}
        multiple
        maxFiles={9}
        title="이미지를 드래그하거나 클릭하여 업로드"
        buttonLabel="이미지 선택"
      />
    </div>
  );
}

export const ImageUploadDefault: Story = {
  render: () => <InteractiveImageUploadDemo />,
};

function ImageUploadWithPreloadedDemo() {
  const [images, setImages] = useState<ThumbnailItemData[]>([
    {
      id: "1",
      name: "sample-1.jpg",
      url: "https://picsum.photos/200/200?random=1",
      status: "complete",
    },
    {
      id: "2",
      name: "sample-2.jpg",
      url: "https://picsum.photos/200/200?random=2",
      status: "complete",
    },
    {
      id: "3",
      name: "sample-3.jpg",
      url: "https://picsum.photos/200/200?random=3",
      status: "complete",
    },
  ]);

  return (
    <div className="w-[600px]">
      <ImageUpload value={images} onChange={setImages} multiple maxFiles={9} thumbnailSize="md" />
    </div>
  );
}

export const ImageUploadWithPreloaded: Story = {
  render: () => <ImageUploadWithPreloadedDemo />,
};
