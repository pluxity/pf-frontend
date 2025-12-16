import type { Meta, StoryObj } from "@storybook/react";
import { Home, Users, Settings, BarChart, FileText, Bell, Help } from "../../atoms/Icon";
import { Sidebar, CollapsibleSidebar } from "./Sidebar";
import { Avatar, AvatarFallback } from "../../atoms/Avatar";

const meta: Meta<typeof Sidebar> = {
  title: "Organisms/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex h-screen bg-gray-100">
        <Story />
        <div className="flex-1 p-8">
          <p className="text-gray-500">Main content area</p>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const defaultSections = [
  {
    label: "General",
    items: [
      { icon: <Home size="sm" />, label: "Home", active: true },
      { icon: <BarChart size="sm" />, label: "Analytics" },
      { icon: <FileText size="sm" />, label: "Reports" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: <Users size="sm" />, label: "Users" },
      { icon: <Bell size="sm" />, label: "Notifications" },
      { icon: <Settings size="sm" />, label: "Settings" },
    ],
  },
  {
    label: "Support",
    items: [{ icon: <Help size="sm" />, label: "Help Center" }],
  },
];

export const Default: Story = {
  args: {
    title: "Dashboard",
    sections: defaultSections,
    collapsible: true,
  },
};

export const DefaultCollapsed: Story = {
  args: {
    title: "Dashboard",
    sections: defaultSections,
    collapsible: true,
    defaultCollapsed: true,
  },
};

export const NonCollapsible: Story = {
  args: {
    title: "Dashboard",
    sections: defaultSections,
    collapsible: false,
  },
};

export const WithNestedItems: Story = {
  args: {
    title: "Admin Panel",
    sections: [
      {
        label: "Navigation",
        items: [
          { icon: <Home size="sm" />, label: "Dashboard", active: true },
          {
            icon: <Users size="sm" />,
            label: "Users",
            children: [{ label: "All Users" }, { label: "Add User" }, { label: "Roles" }],
          },
          {
            icon: <Settings size="sm" />,
            label: "Settings",
            children: [{ label: "General" }, { label: "Security" }, { label: "Notifications" }],
          },
        ],
      },
    ],
    collapsible: true,
  },
};

export const WithFooter: Story = {
  args: {
    title: "Dashboard",
    sections: [
      {
        items: [
          { icon: <Home size="sm" />, label: "Home", active: true },
          { icon: <BarChart size="sm" />, label: "Analytics" },
          { icon: <Settings size="sm" />, label: "Settings" },
        ],
      },
    ],
    collapsible: true,
    footer: (
      <div className="flex items-center gap-3">
        <Avatar size="sm">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="text-sm font-medium">John Doe</div>
          <div className="text-xs text-gray-500">john@example.com</div>
        </div>
      </div>
    ),
  },
};

export const WithCustomLogo: Story = {
  args: {
    title: "My App",
    logo: (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
        <span className="text-sm font-bold text-white">M</span>
      </div>
    ),
    sections: defaultSections,
    collapsible: true,
  },
};

export const UsingCollapsibleSidebarAlias: Story = {
  render: () => (
    <CollapsibleSidebar title="Using Alias" sections={defaultSections} collapsible={true} />
  ),
};
