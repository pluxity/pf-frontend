import { useRef, useEffect, useState, useMemo } from "react";
import { Play, Pause } from "@pf-dev/ui/atoms";
import { useTimelapseStore } from "./timelapse.store";
import type { PlaybackSpeed, ConstructionSchedule, SchedulePeriod } from "./types";

const SPEEDS: PlaybackSpeed[] = [1, 2, 4, 8];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function findCurrentPeriod(
  schedule: ConstructionSchedule,
  currentDate: Date
): SchedulePeriod | null {
  for (let i = schedule.periods.length - 1; i >= 0; i--) {
    const p = schedule.periods[i]!;
    if (new Date(p.startDate) <= currentDate) return p;
  }
  return null;
}

function generateTicks(startDate: Date, endDate: Date) {
  const ticks: { date: Date; label: string; major: boolean }[] = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (cursor <= endDate) {
    const isJan = cursor.getMonth() === 0;
    const isQuarter = cursor.getMonth() % 3 === 0;
    ticks.push({
      date: new Date(cursor),
      label: isJan ? `${cursor.getFullYear()}` : `${cursor.getMonth() + 1}월`,
      major: isJan || isQuarter,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return ticks;
}

export function TimelapseTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const schedule = useTimelapseStore((s) => s.schedule);
  const currentDate = useTimelapseStore((s) => s.currentDate);
  const isPlaying = useTimelapseStore((s) => s.isPlaying);
  const playbackSpeed = useTimelapseStore((s) => s.playbackSpeed);
  const { play, pause, setDate, setSpeed } = useTimelapseStore();

  const [isDragging, setIsDragging] = useState(false);

  const projectStart = useMemo(
    () => (schedule ? new Date(schedule.project.startDate) : new Date()),
    [schedule]
  );
  const projectEnd = useMemo(
    () => (schedule ? new Date(schedule.project.endDate) : new Date()),
    [schedule]
  );
  const totalMs = projectEnd.getTime() - projectStart.getTime();

  const ticks = useMemo(() => generateTicks(projectStart, projectEnd), [projectStart, projectEnd]);

  function dateToPercent(date: Date): number {
    const elapsed = date.getTime() - projectStart.getTime();
    return Math.max(0, Math.min(100, (elapsed / totalMs) * 100));
  }

  function percentToDate(percent: number): Date {
    const ms = (percent / 100) * totalMs;
    return new Date(projectStart.getTime() + ms);
  }

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      return;
    }

    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const {
        currentDate: current,
        playbackSpeed: speed,
        schedule: sched,
      } = useTimelapseStore.getState();
      if (!sched) return;
      const end = new Date(sched.project.endDate);

      const msPerFrame = (delta / 100) * speed * 86400000;
      const next = new Date(current.getTime() + msPerFrame);

      if (next >= end) {
        setDate(end);
        pause();
        return;
      }
      setDate(next);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, setDate, pause]);

  function pxToPercent(clientX: number): number {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    setIsDragging(true);
    if (isPlaying) pause();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDate(percentToDate(pxToPercent(e.clientX)));
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    setDate(percentToDate(pxToPercent(e.clientX)));
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  const percent = dateToPercent(currentDate);

  return (
    <div className="flex flex-col gap-1.5 px-4 pb-3 pt-1">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (isPlaying) {
              pause();
            } else {
              if (schedule && currentDate >= new Date(schedule.project.endDate)) {
                setDate(new Date(schedule.project.startDate));
              }
              play();
            }
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-white/20 text-white transition-colors hover:bg-white/30"
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? <Pause size="xs" /> : <Play size="xs" />}
        </button>

        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                playbackSpeed === s
                  ? "bg-white text-[#ff7500]"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <span className="flex items-center gap-2 text-sm text-white">
          <span className="w-[5.5rem] font-semibold tabular-nums">{formatDate(currentDate)}</span>
          {schedule &&
            (() => {
              const period = findCurrentPeriod(schedule, currentDate);
              return period ? (
                <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium">
                  {period.week}주차
                </span>
              ) : null;
            })()}
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative h-8 cursor-pointer select-none rounded-md bg-white/15"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => isDragging && handlePointerUp()}
      >
        {ticks.map((tick) => {
          const pct = dateToPercent(tick.date);
          if (pct < 0 || pct > 100) return null;
          return (
            <div
              key={tick.date.toISOString()}
              className="absolute top-0"
              style={{ left: `${pct}%` }}
            >
              <div
                className={tick.major ? "h-8 bg-white/30" : "h-3 bg-white/15"}
                style={{ width: 1 }}
              />
            </div>
          );
        })}

        <div
          className="absolute left-0 top-0 h-full rounded-l-md bg-white/20"
          style={{ width: `${percent}%` }}
        />

        <div className="absolute top-0 h-full" style={{ left: `${percent}%` }}>
          <div className="h-full w-0.5 bg-white" />
          <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff7500]" />
        </div>
      </div>

      <div className="relative h-3.5">
        {ticks
          .filter((t) => t.major)
          .map((tick) => {
            const pct = dateToPercent(tick.date);
            if (pct < 0 || pct > 100) return null;
            return (
              <span
                key={tick.date.toISOString()}
                className="absolute -translate-x-1/2 text-[10px] font-medium text-white/70"
                style={{ left: `${pct}%` }}
              >
                {tick.label}
              </span>
            );
          })}
      </div>
    </div>
  );
}
