import { DraggablePanel } from "./DraggablePanel";
import { weatherService } from "@/services/weather.service";
import type { ParsedWeather } from "@/services";

const PTY_LABELS: Record<string, string> = {
  "0": "없음",
  "1": "비",
  "2": "비/눈",
  "3": "눈",
  "4": "소나기",
};

const SKY_LABELS: Record<string, string> = {
  "1": "맑음",
  "3": "구름많음",
  "4": "흐림",
};

interface WeatherPanelProps {
  currentWeather: ParsedWeather | null;
  className?: string;
}

function InfoRow({ label, value, unit }: { label: string; value: string | null; unit?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#777]">{label}</span>
      <span className="text-xs font-semibold text-[#333]">
        {value ?? "--"}
        {unit && value ? unit : ""}
      </span>
    </div>
  );
}

export function WeatherPanel({ currentWeather, className }: WeatherPanelProps) {
  const currentHour = new Date().getHours();
  const weatherIcon = weatherService.getWeatherIcon(
    currentWeather?.pty,
    currentWeather?.sky,
    currentHour
  );

  const ptyLabel = currentWeather?.pty
    ? (PTY_LABELS[currentWeather.pty] ?? currentWeather.pty)
    : null;
  const skyLabel = currentWeather?.sky
    ? (SKY_LABELS[currentWeather.sky] ?? currentWeather.sky)
    : null;
  const lightningVal = currentWeather?.lightning;
  const hasLightning = lightningVal != null && Number(lightningVal) > 0;

  return (
    <DraggablePanel title="날씨/환경" variant="blue" className={className}>
      {/* 메인: 아이콘 + 온도 + 하늘상태 */}
      <div className="mt-2 flex items-center gap-3">
        <img
          src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/${weatherIcon}`}
          alt="weather"
          className="h-12 w-12"
        />
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold leading-none">
              {currentWeather?.temperature ?? "--"}°
            </span>
            {skyLabel && <span className="text-xs text-[#555]">{skyLabel}</span>}
          </div>
        </div>
      </div>

      {/* 상세 정보 그리드 */}
      <div className="mt-3 flex flex-col gap-1.5 border-t border-white/30 pt-2">
        <InfoRow label="습도" value={currentWeather?.humidity ?? null} unit="%" />
        <InfoRow
          label="바람"
          value={
            currentWeather?.windSpeed
              ? `${currentWeather.windDirection ?? "--"} ${currentWeather.windSpeed}`
              : null
          }
          unit="m/s"
        />
        <InfoRow label="강수형태" value={ptyLabel} />
        <InfoRow
          label="강수량"
          value={currentWeather?.rainfall === "0" ? "0" : (currentWeather?.rainfall ?? null)}
          unit="mm"
        />
        <InfoRow label="낙뢰" value={hasLightning ? "있음" : "없음"} />
      </div>
    </DraggablePanel>
  );
}
