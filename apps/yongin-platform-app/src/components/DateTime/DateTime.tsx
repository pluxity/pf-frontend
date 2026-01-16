import { cn } from "@pf-dev/ui";
import { DateTimeProps } from "./types";
import { useEffect, useState } from "react";

const formatDate = (date: Date, format: string) => {
  return format
    .replace("YYYY", String(date.getFullYear()))
    .replace("MM", String(date.getMonth() + 1).padStart(2, "0"))
    .replace("DD", String(date.getDate()).padStart(2, "0"))
    .replace("HH", String(date.getHours()).padStart(2, "0"))
    .replace("mm", String(date.getMinutes()).padStart(2, "0"))
    .replace("ss", String(date.getSeconds()).padStart(2, "0"));
};

export function DateTime({ format = "YYYY년 MM월 DD일 HH:mm:ss", className }: DateTimeProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={cn("text-sm 4k:text-4xl", className)}>
      {formatDate(currentDateTime, format)}
    </span>
  );
}
