import { useState, useEffect } from "react";
import { Clock, Activity, Map, MapPinOff } from "lucide-react";
import { formatTime } from "@/utils";

interface HeaderProps {
  showGlobe?: boolean;
  onToggleGlobe?: () => void;
}

export function Header({ showGlobe, onToggleGlobe }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-16 px-4 py-3 flex items-center justify-between">
        {/* 좌측: 로고 + 버전 */}
        <div className="w-96 flex items-center gap-2.5 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg pointer-events-auto">
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_2_7)">
              <path
                d="M17.6718 11.3076L7.25717 0.892883L6.91001 1.24004C4.03407 4.11598 4.03407 8.7788 6.91001 11.6547C9.78595 14.5307 14.4488 14.5307 17.3247 11.6547L17.6718 11.3076Z"
                fill="#FDDC5C"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.88855 0.261512C7.53986 -0.0871705 6.97453 -0.0871705 6.62586 0.261512L6.2787 0.608669C3.46656 3.4208 3.10685 7.75667 5.19952 10.9586L1.49433 18.9866C1.39226 19.2077 1.40993 19.4656 1.5412 19.6709C1.67249 19.876 1.89929 20.0001 2.14288 20.0001H12.1429C12.3569 20.0001 12.5596 19.9041 12.6953 19.7387C12.8309 19.5733 12.8853 19.3556 12.8433 19.1457L11.9547 14.703C14.1218 14.7454 16.3024 13.9398 17.9562 12.2861L18.3033 11.9389C18.4707 11.7715 18.5647 11.5444 18.5647 11.3076C18.5647 11.0708 18.4707 10.8437 18.3033 10.6762L13.7306 6.10356L16.3456 3.48849C16.6943 3.1398 16.6943 2.57449 16.3456 2.2258C15.997 1.87711 15.4316 1.87711 15.083 2.2258L12.4679 4.84086L7.88855 0.261512ZM7.54139 11.0234C5.10958 8.59156 5.01773 4.70586 7.26588 2.16423L16.4006 11.2989C13.8589 13.547 9.9732 13.4552 7.54139 11.0234Z"
                fill="#0057FF"
              />
            </g>
            <defs>
              <clipPath id="clip0_2_7">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-base font-bold text-[#0057FF]">ISR</span>
          <span className="text-sm text-gray-500">v2.23</span>
        </div>

        {/* 우측: 시간 표시 + 지형 토글 */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 bg-[#2B2F36]/10 backdrop-brightness-60 rounded-xl px-4 py-2 shadow-lg pointer-events-auto h-10">
            <span className="text-xs text-white/90">
              {currentTime.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <div className="h-3 w-px bg-white/20" />
            <Clock className="h-3 w-3 text-white/70" />
            <span className="text-xs text-white/90 font-mono">{formatTime(currentTime)}</span>
            <div className="h-3 w-px bg-white/20" />
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <Activity className="h-3.5 w-3.5 text-green-400" />
            </button>
            {onToggleGlobe && (
              <>
                <div className="h-3 w-px bg-white/20" />
                <button
                  onClick={onToggleGlobe}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title={showGlobe ? "지형 숨기기" : "지형 표시"}
                >
                  {showGlobe ? (
                    <Map className="h-3.5 w-3.5 text-cyan-400" />
                  ) : (
                    <MapPinOff className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
