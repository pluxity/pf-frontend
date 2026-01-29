import { Widget, cn } from "@pf-dev/ui";
import { MainContainer } from "@/components/MainContainer";
import { MainContentProps } from "./types";

export function MainContent({ id, className }: MainContentProps) {
  return (
    <Widget
      id={id}
      border={false}
      className={cn(className, " overflow-hidden")}
      contentClassName="h-full p-0"
    >
      <MainContainer />
    </Widget>
  );
}
