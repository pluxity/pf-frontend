import { GridLayout, GridTemplate } from "@pf-dev/ui";
import { Weather, Attendance, ProcessStatus, MainContent } from "@/components/widgets";

const dashboardTemplate: GridTemplate = {
  id: "dashboard-1",
  name: "대시보드 템플릿",
  columns: 24,
  rows: 24,
  cells: [
    { id: "mainContent", colStart: 1, colSpan: 19, rowStart: 1, rowSpan: 18 },
    { id: "weather", colStart: 20, colSpan: 5, rowStart: 1, rowSpan: 9 },
    { id: "processStatus", colStart: 20, colSpan: 5, rowStart: 10, rowSpan: 9 },
    { id: "attendance-1", colStart: 1, colSpan: 8, rowStart: 19, rowSpan: 6 },
    { id: "attendance-2", colStart: 9, colSpan: 8, rowStart: 19, rowSpan: 6 },
    { id: "attendance-3", colStart: 17, colSpan: 8, rowStart: 19, rowSpan: 6 },
  ],
};

const widgets = [
  { id: "mainContent", component: MainContent },
  { id: "weather", component: Weather },
  { id: "processStatus", component: ProcessStatus },
  { id: "attendance-1", component: Attendance },
  { id: "attendance-2", component: Attendance },
  { id: "attendance-3", component: Attendance },
];

export function HomePage() {
  return (
    <GridLayout
      template={dashboardTemplate}
      gap={0}
      className="dashboard-grid p-[1rem] h-[calc(100vh-var(--header-height)-var(--footer-height))]"
    >
      {widgets.map(({ id, component: Component }) => (
        <Component key={id} id={id} />
      ))}
    </GridLayout>
  );
}
