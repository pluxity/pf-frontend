import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";

const meta = {
  title: "Atoms/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "success", "warning", "error"],
      description: "칩의 색상 변형",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "칩의 크기",
    },
    removable: {
      control: "boolean",
      description: "삭제 버튼 표시 여부",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default",
    variant: "default",
  },
};

export const Primary: Story = {
  args: {
    children: "Primary",
    variant: "primary",
  },
};

export const Success: Story = {
  args: {
    children: "Success",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Warning",
    variant: "warning",
  },
};

export const Error: Story = {
  args: {
    children: "Error",
    variant: "error",
  },
};

export const Removable: Story = {
  args: {
    children: "Removable",
    variant: "primary",
    removable: true,
    onRemove: () => alert("Removed!"),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip variant="default">Default</Chip>
      <Chip variant="primary">Primary</Chip>
      <Chip variant="success">Success</Chip>
      <Chip variant="warning">Warning</Chip>
      <Chip variant="error">Error</Chip>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
      <Chip size="lg">Large</Chip>
    </div>
  ),
};

export const RemovableChips: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip variant="default" removable>Default</Chip>
      <Chip variant="primary" removable>Primary</Chip>
      <Chip variant="success" removable>Success</Chip>
      <Chip variant="warning" removable>Warning</Chip>
      <Chip variant="error" removable>Error</Chip>
    </div>
  ),
};
