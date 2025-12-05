import type { Meta, StoryObj } from "@storybook/react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "./MenuBar";

const meta: Meta<typeof Menubar> = {
  title: "Organisms/MenuBar",
  component: Menubar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  name: "기본 메뉴바",
  render: () => (
    <Menubar className="w-[800px] border-b">
      <MenubarMenu>
        <MenubarTrigger>파일</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="Ctrl+N">새로 만들기</MenubarItem>
          <MenubarItem shortcut="Ctrl+O">열기</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>최근 파일</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>project_1.json</MenubarItem>
              <MenubarItem>project_2.json</MenubarItem>
              <MenubarItem>project_3.json</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem shortcut="Ctrl+S">저장</MenubarItem>
          <MenubarItem shortcut="Ctrl+Shift+S">다른 이름으로 저장</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>내보내기</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF로 내보내기</MenubarItem>
              <MenubarItem>Excel로 내보내기</MenubarItem>
              <MenubarItem>CSV로 내보내기</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem disabled shortcut="Ctrl+P">
            인쇄
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem shortcut="Alt+F4">종료</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>편집</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="Ctrl+Z">실행취소</MenubarItem>
          <MenubarItem shortcut="Ctrl+Y">다시실행</MenubarItem>
          <MenubarSeparator />
          <MenubarItem shortcut="Ctrl+X">잘라내기</MenubarItem>
          <MenubarItem shortcut="Ctrl+C">복사</MenubarItem>
          <MenubarItem shortcut="Ctrl+V">붙여넣기</MenubarItem>
          <MenubarSeparator />
          <MenubarItem shortcut="Ctrl+A">전체선택</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>보기</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>도구모음</MenubarCheckboxItem>
          <MenubarCheckboxItem>상태표시줄</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem shortcut="Ctrl++">확대</MenubarItem>
          <MenubarItem shortcut="Ctrl+-">축소</MenubarItem>
          <MenubarItem shortcut="Ctrl+0">100%</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>장치관리</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>장치 추가</MenubarItem>
          <MenubarItem>장치 삭제</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>전체 장치 목록</MenubarItem>
          <MenubarItem>장치 상태 확인</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>이벤트</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>이벤트 로그</MenubarItem>
          <MenubarItem>알림 설정</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>이벤트 필터</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>도구</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>설정</MenubarItem>
          <MenubarItem>환경설정</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>플러그인 관리</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>도움말</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>도움말 보기</MenubarItem>
          <MenubarItem>시작 가이드</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>업데이트 확인</MenubarItem>
          <MenubarItem>정보</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithSubmenu: Story = {
  name: "2단계 서브메뉴",
  render: () => (
    <Menubar className="w-[400px] border-b">
      <MenubarMenu>
        <MenubarTrigger>파일</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>열기</MenubarItem>
          <MenubarItem>다운받기</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>내보내기</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF로 내보내기</MenubarItem>
              <MenubarItem>Excel로 내보내기</MenubarItem>
              <MenubarItem>이미지로 내보내기</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem>저장</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithRadioGroup: Story = {
  name: "라디오 그룹",
  render: () => (
    <Menubar className="w-[200px] border-b">
      <MenubarMenu>
        <MenubarTrigger>보기</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="dark">
            <MenubarRadioItem value="light">라이트 모드</MenubarRadioItem>
            <MenubarRadioItem value="dark">다크 모드</MenubarRadioItem>
            <MenubarRadioItem value="system">시스템 설정</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
