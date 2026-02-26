import { cn } from "@pf-dev/ui";
import { MainContainer } from "@/components/MainContainer";
import { MainContentProps } from "./types";

export function MainContent({ id, className }: MainContentProps) {
  return (
    <div id={id} className={cn("h-full overflow-hidden", className)}>
      <MainContainer />
    </div>
  );
}
