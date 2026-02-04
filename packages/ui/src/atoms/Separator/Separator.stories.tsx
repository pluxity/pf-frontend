import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./Separator";

const meta = {
  title: "Atoms/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-72">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">PF-Dev UI</h4>
        <p className="text-sm text-gray-500">디자인 시스템 컴포넌트</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>문서</div>
        <Separator orientation="vertical" />
        <div>컴포넌트</div>
        <Separator orientation="vertical" />
        <div>소스</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>홈</div>
      <Separator orientation="vertical" />
      <div>문서</div>
      <Separator orientation="vertical" />
      <div>API</div>
    </div>
  ),
};
