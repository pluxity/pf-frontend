import type { StoryObj } from "@storybook/react";
import { useState } from "react";
import { Stepper } from "./Stepper";
import { Button } from "../../atoms/Button";

const meta = {
  title: "Organisms/Stepper",
  component: Stepper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "스테퍼 방향",
    },
    currentStep: {
      control: "number",
      description: "현재 단계 (0부터 시작)",
    },
  },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// Composition Pattern Examples
// ============================================================================

export const Default: Story = {
  render: () => (
    <Stepper currentStep={1}>
      <Stepper.Step title="Account" description="Create your account" />
      <Stepper.Step title="Profile" description="Set up your profile" />
      <Stepper.Step title="Review" description="Review and confirm" />
    </Stepper>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stepper currentStep={1} orientation="horizontal">
      <Stepper.Step title="Account" description="Create your account" />
      <Stepper.Step title="Profile" description="Set up your profile" />
      <Stepper.Step title="Review" description="Review and confirm" />
    </Stepper>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="w-72">
      <Stepper currentStep={1} orientation="vertical">
        <Stepper.Step title="Account" description="Create your account" />
        <Stepper.Step title="Profile" description="Set up your profile" />
        <Stepper.Step title="Review" description="Review and confirm" />
      </Stepper>
    </div>
  ),
};

export const FirstStep: Story = {
  render: () => (
    <Stepper currentStep={0}>
      <Stepper.Step title="Account" description="Create your account" />
      <Stepper.Step title="Profile" description="Set up your profile" />
      <Stepper.Step title="Review" description="Review and confirm" />
    </Stepper>
  ),
};

export const LastStep: Story = {
  render: () => (
    <Stepper currentStep={2}>
      <Stepper.Step title="Account" description="Create your account" />
      <Stepper.Step title="Profile" description="Set up your profile" />
      <Stepper.Step title="Review" description="Review and confirm" />
    </Stepper>
  ),
};

export const ManySteps: Story = {
  render: () => (
    <Stepper currentStep={2}>
      <Stepper.Step title="Cart" description="Review items" />
      <Stepper.Step title="Shipping" description="Enter address" />
      <Stepper.Step title="Payment" description="Payment method" />
      <Stepper.Step title="Review" description="Review order" />
      <Stepper.Step title="Confirm" description="Place order" />
    </Stepper>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [step, setStep] = useState(0);

    return (
      <div className="space-y-8">
        <Stepper currentStep={step}>
          <Stepper.Step title="Step 1" description="First step" />
          <Stepper.Step title="Step 2" description="Second step" />
          <Stepper.Step title="Step 3" description="Third step" />
          <Stepper.Step title="Step 4" description="Final step" />
        </Stepper>
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Previous
          </Button>
          <Button onClick={() => setStep((s) => Math.min(3, s + 1))} disabled={step === 3}>
            Next
          </Button>
        </div>
      </div>
    );
  },
};

export const VerticalManySteps: Story = {
  render: () => (
    <div className="w-80">
      <Stepper currentStep={2} orientation="vertical">
        <Stepper.Step title="Registration" description="Create your account" />
        <Stepper.Step title="Verification" description="Verify your email" />
        <Stepper.Step title="Profile Setup" description="Complete your profile" />
        <Stepper.Step title="Preferences" description="Set your preferences" />
        <Stepper.Step title="Complete" description="All set!" />
      </Stepper>
    </div>
  ),
};

export const MinimalLabels: Story = {
  render: () => (
    <Stepper currentStep={1}>
      <Stepper.Step title="1" />
      <Stepper.Step title="2" />
      <Stepper.Step title="3" />
      <Stepper.Step title="4" />
    </Stepper>
  ),
};
