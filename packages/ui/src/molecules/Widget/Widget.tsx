import type { Ref, CSSProperties } from "react";
import { cn } from "../../utils";
import { useGridLayoutContext, useDragDropContext } from "../../organisms/GridLayout/hooks";
import type { WidgetProps, WidgetHeaderProps, WidgetContentProps } from "./types";

interface WidgetPropsWithRef extends WidgetProps {
  ref?: Ref<HTMLDivElement>;
}

function Widget({
  id,
  colSpan,
  rowSpan,
  title,
  border = true,
  className,
  contentClassName,
  children,
  style,
  ref,
  ...props
}: WidgetPropsWithRef) {
  const gridLayoutContext = useGridLayoutContext();
  const dragDropContext = useDragDropContext();

  // GridLayout 템플릿 모드에서 셀 위치 가져오기
  const cell = id && gridLayoutContext ? gridLayoutContext.getCellForWidget(id) : null;

  // 그리드 스타일 계산
  const gridStyle: CSSProperties = {
    ...style,
    ...(cell
      ? {
          gridColumn: `${cell.colStart} / span ${cell.colSpan}`,
          gridRow: `${cell.rowStart} / span ${cell.rowSpan}`,
        }
      : {
          ...(colSpan && { gridColumn: `span ${colSpan}` }),
          ...(rowSpan && { gridRow: `span ${rowSpan}` }),
        }),
  };

  // 드래그앤드롭 핸들러
  const isDragging = dragDropContext?.draggedWidgetId === id;
  const isDropTarget = dragDropContext?.dropTargetWidgetId === id;

  const handleDragStart = () => {
    if (dragDropContext?.editable && id) {
      dragDropContext.setDraggedWidgetId(id);
    }
  };

  const handleDragEnd = () => {
    if (dragDropContext?.editable) {
      dragDropContext.handleDrop();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (dragDropContext?.editable && id) {
      e.preventDefault();
      dragDropContext.setDropTargetWidgetId(id);
    }
  };

  const handleDragLeave = () => {
    if (dragDropContext?.editable) {
      dragDropContext.setDropTargetWidgetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (dragDropContext?.editable) {
      e.preventDefault();
      dragDropContext.handleDrop();
    }
  };

  return (
    <div
      ref={ref}
      id={id}
      draggable={dragDropContext?.editable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "rounded-xl bg-white shadow-card",
        border && "border border-border-light",
        isDragging && "opacity-50",
        isDropTarget && "ring-2 ring-primary",
        dragDropContext?.editable && "cursor-move",
        className
      )}
      style={gridStyle}
      {...props}
    >
      {title && <WidgetHeader>{title}</WidgetHeader>}
      <WidgetContent className={contentClassName}>{children}</WidgetContent>
    </div>
  );
}

interface WidgetHeaderPropsWithRef extends WidgetHeaderProps {
  ref?: Ref<HTMLDivElement>;
}

function WidgetHeader({ className, children, ref, ...props }: WidgetHeaderPropsWithRef) {
  return (
    <div
      ref={ref}
      className={cn(
        "px-4 py-3 border-b border-border-light",
        "text-sm font-semibold text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface WidgetContentPropsWithRef extends WidgetContentProps {
  ref?: Ref<HTMLDivElement>;
}

function WidgetContent({ className, children, ref, ...props }: WidgetContentPropsWithRef) {
  return (
    <div ref={ref} className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

export { Widget, WidgetHeader, WidgetContent };
