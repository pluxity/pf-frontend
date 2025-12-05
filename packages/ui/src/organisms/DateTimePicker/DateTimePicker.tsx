import { useState, useMemo, type Ref } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Calendar,
  Clock,
} from "../../atoms/Icon";
import { cn } from "../../utils";
import { Button } from "../../atoms/Button";

export interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  use12Hour?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  disabled = false,
  use12Hour = true,
  minDate,
  maxDate,
  className,
  ref,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value?.getMonth() ?? new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(value?.getFullYear() ?? new Date().getFullYear());

  const getInitialHour = () => {
    if (!value) return 9;
    const h = value.getHours();
    if (use12Hour) {
      return h === 0 ? 12 : h > 12 ? h - 12 : h;
    }
    return h;
  };

  const [selectedDate, setSelectedDate] = useState<number | null>(value?.getDate() ?? null);
  const [hour, setHour] = useState(getInitialHour());
  const [minute, setMinute] = useState(value?.getMinutes() ?? 0);
  const [period, setPeriod] = useState<"AM" | "PM">(
    value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM"
  );

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentMonth, currentYear]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentMonth, currentYear]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    setSelectedDate(day);
  };

  const incrementHour = () => setHour((h) => (h >= 12 ? 1 : h + 1));
  const decrementHour = () => setHour((h) => (h <= 1 ? 12 : h - 1));
  const incrementMinute = () => setMinute((m) => (m >= 59 ? 0 : m + 1));
  const decrementMinute = () => setMinute((m) => (m <= 0 ? 59 : m - 1));
  const togglePeriod = () => setPeriod((p) => (p === "AM" ? "PM" : "AM"));

  const handleConfirm = () => {
    if (selectedDate === null) return;

    let finalHour = hour;
    if (use12Hour) {
      if (period === "PM" && hour !== 12) {
        finalHour = hour + 12;
      } else if (period === "AM" && hour === 12) {
        finalHour = 0;
      }
    }

    const newDate = new Date(currentYear, currentMonth, selectedDate, finalHour, minute);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const formatDateTime = (date: Date) => {
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    if (use12Hour) {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
    }
    return `${month} ${day}, ${year} ${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-[#E6E6E8] bg-white px-3 text-sm",
          "hover:border-[#CCCCCC] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
          disabled && "cursor-not-allowed bg-[#F5F5F5] opacity-50",
          !value && "text-[#808088]"
        )}
      >
        <span>{value ? formatDateTime(value) : placeholder}</span>
        <div className="flex items-center gap-2 text-[#808088]">
          <Calendar size="sm" />
          <Clock size="sm" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[400px] overflow-hidden rounded-xl border border-[#E6E6E8] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <div className="bg-[#FAFAFC] px-6 py-4">
            <h3 className="text-base font-bold text-[#1A1A26]">Select Date & Time</h3>
          </div>

          <div className="h-px bg-[#EAEAEC]" />

          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
                <ChevronLeft size="sm" className="text-[#808088]" />
              </Button>
              <span className="text-[15px] font-bold text-[#1A1A26]">
                {MONTHS[currentMonth]} {currentYear}
              </span>
              <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                <ChevronRight size="sm" className="text-[#808088]" />
              </Button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {DAYS.map((day) => (
                <div key={day} className="py-1 text-center text-xs font-bold text-[#808088]">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDate === day;
                const isDisabled = isDateDisabled(day);
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentMonth &&
                  new Date().getFullYear() === currentYear;

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                      isSelected
                        ? "bg-brand font-bold text-white"
                        : isToday
                          ? "border border-brand text-brand"
                          : "text-[#333340] hover:bg-[#F5F5F5]",
                      isDisabled && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-[#EAEAEC]" />

          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock size="sm" className="text-[#808088]" />
              <span className="text-sm font-bold text-[#333340]">Time</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={incrementHour} className="h-7 w-7 p-0">
                  <ChevronUp size="sm" />
                </Button>
                <div className="flex h-10 w-12 items-center justify-center rounded-md border border-[#E6E6E8] text-lg font-bold text-[#333340]">
                  {hour.toString().padStart(2, "0")}
                </div>
                <Button variant="ghost" size="sm" onClick={decrementHour} className="h-7 w-7 p-0">
                  <ChevronDown size="sm" />
                </Button>
              </div>

              <span className="text-xl font-bold text-[#333340]">:</span>

              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={incrementMinute} className="h-7 w-7 p-0">
                  <ChevronUp size="sm" />
                </Button>
                <div className="flex h-10 w-12 items-center justify-center rounded-md border border-[#E6E6E8] text-lg font-bold text-[#333340]">
                  {minute.toString().padStart(2, "0")}
                </div>
                <Button variant="ghost" size="sm" onClick={decrementMinute} className="h-7 w-7 p-0">
                  <ChevronDown size="sm" />
                </Button>
              </div>

              {use12Hour && (
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" onClick={togglePeriod} className="h-7 w-7 p-0">
                    <ChevronUp size="sm" />
                  </Button>
                  <div className="flex h-10 w-12 items-center justify-center rounded-md border border-[#E6E6E8] text-lg font-bold text-[#333340]">
                    {period}
                  </div>
                  <Button variant="ghost" size="sm" onClick={togglePeriod} className="h-7 w-7 p-0">
                    <ChevronDown size="sm" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#E6E6E8] p-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirm} disabled={selectedDate === null}>
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DateTimePicker };
