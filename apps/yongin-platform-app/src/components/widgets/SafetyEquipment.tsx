import { Widget, cn, Spinner } from "@pf-dev/ui";
import type { SafetyEquipmentProps } from "./types";
import { useSafetyEquipment } from "@/hooks/useSafetyEquipment";
import { RadarChart } from "@/components/RadarChart";

export function SafetyEquipment({ id, className }: SafetyEquipmentProps) {
  const { equipments, isLoading, isError } = useSafetyEquipment();

  const chartData = equipments.map((eq) => ({
    label: eq.name,
    value: eq.quantity,
  }));

  return (
    <Widget id={id} className={cn(className)} contentClassName="h-full">
      <div className="flex flex-col h-full">
        <div className="font-bold">안전장비 현황</div>
        <div className="flex-1 flex items-center justify-center min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" />
              <p className="text-sm text-neutral-500">데이터를 불러오는 중...</p>
            </div>
          ) : isError ? (
            <p className="text-sm text-neutral-500">데이터를 불러오는데 실패했습니다.</p>
          ) : chartData.length < 3 ? (
            <p className="text-sm text-neutral-500">안전장비 데이터가 부족합니다.</p>
          ) : (
            <RadarChart data={chartData} size={340} className="max-h-full" />
          )}
        </div>
      </div>
    </Widget>
  );
}
