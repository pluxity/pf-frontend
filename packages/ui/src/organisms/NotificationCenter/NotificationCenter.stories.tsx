import type { StoryObj } from "@storybook/react";
import { useState } from "react";
import { NotificationCenter, NotificationItem } from "./NotificationCenter";

const meta = {
  title: "Organisms/NotificationCenter",
  component: NotificationCenter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    emptyMessage: {
      control: "text",
      description: "알림이 없을 때 표시할 메시지",
    },
    maxHeight: {
      control: "number",
      description: "최대 높이 (px)",
    },
  },
};

export default meta;
type Story = StoryObj;

const sampleNotifications: NotificationItem[] = [
  {
    id: "1",
    icon: <span>📦</span>,
    title: "Order shipped",
    description: "Your order #1234 is on the way",
    timestamp: "2 min ago",
    read: false,
  },
  {
    id: "2",
    icon: <span>💬</span>,
    title: "New message",
    description: "John sent you a message",
    timestamp: "15 min ago",
    read: false,
  },
  {
    id: "3",
    icon: <span>🎉</span>,
    title: "Welcome!",
    description: "Thanks for joining our platform",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    icon: <span>🔔</span>,
    title: "Reminder",
    description: "Your meeting starts in 30 minutes",
    timestamp: "2 hours ago",
    read: true,
  },
];

export const Default: Story = {
  args: {
    notifications: sampleNotifications,
  },
};

export const AllRead: Story = {
  args: {
    notifications: sampleNotifications.map((n) => ({ ...n, read: true })),
  },
};

export const AllUnread: Story = {
  args: {
    notifications: sampleNotifications.map((n) => ({ ...n, read: false })),
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
    emptyMessage: "You're all caught up!",
  },
};

export const WithMarkAllRead: Story = {
  args: {
    notifications: sampleNotifications,
    onMarkAllRead: () => alert("Mark all as read clicked!"),
  },
};

export const Interactive: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(sampleNotifications);

    const handleMarkAllRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleNotificationClick = (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    return (
      <NotificationCenter
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
      />
    );
  },
};

export const ManyNotifications: Story = {
  args: {
    notifications: [
      ...sampleNotifications,
      {
        id: "5",
        icon: <span>📧</span>,
        title: "Email verified",
        description: "Your email has been verified successfully",
        timestamp: "3 hours ago",
        read: true,
      },
      {
        id: "6",
        icon: <span>🔐</span>,
        title: "Password changed",
        description: "Your password was changed",
        timestamp: "1 day ago",
        read: true,
      },
      {
        id: "7",
        icon: <span>👤</span>,
        title: "New follower",
        description: "Sarah started following you",
        timestamp: "2 days ago",
        read: true,
      },
    ],
    maxHeight: 350,
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    notifications: [],
    emptyMessage: "No new notifications. Check back later!",
  },
};
