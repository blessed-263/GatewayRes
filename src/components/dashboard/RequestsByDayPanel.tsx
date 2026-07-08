import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Download } from "lucide-react";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportRepairsIntervalCsv } from "@/lib/export";
import { isRepairOverdue } from "@/lib/taskFilters";
import {
  boundsForInterval,
  defaultCustomFrom,
  defaultCustomTo,
  groupRepairsByReportDay,
  intervalLabel,
  intervalPresets,
  repairsReportedInInterval,
  type IntervalPreset,
} from "@/lib/requestsInterval";
import { cn } from "@/lib/utils";
import type { Repair } from "@/types/repair";

interface RequestsByDayPanelProps {
  repairs: Repair[];
  className?: string;
  id?: string;
  defaultPreset?: IntervalPreset;
  listMaxHeight?: string;
  backgroundImage?: string;
  overlayClassName?: string;
}

export function RequestsByDayPanel({
  repairs,
  className,
  id,
  defaultPreset = "30",
  listMaxHeight,
  backgroundImage,
  overlayClassName,
}: RequestsByDayPanelProps) {
  const [preset, setPreset] = useState<IntervalPreset>(defaultPreset);
  const [customFrom, setCustomFrom] = useState(defaultCustomFrom(defaultPreset));
  const [customTo, setCustomTo] = useState(defaultCustomTo());

  const { start, end } = useMemo(
    () =>
      boundsForInterval(
        preset,
        preset === "custom" ? customFrom : undefined,
        preset === "custom" ? customTo : undefined
      ),
    [preset, customFrom, customTo]
  );

  const intervalRepairs = useMemo(
    () => repairsReportedInInterval(repairs, start, end),
    [repairs, start, end]
  );

  const grouped = useMemo(
    () => groupRepairsByReportDay(intervalRepairs),
    [intervalRepairs]
  );

  const fromKey = format(start, "yyyy-MM-dd");
  const toKey = format(end, "yyyy-MM-dd");

  function selectPreset(next: IntervalPreset) {
    setPreset(next);
    if (next !== "custom") return;
    setCustomFrom(defaultCustomFrom("30"));
    setCustomTo(defaultCustomTo());
  }

  return (
    <section
      id={id}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card to-card shadow-sm",
        className
      )}
    >
      {backgroundImage ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-white/94 via-white/92 to-white/95",
              overlayClassName
            )}
          />
        </div>
      ) : null}

      <div className="relative z-10 border-b border-border/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
              Daily demand
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">Requests by day</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {intervalLabel(preset, start, end)} · {intervalRepairs.length} request
              {intervalRepairs.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-primary/25 bg-white/80"
            disabled={intervalRepairs.length === 0}
            onClick={() => exportRepairsIntervalCsv(intervalRepairs, fromKey, toKey)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {intervalPresets.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPreset(item.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                preset === item.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border/70 bg-white text-muted-foreground hover:bg-muted/40"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-muted-foreground">From</span>
              <Input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-xl"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-muted-foreground">To</span>
              <Input
                type="date"
                value={customTo}
                min={customFrom}
                max={defaultCustomTo()}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-xl"
              />
            </label>
          </div>
        )}
      </div>

      <div
        className={cn(
          "relative z-10 space-y-6 overflow-y-auto p-5 sm:p-6",
          listMaxHeight ?? "max-h-[32rem]"
        )}
      >
        <div className="rounded-xl border border-primary/15 bg-primary/[0.03] px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground">
          Showing {intervalRepairs.length} maintenance job
          {intervalRepairs.length === 1 ? "" : "s"} for this range.
        </div>
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-14 text-center">
            <p className="text-sm font-medium">No maintenance jobs in this period</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try a wider interval or check that new kiosk submissions are coming through.
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div
              key={group.dateKey}
              className="rounded-2xl border border-border/70 bg-white/80 p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-border/60 px-1 pb-2">
                <h3 className="text-sm font-semibold text-slate-800">{group.label}</h3>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {group.tasks.length} job{group.tasks.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="space-y-2.5">
                {group.tasks.map((task) => (
                  <TaskThumbnailCard
                    key={task.id}
                    repair={task}
                    to={`/tasks/${task.id}`}
                    hideImages
                    compact
                    footer={
                      isRepairOverdue(task)
                        ? "Past due"
                        : task.assignedTo
                          ? `Assigned to ${task.assignedTo}`
                          : "Unassigned"
                    }
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
