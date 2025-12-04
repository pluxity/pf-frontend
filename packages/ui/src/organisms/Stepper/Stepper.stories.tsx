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

const defaultSteps = [
  { title: "Account", description: "Create your account" },
  { title: "Profile", description: "Set up your profile" },
  { title: "Review", description: "Review and confirm" },
];

export const Default: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 1,
  },
};

export const Horizontal: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 1,
    orientation: "horizontal",
  },
};

export const Vertical: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 1,
    orientation: "vertical",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const FirstStep: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 0,
  },
};

export const LastStep: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 2,
  },
};

export const ManySteps: Story = {
  args: {
    steps: [
      { title: "Cart", description: "Review items" },
      { title: "Shipping", description: "Enter address" },
      { title: "Payment", description: "Payment method" },
      { title: "Review", description: "Review order" },
      { title: "Confirm", description: "Place order" },
    ],
    currentStep: 2,
  },
};

export const Interactive: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const steps = [
      { title: "Step 1", description: "First step" },
      { title: "Step 2", description: "Second step" },
      { title: "Step 3", description: "Third step" },
      { title: "Step 4", description: "Final step" },
    ];

    return (
      <div className="space-y-8">
        <Stepper steps={steps} currentStep={step} />
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    );
  },
};
