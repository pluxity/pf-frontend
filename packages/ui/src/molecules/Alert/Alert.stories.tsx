import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertTitle, AlertDescription } from "./Alert";

const meta = {
  title: "Molecules/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "info", "success", "warning", "error"],
    },
    icon: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <AlertTitle>알림</AlertTitle>
      <AlertDescription>기본 알림 메시지입니다.</AlertDescription>
    </Alert>
  ),
};

export const Info: Story = {
  render: () => (
    <Alert variant="info" className="w-[400px]">
      <AlertTitle>정보</AlertTitle>
      <AlertDescription>참고할 만한 정보입니다.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert variant="success" className="w-[400px]">
      <AlertTitle>성공</AlertTitle>
      <AlertDescription>작업이 성공적으로 완료되었습니다.</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning" className="w-[400px]">
      <AlertTitle>경고</AlertTitle>
      <AlertDescription>주의가 필요한 상황입니다.</AlertDescription>
    </Alert>
  ),
};

export const Error: Story = {
  render: () => (
    <Alert variant="error" className="w-[400px]">
      <AlertTitle>오류</AlertTitle>
      <AlertDescription>문제가 발생했습니다. 다시 시도해주세요.</AlertDescription>
    </Alert>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <Alert variant="info" icon={false} className="w-[400px]">
      <AlertTitle>아이콘 없음</AlertTitle>
      <AlertDescription>아이콘이 없는 알림입니다.</AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex w-[400px] flex-col gap-4">
      <Alert variant="default">
        <AlertTitle>기본</AlertTitle>
        <AlertDescription>기본 알림 메시지</AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>정보</AlertTitle>
        <AlertDescription>정보 알림 메시지</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>성공</AlertTitle>
        <AlertDescription>성공 알림 메시지</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>경고</AlertTitle>
        <AlertDescription>경고 알림 메시지</AlertDescription>
      </Alert>
      <Alert variant="error">
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>오류 알림 메시지</AlertDescription>
      </Alert>
    </div>
  ),
};
