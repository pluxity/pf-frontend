import { Fragment } from "react";
import { cn } from "../../utils";
import type { CardListProps } from "./types";

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

function CardList<T>({
  data,
  renderCard,
  keyExtractor,
  columns = 3,
  gap = 16,
  className,
  ref,
  ...props
}: CardListProps<T>) {
  return (
    <div
      ref={ref}
      className={cn("grid", columnClasses[columns], className)}
      style={{ gap }}
      {...props}
    >
      {data.map((item, index) => (
        <Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderCard(item, index)}
        </Fragment>
      ))}
    </div>
  );
}

export { CardList };
