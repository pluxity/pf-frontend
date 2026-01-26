import { lazy } from "react";
import { Settings, Users, User, Lock, FileText } from "@pf-dev/ui";

import type { RouteConfig, SectionConfig } from "./types";

const LoginPage = lazy(() => import("@/pages/login").then((m) => ({ default: m.LoginPage })));
const UserAccountsPage = lazy(() =>
  import("@/pages/accounts/users").then((m) => ({ default: m.UserAccountsPage }))
);
const PermissionsPage = lazy(() =>
  import("@/pages/accounts/permissions").then((m) => ({ default: m.PermissionsPage }))
);
const RolesPage = lazy(() =>
  import("@/pages/accounts/roles").then((m) => ({ default: m.RolesPage }))
);
const AttendancePage = lazy(() =>
  import("@/pages/attendance").then((m) => ({ default: m.AttendancePage }))
);
const ProcessStatusPage = lazy(() =>
  import("@/pages/process-status").then((m) => ({ default: m.ProcessStatusPage }))
);
const GoalsPage = lazy(() => import("@/pages/goals").then((m) => ({ default: m.GoalsPage })));
const PasswordChangePage = lazy(() =>
  import("@/pages/settings").then((m) => ({ default: m.PasswordChangePage }))
);
const SystemSettingsPage = lazy(() =>
  import("@/pages/system").then((m) => ({ default: m.SystemSettingsPage }))
);

export const sectionConfigs: SectionConfig[] = [
  {
    id: "management",
    label: "관리",
    collapsible: true,
    defaultExpanded: true,
    order: 1,
  },
  {
    id: "settings",
    label: "개인 설정",
    collapsible: true,
    defaultExpanded: true,
    order: 2,
    dividerBefore: true,
  },
  {
    id: "accounts",
    label: "사용자 관리",
    collapsible: true,
    defaultExpanded: true,
    order: 3,
    roles: ["ADMIN"],
    dividerBefore: "관리자 기능",
  },
  {
    id: "system",
    order: 4,
    roles: ["ADMIN"],
  },
];

export const publicRoutes: RouteConfig[] = [
  {
    path: "/login",
    element: LoginPage,
  },
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: "/attendance",
    element: AttendancePage,
    permissions: [{ resourceType: "ATTENDANCE_STATUS", minLevel: "READ" }],
    menu: {
      label: "출역 관리",
      icon: FileText,
      sectionId: "management",
      order: 1,
    },
  },
  {
    path: "/process-status",
    element: ProcessStatusPage,
    permissions: [{ resourceType: "PROCESS_STATUS", minLevel: "READ" }],
    menu: {
      label: "공정 관리",
      icon: FileText,
      sectionId: "management",
      order: 2,
    },
  },
  {
    path: "/goals",
    element: GoalsPage,
    permissions: [{ resourceType: "GOAL", minLevel: "READ" }],
    menu: {
      label: "목표 관리",
      icon: FileText,
      sectionId: "management",
      order: 3,
    },
  },
  // 관리자 전용 페이지: ADMIN 역할만 접근 가능
  {
    path: "/settings/account",
    element: PasswordChangePage,
    menu: {
      label: "계정 관리",
      icon: User,
      sectionId: "settings",
      order: 1,
    },
  },
  {
    path: "/accounts/users",
    element: UserAccountsPage,
    roles: ["ADMIN"],
    menu: {
      label: "사용자",
      icon: Users,
      sectionId: "accounts",
      order: 1,
    },
  },
  {
    path: "/accounts/roles",
    element: RolesPage,
    roles: ["ADMIN"],
    menu: {
      label: "역할",
      icon: User,
      sectionId: "accounts",
      order: 2,
    },
  },
  {
    path: "/accounts/permissions",
    element: PermissionsPage,
    roles: ["ADMIN"],
    menu: {
      label: "권한",
      icon: Lock,
      sectionId: "accounts",
      order: 3,
    },
  },
  {
    path: "/system/settings",
    element: SystemSettingsPage,
    roles: ["ADMIN"],
    menu: {
      label: "시스템 설정",
      icon: Settings,
      sectionId: "system",
      order: 1,
    },
  },
];
