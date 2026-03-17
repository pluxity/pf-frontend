import { useState, useMemo, useEffect } from "react";
import { cn } from "@pf-dev/ui/utils";
import { CCTVGrid } from "./CCTVGrid";
import { GRID_TEMPLATES, type TemplateId } from "./types";
import type { CCTVResponse } from "@/services/types";
import { useCctvBookmarkStore } from "@/stores/cctvBookmark.store";
import { useToastStore } from "@/stores/toast.store";

interface CCTVViewerProps {
  cctvs: CCTVResponse[];
  getStreamUrl: (name: string) => string;
  onCardClick?: (cctvIndex: number) => void;
}

const TEMPLATE_ORDER: TemplateId[] = ["1x1", "2x2", "3x3", "4x4", "5x6"];

export function CCTVViewer({ cctvs, getStreamUrl, onCardClick }: CCTVViewerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("4x4");
  const [currentPage, setCurrentPage] = useState(0);
  const bookmarks = useCctvBookmarkStore((s) => s.bookmarks);
  const ensureLoaded = useCctvBookmarkStore((s) => s.ensureLoaded);
  const toastWarning = useToastStore((s) => s.warning);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  // 즐겨찾기 CCTV를 상단으로 정렬
  const sortedCctvs = useMemo(() => {
    const bookmarkedNames = new Set(bookmarks.map((b) => b.streamName));
    const bookmarked = cctvs.filter((c) => bookmarkedNames.has(c.streamName));
    const rest = cctvs.filter((c) => !bookmarkedNames.has(c.streamName));
    return [...bookmarked, ...rest];
  }, [cctvs, bookmarks]);

  const template = GRID_TEMPLATES[selectedTemplate];
  const totalPages = Math.ceil(sortedCctvs.length / template.itemsPerPage);

  const start = currentPage * template.itemsPerPage;
  const currentCCTVs = sortedCctvs.slice(start, start + template.itemsPerPage);

  const handleTemplateChange = (templateId: TemplateId) => {
    setSelectedTemplate(templateId);
    setCurrentPage(0);
  };

  const handlePageChange = (direction: "prev" | "next") => {
    setCurrentPage((prev) => {
      if (direction === "prev") {
        return Math.max(0, prev - 1);
      }
      return Math.min(totalPages - 1, prev + 1);
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center px-4 pt-4">
        <div className="flex items-center overflow-hidden rounded-md border border-[#CCCCCC]">
          {TEMPLATE_ORDER.map((id, index) => {
            const tmpl = GRID_TEMPLATES[id];
            return (
              <button
                key={id}
                onClick={() => handleTemplateChange(id)}
                className={cn(
                  "flex items-center justify-center w-[50px] h-[36px] text-[12px] transition-colors",
                  index > 0 && "border-l border-[#CCCCCC]",
                  selectedTemplate === id
                    ? "bg-[#F37021] text-white font-bold"
                    : "bg-white text-[#555]"
                )}
                title={tmpl.name}
              >
                {tmpl.name}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 0}
            className="w-5 h-[25px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="이전 페이지"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path
                d="M7 1L1 7l6 6"
                stroke="#999"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className="text-[12px] text-[#999] min-w-[24px] text-center">
            {currentPage + 1}/{totalPages || 1}
          </span>

          <button
            onClick={() => handlePageChange("next")}
            disabled={currentPage >= totalPages - 1}
            className="w-5 h-[25px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="다음 페이지"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path
                d="M1 1l6 6-6 6"
                stroke="#999"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-1">
        <CCTVGrid
          template={template}
          cctvs={currentCCTVs}
          getStreamUrl={getStreamUrl}
          showBookmark
          onCardClick={(index) => {
            const globalIndex = currentPage * template.itemsPerPage + index;
            onCardClick?.(globalIndex);
          }}
          onMaxBookmarkReached={() => {
            toastWarning("즐겨찾기는 최대 4개까지 등록할 수 있습니다");
          }}
        />
      </div>
    </div>
  );
}
