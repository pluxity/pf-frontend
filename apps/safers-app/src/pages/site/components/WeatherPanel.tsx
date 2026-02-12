import { DraggablePanel } from "./DraggablePanel";

interface WeatherPanelProps {
  className?: string;
}

export function WeatherPanel({ className }: WeatherPanelProps) {
  return (
    <DraggablePanel title="날씨/환경" variant="blue" className={className}>
      <p className="mt-2 text-xs text-[#999]">날씨 데이터 없음</p>
    </DraggablePanel>
  );
}
