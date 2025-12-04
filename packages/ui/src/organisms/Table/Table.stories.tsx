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
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "active" as const },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "Viewer", status: "inactive" as const },
  { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Editor", status: "pending" as const },
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
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-[#808088]">{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <TableStatusBadge status={user.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
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

export const SimpleTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">MacBook Pro</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell className="text-right">$2,499</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">iPhone 15</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell className="text-right">$999</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">AirPods Pro</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell className="text-right">$249</TableCell>
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
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Product A</TableCell>
          <TableCell>2</TableCell>
          <TableCell className="text-right">$200</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product B</TableCell>
          <TableCell>1</TableCell>
          <TableCell className="text-right">$150</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product C</TableCell>
          <TableCell>3</TableCell>
          <TableCell className="text-right">$300</TableCell>
        </TableRow>
      </TableBody>
      <tfoot className="border-t border-[#E6E6E8] bg-[#FAFAFC]">
        <TableRow>
          <TableCell className="font-bold">Total</TableCell>
          <TableCell>6</TableCell>
          <TableCell className="text-right font-bold">$650</TableCell>
        </TableRow>
      </tfoot>
    </Table>
  ),
};
