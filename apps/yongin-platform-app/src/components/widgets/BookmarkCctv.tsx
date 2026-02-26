import { Widget, cn } from "@pf-dev/ui";
import type { BookmarkCctvProps } from "./types";
import { CCTVCard } from "../MainContainer/CCTVViewer/CCTVCard";
import { useCCTVBookmarks } from "@/hooks/useCCTVBookmarks";
import { cctvService } from "@/services";
import { useMainContainerStore } from "@/stores/mainContainer.store";

export function BookmarkCctv({ id, className }: BookmarkCctvProps) {
  const { bookmarks, isLoading, error } = useCCTVBookmarks();
  const requestTab = useMainContainerStore((s) => s.requestTab);

  const handleCardClick = () => {
    requestTab("cctv");
  };

  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg animate-pulse" />
          ))}

        {!isLoading && error && (
          <div className="col-span-2 row-span-2 flex items-center justify-center text-sm text-red-500">
            즐겨찾기를 불러오지 못했습니다
          </div>
        )}

        {!isLoading && !error && bookmarks.length === 0 && (
          <div className="col-span-2 row-span-2 flex items-center justify-center text-sm text-gray-400">
            북마크된 CCTV가 없습니다
          </div>
        )}

        {!isLoading &&
          !error &&
          bookmarks
            .slice(0, 4)
            .map((bookmark) => (
              <CCTVCard
                key={bookmark.id}
                streamUrl={cctvService.getWHEPUrl(bookmark.streamName)}
                streamName={bookmark.streamName}
                name={bookmark.streamName}
                showBookmark={false}
                onClick={handleCardClick}
              />
            ))}
      </div>
    </Widget>
  );
}
