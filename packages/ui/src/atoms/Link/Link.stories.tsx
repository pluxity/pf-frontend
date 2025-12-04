import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Atoms/Link",
  component: Link,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "링크 크기",
    },
    variant: {
      control: "select",
      options: ["default", "muted"],
      description: "링크 스타일",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    external: {
      control: "boolean",
      description: "외부 링크 여부",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    children: "Click here →",
    href: "#",
  },
};

export const Sizes: Story = {
  name: "크기별 링크",
  render: () => (
    <div className="flex flex-col gap-4">
      <Link href="#" size="sm">Small Link →</Link>
      <Link href="#" size="md">Medium Link →</Link>
      <Link href="#" size="lg">Large Link →</Link>
    </div>
  ),
};

export const States: Story = {
  name: "상태별 링크",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-16">Default</span>
        <Link href="#">Click here →</Link>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-16">Hover</span>
        <Link href="#" className="text-blue-700 underline">Click here →</Link>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-16">Visited</span>
        <Link href="#" className="text-purple-600">Click here →</Link>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-16">Disabled</span>
        <Link href="#" disabled>Click here →</Link>
      </div>
    </div>
  ),
};

export const ExternalLink: Story = {
  name: "외부 링크",
  args: {
    children: "외부 사이트로 이동",
    href: "https://example.com",
    external: true,
  },
};

export const MutedVariant: Story = {
  name: "Muted 스타일",
  args: {
    children: "보조 링크",
    href: "#",
    variant: "muted",
  },
};

export const InlineText: Story = {
  name: "텍스트 내 링크",
  render: () => (
    <p className="text-sm text-gray-700 max-w-md">
      자세한 내용은 <Link href="#">이용약관</Link>과{" "}
      <Link href="#">개인정보처리방침</Link>을 확인해주세요.
    </p>
  ),
};
