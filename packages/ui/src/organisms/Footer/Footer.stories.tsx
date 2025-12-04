import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";

const meta = {
  title: "Organisms/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logoText: "Company",
    tagline: "Building great products",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "#" },
          { label: "Pricing", href: "#" },
          { label: "Documentation", href: "#" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "#" },
          { label: "Blog", href: "#" },
          { label: "Careers", href: "#" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", href: "#" },
          { label: "Contact", href: "#" },
          { label: "Status", href: "#" },
        ],
      },
    ],
    copyright: "2024 Company, Inc. All rights reserved.",
  },
};

export const WithSocialLinks: Story = {
  args: {
    logoText: "Brand",
    tagline: "Connecting people worldwide",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "#" },
          { label: "Integrations", href: "#" },
          { label: "Pricing", href: "#" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Blog", href: "#" },
          { label: "Guides", href: "#" },
          { label: "Webinars", href: "#" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "#" },
          { label: "Terms", href: "#" },
          { label: "Cookies", href: "#" },
        ],
      },
    ],
    socialLinks: [
      { platform: "twitter", href: "#" },
      { platform: "github", href: "#" },
      { platform: "linkedin", href: "#" },
    ],
    copyright: "2024 Brand. All rights reserved.",
  },
};

export const Simple: Story = {
  args: {
    logoText: "Simple",
    copyright: "2024 Simple Inc.",
    columns: [
      {
        title: "Links",
        links: [
          { label: "Home", href: "#" },
          { label: "About", href: "#" },
          { label: "Contact", href: "#" },
        ],
      },
    ],
  },
};

export const WithCustomLogo: Story = {
  args: {
    logo: (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-brand" />
        <span className="text-xl font-bold text-brand">MyApp</span>
      </div>
    ),
    tagline: "Your productivity companion",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "#" },
          { label: "Pricing", href: "#" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Help", href: "#" },
          { label: "Contact", href: "#" },
        ],
      },
    ],
    copyright: "2024 MyApp",
  },
};

export const ManyColumns: Story = {
  args: {
    logoText: "Enterprise",
    tagline: "Enterprise solutions for modern businesses",
    columns: [
      {
        title: "Products",
        links: [
          { label: "Analytics", href: "#" },
          { label: "Commerce", href: "#" },
          { label: "Insights", href: "#" },
        ],
      },
      {
        title: "Solutions",
        links: [
          { label: "Marketing", href: "#" },
          { label: "Sales", href: "#" },
          { label: "Support", href: "#" },
        ],
      },
      {
        title: "Developers",
        links: [
          { label: "API", href: "#" },
          { label: "SDKs", href: "#" },
          { label: "Webhooks", href: "#" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "#" },
          { label: "Blog", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Press", href: "#" },
        ],
      },
    ],
    socialLinks: [
      { platform: "twitter", href: "#" },
      { platform: "github", href: "#" },
      { platform: "linkedin", href: "#" },
      { platform: "youtube", href: "#" },
    ],
    copyright: "2024 Enterprise Corp. All rights reserved.",
  },
};
