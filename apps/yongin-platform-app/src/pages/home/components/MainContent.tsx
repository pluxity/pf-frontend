import { Widget, cn } from "@pf-dev/ui";
import { CenterContainer } from "../../../components/CenterContainer";
import { MainContentProps } from "./types";

export function MainContent({ id, className }: MainContentProps) {
  return (
    <Widget
      id={id}
      border={false}
      className={cn(className, "4k:text-4xl")}
      contentClassName="h-full p-0"
    >
      <CenterContainer />
    </Widget>
  );
}
