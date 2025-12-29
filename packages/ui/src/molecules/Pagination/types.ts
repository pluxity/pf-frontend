export type PaginationVariant = "default" | "bordered";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  variant?: PaginationVariant;
  className?: string;
}
