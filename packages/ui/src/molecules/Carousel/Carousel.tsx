import {
  useState,
  useEffect,
  Children,
  type ComponentRef,
  type Ref,
  type KeyboardEvent,
} from "react";
import { cn } from "../../utils";
import { Button } from "../../atoms/Button";
import { ChevronLeft, ChevronRight } from "../../atoms/Icon";
import type { CarouselProps, CarouselContextValue } from "./types";
import { CarouselContext } from "./CarouselContext";

interface CarouselRootProps extends CarouselProps {
  ref?: Ref<ComponentRef<"div">>;
}

function Carousel({
  children,
  transition = "slide",
  autoPlay = false,
  autoPlayInterval = 3000,
  showArrows = true,
  showIndicators = true,
  loop = true,
  lazy = true,
  preloadAdjacent = false,
  activeIndex: controlledIndex,
  onChange,
  transitionDuration = 300,
  arrowVariant = "default",
  arrowClassName,
  className,
  ref,
  ...props
}: CarouselRootProps) {
  const isControlled = controlledIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = isControlled ? controlledIndex : internalIndex;

  const slides = Children.toArray(children);
  const totalSlides = slides.length;

  const setActiveIndex = (index: number) => {
    if (!isControlled) {
      setInternalIndex(index);
    }
    onChange?.(index);
  };

  const goTo = (index: number) => {
    let nextIndex = index;
    if (loop) {
      nextIndex = ((index % totalSlides) + totalSlides) % totalSlides;
    } else {
      nextIndex = Math.max(0, Math.min(index, totalSlides - 1));
    }
    setActiveIndex(nextIndex);
  };

  const goNext = () => {
    goTo(activeIndex + 1);
  };

  const goPrev = () => {
    goTo(activeIndex - 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;

    const interval = setInterval(() => {
      goNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, totalSlides, goNext]);

  const shouldRenderSlide = (index: number): boolean => {
    if (!lazy) return true;
    if (index === activeIndex) return true;
    if (preloadAdjacent) {
      if (loop) {
        const prevIndex = (activeIndex - 1 + totalSlides) % totalSlides;
        const nextIndex = (activeIndex + 1) % totalSlides;
        if (index === prevIndex || index === nextIndex) return true;
      } else {
        if (index === activeIndex - 1 || index === activeIndex + 1) return true;
      }
    }
    return false;
  };

  const contextValue: CarouselContextValue = {
    activeIndex,
    totalSlides,
    goTo,
    goNext,
    goPrev,
    transition,
    transitionDuration,
  };

  const getSlideStyle = (index: number) => {
    const isActive = index === activeIndex;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (transition === "none") {
      return {
        display: isActive ? "block" : "none",
      };
    }

    if (transition === "fade") {
      return {
        position: isActive ? ("relative" as const) : ("absolute" as const),
        inset: isActive ? undefined : 0,
        opacity: isActive ? 1 : 0,
        transition: prefersReducedMotion ? "none" : `opacity ${transitionDuration}ms ease-in-out`,
        pointerEvents: isActive ? ("auto" as const) : ("none" as const),
      };
    }

    return {};
  };

  const getContainerStyle = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (transition === "slide") {
      return {
        transform: `translateX(-${activeIndex * 100}%)`,
        transition: prefersReducedMotion ? "none" : `transform ${transitionDuration}ms ease-in-out`,
      };
    }
    return {};
  };

  const arrowButtonVariant = arrowVariant === "ghost" ? "ghost" : "secondary";

  const renderArrowButton = (
    direction: "prev" | "next",
    onClick: () => void,
    disabled: boolean
  ) => (
    <Button
      variant={arrowButtonVariant}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10 rounded-full [&_svg]:size-5",
        direction === "prev" ? "left-2" : "right-2",
        arrowVariant === "default" && "bg-white/80 shadow-md hover:bg-white",
        arrowClassName
      )}
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
    >
      {direction === "prev" ? <ChevronLeft size="xl" /> : <ChevronRight size="xl" />}
    </Button>
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn("relative w-full h-full overflow-hidden", className)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {/* Slides Container */}
        <div
          className={cn(
            "relative w-full h-full",
            transition === "slide" && "flex",
            transition === "fade" && "relative"
          )}
          style={getContainerStyle()}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={cn(
                transition === "slide" && "w-full flex-shrink-0",
                transition === "fade" && "w-full h-full"
              )}
              style={getSlideStyle(index)}
              aria-hidden={index !== activeIndex}
            >
              {shouldRenderSlide(index) ? slide : null}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && totalSlides > 1 && (
          <>
            {renderArrowButton("prev", goPrev, !loop && activeIndex === 0)}
            {renderArrowButton("next", goNext, !loop && activeIndex === totalSlides - 1)}
          </>
        )}

        {/* Indicators */}
        {showIndicators && totalSlides > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full",
                  "motion-safe:transition-all motion-reduce:transition-none",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                  index === activeIndex ? "bg-brand w-6" : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </CarouselContext.Provider>
  );
}

export { Carousel };
