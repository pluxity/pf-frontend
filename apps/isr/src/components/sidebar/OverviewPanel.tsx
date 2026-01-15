import { Card, CardHeader, CardTitle, CardContent } from "@pf-dev/ui/molecules";
import { User, Car, PawPrint } from "lucide-react";

interface OverviewCounts {
  person: number;
  vehicle: number;
  wildlife: number;
}

interface OverviewPanelProps {
  counts?: OverviewCounts;
}

export function OverviewPanel({
  counts = { person: 0, vehicle: 0, wildlife: 0 },
}: OverviewPanelProps) {
  const total = counts.person + counts.vehicle + counts.wildlife;

  return (
    <Card className="h-full flex flex-col bg-[#181A1D]/80 backdrop-blur-md border-slate-600/30 rounded-xl">
      <CardHeader className="py-2 border-b border-slate-600/20 text-center">
        <CardTitle className="text-sm font-semibold text-white">종합상황</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-3 space-y-3">
        {/* 총 탐지 객체 */}
        <div className="text-xs text-right text-white/40">
          총 탐지 객체 : <span className="text-white/40">{total}</span>
        </div>

        {/* 객체 카운트 */}
        <div className="grid grid-cols-3 gap-2">
          {/* 사람 */}
          <div className="bg-[#E8A500] rounded-lg p-2 text-center">
            <User className="h-5 w-5 mx-auto mb-1 text-white" />
            <div className="text-xs text-white/90">사람</div>
            <div className="text-lg font-bold text-white">
              {String(counts.person).padStart(2, "0")}
            </div>
          </div>

          {/* 자동차 */}
          <div className="bg-[#C83C3C] rounded-lg p-2 text-center">
            <Car className="h-5 w-5 mx-auto mb-1 text-white" />
            <div className="text-xs text-white/90">자동차</div>
            <div className="text-lg font-bold text-white">
              {String(counts.vehicle).padStart(2, "0")}
            </div>
          </div>

          {/* 야생동물 */}
          <div className="bg-[#4A90B8] rounded-lg p-2 text-center">
            <PawPrint className="h-5 w-5 mx-auto mb-1 text-white" />
            <div className="text-xs text-white/90">야생동물</div>
            <div className="text-lg font-bold text-white">
              {String(counts.wildlife).padStart(2, "0")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
