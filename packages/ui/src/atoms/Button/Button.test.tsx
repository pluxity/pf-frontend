import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  describe("렌더링", () => {
    it("children을 렌더링한다", () => {
      render(<Button>클릭</Button>);
      expect(screen.getByRole("button")).toHaveTextContent("클릭");
    });

    it("기본 variant와 size가 적용된다", () => {
      render(<Button>버튼</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-brand");
      expect(button).toHaveClass("h-10");
    });

    it("variant에 따라 스타일이 적용된다", () => {
      render(<Button variant="secondary">버튼</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-neutral-50");
    });

    it("size에 따라 크기가 변경된다", () => {
      render(<Button size="lg">버튼</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-12");
    });
  });

  describe("상호작용", () => {
    it("클릭 시 onClick이 호출된다", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>클릭</Button>);

      fireEvent.click(screen.getByRole("button"));

      expect(handleClick).toHaveBeenCalledOnce();
    });

    it("disabled일 때 클릭이 무시된다", () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          클릭
        </Button>
      );

      fireEvent.click(screen.getByRole("button"));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("접근성", () => {
    it("disabled 상태가 적용된다", () => {
      render(<Button disabled>버튼</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("aria-label이 적용된다", () => {
      render(<Button aria-label="닫기">X</Button>);
      expect(screen.getByRole("button")).toHaveAccessibleName("닫기");
    });
  });

  describe("ref", () => {
    it("ref가 전달된다", () => {
      const ref = { current: null };
      render(<Button ref={ref}>버튼</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
