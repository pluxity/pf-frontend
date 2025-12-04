import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
    },
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
    error: {
      control: "boolean",
      description: "에러 상태 표시",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력하세요",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Hello World",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "비밀번호를 입력하세요",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "email@example.com",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "비활성화됨",
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    placeholder: "에러 상태",
    error: true,
    defaultValue: "잘못된 입력",
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex w-[300px] flex-col gap-4">
      <Input placeholder="기본 상태" />
      <Input placeholder="에러 상태" error />
      <Input placeholder="비활성화" disabled />
      <Input type="password" placeholder="비밀번호" />
    </div>
  ),
};
