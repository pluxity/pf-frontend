import { Plus } from "@pf-dev/ui/atoms";

export interface EmptyWidgetProps {
  onAdd?: () => void;
}

export function EmptyWidget({ onAdd }: EmptyWidgetProps) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
      <button
        type="button"
        onClick={onAdd}
        className="flex flex-col items-center gap-2 text-gray-400 transition-colors hover:text-gray-600"
      >
        <Plus size="lg" />
        <span className="text-sm">위젯 추가</span>
      </button>
    </div>
  );
}
