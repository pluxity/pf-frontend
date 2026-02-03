import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./Progress";

const meta: Meta<typeof Progress> = {
  title: "Atoms/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    className: "w-72",
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    className: "w-72",
  },
};

export const Full: Story = {
  args: {
    value: 100,
    className: "w-72",
  },
};

export const Various: Story = {
  render: () => (
    <div className="w-72 space-y-4">
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={100} />
    </div>
  ),
};
