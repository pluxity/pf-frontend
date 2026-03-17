import { cn } from "@pf-dev/ui";
import { MainContainer } from "@/components/MainContainer";
import type { BaseWidgetProps } from "./types";

export function MainContent({ id, className }: BaseWidgetProps) {
  return (
    <div id={id} className={cn("h-full overflow-hidden", className)}>
      <MainContainer />
    </div>
  );
}
