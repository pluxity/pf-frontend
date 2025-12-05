import { useState, type Ref } from "react";
import { Clock, ChevronUp, ChevronDown } from "../../atoms/Icon";
import { cn } from "../../utils";
import { Input } from "../../atoms/Input";
import { Button } from "../../atoms/Button";

export interface TimePickerProps {
  value?: string; // "HH:MM" format (24h) or "HH:MM AM/PM" (12h)
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  use12Hour?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  use12Hour = true,
  className,
  ref,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { hour: 9, minute: 0, period: "AM" };

    if (use12Hour) {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match && match[1] && match[2] && match[3]) {
        return {
          hour: parseInt(match[1]),
          minute: parseInt(match[2]),
          period: match[3].toUpperCase(),
        };
      }
    } else {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (match && match[1] && match[2]) {
        const hour = parseInt(match[1]);
        return {
          hour: hour > 12 ? hour - 12 : hour === 0 ? 12 : hour,
          minute: parseInt(match[2]),
          period: hour >= 12 ? "PM" : "AM",
        };
      }
    }
    return { hour: 9, minute: 0, period: "AM" };
  };

  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(parsed.period as "AM" | "PM");

  const formatTime = () => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    if (use12Hour) {
      return `${h}:${m} ${period}`;
    }
    const hour24 = period === "PM" ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;
    return `${hour24.toString().padStart(2, "0")}:${m}`;
  };

  const handleConfirm = () => {
    onChange?.(formatTime());
    setIsOpen(false);
  };

  const incrementHour = () => setHour((h) => (h >= 12 ? 1 : h + 1));
  const decrementHour = () => setHour((h) => (h <= 1 ? 12 : h - 1));
  const incrementMinute = () => setMinute((m) => (m >= 59 ? 0 : m + 1));
  const decrementMinute = () => setMinute((m) => (m <= 0 ? 59 : m - 1));
  const togglePeriod = () => setPeriod((p) => (p === "AM" ? "PM" : "AM"));

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative">
        <Input
          value={value || ""}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="cursor-pointer pr-10"
        />
        <Clock size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808088]" />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-[#E6E6E8] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs text-[#808088]">Hour</span>
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={incrementHour} className="h-8 w-8 p-0">
                  <ChevronUp size="sm" />
                </Button>
                <div className="flex h-10 w-12 items-center justify-center rounded-md border border-[#E6E6E8] text-lg font-bold text-[#333340]">
                  {hour.toString().padStart(2, "0")}
                </div>
                <Button variant="ghost" size="sm" onClick={decrementHour} className="h-8 w-8 p-0">
                  <ChevronDown size="sm" />
                </Button>
              </div>
            </div>

            <span className="mt-6 text-xl font-bold text-[#333340]">:</span>

            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs text-[#808088]">Min</span>
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={incrementMinute} className="h-8 w-8 p-0">
                  <ChevronUp size="sm" />
                </Button>
                <div className="flex h-10 w-12 items-center justify-center rounded-md border border-[#E6E6E8] text-lg font-bold text-[#333340]">
                  {minute.toString().padStart(2, "0")}
                </div>
                <Button variant="ghost" size="sm" onClick={decrementMinute} className="h-8 w-8 p-0">
                  <ChevronDown size="sm" />
                </Button>
              </div>
            </div>

            {use12Hour && (
              <div className="flex flex-col items-center">
                <span className="mb-2 text-xs text-[#808088]">AM/PM</span>
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" onClick={togglePeriod} className="h-8 w-8 p-0">
                    <ChevronUp size="sm" />
                  </Button>
                  <div className="flex h-10 w-12 items-center justify-center rounded-md border border-[#E6E6E8] text-lg font-bold text-[#333340]">
                    {period}
                  </div>
                  <Button variant="ghost" size="sm" onClick={togglePeriod} className="h-8 w-8 p-0">
                    <ChevronDown size="sm" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleConfirm} className="mt-4 w-full">
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}

export { TimePicker };
