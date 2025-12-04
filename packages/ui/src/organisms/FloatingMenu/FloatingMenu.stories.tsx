import type { Meta, StoryObj } from "@storybook/react";
import { FloatingMenu } from "./FloatingMenu";

const meta: Meta<typeof FloatingMenu> = {
  title: "Organisms/FloatingMenu",
  component: FloatingMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex min-h-[400px] items-start justify-center bg-gray-100 p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FloatingMenu>;

const defaultItems = [
  { label: "Dashboard", active: true },
  { label: "Analytics" },
  { label: "Users" },
  { label: "Settings" },
];

export const Collapsed: Story = {
  args: {
    logo: "PLUXITY",
    items: defaultItems,
    defaultExpanded: false,
  },
};

export const Expanded: Story = {
  args: {
    logo: "PLUXITY",
    items: defaultItems,
    defaultExpanded: true,
  },
};

export const Compact: Story = {
  args: {
    logo: "P",
    items: defaultItems,
    compact: true,
    defaultExpanded: false,
  },
};

export const CompactExpanded: Story = {
  args: {
    logo: "P",
    items: defaultItems,
    compact: true,
    defaultExpanded: true,
  },
};

export const WithCustomLogo: Story = {
  args: {
    logo: (
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-brand text-xs font-bold text-white">
          P
        </div>
        <span>PLUXITY</span>
      </div>
    ),
    items: defaultItems,
    defaultExpanded: false,
  },
};

export const ManyItems: Story = {
  args: {
    logo: "PLUXITY",
    items: [
      { label: "Dashboard", active: true },
      { label: "Analytics" },
      { label: "Users" },
      { label: "Products" },
      { label: "Orders" },
      { label: "Settings" },
    ],
    defaultExpanded: true,
  },
};

export const WithLinks: Story = {
  args: {
    logo: "PLUXITY",
    items: [
      { label: "Dashboard", href: "/dashboard", active: true },
      { label: "Analytics", href: "/analytics" },
      { label: "Users", href: "/users" },
      { label: "Settings", href: "/settings" },
    ],
    defaultExpanded: true,
  },
};
