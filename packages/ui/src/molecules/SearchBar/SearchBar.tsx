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
  ariaLabelClear = "Clear search",
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
        <Loader size={iconSize} className="text-placeholder dark:text-dark-text-placeholder" />
      ) : (
        <Search size={iconSize} className="text-placeholder dark:text-dark-text-placeholder" />
      )}
      <input
        ref={ref}
        type="text"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none placeholder:text-placeholder dark:text-dark-text-primary dark:placeholder:text-dark-text-placeholder"
        {...props}
      />
      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded p-0.5 text-placeholder hover:bg-neutral-100 hover:text-secondary dark:text-dark-text-placeholder dark:hover:bg-neutral-700 dark:hover:text-dark-text-secondary"
          aria-label={ariaLabelClear}
        >
          <X size={iconSize} />
        </button>
      )}
    </div>
  );
}

export { SearchBar };
