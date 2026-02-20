import { cn } from "@pf-dev/ui/utils";
import { Button, Badge } from "@pf-dev/ui/atoms";
import { ChevronLeft, ChevronRight } from "@pf-dev/ui/atoms";

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
        <div className="flex ml-auto border-1 rounded-xl border-gray-300">
          <Button
            variant="ghost"
            onClick={onPrev}
            aria-label="prev"
            className={cn("w-8 h-6 p-0 border-r rounded-none border-gray-300", prevClassName)}
          >
            <ChevronLeft size="xs" className="text-gray-300" />
          </Button>
          <Button
            variant="ghost"
            onClick={onNext}
            aria-label="next"
            className={cn("w-8 h-6 p-0 rounded-none", nextClassName)}
          >
            <ChevronRight size="xs" className="text-gray-300" />
          </Button>
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
