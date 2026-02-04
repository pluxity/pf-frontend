import type { Meta, StoryObj } from "@storybook/react";
import { GridLayout } from "./GridLayout";
import { Widget } from "../../molecules/Widget";
import type { GridTemplate } from "./types";

const meta: Meta<typeof GridLayout> = {
  title: "Organisms/GridLayout",
  component: GridLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: { type: "number", min: 1, max: 12 },
      description: "그리드 컬럼 수",
    },
    rows: {
      control: { type: "number", min: 1, max: 6 },
      description: "그리드 행 수",
    },
    gap: {
      control: { type: "number", min: 0, max: 32 },
      description: "위젯 간 간격 (px)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  render: () => (
    <div className="h-96 p-4">
      <GridLayout columns={3} gap={16} className="p-1">
        <Widget title="위젯 1" border>
          <div className="p-4">콘텐츠 1</div>
        </Widget>
        <Widget title="위젯 2" border>
          <div className="p-4">콘텐츠 2</div>
        </Widget>
        <Widget title="위젯 3" border>
          <div className="p-4">콘텐츠 3</div>
        </Widget>
        <Widget title="위젯 4" border colSpan={2}>
          <div className="p-4">콘텐츠 4 (2열 차지)</div>
        </Widget>
        <Widget title="위젯 5" border>
          <div className="p-4">콘텐츠 5</div>
        </Widget>
      </GridLayout>
    </div>
  ),
};

export const Dashboard: Story = {
  name: "대시보드",
  render: () => (
    <div className="h-[37.5rem] p-4 bg-gray-100">
      <GridLayout columns={12} gap={16} className="p-1">
        <Widget title="매출 현황" border colSpan={6} rowSpan={2}>
          <div className="h-full flex items-center justify-center bg-blue-50">차트 영역</div>
        </Widget>
        <Widget title="방문자 통계" border colSpan={3}>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold">1,234</div>
            <div className="text-gray-500">오늘 방문자</div>
          </div>
        </Widget>
        <Widget title="신규 가입" border colSpan={3}>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold">56</div>
            <div className="text-gray-500">오늘 가입자</div>
          </div>
        </Widget>
        <Widget title="알림" border colSpan={6}>
          <div className="p-4">최근 알림 목록</div>
        </Widget>
      </GridLayout>
    </div>
  ),
};

export const CCTVGrid: Story = {
  name: "CCTV 그리드 (4x4)",
  render: () => (
    <div className="h-[37.5rem] p-4 bg-gray-900">
      <GridLayout columns={4} rows={4} gap={8} className="p-1">
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="bg-gray-800 rounded flex items-center justify-center text-white">
            CAM {i + 1}
          </div>
        ))}
      </GridLayout>
    </div>
  ),
};

export const CarouselPagination: Story = {
  name: "캐러셀 페이지네이션 (CCTV)",
  render: () => (
    <div className="h-[37.5rem] p-4 bg-gray-900">
      <GridLayout
        columns={4}
        rows={4}
        gap={8}
        className="p-1"
        pagination={{
          type: "carousel",
          perPage: 16,
          transition: "slide",
        }}
      >
        {Array.from({ length: 32 }, (_, i) => (
          <div key={i} className="bg-gray-800 rounded flex items-center justify-center text-white">
            CAM {i + 1}
          </div>
        ))}
      </GridLayout>
    </div>
  ),
};

const dashboardTemplate: GridTemplate = {
  id: "dashboard-1",
  name: "대시보드 템플릿",
  columns: 12,
  rows: 4,
  cells: [
    { id: "cell-1", colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 2 },
    { id: "cell-2", colStart: 7, colSpan: 3, rowStart: 1, rowSpan: 1 },
    { id: "cell-3", colStart: 10, colSpan: 3, rowStart: 1, rowSpan: 1 },
    { id: "cell-4", colStart: 7, colSpan: 6, rowStart: 2, rowSpan: 1 },
    { id: "cell-5", colStart: 1, colSpan: 12, rowStart: 3, rowSpan: 2 },
  ],
};

export const TemplateMode: Story = {
  name: "템플릿 모드",
  render: () => (
    <div className="h-[37.5rem] p-4 bg-gray-100">
      <GridLayout template={dashboardTemplate} gap={16} className="p-1">
        <Widget id="widget-1" title="메인 차트" border>
          <div className="h-full flex items-center justify-center bg-blue-50">메인 차트 영역</div>
        </Widget>
        <Widget id="widget-2" title="통계 1" border>
          <div className="p-4 text-center">통계 1</div>
        </Widget>
        <Widget id="widget-3" title="통계 2" border>
          <div className="p-4 text-center">통계 2</div>
        </Widget>
        <Widget id="widget-4" title="서브 차트" border>
          <div className="p-4">서브 차트</div>
        </Widget>
        <Widget id="widget-5" title="데이터 테이블" border>
          <div className="p-4">데이터 테이블 영역</div>
        </Widget>
      </GridLayout>
    </div>
  ),
};

export const TemplateModeEditable: Story = {
  name: "템플릿 모드 (편집 가능)",
  render: () => (
    <div className="h-[37.5rem] p-4 bg-gray-100">
      <GridLayout template={dashboardTemplate} gap={16} editable className="p-1">
        <Widget id="widget-1" title="메인 차트" border>
          <div className="h-full flex items-center justify-center bg-blue-50">
            드래그하여 위치 변경
          </div>
        </Widget>
        <Widget id="widget-2" title="통계 1" border>
          <div className="p-4 text-center">통계 1</div>
        </Widget>
        <Widget id="widget-3" title="통계 2" border>
          <div className="p-4 text-center">통계 2</div>
        </Widget>
        <Widget id="widget-4" title="서브 차트" border>
          <div className="p-4">서브 차트</div>
        </Widget>
        <Widget id="widget-5" title="데이터 테이블" border>
          <div className="p-4">데이터 테이블 영역</div>
        </Widget>
      </GridLayout>
    </div>
  ),
};

export const DifferentGaps: Story = {
  name: "다양한 간격",
  render: () => (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="text-lg font-bold mb-2">gap: 8px</h3>
        <div className="h-48 bg-gray-100 p-1">
          <GridLayout columns={4} gap={8} className="p-1">
            {Array.from({ length: 8 }, (_, i) => (
              <Widget key={i} border>
                <div className="p-2 text-center">{i + 1}</div>
              </Widget>
            ))}
          </GridLayout>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2">gap: 16px</h3>
        <div className="h-48 bg-gray-100 p-1">
          <GridLayout columns={4} gap={16} className="p-1">
            {Array.from({ length: 8 }, (_, i) => (
              <Widget key={i} border>
                <div className="p-2 text-center">{i + 1}</div>
              </Widget>
            ))}
          </GridLayout>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2">gap: 24px</h3>
        <div className="h-48 bg-gray-100 p-1">
          <GridLayout columns={4} gap={24} className="p-1">
            {Array.from({ length: 8 }, (_, i) => (
              <Widget key={i} border>
                <div className="p-2 text-center">{i + 1}</div>
              </Widget>
            ))}
          </GridLayout>
        </div>
      </div>
    </div>
  ),
};
