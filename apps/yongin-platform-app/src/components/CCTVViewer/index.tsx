import { useState, useMemo } from "react";
import { cn } from "@pf-dev/ui/utils";
import { CCTVGrid } from "./CCTVGrid";
import { GRID_TEMPLATES, type TemplateId } from "./types";
import type { CCTVPath } from "@/services/types";

interface CCTVViewerProps {
  cctvs: CCTVPath[];
  getStreamUrl: (name: string) => string;
  onCardClick?: (cctvIndex: number) => void;
}

/**
 * 템플릿 아이콘 (SVG)
 */
const TemplateIcons: Record<TemplateId, React.ReactNode> = {
  "1x1": (
    <svg className="w-4 h-4 4k:w-8 4k:h-8" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  "2x2": (
    <svg className="w-4 h-4 4k:w-8 4k:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  ),
  "1+5": (
    <svg className="w-4 h-4 4k:w-8 4k:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="11" height="11" rx="1" strokeWidth="1.5" />
      <rect x="16" y="3" width="5" height="5" rx="1" />
      <rect x="16" y="9.5" width="5" height="5" rx="1" />
      <rect x="3" y="16" width="5" height="5" rx="1" />
      <rect x="9.5" y="16" width="5" height="5" rx="1" />
      <rect x="16" y="16" width="5" height="5" rx="1" />
    </svg>
  ),
  "3x3": (
    <svg className="w-4 h-4 4k:w-8 4k:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="10" y="3" width="5" height="5" rx="1" />
      <rect x="17" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="10" width="5" height="5" rx="1" />
      <rect x="10" y="10" width="5" height="5" rx="1" />
      <rect x="17" y="10" width="5" height="5" rx="1" />
      <rect x="3" y="17" width="5" height="5" rx="1" />
      <rect x="10" y="17" width="5" height="5" rx="1" />
      <rect x="17" y="17" width="5" height="5" rx="1" />
    </svg>
  ),
  "4x4": (
    <svg className="w-4 h-4 4k:w-8 4k:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <line x1="3" y1="8" x2="21" y2="8" />
      <line x1="3" y1="13" x2="21" y2="13" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <line x1="8" y1="3" x2="8" y2="21" />
      <line x1="13" y1="3" x2="13" y2="21" />
      <line x1="18" y1="3" x2="18" y2="21" />
      <rect x="3" y="3" width="18" height="18" rx="1" />
    </svg>
  ),
};

// 템플릿 순서: 1, 4, 1+5, 9, 16
const TEMPLATE_ORDER: TemplateId[] = ["1x1", "2x2", "1+5", "3x3", "4x4"];

/**
 * CCTV 뷰어 메인 컴포넌트
 */
export function CCTVViewer({ cctvs, getStreamUrl, onCardClick }: CCTVViewerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("4x4");
  const [currentPage, setCurrentPage] = useState(0);

  const template = GRID_TEMPLATES[selectedTemplate];
  const totalPages = Math.ceil(cctvs.length / template.itemsPerPage);

  // 현재 페이지 CCTV 목록
  const currentCCTVs = useMemo(() => {
    const start = currentPage * template.itemsPerPage;
    return cctvs.slice(start, start + template.itemsPerPage);
  }, [cctvs, currentPage, template.itemsPerPage]);

  // 템플릿 변경 시 페이지 리셋
  const handleTemplateChange = (templateId: TemplateId) => {
    setSelectedTemplate(templateId);
    setCurrentPage(0);
  };

  // 페이지 변경
  const handlePageChange = (direction: "prev" | "next") => {
    setCurrentPage((prev) => {
      if (direction === "prev") {
        return Math.max(0, prev - 1);
      }
      return Math.min(totalPages - 1, prev + 1);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between px-4 py-2 bg-primary-100/70 border-b border-primary-100 4k:px-8 4k:py-4">
        {/* 템플릿 선택 */}
        <div className="flex items-center gap-1 bg-white/80 rounded-lg p-1 4k:gap-2 4k:p-2">
          {TEMPLATE_ORDER.map((id) => {
            const tmpl = GRID_TEMPLATES[id];
            return (
              <button
                key={id}
                onClick={() => handleTemplateChange(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors 4k:px-6 4k:py-3 4k:text-xl 4k:gap-3",
                  selectedTemplate === id
                    ? "bg-brand text-white shadow-sm"
                    : "text-primary-700 hover:text-primary-900 hover:bg-primary-50"
                )}
                title={tmpl.name}
              >
                {TemplateIcons[id]}
                <span className="hidden sm:inline">{tmpl.name}</span>
              </button>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center gap-3 text-primary-800 4k:gap-6">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 0}
            className="p-1.5 rounded-lg hover:bg-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors 4k:p-3"
            aria-label="이전 페이지"
          >
            <svg
              className="w-5 h-5 4k:w-10 4k:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span className="text-sm font-medium min-w-[60px] text-center 4k:text-2xl 4k:min-w-[120px]">
            {currentPage + 1} / {totalPages || 1}
          </span>

          <button
            onClick={() => handlePageChange("next")}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 rounded-lg hover:bg-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors 4k:p-3"
            aria-label="다음 페이지"
          >
            <svg
              className="w-5 h-5 4k:w-10 4k:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* CCTV 그리드 */}
      <div className="flex-1 overflow-hidden p-4 bg-primary-50/30 4k:p-8">
        <CCTVGrid
          template={template}
          cctvs={currentCCTVs}
          getStreamUrl={getStreamUrl}
          onCardClick={(index) => {
            const globalIndex = currentPage * template.itemsPerPage + index;
            onCardClick?.(globalIndex);
          }}
        />
      </div>
    </div>
  );
}
