import { useState, type Ref } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "../../atoms/Icon";
import { cn } from "../../utils";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  minDate,
  maxDate,
  className,
  ref,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (date: Date) => {
    onChange?.(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    return date.toDateString() === value.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative">
        <Input
          value={value ? formatDate(value) : ""}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="cursor-pointer pr-10"
        />
        <Calendar size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808088]" />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[280px] rounded-lg border border-[#E6E6E8] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.10)]">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
              <ChevronLeft size="sm" />
            </Button>
            <span className="text-sm font-bold text-[#333340]">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
              <ChevronRight size="sm" />
            </Button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex h-8 items-center justify-center text-xs font-medium text-[#808088]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <div key={index} className="flex h-8 items-center justify-center">
                {date ? (
                  <button
                    type="button"
                    disabled={isDateDisabled(date)}
                    onClick={() => handleSelectDate(date)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                      isSelected(date)
                        ? "bg-brand font-bold text-white"
                        : isToday(date)
                          ? "border border-brand text-brand"
                          : "text-[#333340] hover:bg-[#F5F5F7]",
                      isDateDisabled(date) && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {date.getDate()}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { DatePicker };
