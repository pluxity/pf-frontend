/**
 * 주요 관리 사항 뷰 컴포넌트
 * @see https://github.com/pluxity/pf-frontend/issues/190
 */
import { Carousel } from "@pf-dev/ui";
import { useKeyManagement } from "@/hooks/useKeyManagement";
import { useKeyManagementStore } from "@/stores/keyManagement.store";
import type { KeyManagementItem } from "@/services";

type SectionKey = keyof Pick<
  KeyManagementItem,
  "methodFeature" | "methodContent" | "methodDirection"
>;

interface Section {
  key: SectionKey;
  label: string;
}

const SECTIONS: Section[] = [
  { key: "methodFeature", label: "특징" },
  { key: "methodContent", label: "내용" },
  { key: "methodDirection", label: "추진방향" },
];

export function KeyManagementView() {
  const { items, isLoading, error, getTypeDescription } = useKeyManagement();
  const { activeIndex, setActiveIndex } = useKeyManagementStore();

  const currentItem = items[activeIndex] ?? null;

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
    <div className="flex flex-col h-full bg-[#54565A]">
      {/* Content: 좌측 이미지 + 우측 텍스트 */}
      <div className="flex-1 min-h-0">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-300">
            등록된 항목이 없습니다
          </div>
        ) : (
          <div className="flex h-full">
            {/* 좌측: 이미지 캐러셀 + 좌상단 오버레이 */}
            <div className="relative w-1/2 h-full">
              <Carousel
                transition="slide"
                loop
                autoPlay
                autoPlayInterval={10000}
                showArrows={false}
                showIndicators={items.length > 1}
                activeIndex={activeIndex}
                onChange={setActiveIndex}
                className="h-full"
              >
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-center h-full p-4">
                    {item.file?.url ? (
                      <img
                        src={item.file.url}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
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

              {/* 좌상단 타입 TAG + 타이틀 오버레이 */}
              {currentItem && (
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <span className="bg-[#F37021] text-white text-[18px] font-bold px-[5px] py-[3px] leading-tight">
                    {getTypeDescription(currentItem.type)}
                  </span>
                  <span className="text-[20px] font-bold text-[#F37021]">{currentItem.title}</span>
                </div>
              )}
            </div>

            {/* 우측: 공법 상세 — 플랫 섹션 */}
            <div className="w-1/2 h-full overflow-y-auto p-4 flex flex-col gap-3 key-management-scroll">
              {SECTIONS.map(
                (section) =>
                  currentItem?.[section.key] && (
                    <div key={section.key}>
                      <div className="bg-[#333] h-[35px] px-[10px] flex items-center rounded-md">
                        <h4 className="text-[16px] font-bold text-white">{section.label}</h4>
                      </div>
                      <div className="px-[10px] py-2 max-h-[200px] overflow-y-auto key-management-scroll">
                        <p className="text-[14px] text-white whitespace-pre-wrap leading-relaxed">
                          {currentItem[section.key]}
                        </p>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>

      {/* 커스텀 스크롤바 스타일 */}
      <style>{`
        .key-management-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .key-management-scroll::-webkit-scrollbar-track {
          background: #DFE4EB;
        }
        .key-management-scroll::-webkit-scrollbar-thumb {
          background: #8B8B8B;
          border-radius: 2.5px;
        }
      `}</style>
    </div>
  );
}
