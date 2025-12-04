import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "./Radio";

const meta: Meta<typeof RadioGroup> = {
  title: "Atoms/Radio",
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
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-sm">
          옵션 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="text-sm">
          옵션 2
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3" className="text-sm">
          옵션 3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" className="flex gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="h-option1" />
        <label htmlFor="h-option1" className="text-sm">
          옵션 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="h-option2" />
        <label htmlFor="h-option2" className="text-sm">
          옵션 2
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="d-option1" />
        <label htmlFor="d-option1" className="text-sm text-[#808088]">
          비활성화됨 (선택됨)
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="d-option2" />
        <label htmlFor="d-option2" className="text-sm text-[#808088]">
          비활성화됨
        </label>
      </div>
    </RadioGroup>
  ),
};
