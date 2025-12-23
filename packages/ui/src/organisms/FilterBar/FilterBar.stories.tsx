import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ComboBox,
  ComboBoxContent,
  ComboBoxIcon,
  ComboBoxInput,
  ComboBoxItem,
  ComboBoxList,
  ComboBoxTrigger,
  ComboBoxValue,
} from "../../molecules/ComboBox";
import { FilterBar, FilterBarClear, FilterBarSearch, FilterChips, FilterGroup } from "./FilterBar";
import type { FilterConfig, FilterState } from "./types";

const meta: Meta<typeof FilterBar> = {
  title: "Organisms/FilterBar",
  component: FilterBar,
  parameters: {
    layout: "padded",
    docs: { canvas: { height: 400 } },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const statusFilter: FilterConfig = {
  key: "status",
  label: "Status",
  options: [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ],
};

const categoryFilter: FilterConfig = {
  key: "category",
  label: "Category",
  options: [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
    { value: "sports", label: "Sports" },
    { value: "home", label: "Home & Garden" },
  ],
};

const priorityFilter: FilterConfig = {
  key: "priority",
  label: "Priority",
  options: [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ],
};

const filters = [statusFilter, categoryFilter, priorityFilter];

export const Default: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<FilterState>({
      status: [],
      category: [],
      priority: [],
    });

    return (
      <FilterBar filters={filters} filterState={filterState} onFilterStateChange={setFilterState}>
        <div className="flex items-center gap-4">
          <FilterGroup>
            {filters.map((filter) => (
              <ComboBox
                key={filter.key}
                multiple
                value={filterState[filter.key] || []}
                onValueChange={(values) =>
                  setFilterState((prev) => ({ ...prev, [filter.key]: values as string[] }))
                }
              >
                <ComboBoxTrigger className="min-w-[140px]">
                  <ComboBoxValue placeholder={filter.label} />
                  <ComboBoxIcon />
                </ComboBoxTrigger>
                <ComboBoxContent>
                  <ComboBoxInput placeholder={`Search ${filter.label.toLowerCase()}...`} />
                  <ComboBoxList>
                    {filter.options.map((option) => (
                      <ComboBoxItem key={option.value} value={option.value}>
                        {option.label}
                      </ComboBoxItem>
                    ))}
                  </ComboBoxList>
                </ComboBoxContent>
              </ComboBox>
            ))}
          </FilterGroup>
          <FilterBarClear />
        </div>
        <FilterChips />
      </FilterBar>
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<FilterState>({
      status: [],
      category: [],
    });

    const filtersSubset = [statusFilter, categoryFilter];

    return (
      <FilterBar
        filters={filtersSubset}
        filterState={filterState}
        onFilterStateChange={setFilterState}
      >
        <div className="flex items-center gap-4">
          <FilterBarSearch className="w-64" placeholder="Search items..." />
          <FilterGroup>
            {filtersSubset.map((filter) => (
              <ComboBox
                key={filter.key}
                multiple
                value={filterState[filter.key] || []}
                onValueChange={(values) =>
                  setFilterState((prev) => ({ ...prev, [filter.key]: values as string[] }))
                }
              >
                <ComboBoxTrigger className="min-w-[140px]">
                  <ComboBoxValue placeholder={filter.label} />
                  <ComboBoxIcon />
                </ComboBoxTrigger>
                <ComboBoxContent>
                  <ComboBoxList>
                    {filter.options.map((option) => (
                      <ComboBoxItem key={option.value} value={option.value}>
                        {option.label}
                      </ComboBoxItem>
                    ))}
                  </ComboBoxList>
                </ComboBoxContent>
              </ComboBox>
            ))}
          </FilterGroup>
          <FilterBarClear />
        </div>
        <FilterChips />
      </FilterBar>
    );
  },
};

export const PreSelected: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<FilterState>({
      status: ["active", "pending"],
      category: ["electronics"],
      priority: ["high"],
    });

    return (
      <FilterBar filters={filters} filterState={filterState} onFilterStateChange={setFilterState}>
        <div className="flex items-center gap-4">
          <FilterGroup>
            {filters.map((filter) => (
              <ComboBox
                key={filter.key}
                multiple
                value={filterState[filter.key] || []}
                onValueChange={(values) =>
                  setFilterState((prev) => ({ ...prev, [filter.key]: values as string[] }))
                }
              >
                <ComboBoxTrigger className="min-w-[140px]">
                  <ComboBoxValue placeholder={filter.label} />
                  <ComboBoxIcon />
                </ComboBoxTrigger>
                <ComboBoxContent>
                  <ComboBoxList>
                    {filter.options.map((option) => (
                      <ComboBoxItem key={option.value} value={option.value}>
                        {option.label}
                      </ComboBoxItem>
                    ))}
                  </ComboBoxList>
                </ComboBoxContent>
              </ComboBox>
            ))}
          </FilterGroup>
          <FilterBarClear />
        </div>
        <FilterChips showCategory />
      </FilterBar>
    );
  },
};

