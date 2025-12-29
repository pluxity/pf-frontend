import { useMemo } from "react";
import { cn } from "../../utils";
import { ChevronLeft, ChevronRight } from "../../atoms/Icon";
import type { PaginationProps } from "./types";

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

const DOTS = "...";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  variant = "default",
  className,
}: PaginationProps) => {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return range(1, totalPages);
  }, [totalPages, siblingCount, currentPage]);

  if (currentPage === 0 || totalPages < 2) {
    return null;
  }

  const onPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const onNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const isBordered = variant === "bordered";

  const navButtonClass = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
    isBordered ? "border border-gray-200 bg-white hover:bg-gray-50" : "hover:bg-gray-100"
  );

  const getPageButtonClass = (isActive: boolean) => {
    if (isBordered) {
      return cn(
        "inline-flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors border",
        isActive
          ? "border-brand bg-brand text-white"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      );
    }
    return cn(
      "inline-flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors",
      isActive ? "bg-blue-50 text-brand" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    );
  };

  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="Pagination">
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
        className={navButtonClass}
        aria-label="Previous page"
      >
        <ChevronLeft size="sm" />
      </button>

      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span
              key={`dots-${index}`}
              className="inline-flex h-8 w-8 items-center justify-center text-gray-500"
            >
              &#8230;
            </span>
          );
        }

        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber as number)}
            className={getPageButtonClass(currentPage === pageNumber)}
            aria-current={currentPage === pageNumber ? "page" : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={navButtonClass}
        aria-label="Next page"
      >
        <ChevronRight size="sm" />
      </button>
    </nav>
  );
};

Pagination.displayName = "Pagination";

export { Pagination };
