import { Widget, cn } from "@pf-dev/ui";
import { AnnouncementProps } from "./types";

export function Announcement({ id, className }: AnnouncementProps) {
  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="font-bold mb-2">공지사항 타이틀</div>
      <div className="text-sm">공지사항 컨텐츠</div>
    </Widget>
  );
}
