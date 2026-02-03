import type { Meta, StoryObj } from "@storybook/react";
import { Home, Users, Settings, BarChart, FileText, Bell, Help } from "../../atoms/Icon";
import { Sidebar, useSidebarContext } from "./Sidebar";
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

// ============================================================================
// Composition Pattern Examples
// ============================================================================

export const Default: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header title="Dashboard" />

      <Sidebar.Content>
        <Sidebar.Section label="General" className="dark:text-dark-text-primary">
          <Sidebar.Item icon={<Home size="sm" />} active>
            Home
          </Sidebar.Item>
          <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<FileText size="sm" />}>Reports</Sidebar.Item>
        </Sidebar.Section>

        <Sidebar.Section label="Management" className="dark:text-dark-text-primary">
          <Sidebar.Item icon={<Users size="sm" />}>Users</Sidebar.Item>
          <Sidebar.Item icon={<Bell size="sm" />}>Notifications</Sidebar.Item>
          <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>
        </Sidebar.Section>

        <Sidebar.Section label="Support" className="dark:text-dark-text-primary">
          <Sidebar.Item icon={<Help size="sm" />}>Help Center</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  ),
};

export const CollapseButtonInHeader: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header title="Dashboard">
        <Sidebar.CollapseButton iconOnly />
      </Sidebar.Header>

      <Sidebar.Content>
        <Sidebar.Section label="General">
          <Sidebar.Item icon={<Home size="sm" />} active>
            Home
          </Sidebar.Item>
          <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<FileText size="sm" />}>Reports</Sidebar.Item>
        </Sidebar.Section>

        <Sidebar.Section label="Management">
          <Sidebar.Item icon={<Users size="sm" />}>Users</Sidebar.Item>
          <Sidebar.Item icon={<Bell size="sm" />}>Notifications</Sidebar.Item>
          <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>
    </Sidebar>
  ),
};

export const CollapseButtonInHeaderCollapsed: Story = {
  render: () => (
    <Sidebar defaultCollapsed>
      <Sidebar.Header title="Dashboard">
        <Sidebar.CollapseButton iconOnly />
      </Sidebar.Header>

      <Sidebar.Content>
        <Sidebar.Section label="General">
          <Sidebar.Item icon={<Home size="sm" />} active>
            Home
          </Sidebar.Item>
          <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<FileText size="sm" />}>Reports</Sidebar.Item>
        </Sidebar.Section>

        <Sidebar.Section label="Management">
          <Sidebar.Item icon={<Users size="sm" />}>Users</Sidebar.Item>
          <Sidebar.Item icon={<Bell size="sm" />}>Notifications</Sidebar.Item>
          <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>
    </Sidebar>
  ),
};

export const DefaultCollapsed: Story = {
  render: () => (
    <Sidebar defaultCollapsed>
      <Sidebar.Header title="Dashboard" />

      <Sidebar.Content>
        <Sidebar.Section label="General">
          <Sidebar.Item icon={<Home size="sm" />} active>
            Home
          </Sidebar.Item>
          <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<FileText size="sm" />}>Reports</Sidebar.Item>
        </Sidebar.Section>

        <Sidebar.Section label="Management">
          <Sidebar.Item icon={<Users size="sm" />}>Users</Sidebar.Item>
          <Sidebar.Item icon={<Bell size="sm" />}>Notifications</Sidebar.Item>
          <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  ),
};

export const WithoutCollapseButton: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header title="Dashboard" />

      <Sidebar.Content>
        <Sidebar.Section label="General">
          <Sidebar.Item icon={<Home size="sm" />} active>
            Home
          </Sidebar.Item>
          <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<FileText size="sm" />}>Reports</Sidebar.Item>
        </Sidebar.Section>

        <Sidebar.Section label="Management">
          <Sidebar.Item icon={<Users size="sm" />}>Users</Sidebar.Item>
          <Sidebar.Item icon={<Bell size="sm" />}>Notifications</Sidebar.Item>
          <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>
    </Sidebar>
  ),
};

