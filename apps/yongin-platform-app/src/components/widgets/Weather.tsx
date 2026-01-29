import { Widget, cn } from "@pf-dev/ui";
import { WeatherProps } from "./types";
import { WeatherView } from "@/components/WeatherView";

export function Weather({ id, className }: WeatherProps) {
  return (
    <Widget
      id={id}
      className={cn(className, "4k:text-4xl 4k:p-8 bg-white/30")}
      contentClassName="h-full"
    >
      <WeatherView />
    </Widget>
  );
}
