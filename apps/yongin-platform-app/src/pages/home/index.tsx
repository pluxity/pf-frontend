import { GridLayout, GridTemplate } from "@pf-dev/ui";
import {
  Weather,
  WorkerStats,
  ProgressStats,
  Viewer,
  Management,
  DailyStats,
  Announcement,
} from "./components";

const dashboardTemplate: GridTemplate = {
  id: "dashboard-1",
  name: "대시보드 템플릿",
  columns: 5,
  rows: 3,
  cells: [
    { id: "weather", colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 }, // 날씨
    { id: "workerStats", colStart: 1, colSpan: 1, rowStart: 2, rowSpan: 1 }, // 출역현황
    { id: "progressStats", colStart: 1, colSpan: 1, rowStart: 3, rowSpan: 1 }, // 공정현황
    { id: "viewer", colStart: 2, colSpan: 3, rowStart: 1, rowSpan: 3 }, // 메인 콘텐츠
    { id: "management", colStart: 5, colSpan: 1, rowStart: 1, rowSpan: 1 }, // 주요 관리사항
    { id: "dailyStats", colStart: 5, colSpan: 1, rowStart: 2, rowSpan: 1 }, // 일일목표
    { id: "announcement", colStart: 5, colSpan: 1, rowStart: 3, rowSpan: 1 }, // 공지사항
  ],
};

const widgets = [
  { id: "weather", component: Weather },
  { id: "workerStats", component: WorkerStats },
  { id: "progressStats", component: ProgressStats },
  { id: "viewer", component: Viewer },
  { id: "management", component: Management },
  { id: "dailyStats", component: DailyStats },
  { id: "announcement", component: Announcement },
];

export function HomePage() {
  return (
    <GridLayout
      template={dashboardTemplate}
      gap={16}
      className="p-4 4k:p-8 h-[calc(100vh-var(--header-height)-var(--footer-height))] 4k:h-[calc(100vh-var(--header-height-4k)-var(--footer-height-4k))]"
    >
      {widgets.map(({ id, component: Component }) => (
        <Component key={id} id={id} />
      ))}
    </GridLayout>
  );
}
