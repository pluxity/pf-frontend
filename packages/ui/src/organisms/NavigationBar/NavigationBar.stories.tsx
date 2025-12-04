import type { Meta, StoryObj } from "@storybook/react";
import { NavigationBar } from "./NavigationBar";
import { Button } from "../../atoms/Button";

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

export const Default: Story = {
  args: {
    logoText: "Brand",
    items: [
      { label: "Home", href: "#", active: true },
      { label: "Products", href: "#" },
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
    ],
    actions: <Button size="sm">Sign In</Button>,
  },
};

export const WithoutItems: Story = {
  args: {
    logoText: "Brand",
    actions: (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          Login
        </Button>
        <Button size="sm">Sign Up</Button>
      </div>
    ),
  },
};

export const CustomLogo: Story = {
  args: {
    logo: (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-brand" />
        <span className="text-lg font-bold">Company</span>
      </div>
    ),
    items: [
      { label: "Dashboard", href: "#", active: true },
      { label: "Analytics", href: "#" },
      { label: "Settings", href: "#" },
    ],
  },
};
