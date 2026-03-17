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

  const total = notices.length;
  // notices 목록이 줄어들어 currentIndex가 범위를 벗어나면 안전하게 보정
  const safeIndex = total > 0 ? currentIndex % total : 0;
  const notice = notices[safeIndex];

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  // 자동 롤링 (5초 간격) — currentIndex 의존성으로 수동 조작 시 타이머 리셋
  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    }, AUTO_ROLL_INTERVAL);

    return () => clearInterval(timer);
  }, [total, currentIndex]);

  const formatDate = (dateStr: string) => {
    return dateStr.split("T")[0];
  };

  return (
    <Widget id={id} className={cn(className)} contentClassName="h-full flex flex-col p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[16px] text-[#333] tracking-[-0.16px]">공지사항</h3>
        {total > 1 && (
          <div className="flex">
            <button
              onClick={goPrev}
              className="w-6 h-5 flex items-center justify-center rounded-l-[10px] rounded-r-none border border-[#BBBFCF] hover:bg-gray-100 transition-colors"
              aria-label="이전 공지"
            >
              <img src={arrowPrevIcon} alt="" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={goNext}
              className="w-6 h-5 flex items-center justify-center rounded-r-[10px] rounded-l-none border border-l-0 border-[#BBBFCF] hover:bg-gray-100 transition-colors"
              aria-label="다음 공지"
            >
              <img src={arrowNextIcon} alt="" className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 본문 */}
      {isLoading && (
        <div className="flex-1 space-y-2">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
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
          <p className="font-bold text-[14px] text-[#030303] mb-[23px]">
            {formatDate(notice.updatedAt)}
          </p>
          <div className="flex-1 min-h-0 overflow-y-auto text-[12px] text-[#555] leading-[20px] tracking-[-0.12px]">
            <p className="indent-[-0.75em] pl-3">
              <span className="text-[#555] mr-1">&bull;</span>
              {notice.content}
            </p>
          </div>
        </div>
      )}
    </Widget>
  );
}
