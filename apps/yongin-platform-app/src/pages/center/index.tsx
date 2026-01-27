import { GridLayout, GridTemplate } from "@pf-dev/ui";
import { BirdEyeView } from "./components";

const centerTemplate: GridTemplate = {
  id: "center-1",
  name: "센터 템플릿",
  columns: 1,
  rows: 1,
  cells: [{ id: "birdEyeView", colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 }],
};

const widgets = [{ id: "birdEyeView", component: BirdEyeView }];

export function CenterPage() {
  return (
    <GridLayout
      template={centerTemplate}
      gap={16}
      className="p-4 4k:p-8 h-[calc(100vh-var(--header-height)-var(--footer-height))] 4k:h-[calc(100vh-var(--header-height-4k)-var(--footer-height-4k))]"
    >
      {widgets.map(({ id, component: Component }) => (
        <Component key={id} id={id} />
      ))}
    </GridLayout>
  );
}
