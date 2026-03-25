import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableStatusBadge,
  TableActionLink,
  TableFooter,
} from "./Table";
import { Button } from "../../atoms/Button";

const meta: Meta<typeof Table> = {
  title: "Organisms/Table",
  component: Table,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "active" as const },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Editor",
    status: "active" as const,
  },
  {
    id: 3,
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "Viewer",
    status: "inactive" as const,
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Editor",
    status: "pending" as const,
  },
];

export const Default: Story = {
  render: () => (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Users</h2>
        <Button size="sm">+ Add User</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <TableStatusBadge status={user.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3 justify-center">
                  <TableActionLink>Edit</TableActionLink>
                  <TableActionLink className="text-error-brand hover:text-error-600">
                    Delete
                  </TableActionLink>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

const sensors = [
  { id: "S-001", name: "온도 센서 A", location: "A구역", level: "severity-normal" as const },
  { id: "S-002", name: "가스 센서 B", location: "B구역", level: "severity-caution" as const },
  { id: "S-003", name: "진동 센서 C", location: "C구역", level: "severity-warning" as const },
  { id: "S-004", name: "화재 감지 D", location: "D구역", level: "severity-danger" as const },
];

const severityLabel = {
  "severity-normal": "정상",
  "severity-caution": "주의",
  "severity-warning": "경고",
  "severity-danger": "위험",
};

export const SeverityTable: Story = {
  render: () => (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">센서 모니터링</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>센서명</TableHead>
            <TableHead>위치</TableHead>
            <TableHead>상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sensors.map((sensor) => (
            <TableRow key={sensor.id}>
              <TableCell>{sensor.id}</TableCell>
              <TableCell>{sensor.name}</TableCell>
              <TableCell>{sensor.location}</TableCell>
              <TableCell>
                <TableStatusBadge status={sensor.level}>
                  {severityLabel[sensor.level]}
                </TableStatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

export const SimpleTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>MacBook Pro</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell>$2,499</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>iPhone 15</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell>$999</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>AirPods Pro</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell>$249</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Product A</TableCell>
          <TableCell>2</TableCell>
          <TableCell>$200</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product B</TableCell>
          <TableCell>1</TableCell>
          <TableCell>$150</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product C</TableCell>
          <TableCell>3</TableCell>
          <TableCell>$300</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>6</TableCell>
          <TableCell>$650</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
