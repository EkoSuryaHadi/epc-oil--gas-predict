"use client";
import React from "react";

export type GanttTask = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress?: number; // 0-100
  group?: string;
};

function daysBetween(a: Date, b: Date) {
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

export function GanttChart({ tasks }: { tasks: GanttTask[] }) {
  if (!tasks.length) return null;
  const minStart = tasks.reduce((min, t) => (t.start < min ? t.start : min), tasks[0].start);
  const maxEnd = tasks.reduce((max, t) => (t.end > max ? t.end : max), tasks[0].end);
  const totalDays = daysBetween(minStart, maxEnd);

  return (
    <div className="w-full border rounded-xl overflow-hidden">
      <div className="grid grid-cols-[220px_1fr] text-xs">
        <div className="bg-muted px-3 py-2 font-medium">Task</div>
        <div className="bg-muted px-3 py-2 font-medium">Timeline</div>
      </div>
      <div>
        {tasks.map((t) => {
          const offsetDays = daysBetween(minStart, t.start) - 1;
          const durationDays = daysBetween(t.start, t.end);
          const left = (offsetDays / totalDays) * 100;
          const width = (durationDays / totalDays) * 100;
          return (
            <div key={t.id} className="grid grid-cols-[220px_1fr] items-center border-t">
              <div className="px-3 py-2">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-muted-foreground text-[11px]">
                  {t.start.toLocaleDateString()} - {t.end.toLocaleDateString()}
                </div>
              </div>
              <div className="relative h-10">
                <div className="absolute inset-0">
                  <div className="h-full bg-gradient-to-r from-transparent via-border/60 to-transparent bg-[length:40px_1px] bg-bottom bg-repeat-x" />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full"
                  style={{ left: `${left}%`, width: `${width}%`, background: "var(--chart-3)" }}
                  title={`${t.name}`}
                >
                  {typeof t.progress === "number" && (
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${Math.min(100, Math.max(0, t.progress))}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default GanttChart;