export const WithNestedItems: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header title="Admin Panel" />

      <Sidebar.Content>
        <Sidebar.Section label="Navigation">
          <Sidebar.Item icon={<Home size="sm" />} active>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item icon={<Users size="sm" />}>
            Users
            <Sidebar.Item>All Users</Sidebar.Item>
            <Sidebar.Item>Add User</Sidebar.Item>
            <Sidebar.Item>Roles</Sidebar.Item>
          </Sidebar.Item>
          <Sidebar.Item icon={<Settings size="sm" />}>
            Settings
            <Sidebar.Item>General</Sidebar.Item>
            <Sidebar.Item>Security</Sidebar.Item>
            <Sidebar.Item>Notifications</Sidebar.Item>
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  ),
};

function UserProfile() {
  const { collapsed } = useSidebarContext();

  if (collapsed) {
    return (
      <Avatar size="sm">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="flex items-center gap-3 pb-3">
      <Avatar size="sm">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-sm font-medium">John Doe</div>
        <div className="text-xs text-gray-500">john@example.com</div>
      </div>
    </div>
  );
}

export const WithUserProfile: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header title="Dashboard" />

      <Sidebar.Content>
        <Sidebar.Item icon={<Home size="sm" />} active>
          Home
        </Sidebar.Item>
        <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>
        <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>
      </Sidebar.Content>

      <Sidebar.Footer>
        <UserProfile />
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  ),
};

export const WithCustomLogo: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header
        title="My App"
        logo={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <span className="text-sm font-bold text-white">M</span>
          </div>
        }
      />

      <Sidebar.Content>
        <Sidebar.Section label="General">
          <Sidebar.Item icon={<Home size="sm" />} active>
            Home
          </Sidebar.Item>
          <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<FileText size="sm" />}>Reports</Sidebar.Item>
        </Sidebar.Section>

        <Sidebar.Section label="Management">
          <Sidebar.Item icon={<Users size="sm" />}>Users</Sidebar.Item>
          <Sidebar.Item icon={<Bell size="sm" />}>Notifications</Sidebar.Item>
          <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  ),
};

export const WithSeparators: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header title="Dashboard" />

      <Sidebar.Content>
        <Sidebar.Item icon={<Home size="sm" />} active>
          Home
        </Sidebar.Item>
        <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>

        <Sidebar.Separator />

        <Sidebar.Item icon={<Users size="sm" />}>Users</Sidebar.Item>
        <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>

        <Sidebar.Separator />

        <Sidebar.Item icon={<Help size="sm" />}>Help Center</Sidebar.Item>
      </Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  ),
};

export const WithCustomContent: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header title="Dashboard" />

      <Sidebar.Content>
        <Sidebar.Section label="Navigation">
          <Sidebar.Item icon={<Home size="sm" />} active>
            Home
          </Sidebar.Item>
          <Sidebar.Item icon={<BarChart size="sm" />}>Analytics</Sidebar.Item>
        </Sidebar.Section>

        <Sidebar.Custom>
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="text-xs font-semibold text-blue-900">Pro Tip</div>
            <div className="mt-1 text-xs text-blue-700">
              Use keyboard shortcuts to navigate faster
            </div>
          </div>
        </Sidebar.Custom>

        <Sidebar.Section label="Settings">
          <Sidebar.Item icon={<Settings size="sm" />}>Settings</Sidebar.Item>
          <Sidebar.Item icon={<Help size="sm" />}>Help</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  ),
};

export const WithLinks: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Header title="Dashboard" />

      <Sidebar.Content>
        <Sidebar.Section label="Pages">
          <Sidebar.Item icon={<Home size="sm" />} href="/dashboard" active>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item icon={<BarChart size="sm" />} href="/analytics">
            Analytics
          </Sidebar.Item>
          <Sidebar.Item icon={<Users size="sm" />} href="/users">
            Users
          </Sidebar.Item>
          <Sidebar.Item icon={<Settings size="sm" />} href="/settings">
            Settings
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  ),
};
