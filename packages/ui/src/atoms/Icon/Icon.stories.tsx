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
  Sliders,
} from "./icons/action";

import { Play, Pause, Stop, Replay } from "./icons/media";

import { SentimentLow, SentimentNormal, SentimentHigh, SentimentDanger } from "./icons/sentiment";

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
        { name: "Sliders", Icon: Sliders },
      ]}
    />
  ),
};

export const MediaIcons: Story = {
  render: () => (
    <IconGrid
      title="Media Icons"
      icons={[
        { name: "Play", Icon: Play },
        { name: "Pause", Icon: Pause },
        { name: "Stop", Icon: Stop },
        { name: "Replay", Icon: Replay },
      ]}
    />
  ),
};

export const SentimentIcons: Story = {
  render: () => (
    <IconGrid
      title="Sentiment Icons (Risk Level)"
      icons={[
        { name: "SentimentLow", Icon: SentimentLow },
        { name: "SentimentNormal", Icon: SentimentNormal },
        { name: "SentimentHigh", Icon: SentimentHigh },
        { name: "SentimentDanger", Icon: SentimentDanger },
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

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Accessibility Examples</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Decorative Icon (기본 - aria-hidden="true")</h4>
          <p className="text-sm text-gray-600 mb-2">
            버튼 텍스트가 의미를 전달하므로 아이콘은 장식용입니다.
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded">
            <Home size="sm" />
            <span>홈으로 가기</span>
          </button>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
            {`<button>
  <Home size="sm" /> {/* aria-hidden="true" 자동 적용 */}
  <span>홈으로 가기</span>
</button>`}
          </pre>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Semantic Icon (aria-label 제공)</h4>
          <p className="text-sm text-gray-600 mb-2">
            텍스트 없이 아이콘만 사용하는 경우 aria-label 필수입니다.
          </p>
          <button className="p-2 bg-blue-500 text-white rounded" aria-label="홈으로 가기">
            <Home size="md" aria-label="홈" />
          </button>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
            {`<button aria-label="홈으로 가기">
  <Home size="md" aria-label="홈" />
  {/* aria-hidden 없음, 스크린 리더가 읽음 */}
</button>`}
          </pre>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Icon Only Button (권장 패턴)</h4>
          <p className="text-sm text-gray-600 mb-2">
            button에 aria-label을 제공하고, 아이콘은 decorative로 유지합니다.
          </p>
          <button className="p-2 bg-blue-500 text-white rounded" aria-label="설정 열기">
            <Settings size="md" />
          </button>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
            {`<button aria-label="설정 열기">
  <Settings size="md" /> {/* aria-hidden="true" */}
</button>`}
          </pre>
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
          { name: "Sliders", Icon: Sliders },
        ]}
      />
      <IconGrid
        title="Media Icons"
        icons={[
          { name: "Play", Icon: Play },
          { name: "Pause", Icon: Pause },
          { name: "Stop", Icon: Stop },
          { name: "Replay", Icon: Replay },
        ]}
      />
      <IconGrid
        title="Sentiment Icons"
        icons={[
          { name: "SentimentLow", Icon: SentimentLow },
          { name: "SentimentNormal", Icon: SentimentNormal },
          { name: "SentimentHigh", Icon: SentimentHigh },
          { name: "SentimentDanger", Icon: SentimentDanger },
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
