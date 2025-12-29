import { useState, useEffect, useCallback, useMemo, type ComponentRef, type Ref } from "react";
import { cn } from "../../utils";
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
  className,
  ref,
  ...props
}: CarouselRootProps) {
  const isControlled = controlledIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = isControlled ? controlledIndex : internalIndex;

  const totalSlides = children.length;

  const setActiveIndex = useCallback(
    (index: number) => {
      if (!isControlled) {
        setInternalIndex(index);
      }
      onChange?.(index);
    },
    [isControlled, onChange]
  );

  const goTo = useCallback(
    (index: number) => {
      let nextIndex = index;
      if (loop) {
        nextIndex = ((index % totalSlides) + totalSlides) % totalSlides;
      } else {
        nextIndex = Math.max(0, Math.min(index, totalSlides - 1));
      }
      setActiveIndex(nextIndex);
    },
    [loop, totalSlides, setActiveIndex]
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext]
  );

  // Auto play
  useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;

    const interval = setInterval(() => {
      goNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goNext, totalSlides]);

  // 슬라이드 렌더링 여부 결정
  const shouldRenderSlide = useCallback(
    (index: number): boolean => {
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
    },
    [lazy, activeIndex, preloadAdjacent, totalSlides, loop]
  );

  const contextValue = useMemo<CarouselContextValue>(
    () => ({
      activeIndex,
      totalSlides,
      goTo,
      goNext,
      goPrev,
      transition,
      transitionDuration,
    }),
    [activeIndex, totalSlides, goTo, goNext, goPrev, transition, transitionDuration]
  );

  const getSlideStyle = useCallback(
    (index: number) => {
      const isActive = index === activeIndex;

      if (transition === "none") {
        return {
          display: isActive ? "block" : "none",
        };
      }

      if (transition === "fade") {
        // active 슬라이드는 relative로 두어 container 높이 유지
        // 나머지는 absolute로 겹침
        return {
          position: isActive ? ("relative" as const) : ("absolute" as const),
          inset: isActive ? undefined : 0,
          opacity: isActive ? 1 : 0,
          transition: `opacity ${transitionDuration}ms ease-in-out`,
          pointerEvents: isActive ? ("auto" as const) : ("none" as const),
        };
      }

      // slide transition - 개별 슬라이드는 스타일 없음 (container에서 처리)
      return {};
    },
    [activeIndex, transition, transitionDuration]
  );

  const getContainerStyle = useCallback(() => {
    if (transition === "slide") {
      return {
        transform: `translateX(-${activeIndex * 100}%)`,
        transition: `transform ${transitionDuration}ms ease-in-out`,
      };
    }
    return {};
  }, [activeIndex, transition, transitionDuration]);

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
          {children.map((child, index) => (
            <div
              key={index}
              className={cn(
                transition === "slide" && "w-full flex-shrink-0",
                transition === "fade" && "w-full h-full"
              )}
              style={getSlideStyle(index)}
              aria-hidden={index !== activeIndex}
            >
              {shouldRenderSlide(index) ? child : null}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={!loop && activeIndex === 0}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 z-10",
                "w-10 h-10 rounded-full bg-white/80 shadow-md",
                "flex items-center justify-center",
                "hover:bg-white transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              )}
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!loop && activeIndex === totalSlides - 1}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-10",
                "w-10 h-10 rounded-full bg-white/80 shadow-md",
                "flex items-center justify-center",
                "hover:bg-white transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              )}
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && totalSlides > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {children.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
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
