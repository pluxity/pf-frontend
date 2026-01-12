import type { User, UserFormData } from "../types";

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "HR"];
const ROLES = ["Developer", "Designer", "Manager", "Analyst", "Specialist", "Lead", "Intern"];
const STATUSES: User["status"][] = ["active", "inactive", "pending"];
const NAMES = [
  "김철수",
  "이영희",
  "박지성",
  "최민수",
  "정수연",
  "강민지",
  "윤서준",
  "임하늘",
  "한지민",
  "오준혁",
  "서예진",
  "조은우",
];

const MOCK_USERS: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: NAMES[i % NAMES.length]!,
  email: `user${i + 1}@example.com`,
  department: DEPARTMENTS[i % DEPARTMENTS.length]!,
  role: ROLES[i % ROLES.length]!,
  status: STATUSES[i % 3]!,
  joinDate: new Date(Date.now() - i * 30 * 86400000).toISOString().split("T")[0] ?? "",
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
}));

const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUsers(): Promise<User[]> {
  await delay(MOCK_DELAY);
  return [...MOCK_USERS];
}

export async function getUser(id: string): Promise<User | null> {
  await delay(MOCK_DELAY);
  return MOCK_USERS.find((user) => user.id === id) ?? null;
}

export async function createUser(data: UserFormData): Promise<User> {
  await delay(MOCK_DELAY);
  const newUser: User = {
    id: `user-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newUser;
}

export async function updateUser(id: string, data: UserFormData): Promise<User> {
  await delay(MOCK_DELAY);
  const updatedUser: User = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return updatedUser;
}

export async function deleteUser(_id: string): Promise<void> {
  await delay(MOCK_DELAY);
}

export async function deleteUsers(_ids: string[]): Promise<void> {
  await delay(MOCK_DELAY);
}
