import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "./SearchBar";

const meta: Meta<typeof SearchBar> = {
  title: "Molecules/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Search...",
    className: "w-72",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Search term",
    placeholder: "Search...",
    className: "w-72",
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-72 space-y-2">
        <SearchBar
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type to search..."
        />
        <p className="text-sm text-gray-500">Searching for: {value || "(empty)"}</p>
      </div>
    );
  },
};
