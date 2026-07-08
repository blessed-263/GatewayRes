import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Package,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { useRepairs } from "@/context/RepairsContext";
import { getDepartmentInfo, getTeamProfileBySlug } from "@/data/teamProfiles";
import { workersInPool } from "@/lib/complaintAssignment";
import { complaintLabelForCategory, complaintTypeOptions } from "@/lib/complaintTypes";
import { categoryBarClass } from "@/lib/categoryVisuals";
import {
  activeTasksForWorker,
  analyticsForWorker,
  recentHistoryForWorker,
} from "@/lib/workerAnalytics";
import { isRepairOverdue } from "@/lib/taskFilters";
import { statusLabels } from "@/lib/repairLabels";
import { cn, formatDate } from "@/lib/utils";
import type { Repair } from "@/types/repair";

export function TeamMemberPage() {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const { repairs } = useRepairs();

  const member = memberSlug ? getTeamProfileBySlug(memberSlug) : undefined;
  if (!member) return <Navigate to="/team" replace />;

  const department = getDepartmentInfo(member.department);
  const analytics = analyticsForWorker(repairs, member.name);
  const allocatedTasks = activeTasksForWorker(repairs, member.name);
  const historyTasks = recentHistoryForWorker(repairs, member.name);
  const assignmentPools = useMemo(
    () =>
      complaintTypeOptions
        .map((pool) => pool.value)
        .filter((category) => workersInPool(category).includes(member.name)),
    [member.name]
  );

  const assignedByType = useMemo(() => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sortTasks = (tasks: Repair[]) =>
      [...tasks].sort((a, b) => {
        const p = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (p !== 0) return p;
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      });

    return complaintTypeOptions
      .map(({ label, value }) => ({
        category: value,
        label,
        tasks: sortTasks(allocatedTasks.filter((task) => task.category === value)),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [allocatedTasks]);

  return (
    <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
              {department?.label ?? "Team member"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{member.name}</h1>
            <p className="mt-2 text-lg font-medium text-white/95">{member.role}</p>
            <p className="mt-1 text-base text-white/85">{member.workType}</p>
            <p className="mt-4 text-sm text-white/75">
              Joined {format(parseISO(member.joinedAt), "d MMM yyyy")} ·{" "}
              {member.buildings.join(" · ")}
            </p>
          </div>
          <Link
            to="/team"
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            ← Back to team
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {member.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white"
            >
              {skill}
            </span>
          ))}
        </div>
        {assignmentPools.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {assignmentPools.map((pool) => (
              <span
                key={pool}
                className="rounded-full border border-white/20 bg-black/15 px-3 py-1 text-xs font-semibold text-white/95"
              >
                {complaintLabelForCategory(pool)} pool
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Active assignments"
            value={analytics.assignedActive}
            subtitle="Currently allocated"
            icon={ClipboardList}
            color="primary"
          />
          <StatCard
            title="Completed"
            value={analytics.completedClosedBy}
            subtitle="Closed by this worker"
            icon={CheckCircle2}
            color="success"
            delay={0.05}
          />
          <StatCard
            title="Past due"
            value={analytics.overdue}
            subtitle="Overdue on their queue"
            icon={Clock}
            color={analytics.overdue > 0 ? "danger" : "success"}
            delay={0.1}
          />
          <StatCard
            title="Awaiting stock"
            value={analytics.awaitingParts}
            subtitle="Waiting on parts"
            icon={Package}
            color="warning"
            delay={0.15}
          />
        </section>

        {analytics.byCategory.length > 0 && (
          <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Job analytics by type</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Maintenance job types handled by {member.name}
            </p>
            <ul className="mt-5 space-y-3">
              {analytics.byCategory.map((row) => (
                <li key={row.category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        categoryBarClass[row.category] ?? categoryBarClass.other
                      )}
                      style={{
                        width: `${(row.count / analytics.totalHandled) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Pending" value={analytics.pending} />
              <MiniStat label="In progress" value={analytics.inProgress} />
              <MiniStat label="Total handled" value={analytics.totalHandled} />
            </div>
          </section>
        )}

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Assigned maintenance jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {allocatedTasks.length} open assignment
                {allocatedTasks.length === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              to={`/tasks?worker=${encodeURIComponent(member.name)}&filter=assigned`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View maintenance jobs →
            </Link>
          </div>
          {allocatedTasks.length === 0 ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5 shrink-0" />
              No currently assigned maintenance jobs.
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {assignedByType.map((group) => (
                <div key={group.category}>
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-1 rounded-full",
                        categoryBarClass[group.category] ?? categoryBarClass.other
                      )}
                    />
                    <div>
                      <h3 className="text-base font-semibold">{group.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.tasks.length} open job{group.tasks.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {group.tasks.map((repair) => (
                      <TaskThumbnailCard
                        key={repair.id}
                        repair={repair}
                        to={`/tasks/${repair.id}`}
                        hideImages
                        footer={
                          isRepairOverdue(repair)
                            ? "Past due"
                            : `${repair.building} · ${repair.unit}`
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Recent job history</h2>
          {historyTasks.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No maintenance job history yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {historyTasks.map((repair) => (
                <TaskThumbnailCard
                  key={repair.id}
                  repair={repair}
                  to={`/tasks/${repair.id}`}
                  hideImages
                  compact
                  footer={`${statusLabels[repair.status]} · ${formatDate(repair.reportedAt)}`}
                />
              ))}
            </div>
          )}
        </section>
      </main>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
