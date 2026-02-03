import type { Meta, StoryObj } from "@storybook/react";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "./Toast";
import { Toaster } from "./Toaster";
import { useToast } from "./useToast";

const meta: Meta<typeof Toast> = {
  title: "Molecules/Toast",
  component: Toast,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "info", "success", "warning", "error"],
      description: "Toast 스타일 변형",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Toast open variant="default" className="relative">
        <div className="grid gap-1">
          <ToastTitle>알림</ToastTitle>
          <ToastDescription>기본 토스트 메시지입니다.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport className="relative p-4" />
    </ToastProvider>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <ToastProvider>
        <Toast open variant="default" className="relative">
          <div className="grid gap-1">
            <ToastTitle>Default</ToastTitle>
            <ToastDescription>기본 토스트 메시지</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport className="relative" />
      </ToastProvider>

      <ToastProvider>
        <Toast open variant="info" className="relative">
          <div className="grid gap-1">
            <ToastTitle>Info</ToastTitle>
            <ToastDescription>정보 메시지입니다.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport className="relative" />
      </ToastProvider>

      <ToastProvider>
        <Toast open variant="success" className="relative">
          <div className="grid gap-1">
            <ToastTitle>Success</ToastTitle>
            <ToastDescription>성공적으로 저장되었습니다.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport className="relative" />
      </ToastProvider>

      <ToastProvider>
        <Toast open variant="warning" className="relative">
          <div className="grid gap-1">
            <ToastTitle>Warning</ToastTitle>
            <ToastDescription>주의가 필요합니다.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport className="relative" />
      </ToastProvider>

      <ToastProvider>
        <Toast open variant="error" className="relative">
          <div className="grid gap-1">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>오류가 발생했습니다.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport className="relative" />
      </ToastProvider>
    </div>
  ),
};

function InteractiveToastDemo() {
  const { toasts, toast, dismissToast } = useToast();

  return (
    <div className="min-h-96 p-8">
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => toast("기본 토스트 메시지입니다.")}
          className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Default
        </button>
        <button
          onClick={() => toast.info({ title: "정보", description: "새로운 업데이트가 있습니다." })}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Info
        </button>
        <button
          onClick={() => toast.success("저장되었습니다!")}
          className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Success
        </button>
        <button
          onClick={() => toast.warning({ title: "주의", description: "세션이 곧 만료됩니다." })}
          className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          Warning
        </button>
        <button
          onClick={() => toast.error("오류가 발생했습니다.")}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Error
        </button>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} position="bottom-right" />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveToastDemo />,
};

function PositionDemo() {
  const { toasts, toast, dismissToast } = useToast();

  return (
    <div className="min-h-[31.25rem] p-8">
      <div className="mb-4 text-sm text-gray-500">
        우측 하단에 토스트가 표시됩니다. 버튼을 클릭해보세요.
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => toast.success({ title: "성공!", description: "작업이 완료되었습니다." })}
          className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          성공 토스트
        </button>
        <button
          onClick={() => toast.error({ title: "실패", description: "다시 시도해주세요." })}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          에러 토스트
        </button>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} position="bottom-right" />
    </div>
  );
}

export const BottomRight: Story = {
  render: () => <PositionDemo />,
};

function ActionDemo() {
  const { toasts, toast, dismissToast } = useToast();

  return (
    <div className="min-h-96 p-8">
      <button
        onClick={() =>
          toast({
            title: "파일 삭제됨",
            description: "파일이 휴지통으로 이동되었습니다.",
            variant: "warning",
            action: {
              label: "실행 취소",
              onClick: () => alert("실행 취소됨!"),
            },
          })
        }
        className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
      >
        액션 버튼 포함 토스트
      </button>

      <Toaster toasts={toasts} onDismiss={dismissToast} position="bottom-right" />
    </div>
  );
}

export const WithAction: Story = {
  render: () => <ActionDemo />,
};
