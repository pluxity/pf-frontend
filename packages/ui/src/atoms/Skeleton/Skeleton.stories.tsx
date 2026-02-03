import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    variant: "text",
    className: "w-72",
  },
};

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" size="sm" />
      <Skeleton variant="avatar" size="md" />
      <Skeleton variant="avatar" size="lg" />
    </div>
  ),
};

export const Card: Story = {
  args: {
    variant: "card",
    className: "w-60 h-32",
  },
};

export const CardWithContent: Story = {
  render: () => (
    <div className="w-72 space-y-4 p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" size="md" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton variant="rectangle" className="h-32 w-full" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-5/6" />
      </div>
    </div>
  ),
};
