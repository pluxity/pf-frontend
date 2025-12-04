import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle, Clock, Package } from "../../atoms/Icon";
import { Timeline } from "./Timeline";

const meta = {
  title: "Organisms/Timeline",
  component: Timeline,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        title: "Order Placed",
        description: "Your order has been placed successfully",
        time: "2024-01-15 09:00",
      },
      {
        title: "Processing",
        description: "Your order is being processed",
        time: "2024-01-15 10:30",
      },
      {
        title: "Shipped",
        description: "Your order has been shipped",
        time: "2024-01-16 14:00",
      },
    ],
  },
};

export const WithVariants: Story = {
  args: {
    items: [
      {
        title: "Completed",
        description: "Task completed successfully",
        time: "10:00 AM",
        variant: "success",
      },
      {
        title: "In Progress",
        description: "Currently working on this",
        time: "11:30 AM",
        variant: "warning",
      },
      {
        title: "Failed",
        description: "This task failed",
        time: "12:00 PM",
        variant: "error",
      },
      {
        title: "Pending",
        description: "Waiting to start",
        time: "1:00 PM",
        variant: "default",
      },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        title: "Order Confirmed",
        description: "Your order #12345 has been confirmed",
        time: "Jan 15, 2024",
        icon: <CheckCircle size="sm" />,
        variant: "success",
      },
      {
        title: "Processing",
        description: "Preparing your items for shipment",
        time: "Jan 16, 2024",
        icon: <Clock size="sm" />,
        variant: "warning",
      },
      {
        title: "Shipped",
        description: "Your package is on the way",
        time: "Jan 17, 2024",
        icon: <Package size="sm" />,
        variant: "default",
      },
    ],
  },
};

export const ProjectTimeline: Story = {
  args: {
    items: [
      {
        title: "Project Kickoff",
        description: "Initial meeting and requirements gathering",
        time: "Week 1",
        variant: "success",
      },
      {
        title: "Design Phase",
        description: "UI/UX design and prototyping",
        time: "Week 2-3",
        variant: "success",
      },
      {
        title: "Development",
        description: "Frontend and backend implementation",
        time: "Week 4-8",
        variant: "warning",
      },
      {
        title: "Testing",
        description: "QA and bug fixes",
        time: "Week 9-10",
        variant: "default",
      },
      {
        title: "Launch",
        description: "Production deployment",
        time: "Week 11",
        variant: "default",
      },
    ],
  },
};
