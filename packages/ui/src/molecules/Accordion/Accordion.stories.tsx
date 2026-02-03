import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./Accordion";

const meta: Meta = {
  title: "Molecules/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-96">
      <AccordionItem value="item-1">
        <AccordionTrigger>이용약관</AccordionTrigger>
        <AccordionContent>
          서비스 이용에 관한 약관 내용이 여기에 표시됩니다. 자세한 내용은 전체 약관을 확인해주세요.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>개인정보처리방침</AccordionTrigger>
        <AccordionContent>개인정보 수집 및 이용에 관한 내용이 여기에 표시됩니다.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>자주 묻는 질문</AccordionTrigger>
        <AccordionContent>
          FAQ 내용이 여기에 표시됩니다. 추가 문의사항은 고객센터로 연락해주세요.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-96">
      <AccordionItem value="item-1">
        <AccordionTrigger>섹션 1</AccordionTrigger>
        <AccordionContent>여러 개의 아코디언을 동시에 열 수 있습니다.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>섹션 2</AccordionTrigger>
        <AccordionContent>type="multiple"을 사용하면 됩니다.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>섹션 3</AccordionTrigger>
        <AccordionContent>세 번째 섹션의 내용입니다.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
