import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckboxGroup } from "./CheckboxGroup";

const meta: Meta<typeof CheckboxGroup> = {
  title: "Molecules/CheckboxGroup",
  component: CheckboxGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

export const Default: Story = {
  args: {
    options,
    defaultValue: ["option1"],
  },
};

export const WithLabel: Story = {
  args: {
    options: [
      { value: "email", label: "Email notifications" },
      { value: "sms", label: "SMS notifications" },
      { value: "push", label: "Push notifications" },
    ],
    label: "Notification preferences",
    defaultValue: ["email"],
  },
};

export const Horizontal: Story = {
  args: {
    options,
    orientation: "horizontal",
    defaultValue: ["option1", "option2"],
  },
};

export const Disabled: Story = {
  args: {
    options,
    disabled: true,
    defaultValue: ["option1"],
  },
};

export const PartiallyDisabled: Story = {
  args: {
    options: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2 (disabled)", disabled: true },
      { value: "option3", label: "Option 3" },
    ],
    defaultValue: ["option1"],
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["option1"]);
    return (
      <div className="space-y-4">
        <CheckboxGroup
          options={options}
          value={value}
          onChange={setValue}
          label="Controlled checkbox group"
        />
        <p className="text-sm text-gray-600">Selected: {value.join(", ") || "None"}</p>
      </div>
    );
  },
};
