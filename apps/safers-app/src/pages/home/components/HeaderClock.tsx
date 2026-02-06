import { useState, useEffect } from "react";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dayName = DAY_NAMES[date.getDay()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}(${dayName}) ${hours}:${minutes}:${seconds}`;
}

export function HeaderClock() {
  const [time, setTime] = useState(() => formatDateTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatDateTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div className="text-sm font-medium text-neutral-600">{time}</div>;
}
