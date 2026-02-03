import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle } from "../../atoms/Icon";
import { ErrorPage } from "./ErrorPage";

const meta: Meta<typeof ErrorPage> = {
  title: "Templates/ErrorPage",
  component: ErrorPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["404", "403", "500", "custom"],
      description: "에러 타입",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorPage>;

export const NotFound: Story = {
  args: {
    variant: "404",
    primaryAction: {
      label: "홈으로 돌아가기",
      onClick: () => console.log("Go home"),
    },
    secondaryAction: {
      label: "이전 페이지",
      onClick: () => console.log("Go back"),
    },
  },
};

export const Forbidden: Story = {
  args: {
    variant: "403",
    primaryAction: {
      label: "로그인",
      onClick: () => console.log("Login"),
    },
    secondaryAction: {
      label: "홈으로",
      onClick: () => console.log("Go home"),
    },
  },
};

export const ServerError: Story = {
  args: {
    variant: "500",
    primaryAction: {
      label: "다시 시도",
      onClick: () => console.log("Retry"),
    },
    secondaryAction: {
      label: "홈으로 돌아가기",
      onClick: () => console.log("Go home"),
    },
  },
};

export const CustomError: Story = {
  args: {
    variant: "custom",
    errorCode: "503",
    title: "서비스 점검 중",
    description: "더 나은 서비스를 위해 점검 중입니다. 잠시 후 다시 방문해 주세요.",
    primaryAction: {
      label: "새로고침",
      onClick: () => console.log("Refresh"),
    },
  },
};

export const WithIllustration: Story = {
  args: {
    variant: "404",
    illustration: (
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-warning-50 mx-auto">
        <AlertTriangle size={64} className="text-warning-brand" />
      </div>
    ),
    primaryAction: {
      label: "홈으로 돌아가기",
      onClick: () => console.log("Go home"),
    },
  },
};
