import { lazy } from "react";
import { Home, Dashboard, Settings, Users, User, Lock, Grid, FileText } from "@pf-dev/ui";

import type { RouteConfig, SectionConfig } from "./types";

// 코드 스플리팅: 페이지 컴포넌트를 동적으로 로드
const HomePage = lazy(() => import("@/pages/home").then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import("@/pages/login").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage }))
);
const CrudCardPage = lazy(() =>
  import("@/pages/examples/crud-card").then((m) => ({ default: m.CrudCardPage }))
);
const CrudListPage = lazy(() =>
  import("@/pages/examples/crud-list").then((m) => ({ default: m.CrudListPage }))
);
const CrudListCreatePage = lazy(() =>
  import("@/pages/examples/crud-list/create").then((m) => ({ default: m.CrudListCreatePage }))
);
const CrudListDetailPage = lazy(() =>
  import("@/pages/examples/crud-list/detail").then((m) => ({ default: m.CrudListDetailPage }))
);
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

export const sectionConfigs: SectionConfig[] = [
  {
    id: "main",
    order: 1,
  },

  {
    id: "examples",
    label: "예제",
    collapsible: true,
    defaultExpanded: false,
    order: 2,
  },

  // 관리자 전용 섹션: ADMIN 역할만 접근 가능
  {
    id: "accounts",
    label: "사용자 관리",
    collapsible: true,
    defaultExpanded: true,
    order: 3,
    roles: ["ADMIN"], // 필수: 관리자 기능은 ADMIN 역할만 접근 가능
    dividerBefore: "관리자 기능",
  },
  {
    id: "system",
    order: 4,
    roles: ["ADMIN"], // 필수: 시스템 설정은 ADMIN 역할만 접근 가능
  },
];

export const publicRoutes: RouteConfig[] = [
  {
    path: "/login",
    element: LoginPage,
  },
];

export const protectedRoutes: RouteConfig[] = [
  // 공통 페이지: 모든 로그인 사용자 접근 가능 (roles 미지정)
  {
    path: "/",
    element: HomePage,
    menu: {
      label: "홈",
      icon: Home,
      sectionId: "main",
      order: 1,
    },
  },
  {
    path: "/dashboard",
    element: DashboardPage,
    menu: {
      label: "대시보드",
      icon: Dashboard,
      sectionId: "main",
      order: 2,
    },
  },
  {
    path: "/attendance",
    element: AttendancePage,
    menu: {
      label: "출역 현황",
      icon: FileText,
      sectionId: "main",
      order: 3,
    },
  },
  {
    path: "/process-status",
    element: ProcessStatusPage,
    menu: {
      label: "공정 현황",
      icon: FileText,
      sectionId: "main",
      order: 4,
    },
  },
  // 관리자 전용 페이지: ADMIN 역할만 접근 가능
  {
    path: "/system/settings",
    element: HomePage,
    roles: ["ADMIN"], // 필수: 시스템 설정은 ADMIN만 접근
    menu: {
      label: "시스템 설정",
      icon: Settings,
      sectionId: "system",
      order: 1,
    },
  },
  {
    path: "/accounts/users",
    element: UserAccountsPage,
    roles: ["ADMIN"], // 필수: 사용자 관리는 ADMIN만 접근
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
    roles: ["ADMIN"], // 필수: 역할 관리는 ADMIN만 접근
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
    roles: ["ADMIN"], // 필수: 권한 관리는 ADMIN만 접근
    menu: {
      label: "권한",
      icon: Lock,
      sectionId: "accounts",
      order: 3,
    },
  },
  // 예제 페이지: 모든 로그인 사용자 접근 가능 (프로젝트별 커스터마이징 가능)
  {
    path: "/examples/crud-card",
    element: CrudCardPage,
    menu: {
      label: "CRUD 카드형",
      icon: Grid,
      sectionId: "examples",
      order: 1,
    },
  },
  {
    path: "/examples/crud-list",
    element: CrudListPage,
    menu: {
      label: "CRUD 리스트형",
      icon: FileText,
      sectionId: "examples",
      order: 2,
    },
    children: [
      {
        path: "/examples/crud-list/create",
        element: CrudListCreatePage,
      },
      {
        path: "/examples/crud-list/:id",
        element: CrudListDetailPage,
      },
    ],
  },
];
