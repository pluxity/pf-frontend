export function AIPlaygroundLink() {
  return (
    <a
      href="https://playground.pluxity.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="AI Agent 관제시스템 베타 체험하기"
      className="group relative flex items-center h-8"
    >
      {/* 메인 필 - 점선 보더 */}
      <div
        className="flex items-center gap-1.5 h-full px-2.5
                   rounded-full border border-dashed border-violet-400/70
                   bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-orange-500/10
                   group-hover:border-violet-500 group-hover:from-violet-500/20 group-hover:via-fuchsia-500/20 group-hover:to-orange-500/20
                   transition-all"
      >
        {/* 플라스크 아이콘 */}
        <svg
          className="w-3.5 h-3.5 text-violet-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
          <path d="M8.5 2h7" />
          <path d="M7 16h10" />
        </svg>
        <span className="text-xs font-semibold text-neutral-800 whitespace-nowrap">
          AI Agent 관제시스템
        </span>
        {/* 외부 링크 아이콘 */}
        <svg
          className="w-3 h-3 text-neutral-500 group-hover:text-violet-600 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17L17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </div>

      {/* BETA 마이크로 배지 - 우상단 노치 */}
      <span
        className="absolute -top-1 -right-1 px-1 py-px rounded-sm
                   bg-amber-400 text-neutral-900
                   text-[7px] font-bold tracking-wider leading-none
                   shadow-sm
                   animate-pulse group-hover:animate-none"
      >
        BETA
      </span>
    </a>
  );
}
