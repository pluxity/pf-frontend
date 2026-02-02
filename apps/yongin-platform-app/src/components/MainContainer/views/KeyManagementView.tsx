/**
 * 주요 관리 사항 뷰 컴포넌트
 * @see https://github.com/pluxity/pf-frontend/issues/190
 */
import { useState, useEffect } from "react";
import { Carousel } from "@pf-dev/ui";
import { keyManagementService } from "@/services";
import type { KeyManagementItem, KeyManagementType } from "@/services";

type SectionKey = keyof Pick<
  KeyManagementItem,
  "methodFeature" | "methodContent" | "methodDirection"
>;

interface Section {
  key: SectionKey;
  label: string;
  step: number;
}

const SECTIONS: Section[] = [
  { key: "methodFeature", label: "특징", step: 1 },
  { key: "methodContent", label: "내용", step: 2 },
  { key: "methodDirection", label: "추진방향", step: 3 },
];

export function KeyManagementView() {
  const [items, setItems] = useState<KeyManagementItem[]>([]);
  const [types, setTypes] = useState<KeyManagementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [selectedItems, typeList] = await Promise.all([
          keyManagementService.getSelected(),
          keyManagementService.getTypes(),
        ]);
        if (!cancelled) {
          setItems(selectedItems);
          setTypes(typeList);
        }
      } catch (e) {
        console.error("Failed to fetch key management data:", e);
        if (!cancelled) {
          setError("데이터를 불러올 수 없습니다");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentItem = items[activeIndex] ?? null;

  const getTypeDescription = (code: string) =>
    types.find((t) => t.code === code)?.description ?? code;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-gray-400">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-primary-50/30">
      {/* Header: 타입 뱃지 + 제목 */}
      {currentItem && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] rounded bg-brand/10 text-brand font-medium">
              {getTypeDescription(currentItem.type)}
            </span>
            <h2 className="text-sm font-semibold text-gray-800 truncate">{currentItem.title}</h2>
          </div>
        </div>
      )}

      {/* Content: 좌측 이미지 + 우측 텍스트 */}
      <div className="flex-1 min-h-0">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            등록된 항목이 없습니다
          </div>
        ) : (
          <div className="flex h-full">
            {/* 좌측: 이미지 캐러셀 */}
            <div className="w-1/2 h-full">
              <Carousel
                transition="slide"
                loop
                autoPlay
                autoPlayInterval={10000}
                showArrows={items.length > 1}
                showIndicators={items.length > 1}
                activeIndex={activeIndex}
                onChange={setActiveIndex}
                className="h-full"
              >
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-center h-full bg-white p-4"
                  >
                    {item.file?.url ? (
                      <img
                        src={item.file.url}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-gray-300">
                        <svg
                          className="w-16 h-16 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs">등록된 이미지가 없습니다</span>
                      </div>
                    )}
                  </div>
                ))}
              </Carousel>
            </div>

            {/* 우측: 공법 상세 */}
            <div className="w-1/2 h-full overflow-y-auto p-4 flex flex-col gap-3">
              {SECTIONS.map(
                (section) =>
                  currentItem?.[section.key] && (
                    <div
                      key={section.key}
                      className="rounded-lg bg-white border border-gray-200 p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand/20 text-brand text-[10px] font-bold shrink-0">
                          {section.step}
                        </span>
                        <h4 className="text-xs font-semibold text-gray-700">{section.label}</h4>
                      </div>
                      <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed pl-7">
                        {currentItem[section.key]}
                      </p>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
