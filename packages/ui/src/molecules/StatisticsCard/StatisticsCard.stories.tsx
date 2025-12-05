import type { Meta, StoryObj } from "@storybook/react";
import { StatisticsCard } from "./StatisticsCard";

const meta: Meta<typeof StatisticsCard> = {
  title: "Molecules/StatisticsCard",
  component: StatisticsCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DollarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const Default: Story = {
  args: {
    title: "Total Users",
    value: "12,345",
    description: "Active accounts",
  },
};

export const WithIcon: Story = {
  args: {
    title: "Total Users",
    value: "12,345",
    icon: <UsersIcon />,
  },
};

export const WithTrend: Story = {
  args: {
    title: "Revenue",
    value: "$45,231",
    icon: <DollarIcon />,
    trend: {
      value: 12.5,
      isPositive: true,
    },
  },
};

export const NegativeTrend: Story = {
  args: {
    title: "Churn Rate",
    value: "2.4%",
    trend: {
      value: 0.8,
      isPositive: false,
    },
    variant: "error",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[600px]">
      <StatisticsCard title="Total Users" value="12,345" variant="default" icon={<UsersIcon />} />
      <StatisticsCard
        title="Active Users"
        value="8,901"
        variant="primary"
        icon={<UsersIcon />}
        trend={{ value: 5.2, isPositive: true }}
      />
      <StatisticsCard
        title="Revenue"
        value="$45,231"
        variant="success"
        icon={<DollarIcon />}
        trend={{ value: 12.5, isPositive: true }}
      />
      <StatisticsCard
        title="Churn Rate"
        value="2.4%"
        variant="error"
        trend={{ value: 0.8, isPositive: false }}
      />
    </div>
  ),
};
