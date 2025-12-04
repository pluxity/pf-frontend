import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TimePicker } from "./TimePicker";

const meta = {
  title: "Molecules/TimePicker",
  component: TimePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    use12Hour: {
      control: "boolean",
      description: "12시간제 사용 여부",
    },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Select time",
  },
};

export const With12HourFormat: Story = {
  render: () => {
    const [time, setTime] = useState<string | undefined>("09:30 AM");
    return (
      <TimePicker
        value={time}
        onChange={setTime}
        use12Hour={true}
        placeholder="Select time"
      />
    );
  },
};

export const With24HourFormat: Story = {
  render: () => {
    const [time, setTime] = useState<string | undefined>("14:30");
    return (
      <TimePicker
        value={time}
        onChange={setTime}
        use12Hour={false}
        placeholder="Select time"
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Select time",
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [time, setTime] = useState<string | undefined>();
    return (
      <div className="space-y-4">
        <TimePicker
          value={time}
          onChange={setTime}
          placeholder="Select time"
        />
        {time && (
          <p className="text-sm">
            Selected: {time}
          </p>
        )}
      </div>
    );
  },
};