export const WithoutCategory: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<FilterState>({
      status: ["active"],
      category: ["books"],
    });

    const filtersSubset = [statusFilter, categoryFilter];

    return (
      <FilterBar
        filters={filtersSubset}
        filterState={filterState}
        onFilterStateChange={setFilterState}
      >
        <div className="flex items-center gap-4">
          <FilterGroup>
            {filtersSubset.map((filter) => (
              <ComboBox
                key={filter.key}
                multiple
                value={filterState[filter.key] || []}
                onValueChange={(values) =>
                  setFilterState((prev) => ({ ...prev, [filter.key]: values as string[] }))
                }
              >
                <ComboBoxTrigger className="min-w-[140px]">
                  <ComboBoxValue placeholder={filter.label} />
                  <ComboBoxIcon />
                </ComboBoxTrigger>
                <ComboBoxContent>
                  <ComboBoxList>
                    {filter.options.map((option) => (
                      <ComboBoxItem key={option.value} value={option.value}>
                        {option.label}
                      </ComboBoxItem>
                    ))}
                  </ComboBoxList>
                </ComboBoxContent>
              </ComboBox>
            ))}
          </FilterGroup>
          <FilterBarClear />
        </div>
        <FilterChips showCategory={false} />
      </FilterBar>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<FilterState>({
      status: ["active"],
      category: ["electronics"],
    });

    const filtersSubset = [statusFilter, categoryFilter];

    return (
      <FilterBar
        filters={filtersSubset}
        filterState={filterState}
        onFilterStateChange={setFilterState}
        disabled
      >
        <div className="flex items-center gap-4">
          <FilterGroup>
            {filtersSubset.map((filter) => (
              <ComboBox
                key={filter.key}
                multiple
                value={filterState[filter.key] || []}
                onValueChange={(values) =>
                  setFilterState((prev) => ({ ...prev, [filter.key]: values as string[] }))
                }
                disabled
              >
                <ComboBoxTrigger className="min-w-[140px]">
                  <ComboBoxValue placeholder={filter.label} />
                  <ComboBoxIcon />
                </ComboBoxTrigger>
                <ComboBoxContent>
                  <ComboBoxList>
                    {filter.options.map((option) => (
                      <ComboBoxItem key={option.value} value={option.value}>
                        {option.label}
                      </ComboBoxItem>
                    ))}
                  </ComboBoxList>
                </ComboBoxContent>
              </ComboBox>
            ))}
          </FilterGroup>
          <FilterBarClear />
        </div>
        <FilterChips />
      </FilterBar>
    );
  },
};

export const SingleFilter: Story = {
  render: () => {
    const [filterState, setFilterState] = useState<FilterState>({
      status: [],
    });

    return (
      <FilterBar
        filters={[statusFilter]}
        filterState={filterState}
        onFilterStateChange={setFilterState}
      >
        <div className="flex items-center gap-4">
          <ComboBox
            multiple
            value={filterState.status || []}
            onValueChange={(values) =>
              setFilterState((prev) => ({ ...prev, status: values as string[] }))
            }
          >
            <ComboBoxTrigger className="min-w-[180px]">
              <ComboBoxValue placeholder="Filter by status..." />
              <ComboBoxIcon />
            </ComboBoxTrigger>
            <ComboBoxContent>
              <ComboBoxInput placeholder="Search status..." />
              <ComboBoxList>
                {statusFilter.options.map((option) => (
                  <ComboBoxItem key={option.value} value={option.value}>
                    {option.label}
                  </ComboBoxItem>
                ))}
              </ComboBoxList>
            </ComboBoxContent>
          </ComboBox>
          <FilterBarClear />
        </div>
        <FilterChips showCategory={false} />
      </FilterBar>
    );
  },
};
