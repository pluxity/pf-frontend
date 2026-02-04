import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { User } from "../../atoms/Icon";
import {
  ComboBox,
  ComboBoxContent,
  ComboBoxEmpty,
  ComboBoxGroup,
  ComboBoxIcon,
  ComboBoxInput,
  ComboBoxItem,
  ComboBoxLabel,
  ComboBoxList,
  ComboBoxSeparator,
  ComboBoxTrigger,
  ComboBoxValue,
  useComboBox,
} from "./ComboBox";

const meta: Meta<typeof ComboBox> = {
  title: "Molecules/ComboBox",
  component: ComboBox,
  parameters: {
    layout: "centered",
    docs: { canvas: { height: 400 } },
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
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
];

function FilteredList({ items }: { items: string[] }) {
  const { search } = useComboBox<string>();

  const filtered = useMemo(() => {
    if (!search) return items;
    return items.filter((item) => item.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  if (filtered.length === 0) {
    return <ComboBoxEmpty>No countries found</ComboBoxEmpty>;
  }

  return (
    <>
      {filtered.map((country) => (
        <ComboBoxItem key={country} value={country}>
          {country}
        </ComboBoxItem>
      ))}
    </>
  );
}

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    return (
      <ComboBox value={value} onValueChange={setValue}>
        <ComboBoxTrigger className="w-64">
          <ComboBoxValue placeholder="Search countries..." />
          <ComboBoxIcon />
        </ComboBoxTrigger>
        <ComboBoxContent className="w-64">
          <ComboBoxInput placeholder="Type to search..." />
          <ComboBoxList>
            <FilteredList items={countries} />
          </ComboBoxList>
        </ComboBoxContent>
      </ComboBox>
    );
  },
};

export const WithGroups: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    const suggestions = ["Alice Kim", "Brandon Park", "Charlie Lee"];
    const recent = ["Dana Cho", "Evan Seo"];

    function GroupedList() {
      const { search } = useComboBox<string>();

      const filterItems = (items: string[]) =>
        items.filter((item) => item.toLowerCase().includes(search.toLowerCase()));

      const filteredSuggestions = filterItems(suggestions);
      const filteredRecent = filterItems(recent);
      const hasResults = filteredSuggestions.length > 0 || filteredRecent.length > 0;

      if (!hasResults) {
        return <ComboBoxEmpty>No teammates found</ComboBoxEmpty>;
      }

      return (
        <>
          {filteredSuggestions.length > 0 && (
            <ComboBoxGroup>
              <ComboBoxLabel>Suggestions</ComboBoxLabel>
              {filteredSuggestions.map((name) => (
                <ComboBoxItem key={name} value={name}>
                  <User size="sm" className="mr-2 text-gray-400" />
                  {name}
                </ComboBoxItem>
              ))}
            </ComboBoxGroup>
          )}
          {filteredSuggestions.length > 0 && filteredRecent.length > 0 && <ComboBoxSeparator />}
          {filteredRecent.length > 0 && (
            <ComboBoxGroup>
              <ComboBoxLabel>Recent</ComboBoxLabel>
              {filteredRecent.map((name) => (
                <ComboBoxItem key={name} value={name}>
                  <User size="sm" className="mr-2 text-gray-400" />
                  {name}
                </ComboBoxItem>
              ))}
            </ComboBoxGroup>
          )}
        </>
      );
    }

    return (
      <ComboBox value={value} onValueChange={setValue}>
        <ComboBoxTrigger className="w-72">
          <ComboBoxValue placeholder="Search teammates..." />
          <ComboBoxIcon />
        </ComboBoxTrigger>
        <ComboBoxContent className="w-72">
          <ComboBoxInput placeholder="Mention someone..." />
          <ComboBoxList>
            <GroupedList />
          </ComboBoxList>
        </ComboBoxContent>
      </ComboBox>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>("Japan");
    const [open, setOpen] = useState(false);

    return (
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-600">
          Selected: <strong>{value ?? "None"}</strong>
        </div>
        <ComboBox value={value} onValueChange={setValue} open={open} onOpenChange={setOpen}>
          <ComboBoxTrigger className="w-64">
            <ComboBoxValue placeholder="Search countries..." />
            <ComboBoxIcon />
          </ComboBoxTrigger>
          <ComboBoxContent className="w-64">
            <ComboBoxInput />
            <ComboBoxList>
              <FilteredList items={countries} />
            </ComboBoxList>
          </ComboBoxContent>
        </ComboBox>
        <button
          className="w-fit rounded bg-primary-500 px-3 py-1.5 text-sm text-white"
          onClick={() => setValue(null)}
        >
          Clear
        </button>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return (
      <ComboBox value={null} onValueChange={() => {}} disabled>
        <ComboBoxTrigger className="w-64">
          <ComboBoxValue placeholder="Disabled" />
          <ComboBoxIcon />
        </ComboBoxTrigger>
        <ComboBoxContent className="w-64">
          <ComboBoxInput />
          <ComboBoxList>
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

export const DisabledItems: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    const disabledItems = ["Brazil", "China", "Germany"];

    function ListWithDisabled() {
      const { search } = useComboBox<string>();

      const filtered = countries.filter((item) =>
        item.toLowerCase().includes(search.toLowerCase())
      );

      if (filtered.length === 0) {
        return <ComboBoxEmpty />;
      }

      return (
        <>
          {filtered.map((country) => (
            <ComboBoxItem key={country} value={country} disabled={disabledItems.includes(country)}>
              {country}
            </ComboBoxItem>
          ))}
        </>
      );
    }

    return (
      <ComboBox value={value} onValueChange={setValue}>
        <ComboBoxTrigger className="w-64">
          <ComboBoxValue placeholder="Some items disabled..." />
          <ComboBoxIcon />
        </ComboBoxTrigger>
        <ComboBoxContent className="w-64">
          <ComboBoxInput />
          <ComboBoxList>
            <ListWithDisabled />
          </ComboBoxList>
        </ComboBoxContent>
      </ComboBox>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);

    function MultipleFilteredList({ items }: { items: string[] }) {
      const { search } = useComboBox<string, true>();

      const filtered = useMemo(() => {
        if (!search) return items;
        return items.filter((item) => item.toLowerCase().includes(search.toLowerCase()));
      }, [items, search]);

      if (filtered.length === 0) {
        return <ComboBoxEmpty>No countries found</ComboBoxEmpty>;
      }

      return (
        <>
          {filtered.map((country) => (
            <ComboBoxItem key={country} value={country}>
              {country}
            </ComboBoxItem>
          ))}
        </>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <ComboBox value={value} onValueChange={setValue} multiple>
          <ComboBoxTrigger className="w-72">
            <ComboBoxValue placeholder="Select countries..." />
            <ComboBoxIcon />
          </ComboBoxTrigger>
          <ComboBoxContent className="w-72">
            <ComboBoxInput placeholder="Search countries..." />
            <ComboBoxList>
              <MultipleFilteredList items={countries} />
            </ComboBoxList>
          </ComboBoxContent>
        </ComboBox>
        <div className="text-sm text-gray-600">
          Selected: <strong>{value.length > 0 ? value.join(", ") : "None"}</strong>
        </div>
      </div>
    );
  },
};

export const MultipleWithGroups: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["Red", "Blue"]);

    const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];
    const sizes = ["XS", "S", "M", "L", "XL"];

    function ColorSizeList() {
      const { search } = useComboBox<string, true>();

      const filterItems = (items: string[]) =>
        items.filter((item) => item.toLowerCase().includes(search.toLowerCase()));

      const filteredColors = filterItems(colors);
      const filteredSizes = filterItems(sizes);
      const hasResults = filteredColors.length > 0 || filteredSizes.length > 0;

      if (!hasResults) {
        return <ComboBoxEmpty>No options found</ComboBoxEmpty>;
      }

      return (
        <>
          {filteredColors.length > 0 && (
            <ComboBoxGroup>
              <ComboBoxLabel>Colors</ComboBoxLabel>
              {filteredColors.map((color) => (
                <ComboBoxItem key={color} value={color}>
                  {color}
                </ComboBoxItem>
              ))}
            </ComboBoxGroup>
          )}
          {filteredColors.length > 0 && filteredSizes.length > 0 && <ComboBoxSeparator />}
          {filteredSizes.length > 0 && (
            <ComboBoxGroup>
              <ComboBoxLabel>Sizes</ComboBoxLabel>
              {filteredSizes.map((size) => (
                <ComboBoxItem key={size} value={size}>
                  {size}
                </ComboBoxItem>
              ))}
            </ComboBoxGroup>
          )}
        </>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <ComboBox value={value} onValueChange={setValue} multiple>
          <ComboBoxTrigger className="w-72">
            <ComboBoxValue placeholder="Select filters..." />
            <ComboBoxIcon />
          </ComboBoxTrigger>
          <ComboBoxContent className="w-72">
            <ComboBoxInput placeholder="Search options..." />
            <ComboBoxList>
              <ColorSizeList />
            </ComboBoxList>
          </ComboBoxContent>
        </ComboBox>
        <div className="text-sm text-gray-600">
          Selected: <strong>{value.length > 0 ? value.join(", ") : "None"}</strong>
        </div>
        <button
          className="w-fit rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700"
          onClick={() => setValue([])}
        >
          Clear All
        </button>
      </div>
    );
  },
};
