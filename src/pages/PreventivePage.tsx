import { format, parseISO } from "date-fns";
import { CalendarClock, Play, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useOperations, isPreventiveOverdue } from "@/context/OperationsContext";
import { categoryLabels } from "@/lib/repairLabels";
import { cn } from "@/lib/utils";

export function PreventivePage() {
  const { user } = useAuth();
  const {
    preventiveSchedules,
    generatePreventiveTask,
    completePreventiveSchedule,
  } = useOperations();

  const overdue = preventiveSchedules.filter((s) => s.active && isPreventiveOverdue(s));
  const dueSoon = preventiveSchedules.filter(
    (s) => s.active && !isPreventiveOverdue(s) && s.nextDue <= format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd")
  );

  async function handleGenerate(id: string) {
    await generatePreventiveTask(id, user?.name ?? "Supervisor");
    completePreventiveSchedule(id);
  }

  return (
    <>
      <PageHeader
        title="Preventive Maintenance"
        description="Recurring inspections and scheduled tasks that generate work orders automatically."
      />
      <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Active schedules"
            value={preventiveSchedules.filter((s) => s.active).length}
            subtitle="Recurring maintenance plans"
            icon={CalendarClock}
            color="primary"
          />
          <StatCard
            title="Overdue"
            value={overdue.length}
            subtitle="Need task generation"
            icon={Play}
            color={overdue.length > 0 ? "danger" : "success"}
          />
          <StatCard
            title="Due this week"
            value={dueSoon.length}
            subtitle="Upcoming inspections"
            icon={CheckCircle2}
            color="warning"
          />
        </section>

        <section className="space-y-4">
          {preventiveSchedules.map((schedule) => {
            const overdueFlag = schedule.active && isPreventiveOverdue(schedule);
            return (
              <article
                key={schedule.id}
                className={cn(
                  "rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6",
                  overdueFlag && "border-red-300/60 bg-red-50/30 dark:bg-red-950/10"
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{schedule.name}</h2>
                      <Badge variant="outline">{schedule.frequency}</Badge>
                      {overdueFlag ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="secondary">On track</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {schedule.building}
                      {schedule.unit ? ` · ${schedule.unit}` : ""} ·{" "}
                      {categoryLabels[schedule.category]}
                    </p>
                    <p className="mt-1 text-sm">
                      Next due:{" "}
                      <span className="font-semibold">
                        {format(parseISO(schedule.nextDue), "dd MMM yyyy")}
                      </span>
                      {schedule.assignee ? ` · ${schedule.assignee}` : ""}
                    </p>
                    {schedule.lastCompletedAt ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last completed {format(parseISO(schedule.lastCompletedAt), "dd MMM yyyy")}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    className="rounded-xl"
                    onClick={() => handleGenerate(schedule.id)}
                    disabled={!schedule.active}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Generate task
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}
