import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useRepairs } from "@/context/RepairsContext";
import { complaintLabelForCategory, complaintTypeOptions } from "@/lib/complaintTypes";
import {
  isRepairOverdue,
  matchesSupervisorTaskFilter,
  parseSupervisorTaskFilter,
  supervisorTaskFilters,
  type SupervisorTaskFilter,
} from "@/lib/taskFilters";
import { cn } from "@/lib/utils";
import type { Repair, RepairCategory } from "@/types/repair";

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

function sortTasks(tasks: Repair[]) {
  return [...tasks].sort((a, b) => {
    const p = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (p !== 0) return p;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });
}

function buildTasksUrl(
  filter: SupervisorTaskFilter,
  params: URLSearchParams
): string {
  const next = new URLSearchParams(params);
  if (filter === "all") {
    next.delete("filter");
    next.delete("status");
  } else {
    next.set("filter", filter);
    next.delete("status");
  }
  const query = next.toString();
  return query ? `/tasks?${query}` : "/tasks";
}

export function TasksPage() {
  const { repairs } = useRepairs();
  const [params, setParams] = useSearchParams();
  const typeFilter = params.get("type") as RepairCategory | null;
  const workerFilter = params.get("worker");
  const dateFilter = params.get("date");
  const activeFilter = parseSupervisorTaskFilter(
    params.get("filter") ?? params.get("status")
  );

  const baseTasks = useMemo(
    () => repairs.filter((r) => r.status !== "cancelled"),
    [repairs]
  );

  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        supervisorTaskFilters.map((item) => [
          item.id,
          baseTasks.filter((task) => matchesSupervisorTaskFilter(task, item.id)).length,
        ])
      ) as Record<SupervisorTaskFilter, number>,
    [baseTasks]
  );

  const filtered = useMemo(() => {
    let list = baseTasks.filter((task) =>
      matchesSupervisorTaskFilter(task, activeFilter)
    );
    if (typeFilter) list = list.filter((r) => r.category === typeFilter);
    if (workerFilter) list = list.filter((r) => r.assignedTo === workerFilter);
    if (dateFilter) {
      list = list.filter(
        (r) =>
          r.scheduledFor === dateFilter || r.reportedAt.startsWith(dateFilter)
      );
    }
    return sortTasks(list);
  }, [baseTasks, activeFilter, typeFilter, workerFilter, dateFilter]);

  const grouped = useMemo(() => {
    if (typeFilter) {
      return [{ label: complaintLabelForCategory(typeFilter), tasks: filtered }];
    }
    return complaintTypeOptions.map(({ label, value }) => ({
      label,
      tasks: sortTasks(filtered.filter((r) => r.category === value)),
    }));
  }, [filtered, typeFilter]);

  const hasExtraFilters = Boolean(typeFilter || workerFilter || dateFilter);

  function setFilter(filter: SupervisorTaskFilter) {
    const next = new URLSearchParams(params);
    if (filter === "all") {
      next.delete("filter");
      next.delete("status");
    } else {
      next.set("filter", filter);
      next.delete("status");
    }
    setParams(next, { replace: true });
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Filter by assignment, status, and due date. Grouped by complaint type."
      />
      <main className="flex-1 space-y-6 p-5 sm:p-8 lg:p-10">
        <section className="flex gap-2 overflow-x-auto pb-1">
          {supervisorTaskFilters.map((item) => {
            const active = activeFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
                )}
              >
                {item.label}
                <span className={cn("ml-2 tabular-nums", active ? "text-white/85" : "")}>
                  {filterCounts[item.id]}
                </span>
              </button>
            );
          })}
        </section>

        {hasExtraFilters && (
          <p className="text-sm text-muted-foreground">
            Additional filters active.{" "}
            <Link to={buildTasksUrl(activeFilter, new URLSearchParams())} className="font-semibold text-primary hover:underline">
              Clear extra filters
            </Link>
            {" · "}
            <Link to="/tasks" className="font-semibold text-primary hover:underline">
              Clear all
            </Link>
          </p>
        )}

        {grouped.map((group) => (
          <section key={group.label}>
            <h2 className="mb-4 text-xl font-semibold">
              {group.label}{" "}
              <span className="text-base font-normal text-muted-foreground">
                ({group.tasks.length})
              </span>
            </h2>
            {group.tasks.length === 0 ? (
              <p className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                No tasks in this category.
              </p>
            ) : (
              <div className="space-y-3">
                {group.tasks.map((task) => (
                  <TaskThumbnailCard
                    key={task.id}
                    repair={task}
                    to={`/tasks/${task.id}`}
                    hideImages
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
            )}
          </section>
        ))}
      </main>
    </>
  );
}
