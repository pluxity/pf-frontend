import { useState, useCallback } from "react";
import { cn } from "../../utils";
import { Checkbox } from "../../atoms/Checkbox";
import type { CheckboxGroupProps } from "./types";

const CheckboxGroup = ({
  options,
  value,
  defaultValue = [],
  onChange,
  label,
  orientation = "vertical",
  className,
  disabled,
}: CheckboxGroupProps) => {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const selectedValues = value ?? internalValue;

  const handleChange = useCallback(
    (optionValue: string, checked: boolean) => {
      const newValue = checked
        ? [...selectedValues, optionValue]
        : selectedValues.filter((v) => v !== optionValue);

      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [selectedValues, value, onChange]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-900">{label}</label>
      )}
      <div
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
        )}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                handleChange(option.value, checked === true)
              }
              disabled={disabled || option.disabled}
            />
            <label
              htmlFor={option.value}
              className={cn(
                "text-sm font-medium leading-none text-gray-700",
                (disabled || option.disabled) &&
                  "cursor-not-allowed opacity-70"
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

CheckboxGroup.displayName = "CheckboxGroup";

export { CheckboxGroup };
