import { Widget, cn, Spinner } from "@pf-dev/ui";
import { useAnnouncement } from "@/hooks";
import { AnnouncementProps } from "./types";

/**
 * 홈 대시보드용 안내사항 위젯
 * - API에서 데이터 페칭
 * - 로딩/에러/빈 상태 처리
 */
export function Announcement({ id, className }: AnnouncementProps) {
  const { content, isLoading, isError } = useAnnouncement();

  return (
    <Widget id={id} className={cn(className, "4k:text-4xl 4k:p-8")} contentClassName="h-full">
      <div className="flex h-full flex-col">
        <div className="mb-2 font-bold 4k:mb-6 4k:text-4xl">안내사항</div>
        <div className="flex flex-1 items-center justify-center text-sm 4k:text-3xl">
          {isLoading ? (
            <Spinner size="sm" />
          ) : isError ? (
            <span className="text-gray-400">안내사항을 불러올 수 없습니다.</span>
          ) : content ? (
            <p className="text-center whitespace-pre-wrap">{content}</p>
          ) : (
            <span className="text-gray-400">등록된 안내사항이 없습니다.</span>
          )}
        </div>
      </div>
    </Widget>
  );
}
