import type { ReactNode, Ref, HTMLAttributes } from "react";

export interface CardListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  data: T[];
  renderCard: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: number;
  ref?: Ref<HTMLDivElement>;
}
