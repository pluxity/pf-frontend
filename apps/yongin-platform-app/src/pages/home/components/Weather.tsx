import { Widget, cn } from "@pf-dev/ui";
import { WeatherProps } from "./types";

export function Weather({ id, className }: WeatherProps) {
  return (
    <Widget id={id} className={cn(className, "4k:text-4xl 4k:p-8")} contentClassName="h-full">
      <div className="font-bold mb-2 4k:text-4xl 4k:mb-6">날씨 타이틀</div>
      <div className="text-sm 4k:text-3xl">날씨 컨텐츠</div>
    </Widget>
  );
}
