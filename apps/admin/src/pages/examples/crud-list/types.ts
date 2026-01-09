export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: string;
}

export interface UserFormData {
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
}

export type FilterStatus = "all" | "active" | "inactive" | "pending";

export const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "HR"] as const;

export const ROLES = [
  "Developer",
  "Designer",
  "Manager",
  "Analyst",
  "Specialist",
  "Lead",
  "Director",
  "Intern",
] as const;

export const STATUS_OPTIONS = [
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
  { value: "pending", label: "대기중" },
] as const;

export const STATUS_COLORS = {
  active: "success" as const,
  inactive: "default" as const,
  pending: "warning" as const,
};

export const STATUS_LABELS = {
  active: "활성",
  inactive: "비활성",
  pending: "대기중",
};
