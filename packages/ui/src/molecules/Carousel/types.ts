import type { ReactNode, ComponentPropsWithoutRef } from "react";

export type CarouselTransition = "slide" | "fade" | "none";
export type CarouselArrowVariant = "default" | "ghost";

export interface CarouselProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  children: ReactNode[];
  transition?: CarouselTransition;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showIndicators?: boolean;
  loop?: boolean;
  lazy?: boolean;
  preloadAdjacent?: boolean;
  activeIndex?: number;
  onChange?: (index: number) => void;
  transitionDuration?: number;
  arrowVariant?: CarouselArrowVariant;
  arrowClassName?: string;
}

export interface CarouselContextValue {
  activeIndex: number;
  totalSlides: number;
  goTo: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  transition: CarouselTransition;
  transitionDuration: number;
}
