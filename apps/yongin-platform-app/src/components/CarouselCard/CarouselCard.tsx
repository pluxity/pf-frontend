import { cn } from "@pf-dev/ui/utils";
import { Badge } from "@pf-dev/ui/atoms";
import { ChevronLeftSmall, ChevronRightSmall } from "@pf-dev/ui/atoms";

import type {
  CarouselCardProps,
  CarouselCardHeaderProps,
  CarouselCardContentProps,
  CarouselInfoProps,
  CarouselInfoImageProps,
  CarouselInfoTagProps,
  CarouselInfoTitleProps,
  CarouselInfoDescriptionProps,
} from "./types";

export function CarouselCard({ children, className }: CarouselCardProps) {
  return <div className={cn("overflow-hidden h-full", className)}>{children}</div>;
}

CarouselCard.Header = function CarouselCardHeader({
  className,
  title,
  titleClassName,
  onPrev,
  prevClassName,
  onNext,
  nextClassName,
  showArrows,
}: CarouselCardHeaderProps) {
  return (
    <div className={cn("flex items-center mb-3", className)}>
      <h2 className={cn("font-bold", titleClassName)}>{title}</h2>
      {showArrows && onPrev && onNext && (
        <div className="inline-flex ml-auto">
          <button
            onClick={onPrev}
            aria-label="prev"
            className={cn(
              "px-[0.3125rem] py-[0.375rem] rounded-tl-[0.625rem] rounded-bl-[0.625rem] outline outline-1 outline-offset-[-1px] outline-[#bbbecf] flex items-center justify-center hover:bg-gray-100 transition-colors",
              prevClassName
            )}
          >
            <ChevronLeftSmall size={10} className="text-[#9399B0]" />
          </button>
          <button
            onClick={onNext}
            aria-label="next"
            className={cn(
              "px-[0.3125rem] py-[0.375rem] rounded-tr-[0.625rem] rounded-br-[0.625rem] outline outline-1 outline-offset-[-1px] outline-[#bbbecf] flex items-center justify-center hover:bg-gray-100 transition-colors",
              nextClassName
            )}
          >
            <ChevronRightSmall size={10} className="text-[#9399B0]" />
          </button>
        </div>
      )}
    </div>
  );
};

CarouselCard.Content = function CarouselCardContent({
  children,
  className,
}: CarouselCardContentProps) {
  return <div className={cn(className)}>{children}</div>;
};

export function CarouselInfo({ children, className }: CarouselInfoProps) {
  return <div className={cn("flex flex-col gap-3", className)}>{children}</div>;
}

CarouselInfo.Image = function CarouselInfoImage({
  src,
  alt = "",
  className,
}: CarouselInfoImageProps) {
  return (
    <div className={cn("w-full h-25 bg-white", className)}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

CarouselInfo.Tag = function CarouselInfoTag({ children, className }: CarouselInfoTagProps) {
  return (
    <Badge variant="primary" className={cn("rounded-xs px-2 text-sm", className)}>
      {children}
    </Badge>
  );
};

CarouselInfo.Title = function CarouselInfoTitle({ children, className }: CarouselInfoTitleProps) {
  return <h3 className={cn("text-base font-bold text-primary-500", className)}>{children}</h3>;
};

CarouselInfo.Description = function CarouselInfoDescription({
  children,
  className,
}: CarouselInfoDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-800 overflow-y-auto max-h-20", className)}>{children}</p>
  );
};
