import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Label } from "../../atoms/Label";

const meta = {
  title: "Molecules/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드에 대한 설명이 들어갑니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          카드 내용이 여기에 들어갑니다. 다양한 정보를 표시할 수 있습니다.
        </p>
      </CardContent>
      <CardFooter>
        <Button>확인</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>계정 생성</CardTitle>
        <CardDescription>새 계정을 만들어 시작하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input id="name" placeholder="이름을 입력하세요" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" placeholder="email@example.com" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">취소</Button>
        <Button>생성</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[300px] p-6">
      <p className="text-sm text-gray-600">간단한 카드 내용입니다.</p>
    </Card>
  ),
};
