import type { Meta, StoryObj } from "@storybook/react";
import { FloatingMenu } from "./FloatingMenu";
import { Home, Settings, Users, BarChart, Upload, Package, Layer } from "../../atoms/Icon";
import { Badge } from "../../atoms/Badge";
import { Slider } from "../../atoms/Slider";
import { useState } from "react";

const meta: Meta<typeof FloatingMenu> = {
  title: "Organisms/FloatingMenu",
  component: FloatingMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex min-h-400 items-start justify-center bg-gray-100 p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FloatingMenu>;

// ============================================================================
// Composition Pattern Examples
// ============================================================================

export const Default: Story = {
  render: () => (
    <FloatingMenu logo="PLUXITY" defaultExpanded>
      <FloatingMenu.Item icon={<Home size="sm" />} active>
        Dashboard
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<BarChart size="sm" />}>Analytics</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Users size="sm" />}>Users</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>
    </FloatingMenu>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <FloatingMenu logo="PLUXITY" defaultExpanded={false}>
      <FloatingMenu.Item icon={<Home size="sm" />} active>
        Dashboard
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<BarChart size="sm" />}>Analytics</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Users size="sm" />}>Users</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>
    </FloatingMenu>
  ),
};

export const Compact: Story = {
  render: () => (
    <FloatingMenu logo="P" compact defaultExpanded={false}>
      <FloatingMenu.Item icon={<Home size="sm" />} active>
        Dashboard
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<BarChart size="sm" />}>Analytics</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Users size="sm" />}>Users</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>
    </FloatingMenu>
  ),
};

export const CompactExpanded: Story = {
  render: () => (
    <FloatingMenu logo="P" compact defaultExpanded>
      <FloatingMenu.Item icon={<Home size="sm" />} active>
        Dashboard
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<BarChart size="sm" />}>Analytics</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Users size="sm" />}>Users</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>
    </FloatingMenu>
  ),
};

export const WithCustomLogo: Story = {
  render: () => (
    <FloatingMenu
      logo={
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-brand text-xs font-bold text-white">
            P
          </div>
          <span>PLUXITY</span>
        </div>
      }
      defaultExpanded
    >
      <FloatingMenu.Item icon={<Home size="sm" />} active>
        Dashboard
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<BarChart size="sm" />}>Analytics</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Users size="sm" />}>Users</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>
    </FloatingMenu>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <FloatingMenu logo="PLUXITY" defaultExpanded>
      <FloatingMenu.Group label="Main">
        <FloatingMenu.Item icon={<Home size="sm" />} active>
          Dashboard
        </FloatingMenu.Item>
        <FloatingMenu.Item icon={<BarChart size="sm" />}>Analytics</FloatingMenu.Item>
      </FloatingMenu.Group>

      <FloatingMenu.Separator />

      <FloatingMenu.Group label="Settings">
        <FloatingMenu.Item icon={<Users size="sm" />}>Users</FloatingMenu.Item>
        <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>
      </FloatingMenu.Group>
    </FloatingMenu>
  ),
};

export const WithSeparators: Story = {
  render: () => (
    <FloatingMenu logo="PLUXITY" defaultExpanded>
      <FloatingMenu.Item icon={<Home size="sm" />} active>
        Dashboard
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<BarChart size="sm" />}>Analytics</FloatingMenu.Item>

      <FloatingMenu.Separator />

      <FloatingMenu.Item icon={<Users size="sm" />}>Users</FloatingMenu.Item>
      <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>

      <FloatingMenu.Separator />

      <FloatingMenu.Item icon={<Package size="sm" />}>Products</FloatingMenu.Item>
    </FloatingMenu>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <FloatingMenu logo="PLUXITY" defaultExpanded>
      <FloatingMenu.Item icon={<Home size="sm" />} active>
        Dashboard
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<BarChart size="sm" />}>
        <div className="flex w-full items-center justify-between">
          <span>Analytics</span>
          <Badge variant="primary">New</Badge>
        </div>
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<Users size="sm" />}>
        <div className="flex w-full items-center justify-between">
          <span>Users</span>
          <Badge variant="default">23</Badge>
        </div>
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>
    </FloatingMenu>
  ),
};

export const WithLinks: Story = {
  render: () => (
    <FloatingMenu logo="PLUXITY" defaultExpanded>
      <FloatingMenu.Item icon={<Home size="sm" />} href="/dashboard" active>
        Dashboard
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<BarChart size="sm" />} href="/analytics">
        Analytics
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<Users size="sm" />} href="/users">
        Users
      </FloatingMenu.Item>
      <FloatingMenu.Item icon={<Settings size="sm" />} href="/settings">
        Settings
      </FloatingMenu.Item>
    </FloatingMenu>
  ),
};

export const WithCustomContent: Story = {
  render: () => {
    const [scale, setScale] = useState(1.0);

    return (
      <FloatingMenu logo="3D Tools" defaultExpanded>
        <FloatingMenu.Group label="Model">
          <FloatingMenu.Item icon={<Upload size="sm" />}>Upload GLB</FloatingMenu.Item>
          <FloatingMenu.Item icon={<Layer size="sm" />} active>
            Adjust Position
          </FloatingMenu.Item>
        </FloatingMenu.Group>

        <FloatingMenu.Separator />

        <FloatingMenu.Group label="Transform">
          <FloatingMenu.Custom>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Scale</span>
                <span className="font-medium text-gray-800">{scale.toFixed(2)}</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={([value]) => setScale(value)}
                min={0.1}
                max={5.0}
                step={0.1}
              />
            </div>
          </FloatingMenu.Custom>
        </FloatingMenu.Group>

        <FloatingMenu.Separator />

        <FloatingMenu.Item icon={<Package size="sm" />}>Preview</FloatingMenu.Item>
      </FloatingMenu>
    );
  },
};

export const ComplexExample: Story = {
  render: () => {
    const [quality, setQuality] = useState(75);

    return (
      <FloatingMenu
        logo={
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
              3D
            </div>
            <span>Editor</span>
          </div>
        }
        defaultExpanded
      >
        <FloatingMenu.Group label="File">
          <FloatingMenu.Item icon={<Upload size="sm" />}>
            <div className="flex w-full items-center justify-between">
              <span>Import Model</span>
              <Badge variant="success">GLB</Badge>
            </div>
          </FloatingMenu.Item>
          <FloatingMenu.Item icon={<Package size="sm" />}>Export</FloatingMenu.Item>
        </FloatingMenu.Group>

        <FloatingMenu.Separator />

        <FloatingMenu.Group label="Settings">
          <FloatingMenu.Item icon={<Layer size="sm" />} active>
            Layers
          </FloatingMenu.Item>

          <FloatingMenu.Custom>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Quality</span>
                  <span className="font-medium text-gray-800">{quality}%</span>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={([value]) => setQuality(value)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-500 text-xs">
                  ⚠
                </div>
                <div className="text-xs text-gray-600">High quality uses more memory</div>
              </div>
            </div>
          </FloatingMenu.Custom>
        </FloatingMenu.Group>

        <FloatingMenu.Separator />

        <FloatingMenu.Item icon={<Settings size="sm" />}>Preferences</FloatingMenu.Item>
      </FloatingMenu>
    );
  },
};
