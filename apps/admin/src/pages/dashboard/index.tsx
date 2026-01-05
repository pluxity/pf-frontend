import { useState, useEffect, useCallback } from "react";
import { Users, BarChart, Package, Eye } from "@pf-dev/ui/atoms";

import {
  DashboardGrid,
  WidgetConfig,
  LayoutItem,
  StatCard,
  StatCardProps,
  ChartWidget,
  ChartWidgetProps,
  TableWidget,
  TableWidgetProps,
} from "./components";

// 샘플 위젯 설정
const SAMPLE_WIDGETS: WidgetConfig[] = [
  {
    id: "stat-users",
    type: "stat",
    props: {
      title: "총 사용자",
      value: "12,847",
      change: 12.5,
      changeLabel: "지난달 대비",
      icon: <Users size="md" />,
    },
  },
  {
    id: "stat-visits",
    type: "stat",
    props: {
      title: "오늘 방문자",
      value: "1,284",
      change: -3.2,
      changeLabel: "어제 대비",
      icon: <Eye size="md" />,
    },
  },
  {
    id: "stat-orders",
    type: "stat",
    props: {
      title: "주문 건수",
      value: "384",
      change: 8.1,
      changeLabel: "지난주 대비",
      icon: <Package size="md" />,
    },
  },
  {
    id: "stat-active",
    type: "stat",
    props: {
      title: "활성 세션",
      value: "247",
      change: 24.3,
      changeLabel: "실시간",
      icon: <BarChart size="md" />,
    },
  },
  {
    id: "chart-line",
    type: "chart",
    props: {
      title: "월별 방문자 추이",
      type: "line",
    },
  },
  {
    id: "chart-bar",
    type: "chart",
    props: {
      title: "일별 매출",
      type: "bar",
    },
  },
  {
    id: "chart-pie",
    type: "chart",
    props: {
      title: "사용자 유형 분포",
      type: "pie",
    },
  },
  {
    id: "table-recent",
    type: "table",
    props: {
      title: "최근 활동",
      columns: [
        { key: "user", header: "사용자" },
        { key: "action", header: "활동" },
        { key: "time", header: "시간" },
      ],
      data: [
        { user: "김철수", action: "로그인", time: "방금 전" },
        { user: "이영희", action: "상품 조회", time: "1분 전" },
        { user: "박민수", action: "주문 완료", time: "3분 전" },
        { user: "최지은", action: "회원가입", time: "5분 전" },
        { user: "정대현", action: "결제 완료", time: "8분 전" },
      ],
    },
  },
];

// 기본 레이아웃
const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "stat-users", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 1 },
  { i: "stat-visits", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 1 },
  { i: "stat-orders", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 1 },
  { i: "stat-active", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 1 },
  { i: "chart-line", x: 0, y: 2, w: 6, h: 3, minW: 3, minH: 2 },
  { i: "chart-bar", x: 6, y: 2, w: 6, h: 3, minW: 3, minH: 2 },
  { i: "chart-pie", x: 0, y: 5, w: 4, h: 3, minW: 3, minH: 2 },
  { i: "table-recent", x: 4, y: 5, w: 8, h: 3, minW: 4, minH: 2 },
];

export function DashboardPage() {
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById("dashboard-container");
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const renderWidget = useCallback((widget: WidgetConfig) => {
    switch (widget.type) {
      case "stat":
        return <StatCard {...(widget.props as unknown as StatCardProps)} />;
      case "chart":
        return <ChartWidget {...(widget.props as unknown as ChartWidgetProps)} />;
      case "table":
        return (
          <TableWidget
            {...(widget.props as unknown as TableWidgetProps<Record<string, unknown>>)}
          />
        );
      default:
        return null;
    }
  }, []);

  return (
    <div id="dashboard-container" className="mx-auto max-w-7xl">
      <DashboardGrid
        widgets={SAMPLE_WIDGETS}
        layout={DEFAULT_LAYOUT}
        renderWidget={renderWidget}
        width={containerWidth}
        cols={12}
        rowHeight={100}
      />
    </div>
  );
}
