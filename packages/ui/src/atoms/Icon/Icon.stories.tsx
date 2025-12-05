import type { Meta, StoryObj } from "@storybook/react";
import type { IconProps } from "./types";

import { Sunny, Cloudy, PartlyCloudy, Rainy, Stormy, Snowy, Foggy, Windy } from "./icons/weather";

import {
  View3D,
  Building,
  Event,
  IoT,
  Park,
  CCTV,
  Layer,
  Chart,
  Dashboard,
  Graph,
  Map,
  Logout,
  Folding,
} from "./icons/custom";

import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronLeftDouble,
  ChevronRightDouble,
  X,
  ChevronLeftSmall,
  ChevronRightSmall,
  ChevronUpSmall,
  ChevronDownSmall,
  ChevronUpDownSmall,
  Home,
  ExternalLink,
} from "./icons/navigation";

import {
  Plus,
  Minus,
  Edit,
  Refresh,
  Search,
  Close,
  Menu,
  MoreVertical,
  Shrink,
} from "./icons/action";

import { Info, Help, Calendar, Eye, EyeOff, Bell, User, Mic, Settings } from "./icons/status";

const meta = {
  title: "Atoms/Icon",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "아이콘 크기",
    },
  },
} satisfies Meta<IconProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const IconGrid = ({
  icons,
  title,
}: {
  icons: { name: string; Icon: React.ComponentType<IconProps> }[];
  title: string;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">{title}</h3>
    <div className="grid grid-cols-4 gap-4">
      {icons.map(({ name, Icon }) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
        >
          <Icon size="lg" />
          <span className="text-xs text-gray-500">{name}</span>
        </div>
      ))}
    </div>
  </div>
);

export const WeatherIcons: Story = {
  render: () => (
    <IconGrid
      title="Weather Icons"
      icons={[
        { name: "Sunny", Icon: Sunny },
        { name: "Cloudy", Icon: Cloudy },
        { name: "PartlyCloudy", Icon: PartlyCloudy },
        { name: "Rainy", Icon: Rainy },
        { name: "Stormy", Icon: Stormy },
        { name: "Snowy", Icon: Snowy },
        { name: "Foggy", Icon: Foggy },
        { name: "Windy", Icon: Windy },
      ]}
    />
  ),
};

export const NavigationIcons: Story = {
  render: () => (
    <IconGrid
      title="Navigation Icons"
      icons={[
        { name: "ChevronLeft", Icon: ChevronLeft },
        { name: "ChevronRight", Icon: ChevronRight },
        { name: "ChevronUp", Icon: ChevronUp },
        { name: "ChevronDown", Icon: ChevronDown },
        { name: "ChevronLeftDouble", Icon: ChevronLeftDouble },
        { name: "ChevronRightDouble", Icon: ChevronRightDouble },
        { name: "X", Icon: X },
        { name: "ChevronLeftSmall", Icon: ChevronLeftSmall },
        { name: "ChevronRightSmall", Icon: ChevronRightSmall },
        { name: "ChevronUpSmall", Icon: ChevronUpSmall },
        { name: "ChevronDownSmall", Icon: ChevronDownSmall },
        { name: "ChevronUpDownSmall", Icon: ChevronUpDownSmall },
        { name: "Home", Icon: Home },
        { name: "ExternalLink", Icon: ExternalLink },
      ]}
    />
  ),
};

export const ActionIcons: Story = {
  render: () => (
    <IconGrid
      title="Action Icons"
      icons={[
        { name: "Plus", Icon: Plus },
        { name: "Minus", Icon: Minus },
        { name: "Edit", Icon: Edit },
        { name: "Refresh", Icon: Refresh },
        { name: "Search", Icon: Search },
        { name: "Close", Icon: Close },
        { name: "Menu", Icon: Menu },
        { name: "MoreVertical", Icon: MoreVertical },
        { name: "Shrink", Icon: Shrink },
      ]}
    />
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <IconGrid
      title="Status Icons"
      icons={[
        { name: "Info", Icon: Info },
        { name: "Help", Icon: Help },
        { name: "Calendar", Icon: Calendar },
        { name: "Eye", Icon: Eye },
        { name: "EyeOff", Icon: EyeOff },
        { name: "Bell", Icon: Bell },
        { name: "User", Icon: User },
        { name: "Mic", Icon: Mic },
        { name: "Settings", Icon: Settings },
      ]}
    />
  ),
};

