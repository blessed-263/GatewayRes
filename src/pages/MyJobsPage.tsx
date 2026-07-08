import { useMemo, useState } from "react";
import { Clock, Package, ClipboardList, ListTodo } from "lucide-react";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { WorkerProfileHero } from "@/components/dashboard/WorkerProfileHero";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import { repairsForUser } from "@/lib/repairAccess";
import {
  matchesWorkerFilter,
  type WorkerFilter,
} from "@/lib/taskFilters";
import { groupJobsByBuildingAndFloor } from "@/lib/workerJobGroups";
import { workerFilterAccents } from "@/lib/cardAccents";
import { cn } from "@/lib/utils";

const filters: { id: WorkerFilter; label: string; icon: typeof ListTodo }[] = [
  { id: "total", label: "Total jobs", icon: ListTodo },
  { id: "pending", label: "Pending", icon: ClipboardList },
  { id: "overdue", label: "Overdue", icon: Clock },
  { id: "awaiting_parts", label: "Awaiting parts", icon: Package },
];

export function MyJobsPage() {
  const { user } = useAuth();
  const { repairs } = useRepairs();
  const [activeFilter, setActiveFilter] = useState<WorkerFilter>("total");

  const myJobs = useMemo(
    () => (user ? repairsForUser(repairs, user) : []),
    [repairs, user]
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        filters.map((f) => [
          f.id,
          myJobs.filter((j) => matchesWorkerFilter(j, f.id)).length,
        ])
      ) as Record<WorkerFilter, number>,
    [myJobs]
  );

  const filtered = useMemo(
    () => myJobs.filter((j) => matchesWorkerFilter(j, activeFilter)),
    [myJobs, activeFilter]
  );

  const grouped = useMemo(() => groupJobsByBuildingAndFloor(filtered), [filtered]);
  const workerName = user?.assigneeName ?? user?.name ?? "";

  return (
    <div className="flex flex-1 flex-col space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <WorkerProfileHero workerName={workerName} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {filters.map((f) => {
          const Icon = f.icon;
          const active = activeFilter === f.id;
          const accent = workerFilterAccents[f.id];
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                active ? accent.active : accent.idle
              )}
            >
              <Icon className={cn("h-5 w-5", active ? accent.iconActive : accent.iconIdle)} />
              <p className="mt-3 text-2xl font-semibold tabular-nums">{counts[f.id]}</p>
              <p className={cn("mt-1 text-sm", active ? "text-white/85" : "text-muted-foreground")}>
                {f.label}
              </p>
            </button>
          );
        })}
      </section>

      <section className="space-y-8">
        {grouped.length === 0 ? (
          <p className="rounded-xl border border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
            No jobs in this filter.
          </p>
        ) : (
          grouped.map((buildingGroup) => (
            <div key={buildingGroup.building}>
              <h2 className="mb-4 text-lg font-semibold">{buildingGroup.building}</h2>
              <div className="space-y-6">
                {buildingGroup.floors.map((floorGroup) => (
                  <div key={`${buildingGroup.building}-${floorGroup.floor}`}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Floor {floorGroup.floor}
                    </h3>
                    <div className="space-y-3">
                      {floorGroup.jobs.map((job) => (
                        <TaskThumbnailCard
                          key={job.id}
                          repair={job}
                          to={`/my-jobs/${job.id}`}
                          hideImages
                          footer={job.unit}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
