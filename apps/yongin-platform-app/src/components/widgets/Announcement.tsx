import { useState, useEffect } from "react";
import { Widget, cn } from "@pf-dev/ui";
import type { BaseWidgetProps } from "./types";
import { useNotices } from "@/hooks/useNotices";
import arrowPrevIcon from "@/assets/icons/arrow-prev.svg";
import arrowNextIcon from "@/assets/icons/arrow-next.svg";

const AUTO_ROLL_INTERVAL = 5000;

export function Announcement({ id, className }: BaseWidgetProps) {
  const { notices, isLoading, isError } = useNotices();
  const [currentIndex, setCurrentIndex] = useState(0);

  const notice = notices[currentIndex];
  const total = notices.length;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  // 자동 롤링 (5초 간격)
  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    }, AUTO_ROLL_INTERVAL);

    return () => clearInterval(timer);
  }, [total]);

  const formatDate = (dateStr: string) => {
    return dateStr.split("T")[0];
  };

  return (
    <Widget id={id} className={cn(className)} contentClassName="h-full flex flex-col p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">공지사항</h3>
        {total > 1 && (
          <div className="flex">
            <button
              onClick={goPrev}
              className="w-7 h-7 flex items-center justify-center rounded-l border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="이전 공지"
            >
              <img src={arrowPrevIcon} alt="" className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="w-7 h-7 flex items-center justify-center rounded-r border border-l-0 border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="다음 공지"
            >
              <img src={arrowNextIcon} alt="" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 본문 */}
      {isLoading && (
        <div className="flex-1 space-y-2">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-px w-full bg-gray-200" />
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          공지사항을 불러오지 못했습니다
        </div>
      )}

      {!isLoading && !isError && !notice && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          등록된 공지사항이 없습니다
        </div>
      )}

      {!isLoading && !isError && notice && (
        <div className="flex-1 min-h-0 flex flex-col">
          <p className="font-bold text-sm text-gray-800 mb-1">{notice.title}</p>
          <p className="text-xs text-gray-400 mb-2">{formatDate(notice.updatedAt)}</p>
          <hr className="border-gray-200 mb-2" />
          <div className="flex-1 min-h-0 overflow-y-auto text-sm text-gray-600 leading-relaxed">
            <p className="indent-[-0.75em] pl-3">
              <span className="text-gray-400 mr-1">•</span>
              {notice.content}
            </p>
          </div>
        </div>
      )}
    </Widget>
  );
}
