import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "success",
        "warning",
        "error",
        "outline",
        "severity-normal",
        "severity-caution",
        "severity-warning",
        "severity-danger",
        "custom",
      ],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
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

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const SeverityNormal: Story = {
  args: {
    children: "정상",
    variant: "severity-normal",
  },
};

export const SeverityCaution: Story = {
  args: {
    children: "주의",
    variant: "severity-caution",
  },
};

export const SeverityWarning: Story = {
  args: {
    children: "경고",
    variant: "severity-warning",
  },
};

export const SeverityDanger: Story = {
  args: {
    children: "위험",
    variant: "severity-danger",
  },
};

export const Custom: Story = {
  args: {
    children: "Custom",
    variant: "custom",
    className: "bg-purple-500 dark:bg-purple-700 text-white",
  },
};

export const CustomVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="custom" className="bg-purple-500 dark:bg-purple-700 text-white">
        Purple
      </Badge>
      <Badge variant="custom" className="bg-pink-500 dark:bg-pink-700 text-white">
        Pink
      </Badge>
      <Badge variant="custom" className="bg-teal-500 dark:bg-teal-700 text-white">
        Teal
      </Badge>
      <Badge
        variant="custom"
        className="border border-indigo-500 text-indigo-500 dark:border-indigo-400 dark:text-indigo-400"
      >
        Outline Custom
      </Badge>
    </div>
  ),
};

export const AllSeverityVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="severity-normal">정상</Badge>
      <Badge variant="severity-caution">주의</Badge>
      <Badge variant="severity-warning">경고</Badge>
      <Badge variant="severity-danger">위험</Badge>
    </div>
  ),
};
