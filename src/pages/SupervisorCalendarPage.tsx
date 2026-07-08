import { useMemo, useState } from "react";
import {
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  subMonths,
} from "date-fns";
import { Link } from "react-router-dom";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  ListTodo,
} from "lucide-react";
import { RequestsByDayPanel } from "@/components/dashboard/RequestsByDayPanel";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRepairs } from "@/context/RepairsContext";
import { countScheduledCalendar } from "@/lib/dashboardMetrics";
import { isRepairOverdue } from "@/lib/taskFilters";
import {
  calendarViewModes,
  monthGridDays,
  reportedCountsForMonth,
  scheduledCountsForMonth,
  tasksForCalendarDate,
  todayKey,
  type CalendarViewMode,
} from "@/lib/supervisorCalendar";
import { cn } from "@/lib/utils";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SupervisorCalendarPage() {
  const { repairs } = useRepairs();
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("scheduled");

  const stats = useMemo(
    () => countScheduledCalendar(repairs, viewMonth),
    [repairs, viewMonth]
  );

  const monthCounts = useMemo(() => {
    return viewMode === "scheduled"
      ? scheduledCountsForMonth(repairs, viewMonth)
      : reportedCountsForMonth(repairs, viewMonth);
  }, [repairs, viewMonth, viewMode]);

  const days = useMemo(() => monthGridDays(viewMonth), [viewMonth]);
  const leadingPad = days.length > 0 ? days[0].getDay() : 0;
  const maxCount = Math.max(1, ...Object.values(monthCounts));
  const today = new Date();

  const selectedTasks = useMemo(
    () => tasksForCalendarDate(repairs, selectedDate, viewMode),
    [repairs, selectedDate, viewMode]
  );

  const selectedLabel = format(parseISO(selectedDate), "EEEE, d MMMM yyyy");
  const monthTotalInView = Object.values(monthCounts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="flex flex-1 flex-col space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="overflow-hidden rounded-[1.75rem] border border-primary/15 bg-primary text-primary-foreground">
        <div className="px-6 py-7 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                  Operations calendar
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {format(viewMonth, "MMMM yyyy")}
                </h1>
                <p className="mt-2 text-sm text-white/80">
                  Plan scheduled work and review when requests came in.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 rounded-xl border-0 bg-white/15 px-3 text-sm text-white hover:bg-white/25"
                onClick={() => {
                  const now = new Date();
                  setViewMonth(now);
                  setSelectedDate(todayKey());
                }}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroStat
              label="Today"
              value={stats.today}
              hint="Scheduled today"
              icon={Calendar}
              to={`/tasks?date=${todayKey()}`}
            />
            <HeroStat
              label="Month total"
              value={monthTotalInView}
              hint={
                viewMode === "scheduled"
                  ? `Scheduled in ${format(viewMonth, "MMMM")}`
                  : `Reported in ${format(viewMonth, "MMMM")}`
              }
              icon={ClipboardList}
              to="/tasks"
            />
            <HeroStat
              label="Open jobs"
              value={stats.openTasks}
              hint="Awaiting action"
              icon={ListTodo}
              to="/tasks"
            />
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {calendarViewModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setViewMode(mode.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              viewMode === mode.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold tracking-tight">
              {viewMode === "scheduled" ? "Scheduled workload" : "Incoming requests"}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tap a day to inspect maintenance jobs · darker cells mean more activity
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:gap-2 sm:text-xs">
              {weekdayLabels.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: leadingPad }).map((_, i) => (
                <div key={`pad-${i}`} aria-hidden />
              ))}
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const count = monthCounts[key] ?? 0;
                const isSelected = key === selectedDate;
                const isToday = isSameDay(day, today);
                const inMonth = isSameMonth(day, viewMonth);
                const intensity =
                  count <= 0
                    ? 0
                    : count / maxCount >= 0.66
                      ? 3
                      : count / maxCount >= 0.33
                        ? 2
                        : 1;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={cn(
                      "group relative flex min-h-[3.5rem] flex-col items-center justify-start rounded-xl border px-1 py-2 transition-all sm:min-h-[4.75rem] sm:px-2 sm:py-3",
                      inMonth ? "bg-background" : "bg-muted/20 opacity-50",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/30",
                      isToday && !isSelected && "border-primary/50"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums sm:text-base",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {count > 0 ? (
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-0.5">
                        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
                              intensity >= 3 && "bg-primary",
                              intensity === 2 && "bg-primary/70",
                              intensity === 1 && "bg-primary/40"
                            )}
                          />
                        ))}
                        {count > 3 && (
                          <span className="text-[10px] font-bold text-primary sm:text-xs">
                            +{count - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="mt-1 h-1.5 w-1.5 sm:h-2 sm:w-2" aria-hidden />
                    )}
                    {isToday && (
                      <span className="absolute right-1 top-1 text-[9px] font-bold uppercase text-primary sm:right-1.5 sm:top-1.5">
                        Now
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex flex-col rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{selectedLabel}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {selectedTasks.length === 0
                    ? "No maintenance jobs for this day"
                    : `${selectedTasks.length} job${selectedTasks.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <Badge variant="secondary">
                {viewMode === "scheduled" ? "Scheduled" : "Reported"}
              </Badge>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5 sm:max-h-[28rem] sm:p-6">
            {selectedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-14 text-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Nothing on this date</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Switch to {viewMode === "scheduled" ? "new requests" : "scheduled work"} or
                  pick another day.
                </p>
                <Button asChild variant="outline" className="mt-5 rounded-xl">
                  <Link to={`/tasks?date=${selectedDate}`}>Open in maintenance jobs</Link>
                </Button>
              </div>
            ) : (
              selectedTasks.map((task) => (
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
              ))
            )}
          </div>
        </section>
      </div>

      <RequestsByDayPanel
        id="requests-by-day"
        repairs={repairs}
        listMaxHeight="max-h-[36rem]"
      />
    </div>
  );
}

function HeroStat({
  label,
  value,
  hint,
  icon: Icon,
  to,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Calendar;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm transition-colors hover:bg-white/15"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-white/75">{hint}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-white/80" />
      </div>
    </Link>
  );
}
