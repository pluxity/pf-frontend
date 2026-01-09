import type { User, UserRolesUpdateData, UserPasswordUpdateData, Role } from "../types";

const MOCK_ROLES: Role[] = [
  { id: 1, name: "ADMIN", permissions: [{ id: 1, name: "ALL" }] },
  {
    id: 2,
    name: "MANAGER",
    permissions: [
      { id: 2, name: "READ" },
      { id: 3, name: "WRITE" },
    ],
  },
  { id: 3, name: "USER", permissions: [{ id: 2, name: "READ" }] },
];

const MOCK_USERS: User[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  email: `user${i + 1}@example.com`,
  name: `사용자 ${i + 1}`,
  roles: [MOCK_ROLES[i % 3]!],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
}));

const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUsers(): Promise<User[]> {
  await delay(MOCK_DELAY);
  return [...MOCK_USERS];
}

export async function getUser(id: number): Promise<User> {
  await delay(MOCK_DELAY);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateUserRoles(id: number, data: UserRolesUpdateData): Promise<User> {
  await delay(MOCK_DELAY);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");

  const updatedUser: User = {
    ...user,
    roles: MOCK_ROLES.filter((r) => data.roleIds.includes(r.id)),
    updatedAt: new Date().toISOString(),
  };
  return updatedUser;
}

export async function updateUserPassword(id: number, _data: UserPasswordUpdateData): Promise<void> {
  await delay(MOCK_DELAY);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
}

export async function initUserPassword(id: number): Promise<void> {
  await delay(MOCK_DELAY);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
}

export async function getRoles(): Promise<Role[]> {
  await delay(MOCK_DELAY);
  return [...MOCK_ROLES];
}
