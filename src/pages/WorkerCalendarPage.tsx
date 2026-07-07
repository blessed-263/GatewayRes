import { useMemo, useState } from "react";
import {
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  subMonths,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import { repairsForUser } from "@/lib/repairAccess";
import { statusLabels } from "@/lib/repairLabels";
import {
  calendarStatusFilters,
  countsForMonth,
  futureJobCount,
  jobsForDate,
  monthGridDays,
  todayKey,
  type CalendarStatusFilter,
} from "@/lib/workerCalendar";
import { cn } from "@/lib/utils";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WorkerCalendarPage() {
  const { user } = useAuth();
  const { repairs: allRepairs } = useRepairs();
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [statusFilter, setStatusFilter] = useState<CalendarStatusFilter>("all");

  const myJobs = useMemo(
    () => (user ? repairsForUser(allRepairs, user) : []),
    [allRepairs, user]
  );

  const monthCounts = useMemo(
    () => countsForMonth(myJobs, viewMonth, statusFilter),
    [myJobs, viewMonth, statusFilter]
  );

  const days = useMemo(() => monthGridDays(viewMonth), [viewMonth]);
  const leadingPad = days.length > 0 ? days[0].getDay() : 0;
  const maxCount = Math.max(1, ...Object.values(monthCounts));

  const selectedJobs = useMemo(
    () => jobsForDate(myJobs, selectedDate, statusFilter),
    [myJobs, selectedDate, statusFilter]
  );

  const upcomingCount = useMemo(
    () => futureJobCount(myJobs, statusFilter),
    [myJobs, statusFilter]
  );

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const today = new Date();
  const selectedLabel = format(parseISO(selectedDate), "EEEE, d MMMM yyyy");

  return (
    <div className="flex flex-1 flex-col space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
              Calendar
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Hi, {firstName}</h1>
            <p className="mt-2 text-sm text-white/80">
              Pick a date to see scheduled jobs. {upcomingCount} upcoming from today.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {calendarStatusFilters.map((filter) => {
          const active = statusFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {format(viewMonth, "MMMM yyyy")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tap a day to view scheduled work
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-xl px-3 text-sm"
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
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
                    "group relative flex min-h-[3.25rem] flex-col items-center justify-start rounded-xl border px-1 py-2 transition-all sm:min-h-[4.5rem] sm:px-2 sm:py-3",
                    inMonth ? "bg-background" : "bg-muted/20 opacity-60",
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
                        <span className="text-[10px] font-semibold text-primary sm:text-xs">
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

      <section className="rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{selectedLabel}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {selectedJobs.length === 0
                ? "No jobs scheduled for this day"
                : `${selectedJobs.length} job${selectedJobs.length === 1 ? "" : "s"} scheduled`}
            </p>
          </div>
          {statusFilter !== "all" && (
            <Badge variant="secondary">{statusLabels[statusFilter]}</Badge>
          )}
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          {selectedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Nothing on this date</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try another day or change the status filter to see more scheduled work.
              </p>
              <Button asChild variant="outline" className="mt-5 rounded-xl">
                <Link to="/my-jobs">View all my jobs</Link>
              </Button>
            </div>
          ) : (
            selectedJobs.map((job) => (
              <TaskThumbnailCard
                key={job.id}
                repair={job}
                to={`/my-jobs/${job.id}`}
                hideImages
                footer={`${job.building} · ${job.unit}`}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
