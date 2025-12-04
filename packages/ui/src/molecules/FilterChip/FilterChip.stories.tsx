import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterChip, FilterChipGroup } from "./FilterChip";

const meta = {
  title: "Molecules/FilterChip",
  component: FilterChip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    selected: {
      control: "boolean",
      description: "선택 상태",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    removable: {
      control: "boolean",
      description: "삭제 버튼 표시 (선택 시)",
    },
    category: {
      control: "text",
      description: "카테고리 레이블",
    },
    showCheckIcon: {
      control: "boolean",
      description: "선택 시 체크 아이콘 표시",
    },
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Filter",
  },
};

export const Selected: Story = {
  args: {
    children: "Selected",
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

export const WithCategory: Story = {
  args: {
    children: "Electronics",
    category: "Category",
    selected: true,
  },
};

export const WithCheckIcon: Story = {
  args: {
    children: "With Check",
    selected: true,
    showCheckIcon: true,
  },
};

export const Removable: Story = {
  args: {
    children: "Removable",
    selected: true,
    removable: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    return (
      <FilterChip
        selected={selected}
        onChange={setSelected}
      >
        Click me
      </FilterChip>
    );
  },
};

export const FilterGroup: Story = {
  render: () => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>(["all"]);

    const toggleFilter = (filter: string) => {
      setSelectedFilters((prev) =>
        prev.includes(filter)
          ? prev.filter((f) => f !== filter)
          : [...prev, filter]
      );
    };

    return (
      <FilterChipGroup>
        <FilterChip
          selected={selectedFilters.includes("all")}
          onChange={() => toggleFilter("all")}
        >
          All
        </FilterChip>
        <FilterChip
          selected={selectedFilters.includes("active")}
          onChange={() => toggleFilter("active")}
        >
          Active
        </FilterChip>
        <FilterChip
          selected={selectedFilters.includes("pending")}
          onChange={() => toggleFilter("pending")}
        >
          Pending
        </FilterChip>
        <FilterChip
          selected={selectedFilters.includes("completed")}
          onChange={() => toggleFilter("completed")}
        >
          Completed
        </FilterChip>
      </FilterChipGroup>
    );
  },
};

export const CategoryFilters: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>("electronics");

    return (
      <FilterChipGroup>
        <FilterChip
          category="Category"
          selected={selected === "electronics"}
          onChange={() => setSelected("electronics")}
          removable
          onRemove={() => setSelected(null)}
        >
          Electronics
        </FilterChip>
        <FilterChip
          category="Category"
          selected={selected === "clothing"}
          onChange={() => setSelected("clothing")}
          removable
          onRemove={() => setSelected(null)}
        >
          Clothing
        </FilterChip>
        <FilterChip
          category="Category"
          selected={selected === "books"}
          onChange={() => setSelected("books")}
          removable
          onRemove={() => setSelected(null)}
        >
          Books
        </FilterChip>
      </FilterChipGroup>
    );
  },
};
