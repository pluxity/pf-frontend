import { Widget, cn } from "@pf-dev/ui";
import { KeyManagementProps } from "./types";
import { CarouselCard, CarouselInfo } from "@/components/CarouselCard";
import { useKeyManagement } from "@/hooks/useKeyManagement";
import { useKeyManagementStore } from "@/stores/keyManagement.store";

export function KeyManagement({ id, className }: KeyManagementProps) {
  const { items, isLoading, error, getTypeDescription } = useKeyManagement();
  const { activeIndex, setActiveIndex } = useKeyManagementStore();

  const handlePrev = () => {
    if (activeIndex === 0) {
      setActiveIndex(items.length - 1);
    } else {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex === items.length - 1) {
      setActiveIndex(0);
    } else {
      setActiveIndex(activeIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <Widget id={id} className={cn(className, "")} contentClassName="h-full">
        <CarouselCard>
          <CarouselCard.Header title="주요 관리사항" showArrows={false} />
          <div className="p-8 text-center text-neutral-500">로딩 중...</div>
        </CarouselCard>
      </Widget>
    );
  }

  if (error) {
    return (
      <Widget id={id} className={cn(className, "")} contentClassName="h-full">
        <CarouselCard>
          <CarouselCard.Header title="주요 관리사항" showArrows={false} />
          <div className="p-8 text-center text-neutral-500">{error}</div>
        </CarouselCard>
      </Widget>
    );
  }

  // 데이터 없음
  if (items.length === 0) {
    return (
      <Widget id={id} className={cn(className, "")} contentClassName="h-full">
        <CarouselCard>
          <CarouselCard.Header title="주요 관리사항" showArrows={false} />
          <div className="p-8 text-center text-neutral-500">주요 관리사항이 없습니다</div>
        </CarouselCard>
      </Widget>
    );
  }

  const currentItem = items[activeIndex];
  if (!currentItem) return null;

  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <CarouselCard>
        <CarouselCard.Header
          title="주요 관리사항"
          onPrev={handlePrev}
          onNext={handleNext}
          showArrows={items.length > 1}
        />
        <CarouselCard.Content>
          <CarouselInfo>
            {currentItem.file?.url ? (
              <CarouselInfo.Image src={currentItem.file.url} alt={currentItem.title} />
            ) : (
              <div className="w-full h-25 bg-white flex flex-col items-center justify-center text-gray-300">
                <svg
                  className="w-12 h-12 mb-1"
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
            <div className="flex gap-2">
              <CarouselInfo.Tag>{getTypeDescription(currentItem.type)}</CarouselInfo.Tag>
              <CarouselInfo.Title>{currentItem.title}</CarouselInfo.Title>
            </div>
            <CarouselInfo.Description>
              {currentItem.methodDirection || "설명이 없습니다"}
            </CarouselInfo.Description>
          </CarouselInfo>
        </CarouselCard.Content>
      </CarouselCard>
    </Widget>
  );
}
