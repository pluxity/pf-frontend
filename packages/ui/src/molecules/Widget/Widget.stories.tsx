import type { Meta, StoryObj } from "@storybook/react";
import { Widget, WidgetHeader, WidgetContent } from "./Widget";

const meta = {
  title: "Molecules/Widget",
  component: Widget,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Widget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Widget title="매출 현황" className="w-80">
      <p className="text-sm text-secondary dark:text-dark-text-secondary">
        이번 달 총 매출: ₩12,500,000
      </p>
    </Widget>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <Widget className="w-80">
      <p className="text-sm text-secondary dark:text-dark-text-secondary">
        제목 없는 위젯입니다. 콘텐츠만 표시됩니다.
      </p>
    </Widget>
  ),
};

export const WithoutBorder: Story = {
  render: () => (
    <Widget title="알림" border={false} className="w-80">
      <p className="text-sm text-secondary dark:text-dark-text-secondary">
        테두리가 없는 위젯입니다.
      </p>
    </Widget>
  ),
};

export const CustomHeaderContent: Story = {
  render: () => (
    <div className="w-80 rounded-xl bg-white shadow-card border border-border-light dark:bg-dark-bg-card dark:border-dark-border-light dark:shadow-none">
      <WidgetHeader className="flex items-center justify-between">
        <span>사용자 통계</span>
        <span className="text-xs text-muted dark:text-dark-text-muted">최근 7일</span>
      </WidgetHeader>
      <WidgetContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted dark:text-dark-text-muted">방문자</span>
            <span className="font-semibold text-primary dark:text-dark-text-primary">1,234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted dark:text-dark-text-muted">신규 가입</span>
            <span className="font-semibold text-primary dark:text-dark-text-primary">56</span>
          </div>
        </div>
      </WidgetContent>
    </div>
  ),
};

export const MultipleWidgets: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[680px]">
      <Widget title="매출">
        <p className="text-2xl font-bold text-primary dark:text-dark-text-primary">₩12.5M</p>
        <p className="text-xs text-muted dark:text-dark-text-muted">전월 대비 +12%</p>
      </Widget>
      <Widget title="주문">
        <p className="text-2xl font-bold text-primary dark:text-dark-text-primary">328</p>
        <p className="text-xs text-muted dark:text-dark-text-muted">전월 대비 +5%</p>
      </Widget>
      <Widget title="방문자">
        <p className="text-2xl font-bold text-primary dark:text-dark-text-primary">8,492</p>
        <p className="text-xs text-muted dark:text-dark-text-muted">전월 대비 -3%</p>
      </Widget>
      <Widget title="전환율">
        <p className="text-2xl font-bold text-primary dark:text-dark-text-primary">3.2%</p>
        <p className="text-xs text-muted dark:text-dark-text-muted">전월 대비 +0.5%</p>
      </Widget>
    </div>
  ),
};
