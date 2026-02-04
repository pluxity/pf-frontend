import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Organisms/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["empty-inbox", "no-data", "no-results", "custom"],
      description: "빈 상태 변형",
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyInbox: Story = {
  args: {
    variant: "empty-inbox",
    title: "메시지 없음",
    description: "받은 메시지가 없습니다. 새 메시지가 도착하면 여기에 표시됩니다.",
  },
};

export const NoData: Story = {
  args: {
    variant: "no-data",
    title: "데이터 없음",
    description: "현재 표시할 데이터가 없습니다.",
  },
};

export const NoResults: Story = {
  args: {
    variant: "no-results",
    title: "검색 결과 없음",
    description: "원하는 결과를 찾으려면 검색어나 필터를 조정해 보세요.",
  },
};

export const WithAction: Story = {
  args: {
    variant: "empty-inbox",
    title: "프로젝트 없음",
    description: "첫 번째 프로젝트를 만들어 시작하세요.",
    action: {
      label: "프로젝트 생성",
      onClick: () => console.log("프로젝트 생성 클릭"),
    },
  },
};

export const CustomIcon: Story = {
  args: {
    variant: "custom",
    title: "환영합니다!",
    description: "사용자 정의 아이콘을 사용한 빈 상태입니다.",
    icon: <div className="text-6xl">🎉</div>,
  },
};

export const SearchNoResults: Story = {
  render: () => (
    <div className="w-[31.25rem]">
      <EmptyState
        variant="no-results"
        title="'디자인 시스템' 검색 결과 없음"
        description="검색어와 일치하는 결과를 찾을 수 없습니다. 다른 키워드를 사용하거나 맞춤법을 확인해 보세요."
        action={{
          label: "검색 초기화",
          onClick: () => console.log("검색 초기화 클릭"),
        }}
      />
    </div>
  ),
};
