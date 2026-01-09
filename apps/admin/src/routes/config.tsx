import { Home, Dashboard, Settings, Users, User, Lock, Grid, FileText } from "@pf-dev/ui";

import {
  HomePage,
  LoginPage,
  DashboardPage,
  CrudCardPage,
  CrudListPage,
  CrudListCreatePage,
  CrudListDetailPage,
  UserAccountsPage,
  PermissionsPage,
  RolesPage,
} from "@/pages";

import type { RouteConfig, SectionConfig } from "./types";

export const sectionConfigs: SectionConfig[] = [
  {
    id: "main",
    order: 1,
  },
  {
    id: "access",
    label: "접근 관리",
    collapsible: true,
    defaultExpanded: true,
    order: 2,
  },
  {
    id: "examples",
    label: "예제",
    collapsible: true,
    defaultExpanded: false,
    order: 3,
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
    path: "/settings",
    element: HomePage,
    menu: {
      label: "설정",
      icon: Settings,
      sectionId: "main",
      order: 3,
    },
  },
  {
    path: "/access/users",
    element: UserAccountsPage,
    menu: {
      label: "사용자",
      icon: Users,
      sectionId: "access",
      order: 1,
    },
  },
  {
    path: "/access/roles",
    element: RolesPage,
    menu: {
      label: "역할",
      icon: User,
      sectionId: "access",
      order: 2,
    },
  },
  {
    path: "/access/permissions",
    element: PermissionsPage,
    menu: {
      label: "권한",
      icon: Lock,
      sectionId: "access",
      order: 3,
    },
  },
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
