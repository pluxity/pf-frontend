import { useState, useCallback, type KeyboardEvent, type Ref } from "react";
import { Search, X, Loader } from "../../atoms/Icon";
import { cn } from "../../utils";
import type { IconSize } from "../../atoms/Icon";
import { searchBarVariants } from "./variants";
import type { SearchBarProps } from "./types";

interface SearchBarPropsWithRef extends SearchBarProps {
  ref?: Ref<HTMLInputElement>;
}

function SearchBar({
  className,
  size,
  onSearch,
  onClear,
  loading,
  value,
  onChange,
  placeholder = "Search...",
  ref,
  ...props
}: SearchBarPropsWithRef) {
    const [internalValue, setInternalValue] = useState("");
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (value === undefined) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);
      },
      [value, onChange]
    );

    const handleClear = useCallback(() => {
      if (value === undefined) {
        setInternalValue("");
      }
      onClear?.();
    }, [value, onClear]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSearch) {
          onSearch(currentValue as string);
        }
        if (e.key === "Escape") {
          handleClear();
        }
      },
      [currentValue, onSearch, handleClear]
    );

    const iconSize: IconSize = size === "sm" ? "xs" : size === "lg" ? "md" : "sm";

    return (
      <div className={cn(searchBarVariants({ size }), className)}>
        {loading ? (
          <Loader size={iconSize} className="text-gray-400" />
        ) : (
          <Search size={iconSize} className="text-gray-400" />
        )}
        <input
          ref={ref}
          type="text"
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
          {...props}
        />
        {currentValue && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={iconSize} />
          </button>
        )}
      </div>
    );
}

export { SearchBar };
