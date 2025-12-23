import type { Meta, StoryObj } from "@storybook/react";
import { NavigationBar } from "./NavigationBar";
import { Button } from "../../atoms/Button";
import { Avatar, AvatarFallback } from "../../atoms/Avatar";
import { Bell, Search } from "../../atoms/Icon";

const meta: Meta<typeof NavigationBar> = {
  title: "Organisms/NavigationBar",
  component: NavigationBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

// ============================================================================
// Composition Pattern Examples
// ============================================================================

export const Default: Story = {
  render: () => (
    <NavigationBar logoText="Brand" actions={<Button size="sm">Sign In</Button>}>
      <NavigationBar.Item href="#" active>
        Home
      </NavigationBar.Item>
      <NavigationBar.Item href="#">Products</NavigationBar.Item>
      <NavigationBar.Item href="#">About</NavigationBar.Item>
      <NavigationBar.Item href="#">Contact</NavigationBar.Item>
    </NavigationBar>
  ),
};

export const WithoutItems: Story = {
  render: () => (
    <NavigationBar
      logoText="Brand"
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            Login
          </Button>
          <Button size="sm">Sign Up</Button>
        </div>
      }
    />
  ),
};

export const WithCustomLogo: Story = {
  render: () => (
    <NavigationBar
      logo={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand" />
          <span className="text-lg font-bold">Company</span>
        </div>
      }
    >
      <NavigationBar.Item href="#" active>
        Dashboard
      </NavigationBar.Item>
      <NavigationBar.Item href="#">Analytics</NavigationBar.Item>
      <NavigationBar.Item href="#">Settings</NavigationBar.Item>
    </NavigationBar>
  ),
};

export const WithLogoComponent: Story = {
  render: () => (
    <NavigationBar>
      <NavigationBar.Logo>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
          <span className="text-lg font-bold text-gray-900">Acme Inc</span>
        </div>
      </NavigationBar.Logo>
      <NavigationBar.Item href="#" active>
        Home
      </NavigationBar.Item>
      <NavigationBar.Item href="#">Features</NavigationBar.Item>
      <NavigationBar.Item href="#">Pricing</NavigationBar.Item>
    </NavigationBar>
  ),
};

export const WithActionsComponent: Story = {
  render: () => (
    <NavigationBar logoText="Dashboard">
      <NavigationBar.Item href="#" active>
        Overview
      </NavigationBar.Item>
      <NavigationBar.Item href="#">Projects</NavigationBar.Item>
      <NavigationBar.Item href="#">Team</NavigationBar.Item>
      <NavigationBar.Actions>
        <Button variant="ghost" size="icon-sm">
          <Search size="sm" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Bell size="sm" />
        </Button>
        <Avatar size="sm">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </NavigationBar.Actions>
    </NavigationBar>
  ),
};

export const FullyComposed: Story = {
  render: () => (
    <NavigationBar>
      <NavigationBar.Logo>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
          <div>
            <div className="text-base font-bold text-gray-900">My App</div>
            <div className="text-xs text-gray-500">v2.0</div>
          </div>
        </div>
      </NavigationBar.Logo>

      <NavigationBar.Item href="#" active>
        Dashboard
      </NavigationBar.Item>
      <NavigationBar.Item href="#">Analytics</NavigationBar.Item>
      <NavigationBar.Item href="#">Reports</NavigationBar.Item>
      <NavigationBar.Item href="#">Settings</NavigationBar.Item>

      <NavigationBar.Actions>
        <Button variant="ghost" size="sm">
          Help
        </Button>
        <Button size="sm">Upgrade</Button>
        <Avatar size="sm">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      </NavigationBar.Actions>
    </NavigationBar>
  ),
};

export const MinimalDesign: Story = {
  render: () => (
    <NavigationBar logoText="Brand">
      <NavigationBar.Item href="#" active>
        Home
      </NavigationBar.Item>
      <NavigationBar.Item href="#">Docs</NavigationBar.Item>
      <NavigationBar.Item href="#">Blog</NavigationBar.Item>
    </NavigationBar>
  ),
};

export const WithManyItems: Story = {
  render: () => (
    <NavigationBar
      logoText="Portal"
      actions={
        <NavigationBar.Actions>
          <Button variant="ghost" size="sm">
            Support
          </Button>
          <Avatar size="sm">
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </NavigationBar.Actions>
      }
    >
      <NavigationBar.Item href="#" active>
        Home
      </NavigationBar.Item>
      <NavigationBar.Item href="#">Products</NavigationBar.Item>
      <NavigationBar.Item href="#">Solutions</NavigationBar.Item>
      <NavigationBar.Item href="#">Pricing</NavigationBar.Item>
      <NavigationBar.Item href="#">Resources</NavigationBar.Item>
      <NavigationBar.Item href="#">Company</NavigationBar.Item>
      <NavigationBar.Item href="#">Contact</NavigationBar.Item>
    </NavigationBar>
  ),
};
