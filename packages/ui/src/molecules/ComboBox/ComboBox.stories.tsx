import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Search, User } from "../../atoms/Icon";
import {
  ComboBox,
  ComboBoxContent,
  ComboBoxEmpty,
  ComboBoxGroup,
  ComboBoxIcon,
  ComboBoxInput,
  ComboBoxItem,
  ComboBoxItemIcon,
  ComboBoxList,
  ComboBoxLoading,
  ComboBoxSeparator,
  ComboBoxTrigger,
  ComboBoxValue,
} from "./ComboBox";

const meta: Meta<typeof ComboBox> = {
  title: "Molecules/ComboBox",
  component: ComboBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const countries = [
  "Argentina",
  "Australia",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "India",
  "Italy",
  "Japan",
  "Mexico",
  "Netherlands",
  "Norway",
  "Portugal",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    return (
      <ComboBox value={value} onValueChange={setValue}>
        <ComboBoxTrigger className="w-[260px]">
          <ComboBoxValue placeholder="Search countries" />
          <ComboBoxIcon />
        </ComboBoxTrigger>
        <ComboBoxContent>
          <ComboBoxInput placeholder="Type to search..." />
          <ComboBoxList>
            <ComboBoxEmpty>No countries found</ComboBoxEmpty>
            {countries.map((country) => (
              <ComboBoxItem key={country} value={country}>
                {country}
              </ComboBoxItem>
            ))}
          </ComboBoxList>
        </ComboBoxContent>
      </ComboBox>
    );
  },
};

export const WithGroupsAndIcons: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    const suggestions = [
      { id: "1", name: "Alice Kim" },
      { id: "2", name: "Brandon Park" },
      { id: "3", name: "Charlie Lee" },
    ];
    const recent = [
      { id: "4", name: "Dana Cho" },
      { id: "5", name: "Evan Seo" },
    ];

    return (
      <ComboBox value={value} onValueChange={setValue}>
        <ComboBoxTrigger className="w-[320px]">
          <ComboBoxValue placeholder="Search teammates" />
          <ComboBoxIcon />
        </ComboBoxTrigger>
        <ComboBoxContent>
          <ComboBoxInput placeholder="Mention someone..." />
          <ComboBoxList>
            <ComboBoxGroup label="Suggestions">
              {suggestions.map((item) => (
                <ComboBoxItem key={item.id} value={item.name} textValue={item.name}>
                  <ComboBoxItemIcon>
                    <User size="sm" />
                  </ComboBoxItemIcon>
                  <span className="truncate">{item.name}</span>
                </ComboBoxItem>
              ))}
            </ComboBoxGroup>
            <ComboBoxSeparator />
            <ComboBoxGroup label="Recent">
              {recent.map((item) => (
                <ComboBoxItem key={item.id} value={item.name} textValue={item.name}>
                  <ComboBoxItemIcon>
                    <User size="sm" />
                  </ComboBoxItemIcon>
                  <span className="truncate">{item.name}</span>
                </ComboBoxItem>
              ))}
            </ComboBoxGroup>
          </ComboBoxList>
        </ComboBoxContent>
      </ComboBox>
    );
  },
};

export const LoadingState: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <ComboBox value={value} onValueChange={setValue} isLoading>
        <ComboBoxTrigger className="w-[260px]">
          <ComboBoxValue placeholder="Fetching data..." />
          <ComboBoxIcon />
        </ComboBoxTrigger>
        <ComboBoxContent>
          <ComboBoxInput placeholder="Type to search..." />
          <ComboBoxList>
            <ComboBoxLoading label="Loading options..." />
          </ComboBoxList>
        </ComboBoxContent>
      </ComboBox>
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);

    return (
      <ComboBox
        value={value}
        multiple
        onValueChange={(next) => setValue(Array.isArray(next) ? next : [])}
      >
        <ComboBoxTrigger className="w-[360px]">
          <ComboBoxValue placeholder="Select multiple countries" />
          <ComboBoxIcon />
        </ComboBoxTrigger>
        <ComboBoxContent>
          <ComboBoxInput placeholder="Search countries..." />
          <ComboBoxList>
            <ComboBoxEmpty>No matches</ComboBoxEmpty>
            {countries.map((country) => (
              <ComboBoxItem key={country} value={country}>
                <span className="flex items-center gap-2">
                  <Search size="sm" className="text-gray-400" />
                  <span className="truncate">{country}</span>
                </span>
              </ComboBoxItem>
            ))}
          </ComboBoxList>
        </ComboBoxContent>
      </ComboBox>
    );
  },
};
