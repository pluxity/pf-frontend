import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "Molecules/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <RadioGroupItem value="option1" id="option1" label="Option 1" />
      <RadioGroupItem value="option2" id="option2" label="Option 2" />
      <RadioGroupItem value="option3" id="option3" label="Option 3" />
    </RadioGroup>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable" label="Spacing">
      <RadioGroupItem value="default" id="r1" label="Default" />
      <RadioGroupItem value="comfortable" id="r2" label="Comfortable" />
      <RadioGroupItem value="compact" id="r3" label="Compact" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" className="flex flex-row gap-4">
      <RadioGroupItem value="option1" id="h1" label="Option 1" />
      <RadioGroupItem value="option2" id="h2" label="Option 2" />
      <RadioGroupItem value="option3" id="h3" label="Option 3" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" disabled>
      <RadioGroupItem value="option1" id="d1" label="Option 1" />
      <RadioGroupItem value="option2" id="d2" label="Option 2" />
    </RadioGroup>
  ),
};
