import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./DataTable";
import { Badge } from "../../atoms/Badge";

const meta: Meta<typeof DataTable> = {
  title: "Organisms/DataTable",
  component: DataTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  [key: string]: unknown;
}

const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", department: "Engineering", role: "Developer", status: "active", joinDate: "2024-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", department: "Design", role: "Designer", status: "active", joinDate: "2024-02-20" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", department: "Marketing", role: "Manager", status: "inactive", joinDate: "2023-11-10" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", department: "Engineering", role: "Lead", status: "active", joinDate: "2023-08-05" },
  { id: 5, name: "Charlie Davis", email: "charlie@example.com", department: "Sales", role: "Executive", status: "pending", joinDate: "2024-03-01" },
  { id: 6, name: "Eva Green", email: "eva@example.com", department: "HR", role: "Specialist", status: "active", joinDate: "2024-01-08" },
  { id: 7, name: "Frank Miller", email: "frank@example.com", department: "Engineering", role: "Developer", status: "active", joinDate: "2023-12-12" },
  { id: 8, name: "Grace Lee", email: "grace@example.com", department: "Design", role: "Senior Designer", status: "inactive", joinDate: "2023-06-22" },
  { id: 9, name: "Henry Park", email: "henry@example.com", department: "Marketing", role: "Analyst", status: "active", joinDate: "2024-02-14" },
  { id: 10, name: "Ivy Chen", email: "ivy@example.com", department: "Engineering", role: "Intern", status: "pending", joinDate: "2024-03-10" },
  { id: 11, name: "Jack Kim", email: "jack@example.com", department: "Sales", role: "Manager", status: "active", joinDate: "2023-09-18" },
  { id: 12, name: "Kate Wang", email: "kate@example.com", department: "HR", role: "Director", status: "active", joinDate: "2023-04-25" },
];

const statusColors = {
  active: "success" as const,
  inactive: "default" as const,
  pending: "warning" as const,
};

export const Default: Story = {
  render: () => (
    <DataTable
      data={users}
      selectable
      pagination
      pageSize={5}
      columns={[
        {
          key: "name",
          header: "Name",
          sortable: true,
          render: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
          key: "email",
          header: "Email",
          sortable: true,
          render: (row) => <span className="text-[#808088]">{row.email}</span>,
        },
        {
          key: "department",
          header: "Department",
          sortable: true,
        },
        {
          key: "role",
          header: "Role",
          sortable: true,
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          render: (row) => (
            <Badge variant={statusColors[row.status as 'active' | 'inactive' | 'pending']}>
              {(row.status as string).charAt(0).toUpperCase() + (row.status as string).slice(1)}
            </Badge>
          ),
        },
        {
          key: "joinDate",
          header: "Join Date",
          sortable: true,
        },
      ]}
      onSelectionChange={(selected) => console.log("Selected:", selected)}
    />
  ),
};

export const WithoutSelection: Story = {
  render: () => (
    <DataTable
      data={users.slice(0, 5)}
      columns={[
        { key: "name", header: "Name", sortable: true },
        { key: "email", header: "Email" },
        { key: "department", header: "Department", sortable: true },
        { key: "role", header: "Role" },
      ]}
    />
  ),
};

export const WithoutPagination: Story = {
  render: () => (
    <DataTable
      data={users.slice(0, 5)}
      selectable
      columns={[
        { key: "name", header: "Name", sortable: true },
        { key: "email", header: "Email" },
        { key: "status", header: "Status", render: (row) => (
          <Badge variant={statusColors[row.status as 'active' | 'inactive' | 'pending']}>
            {(row.status as string).charAt(0).toUpperCase() + (row.status as string).slice(1)}
          </Badge>
        )},
      ]}
    />
  ),
};

export const LargeDataset: Story = {
  render: () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      department: ["Engineering", "Design", "Marketing", "Sales", "HR"][i % 5],
      role: ["Developer", "Designer", "Manager", "Analyst", "Specialist"][i % 5],
      status: (["active", "inactive", "pending"] as const)[i % 3],
      joinDate: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
    }));

    return (
      <DataTable
        data={largeData}
        selectable
        pagination
        pageSize={10}
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "email", header: "Email", sortable: true },
          { key: "department", header: "Department", sortable: true },
          { key: "role", header: "Role", sortable: true },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <Badge variant={statusColors[row.status as 'active' | 'inactive' | 'pending']}>
                {(row.status as string).charAt(0).toUpperCase() + (row.status as string).slice(1)}
              </Badge>
            ),
          },
        ]}
      />
    );
  },
};
