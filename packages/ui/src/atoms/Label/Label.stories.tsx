import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";
import { Input } from "../Input";

const meta = {
  title: "Atoms/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "라벨 텍스트",
  },
};

export const Required: Story = {
  args: {
    children: "필수 입력",
    required: true,
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="email">이메일</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
};

export const RequiredWithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="name" required>
        이름
      </Label>
      <Input id="name" placeholder="이름을 입력하세요" />
    </div>
  ),
};
