import type { Meta, StoryObj } from "@storybook/react";
import { Grid, Clock, Check, AlertTriangle } from "../../atoms/Icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";

const meta: Meta<typeof TabsList> = {
  title: "Molecules/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["underline", "filled"],
      description: "탭 스타일 variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const UnderlineStyle: Story = {
  name: "기본스타일 (Underline)",
  render: () => (
    <Tabs defaultValue="all" className="w-[400px]">
      <TabsList variant="underline">
        <TabsTrigger variant="underline" value="all">
          전체장비
        </TabsTrigger>
        <TabsTrigger variant="underline" value="progress">
          진행중
        </TabsTrigger>
        <TabsTrigger variant="underline" value="complete">
          완료
        </TabsTrigger>
        <TabsTrigger variant="underline" value="error">
          에러발치
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-gray-600 p-4">전체장비 목록입니다.</p>
      </TabsContent>
      <TabsContent value="progress">
        <p className="text-sm text-gray-600 p-4">진행중인 항목입니다.</p>
      </TabsContent>
      <TabsContent value="complete">
        <p className="text-sm text-gray-600 p-4">완료된 항목입니다.</p>
      </TabsContent>
      <TabsContent value="error">
        <p className="text-sm text-gray-600 p-4">에러 항목입니다.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const UnderlineWithIcons: Story = {
  name: "기본스타일 - 아이콘",
  render: () => (
    <Tabs defaultValue="all" className="w-[450px]">
      <TabsList variant="underline">
        <TabsTrigger variant="underline" value="all">
          <Grid size="xs" />
          전체장비
        </TabsTrigger>
        <TabsTrigger variant="underline" value="progress">
          <Clock size="xs" />
          진행중
        </TabsTrigger>
        <TabsTrigger variant="underline" value="complete">
          <Check size="xs" />
          완료
        </TabsTrigger>
        <TabsTrigger variant="underline" value="error">
          <AlertTriangle size="xs" />
          에러발치
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-gray-600 p-4">전체장비 목록입니다.</p>
      </TabsContent>
      <TabsContent value="progress">
        <p className="text-sm text-gray-600 p-4">진행중인 항목입니다.</p>
      </TabsContent>
      <TabsContent value="complete">
        <p className="text-sm text-gray-600 p-4">완료된 항목입니다.</p>
      </TabsContent>
      <TabsContent value="error">
        <p className="text-sm text-gray-600 p-4">에러 항목입니다.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const FilledStyle: Story = {
  name: "볼드스타일 (Filled)",
  render: () => (
    <Tabs defaultValue="all" className="w-[300px]">
      <TabsList variant="filled">
        <TabsTrigger variant="filled" value="all">
          전체장비
        </TabsTrigger>
        <TabsTrigger variant="filled" value="progress">
          진행중
        </TabsTrigger>
        <TabsTrigger variant="filled" value="complete">
          완료
        </TabsTrigger>
        <TabsTrigger variant="filled" value="error">
          에러발치
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-gray-600 p-4">전체장비 목록입니다.</p>
      </TabsContent>
      <TabsContent value="progress">
        <p className="text-sm text-gray-600 p-4">진행중인 항목입니다.</p>
      </TabsContent>
      <TabsContent value="complete">
        <p className="text-sm text-gray-600 p-4">완료된 항목입니다.</p>
      </TabsContent>
      <TabsContent value="error">
        <p className="text-sm text-gray-600 p-4">에러 항목입니다.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const FilledWithIcons: Story = {
  name: "볼드스타일 - 아이콘",
  render: () => (
    <Tabs defaultValue="all" className="w-[380px]">
      <TabsList variant="filled">
        <TabsTrigger variant="filled" value="all">
          <Grid size="xs" />
          전체장비
        </TabsTrigger>
        <TabsTrigger variant="filled" value="progress">
          <Clock size="xs" />
          진행중
        </TabsTrigger>
        <TabsTrigger variant="filled" value="complete">
          <Check size="xs" />
          완료
        </TabsTrigger>
        <TabsTrigger variant="filled" value="error">
          <AlertTriangle size="xs" />
          에러발치
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-gray-600 p-4">전체장비 목록입니다.</p>
      </TabsContent>
      <TabsContent value="progress">
        <p className="text-sm text-gray-600 p-4">진행중인 항목입니다.</p>
      </TabsContent>
      <TabsContent value="complete">
        <p className="text-sm text-gray-600 p-4">완료된 항목입니다.</p>
      </TabsContent>
      <TabsContent value="error">
        <p className="text-sm text-gray-600 p-4">에러 항목입니다.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const AllVariants: Story = {
  name: "모든 스타일 비교",
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">기본스타일 (Underline)</h3>
        <Tabs defaultValue="tab1" className="w-[300px]">
          <TabsList variant="underline">
            <TabsTrigger variant="underline" value="tab1">
              탭 메뉴
            </TabsTrigger>
            <TabsTrigger variant="underline" value="tab2">
              탭 메뉴
            </TabsTrigger>
            <TabsTrigger variant="underline" value="tab3">
              탭 메뉴
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-4">볼드스타일 (Filled)</h3>
        <Tabs defaultValue="tab1" className="w-[250px]">
          <TabsList variant="filled">
            <TabsTrigger variant="filled" value="tab1">
              탭 메뉴
            </TabsTrigger>
            <TabsTrigger variant="filled" value="tab2">
              탭 메뉴
            </TabsTrigger>
            <TabsTrigger variant="filled" value="tab3">
              탭 메뉴
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};
