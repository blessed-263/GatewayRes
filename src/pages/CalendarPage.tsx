import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, PackageCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarHeatmap } from "@/components/dashboard/CalendarHeatmap";
import { ExportButtons } from "@/components/dashboard/ExportButtons";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import { formatZar } from "@/lib/budgetConfig";
import { repairsForUser } from "@/lib/repairAccess";
import { getRepairsForDay, todayKey } from "@/lib/export";

type CalendarMetric = "tasks" | "inventory" | "spend";

export function CalendarPage() {
  const { user } = useAuth();
  const { repairs: allRepairs } = useRepairs();
  const repairs = user ? repairsForUser(allRepairs, user) : allRepairs;
  const [metric, setMetric] = useState<CalendarMetric>("tasks");
  const [workerFilter, setWorkerFilter] = useState("all");
  const now = new Date();
  const days = eachDayOfInterval({
    start: startOfMonth(now),
    end: endOfMonth(now),
  });

  const workerOptions = useMemo(
    () =>
      Array.from(
        new Set(
          repairs
            .map((repair) => repair.assignedTo)
            .filter((assigned): assigned is string => Boolean(assigned))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [repairs]
  );

  const filteredRepairs = useMemo(
    () =>
      workerFilter === "all"
        ? repairs
        : repairs.filter((repair) => repair.assignedTo === workerFilter),
    [repairs, workerFilter]
  );

  const metricByDate = useMemo(() => {
    const values: Record<string, number> = {};
    const addValue = (dateKey: string, amount: number) => {
      values[dateKey] = (values[dateKey] ?? 0) + amount;
    };

    for (const repair of filteredRepairs) {
      if (repair.scheduledFor && !["cancelled"].includes(repair.status)) {
        if (metric === "tasks") {
          addValue(repair.scheduledFor, 1);
        }
        if (metric === "spend") {
          addValue(repair.scheduledFor, repair.actual_cost ?? repair.estimated_cost ?? 0);
        }
      }

      if (metric === "inventory") {
        for (const request of repair.partRequests ?? []) {
          if (!request.pickedAt || !request.pickedForDay) continue;
          const consumedDay = format(parseISO(request.pickedAt), "yyyy-MM-dd");
          addValue(consumedDay, request.allocatedQuantity ?? request.quantity);
        }
      }
    }

    return values;
  }, [filteredRepairs, metric]);

  const todayScheduled = getRepairsForDay(filteredRepairs, todayKey());
  const isWorker = user?.role === "worker";
  const dayBoardPath = isWorker ? "/my-jobs" : "/daily";
  const todayMetricValue = metricByDate[todayKey()] ?? 0;
  const monthMetricTotal = days.reduce(
    (sum, day) => sum + (metricByDate[format(day, "yyyy-MM-dd")] ?? 0),
    0
  );
  const openTaskCount = filteredRepairs.filter((repair) => repair.status === "open").length;

  const metricLabel =
    metric === "tasks" ? "Number of maintenance jobs" : metric === "inventory" ? "Inventory consumed" : "Money spent";
  const metricValueLabel =
    metric === "tasks" ? "maintenance jobs" : metric === "inventory" ? "units consumed" : "spent";
  const metricValueFormatter =
    metric === "spend" ? (value: number) => formatZar(value) : undefined;
  const formatMetricNumber = (value: number) =>
    metric === "spend" ? formatZar(value) : String(value);

  return (
    <>
      <PageHeader
        title="Calendar"
        description={`${format(now, "MMMM yyyy")} · filtered by worker and calendar metric`}
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportButtons repairs={filteredRepairs} dailyDate={todayKey()} />
            <Link
              to={dayBoardPath}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {isWorker ? "My jobs" : "Open daily board"}
            </Link>
          </div>
        }
      />
      <main className="flex-1 space-y-6 p-5 sm:p-8 lg:p-10">
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="font-heading text-xl">Calendar filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Worker
              </p>
              <Select value={workerFilter} onValueChange={setWorkerFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All workers</SelectItem>
                  {workerOptions.map((worker) => (
                    <SelectItem key={worker} value={worker}>
                      {worker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Metric
              </p>
              <Select value={metric} onValueChange={(value) => setMetric(value as CalendarMetric)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Number of maintenance jobs</SelectItem>
                  <SelectItem value="inventory">Inventory consumed</SelectItem>
                  <SelectItem value="spend">Money spent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Today
                </p>
                <p className="mt-2 text-3xl font-semibold">{formatMetricNumber(todayMetricValue)}</p>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Month total
                </p>
                <p className="mt-2 text-3xl font-semibold">{formatMetricNumber(monthMetricTotal)}</p>
              </div>
              {metric === "spend" ? (
                <DollarSign className="h-6 w-6 text-primary" />
              ) : (
                <PackageCheck className="h-6 w-6 text-primary" />
              )}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Open jobs
                </p>
                <p className="mt-2 text-3xl font-semibold">{openTaskCount}</p>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-border/60">
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-heading text-2xl">
                  {format(now, "MMMM yyyy")}
                </CardTitle>
                <p className="mt-1 text-base text-muted-foreground">
                  Heatmap by {metricLabel.toLowerCase()} {workerFilter === "all" ? "for all workers" : `for ${workerFilter}`}
                </p>
              </div>
              <Link
                to={dayBoardPath}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isWorker ? "My jobs" : "Open daily board"}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-7">
            <CalendarHeatmap
              days={days}
              counts={metricByDate}
              focusMonth={now}
              linkForDay={(key) => (isWorker ? "/my-jobs" : `/daily?date=${key}`)}
              valueLabel={metricValueLabel}
              valueFormatter={metricValueFormatter}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/70">
            <CardTitle className="font-heading text-2xl">
              Today&apos;s assignments ({todayScheduled.length})
            </CardTitle>
            <Link
              to={dayBoardPath}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {isWorker ? "View jobs →" : "Manage →"}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 p-5 sm:p-6">
            {todayScheduled.length === 0 ? (
              <p className="py-8 text-center text-base text-muted-foreground">
                Nothing scheduled for today.
              </p>
            ) : (
              todayScheduled.map((r) => (
                <TaskThumbnailCard
                  key={r.id}
                  repair={r}
                  to={isWorker ? `/my-jobs/${r.id}` : `/tasks/${r.id}`}
                  compact
                />
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
