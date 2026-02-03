import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle, Clock, Package, AlertCircle } from "../../atoms/Icon";
import { Timeline } from "./Timeline";
import { Badge } from "../../atoms/Badge";

const meta = {
  title: "Organisms/Timeline",
  component: Timeline,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[37.5rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Composition Pattern Examples
// ============================================================================

export const Default: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item
        title="Order Placed"
        description="Your order has been placed successfully"
        time="2024-01-15 09:00"
      />
      <Timeline.Item
        title="Processing"
        description="Your order is being processed"
        time="2024-01-15 10:30"
      />
      <Timeline.Item
        title="Shipped"
        description="Your order has been shipped"
        time="2024-01-16 14:00"
      />
    </Timeline>
  ),
};

export const WithVariants: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item
        title="Completed"
        description="Task completed successfully"
        time="10:00 AM"
        variant="success"
      />
      <Timeline.Item
        title="In Progress"
        description="Currently working on this"
        time="11:30 AM"
        variant="warning"
      />
      <Timeline.Item
        title="Failed"
        description="This task failed"
        time="12:00 PM"
        variant="error"
      />
      <Timeline.Item
        title="Pending"
        description="Waiting to start"
        time="1:00 PM"
        variant="default"
      />
    </Timeline>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item
        title="Order Confirmed"
        description="Your order #12345 has been confirmed"
        time="Jan 15, 2024"
        icon={<CheckCircle size="sm" />}
        variant="success"
      />
      <Timeline.Item
        title="Processing"
        description="Preparing your items for shipment"
        time="Jan 16, 2024"
        icon={<Clock size="sm" />}
        variant="warning"
      />
      <Timeline.Item
        title="Shipped"
        description="Your package is on the way"
        time="Jan 17, 2024"
        icon={<Package size="sm" />}
        variant="default"
      />
    </Timeline>
  ),
};

export const ProjectTimeline: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item
        title="Project Kickoff"
        description="Initial meeting and requirements gathering"
        time="Week 1"
        variant="success"
      />
      <Timeline.Item
        title="Design Phase"
        description="UI/UX design and prototyping"
        time="Week 2-3"
        variant="success"
      />
      <Timeline.Item
        title="Development"
        description="Frontend and backend implementation"
        time="Week 4-8"
        variant="warning"
      />
      <Timeline.Item
        title="Testing"
        description="QA and bug fixes"
        time="Week 9-10"
        variant="default"
      />
      <Timeline.Item
        title="Launch"
        description="Production deployment"
        time="Week 11"
        variant="default"
      />
    </Timeline>
  ),
};

export const WithCustomContent: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item
        title="Deployment Started"
        description="Starting production deployment"
        time="14:00"
        icon={<Package size="sm" />}
        variant="default"
      />
      <Timeline.Custom>
        <div className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-warning-brand">
          <AlertCircle size="sm" className="text-white" />
        </div>
        <div className="flex-1 pt-0.5">
          <div className="rounded-lg border border-warning-brand/20 bg-warning-brand/10 p-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-bold text-warning-brand">Warning</h4>
              <span className="flex-shrink-0 text-xs text-gray-500">14:15</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Database migration required before continuing
            </p>
            <div className="mt-2 flex gap-2">
              <Badge variant="warning">Action Required</Badge>
            </div>
          </div>
        </div>
      </Timeline.Custom>
      <Timeline.Item
        title="Migration Complete"
        description="Database successfully migrated"
        time="14:45"
        icon={<CheckCircle size="sm" />}
        variant="success"
      />
      <Timeline.Item
        title="Deployment Complete"
        description="Application deployed to production"
        time="15:00"
        icon={<CheckCircle size="sm" />}
        variant="success"
      />
    </Timeline>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item title="First Event" time="10:00" />
      <Timeline.Item title="Second Event" time="11:00" />
      <Timeline.Item title="Third Event" time="12:00" />
    </Timeline>
  ),
};

export const LongDescription: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item
        title="Pull Request Opened"
        description="New feature implementation for user authentication system. This includes OAuth integration, JWT token management, and refresh token handling."
        time="2 hours ago"
        icon={<CheckCircle size="sm" />}
        variant="success"
      />
      <Timeline.Item
        title="Code Review"
        description="Senior developer reviewed the code and requested changes. Main concerns: error handling in authentication flow, token expiration logic, and unit test coverage."
        time="1 hour ago"
        icon={<Clock size="sm" />}
        variant="warning"
      />
      <Timeline.Item
        title="Changes Committed"
        description="All requested changes have been implemented and committed. Added comprehensive error handling, improved token management, and increased test coverage to 95%."
        time="30 minutes ago"
        icon={<Package size="sm" />}
        variant="default"
      />
    </Timeline>
  ),
};
