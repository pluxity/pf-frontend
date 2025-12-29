import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Children,
  type ComponentRef,
  type Ref,
  type KeyboardEvent,
} from "react";
import { cn } from "../../utils";
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
  className,
  ref,
  ...props
}: CarouselRootProps) {
  const isControlled = controlledIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = isControlled ? controlledIndex : internalIndex;

  const slides = Children.toArray(children);
  const totalSlides = slides.length;

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
    (event: KeyboardEvent<HTMLDivElement>) => {
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

  useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;

    const interval = setInterval(() => {
      goNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goNext, totalSlides]);

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
        return {
          position: isActive ? ("relative" as const) : ("absolute" as const),
          inset: isActive ? undefined : 0,
          opacity: isActive ? 1 : 0,
          transition: `opacity ${transitionDuration}ms ease-in-out`,
          pointerEvents: isActive ? ("auto" as const) : ("none" as const),
        };
      }

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
              <ChevronLeft size="lg" />
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
              <ChevronRight size="lg" />
            </button>
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