export const CustomIcons: Story = {
  render: () => (
    <IconGrid
      title="Custom Icons"
      icons={[
        { name: "View3D", Icon: View3D },
        { name: "Building", Icon: Building },
        { name: "Event", Icon: Event },
        { name: "IoT", Icon: IoT },
        { name: "Park", Icon: Park },
        { name: "CCTV", Icon: CCTV },
        { name: "Layer", Icon: Layer },
        { name: "Chart", Icon: Chart },
        { name: "Dashboard", Icon: Dashboard },
        { name: "Graph", Icon: Graph },
        { name: "Map", Icon: Map },
        { name: "Logout", Icon: Logout },
        { name: "Folding", Icon: Folding },
      ]}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Icon Sizes</h3>
      <div className="flex items-end gap-8">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <Building size={size} />
            <span className="text-xs text-gray-500">{size}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
          <Building size={32} />
          <span className="text-xs text-gray-500">32px</span>
        </div>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Icon Colors</h3>
      <div className="flex gap-8">
        <div className="text-blue-500 flex flex-col items-center gap-2">
          <Building size="xl" />
          <span className="text-xs">Blue</span>
        </div>
        <div className="text-red-500 flex flex-col items-center gap-2">
          <Bell size="xl" />
          <span className="text-xs">Red</span>
        </div>
        <div className="text-green-500 flex flex-col items-center gap-2">
          <Park size="xl" />
          <span className="text-xs">Green</span>
        </div>
        <div className="text-purple-500 flex flex-col items-center gap-2">
          <Settings size="xl" />
          <span className="text-xs">Purple</span>
        </div>
      </div>
    </div>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <IconGrid
        title="Weather Icons"
        icons={[
          { name: "Sunny", Icon: Sunny },
          { name: "Cloudy", Icon: Cloudy },
          { name: "PartlyCloudy", Icon: PartlyCloudy },
          { name: "Rainy", Icon: Rainy },
          { name: "Stormy", Icon: Stormy },
          { name: "Snowy", Icon: Snowy },
          { name: "Foggy", Icon: Foggy },
          { name: "Windy", Icon: Windy },
        ]}
      />
      <IconGrid
        title="Navigation Icons"
        icons={[
          { name: "ChevronLeft", Icon: ChevronLeft },
          { name: "ChevronRight", Icon: ChevronRight },
          { name: "ChevronUp", Icon: ChevronUp },
          { name: "ChevronDown", Icon: ChevronDown },
          { name: "ChevronLeftDouble", Icon: ChevronLeftDouble },
          { name: "ChevronRightDouble", Icon: ChevronRightDouble },
          { name: "X", Icon: X },
          { name: "ChevronLeftSmall", Icon: ChevronLeftSmall },
          { name: "ChevronRightSmall", Icon: ChevronRightSmall },
          { name: "ChevronUpSmall", Icon: ChevronUpSmall },
          { name: "ChevronDownSmall", Icon: ChevronDownSmall },
          { name: "ChevronUpDownSmall", Icon: ChevronUpDownSmall },
          { name: "Home", Icon: Home },
          { name: "ExternalLink", Icon: ExternalLink },
        ]}
      />
      <IconGrid
        title="Action Icons"
        icons={[
          { name: "Plus", Icon: Plus },
          { name: "Minus", Icon: Minus },
          { name: "Edit", Icon: Edit },
          { name: "Refresh", Icon: Refresh },
          { name: "Search", Icon: Search },
          { name: "Close", Icon: Close },
          { name: "Menu", Icon: Menu },
          { name: "MoreVertical", Icon: MoreVertical },
          { name: "Shrink", Icon: Shrink },
        ]}
      />
      <IconGrid
        title="Status Icons"
        icons={[
          { name: "Info", Icon: Info },
          { name: "Help", Icon: Help },
          { name: "Calendar", Icon: Calendar },
          { name: "Eye", Icon: Eye },
          { name: "EyeOff", Icon: EyeOff },
          { name: "Bell", Icon: Bell },
          { name: "User", Icon: User },
          { name: "Mic", Icon: Mic },
          { name: "Settings", Icon: Settings },
        ]}
      />
      <IconGrid
        title="Custom Icons"
        icons={[
          { name: "View3D", Icon: View3D },
          { name: "Building", Icon: Building },
          { name: "Event", Icon: Event },
          { name: "IoT", Icon: IoT },
          { name: "Park", Icon: Park },
          { name: "CCTV", Icon: CCTV },
          { name: "Layer", Icon: Layer },
          { name: "Chart", Icon: Chart },
          { name: "Dashboard", Icon: Dashboard },
          { name: "Graph", Icon: Graph },
          { name: "Map", Icon: Map },
          { name: "Logout", Icon: Logout },
          { name: "Folding", Icon: Folding },
        ]}
      />
    </div>
  ),
};
