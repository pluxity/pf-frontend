import type { StoryObj } from "@storybook/react";
import { useState } from "react";
import { NotificationCenter } from "./NotificationCenter";

const meta = {
  title: "Organisms/NotificationCenter",
  component: NotificationCenter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    maxHeight: {
      control: "number",
      description: "최대 높이 (px)",
    },
  },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// Composition Pattern Examples
// ============================================================================

export const Default: Story = {
  render: () => (
    <NotificationCenter>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={2} />
      </NotificationCenter.Header>

      <NotificationCenter.Item
        id="1"
        icon={<span>📦</span>}
        title="Order shipped"
        description="Your order #1234 is on the way"
        timestamp="2 min ago"
        read={false}
      />
      <NotificationCenter.Item
        id="2"
        icon={<span>💬</span>}
        title="New message"
        description="John sent you a message"
        timestamp="15 min ago"
        read={false}
      />
      <NotificationCenter.Item
        id="3"
        icon={<span>🎉</span>}
        title="Welcome!"
        description="Thanks for joining our platform"
        timestamp="1 hour ago"
        read={true}
      />
      <NotificationCenter.Item
        id="4"
        icon={<span>🔔</span>}
        title="Reminder"
        description="Your meeting starts in 30 minutes"
        timestamp="2 hours ago"
        read={true}
      />
    </NotificationCenter>
  ),
};

export const AllRead: Story = {
  render: () => (
    <NotificationCenter>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={0} />
      </NotificationCenter.Header>

      <NotificationCenter.Item
        id="1"
        icon={<span>📦</span>}
        title="Order shipped"
        description="Your order #1234 is on the way"
        timestamp="2 min ago"
        read={true}
      />
      <NotificationCenter.Item
        id="2"
        icon={<span>💬</span>}
        title="New message"
        description="John sent you a message"
        timestamp="15 min ago"
        read={true}
      />
    </NotificationCenter>
  ),
};

export const AllUnread: Story = {
  render: () => (
    <NotificationCenter>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={4} />
      </NotificationCenter.Header>

      <NotificationCenter.Item
        id="1"
        icon={<span>📦</span>}
        title="Order shipped"
        timestamp="2 min ago"
        read={false}
      />
      <NotificationCenter.Item
        id="2"
        icon={<span>💬</span>}
        title="New message"
        timestamp="15 min ago"
        read={false}
      />
      <NotificationCenter.Item
        id="3"
        icon={<span>🎉</span>}
        title="Welcome!"
        timestamp="1 hour ago"
        read={false}
      />
      <NotificationCenter.Item
        id="4"
        icon={<span>🔔</span>}
        title="Reminder"
        timestamp="2 hours ago"
        read={false}
      />
    </NotificationCenter>
  ),
};

export const Empty: Story = {
  render: () => (
    <NotificationCenter>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={0} />
      </NotificationCenter.Header>

      <NotificationCenter.Empty>You're all caught up!</NotificationCenter.Empty>
    </NotificationCenter>
  ),
};

export const WithMarkAllRead: Story = {
  render: () => (
    <NotificationCenter>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={2} />
        <NotificationCenter.MarkAllRead onClick={() => alert("Mark all as read!")} />
      </NotificationCenter.Header>

      <NotificationCenter.Item
        id="1"
        icon={<span>📦</span>}
        title="Order shipped"
        description="Your order #1234 is on the way"
        timestamp="2 min ago"
        read={false}
      />
      <NotificationCenter.Item
        id="2"
        icon={<span>💬</span>}
        title="New message"
        description="John sent you a message"
        timestamp="15 min ago"
        read={false}
      />
    </NotificationCenter>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [notifications, setNotifications] = useState([
      {
        id: "1",
        icon: <span>📦</span>,
        title: "Order shipped",
        timestamp: "2 min ago",
        read: false,
      },
      {
        id: "2",
        icon: <span>💬</span>,
        title: "New message",
        timestamp: "15 min ago",
        read: false,
      },
      { id: "3", icon: <span>🎉</span>, title: "Welcome!", timestamp: "1 hour ago", read: true },
    ]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleMarkAllRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleNotificationClick = (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    return (
      <NotificationCenter onNotificationClick={handleNotificationClick}>
        <NotificationCenter.Header>
          <NotificationCenter.UnreadBadge count={unreadCount} />
          {unreadCount > 0 && <NotificationCenter.MarkAllRead onClick={handleMarkAllRead} />}
        </NotificationCenter.Header>

        {notifications.map((notification) => (
          <NotificationCenter.Item key={notification.id} {...notification} />
        ))}
      </NotificationCenter>
    );
  },
};

export const ManyNotifications: Story = {
  render: () => (
    <NotificationCenter maxHeight={350}>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={3} />
      </NotificationCenter.Header>

      <NotificationCenter.Item
        id="1"
        icon={<span>📦</span>}
        title="Order shipped"
        description="Your order #1234 is on the way"
        timestamp="2 min ago"
        read={false}
      />
      <NotificationCenter.Item
        id="2"
        icon={<span>💬</span>}
        title="New message"
        description="John sent you a message"
        timestamp="15 min ago"
        read={false}
      />
      <NotificationCenter.Item
        id="3"
        icon={<span>🎉</span>}
        title="Welcome!"
        description="Thanks for joining our platform"
        timestamp="1 hour ago"
        read={true}
      />
      <NotificationCenter.Item
        id="4"
        icon={<span>🔔</span>}
        title="Reminder"
        description="Your meeting starts in 30 minutes"
        timestamp="2 hours ago"
        read={true}
      />
      <NotificationCenter.Item
        id="5"
        icon={<span>📧</span>}
        title="Email verified"
        description="Your email has been verified successfully"
        timestamp="3 hours ago"
        read={true}
      />
      <NotificationCenter.Item
        id="6"
        icon={<span>🔐</span>}
        title="Password changed"
        description="Your password was changed"
        timestamp="1 day ago"
        read={true}
      />
      <NotificationCenter.Item
        id="7"
        icon={<span>👤</span>}
        title="New follower"
        description="Sarah started following you"
        timestamp="2 days ago"
        read={false}
      />
    </NotificationCenter>
  ),
};

export const CustomEmptyMessage: Story = {
  render: () => (
    <NotificationCenter>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={0} />
      </NotificationCenter.Header>

      <NotificationCenter.Empty>No new notifications. Check back later!</NotificationCenter.Empty>
    </NotificationCenter>
  ),
};

export const WithCustomContent: Story = {
  render: () => (
    <NotificationCenter>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={1} />
      </NotificationCenter.Header>

      <NotificationCenter.Item
        id="1"
        icon={<span>📦</span>}
        title="Order shipped"
        timestamp="2 min ago"
        read={false}
      />

      <NotificationCenter.Custom>
        <div className="border-t border-neutral-100 bg-blue-50 px-5 py-3">
          <p className="text-xs font-medium text-blue-900">Special Offer!</p>
          <p className="mt-1 text-xs text-blue-700">Get 20% off your next order</p>
        </div>
      </NotificationCenter.Custom>

      <NotificationCenter.Item
        id="2"
        icon={<span>💬</span>}
        title="New message"
        timestamp="15 min ago"
        read={true}
      />
    </NotificationCenter>
  ),
};
