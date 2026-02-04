import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./FormField";
import { Input } from "../../atoms/Input";
import { Textarea } from "../../atoms/Textarea";

const meta: Meta<typeof FormField> = {
  title: "Molecules/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FormField label="Email" className="w-72">
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const Required: Story = {
  render: () => (
    <FormField label="Full Name" required className="w-72">
      <Input placeholder="John Doe" />
    </FormField>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <FormField label="Bio" description="Tell us a little about yourself" className="w-72">
      <Textarea placeholder="I'm a..." />
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField label="Email" error="Please enter a valid email address" className="w-72">
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const Complete: Story = {
  render: () => (
    <FormField
      label="Password"
      required
      description="Must be at least 8 characters"
      error="Password is too short"
      className="w-72"
    >
      <Input type="password" />
    </FormField>
  ),
};
