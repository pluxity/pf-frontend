import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateTimePicker } from "./DateTimePicker";

const meta = {
  title: "Organisms/DateTimePicker",
  component: DateTimePicker,
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
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Select date & time",
  },
};

export const WithValue: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return <DateTimePicker value={date} onChange={setDate} placeholder="Select date & time" />;
  },
};

export const With12HourFormat: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <DateTimePicker
        value={date}
        onChange={setDate}
        use12Hour={true}
        placeholder="Select date & time"
      />
    );
  },
};

export const With24HourFormat: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <DateTimePicker
        value={date}
        onChange={setDate}
        use12Hour={false}
        placeholder="Select date & time"
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Select date & time",
    disabled: true,
  },
};

export const WithMinMaxDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Only dates within 2 months from now are selectable</p>
        <DateTimePicker
          value={date}
          onChange={setDate}
          minDate={minDate}
          maxDate={maxDate}
          placeholder="Select date & time"
        />
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <DateTimePicker value={date} onChange={setDate} placeholder="Select date & time" />
        {date && (
          <div className="text-sm space-y-1">
            <p>
              <strong>Date:</strong> {date.toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {date.toLocaleTimeString()}
            </p>
            <p>
              <strong>ISO:</strong> {date.toISOString()}
            </p>
          </div>
        )}
      </div>
    );
  },
};

export const EventScheduler: Story = {
  render: () => {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    return (
      <div className="space-y-4 w-[400px]">
        <h3 className="font-bold">Schedule Event</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Start</label>
          <DateTimePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Select start date & time"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End</label>
          <DateTimePicker
            value={endDate}
            onChange={setEndDate}
            minDate={startDate}
            placeholder="Select end date & time"
          />
        </div>
      </div>
    );
  },
};
