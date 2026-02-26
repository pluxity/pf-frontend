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
const KeyManagementPage = lazy(() =>
  import("@/pages/key-management").then((m) => ({ default: m.KeyManagementPage }))
);
const NoticeListPage = lazy(() =>
  import("@/pages/notice").then((m) => ({ default: m.NoticePage }))
);
const AnnouncementPage = lazy(() =>
  import("@/pages/announcement").then((m) => ({ default: m.AnnouncementPage }))
);
const SafetyEquipmentPage = lazy(() =>
  import("@/pages/safety-equipment").then((m) => ({ default: m.SafetyEquipmentPage }))
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
    id: "notice",
    label: "공지사항 관리",
    collapsible: true,
    defaultExpanded: true,
    order: 2,
  },
  {
    id: "safety-equipment",
    label: "안전장비 관리",
    collapsible: true,
    defaultExpanded: true,
    order: 3,
  },
  {
    id: "settings",
    label: "개인 설정",
    collapsible: true,
    defaultExpanded: true,
    order: 4,
    dividerBefore: true,
  },
  {
    id: "accounts",
    label: "사용자 관리",
    collapsible: true,
    defaultExpanded: true,
    order: 5,
    roles: ["ADMIN"],
    dividerBefore: "관리자 기능",
  },
  {
    id: "system",
    order: 6,
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
  {
    path: "/key-management",
    element: KeyManagementPage,
    permissions: [{ resourceType: "KEY_MANAGEMENT", minLevel: "READ" }],
    menu: {
      label: "주요관리사항 관리",
      icon: FileText,
      sectionId: "management",
      order: 4,
    },
  },
  {
    path: "/notice/notices",
    element: NoticeListPage,
    permissions: [{ resourceType: "NOTICE", minLevel: "READ" }],
    menu: {
      label: "공지사항",
      icon: FileText,
      sectionId: "notice",
      order: 1,
    },
  },
  {
    path: "/notice/announcement",
    element: AnnouncementPage,
    permissions: [{ resourceType: "NOTICE", minLevel: "READ" }],
    menu: {
      label: "안내사항",
      icon: FileText,
      sectionId: "notice",
      order: 2,
    },
  },
  {
    path: "/safety-equipment",
    element: SafetyEquipmentPage,
    permissions: [{ resourceType: "SAFETY_EQUIPMENT", minLevel: "READ" }],
    menu: {
      label: "안전장비 관리",
      icon: FileText,
      sectionId: "safety-equipment",
      order: 1,
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
